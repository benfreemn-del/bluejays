import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getProspect, updateProspect } from "@/lib/store";

/**
 * /api/leads/sms-opt-in/[id]
 *
 * Captures SMS consent for a prospect AFTER they've already submitted the
 * /get-started form without ticking the optional consent checkbox. Backs
 * the /opt-in-sms/[id] post-submit upsell page (Q11=B per CLAUDE.md
 * Rule 35 update).
 *
 * GET — returns { phone } for the prospect so the page can pre-fill the
 * input field with whatever they typed (if anything) on /get-started.
 * Returns nothing else: this is a public route gated only by UUID-as-secret,
 * so we don't expose the rest of the prospect record here.
 *
 * POST — body { phone, agree:true }. Sets:
 *   - smsConsent = true
 *   - smsConsentAt = now()
 *   - smsConsentSource = "opt_in_page"
 *   - phone (overwrites if blank, or replaces with the new value)
 *
 * After this fires, the funnel-manager Rule 35 belt+suspenders gate
 * (source === "inbound" && smsConsent === true) starts permitting SMS for
 * this prospect on the next cron tick.
 *
 * NEVER make this required for anything else. If the prospect skips or
 * declines, they still get the email-only funnel — no second-class
 * experience.
 */

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.trim();
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid prospect id" }, { status: 400 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`sms-opt-in-get:${ip}`, 30, 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const prospect = await getProspect(id);
  if (!prospect) {
    // Don't leak whether the id exists. Return 200 with empty payload so the
    // page can render its empty form regardless.
    return NextResponse.json({ phone: "" });
  }

  return NextResponse.json({ phone: prospect.phone || "" });
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid prospect id" }, { status: 400 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = rateLimit(`sms-opt-in-post:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const agree = body.agree === true;

  if (!agree) {
    return NextResponse.json(
      { error: "SMS consent checkbox is required to opt in." },
      { status: 400 },
    );
  }
  if (!phoneRaw || phoneRaw.replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 },
    );
  }

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  await updateProspect(
    id,
    {
      phone: normalizePhone(phoneRaw),
      smsConsent: true,
      smsConsentAt: now,
      smsConsentSource: "opt_in_page",
    },
    { source: "sms_opt_in_page" },
  );

  return NextResponse.json({ ok: true });
}
