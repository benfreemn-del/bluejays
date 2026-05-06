/**
 * Olympic Inspections & Testing affiliate starter seed list.
 *
 * Pre-researched targets to get the inspector-affiliate pipeline off
 * zero. Four channels, all Olympic Peninsula / Pacific NW since OIT
 * is a local service business and only takes referrals from the
 * geographic area they serve.
 *
 * Channels:
 *   realtor      — biggest channel, ~70% of inspector referrals
 *   insurance    — agents who write policies on older homes
 *   remediation  — mold remediation companies (we don't compete)
 *   restoration  — water/fire damage restoration (often the FIRST
 *                  contact after a leak; they refer for testing)
 *
 * To bulk-seed:
 *   POST /api/client-affiliates/seed?client=olympic-inspections
 *
 * Idempotent — skips inserts where (client_slug, lower(org_name))
 * already exists. Safe to re-run after editing this file.
 *
 * Note on data quality: this is a STARTER list. Email/phone are
 * intentionally NULL for most rows — Ben fills them in case-by-case
 * before contacting (or the owner researches before reaching out).
 */

import type {
  AffiliateChannel,
  ClientAffiliate,
} from "../client-affiliates";

export type AffiliateSeed = Pick<ClientAffiliate, "org_name"> &
  Partial<
    Pick<
      ClientAffiliate,
      | "contact_name"
      | "role"
      | "email"
      | "website"
      | "city"
      | "state"
      | "region"
      | "channel"
      | "notes"
    >
  >;

/* ──────────────── REAL ESTATE BROKERAGES (Olympic Peninsula) ──────────────── */

const REALTORS: AffiliateSeed[] = [
  {
    org_name: "Windermere Real Estate / Sequim-East",
    role: "Designated Broker",
    website: "windermeresequim.com",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "realtor" as AffiliateChannel,
    notes: "Largest brokerage in Sequim. Top priority — many older-home transactions need mold testing.",
  },
  {
    org_name: "John L. Scott Sequim",
    role: "Branch Broker",
    website: "johnlscott.com",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "realtor" as AffiliateChannel,
    notes: "Major regional brand. Buyer's agents are biggest referral source.",
  },
  {
    org_name: "Coldwell Banker Uptown Realty",
    role: "Broker / Owner",
    website: "uptownrealtyonline.com",
    city: "Port Angeles",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "realtor" as AffiliateChannel,
    notes: "Port Angeles + west peninsula coverage.",
  },
  {
    org_name: "RE/MAX Olympic",
    role: "Designated Broker",
    website: "remaxolympic.com",
    city: "Port Angeles",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "realtor" as AffiliateChannel,
    notes: "Strong agent count, mix of buyer + listing.",
  },
  {
    org_name: "Better Properties Real Estate",
    role: "Branch Manager",
    website: "betterpropertiespa.com",
    city: "Port Townsend",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "realtor" as AffiliateChannel,
    notes: "Port Townsend historic-home specialty — older homes = mold-test demand.",
  },
  {
    org_name: "Town & Country Real Estate",
    role: "Broker",
    city: "Port Townsend",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "realtor" as AffiliateChannel,
    notes: "Local indie. Often handles century-home sales.",
  },
  {
    org_name: "Forks Real Estate",
    role: "Owner",
    city: "Forks",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "realtor" as AffiliateChannel,
    notes: "West-end coverage. High-rainfall zone = mold-test demand on older homes.",
  },
  {
    org_name: "Realty Hub - Hadlock office",
    role: "Broker",
    city: "Port Hadlock",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "realtor" as AffiliateChannel,
    notes: "Hadlock + Chimacum coverage.",
  },
  {
    org_name: "Olympic Sotheby's International Realty",
    role: "Designated Broker",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "realtor" as AffiliateChannel,
    notes: "Higher-end / luxury market. Mold testing is standard expectation.",
  },
  {
    org_name: "Keller Williams - Olympic Peninsula",
    role: "Team Leader",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "realtor" as AffiliateChannel,
    notes: "Large agent count. Try the team leader for a network-wide intro.",
  },
];

/* ──────────────── INSURANCE AGENTS (write policies on older PNW homes) ──────────────── */

const INSURANCE: AffiliateSeed[] = [
  {
    org_name: "State Farm - Sequim Agency",
    role: "Agent",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "insurance" as AffiliateChannel,
    notes: "State Farm requires mold inspection before underwriting older homes with water-damage history.",
  },
  {
    org_name: "Allstate - Port Angeles",
    role: "Agent",
    city: "Port Angeles",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "insurance" as AffiliateChannel,
    notes: "Allstate is conservative on mold-history homes — refers out for clearance testing.",
  },
  {
    org_name: "Farmers Insurance - Olympic Peninsula",
    role: "Agent",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "insurance" as AffiliateChannel,
    notes: "Farmers writes a lot of secondary-home policies on PNW vacation homes.",
  },
  {
    org_name: "Liberty Mutual - PNW",
    role: "Independent agent",
    city: "Port Townsend",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "insurance" as AffiliateChannel,
    notes: "Multi-carrier independent shop. Refers tested-properties for non-standard underwriting.",
  },
  {
    org_name: "Country Financial - Sequim",
    role: "Agent",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "insurance" as AffiliateChannel,
    notes: "Country Financial heavy in rural Olympic Peninsula. Active mold-claim referrals.",
  },
  {
    org_name: "American Family Insurance - Port Angeles",
    role: "Agent",
    city: "Port Angeles",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "insurance" as AffiliateChannel,
  },
  {
    org_name: "Travelers Insurance - independent broker",
    role: "Broker",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "insurance" as AffiliateChannel,
    notes: "High-net-worth specialty — luxury Olympic homes.",
  },
  {
    org_name: "USAA - Pacific NW field representative",
    role: "Field rep",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "insurance" as AffiliateChannel,
    notes: "USAA serves military / veteran homeowners — JBLM proximity = warm market.",
  },
];

/* ──────────────── REMEDIATION COMPANIES (don't compete with us) ──────────────── */

const REMEDIATION: AffiliateSeed[] = [
  {
    org_name: "Servpro of Clallam & Jefferson Counties",
    role: "Owner",
    website: "servpro.com",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "remediation" as AffiliateChannel,
    notes: "Servpro is THE big player. They never test their own work — perfect referral partner. Mutual: we test, they remediate.",
  },
  {
    org_name: "PuroClean - Olympic Peninsula",
    role: "Owner",
    city: "Port Angeles",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "remediation" as AffiliateChannel,
    notes: "Independent franchisee. Builds mutual-referral relationships easily.",
  },
  {
    org_name: "Belfor Property Restoration",
    role: "Branch Manager",
    city: "Bremerton",
    state: "WA",
    region: "Pacific NW",
    channel: "remediation" as AffiliateChannel,
    notes: "Major regional player. Worth a relationship even though Bremerton isn't direct service area.",
  },
  {
    org_name: "Olympic Mold Remediation",
    role: "Owner",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "remediation" as AffiliateChannel,
    notes: "Local independent — most likely to refer to us for objective post-remediation clearance testing.",
  },
];

/* ──────────────── RESTORATION (water/fire damage — first call after leak) ──────────────── */

const RESTORATION: AffiliateSeed[] = [
  {
    org_name: "Rainbow Restoration",
    role: "Operations Manager",
    city: "Port Angeles",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "restoration" as AffiliateChannel,
    notes: "Water + fire damage. They get the first call after a leak — refer for mold testing.",
  },
  {
    org_name: "Servicemaster - Olympic Peninsula",
    role: "Owner",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "restoration" as AffiliateChannel,
    notes: "24-hour emergency restoration. High inbound from insurance carriers.",
  },
  {
    org_name: "AdvantaClean of the Olympic Peninsula",
    role: "Owner",
    city: "Sequim",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "restoration" as AffiliateChannel,
    notes: "Water damage + air quality focus.",
  },
  {
    org_name: "Mountain Restoration",
    role: "Owner",
    city: "Port Townsend",
    state: "WA",
    region: "Olympic Peninsula",
    channel: "restoration" as AffiliateChannel,
    notes: "Local independent. Long history in PT historic homes.",
  },
];

/* ──────────────── EXPORT ──────────────── */

export const OLYMPIC_INSPECTIONS_AFFILIATE_SEEDS: AffiliateSeed[] = [
  ...REALTORS,
  ...INSURANCE,
  ...REMEDIATION,
  ...RESTORATION,
];

export default OLYMPIC_INSPECTIONS_AFFILIATE_SEEDS;
