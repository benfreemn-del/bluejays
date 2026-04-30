/**
 * Single source of truth for Ben's 15-minute walkthrough booking link.
 *
 * Set BEN_BOOKING_URL on Vercel (Production + Preview + Development)
 * to your Calendly URL once Calendly is connected to your Google
 * Calendar — e.g.:
 *
 *   BEN_BOOKING_URL=https://calendly.com/ben-bluejays/15min-walkthrough
 *
 * Why Calendly: it syncs natively to your Google Calendar, sends
 * calendar invites to the prospect automatically, handles timezone
 * math, prevents double-booking, and integrates with our
 * /api/webhooks/calendly endpoint for partner-attribution alerts.
 *
 * The free tier covers BlueJays' volume for years. No need to build
 * Google Calendar OAuth from scratch.
 *
 * If BEN_BOOKING_URL isn't set yet, callers fall back to a
 * "coming soon" Calendly placeholder — better than a broken link
 * landing prospects on a 404 mid-call.
 */

export function getBenBookingUrl(): string {
  return (
    process.env.BEN_BOOKING_URL ||
    process.env.NEXT_PUBLIC_BEN_BOOKING_URL ||
    // Fallback — sends prospects to the public homepage if the env
    // var isn't set, so a broken link doesn't kill a call live.
    "https://bluejayportfolio.com/get-started"
  );
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
