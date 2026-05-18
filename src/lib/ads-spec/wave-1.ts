/**
 * Wave-1 cold-traffic launch spec (2026-05-17).
 *
 * Structured mirror of docs/templates/cold-traffic-ad-creatives.md.
 * Markdown is for human reading; THIS file is what the launch
 * orchestrator consumes. When the two drift, this file wins at
 * runtime — sync the markdown manually.
 *
 * Three audiences (manufacturer / DTC brand / indie author) × four
 * hooks each = 12 ads. Phase 1 (skeleton) creates just the campaign
 * + 3 ad sets. Phase 2 (ads) creates the 12 ads once HyperAgent
 * images land at expected paths.
 */

export type AudienceKey = "manufacturer" | "dtc" | "author";

/** Meta targeting shape — kept loose so the launch orchestrator can
 *  pass it through to Graph API unchanged. Each field maps to a real
 *  Marketing API targeting parameter. */
export type AdSetTargeting = {
  geo_locations: { countries: string[] };
  age_min: number;
  age_max: number;
  genders?: number[]; // 0=all, 1=male, 2=female
  /** Single seed interest ID — Ben refines in the Ads Manager UI
   *  with Meta's autocomplete before launching. Per the launch
   *  doc: detailed interest targeting is human-tuned post-creation. */
  flexible_spec?: Array<{
    interests?: Array<{ id: string; name: string }>;
  }>;
  publisher_platforms: string[]; // ["facebook", "instagram"]
  facebook_positions?: string[];
  instagram_positions?: string[];
};

export type AdSpec = {
  /** Stable identifier used in utm_content + ad name. */
  hook_id: string;
  audience: AudienceKey;
  headline: string;
  primary_text: string;
  description?: string;
  cta: "GET_QUOTE" | "LEARN_MORE" | "SIGN_UP";
  /** Either an image (Feed/Reels static) or a video (Reels/Stories
   *  VSL). The orchestrator's Phase-2 logic dispatches on this. */
  creative:
    | { kind: "image"; asset_path: string; aspect: "1:1" | "9:16" }
    | { kind: "video"; asset_path: string; aspect: "9:16" };
  /** Destination URL — built from base + utm_audience + utm_content
   *  by the orchestrator (don't hardcode here, so the campaign tag
   *  can be parameterized for future waves). */
  utm_audience: string;
  utm_content: string;
};

export type AdSetSpec = {
  audience: AudienceKey;
  /** Internal name used in Ads Manager. */
  name: string;
  daily_budget_usd: number;
  targeting: AdSetTargeting;
  /** The 4 ads that live in this ad set. */
  ads: AdSpec[];
};

export type WaveSpec = {
  wave: string;
  /** Campaign name as it appears in Ads Manager. */
  campaign_name: string;
  /** Meta campaign objective. We're using OUTCOME_SALES because
   *  /audit fires a Pixel "Lead" event, and Meta optimizes conversion
   *  campaigns by chasing that event. */
  campaign_objective: "OUTCOME_SALES" | "OUTCOME_LEADS" | "OUTCOME_AWARENESS";
  /** Optimization event — the Pixel custom event the ad set tries to
   *  maximize. Must match the Pixel event our /audit form fires. */
  optimization_event: "Lead";
  /** Base destination URL. Wave-1 points at /audit; future waves
   *  could point at /scan, /agency, etc. */
  destination_base_url: string;
  /** Campaign-wide UTM. utm_audience + utm_content are per-ad. */
  utm_campaign: string;
  ad_sets: AdSetSpec[];
};

// ── Targeting building blocks ─────────────────────────────────────

const US_ONLY: AdSetTargeting["geo_locations"] = { countries: ["US"] };

// ── Wave 1 spec ────────────────────────────────────────────────────

export const WAVE_1: WaveSpec = {
  wave: "wave-1",
  campaign_name: "BlueJays Wave 1 — Cold Audit Validation",
  campaign_objective: "OUTCOME_SALES",
  optimization_event: "Lead",
  destination_base_url: "https://bluejayportfolio.com/audit",
  utm_campaign: "wave1-2026-05-17",
  ad_sets: [
    {
      audience: "manufacturer",
      name: "BJ Wave 1 — Manufacturer",
      daily_budget_usd: 15,
      targeting: {
        geo_locations: US_ONLY,
        age_min: 35,
        age_max: 65,
        publisher_platforms: ["facebook", "instagram"],
        facebook_positions: ["feed", "story", "facebook_reels"],
        instagram_positions: ["stream", "story", "reels"],
      },
      ads: [
        {
          hook_id: "mfg-pain",
          audience: "manufacturer",
          headline: "Your product page leaks orders",
          primary_text:
            "4 reasons your product isn't selling — free 60-sec audit. Score, money-leak estimate, top 5 fixes ranked. No signup.",
          description: "60 seconds. No signup.",
          cta: "GET_QUOTE",
          creative: {
            kind: "image",
            asset_path: "public/ad-assets/wave-1/mfg-pain-1x1.jpg",
            aspect: "1:1",
          },
          utm_audience: "mfg",
          utm_content: "mfg-pain",
        },
        {
          hook_id: "mfg-distributor",
          audience: "manufacturer",
          headline: "Your distributor owns your customer",
          primary_text:
            "They take the order, the email, the repeat purchase, the LTV. You're a vendor on someone else's audience. We show you how to flip it.",
          description: "Free audit. Top 5 fixes.",
          cta: "GET_QUOTE",
          creative: {
            kind: "image",
            asset_path: "public/ad-assets/wave-1/mfg-distributor-1x1.jpg",
            aspect: "1:1",
          },
          utm_audience: "mfg",
          utm_content: "mfg-distributor",
        },
        {
          hook_id: "mfg-vsl1",
          audience: "manufacturer",
          headline: "4 reasons most product brands lose orders",
          primary_text:
            "60-second walkthrough. The 5 leaks costing you money + the fix that pays for itself in week 1.",
          description: "Free audit at end.",
          cta: "GET_QUOTE",
          creative: {
            kind: "video",
            asset_path: "public/audit-assets/vsl-1.mp4",
            aspect: "9:16",
          },
          utm_audience: "mfg",
          utm_content: "mfg-vsl1",
        },
        {
          hook_id: "mfg-vsl2",
          audience: "manufacturer",
          headline: "Two paths. The right one's obvious.",
          primary_text:
            "$997 site or the full AI system. 60-second pitch + free audit shows you which fits.",
          description: "No credit card.",
          cta: "GET_QUOTE",
          creative: {
            kind: "video",
            asset_path: "public/audit-assets/vsl-2-story.mp4",
            aspect: "9:16",
          },
          utm_audience: "mfg",
          utm_content: "mfg-vsl2",
        },
      ],
    },
    {
      audience: "dtc",
      name: "BJ Wave 1 — DTC Brand",
      daily_budget_usd: 15,
      targeting: {
        geo_locations: US_ONLY,
        age_min: 28,
        age_max: 55,
        publisher_platforms: ["facebook", "instagram"],
        facebook_positions: ["feed", "story", "facebook_reels"],
        instagram_positions: ["stream", "story", "reels"],
      },
      ads: [
        {
          hook_id: "dtc-pain",
          audience: "dtc",
          headline: "Stuck at 1.5% conversion?",
          primary_text:
            "Your CPMs went up 30%. Your conversion didn't. The leak is the landing page, not the ads. Free 60-sec audit shows you the 3 fixes.",
          description: "60 seconds. No signup.",
          cta: "GET_QUOTE",
          creative: {
            kind: "image",
            asset_path: "public/ad-assets/wave-1/dtc-pain-1x1.jpg",
            aspect: "1:1",
          },
          utm_audience: "dtc",
          utm_content: "dtc-pain",
        },
        {
          hook_id: "dtc-retarget",
          audience: "dtc",
          headline: "95% of your visitors are gone forever",
          primary_text:
            "No email capture. No SMS. Your cart-abandon emails barely fire. You're paying $25 CPMs to chase them back. Free audit shows what to fix.",
          description: "Free 60-sec audit.",
          cta: "GET_QUOTE",
          creative: {
            kind: "image",
            asset_path: "public/ad-assets/wave-1/dtc-retarget-1x1.jpg",
            aspect: "1:1",
          },
          utm_audience: "dtc",
          utm_content: "dtc-retarget",
        },
        {
          hook_id: "dtc-vsl1",
          audience: "dtc",
          headline: "Why your product isn't selling online",
          primary_text:
            "60-second walkthrough of the 5 leaks every DTC brand has + the fix that pays for itself in week 1.",
          description: "Free audit at end.",
          cta: "GET_QUOTE",
          creative: {
            kind: "video",
            asset_path: "public/audit-assets/vsl-1.mp4",
            aspect: "9:16",
          },
          utm_audience: "dtc",
          utm_content: "dtc-vsl1",
        },
        {
          hook_id: "dtc-vsl2",
          audience: "dtc",
          headline: "Built for DTC brands",
          primary_text:
            "Two paths: $997 site or the full AI system. 60-sec pitch + free audit shows which fits your funnel.",
          description: "No credit card.",
          cta: "GET_QUOTE",
          creative: {
            kind: "video",
            asset_path: "public/audit-assets/vsl-2-story.mp4",
            aspect: "9:16",
          },
          utm_audience: "dtc",
          utm_content: "dtc-vsl2",
        },
      ],
    },
    {
      audience: "author",
      name: "BJ Wave 1 — Indie Author",
      daily_budget_usd: 15,
      targeting: {
        geo_locations: US_ONLY,
        age_min: 25,
        age_max: 65,
        publisher_platforms: ["facebook", "instagram"],
        facebook_positions: ["feed", "story", "facebook_reels"],
        instagram_positions: ["stream", "story", "reels"],
      },
      ads: [
        {
          hook_id: "author-pain",
          audience: "author",
          headline: "Your book page is an Amazon dead-end",
          primary_text:
            "No email capture, no series funnel, no way to tell readers when book 2 drops. Free 60-sec audit shows the fix.",
          description: "No signup needed.",
          cta: "GET_QUOTE",
          creative: {
            kind: "image",
            asset_path: "public/ad-assets/wave-1/author-pain-1x1.jpg",
            aspect: "1:1",
          },
          utm_audience: "author",
          utm_content: "author-pain",
        },
        {
          hook_id: "author-silence",
          audience: "author",
          headline: "6 months of silence kills launches",
          primary_text:
            "Readers forget you exist between books. Free 60-sec audit shows the 3 funnel fixes that keep your audience warm.",
          description: "Built for series authors.",
          cta: "GET_QUOTE",
          creative: {
            kind: "image",
            asset_path: "public/ad-assets/wave-1/author-silence-1x1.jpg",
            aspect: "1:1",
          },
          utm_audience: "author",
          utm_content: "author-silence",
        },
        {
          hook_id: "author-vsl1",
          audience: "author",
          headline: "4 reasons readers stop following authors",
          primary_text:
            "60-second walkthrough. The 5 leaks costing series authors readers + the fix that compounds across every book.",
          description: "Free audit at end.",
          cta: "GET_QUOTE",
          creative: {
            kind: "video",
            asset_path: "public/audit-assets/vsl-1.mp4",
            aspect: "9:16",
          },
          utm_audience: "author",
          utm_content: "author-vsl1",
        },
        {
          hook_id: "author-vsl2",
          audience: "author",
          headline: "Built for series authors",
          primary_text:
            "Two paths: $997 author site or the full reader-funnel system. 60-sec pitch + free audit shows which fits.",
          description: "No credit card.",
          cta: "GET_QUOTE",
          creative: {
            kind: "video",
            asset_path: "public/audit-assets/vsl-2-story.mp4",
            aspect: "9:16",
          },
          utm_audience: "author",
          utm_content: "author-vsl2",
        },
      ],
    },
  ],
};

/** Lookup table for the CLI. Add future waves here. */
export const WAVES: Record<string, WaveSpec> = {
  "wave-1": WAVE_1,
};

/** Build the full destination URL for an ad — combines base + UTM
 *  tags + the per-ad audience/content tags. */
export function buildAdDestinationUrl(spec: WaveSpec, ad: AdSpec): string {
  const params = new URLSearchParams({
    utm_source: "meta",
    utm_medium: "cpc",
    utm_campaign: spec.utm_campaign,
    utm_audience: ad.utm_audience,
    utm_content: ad.utm_content,
  });
  return `${spec.destination_base_url}?${params.toString()}`;
}
