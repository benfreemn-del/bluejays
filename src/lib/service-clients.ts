/**
 * service-clients.ts — generalized config registry for any tenant
 * BlueJays operates. Originally `inspection-clients.ts` (locked from
 * Olympic Inspections), generalized 2026-05-09 to also cover sports/
 * coaching/manufacturer-style tenants.
 *
 * Every per-tenant string + setting that USED TO BE hardcoded
 * across the codebase now lives here as one ServiceClientConfig
 * entry. Adding a new tenant = registering one config object.
 *
 * The "kind" field disambiguates which Hormozi-style playbook applies:
 *   · "inspection" — service businesses with on-site bookings
 *     (mold, pest, septic, home, asbestos/radon, HVAC, well-water)
 *   · "sports"     — youth/adult sports + coaching organizations
 *     (Zenith / TEKKY-style)
 *   · "manufacturer" — DTC brands shipping physical product
 *     (ITC Quick Attach, Nevarland Outpost)
 *   · "service"    — generic service/consulting (catch-all)
 *
 * Drives:
 *   · Booking-confirmation email body (rendBookingConfirmationEmail)
 *   · Partner-scout cities + queries (sports vs inspection scout)
 *   · SMS gating (per-tenant Twilio number env var)
 *   · Funnel runner merge tags (booking/calculator/partners URLs)
 *   · Portal display labels + audiences
 */

export type ServiceClientKind =
  | "inspection"
  | "sports"
  | "manufacturer"
  | "service";

export type ServiceClientConfig = {
  /** client_slug — must match client_owners.client_slug */
  slug: string;
  /** Which playbook applies (inspection / sports / manufacturer / service) */
  kind: ServiceClientKind;

  /** Pretty business name */
  businessName: string;
  /** Short version for SMS / subject lines */
  businessShortName: string;
  /** Owner first name for salutations */
  ownerFirstName: string;
  /** Owner full title for sign-offs */
  ownerSignature: string;
  /** Reachable phone */
  ownerPhone: string;
  /** Public site origin (no trailing slash) */
  publicSiteUrl: string;
  /** Service area (or "nationwide" for non-geographic businesses) */
  serviceArea: string;
  /** IANA timezone for slot rendering */
  timezone?: string;

  /**
   * Pre-job prep checklist (3-5 lines). Used in booking confirmations.
   * Set to [] for tenants that don't book on-site jobs.
   */
  prepChecklist: string[];

  /**
   * Three audience labels for the funnel.
   *   index 0 = primary end-customer
   *   index 1 = referral partner
   *   index 2 = channel partner
   */
  audiences: [string, string, string];

  /**
   * Affiliate/partner-scout config. Each query runs across every city.
   * Empty array = no scout for this tenant.
   */
  scoutQueries: Array<{
    query: string;
    role: string;
    channel: "outreach" | "refer-out" | "commercial";
  }>;
  /** Cities to scout. Empty = no scout. */
  scoutCities: Array<{ city: string; state: string; region: string }>;

  /** Lab / accreditation / certification language used in funnel + ads */
  accreditation?: string;
  /** Whether SMS sends are enabled (gated on per-tenant Twilio number) */
  smsEnabled?: boolean;
  /** Twilio number env-var name */
  twilioNumberEnvVar?: string;

  /**
   * Calendar / booking-availability surface. true = tenant gets the
   * Calendar tab + CalendarSetupBanner + OAuth Connect for Google
   * Calendar / Calendly / Cal.com. false = no calendar (e-commerce,
   * curriculum-driven, etc.).
   *
   * See `.claude/skills/calendar-availability/SKILL.md`.
   */
  calendarEnabled?: boolean;

  /**
   * Optional tone-profile override for non-commercial tenants
   * (church / recovery / education-nonprofit). Defaults to commercial
   * vocabulary when unset. See src/lib/tone-profiles.ts. Apply at
   * install-time only — not a user-switchable preference.
   */
  toneProfile?: import("./tone-profiles").ToneProfileId;
};

/* ────────────────────── REGISTRY ────────────────────── */

const OLYMPIC_INSPECTIONS: ServiceClientConfig = {
  slug: "olympic-inspections",
  kind: "inspection",
  businessName: "Olympic Inspections & Testing",
  businessShortName: "Olympic Inspections",
  ownerFirstName: "Luke",
  ownerSignature: "Luke\nOlympic Inspections & Testing",
  ownerPhone: "(360) 670-3367",
  publicSiteUrl: "https://www.olympicinspect.com",
  serviceArea: "Olympic Peninsula",
  timezone: "America/Los_Angeles",
  prepChecklist: [
    "Move stuff out of corners and closets you suspect",
    "Make sure attic + crawlspace + utility room are accessible",
    "Have your phone handy — Luke will text on the way",
  ],
  audiences: ["homeowner", "realtor", "insurance"],
  scoutQueries: [
    { query: "real estate agency", role: "realtor", channel: "outreach" },
    { query: "real estate broker", role: "realtor", channel: "outreach" },
    { query: "property management company", role: "property-management", channel: "outreach" },
    { query: "mold remediation contractor", role: "mold-remediation", channel: "refer-out" },
    { query: "water damage restoration", role: "water-damage", channel: "refer-out" },
    // Naturopathic clinics see chronic-illness patients whose symptoms
    // often trace back to indoor air quality (mold, VOCs, water damage).
    // High-trust refer-out partners — their patients are pre-qualified
    // for OIT's lab-grade IAQ testing.
    { query: "naturopathic clinic", role: "naturopathic", channel: "refer-out" },
    { query: "naturopathic doctor", role: "naturopathic", channel: "refer-out" },
    // Functional / integrative / environmental medicine practices —
    // same patient pool as naturopaths but a separate Google Places
    // category so the scout doesn't miss them. ERMI testing is the
    // common lab order from these practices.
    { query: "functional medicine clinic", role: "naturopathic", channel: "refer-out" },
    { query: "integrative medicine clinic", role: "naturopathic", channel: "refer-out" },
    // Well-water service ecosystem — added 2026-05-09 alongside the
    // Well Water Testing service line. Drillers + filtration installers
    // see customers whose water needs testing pre-purchase, after a
    // flood, or post-repair.
    { query: "well drilling contractor", role: "well-services", channel: "refer-out" },
    { query: "water well repair", role: "well-services", channel: "refer-out" },
    { query: "water filtration installer", role: "well-services", channel: "refer-out" },
    // Radon mitigation contractors — added 2026-05-09 alongside the
    // Radon Testing service line. We test, they fix. Two-way refer:
    // their customers need pre/post-mitigation testing, our elevated
    // reads send customers their way.
    { query: "radon mitigation contractor", role: "radon-mitigation", channel: "refer-out" },
    { query: "radon mitigation services", role: "radon-mitigation", channel: "refer-out" },
    // Septic contractors — pumping + repair + design. Pre-purchase
    // septic inspections are required by most lenders, so septic
    // contractors and OIT's pre-purchase septic flow naturally pair.
    { query: "septic pumping company", role: "septic-services", channel: "refer-out" },
    { query: "septic repair contractor", role: "septic-services", channel: "refer-out" },
    { query: "septic system design", role: "septic-services", channel: "refer-out" },
  ],
  scoutCities: [
    { city: "Sequim", state: "WA", region: "Clallam" },
    { city: "Port Angeles", state: "WA", region: "Clallam" },
    { city: "Port Townsend", state: "WA", region: "Jefferson" },
    { city: "Bremerton", state: "WA", region: "Kitsap" },
    { city: "Silverdale", state: "WA", region: "Kitsap" },
    { city: "Forks", state: "WA", region: "Clallam" },
    { city: "Shelton", state: "WA", region: "Mason" },
  ],
  accreditation: "ISO/IEC 17025-accredited lab",
  smsEnabled: false,
  twilioNumberEnvVar: "OIT_TWILIO_NUMBER",
  calendarEnabled: true,
};

const ZENITH_SPORTS: ServiceClientConfig = {
  slug: "zenith-sports",
  kind: "sports",
  businessName: "Zenith Sports / TEKKY",
  businessShortName: "Zenith Sports",
  // Philip is the primary day-to-day voice in customer-facing emails;
  // Paul Hanson is co-founder + legal contract signer. Both have portal
  // access + receive alert fan-out via client_owners.
  ownerFirstName: "Philip",
  ownerSignature: "Philip Lund + Paul Hanson\nZenith Sports / TEKKY",
  ownerPhone: "", // owner uses Zenith Twilio number for outbound
  publicSiteUrl: "https://bluejayportfolio.com/clients/zenith-sports",
  serviceArea: "USA + Canada (soccer-program coverage)",
  timezone: "America/Chicago",
  prepChecklist: [
    "Bring a TEKKY ball (we'll send one if you don't have one yet)",
    "10 minutes of warm-up before drill kickoff",
    "Have your phone handy — drill streams via the Player app",
  ],
  audiences: ["parent", "coach", "player"],
  // Sports-tenant scout finds clubs / coaching organizations / academies
  // / TopSoccer chapters across high-density soccer metros.
  scoutQueries: [
    { query: "youth soccer club", role: "soccer-club", channel: "outreach" },
    { query: "soccer training academy", role: "soccer-academy", channel: "outreach" },
    { query: "youth sports league", role: "youth-league", channel: "outreach" },
    { query: "TopSoccer chapter", role: "topsoccer", channel: "outreach" },
    { query: "soccer coaching certification", role: "certification-org", channel: "refer-out" },
    // Phase 2 (2026-05-10): per docs/mock-backends/mfg-sports-equipment.md
    // the highest-trust affiliate is "coach (paid commission)" — parents
    // buy what coach picks. Add 4 channels we were missing:
    { query: "soccer retail shop", role: "soccer-retail", channel: "refer-out" },
    { query: "private soccer coach", role: "private-coach", channel: "outreach" },
    { query: "soccer camp organizer", role: "camp-organizer", channel: "commercial" },
    { query: "youth athletics non-profit", role: "athletics-nonprofit", channel: "outreach" },
  ],
  // MLS / NWSL host metros — highest soccer density in N. America.
  scoutCities: [
    { city: "Atlanta", state: "GA", region: "Southeast" },
    { city: "Austin", state: "TX", region: "South Central" },
    { city: "Charlotte", state: "NC", region: "Southeast" },
    { city: "Chicago", state: "IL", region: "Midwest" },
    { city: "Cincinnati", state: "OH", region: "Midwest" },
    { city: "Columbus", state: "OH", region: "Midwest" },
    { city: "Dallas", state: "TX", region: "South Central" },
    { city: "Denver", state: "CO", region: "Mountain" },
    { city: "Houston", state: "TX", region: "South Central" },
    { city: "Kansas City", state: "MO", region: "Midwest" },
    { city: "Los Angeles", state: "CA", region: "West Coast" },
    { city: "Miami", state: "FL", region: "Southeast" },
    { city: "Minneapolis", state: "MN", region: "Midwest" },
    { city: "Nashville", state: "TN", region: "Southeast" },
    { city: "New York", state: "NY", region: "Northeast" },
    { city: "Orlando", state: "FL", region: "Southeast" },
    { city: "Philadelphia", state: "PA", region: "Northeast" },
    { city: "Portland", state: "OR", region: "Pacific NW" },
    { city: "Salt Lake City", state: "UT", region: "Mountain" },
    { city: "San Diego", state: "CA", region: "West Coast" },
    { city: "San Jose", state: "CA", region: "West Coast" },
    { city: "Seattle", state: "WA", region: "Pacific NW" },
    { city: "St. Louis", state: "MO", region: "Midwest" },
    { city: "Washington", state: "DC", region: "Northeast" },
  ],
  accreditation: "US Soccer-aligned methodology",
  smsEnabled: true,
  twilioNumberEnvVar: "ZENITH_TWILIO_NUMBER",
  // Soccer drills + camps run on a curriculum, not 1:1 scheduling.
  // Camp signups use client_camps (event catalog), not booking slots.
  calendarEnabled: false,
};

const ITC_QUICK_ATTACH: ServiceClientConfig = {
  slug: "itc-quick-attach",
  kind: "manufacturer",
  businessName: "ITC Quick Attach",
  businessShortName: "ITC",
  ownerFirstName: "Jake",
  ownerSignature: "Jake McCall\nITC Quick Attach",
  ownerPhone: "(315) 245-1212", // Blossvale NY HQ — verify before locking
  publicSiteUrl: "https://bluejayportfolio.com/clients/itc-quick-attach",
  serviceArea: "USA + Canada (DTC + dealer-channel ag accessories)",
  timezone: "America/New_York",
  // Manufacturer = ships product, no on-site jobs. Confirmation emails
  // skip the prep checklist — replaced with order-tracking + dealer-fit
  // notes via the funnel runner.
  prepChecklist: [],
  audiences: ["hobbyist", "forester", "tym"],
  // Scout config locked from docs/mock-backends/mfg-ag-equipment.md.
  // Refer-out partners across the ag ecosystem: dealers, forestry,
  // hunting (firearm-mount cross-niche), trade shows.
  scoutQueries: [
    { query: "tractor dealer", role: "tractor-dealer", channel: "outreach" },
    { query: "compact tractor dealer", role: "tractor-dealer", channel: "outreach" },
    { query: "TYM tractor dealer", role: "tractor-dealer-tym", channel: "outreach" },
    { query: "Kioti tractor dealer", role: "tractor-dealer-kioti", channel: "outreach" },
    { query: "agricultural extension office", role: "extension-office", channel: "refer-out" },
    { query: "forestry equipment supplier", role: "forestry-supplier", channel: "refer-out" },
    { query: "land management services", role: "land-management", channel: "refer-out" },
    { query: "hunting and outdoor supply", role: "hunting-supply", channel: "refer-out" },
    { query: "firearm dealer", role: "firearm-dealer", channel: "refer-out" },
    { query: "tractor implement fabricator", role: "implement-peer", channel: "commercial" },
  ],
  // Rural/agricultural metros across Northeast + Midwest (highest TYM /
  // Kioti / Mahindra / Branson dealer concentration). Scout fanout =
  // 10 queries × 12 cities = 120 lookups per cron run.
  scoutCities: [
    { city: "Blossvale", state: "NY", region: "Northeast" }, // ITC HQ
    { city: "Syracuse", state: "NY", region: "Northeast" },
    { city: "Albany", state: "NY", region: "Northeast" },
    { city: "Lancaster", state: "PA", region: "Northeast" },
    { city: "Columbus", state: "OH", region: "Midwest" },
    { city: "Indianapolis", state: "IN", region: "Midwest" },
    { city: "Lexington", state: "KY", region: "Southeast" },
    { city: "Nashville", state: "TN", region: "Southeast" },
    { city: "Atlanta", state: "GA", region: "Southeast" },
    { city: "Springfield", state: "MO", region: "Midwest" },
    { city: "Madison", state: "WI", region: "Midwest" },
    { city: "Knoxville", state: "TN", region: "Southeast" },
  ],
  accreditation: "Made-in-USA fabrication · Blossvale NY",
  // SMS not enabled until Twilio number provisioned (see audit task).
  smsEnabled: false,
  twilioNumberEnvVar: "ITC_TWILIO_NUMBER",
  // Manufacturer = ships product, no calendar booking flow.
  calendarEnabled: false,
};

/* ───── Hector Landscaping (service tier) ───── */
const HECTOR_LANDSCAPING: ServiceClientConfig = {
  slug: "hector-landscaping",
  kind: "service",
  businessName: "Hector Landscaping",
  businessShortName: "Hector Landscaping",
  ownerFirstName: "Hector",
  ownerSignature: "Hector\nHector Landscaping",
  ownerPhone: "", // TBD — confirm with Hector before any SMS sends
  publicSiteUrl: "https://bluejayportfolio.com/clients/hector-landscaping",
  serviceArea: "regional landscaping service",
  timezone: "America/Los_Angeles",
  prepChecklist: [
    "Mark sprinkler heads + low-voltage cables",
    "Clear access to the back yard / side gate",
    "Have a phone handy — Hector will text on the way",
  ],
  audiences: ["homeowner", "realtor", "insurance"],
  // Scout config from docs/mock-backends/landscaping.md — refer-out
  // partners (realtors / property mgmt / GCs / designers / pool / tree).
  scoutQueries: [
    { query: "real estate agency", role: "realtor", channel: "outreach" },
    { query: "property management company", role: "property-management", channel: "outreach" },
    { query: "general contractor", role: "general-contractor", channel: "refer-out" },
    { query: "interior designer", role: "interior-designer", channel: "refer-out" },
    { query: "pool installer", role: "pool-installer", channel: "refer-out" },
    { query: "tree service company", role: "tree-service", channel: "refer-out" },
  ],
  // Default to PNW until Hector's actual region is confirmed.
  scoutCities: [
    { city: "Sequim", state: "WA", region: "Olympic Peninsula" },
    { city: "Port Angeles", state: "WA", region: "Olympic Peninsula" },
    { city: "Bremerton", state: "WA", region: "Kitsap" },
  ],
  smsEnabled: false,
  twilioNumberEnvVar: "HECTOR_TWILIO_NUMBER",
  calendarEnabled: true,
};

/* ───── KR Ranches (food/bev manufacturer) ───── */
const KR_RANCHES: ServiceClientConfig = {
  slug: "kr-ranches",
  kind: "manufacturer",
  businessName: "KR Ranches",
  businessShortName: "KR Ranches",
  ownerFirstName: "KR",
  ownerSignature: "KR Ranches Team",
  ownerPhone: "", // TBD
  publicSiteUrl: "https://bluejayportfolio.com/sites/kr-ranches/index.html",
  serviceArea: "Prosser WA + DTC nationwide ship",
  timezone: "America/Los_Angeles",
  prepChecklist: [],
  audiences: ["homeowner", "realtor", "insurance"],
  scoutQueries: [
    { query: "specialty food retailer", role: "specialty-retail", channel: "refer-out" },
    { query: "restaurant chef independent", role: "restaurant-buyer", channel: "outreach" },
    { query: "farmers market organizer", role: "market-organizer", channel: "commercial" },
    { query: "subscription box curator", role: "box-curator", channel: "refer-out" },
    { query: "local food co-op", role: "food-coop", channel: "outreach" },
  ],
  scoutCities: [
    { city: "Prosser", state: "WA", region: "Yakima Valley" },
    { city: "Yakima", state: "WA", region: "Yakima Valley" },
    { city: "Tri-Cities", state: "WA", region: "Tri-Cities" },
    { city: "Seattle", state: "WA", region: "Pacific NW" },
    { city: "Spokane", state: "WA", region: "Inland NW" },
    { city: "Portland", state: "OR", region: "Pacific NW" },
  ],
  smsEnabled: false,
  twilioNumberEnvVar: "KR_RANCHES_TWILIO_NUMBER",
  calendarEnabled: false,
};

/* ───── Nevarland Outpost (kids-apparel manufacturer) ───── */
const NEVARLAND_OUTPOST: ServiceClientConfig = {
  slug: "nevarland-outpost",
  kind: "manufacturer",
  businessName: "Nevarland Outpost",
  businessShortName: "Nevarland",
  ownerFirstName: "Christopher",
  ownerSignature: "Christopher\nNevarland Outpost",
  ownerPhone: "", // TBD
  publicSiteUrl: "https://bluejayportfolio.com/clients/nevarland-outpost",
  serviceArea: "USA (Shopify storefront + IG / Etsy / craft-fair retail)",
  timezone: "America/Denver",
  prepChecklist: [],
  audiences: ["homeowner", "realtor", "insurance"],
  scoutQueries: [
    { query: "kids boutique", role: "boutique", channel: "refer-out" },
    { query: "mommy blogger", role: "mom-blogger", channel: "outreach" },
    { query: "craft fair organizer", role: "craft-fair", channel: "commercial" },
    { query: "homeschool co-op", role: "homeschool-coop", channel: "refer-out" },
    { query: "family photographer", role: "family-photo", channel: "refer-out" },
  ],
  scoutCities: [
    { city: "Denver", state: "CO", region: "Mountain" },
    { city: "Colorado Springs", state: "CO", region: "Mountain" },
    { city: "Boulder", state: "CO", region: "Mountain" },
    { city: "Salt Lake City", state: "UT", region: "Mountain" },
    { city: "Boise", state: "ID", region: "Mountain" },
    { city: "Bozeman", state: "MT", region: "Mountain" },
  ],
  smsEnabled: false,
  twilioNumberEnvVar: "NEVARLAND_TWILIO_NUMBER",
  calendarEnabled: false,
};

/* ───── Laser Lakes (specialty-product manufacturer) ───── */
const LASER_LAKES: ServiceClientConfig = {
  slug: "laser-lakes",
  kind: "manufacturer",
  businessName: "Laser Lakes",
  businessShortName: "Laser Lakes",
  ownerFirstName: "Nate",
  ownerSignature: "Nate\nLaser Lakes",
  ownerPhone: "", // TBD
  publicSiteUrl: "https://bluejayportfolio.com/clients/laser-lakes",
  serviceArea: "USA (DTC laser-engraved lake-map art)",
  timezone: "America/Los_Angeles",
  prepChecklist: [],
  audiences: ["homeowner", "realtor", "insurance"],
  scoutQueries: [
    { query: "lake property realtor", role: "lake-realtor", channel: "outreach" },
    { query: "gift shop", role: "gift-shop", channel: "refer-out" },
    { query: "vacation rental property manager", role: "vacation-rental-mgr", channel: "outreach" },
    { query: "wedding planner", role: "wedding-planner", channel: "refer-out" },
    { query: "corporate gifting service", role: "corporate-gift", channel: "commercial" },
  ],
  scoutCities: [
    { city: "Coeur d'Alene", state: "ID", region: "Inland NW" },
    { city: "Lake Tahoe", state: "CA", region: "Sierra" },
    { city: "Minneapolis", state: "MN", region: "Lake Country" },
    { city: "Traverse City", state: "MI", region: "Great Lakes" },
    { city: "Burlington", state: "VT", region: "Northeast Lakes" },
    { city: "Chelan", state: "WA", region: "Pacific NW" },
  ],
  smsEnabled: false,
  twilioNumberEnvVar: "LASER_LAKES_TWILIO_NUMBER",
  calendarEnabled: false,
};

const REGISTRY: Record<string, ServiceClientConfig> = {
  "olympic-inspections": OLYMPIC_INSPECTIONS,
  "zenith-sports": ZENITH_SPORTS,
  "itc-quick-attach": ITC_QUICK_ATTACH,
  "hector-landscaping": HECTOR_LANDSCAPING,
  "kr-ranches": KR_RANCHES,
  "nevarland-outpost": NEVARLAND_OUTPOST,
  "laser-lakes": LASER_LAKES,
};

/**
 * Get the config for any registered service client. Returns null when
 * the slug isn't registered.
 */
export function getServiceClient(
  slug: string,
): ServiceClientConfig | null {
  return REGISTRY[slug] ?? null;
}

/** Every registered slug. */
export function listServiceClients(): ServiceClientConfig[] {
  return Object.values(REGISTRY);
}

/** Filter by kind — used by per-kind crons (sports-partner-scout, etc.) */
export function listServiceClientsByKind(
  kind: ServiceClientKind,
): ServiceClientConfig[] {
  return Object.values(REGISTRY).filter((c) => c.kind === kind);
}

/**
 * Render the booking confirmation email for a confirmed booking. Same
 * shape works across kinds — only the prep checklist + signature
 * differ per tenant.
 */
export function renderBookingConfirmationEmail(args: {
  config: ServiceClientConfig;
  customerFirstName: string;
  slotIso: string | null;
  customerAddress?: string | null;
}): { subject: string; body: string } {
  const { config, customerFirstName, slotIso, customerAddress } = args;
  const slotTxt = slotIso
    ? new Date(slotIso).toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: config.timezone || "America/Los_Angeles",
      })
    : "your scheduled time";

  const labelByKind =
    config.kind === "inspection"
      ? "inspection"
      : config.kind === "sports"
        ? "session"
        : "appointment";

  const lines: string[] = [
    `Hi ${customerFirstName || "there"},`,
    ``,
    `${config.ownerFirstName} from ${config.businessShortName} — your ${labelByKind} is confirmed for:`,
    ``,
    slotTxt,
    customerAddress ? `at ${customerAddress}` : "",
    ``,
    config.prepChecklist.length > 0 ? `What to do beforehand:` : "",
    ...config.prepChecklist.map((line) => `• ${line}`),
    ``,
    config.ownerPhone
      ? `Reply if anything changes. Or call ${config.ownerPhone}.`
      : `Reply if anything changes.`,
    ``,
    `— ${config.ownerSignature}`,
    config.publicSiteUrl.replace(/^https?:\/\//, ""),
  ];
  return {
    subject: `Your ${labelByKind} is confirmed — ${config.businessShortName}`,
    body: lines.filter(Boolean).join("\n"),
  };
}
