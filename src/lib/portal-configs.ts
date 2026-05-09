/**
 * portal-configs.ts — single registry of every per-tenant string,
 * map, and component reference the generic portal page consumes.
 *
 * Was: ~20 `slug === "x"` branches scattered across the 6,467-line
 * src/app/clients/[slug]/portal/page.tsx (each map + each tab gate).
 * Now: each tenant registers ONE PortalConfig object here; the page
 * reads from this registry.
 *
 * Onboarding a new tenant becomes:
 *   1. Add a ServiceClientConfig in service-clients.ts
 *   2. Add a PortalConfig here
 *   3. Clone the slug-specific files (funnels, ad creatives, public site)
 *   4. Done — no more search-and-replace across portal/page.tsx
 *
 * INTENTIONALLY narrow: this only models per-tenant DATA, not per-
 * tenant React components. Map components, spotlight widgets, etc.
 * still live as their own modules and the portal page imports them
 * directly. Keeps the registry lean and tree-shakeable.
 */

export type AudienceMeta = {
  /** Audience id (matches client_leads.audience_segment) */
  id: string;
  /** Display label (plural) */
  label: string;
  /** One-glyph emoji for the audience */
  emoji: string;
  /** Default deal value in USD — drives Pipeline-Value estimation
   *  on the Overview tab when no per-lead deal_value_usd exists. */
  defaultDealUsd: number;
};

export type FunnelStepMeta = {
  day: number;
  channel: "email" | "sms" | "voicemail" | "postcard";
  label: string;
};

export type FunnelDef = {
  segment: string;
  audienceTag: string | null;
  emoji: string;
  title: string;
  pitch: string;
  cardClass: string;
  accentText: string;
  steps: FunnelStepMeta[];
  landingPath: string;
};

export type QuickLink = {
  href: string;
  icon: string;
  label: string;
};

export type SampleLeadPayload = Record<string, unknown> & {
  name: string;
  email: string;
  intent?: string;
  source?: string;
  message?: string;
};

export type PortalConfig = {
  /** Pretty business name shown in the portal header */
  displayName: string;
  /** Audience id whitelist for THIS tenant — drives filter chips */
  audiences: AudienceMeta[];
  /**
   * Source-string keyword sniffs that resolve to an audience emoji
   * when the lead has no audience_segment but has a source field.
   * Empty array = fall back to the unknown emoji.
   */
  audienceSourceKeywords: Array<{
    audienceId: string;
    keywords: string[];
  }>;
  /** Whether to opt this tenant into the per-audience pipeline-value
   *  default-deal-USD calc. False = use only real deal_value_usd. */
  pipelineValueOptIn: boolean;
  /** Demo-lead button payload (one-click "watch the system fire" demo) */
  sampleLead?: SampleLeadPayload;
  /** Tab visibility flags */
  tabs: {
    aiSkills: boolean;
    ads: boolean;
    funnels: boolean;
    map: boolean;
    customers: boolean;
    /** Per-tenant /admin route exists? (e.g. /clients/SLUG/admin) */
    adminLinkInOverview: boolean;
  };
  /** Funnel cards rendered on the Funnels tab */
  funnels: FunnelDef[];
  /** Overview "Quick links" rail tiles */
  quickLinks: QuickLink[];
};

/* ────────────────────── REGISTRY ────────────────────── */

const ZENITH: PortalConfig = {
  displayName: "Zenith Sports",
  audiences: [
    // Labels renamed 2026-05-10 to describe the buyer-CHANNEL each
    // org unlocks rather than the org itself. The scout returns clubs +
    // rec leagues + academies; the audience tag tells you who the END
    // BUYER is downstream. See docs/clients/zenith-sports/brand-voice.md.
    { id: "parent", label: "Family rec", emoji: "👪", defaultDealUsd: 0 },
    { id: "coach", label: "Coach / pro", emoji: "🏟️", defaultDealUsd: 0 },
    { id: "player", label: "Elite / academy", emoji: "⚽", defaultDealUsd: 0 },
    { id: "club", label: "Competitive club", emoji: "🏛️", defaultDealUsd: 0 },
  ],
  audienceSourceKeywords: [
    { audienceId: "parent", keywords: ["parent"] },
    { audienceId: "coach", keywords: ["coach"] },
    { audienceId: "player", keywords: ["player"] },
    { audienceId: "club", keywords: ["club"] },
  ],
  pipelineValueOptIn: false,
  sampleLead: {
    name: "Live Demo · Soccer Parent (auto-generated)",
    email: `demo-live-${Date.now()}@zenithsports.example`,
    intent: "Camp Finder",
    source: "email-capture",
    message: "Looking for a TEKKY ball + summer camp options for my U10 player.",
    role: "parent",
  },
  tabs: {
    aiSkills: true,
    ads: true,
    funnels: true,
    map: true,
    customers: false,
    adminLinkInOverview: false,
  },
  // Funnels live in src/app/clients/[slug]/portal/page.tsx FUNNELS_BY_SLUG
  // — leaving as [] here means the page renders from its inline registry.
  // Phase 2: migrate the inline FUNNELS_BY_SLUG into this field.
  funnels: [],
  quickLinks: [
    { href: `/clients/zenith-sports`, icon: "🌐", label: "Your site" },
    { href: `/clients/zenith-sports/build-your-player`, icon: "🎮", label: "Build Your Player" },
    { href: `/clients/zenith-sports/training-guide`, icon: "📘", label: "Coach guide" },
    { href: `/clients/zenith-sports/shop`, icon: "🛒", label: "Shop" },
  ],
};

const ITC: PortalConfig = {
  displayName: "ITC Quick Attach",
  audiences: [
    { id: "hobbyist", label: "Hobbyists", emoji: "🚜", defaultDealUsd: 250 },
    { id: "forester", label: "Foresters", emoji: "🌲", defaultDealUsd: 600 },
    { id: "tym", label: "TYM owners", emoji: "⚙️", defaultDealUsd: 400 },
    { id: "hunter", label: "Hunters", emoji: "🦌", defaultDealUsd: 350 },
    { id: "dealer", label: "Dealers", emoji: "🤝", defaultDealUsd: 3600 },
    { id: "community", label: "Community", emoji: "🏆", defaultDealUsd: 100 },
  ],
  audienceSourceKeywords: [
    { audienceId: "tym", keywords: ["tym"] },
    { audienceId: "hobbyist", keywords: ["hobbyist"] },
    { audienceId: "forester", keywords: ["forester"] },
    { audienceId: "hunter", keywords: ["hunter"] },
    { audienceId: "dealer", keywords: ["dealer"] },
    { audienceId: "community", keywords: ["community"] },
  ],
  pipelineValueOptIn: true,
  sampleLead: {
    name: "Live Demo · Forester (auto-generated)",
    email: `demo-live-${Date.now()}@itcquickattach.example`,
    intent: "SawBoss + Chainbox quote for 2-acre clearing job",
    source: "lp-forester",
    lp: "forester",
    message: "Running a Kioti CK2610. Saw won't stay put on the bar in transit. Need the SawBoss + Chainbox combo.",
    acreage: "2",
  },
  tabs: {
    aiSkills: true,
    ads: true,
    funnels: true,
    map: true,
    customers: false,
    adminLinkInOverview: false,
  },
  funnels: [],
  quickLinks: [
    { href: `/clients/itc-quick-attach/lp/dream-tractor`, icon: "🚜", label: "Dream tractor" },
    { href: `/clients/itc-quick-attach/lp/tym`, icon: "⚙️", label: "TYM owners" },
    { href: `/clients/itc-quick-attach/lp/dealer`, icon: "🤝", label: "Dealer ROI" },
    { href: "https://itcquickattach.com", icon: "🛒", label: "ITC shop" },
  ],
};

const OIT: PortalConfig = {
  displayName: "Olympic Inspections & Testing",
  audiences: [
    { id: "homeowner", label: "Homeowners", emoji: "🏠", defaultDealUsd: 350 },
    { id: "realtor", label: "Real-estate agents", emoji: "🪧", defaultDealUsd: 250 },
    { id: "insurance", label: "Insurance", emoji: "🛡️", defaultDealUsd: 500 },
  ],
  audienceSourceKeywords: [
    { audienceId: "homeowner", keywords: ["homeowner", "owner"] },
    { audienceId: "realtor", keywords: ["realtor", "agent", "broker", "listing"] },
    { audienceId: "insurance", keywords: ["insurance", "claim", "adjuster"] },
  ],
  pipelineValueOptIn: true,
  sampleLead: {
    name: "Live Demo · Homeowner (auto-generated)",
    email: `demo-live-${Date.now()}@olympicinspections.example`,
    intent: "mold-inspection-booking",
    source: "booking-form",
    message: "1,800 sqft single-story in Sequim — smelled mold in the crawlspace. Need a real-estate-ready report before listing.",
    audience: "homeowner",
    propertySize: "1500to3000",
  },
  tabs: {
    aiSkills: true,
    ads: true,
    funnels: true,
    map: true,
    customers: false,
    adminLinkInOverview: true,
  },
  funnels: [],
  quickLinks: [
    { href: `/clients/olympic-inspections/admin`, icon: "🛠", label: "Booking admin" },
    { href: "/sites/olympic-inspections/index.html", icon: "🌐", label: "Public site" },
    { href: "/sites/olympic-inspections/index.html#book", icon: "📅", label: "Booking page" },
    { href: "/sites/olympic-inspections/index.html#calculator", icon: "💲", label: "Cost calculator" },
  ],
};

/* ─────── Static-site / showcase tenants (audit D4 backfill) ───────
 * The 6 active tenants below have client_owners rows but no funnel
 * automation today — they're static-site or showcase-only. Registering
 * them here gives the portal stack proper display names + tab-flag
 * defaults instead of falling through to "Your site"-only generic
 * rendering. Each: displayName, no audiences, all advanced tabs off,
 * one or two quick links to the most useful surfaces. */

const HECTOR_LANDSCAPING: PortalConfig = {
  displayName: "Hector Landscaping",
  audiences: [],
  audienceSourceKeywords: [],
  pipelineValueOptIn: false,
  tabs: {
    aiSkills: false,
    ads: false,
    funnels: false,
    map: false,
    customers: false,
    adminLinkInOverview: false,
  },
  funnels: [],
  quickLinks: [
    { href: "/clients/hector-landscaping", icon: "🌐", label: "Your site" },
  ],
};

const LEWIS_COUNTY_AUTISM: PortalConfig = {
  displayName: "Lewis County Autism Coalition",
  audiences: [],
  audienceSourceKeywords: [],
  pipelineValueOptIn: false,
  tabs: {
    aiSkills: false,
    ads: false,
    funnels: false,
    map: false,
    customers: false,
    adminLinkInOverview: false,
  },
  funnels: [],
  quickLinks: [
    { href: "/sites/lcac/index.html", icon: "🌐", label: "Public site" },
  ],
};

const MT_VIEW_LANDSCAPING: PortalConfig = {
  displayName: "Mountain View Landscape",
  audiences: [],
  audienceSourceKeywords: [],
  pipelineValueOptIn: false,
  tabs: {
    aiSkills: false,
    ads: false,
    funnels: false,
    map: false,
    customers: false,
    adminLinkInOverview: false,
  },
  funnels: [],
  quickLinks: [
    { href: "/clients/mt-view-landscaping", icon: "🌐", label: "Your site" },
  ],
};

const LASER_LAKES: PortalConfig = {
  displayName: "Laser Lakes",
  audiences: [],
  audienceSourceKeywords: [],
  pipelineValueOptIn: false,
  tabs: {
    aiSkills: false,
    ads: false,
    funnels: false,
    map: false,
    customers: true, // Laser Lakes is the one tenant that uses Customers tab today
    adminLinkInOverview: false,
  },
  funnels: [],
  quickLinks: [
    { href: "/clients/laser-lakes", icon: "🌐", label: "Your site" },
  ],
};

const KR_RANCHES: PortalConfig = {
  displayName: "KR Ranches",
  audiences: [],
  audienceSourceKeywords: [],
  pipelineValueOptIn: false,
  tabs: {
    aiSkills: false,
    ads: false,
    funnels: false,
    map: false,
    customers: false,
    adminLinkInOverview: false,
  },
  funnels: [],
  quickLinks: [
    { href: "/clients/kr-ranches", icon: "🌐", label: "Your site" },
  ],
};

const NEVARLAND_OUTPOST: PortalConfig = {
  displayName: "Nevarland Outpost",
  audiences: [],
  audienceSourceKeywords: [],
  pipelineValueOptIn: false,
  tabs: {
    aiSkills: false,
    ads: false,
    funnels: false,
    map: false,
    customers: false,
    adminLinkInOverview: false,
  },
  funnels: [],
  quickLinks: [
    { href: "/clients/nevarland-outpost", icon: "🌐", label: "Your site" },
    {
      href: "https://nevarlandoutpost.com",
      icon: "🛒",
      label: "Shopify shop",
    },
  ],
};

const REGISTRY: Record<string, PortalConfig> = {
  // AI-Package tier (full audience funnels + ads + AI skills + map)
  "zenith-sports": ZENITH,
  "itc-quick-attach": ITC,
  "olympic-inspections": OIT,
  // Static-site / showcase tier — display name + tab-flag defaults
  "hector-landscaping": HECTOR_LANDSCAPING,
  "lewis-county-autism": LEWIS_COUNTY_AUTISM,
  "mt-view-landscaping": MT_VIEW_LANDSCAPING,
  "laser-lakes": LASER_LAKES,
  "kr-ranches": KR_RANCHES,
  "nevarland-outpost": NEVARLAND_OUTPOST,
};

/** Returns the per-tenant portal config, or null when the slug isn't
 *  registered. Most call sites should fall back to defaults instead
 *  of throwing — a missing portal config means "this tenant gets the
 *  generic experience." */
export function getPortalConfig(slug: string): PortalConfig | null {
  return REGISTRY[slug] ?? null;
}

/** Returns every registered tenant's `{slug, displayName}` in stable
 *  insertion order (AI-Package tier first, then static-site tier). Used
 *  by /spending's per-client filter dropdown so adding a new tenant to
 *  the registry automatically extends every cross-tenant UI. */
export function listAllPortalSlugs(): Array<{ slug: string; displayName: string }> {
  return Object.entries(REGISTRY).map(([slug, cfg]) => ({
    slug,
    displayName: cfg.displayName,
  }));
}

/** Convenience: get the audience-emoji map for a tenant (used by
 *  AudienceTab + LeadsTab). */
export function audienceEmojiMap(slug: string): Record<string, string> {
  const cfg = getPortalConfig(slug);
  if (!cfg) return {};
  return Object.fromEntries(cfg.audiences.map((a) => [a.id, a.emoji]));
}

/** Convenience: get the default-deal-USD map (used by pipeline-value calc). */
export function audienceDealUsdMap(slug: string): Record<string, number> {
  const cfg = getPortalConfig(slug);
  if (!cfg) return {};
  return Object.fromEntries(cfg.audiences.map((a) => [a.id, a.defaultDealUsd]));
}

/* ────────────────────── AGGREGATION HELPERS ──────────────────────
 * Audit D2: portal/page.tsx had 8 inline registries (SLUG_DISPLAY_NAME,
 * AUDIENCE_EMOJI, etc.) duplicating the data already modeled here.
 * These helpers read from THIS registry first so adding a tenant is
 * one config-entry edit instead of editing 8 maps in the portal page.
 *
 * Helpers fall back to a global lookup across ALL registered tenants
 * when only an audience id is known (no slug context) — keeps the
 * historical AUDIENCE_EMOJI[id] / AUDIENCE_LABEL_PLAIN[id] usage working
 * as the inline maps get retired. */

const ALL_AUDIENCES_INDEX = (() => {
  const m = new Map<string, AudienceMeta>();
  for (const cfg of Object.values(REGISTRY)) {
    for (const a of cfg.audiences) {
      // First tenant to register an audience id wins. (No conflicts
      // today: parent/coach/player are zenith-only, hobbyist/forester/
      // tym/hunter/dealer/community are itc-only, homeowner/realtor/
      // insurance are oit-only.)
      if (!m.has(a.id)) m.set(a.id, a);
    }
  }
  return m;
})();

/**
 * Get the audience emoji. When `slug` is provided, looks at that
 * tenant's audiences first; otherwise falls back to the global
 * cross-tenant index.
 */
export function audienceEmojiFor(
  audienceId: string | null | undefined,
  slug?: string,
): string {
  if (!audienceId) return "📥";
  if (slug) {
    const cfg = getPortalConfig(slug);
    const local = cfg?.audiences.find((a) => a.id === audienceId);
    if (local) return local.emoji;
  }
  return ALL_AUDIENCES_INDEX.get(audienceId)?.emoji ?? "📥";
}

/** Same shape, label instead of emoji. */
export function audienceLabelFor(
  audienceId: string | null | undefined,
  slug?: string,
): string {
  if (!audienceId) return "Unknown";
  if (slug) {
    const cfg = getPortalConfig(slug);
    const local = cfg?.audiences.find((a) => a.id === audienceId);
    if (local) return local.label;
  }
  return ALL_AUDIENCES_INDEX.get(audienceId)?.label ?? audienceId;
}

/** Default-deal-USD for a (slug, audience) pair. Used by
 *  estimatePipelineValueUsd in portal/page.tsx. */
export function audienceDefaultDealFor(
  audienceId: string,
  slug?: string,
): number {
  if (slug) {
    const cfg = getPortalConfig(slug);
    const local = cfg?.audiences.find((a) => a.id === audienceId);
    if (local) return local.defaultDealUsd;
  }
  return ALL_AUDIENCES_INDEX.get(audienceId)?.defaultDealUsd ?? 0;
}

/** Audience ids whitelist for the slug (used by LeadContextEditor +
 *  Leads-tab filter chips). Falls back to ["unknown"] when slug
 *  isn't registered — same shape as the legacy AUDIENCE_OPTIONS_BY_SLUG
 *  default. */
export function audienceOptionsFor(slug: string): string[] {
  const cfg = getPortalConfig(slug);
  if (!cfg) return ["unknown"];
  return cfg.audiences.map((a) => a.id);
}

/** Pretty business name for a slug. Falls back to humanized slug. */
export function displayNameFor(slug: string): string {
  return (
    getPortalConfig(slug)?.displayName ??
    slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ")
  );
}

/** Sample-lead payload for the demo button. Returns null when slug
 *  isn't registered — caller falls back to a generic stub. */
export function sampleLeadFor(slug: string): SampleLeadPayload | null {
  return getPortalConfig(slug)?.sampleLead ?? null;
}

/** Quick-links rail tiles for the slug. Falls back to a single "site"
 *  link when no per-tenant config exists. */
export function quickLinksFor(slug: string): QuickLink[] {
  return (
    getPortalConfig(slug)?.quickLinks ?? [
      { href: `/clients/${slug}`, icon: "🌐", label: "Your site" },
    ]
  );
}

/** Opt-in flag for per-audience-default pipeline-value fallback. */
export function pipelineValueOptInFor(slug: string): boolean {
  return getPortalConfig(slug)?.pipelineValueOptIn ?? false;
}
