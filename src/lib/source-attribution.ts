/**
 * source-attribution — derive prospects.source_channel from inbound
 * form submissions.
 *
 * Called by every form-submit API (/api/audit/submit, /api/cut-my-agency/submit,
 * /api/sell-direct/submit, /api/clients/inquire/[code], /api/partners/apply,
 * etc.) to stamp where a lead actually came from BEFORE the row inserts.
 *
 * Without this stamp, we can't tell post-hoc whether a closed $10,000
 * deal originated from Madie cold-dial vs /cut-my-agency Google Ad
 * vs /audit inbound vs partner ?ref=. Every channel lights up the same
 * after, but optimization is blind without the upstream signal.
 *
 * Inputs we look at, in priority order (first match wins):
 *
 *   1. Explicit override from the form payload
 *      e.g. AuditForm POSTs `sourceChannel: 'audit-inbound'` on submit
 *
 *   2. Partner code in the URL (`?ref=hector-r`) — partner attribution
 *      always wins over UTM since the partner is the human who sent
 *      the link, regardless of what UTM the share-button generated.
 *
 *   3. UTM params on the submission referrer/origin
 *      utm_campaign='ad-system-2026-05'         → 'ad-system-ad'
 *      utm_campaign='agency-replacement-2026-05' → 'agency-replacement-ad'
 *      utm_source='google' (no campaign match)   → 'google-direct'
 *      utm_source='facebook'                     → 'meta-direct'
 *
 *   4. Origin path heuristics (when no UTM at all)
 *      submitted from /cut-my-agency calculator  → 'cma-calculator'
 *      submitted from /agency form               → 'agency-form'
 *      submitted from /audit form                → 'audit-inbound'
 *      otherwise                                  → 'website-direct'
 *
 * Returns the canonical source_channel string. Caller stamps it on the
 * prospect.source_channel column at insertion time.
 */

export type AttributionInput = {
  /** Optional explicit override from the form payload. */
  explicit?: string;
  /** Search-params string from the form page URL (window.location.search
   *  or req.nextUrl.searchParams.toString()). */
  searchParams?: URLSearchParams | string | null;
  /** Path the form was submitted from — `/audit`, `/agency`, etc. */
  originPath?: string;
};

export function deriveSourceChannel(input: AttributionInput): string {
  // 1. Explicit override always wins
  if (input.explicit && typeof input.explicit === "string") {
    const trimmed = input.explicit.trim();
    if (trimmed.length > 0 && trimmed.length <= 80) return trimmed;
  }

  // Normalize searchParams input to URLSearchParams
  const sp =
    typeof input.searchParams === "string"
      ? new URLSearchParams(input.searchParams)
      : input.searchParams || new URLSearchParams();

  // 2. Partner code in the URL — `?ref=hector-r`
  const partnerCode = (sp.get("ref") || sp.get("partner") || "").trim().toLowerCase();
  if (partnerCode && /^[a-z0-9][a-z0-9-]{2,40}$/.test(partnerCode)) {
    return `partner:${partnerCode}`;
  }

  // 3. UTM-based attribution
  const utmCampaign = (sp.get("utm_campaign") || "").trim().toLowerCase();
  const utmSource = (sp.get("utm_source") || "").trim().toLowerCase();
  const utmMedium = (sp.get("utm_medium") || "").trim().toLowerCase();

  if (utmCampaign) {
    if (utmCampaign.includes("ad-system")) return "ad-system-ad";
    if (utmCampaign.includes("agency-replacement")) return "agency-replacement-ad";
    if (utmCampaign.includes("madie")) return "madie-cold-call";
    if (utmCampaign.includes("scout-mfg")) return "scout-mfg-icp";
  }
  if (utmSource) {
    if (utmSource === "google" && utmMedium === "cpc") return "google-cpc";
    if (utmSource === "facebook" || utmSource === "meta") return "meta-direct";
    if (utmSource === "linkedin") return "linkedin-direct";
    if (utmSource === "google") return "google-direct";
  }

  // 4. Origin-path heuristics
  const path = (input.originPath || "").toLowerCase();
  if (path.includes("/cut-my-agency")) return "cma-calculator";
  if (path.includes("/agency")) return "agency-form";
  if (path.includes("/audit")) return "audit-inbound";
  if (path.includes("/get-started")) return "get-started";
  if (path.includes("/schedule")) return "scheduled-direct";

  return "website-direct";
}
