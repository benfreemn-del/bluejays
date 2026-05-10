/**
 * tone-profiles.ts — vocabulary overrides for non-commercial tenants.
 *
 * Per `docs/MOCK_BACKEND_TEMPLATE_AUDIT.md` roadmap #7 — some categories
 * (church, recovery programs, education non-profits, faith-based gyms)
 * need pastoral / developmental / values-aligned vocabulary instead of
 * the default commercial language ("leads" / "funnel" / "deal value").
 *
 * Pattern:
 *   · Each tenant (in service-clients.ts) optionally references a
 *     toneProfile string (default "commercial" if unset).
 *   · Every place that surfaces user-facing copy looks up the right
 *     word via toneText(slug, key) — falls back to commercial.
 *   · One config controls vocabulary across: portal tabs, funnel
 *     copy, dashboard metrics, AI agent prompts, scaffold generator
 *     output.
 *
 * Why a registry not inline strings:
 *   · A single override map per tenant beats sprinkling case-statements.
 *   · Adding a new tone (e.g. "medical-clinical" or "recovery-empathetic")
 *     is one new entry, not 50 file edits.
 *   · Future-proofs: when faith-based gym or recovery program lands,
 *     they pick an existing profile or define a new one without
 *     changing call-site code.
 */

/**
 * The set of vocabulary keys that have tenant-tone variants. Keep
 * this list TIGHT — only add a key when a tenant has actually asked
 * for a substitution. Premature abstraction here = a 200-key dictionary
 * nobody maintains.
 */
export type ToneKey =
  // Pipeline nouns
  | "lead"
  | "leads"
  | "funnel"
  | "funnels"
  | "conversion"
  | "campaign"
  | "audience"
  // Money / value
  | "deal_value"
  | "revenue"
  // CTAs
  | "join_cta"
  | "subscribe_cta"
  // Action verbs
  | "convert"
  | "engage";

export interface ToneProfile {
  /** Display name for the profile (operator-facing in admin UI) */
  label: string;
  /** Per-key substitutions */
  vocab: Record<ToneKey, string>;
  /** Optional notes for tenant onboarding (operator-facing) */
  notes?: string;
}

export type ToneProfileId = "commercial" | "church" | "recovery" | "education-nonprofit";

/* ─────────────────────────── PROFILES ─────────────────────────── */

const COMMERCIAL: ToneProfile = {
  label: "Commercial (default)",
  vocab: {
    lead: "lead",
    leads: "leads",
    funnel: "funnel",
    funnels: "funnels",
    conversion: "conversion",
    campaign: "campaign",
    audience: "audience",
    deal_value: "deal value",
    revenue: "revenue",
    join_cta: "Get started",
    subscribe_cta: "Subscribe",
    convert: "convert",
    engage: "engage",
  },
};

const CHURCH: ToneProfile = {
  label: "Church / Faith Community",
  vocab: {
    lead: "seeker",
    leads: "seekers",
    funnel: "discipleship journey",
    funnels: "discipleship journeys",
    conversion: "commitment",
    campaign: "communication",
    audience: "community",
    deal_value: "giving + serving",
    revenue: "stewardship",
    join_cta: "Take a next step",
    subscribe_cta: "Stay connected",
    convert: "step in",
    engage: "connect",
  },
  notes:
    "Replaces commercial vocabulary across portal copy, funnel runner output, " +
    "and AI agent prompts. Per docs/mock-backends/church.md — pastoral framing " +
    "is required, not optional. Apply at install-time, not as a switchable user " +
    "preference.",
};

const RECOVERY: ToneProfile = {
  label: "Recovery / 12-step / sober-community",
  vocab: {
    lead: "newcomer",
    leads: "newcomers",
    funnel: "support pathway",
    funnels: "support pathways",
    conversion: "engagement",
    campaign: "outreach",
    audience: "fellowship",
    deal_value: "membership",
    revenue: "donations",
    join_cta: "Reach out",
    subscribe_cta: "Stay in touch",
    convert: "engage",
    engage: "connect",
  },
  notes:
    "Empathetic, anti-stigma vocabulary for sober-community / recovery / mental-" +
    "health-adjacent tenants. Avoids commercial pressure language entirely.",
};

const EDUCATION_NONPROFIT: ToneProfile = {
  label: "Education / non-profit (school / coalition / advocacy)",
  vocab: {
    lead: "family",
    leads: "families",
    funnel: "engagement track",
    funnels: "engagement tracks",
    conversion: "enrollment",
    campaign: "communication",
    audience: "community",
    deal_value: "support",
    revenue: "support",
    join_cta: "Get involved",
    subscribe_cta: "Subscribe to updates",
    convert: "join",
    engage: "engage",
  },
  notes:
    "For schools / coalitions / advocacy non-profits — Lewis County Autism " +
    "Coalition style. Soft-impact vocabulary, no commercial pressure tone.",
};

const REGISTRY: Record<ToneProfileId, ToneProfile> = {
  commercial: COMMERCIAL,
  church: CHURCH,
  recovery: RECOVERY,
  "education-nonprofit": EDUCATION_NONPROFIT,
};

/* ───────────────────────── PUBLIC API ───────────────────────── */

/**
 * Look up the tone profile for a tenant. Returns the commercial
 * default when the slug isn't registered with an override.
 *
 * Tenants opt into a non-commercial profile via the optional
 * `toneProfile` field on their ServiceClientConfig (see
 * src/lib/service-clients.ts).
 */
export function getToneProfile(profileId?: ToneProfileId | null): ToneProfile {
  if (!profileId) return REGISTRY.commercial;
  return REGISTRY[profileId] ?? REGISTRY.commercial;
}

/**
 * Look up a single substituted word for a tenant. Stable shorthand
 * for the most common call site — funnel runners, portal copy, etc.
 *
 * Usage:
 *   const noun = toneText("church", "leads"); // → "seekers"
 *   const cta  = toneText("commercial", "join_cta"); // → "Get started"
 *
 * If the key is missing from the profile (shouldn't happen given the
 * exhaustive ToneKey union, but defensive), falls back to commercial.
 */
export function toneText(profileId: ToneProfileId | null | undefined, key: ToneKey): string {
  const profile = getToneProfile(profileId);
  return profile.vocab[key] ?? REGISTRY.commercial.vocab[key];
}

/** All registered profile IDs — used by admin UIs to render dropdowns. */
export function listToneProfileIds(): ToneProfileId[] {
  return Object.keys(REGISTRY) as ToneProfileId[];
}
