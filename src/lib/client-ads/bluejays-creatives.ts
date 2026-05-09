/**
 * BlueJays own ad creative library.
 *
 * BlueJays runs two paid-traffic campaigns (per recurring_costs):
 *   · Manufacturer DTC — $450/mo, finds DTC manufacturers needing
 *     full marketing systems. Currently active.
 *   · Agency Replacement — paused 2026-05-08 (kill criteria triggered).
 *
 * Plus organic / future channels we'd add when they're live: Lob
 * postcards to dormant prospects, LinkedIn for partner outreach,
 * podcast sponsorships.
 *
 * Same shape as ZENITH_CREATIVES + OIT_CREATIVES so AdsTabV2 renders
 * BlueJays as just another tenant in the registry.
 */

import type { CreativeSeed, AdPlatform } from "./zenith-creatives";

const AUDIT_URL = "https://bluejayportfolio.com/audit";
const PARTNERS_URL = "https://bluejayportfolio.com/partners";
const HOMEPAGE = "https://bluejayportfolio.com";

function utm(p: AdPlatform, audience: string, content: string) {
  return {
    utm_source: p.startsWith("meta") ? "meta" : "google",
    utm_medium: p.includes("search") ? "cpc" : "paid_social",
    utm_campaign: `bj-${audience}`,
    utm_content: content,
    utm_term: p,
  };
}

/* ──────────────── MANUFACTURER DTC ──────────────── */
// Active campaign. $450/mo. Finds DTC manufacturer prospects who
// already run Shopify but lack a real marketing system.

const MANUFACTURER: CreativeSeed[] = [
  {
    audience: "all",
    platform: "google-search",
    ad_set: "bj-manufacturer-search",
    variant_label: "shopify-stuck",
    headline: "Stuck at $50k/mo on Shopify? Build a marketing system.",
    body:
      "AI-driven funnel + ads + email + SMS designed for DTC manufacturers. $9,700 setup, no monthly retainer. 30-day live audit.",
    cta: "Get the audit",
    utm: utm("google-search", "manufacturer", "shopify-stuck"),
  },
  {
    audience: "all",
    platform: "google-search",
    ad_set: "bj-manufacturer-search",
    variant_label: "agency-replacement",
    headline: "Replace your $4k/mo marketing agency with AI.",
    body:
      "BlueJays replaces 1-2 full-time marketers with an always-on AI system. $9,700 build, you own it. Audit your current setup free.",
    cta: "Free audit",
    utm: utm("google-search", "manufacturer", "agency-replacement"),
  },
  {
    audience: "all",
    platform: "google-pmax",
    ad_set: "bj-manufacturer-pmax",
    variant_label: "founder-led",
    headline: "Founder-led DTC growth, AI-powered.",
    body:
      "Built by a manufacturer who got tired of $4k/mo agency invoices. Now powering ITC, TEKKY, Olympic Inspections, Nevarland Outpost.",
    cta: "See case studies",
    image_brief:
      "Founder mid-30s in a workshop, focused, branded laptop on bench — overlay 'Built by manufacturers, for manufacturers'.",
    utm: utm("google-pmax", "manufacturer", "founder-led"),
  },
  {
    audience: "all",
    platform: "meta-feed",
    ad_set: "bj-manufacturer-meta",
    variant_label: "before-after",
    headline: "From scattered ads + cold list → one AI marketing system.",
    body:
      "DTC manufacturers using BlueJays cut marketing tool spend 40% and ship 3x more campaigns. Audit your funnel free.",
    cta: "Free audit",
    image_brief:
      "Side-by-side: messy spreadsheet of ad accounts vs clean BlueJays dashboard.",
    utm: utm("meta-feed", "manufacturer", "before-after"),
  },
  {
    audience: "all",
    platform: "meta-reels",
    ad_set: "bj-manufacturer-meta",
    variant_label: "60s-walkthrough",
    headline: "Watch a real DTC site get audited in 60 seconds.",
    body:
      "Drop your URL — AI walks the funnel, finds the gaps, prices the fix. No call required.",
    cta: "Run audit",
    video_brief:
      "Screen-record: paste a DTC URL into BlueJays audit form, AI populates findings live, end card 'Free, ~3 minutes'.",
    utm: utm("meta-reels", "manufacturer", "60s-walkthrough"),
  },
];

/* ──────────────── PARTNER / AFFILIATE OUTREACH ──────────────── */
// Reaches out to people who'd refer manufacturers (consultants,
// agencies, fractional CMOs). Pay-per-close partner program.

const PARTNERS: CreativeSeed[] = [
  {
    audience: "all",
    platform: "meta-feed",
    ad_set: "bj-partners",
    variant_label: "consultant-revshare",
    headline: "Consultants — refer DTC clients, earn $1k per close.",
    body:
      "BlueJays runs the AI marketing system you'd build manually for clients. Your reputation, our delivery. $1k commission per $9,700 close.",
    cta: "Become a partner",
    utm: utm("meta-feed", "partners", "consultant-revshare"),
  },
  {
    audience: "all",
    platform: "google-search",
    ad_set: "bj-partners-search",
    variant_label: "agency-pivot",
    headline: "Tired of running a marketing agency? Refer clients here.",
    body:
      "Stop managing 14 contractors. Send DTC clients to BlueJays — $1k per close, no scope creep, your reputation protected.",
    cta: "Sign up",
    utm: utm("google-search", "partners", "agency-pivot"),
  },
];

/* ──────────────── DIRECT MAIL (Lob) ──────────────── */
// AI-generated postcards to dormant cold prospects + warm leads.
// Currently a small experimental channel.

const DIRECT_MAIL: CreativeSeed[] = [
  {
    audience: "all",
    platform: "meta-feed", // Lob doesn't fit AdPlatform — we tag as "other" via fallback
    ad_set: "bj-lob",
    variant_label: "warm-lead-postcard",
    headline: "Personalized postcard for cold-but-warm DTC prospects.",
    body:
      "AI generates the artwork + body referencing the prospect's category + city. Lob ships ~$1/card. Pulls 8-12% reactivation.",
    cta: "Test campaign",
    utm: utm("meta-feed", "lob", "warm-lead-postcard"),
  },
];

export const BLUEJAYS_CREATIVES: CreativeSeed[] = [
  ...MANUFACTURER,
  ...PARTNERS,
  ...DIRECT_MAIL,
];
