/**
 * Zenith Sports affiliate starter seed list.
 *
 * Pre-researched targets to get the affiliate pipeline off zero. Each
 * row is a publicly-known club / coaching outfit / media presence in
 * the youth-soccer space — heavily weighted to Pacific NW (warm geo
 * for Zenith) and ECNL/MLS Next nationally.
 *
 * To bulk-seed the database:
 *   POST /api/client-affiliates/seed?client=zenith-sports
 *
 * Idempotent — skips inserts where (client_slug, lower(org_name))
 * already exists. Safe to re-run after editing this file.
 *
 * Ben/Philip can edit this file and re-seed any time. Status defaults
 * to "cold"; the dashboard's pipeline UI handles the rest.
 *
 * Note on data quality: this is a STARTER list, not exhaustive. Email
 * + phone are intentionally NULL for most rows so Ben (or a future
 * scraping job) fills them in case-by-case before contacting.
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

/* ─────────── Pacific NW clubs (Zenith's warm-intro territory) ─────────── */

const PACIFIC_NW_CLUBS: AffiliateSeed[] = [
  {
    org_name: "Crossfire Premier",
    role: "Director of Coaching",
    website: "crossfirepremier.com",
    city: "Sammamish",
    state: "WA",
    region: "Pacific NW",
    channel: "club" as AffiliateChannel,
    notes: "ECNL boys + girls. Largest WA youth program. Warm-intro target #1.",
  },
  {
    org_name: "Eastside FC",
    role: "Technical Director",
    website: "eastsidefc.org",
    city: "Bellevue",
    state: "WA",
    region: "Pacific NW",
    channel: "club" as AffiliateChannel,
    notes: "ECNL girls. Strong technical reputation.",
  },
  {
    org_name: "Washington Premier FC",
    role: "DOC",
    website: "washingtonpremier.com",
    city: "Puyallup",
    state: "WA",
    region: "Pacific NW",
    channel: "club" as AffiliateChannel,
    notes: "ECNL + MLS Next.",
  },
  {
    org_name: "Seattle United",
    role: "Director of Coaching",
    website: "seattleunited.com",
    city: "Seattle",
    state: "WA",
    region: "Pacific NW",
    channel: "club" as AffiliateChannel,
    notes: "ECNL girls + boys. Top Seattle metro program.",
  },
  {
    org_name: "Snohomish United",
    role: "Director of Coaching",
    website: "snohomishunited.org",
    city: "Snohomish",
    state: "WA",
    region: "Pacific NW",
    channel: "club" as AffiliateChannel,
  },
  {
    org_name: "Pacific Soccer FC",
    website: "pacificsoccerfc.org",
    city: "Olympia",
    state: "WA",
    region: "Pacific NW",
    channel: "club" as AffiliateChannel,
  },
  {
    org_name: "Westside Timbers",
    role: "Director of Coaching",
    website: "westsidetimbers.com",
    city: "Beaverton",
    state: "OR",
    region: "Pacific NW",
    channel: "club" as AffiliateChannel,
    notes: "ECNL + MLS Next (Portland-area).",
  },
  {
    org_name: "FC Portland Academy",
    website: "fcportlandacademy.com",
    city: "Portland",
    state: "OR",
    region: "Pacific NW",
    channel: "club" as AffiliateChannel,
  },
  {
    org_name: "Lake Oswego SC",
    website: "lakeoswegosc.org",
    city: "Lake Oswego",
    state: "OR",
    region: "Pacific NW",
    channel: "club" as AffiliateChannel,
  },
  {
    org_name: "Sunset Soccer Club",
    website: "sunsetsoccer.org",
    city: "Beaverton",
    state: "OR",
    region: "Pacific NW",
    channel: "club" as AffiliateChannel,
  },
  {
    org_name: "Idaho Rush",
    website: "idahorush.com",
    city: "Boise",
    state: "ID",
    region: "Pacific NW",
    channel: "club" as AffiliateChannel,
  },
];

/* ─────────── National ECNL + MLS Next clubs ─────────── */

const NATIONAL_CLUBS: AffiliateSeed[] = [
  // California
  {
    org_name: "Slammers FC",
    website: "slammersfc.com",
    city: "Newport Beach",
    state: "CA",
    region: "West",
    channel: "club" as AffiliateChannel,
    notes: "ECNL girls — historically strong technical program.",
  },
  {
    org_name: "LA Galaxy Academy",
    website: "lagalaxyacademy.com",
    city: "Carson",
    state: "CA",
    region: "West",
    channel: "club" as AffiliateChannel,
    notes: "MLS Next academy — high-bar contact but worth the swing.",
  },
  {
    org_name: "Pateadores",
    website: "pateadores.com",
    city: "Mission Viejo",
    state: "CA",
    region: "West",
    channel: "club" as AffiliateChannel,
  },
  {
    org_name: "San Juan SC",
    website: "sanjuansoccer.com",
    city: "Sacramento",
    state: "CA",
    region: "West",
    channel: "club" as AffiliateChannel,
  },
  // Arizona / Nevada / Mountain
  {
    org_name: "Real Salt Lake Academy",
    website: "rslacademy.com",
    city: "Herriman",
    state: "UT",
    region: "Mountain",
    channel: "club" as AffiliateChannel,
    notes: "MLS Next.",
  },
  {
    org_name: "Sereno Soccer Club",
    website: "serenosoccer.org",
    city: "Phoenix",
    state: "AZ",
    region: "West",
    channel: "club" as AffiliateChannel,
  },
  // Texas
  {
    org_name: "Solar SC",
    website: "solarsoccer.com",
    city: "Plano",
    state: "TX",
    region: "South",
    channel: "club" as AffiliateChannel,
    notes: "ECNL boys + girls. Texas heavyweight.",
  },
  {
    org_name: "FC Dallas Academy",
    website: "fcdallasyouth.com",
    city: "Frisco",
    state: "TX",
    region: "South",
    channel: "club" as AffiliateChannel,
    notes: "MLS Next.",
  },
  {
    org_name: "Houston Dynamo Academy",
    website: "houstondynamofc.com",
    city: "Houston",
    state: "TX",
    region: "South",
    channel: "club" as AffiliateChannel,
    notes: "MLS Next.",
  },
  // Northeast
  {
    org_name: "PDA (Players Development Academy)",
    website: "pdasoccer.com",
    city: "Zarephath",
    state: "NJ",
    region: "Northeast",
    channel: "club" as AffiliateChannel,
    notes: "ECNL flagship Northeast — historically dominant.",
  },
  {
    org_name: "NEFC (New England FC)",
    website: "nefc.org",
    city: "Bedford",
    state: "MA",
    region: "Northeast",
    channel: "club" as AffiliateChannel,
  },
  {
    org_name: "Beachside SC",
    website: "beachsidesc.com",
    city: "Norwalk",
    state: "CT",
    region: "Northeast",
    channel: "club" as AffiliateChannel,
  },
  // Midwest
  {
    org_name: "Sockers FC",
    website: "sockersfc.com",
    city: "Palatine",
    state: "IL",
    region: "Midwest",
    channel: "club" as AffiliateChannel,
  },
  {
    org_name: "Vardar SC",
    website: "vardarsc.com",
    city: "Bloomfield Hills",
    state: "MI",
    region: "Midwest",
    channel: "club" as AffiliateChannel,
    notes: "ECNL boys + girls.",
  },
  {
    org_name: "St. Louis Scott Gallagher",
    website: "stlsg.com",
    city: "St. Louis",
    state: "MO",
    region: "Midwest",
    channel: "club" as AffiliateChannel,
  },
  // Southeast
  {
    org_name: "NCFC Youth (North Carolina FC)",
    website: "ncfcyouth.com",
    city: "Cary",
    state: "NC",
    region: "South",
    channel: "club" as AffiliateChannel,
  },
  {
    org_name: "Concorde Fire",
    website: "concordefire.com",
    city: "Atlanta",
    state: "GA",
    region: "South",
    channel: "club" as AffiliateChannel,
  },
];

/* ─────────── Coaches + influencers ─────────── */

const COACHES_INFLUENCERS: AffiliateSeed[] = [
  {
    org_name: "Coerver Coaching USA",
    role: "Regional Director",
    website: "coerver.com",
    region: "West",
    channel: "coach" as AffiliateChannel,
    notes:
      "Coerver Coaching is the big-name technical-development methodology in the US. Massive coach network — high-leverage affiliate channel.",
  },
  {
    org_name: "Beast Mode Soccer",
    role: "Founder",
    website: "beastmodesoccer.com",
    region: "West",
    channel: "influencer" as AffiliateChannel,
    notes: "Liam Hayward. Big YouTube + IG following in skills/training space.",
  },
  {
    org_name: "AKT Academy",
    role: "Founder",
    website: "akt-academy.com",
    region: "Northeast",
    channel: "coach" as AffiliateChannel,
    notes: "Andrea Pirlo–style technical training brand.",
  },
  {
    org_name: "F2 Freestylers",
    role: "Manager",
    website: "thef2.com",
    channel: "influencer" as AffiliateChannel,
    notes: "Massive freestyle/skills reach — dream collab if budget permits.",
  },
  {
    org_name: "Thogden Soccer",
    role: "Manager",
    website: "thogden.com",
    channel: "influencer" as AffiliateChannel,
    notes: "UK-based freestyle/training content.",
  },
  {
    org_name: "Allister Coaching",
    role: "Founder",
    channel: "coach" as AffiliateChannel,
    notes: "US-based youth-soccer coach with growing IG presence.",
  },
];

/* ─────────── Podcasts + media ─────────── */

const PODCASTS_MEDIA: AffiliateSeed[] = [
  {
    org_name: "The Coaching Manual Podcast",
    website: "thecoachingmanual.com",
    region: "Northeast",
    channel: "podcast" as AffiliateChannel,
    notes: "B2B coach-focused podcast. Methodology angle = great fit.",
  },
  {
    org_name: "Why Soccer Matters",
    website: "whysoccermatters.org",
    channel: "podcast" as AffiliateChannel,
    notes: "Long-form youth-soccer development content.",
  },
  {
    org_name: "Top Drawer Soccer",
    website: "topdrawersoccer.com",
    channel: "media" as AffiliateChannel,
    notes:
      "ECNL/college-recruit media authority. Story angle on US technical development gap = good editorial fit.",
  },
  {
    org_name: "Soccer Wire",
    website: "soccerwire.com",
    channel: "media" as AffiliateChannel,
    notes: "Youth-soccer industry news — receptive to founder stories.",
  },
  {
    org_name: "American Soccer Network",
    website: "americansoccernetwork.com",
    channel: "media" as AffiliateChannel,
  },
];

/* ─────────── Parent groups + booster orgs ─────────── */

const PARENT_GROUPS: AffiliateSeed[] = [
  {
    org_name: "US Club Soccer (parent network)",
    website: "usclubsoccer.org",
    channel: "parent-group" as AffiliateChannel,
    notes: "National parent + club body. Long-shot but big distribution.",
  },
  {
    org_name: "Soccer Parenting Association",
    website: "soccerparenting.com",
    channel: "parent-group" as AffiliateChannel,
    notes: "Skye Eddy. Big parent-side reach. Would resonate w/ TEKKY message.",
  },
];

/* ─────────── Compiled list ─────────── */

export const ZENITH_AFFILIATE_SEEDS: AffiliateSeed[] = [
  ...PACIFIC_NW_CLUBS,
  ...NATIONAL_CLUBS,
  ...COACHES_INFLUENCERS,
  ...PODCASTS_MEDIA,
  ...PARENT_GROUPS,
];
