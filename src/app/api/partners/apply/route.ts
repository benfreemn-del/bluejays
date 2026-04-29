import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert } from "@/lib/alerts";
import { slugifyPartnerName, randomSuffix } from "@/lib/partners";

/**
 * POST /api/partners/apply
 *
 * Body: { name, email, phone?, payoutHandle?, promotionChannel?, knowsBen? }
 *
 * Creates a `partners` row with status='pending'. Ben approves manually
 * via /dashboard/partners. Generates a unique slug from the partner's
 * name; on collision appends a 4-char alphanumeric suffix.
 *
 * Rate-limited to 3 applications per IP per day so spam can't flood
 * the approval queue.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`partners-apply:${ip}`, 3, 24 * 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many applications. Try again tomorrow or email ben@bluejayportfolio.com." },
      { status: 429 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not available. Email ben@bluejayportfolio.com." },
      { status: 503 },
    );
  }

  let body: {
    name?: string;
    email?: string;
    phone?: string;
    payoutHandle?: string;
    promotionChannel?: string;
    knowsBen?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = (body.name || "").trim().slice(0, 80);
  const email = (body.email || "").trim().toLowerCase().slice(0, 200);
  const phone = (body.phone || "").trim().slice(0, 30) || null;
  const payoutHandle = (body.payoutHandle || "").trim().slice(0, 200) || null;
  const promotionChannel = (body.promotionChannel || "").trim().slice(0, 500) || null;
  const knowsBen = (body.knowsBen || "").trim().slice(0, 500);

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!email || !email.includes("@") || !email.includes(".")) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  // Check for existing email — same person re-applying just gets the
  // existing record back (don't create duplicates).
  const { data: existing } = await supabase
    .from("partners")
    .select("code, status")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({
      ok: true,
      alreadyExists: true,
      code: (existing as { code: string }).code,
      status: (existing as { status: string }).status,
    });
  }

  // Generate unique code
  const baseSlug = slugifyPartnerName(name);
  let code = baseSlug;
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data: clash } = await supabase
      .from("partners")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!clash) break;
    code = `${baseSlug}-${randomSuffix(4)}`;
  }

  // Combine knows-ben context into notes for Ben's approval review
  const notes = knowsBen ? `How they know Ben: ${knowsBen}` : null;

  const { error } = await supabase.from("partners").insert({
    code,
    name,
    email,
    phone,
    payout_handle: payoutHandle,
    promotion_channel: promotionChannel,
    notes,
    status: "pending",
  });

  if (error) {
    console.error("[partners/apply] insert failed:", error);
    // Temporary diagnostic — bubble the Supabase error so we can see
    // which column/RLS/constraint is rejecting. Revert to generic
    // message once partners table is verified working.
    return NextResponse.json(
      {
        error: "Couldn't save your application. Email ben@bluejayportfolio.com.",
        debug: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        },
      },
      { status: 500 },
    );
  }

  // Notify Ben — best-effort, don't fail the response if alert errors.
  try {
    await sendOwnerAlert(
      [
        `🤝 New BlueJays partner application — ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        payoutHandle ? `Payout: ${payoutHandle}` : null,
        promotionChannel ? `Where: ${promotionChannel}` : null,
        knowsBen ? `Knows Ben: ${knowsBen}` : null,
        `Approve: /dashboard/partners`,
        `Link: https://bluejayportfolio.com/audit?ref=${code}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  } catch (err) {
    console.warn("[partners/apply] owner alert failed:", err);
  }

  return NextResponse.json({ ok: true, code });
}
