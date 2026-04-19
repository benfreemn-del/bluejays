import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getPitchEmail } from "@/lib/email-templates";
import type { Prospect } from "@/lib/types";

/**
 * POST /api/funnel/preview-pitch
 *
 * Renders a real Day-0 pitch email for a given prospect (or picks a random
 * approved-not-enrolled prospect from the backlog if no id is given) and
 * sends it to the `to` address — WITHOUT incrementing the warmup counter,
 * logging to the emails table, or touching the retry queue.
 *
 * Useful for:
 *   - Previewing what outgoing pitches actually look like
 *   - QA'ing template changes without burning warmup capacity
 *   - Sharing sample emails with team/testers
 *
 * Body:
 *   { to: "you@gmail.com", prospectId?: "<uuid>" }
 *
 * If `prospectId` is omitted, picks a random approved+email+not-yet-enrolled
 * prospect from the backlog (same candidate pool as enroll-batch).
 */
export async function POST(request: NextRequest) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  if (!SENDGRID_API_KEY) {
    return NextResponse.json({ error: "SENDGRID_API_KEY not configured" }, { status: 500 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const to = (body?.to || "").trim();
  const prospectId = (body?.prospectId || "").trim();

  if (!to || !to.includes("@")) {
    return NextResponse.json({ error: "Valid 'to' email is required" }, { status: 400 });
  }

  // 1. Pick the prospect — either by ID or random from approved backlog
  let prospectRow: Record<string, unknown> | null = null;

  if (prospectId) {
    const { data } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", prospectId)
      .single();
    prospectRow = data;
  } else {
    // Random approved + has email + not yet enrolled
    const { data: enrolled } = await supabase
      .from("funnel_enrollments")
      .select("prospect_id")
      .limit(10000);
    const enrolledIds = new Set((enrolled || []).map((r) => r.prospect_id as string));

    const { data: candidates } = await supabase
      .from("prospects")
      .select("*")
      .eq("status", "approved")
      .not("email", "is", null)
      .limit(100);

    const pool = (candidates || []).filter((p) => !enrolledIds.has(p.id as string));
    if (pool.length === 0) {
      return NextResponse.json(
        { error: "No approved-not-enrolled prospects with email in backlog" },
        { status: 404 }
      );
    }
    prospectRow = pool[Math.floor(Math.random() * pool.length)];
  }

  if (!prospectRow) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  // 2. Shape it into a Prospect object for the template
  const prospect: Prospect = {
    id: prospectRow.id as string,
    businessName: (prospectRow.business_name as string) || "(unknown)",
    ownerName: (prospectRow.owner_name as string | null) || undefined,
    email: (prospectRow.email as string | null) || undefined,
    phone: (prospectRow.phone as string | null) || undefined,
    address: (prospectRow.address as string) || "",
    city: (prospectRow.city as string) || "",
    state: (prospectRow.state as string) || "",
    category: prospectRow.category as Prospect["category"],
    currentWebsite: (prospectRow.current_website as string | null) || undefined,
    googleRating: (prospectRow.google_rating as number | null) || undefined,
    reviewCount: (prospectRow.review_count as number | null) || undefined,
    estimatedRevenueTier: "medium",
    status: prospectRow.status as Prospect["status"],
    scrapedData: (prospectRow.scraped_data as Prospect["scrapedData"]) || undefined,
    generatedSiteUrl: (prospectRow.generated_site_url as string | null) || undefined,
    createdAt: (prospectRow.created_at as string) || new Date().toISOString(),
    updatedAt: (prospectRow.updated_at as string) || new Date().toISOString(),
  };

  const previewUrl = `https://bluejayportfolio.com/preview/${prospect.id}`;

  // 3. Render the pitch
  const template = getPitchEmail(prospect, previewUrl);

  // 4. Send via SendGrid DIRECTLY — no warmup tracking, no retries, no DB logging
  //    Prefix the subject so Ben recognizes it's a preview, not an accidental real send
  const subject = `[PREVIEW] ${template.subject}`;
  const bodyWithContext = [
    `--- PREVIEW EMAIL (not tracked, not sent to prospect) ---`,
    `Rendered for: ${prospect.businessName} (${prospect.category})`,
    `Would be sent to: ${prospect.email || "(no email)"}`,
    `Preview URL: ${previewUrl}`,
    `-----------------------------------------------------------`,
    ``,
    template.body,
  ].join("\n");

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "ben@bluejayportfolio.com", name: "Ben @ BlueJays (preview)" },
      subject,
      content: [{ type: "text/plain", value: bodyWithContext }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown error");
    return NextResponse.json(
      { error: `SendGrid ${response.status}: ${errText.substring(0, 300)}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    to,
    prospect: {
      id: prospect.id,
      businessName: prospect.businessName,
      category: prospect.category,
      email: prospect.email,
      ownerName: prospect.ownerName,
      city: prospect.city,
      googleRating: prospect.googleRating,
      reviewCount: prospect.reviewCount,
      hasWebsite: !!prospect.currentWebsite,
    },
    rendered: {
      subject: template.subject,
      previewUrl,
    },
  });
}
