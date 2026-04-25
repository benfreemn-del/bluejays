/**
 * UTM tagging — pure function for appending UTM params to outreach URLs.
 *
 * Why this exists: every outbound link (email pitch, follow-ups, SMS,
 * voicemail email, postcard QR) needs to carry attribution data so the
 * Stripe `paid` event can tie back to the channel/campaign that drove
 * the click. Without UTM tagging, conversion-rate optimization is
 * blind — we can't tell whether Day 5 follow-ups outperform Day 12
 * value-reframes, or whether postcards convert better than SMS.
 *
 * Usage:
 *   addUtm(getShortPreviewUrl(prospect), "email", "outreach", "pitch_day0", "v1")
 *   → https://bluejayportfolio.com/p/abc123?utm_source=email&utm_medium=outreach&utm_campaign=pitch_day0&utm_content=v1
 *
 * Idempotent: if a UTM param is already present in the URL, we don't
 * append a duplicate. The existing value wins (don't clobber operator-
 * set overrides on direct dashboard links).
 *
 * All params are lowercased + URL-safe. Spaces become underscores. No
 * special chars beyond [a-z0-9_-]. Keeps GA / dashboard reporting clean.
 */

function sanitizeUtmValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_\-.]/g, "")
    .slice(0, 100);
}

/**
 * Append UTM tracking params to a URL. Idempotent — if any of the four
 * params is already on the URL, that pre-existing value is preserved.
 *
 * @param url Any absolute URL (the helper preserves origin + pathname + hash)
 * @param source utm_source — channel of the touch (email, sms, postcard, voicemail_followup_email, etc)
 * @param medium utm_medium — broader bucket (outreach, sms, postcard, voicemail_followup_email)
 * @param campaign utm_campaign — specific funnel step (pitch_day0, followup_day5_re, etc)
 * @param content Optional utm_content — variant tag (v1, v2, ab_a, ab_b)
 */
export function addUtm(
  url: string,
  source: string,
  medium: string,
  campaign: string,
  content?: string,
): string {
  if (!url) return url;

  // Don't UTM-tag mailto: / tel: / sms: links — they don't preserve query
  // strings through their respective handlers and the params just look
  // like junk in the body of an email or text.
  if (/^(mailto|tel|sms):/i.test(url)) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Not a parseable absolute URL — return unchanged. Don't crash the
    // caller (an outreach send has bigger fish to fry than a malformed
    // link).
    return url;
  }

  const params = parsed.searchParams;
  // Idempotent: only set each param if not already present. Preserves
  // operator-supplied overrides on direct dashboard links.
  if (!params.has("utm_source")) params.set("utm_source", sanitizeUtmValue(source));
  if (!params.has("utm_medium")) params.set("utm_medium", sanitizeUtmValue(medium));
  if (!params.has("utm_campaign")) params.set("utm_campaign", sanitizeUtmValue(campaign));
  if (content && !params.has("utm_content")) {
    params.set("utm_content", sanitizeUtmValue(content));
  }

  parsed.search = params.toString();
  return parsed.toString();
}

/**
 * Extract UTM params from a URL (or a Next.js searchParams-like object)
 * for persistence. Returns the four standard UTM fields when present.
 *
 * Used by the preview / claim pages to capture the source on mount and
 * thread it through to Stripe checkout metadata so the `paid` webhook
 * event ties back to the channel that drove the click.
 */
export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

export function extractUtm(searchParams: URLSearchParams | Record<string, string | string[] | undefined>): UtmParams {
  const get = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) || undefined;
    }
    const v = searchParams[key];
    if (Array.isArray(v)) return v[0];
    return v || undefined;
  };

  const result: UtmParams = {};
  const source = get("utm_source");
  const medium = get("utm_medium");
  const campaign = get("utm_campaign");
  const content = get("utm_content");
  if (source) result.utm_source = sanitizeUtmValue(source);
  if (medium) result.utm_medium = sanitizeUtmValue(medium);
  if (campaign) result.utm_campaign = sanitizeUtmValue(campaign);
  if (content) result.utm_content = sanitizeUtmValue(content);
  return result;
}
