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
    { id: "parent", label: "Parents", emoji: "👪", defaultDealUsd: 0 },
    { id: "coach", label: "Coaches", emoji: "🏟️", defaultDealUsd: 0 },
    { id: "player", label: "Players", emoji: "⚽", defaultDealUsd: 0 },
    { id: "club", label: "Clubs", emoji: "🏛️", defaultDealUsd: 0 },
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

const REGISTRY: Record<string, PortalConfig> = {
  "zenith-sports": ZENITH,
  "itc-quick-attach": ITC,
  "olympic-inspections": OIT,
};

/** Returns the per-tenant portal config, or null when the slug isn't
 *  registered. Most call sites should fall back to defaults instead
 *  of throwing — a missing portal config means "this tenant gets the
 *  generic experience." */
export function getPortalConfig(slug: string): PortalConfig | null {
  return REGISTRY[slug] ?? null;
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
