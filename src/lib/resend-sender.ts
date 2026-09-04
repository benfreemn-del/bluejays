/**
 * Resend pilot sender — the SendGrid-replacement migration (started 2026-09-04).
 *
 * WHY: SendGrid's floor is $19.95/mo (Essentials 50K) for ~24 sends/mo.
 * Resend's free tier (3k/mo, benfreemn@gmail.com account) covers our real
 * volume at $0. Migration doctrine lives in the LinePlay repo:
 * docs/ops/BLUEJAY_CLIENT_INFRASTRUCTURE.md.
 *
 * PILOT SCOPE (Ben 09/04: "we can't afford to mess up Meyer Electric"):
 * sends are routed through Resend ONLY when the send's clientSlug is listed
 * in the RESEND_PILOT_SLUGS env var (comma-separated; "*" = everything).
 * Start with RESEND_PILOT_SLUGS=olympic-inspections. Meyer Electric
 * migrates LAST, only after the pilot runs clean for several days.
 *
 * SAFETY NET: every caller falls back to the existing SendGrid path when
 * Resend fails or isn't configured — no lead is ever dropped by the pilot.
 * Rollback = delete the RESEND_PILOT_SLUGS env var and redeploy.
 *
 * DKIM: bluejayportfolio.com is verified in Resend (DKIM at
 * resend._domainkey + SPF/MX on send.bluejayportfolio.com, added to Vercel
 * DNS 2026-09-04). From addresses MUST stay @bluejayportfolio.com to keep
 * DMARC alignment — same rule as SendGrid (alerts.ts Rule 67).
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

function pilotSlugs(): string[] {
  return (process.env.RESEND_PILOT_SLUGS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Should this send go through Resend? True only when the API key exists
 * AND the tenant is enrolled in the pilot ("*" enrolls everything —
 * including slug-less internal owner alerts — for the final cutover).
 */
export function resendPilotEnabled(clientSlug?: string): boolean {
  if (!RESEND_API_KEY) return false;
  const slugs = pilotSlugs();
  if (slugs.includes("*")) return true;
  return !!clientSlug && slugs.includes(clientSlug.toLowerCase());
}

/**
 * Send one email via the Resend API. Returns true on success, false on
 * ANY failure (HTTP error, network, missing key) — callers treat false
 * as "fall back to SendGrid", so this never throws.
 */
export async function sendViaResend(args: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}): Promise<boolean> {
  if (!RESEND_API_KEY) return false;
  try {
    const payload: Record<string, unknown> = {
      from: `${args.fromName} <${args.fromEmail}>`,
      to: [args.to],
      subject: args.subject,
      text: args.text,
    };
    if (args.html) payload.html = args.html;
    if (args.replyTo) payload.reply_to = args.replyTo;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error(
        "[sendViaResend]",
        response.status,
        await response.text().catch(() => ""),
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[sendViaResend] failed:", err);
    return false;
  }
}
