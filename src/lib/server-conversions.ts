/**
 * Server-side conversion helpers — Meta CAPI + Google Ads offline.
 *
 * Why this file exists: client-side pixel events get blocked by ad
 * blockers, iOS privacy, and Safari ITP — losing 20–40% of signal
 * depending on audience. Server-side conversions fire from our
 * backend on confirmed business events (Stripe paid, Calendly booked)
 * and bypass all of that. Bigger reason: high-value events that
 * happen OFF the website (Calendly invitee.created) can't fire a
 * client pixel at all — they only exist server-side.
 *
 * Events to fire from the server:
 *   - Stripe checkout.session.completed → Meta `Purchase`
 *   - Calendly invitee.created          → Meta `Schedule`
 *   - Agency-apply qualified            → already client-side; CAPI
 *     duplicate would help but isn't critical (pixel fires reliably
 *     since the form is on our domain). Future: dedupe via event_id.
 *
 * Env required:
 *   META_PIXEL_ID         — same as NEXT_PUBLIC_META_PIXEL_ID
 *   META_CAPI_ACCESS_TOKEN — generate in Events Manager → Settings →
 *                            Conversions API → Generate Access Token
 *
 * Both events fire-and-forget — never block webhook responses on
 * conversion API success/failure. Errors logged but swallowed.
 */

const META_PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

type MetaEventName =
  | "Purchase"
  | "Lead"
  | "Schedule"
  | "CompleteRegistration"
  | "InitiateCheckout";

type FireMetaCapiArgs = {
  eventName: MetaEventName;
  /**
   * Stable event ID for deduplication when the same conversion also
   * fires client-side (Meta uses event_id + event_name + minute-level
   * timestamp to dedupe). Recommended even if no client event exists
   * — makes the data warehouse joins cleaner.
   */
  eventId?: string;
  /** ISO timestamp; defaults to "now". Meta accepts ±7 days. */
  eventTime?: Date;
  /** URL where the original conversion intent began. Strongly recommended. */
  eventSourceUrl?: string;
  /** Numeric value (USD by default) — for Purchase, Lead, Schedule. */
  value?: number;
  currency?: string;
  /**
   * User identifiers. Meta hashes them server-side if you pass plain.
   * We hash here so the wire data is already SHA-256 (Meta's preferred
   * format). Pass any combination — more identifiers = better match rate.
   */
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    /** Plain IPv4/IPv6 string. NOT hashed. */
    clientIpAddress?: string;
    /** User-Agent header from the original request. NOT hashed. */
    clientUserAgent?: string;
    /** Facebook click ID (fbclid) if available — best signal Meta has. */
    fbc?: string;
    /** Facebook browser ID (fbp cookie value). */
    fbp?: string;
  };
  /** Free-form extras — Meta accepts content_name, content_category, etc. */
  customData?: Record<string, string | number | boolean>;
};

/** SHA-256 of a lowercased+trimmed string. Meta's required format. */
async function sha256Lower(input: string | undefined): Promise<string | undefined> {
  if (!input) return undefined;
  const normalized = input.trim().toLowerCase();
  // Use Node's webcrypto via globalThis — works in both Edge and Node runtimes.
  const data = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Fire a Meta Conversions API event. No-op if env vars are missing
 * (logs a warning so misconfigured prod is visible). Never throws —
 * webhook handlers should not crash on conversion failures.
 */
export async function fireMetaCapi(args: FireMetaCapiArgs): Promise<boolean> {
  if (!META_PIXEL_ID || !META_CAPI_ACCESS_TOKEN) {
    console.warn(
      `[meta-capi] skipped ${args.eventName} — META_PIXEL_ID or META_CAPI_ACCESS_TOKEN unset`,
    );
    return false;
  }

  try {
    const ud = args.userData || {};
    const userData: Record<string, unknown> = {};
    const em = await sha256Lower(ud.email);
    const ph = await sha256Lower(ud.phone?.replace(/[^\d]/g, ""));
    const fn = await sha256Lower(ud.firstName);
    const ln = await sha256Lower(ud.lastName);
    if (em) userData.em = [em];
    if (ph) userData.ph = [ph];
    if (fn) userData.fn = [fn];
    if (ln) userData.ln = [ln];
    if (ud.clientIpAddress) userData.client_ip_address = ud.clientIpAddress;
    if (ud.clientUserAgent) userData.client_user_agent = ud.clientUserAgent;
    if (ud.fbc) userData.fbc = ud.fbc;
    if (ud.fbp) userData.fbp = ud.fbp;

    const eventTime = Math.floor((args.eventTime?.getTime() ?? Date.now()) / 1000);

    const event: Record<string, unknown> = {
      event_name: args.eventName,
      event_time: eventTime,
      action_source: "website",
      user_data: userData,
    };
    if (args.eventId) event.event_id = args.eventId;
    if (args.eventSourceUrl) event.event_source_url = args.eventSourceUrl;

    const customData: Record<string, unknown> = { ...(args.customData || {}) };
    if (args.value !== undefined) customData.value = args.value;
    if (args.currency !== undefined) customData.currency = args.currency;
    if (Object.keys(customData).length > 0) event.custom_data = customData;

    const url = `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(META_CAPI_ACCESS_TOKEN)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[meta-capi] ${args.eventName} failed: ${res.status} ${body}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[meta-capi] exception:", err);
    return false;
  }
}

// ─── Google Ads offline conversions ─────────────────────────────────
//
// Stub for now — full implementation requires OAuth token refresh +
// the existing google-ads-client.ts plumbing. Logs that the event
// would have fired so deploys can be verified before wiring billing-
// impacting plumbing.
//
// To complete: in google-ads-client.ts add an `uploadOfflineConversion`
// helper using the ConversionUploadService.UploadClickConversions
// REST endpoint and call it from here with a captured GCLID.
//
// GCLID capture path: Google Ads click → ?gclid=... → form-submit
// stores it in agency_applications.gclid → this helper reads + uploads.
// The agency_applications table doesn't have a gclid column yet —
// add it in a follow-up migration when wiring this in.

type FireGoogleOfflineConversionArgs = {
  conversionAction: string;
  gclid: string;
  conversionDateTime: Date;
  value?: number;
  currency?: string;
};

export async function fireGoogleOfflineConversion(
  args: FireGoogleOfflineConversionArgs,
): Promise<boolean> {
  console.log(
    `[google-offline-conv] STUB — would fire ${args.conversionAction} for gclid=${args.gclid.slice(0, 12)}… value=${args.value || 0} ${args.currency || "USD"}`,
  );
  return false;
}
