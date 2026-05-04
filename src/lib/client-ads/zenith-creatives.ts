/**
 * Zenith Sports / TEKKY® ad creative library.
 *
 * Source-of-truth for every Meta + Google variant we run. Each entry
 * is one ad — when you POST /api/client-ads/zenith-sports/seed, these
 * become rows in client_ad_creatives. Edit this file, hit the seed
 * endpoint with `?upsert=1`, and existing rows update by
 * (audience, platform, variant_label).
 *
 * Why store seeds in code: Ben + Claude edit them in the same PR
 * cycle as the funnel content. The DB row is the live state (including
 * external_id, performance numbers); this file is the spec.
 *
 * Naming: variant_label encodes the angle so reports can group by it
 * and we can answer "which hook is winning" without reading copy.
 */

export type AdAudience = "parent" | "coach" | "player" | "all";
export type AdPlatform =
  | "meta-feed"
  | "meta-reels"
  | "meta-stories"
  | "google-search"
  | "google-pmax"
  | "google-yt";

export type CreativeSeed = {
  audience: AdAudience;
  platform: AdPlatform;
  ad_set: string;
  variant_label: string;
  headline: string;
  body: string;
  cta: string;
  image_brief?: string;
  video_brief?: string;
  utm: Record<string, string>;
};

const SHOP_URL = "https://bluejayportfolio.com/clients/zenith-sports/shop";
const CONTACT_URL = "https://bluejayportfolio.com/clients/zenith-sports#contact";
const TRAINING_URL = "https://bluejayportfolio.com/clients/zenith-sports#training";
const CAMPS_URL = "https://bluejayportfolio.com/clients/zenith-sports/camps";
const COACH_GUIDE_URL =
  "https://bluejayportfolio.com/clients/zenith-sports/training-guide";

function utm(p: AdPlatform, audience: AdAudience, content: string) {
  return {
    utm_source: p.startsWith("meta") ? "meta" : "google",
    utm_medium: p.includes("search") ? "cpc" : "paid_social",
    utm_campaign: `tekky-${audience}`,
    utm_content: content,
    utm_term: p,
  };
}

/* ──────────────────────────── PARENTS ──────────────────────────── */

const PARENTS: CreativeSeed[] = [
  // Meta feed — confidence/progress angle, Hook A: outcome-led
  {
    audience: "parent",
    platform: "meta-feed",
    ad_set: "Parents · Confidence",
    variant_label: "A · Outcome-led",
    headline: "Watch your player's touch transform in 14 days.",
    body: "TEKKY® is a smaller, weighted training ball built by youth-soccer coaches. 10–15 min a day at home — your player switches back to a regulation ball and feels the difference instantly.",
    cta: "Shop Now",
    image_brief:
      "Parent watching child practice in driveway. Golden-hour, soft. TEKKY ball mid-touch.",
    utm: utm("meta-feed", "parent", "outcome-14days"),
  },
  {
    audience: "parent",
    platform: "meta-feed",
    ad_set: "Parents · Confidence",
    variant_label: "B · Coach-noticed",
    headline: "The coach noticed before I did.",
    body: "A real parent on her son after 6 weeks with TEKKY®. Smaller ball, FIFA Size 5 weight. Patent-pending. Built for technical players, not kick-and-run.",
    cta: "Shop Now",
    image_brief:
      "Mid-shot of a young player resting on TEKKY between drills, confident posture.",
    utm: utm("meta-feed", "parent", "coach-noticed"),
  },
  {
    audience: "parent",
    platform: "meta-feed",
    ad_set: "Parents · Confidence",
    variant_label: "C · Driveway-daily",
    headline: "10 minutes a day. Real progress.",
    body: "You don't need a $2,000 camp. You need 15 min in the driveway with the right ball. TEKKY® brings the European technical methodology home.",
    cta: "Shop Now",
    image_brief:
      "POV from doorway looking out at child training in suburban driveway. TEKKY ball at center.",
    utm: utm("meta-feed", "parent", "driveway-daily"),
  },

  // Meta reels — short video, BAE moment
  {
    audience: "parent",
    platform: "meta-reels",
    ad_set: "Parents · BAE",
    variant_label: "A · BAE-cut",
    headline: "Same player. Two balls. The difference is real.",
    body: "Patent-pending TEKKY® ball. FIFA Size 3 control + Size 5 weight. Train at home, dominate game day.",
    cta: "Shop the TEKKY®",
    video_brief:
      "8-sec cut. Player runs drill on TEKKY (close-up touch), hard cut to same drill on standard ball, visibly smoother first touch. Title card: 'Real-game feel.'",
    utm: utm("meta-reels", "parent", "bae-cut"),
  },
  {
    audience: "parent",
    platform: "meta-reels",
    ad_set: "Parents · BAE",
    variant_label: "B · Founder-talks",
    headline: "Why we built this.",
    body: "Philip + Paul — co-founders, former academy coaches, 40+ combined years. The TEKKY® was built because U.S. youth soccer over-indexes on tactics and under-indexes on touch.",
    cta: "Learn More",
    video_brief:
      "10-sec talking-head from Philip. 'I coached 12 years. We built TEKKY because…' Hard cut to ball in player's foot. Title: 'Building Better Players. One Touch at a Time.'",
    utm: utm("meta-reels", "parent", "founder-talks"),
  },

  // Meta stories — 9:16 vertical
  {
    audience: "parent",
    platform: "meta-stories",
    ad_set: "Parents · Stories",
    variant_label: "A · Camp-finder",
    headline: "Find a TEKKY® camp near you.",
    body: "Day camps + clinics where every player trains with the patent-pending TEKKY® ball. Tap to find one in your zip.",
    cta: "Sign Up",
    image_brief:
      "9:16 vertical. Map graphic of US with pinpoint dots highlighting Pacific NW. TEKKY ball overlay top-right.",
    utm: utm("meta-stories", "parent", "camp-finder"),
  },

  // Google search — bottom-of-funnel intent terms
  {
    audience: "parent",
    platform: "google-search",
    ad_set: "Parents · Bottom-funnel",
    variant_label: "A · Buy-intent",
    headline: "TEKKY® Training Ball | Patent-Pending | Build Real Touch",
    body: "Smaller surface, FIFA Size 5 weight. Trusted by ECNL + MLS Next clubs. $59.95. Free shipping.",
    cta: "Shop Now",
    utm: utm("google-search", "parent", "buy-intent"),
  },
  {
    audience: "parent",
    platform: "google-search",
    ad_set: "Parents · Bottom-funnel",
    variant_label: "B · Compare",
    headline: "Better Than a Regular Soccer Ball | TEKKY® Training Tool",
    body: "Built by youth-soccer coaches to fix the touch gap. 10 min a day. See your player's confidence change in two weeks.",
    cta: "Shop Now",
    utm: utm("google-search", "parent", "compare"),
  },
];

/* ──────────────────────────── COACHES ──────────────────────────── */

const COACHES: CreativeSeed[] = [
  {
    audience: "coach",
    platform: "meta-feed",
    ad_set: "Coaches · Outcomes",
    variant_label: "A · Touches/min",
    headline: "Touches per minute up 28% in 6 weeks.",
    body: "Why ECNL + MLS Next clubs are putting the TEKKY® ball in training. Smaller surface forces the focus modern training drills can't. Patent-pending.",
    cta: "Book Demo",
    image_brief:
      "Wide shot of a coach mid-instruction with team holding TEKKY balls. Pitch backdrop.",
    utm: utm("meta-feed", "coach", "touches-per-min"),
  },
  {
    audience: "coach",
    platform: "meta-feed",
    ad_set: "Coaches · Outcomes",
    variant_label: "B · DOC-quote",
    headline: "\"The ball does the coaching for me.\"",
    body: "Real DOC, ECNL club. The TEKKY® won't let players get away with sloppy first touches. Bulk discounts available for clubs.",
    cta: "Book Demo",
    image_brief:
      "Close-up of TEKKY ball under coach's foot, clipboard in hand, blurred kids in background.",
    utm: utm("meta-feed", "coach", "doc-quote"),
  },
  {
    audience: "coach",
    platform: "meta-feed",
    ad_set: "Coaches · Outcomes",
    variant_label: "C · Coach-credible",
    headline: "Coach-credible. Not influencer-first.",
    body: "TEKKY® was developed by professionals for professionals. Trusted from Rec to ECNL to MLS Next. Free coaching guide + 30-min demo on request.",
    cta: "Get Free Guide",
    image_brief:
      "Three coach archetypes (rec / club / DOC) huddled around tactics board, TEKKY in foreground.",
    utm: utm("meta-feed", "coach", "coach-credible"),
  },

  // Meta reels — methodology
  {
    audience: "coach",
    platform: "meta-reels",
    ad_set: "Coaches · Methodology",
    variant_label: "A · European-way",
    headline: "European academies don't start with tactics. They start with touch.",
    body: "TEKKY® brings that methodology to your roster. Patent-pending. Trusted by ECNL + MLS Next.",
    cta: "Book Demo",
    video_brief:
      "12-sec montage. Iniesta-style close control footage cuts to U13 player on TEKKY doing same move. Title: 'Technique before tactics.'",
    utm: utm("meta-reels", "coach", "european-way"),
  },

  // Google search — coach-intent
  {
    audience: "coach",
    platform: "google-search",
    ad_set: "Coaches · Search",
    variant_label: "A · Drill-search",
    headline: "Youth Soccer Drill Library | TEKKY® Coaching Guide | Free PDF",
    body: "26 drills + 4-week session plan from former academy coaches. Used by ECNL + MLS Next clubs. Download free.",
    cta: "Get Free Guide",
    utm: utm("google-search", "coach", "drill-search"),
  },
  {
    audience: "coach",
    platform: "google-search",
    ad_set: "Coaches · Search",
    variant_label: "B · Club-buy",
    headline: "Club Bulk-Order Soccer Training Balls | TEKKY® Patent-Pending",
    body: "Designed for technical training. FIFA Size 3 control + Size 5 weight. Club discounts. Demo available.",
    cta: "Request Demo",
    utm: utm("google-search", "coach", "club-buy"),
  },
];

/* ──────────────────────────── PLAYERS ──────────────────────────── */

const PLAYERS: CreativeSeed[] = [
  {
    audience: "player",
    platform: "meta-reels",
    ad_set: "Players · Skill",
    variant_label: "A · Drill-clip",
    headline: "Train your touch.",
    body: "26 drills. Patent-pending TEKKY® ball. Tag #TEKKYTouch — we feature one player a week.",
    cta: "Watch Drills",
    video_brief:
      "8-sec La Croqueta drill on TEKKY, fast cuts. End card: 'Your move next. #TEKKYTouch'",
    utm: utm("meta-reels", "player", "drill-clip"),
  },
  {
    audience: "player",
    platform: "meta-reels",
    ad_set: "Players · Skill",
    variant_label: "B · Pro-comparison",
    headline: "What Iniesta did at 12. You can do tonight.",
    body: "The European academies started everyone with smaller, weighted balls. TEKKY® brings that to your driveway.",
    cta: "Shop Now",
    video_brief:
      "Split-screen: Iniesta youth footage on left, kid on TEKKY on right. Both doing La Croqueta. Sync the touches.",
    utm: utm("meta-reels", "player", "pro-comparison"),
  },
  {
    audience: "player",
    platform: "meta-stories",
    ad_set: "Players · Stories",
    variant_label: "A · Touch-tuesday",
    headline: "TEKKYTouch Tuesday.",
    body: "New drill drops every Tuesday. Tag your reps. Get featured.",
    cta: "Watch Drills",
    image_brief:
      "9:16. TEKKY ball with 'TUESDAY' lockup. Lime accent on dark navy.",
    utm: utm("meta-stories", "player", "touch-tuesday"),
  },

  // Google YouTube pre-roll — players are on YT
  {
    audience: "player",
    platform: "google-yt",
    ad_set: "Players · YT",
    variant_label: "A · Skip-bumper",
    headline: "Better touch in 5 seconds.",
    body: "Skippable 6-sec pre-roll on soccer-skills + freestyle channels.",
    cta: "Watch More",
    video_brief:
      "6-sec bumper: player taps TEKKY, switches to regulation ball, ball moves smoother. Lime end-card with TEKKY logo.",
    utm: utm("google-yt", "player", "skip-bumper"),
  },
];

/* ──────────────────────────── ALL-AUDIENCE ──────────────────────────── */

const ALL: CreativeSeed[] = [
  // Performance Max — feed-driven, no body needed but we keep one for completeness
  {
    audience: "all",
    platform: "google-pmax",
    ad_set: "PMax · Catalog",
    variant_label: "A · Catalog feed",
    headline: "TEKKY® · Building Better Players",
    body: "Patent-pending technical training tool. FIFA Size 3 control. FIFA Size 5 match-day weight. Trusted by ECNL + MLS Next.",
    cta: "Shop Now",
    image_brief:
      "Auto-generated from /shop product feed (3 products: ball, socks, tee).",
    utm: utm("google-pmax", "all", "catalog-feed"),
  },
];

/* ──────────────────────────── REGISTRY ──────────────────────────── */

export const ZENITH_CREATIVES: CreativeSeed[] = [
  ...PARENTS,
  ...COACHES,
  ...PLAYERS,
  ...ALL,
];

export function listZenithCreativeStats() {
  const byAudience: Record<string, number> = {};
  const byPlatform: Record<string, number> = {};
  for (const c of ZENITH_CREATIVES) {
    byAudience[c.audience] = (byAudience[c.audience] ?? 0) + 1;
    byPlatform[c.platform] = (byPlatform[c.platform] ?? 0) + 1;
  }
  return { total: ZENITH_CREATIVES.length, byAudience, byPlatform };
}
