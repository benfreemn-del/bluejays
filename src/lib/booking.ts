/**
 * Single source of truth for Ben's 15-minute walkthrough booking link.
 *
 * Two-layer design (added 2026-05-27):
 *   - getBenBookingUrl()        → the CLEAN short link prospects see:
 *                                 https://bluejayportfolio.com/book-ben
 *   - getBenBookingDestination()→ the REAL Google Calendar Appointment
 *                                 Schedule URL the short link redirects to
 *                                 (115 chars — never shown to prospects).
 *
 * The /book-ben route handler (src/app/book-ben/route.ts) 302-redirects
 * the short link to the destination. This keeps every customer-facing
 * link short + dictatable while the actual booking page can be a long
 * Google URL (or anything else).
 *
 * To repoint booking WITHOUT a code change: set BEN_BOOKING_URL on Vercel
 * to the new destination URL. The hardcoded Google appt URL below is the
 * fallback so booking never breaks if the env var is missing.
 *
 * Why Google Calendar Appointment Schedules: native to Ben's Workspace
 * (ben@bluejayportfolio.com), free, auto-creates a Google Meet link on
 * every booking, syncs to his calendar, no separate tool/account.
 */

// Ben's real Google Calendar Appointment Schedule booking page. This is
// the 115-char destination — never shown to prospects directly (too long
// to text / dictate). The clean /book-ben short link redirects here.
// Set BEN_BOOKING_URL on Vercel to override (e.g. if Ben recreates the
// schedule or switches tools) without a code change.
const BEN_GOOGLE_APPT_URL =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0ejHLn2ODYwlDz3UgAvlPNPNlPxx29EPBp80KYQFTWYBN3t2CqKT0r54z36_icS3czLIjNsjLh";

// Clean, on-brand short link prospects actually see in texts/emails.
// The /book-ben route handler 302-redirects it to BEN_GOOGLE_APPT_URL.
const BEN_BOOKING_SHORT_URL = "https://bluejayportfolio.com/book-ben";

/**
 * The REAL booking destination (long Google URL or env override). Used
 * ONLY by the /book-ben redirect route — never put this in customer copy.
 */
export function getBenBookingDestination(): string {
  const envUrl =
    process.env.BEN_BOOKING_URL || process.env.NEXT_PUBLIC_BEN_BOOKING_URL;
  // Only honor the env override if it points at a RECOGNIZED booking host.
  // Guards against stale/misconfigured values silently breaking booking —
  // e.g. a leftover BEN_BOOKING_URL=https://bluejayportfolio.com/bluejaycontactme
  // was found in .env.local 2026-05-27 redirecting /book-ben to a dead path.
  // Per the env-var-unreliability rule, the hardcoded Google appt URL is the
  // trustworthy default; the env var can only override with a real calendar.
  if (
    envUrl &&
    /(calendar\.google\.com|calendly\.com|cal\.com)/i.test(envUrl)
  ) {
    return envUrl;
  }
  return BEN_GOOGLE_APPT_URL;
}

/**
 * The clean short booking link to show prospects (email, SMS, signature).
 * Always returns https://bluejayportfolio.com/book-ben which redirects to
 * the real Google appointment page. Short enough to text + dictate.
 */
export function getBenBookingUrl(): string {
  return BEN_BOOKING_SHORT_URL;
}

/**
 * Build the booking URL with attribution params so the Calendly
 * webhook can identify which prospect + partner brought the booking.
 *
 * Calendly preserves any query params on the booking link and surfaces
 * them in the webhook payload as `tracking.utm_source` etc. We pack:
 *   utm_source = partner-code   (so the webhook can match the partner)
 *   utm_campaign = prospect-id  (so we mark partner_calls.outcome)
 *   utm_medium = 'partner-call' (so we know it came from the workspace)
 *
 * If BEN_BOOKING_URL is the public-homepage fallback, we don't append
 * params (would look weird on a non-Calendly URL).
 */
export function buildBookingUrlForCall(args: {
  prospectId?: string | null;
  partnerCode?: string | null;
}): string {
  const base = getBenBookingUrl();
  // If we're on the fallback URL (no Calendly set up), don't pollute it
  if (!base.includes("calendly.com") && !base.includes("cal.com")) {
    return base;
  }
  const params = new URLSearchParams();
  if (args.partnerCode) params.set("utm_source", args.partnerCode);
  if (args.prospectId) params.set("utm_campaign", args.prospectId);
  params.set("utm_medium", "partner-call");
  const sep = base.includes("?") ? "&" : "?";
  return params.toString() ? `${base}${sep}${params.toString()}` : base;
}
