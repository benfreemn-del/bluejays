/**
 * inspection-clients.ts — config registry for service-business
 * tenants that follow the "inspection-style" pattern.
 *
 * The pattern (locked 2026-05-09 from Olympic Inspections & Testing):
 *   · A small-business owner running a service that requires on-site
 *     visits (mold inspection, pest control, septic, home inspection,
 *     asbestos/radon testing, HVAC tune-up, well-water testing, etc.)
 *   · Owner books their own jobs via the public booking form
 *     (client_bookings + client_booking_slots tables)
 *   · 3-audience funnel typical: end-customer / referral-partner /
 *     channel-partner (e.g. homeowner / realtor / insurance)
 *   · Affiliates Map for outreach to refer-out partners + larger
 *     commercial buyers
 *   · Mostly text + email — minimal SMS until carrier reg lands
 *
 * To onboard a new inspection-style client:
 *   1. Add a CONFIG entry here
 *   2. Run /onboard-inspection-client (slash command) which uses
 *      this config to scaffold funnels, creatives, public site, etc.
 *
 * Anything that USED TO BE hardcoded against olympic-inspections
 * should pull from here instead. Adding a new tenant becomes
 * "register the config, run the scaffold" — not "copy 14 files
 * and rename references."
 */

export type InspectionClientConfig = {
  /** client_slug — must match client_owners.client_slug + client_funnels registry */
  slug: string;

  /** Pretty business name — header, footer, email signatures */
  businessName: string;

  /** Short version for SMS / subject lines (e.g. "Olympic Inspections") */
  businessShortName: string;

  /** Owner first name for email salutations + signatures */
  ownerFirstName: string;

  /** Owner full title for email sign-offs (e.g. "Luke · Olympic Inspections") */
  ownerSignature: string;

  /** Reachable phone — printed in confirmations + on-the-way SMS */
  ownerPhone: string;

  /** Public site origin (no trailing slash) */
  publicSiteUrl: string;

  /** Service area description — used in email salutations + funnel copy */
  serviceArea: string;

  /** IANA timezone for slot rendering. Defaults to America/Los_Angeles. */
  timezone?: string;

  /** Pre-job prep checklist (3-5 lines). Rendered in confirmation emails. */
  prepChecklist: string[];

  /**
   * Three audience labels for the funnel. Order matters:
   *   index 0 = primary end-customer (usually default audience)
   *   index 1 = referral partner (usually realtors / brokers / brokers)
   *   index 2 = channel partner (usually insurance / claims / large-loss)
   */
  audiences: [string, string, string];

  /**
   * Affiliate-scout categories + Google Places search queries.
   * Each query runs across every city in `scoutCities`. Idempotent
   * dedupe by (org_name, city). See lib/oit-partner-scout.ts.
   */
  scoutQueries: Array<{
    query: string;
    role: string;
    channel: "outreach" | "refer-out" | "commercial";
  }>;

  /**
   * Cities to scout across. Each gets {city, state, region} for
   * client_affiliates row attribution.
   */
  scoutCities: Array<{ city: string; state: string; region: string }>;

  /**
   * Lab / accreditation language used in funnel emails + ads.
   * (e.g. "ISO/IEC 17025-accredited lab" for OIT, "WSDA-licensed"
   * for pest control, etc.)
   */
  accreditation?: string;

  /**
   * Whether SMS sends are enabled today (gated on per-tenant Twilio
   * number provisioning). When false, runner skips SMS steps with
   * a "skipped: no twilio number" log line.
   */
  smsEnabled?: boolean;

  /** Twilio number env-var name (e.g. "OIT_TWILIO_NUMBER"). */
  twilioNumberEnvVar?: string;
};

/* ────────────────────── REGISTRY ────────────────────── */

const OLYMPIC_INSPECTIONS: InspectionClientConfig = {
  slug: "olympic-inspections",
  businessName: "Olympic Inspections & Testing",
  businessShortName: "Olympic Inspections",
  ownerFirstName: "Luke",
  ownerSignature: "Luke\nOlympic Inspections & Testing",
  ownerPhone: "(360) 670-3367",
  publicSiteUrl: "https://www.olympicinspections.com",
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
    {
      query: "property management company",
      role: "property-management",
      channel: "outreach",
    },
    {
      query: "mold remediation contractor",
      role: "mold-remediation",
      channel: "refer-out",
    },
    {
      query: "water damage restoration",
      role: "water-damage",
      channel: "refer-out",
    },
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
  smsEnabled: false, // pending OIT_TWILIO_NUMBER
  twilioNumberEnvVar: "OIT_TWILIO_NUMBER",
};

const REGISTRY: Record<string, InspectionClientConfig> = {
  "olympic-inspections": OLYMPIC_INSPECTIONS,
};

/**
 * Get the config for an inspection-style client. Returns null when the
 * slug isn't registered — caller should fall back to generic behavior
 * or throw, never silently misroute.
 */
export function getInspectionClient(
  slug: string,
): InspectionClientConfig | null {
  return REGISTRY[slug] ?? null;
}

/** Every registered slug — useful for admin dashboards + cron loops. */
export function listInspectionClients(): InspectionClientConfig[] {
  return Object.values(REGISTRY);
}

/**
 * Render the confirmation email body for a confirmed booking. Uses
 * config-driven copy (owner name, prep checklist, signature) so any
 * inspection-style tenant gets the same email shape with their own
 * branding.
 */
export function renderBookingConfirmationEmail(args: {
  config: InspectionClientConfig;
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

  const lines: string[] = [
    `Hi ${customerFirstName || "there"},`,
    ``,
    `${config.ownerFirstName} from ${config.businessShortName} — your inspection is confirmed for:`,
    ``,
    slotTxt,
    customerAddress ? `at ${customerAddress}` : "",
    ``,
    `What to do beforehand:`,
    ...config.prepChecklist.map((line) => `• ${line}`),
    ``,
    `Reply if anything changes. Or call ${config.ownerPhone}.`,
    ``,
    `— ${config.ownerSignature}`,
    config.publicSiteUrl.replace(/^https?:\/\//, ""),
  ];
  return {
    subject: `Your inspection is confirmed — ${config.businessShortName}`,
    body: lines.filter(Boolean).join("\n"),
  };
}
