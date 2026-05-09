/**
 * Olympic Inspections & Testing — ad creative library.
 *
 * Mold + air-quality inspection creatives across the three audiences:
 * homeowner / realtor / insurance. Same shape as ZENITH_CREATIVES so
 * the existing ads pipeline (CSV export to Meta/Google, request-change
 * flow, owner-facing AdsTab) works out of the box.
 *
 * V1: 12 creatives total — 3 audiences × 4 platforms (Meta feed,
 * Meta reels, Google search, Google PMax). Hooks chosen for the
 * Olympic Peninsula market (older homes, high humidity, real-estate-
 * heavy economy).
 */

import type { CreativeSeed, AdPlatform } from "./zenith-creatives";

const BOOK_URL = "https://www.olympicinspections.com/#book";
const CALC_URL = "https://www.olympicinspections.com/#calculator";
const PARTNERS_URL =
  "https://www.olympicinspections.com/#partners";

function utm(p: AdPlatform, audience: string, content: string) {
  return {
    utm_source: p.startsWith("meta") ? "meta" : "google",
    utm_medium: p.includes("search") ? "cpc" : "paid_social",
    utm_campaign: `oit-${audience}`,
    utm_content: content,
    utm_term: p,
  };
}

/* ──────────────────────────── HOMEOWNERS ──────────────────────────── */

const HOMEOWNERS: CreativeSeed[] = [
  // Meta feed — fear/relief angle (smell-in-the-house lead)
  {
    audience: "homeowner",
    platform: "meta-feed",
    ad_set: "oit-homeowner-prelisting",
    variant_label: "smell-relief-A",
    headline: "Smelling something musty? Get a real answer.",
    body:
      "Olympic Peninsula homeowners — we test the air, find the source, and write a plain-English report. No remediation upsell, no scare tactics. Inspections start at $150.",
    cta: "Book inspection",
    image_brief:
      "Clean modern living room with a thermal-camera shot overlay showing a moisture spot — soft natural light, NW PNW vibe.",
    utm: utm("meta-feed", "homeowner", "smell-relief"),
  },
  // Meta reels — story format (before-listing peace-of-mind)
  {
    audience: "homeowner",
    platform: "meta-reels",
    ad_set: "oit-homeowner-prelisting",
    variant_label: "prelisting-peace",
    headline: "Selling? Get the mold answer before the buyer does.",
    body:
      "We do pre-listing inspections so you walk into negotiations with a lab-backed report — not a $14k surprise. 24-hour turnaround.",
    cta: "Get a quote",
    video_brief:
      "Owner walking through a kitchen with a tablet showing a clean inspection report, then closing screen 'Book in 60 seconds'.",
    utm: utm("meta-reels", "homeowner", "prelisting-peace"),
  },
  // Google search — high-intent keyword angle
  {
    audience: "homeowner",
    platform: "google-search",
    ad_set: "oit-homeowner-search",
    variant_label: "mold-inspection-near-me",
    headline: "Mold Inspection Olympic Peninsula | $150 Spot Check",
    body:
      "ISO/IEC 17025-accredited lab. 24-hour turnaround. Family-owned, Sequim-based. Same-week appointments.",
    cta: "Book inspection",
    utm: utm("google-search", "homeowner", "mold-near-me"),
  },
  // Google PMax — outcome angle
  {
    audience: "homeowner",
    platform: "google-pmax",
    ad_set: "oit-homeowner-pmax",
    variant_label: "outcome-clean-air",
    headline: "Know what's actually in your air.",
    body:
      "Lab-backed mold + air quality inspections across the Olympic Peninsula. Family-owned. Plain-English reports. Inspections from $150.",
    cta: "See pricing",
    image_brief:
      "Wide shot of Olympic Peninsula coastline with a cozy home — overlay 'Lab-backed answers, no upsell'.",
    utm: utm("google-pmax", "homeowner", "outcome-clean-air"),
  },
];

/* ──────────────────────────── REALTORS ──────────────────────────── */

const REALTORS: CreativeSeed[] = [
  // Meta feed — closing-saver angle
  {
    audience: "realtor",
    platform: "meta-feed",
    ad_set: "oit-realtor-referral",
    variant_label: "closing-saver",
    headline: "Closing on the line over a moisture flag?",
    body:
      "We close it for you. 24-hour turnaround on lab-backed reports. Tiered referral payout: $50/$75/$100 per close. Sequim-based, Peninsula-wide.",
    cta: "Become a partner",
    image_brief:
      "Smiling agent at a kitchen island with a tablet — overlay 'Lab-backed answers, your buyer trusts the data'.",
    utm: utm("meta-feed", "realtor", "closing-saver"),
  },
  // Meta reels — referral payout angle
  {
    audience: "realtor",
    platform: "meta-reels",
    ad_set: "oit-realtor-referral",
    variant_label: "payout-explainer",
    headline: "Referral program: $50 → $75 → $100",
    body:
      "Send buyers/sellers our way for mold + air quality inspections. Tiered referral. Tracking dashboard included. Pays monthly.",
    cta: "Sign up",
    video_brief:
      "60s hand-held: realtor on phone, screenshot of tracking dashboard, closing card 'Tier up at 5 closes'.",
    utm: utm("meta-reels", "realtor", "payout-explainer"),
  },
  // Google search — partner-finder keyword
  {
    audience: "realtor",
    platform: "google-search",
    ad_set: "oit-realtor-search",
    variant_label: "preferred-inspector-search",
    headline: "Preferred Mold Inspector Olympic Peninsula",
    body:
      "Realtor referral program · 24-hr turnaround · ISO/IEC 17025 lab. Sequim, Port Angeles, Port Townsend, Bremerton.",
    cta: "Become a partner",
    utm: utm("google-search", "realtor", "preferred-inspector"),
  },
  // Google PMax — bulk angle
  {
    audience: "realtor",
    platform: "google-pmax",
    ad_set: "oit-realtor-pmax",
    variant_label: "team-bulk",
    headline: "Inspection partner for your whole team.",
    body:
      "Olympic Peninsula brokerages — same-week scheduling, photo-documented PDFs, real-estate-ready format. $50-$100 referral payout per close.",
    cta: "Talk to us",
    utm: utm("google-pmax", "realtor", "team-bulk"),
  },
];

/* ──────────────────────────── INSURANCE ──────────────────────────── */

const INSURANCE: CreativeSeed[] = [
  // Meta feed — claim-file angle
  {
    audience: "insurance",
    platform: "meta-feed",
    ad_set: "oit-insurance",
    variant_label: "claim-file-defensible",
    headline: "Independent third-party reports for claim files.",
    body:
      "ISO/IEC 17025-accredited lab. 72-hour turnaround. Photo-documented chain-of-custody. Adjusters across the Olympic Peninsula trust our reports.",
    cta: "Schedule",
    image_brief:
      "Inspector in branded jacket on a job site with a clipboard — overlay 'Defensible. Lab-backed. 72-hour'.",
    utm: utm("meta-feed", "insurance", "claim-defensible"),
  },
  // Meta reels — adjuster workflow angle
  {
    audience: "insurance",
    platform: "meta-reels",
    ad_set: "oit-insurance",
    variant_label: "adjuster-workflow",
    headline: "Mold-claim turnaround: 72 hours.",
    body:
      "Independent IAQ + mold inspection. Reports formatted for claim files. Olympic Peninsula coverage, no remediation conflict.",
    cta: "Book",
    video_brief:
      "Inspector setting up an air pump, then a clean PDF rendering — closing card '72-hour, ISO/IEC 17025'.",
    utm: utm("meta-reels", "insurance", "adjuster-workflow"),
  },
  // Google search — exact-match adjuster keyword
  {
    audience: "insurance",
    platform: "google-search",
    ad_set: "oit-insurance-search",
    variant_label: "third-party-claim-search",
    headline: "Third-Party Mold Inspection · Claim Files",
    body:
      "ISO/IEC 17025-accredited lab. 72-hour PDF reports. Independent. Olympic Peninsula. Same-week scheduling.",
    cta: "Schedule",
    utm: utm("google-search", "insurance", "third-party-claim"),
  },
  // Google PMax — large-loss angle
  {
    audience: "insurance",
    platform: "google-pmax",
    ad_set: "oit-insurance-pmax",
    variant_label: "large-loss",
    headline: "Large-loss IAQ assessments, Peninsula-wide.",
    body:
      "Hospitals, schools, marinas, commercial properties. Lab-backed indoor air quality reports. ISO/IEC 17025 chain-of-custody.",
    cta: "Get a quote",
    utm: utm("google-pmax", "insurance", "large-loss"),
  },
];

export const OIT_CREATIVES: CreativeSeed[] = [
  ...HOMEOWNERS,
  ...REALTORS,
  ...INSURANCE,
];
