/**
 * AI service registry + categorization.
 *
 * Every distinct value passed to `logCost({ service: ... })` is
 * cataloged here so the AI Activity dashboard + `bj ai stats` CLI can
 * present a consistent view rather than dumping raw service strings.
 *
 * Two categories:
 *   - "ai_compute"    — LLM/inference calls (Claude, OpenAI, Perplexity, etc.)
 *   - "infrastructure" — non-AI infra used by the same pipelines
 *                        (Twilio, SendGrid, Google Places, Lob, etc.)
 *
 * Anything not explicitly mapped (e.g. a new service added without
 * updating this file) falls back to AI_COMPUTE category if it starts
 * with "ai_skill:", "claude", "openai", "anthropic", or "perplexity";
 * everything else gets "other". When you add a new logCost service
 * string, add a row to SERVICE_META below so the dashboard labels it
 * properly. Failing that, the dashboard still works — just shows the
 * raw service name.
 *
 * Source-of-truth audit (2026-05-17): grep every logCost call site
 * across src/lib and src/app/api, sort-unique the service strings.
 */

export type ServiceCategory =
  | "ai_compute"
  | "infrastructure"
  | "other";

export type ServiceMeta = {
  /** The raw service string passed to logCost. */
  key: string;
  /** Human-friendly label for the dashboard. */
  label: string;
  category: ServiceCategory;
  /** One-line description of what this service is used for. */
  purpose: string;
};

export const SERVICE_META: ServiceMeta[] = [
  // ── AI Compute (LLM / inference) ──────────────────────────────
  {
    key: "claude",
    label: "Claude (AI responder + handoff)",
    category: "ai_compute",
    purpose: "Inbound reply drafting, prospect handoff, sales agent",
  },
  {
    key: "anthropic",
    label: "Claude (voice + site editor)",
    category: "ai_compute",
    purpose: "Voice agent + Olympic Inspections site-edit endpoint",
  },
  {
    key: "openai",
    label: "OpenAI (QC + supercharge + scoring)",
    category: "ai_compute",
    purpose: "Site QC scoring, content supercharge, intent classification",
  },
  {
    key: "perplexity",
    label: "Perplexity (research)",
    category: "ai_compute",
    purpose: "Business research lookups during scout/extract pipeline",
  },
  // ── Infrastructure (non-AI APIs used by AI pipelines) ────────
  {
    key: "twilio_sms",
    label: "Twilio SMS",
    category: "infrastructure",
    purpose: "Outbound + inbound SMS (incl. owner alerts, customer auto-reply)",
  },
  {
    key: "twilio_voice",
    label: "Twilio Voice",
    category: "infrastructure",
    purpose: "Voicemail drops, missed-call auto-text",
  },
  {
    key: "sendgrid_email",
    label: "SendGrid (email send)",
    category: "infrastructure",
    purpose: "Outbound email send",
  },
  {
    key: "sendgrid_suppression",
    label: "SendGrid (suppression)",
    category: "infrastructure",
    purpose: "Hard-bounce suppression group writes",
  },
  {
    key: "lob_postcard",
    label: "Lob (postcards)",
    category: "infrastructure",
    purpose: "Physical postcards to high-intent prospects",
  },
  {
    key: "google_places",
    label: "Google Places (search)",
    category: "infrastructure",
    purpose: "Business discovery during scout",
  },
  {
    key: "google_places_search",
    label: "Google Places (search)",
    category: "infrastructure",
    purpose: "Business discovery during scout",
  },
  {
    key: "google_places_detail",
    label: "Google Places (details)",
    category: "infrastructure",
    purpose: "Business detail enrichment (phone, hours, photos)",
  },
  {
    key: "google_places_photo",
    label: "Google Places (photos)",
    category: "infrastructure",
    purpose: "Photo fetching for preview generation",
  },
  {
    key: "google_ads",
    label: "Google Ads API",
    category: "infrastructure",
    purpose: "Campaign + conversion telemetry reads (free at our volume)",
  },
  {
    key: "meta_ads",
    label: "Meta Ads API",
    category: "infrastructure",
    purpose: "FB/IG campaign + creative reads (free at our volume)",
  },
  {
    key: "domain_registrar",
    label: "Namecheap (domain registrar)",
    category: "infrastructure",
    purpose: "Customer domain registrations + renewals",
  },
  {
    key: "vercel_domain",
    label: "Vercel (domain add)",
    category: "infrastructure",
    purpose: "Adding customer domains to the Vercel project",
  },
  {
    key: "image_proxy",
    label: "Image proxy",
    category: "infrastructure",
    purpose: "CDN-style image transformation",
  },
];

/** Lookup table for O(1) categorization. Built from SERVICE_META. */
const META_BY_KEY: Record<string, ServiceMeta> = Object.fromEntries(
  SERVICE_META.map((m) => [m.key, m]),
);

/** Match the dynamic `ai_skill:<name>` prefix used by the runner. */
function isAiSkill(key: string): boolean {
  return key.startsWith("ai_skill:");
}

/** Resolve a raw service string into its label + category. Falls
 *  back to sensible defaults when the service isn't in SERVICE_META
 *  (so a new logCost call doesn't break the dashboard). */
export function getServiceMeta(rawService: string): ServiceMeta {
  if (META_BY_KEY[rawService]) return META_BY_KEY[rawService];

  if (isAiSkill(rawService)) {
    const skillName = rawService.replace(/^ai_skill:/, "");
    return {
      key: rawService,
      label: `bj ai · ${skillName}`,
      category: "ai_compute",
      purpose: `Agentic skill: ${skillName}`,
    };
  }

  // Heuristic fallback — anything that looks AI-shaped gets ai_compute.
  if (/^(claude|openai|anthropic|perplexity|gpt|haiku|sonnet|opus)/i.test(rawService)) {
    return {
      key: rawService,
      label: rawService,
      category: "ai_compute",
      purpose: "Uncategorized AI call",
    };
  }

  return {
    key: rawService,
    label: rawService,
    category: "other",
    purpose: "Uncategorized service",
  };
}

/** True if `service` should count toward "AI spend." Used by the
 *  dashboard's headline number. */
export function isAiService(rawService: string): boolean {
  return getServiceMeta(rawService).category === "ai_compute";
}
