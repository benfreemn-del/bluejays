/**
 * BlueJays' OWN audience funnels — rendered on /dashboard/funnel.
 *
 * Three audience cuts of the BlueJays sales motion. These are NOT
 * client funnels (those live in src/lib/client-funnels/[slug].ts) —
 * they're the funnels BlueJays runs against its OWN prospect base.
 *
 * Each funnel is shaped as a FunnelDefLite so it can render through
 * the shared FunnelVisualModal (Rule 74 standard — bars + drop-off
 * pills + edit pane + + Note panel).
 *
 * cumulativeReachPct values below are industry-typical baselines (so
 * the modal renders bars labeled "est. baseline"). They get replaced
 * with measured numbers as soon as /api/funnel-conversion/stats
 * starts persisting per-step reach for each cohort. Until then the
 * point is to give Ben the same visual rhythm he expects on
 * client-side funnels — at-a-glance "where am I losing people?"
 *
 * MUST be monotonic per CLAUDE.md Rule 74. Last step's reach should
 * approximately match the funnel's expected close rate.
 *
 * REDESIGNED 2026-05-16 against:
 *  - 116-Funnels video (`reference_116_funnels_frameworks.md`)
 *    — pre-call asset trifecta (FAQ videos + value-drop emails +
 *      2-min Typeform callback), Rule 7/14 trust-meter, stop-selling-
 *      in-reels, weekly stories cadence, free-course leadmagnet
 *  - Russell Brunson canon (`reference_brunson_funnels_frameworks.md`)
 *    — recursive Hook→Story→Offer per step, Dream 100 mechanic
 *      (work-in + buy-in dual track), stack slide methodology,
 *      belief-rewrite at the close, second-yes ladder math (30-46%)
 *  - Hormozi corpus (existing reference_hormozi_*.md files)
 *    — 50%-per-step loss budget, BANT pre-call SMS, CLOSER framework,
 *      proof-replaces-guarantees, agency aggregate-framing
 *
 * Each step's `transcript` carries the actual copy / framework
 * attribution so the edit pane in FunnelVisualModal shows operators
 * exactly WHY each step exists — not just what fires.
 */

import type { FunnelDefLite } from "@/components/portal/FunnelVisualModal";

/**
 * Manufacturer-category whitelist — single source of truth for the
 * mfg-lookalike funnel attribution AND for downstream consumers that
 * need to know "is this prospect a manufacturer ICP?"
 *
 * Used by:
 *  - /api/funnel-conversion/stats — mfg-lookalike segment filter
 *  - src/lib/audit-emails.ts — PRODUCT_ICP_CATEGORIES is a SUPERSET
 *    (adds indie-author + ecommerce — those use the $10k pitch path
 *    too but aren't on the manufacturer Dream-100 outreach motion)
 *  - any future code that asks "is this category a manufacturer?"
 *
 * Categories use the `mfg-<subcategory>` prefix convention. Adding a
 * new manufacturer subcategory: drop the string in this array and
 * every downstream surface picks it up automatically.
 */
export const MANUFACTURER_CATEGORIES = [
  "mfg-ag-equipment",
  "mfg-sports-equipment",
  "mfg-outdoor-gear",
  "mfg-apparel-kids",
  "mfg-auto-parts",
  "mfg-food-bev",
] as const;

export type ManufacturerCategory = (typeof MANUFACTURER_CATEGORIES)[number];

/** True if the category is one of the manufacturer ICP buckets. Null-safe. */
export function isManufacturerCategory(
  category: string | null | undefined,
): boolean {
  if (!category) return false;
  return (MANUFACTURER_CATEGORIES as readonly string[]).includes(category);
}

export type BluejaysFunnel = FunnelDefLite & {
  /** Stage-count overrides for the modal's top stats row.
   *  Wired from real prospect counts at render time when available. */
  defaultCounts: {
    total: number;
    newCount: number;
    enrolledCount: number;
    wonCount: number;
  };
  /** Theme for the card border + accent on /dashboard/funnel. */
  cardClass: string;
  /** Where the funnel lands prospects — opened in a new tab from
   *  the card's "View landing page" button. */
  landingPath: string;
  /** Lead-magnet badge — surfaces visibly on the dashboard card so
   *  Ben sees "where does this funnel get fed from?" at a glance.
   *  Set on funnels with an explicit lead magnet (the /audit form is
   *  the only one today; cold-scouted + dream-100 are operator-fed
   *  not lead-magnet-fed). */
  leadMagnet?: {
    label: string;
    href: string;
  };
  /** Framework attribution rendered as a small footer on the card.
   *  Surfaces which memory-codified frameworks shape the step copy +
   *  reach curve. Operators can grep the framework names back into
   *  memory references. */
  frameworks?: readonly string[];
};

/**
 * UNIVERSAL_CLOSE_LADDER — the 4 close phases every $10k AI System
 * close walks through, regardless of which segment funnel fed it.
 *
 * Inbound-audit (funnel 1) reaches the ladder at Day 2 (Madie
 * discovery → stack slide). Dream-100 (funnel 3) reaches it at
 * Day 10 (stack-slide email drop). Cold-scouted $997 buyers
 * (funnel 2) reach it at Day 45 via the second-yes ladder.
 *
 * Centralizing the ladder lets the attribution dashboard, win/loss
 * analytics, and Madie's close-rate pill all group prospects by
 * "what universal close phase did they reach?" without each consumer
 * re-encoding the segment-specific copy.
 *
 * NOT a runtime state machine — the close itself is human-driven
 * (Ben + Madie on calls). This is the seam for code that NEEDS to
 * know which phase a prospect is at: dashboards, attribution,
 * cohort analysis, the future close-rate pill.
 *
 * Framework attribution per phase lives in the `frameworks` field
 * so a future skill can introspect "which Hormozi / Brunson move
 * fires at this phase?" without re-reading the funnel transcripts.
 */
export type CloseStage =
  | "stack-slide"
  | "mock-backend"
  | "card-on-hand"
  | "payment-link";

export interface CloseLadderPhase {
  stage: CloseStage;
  label: string;
  /** One-sentence description of what fires at this phase */
  fires: string;
  /** Codified frameworks driving this phase (greppable into memory refs) */
  frameworks: readonly string[];
  /** Which segments reach this phase, and roughly when */
  reachedBy: ReadonlyArray<{
    segment: "inbound-audit" | "cold-scouted" | "mfg-lookalike";
    aroundDay: number;
  }>;
}

export const UNIVERSAL_CLOSE_LADDER: readonly CloseLadderPhase[] = [
  {
    stage: "stack-slide",
    label: "Stack Slide + Belief Rewrite",
    fires:
      "17 Universal + 4 Manufacturer (or 5 Author) modules with explicit $ values per module; total > $50k vs the $10k price. Belief-rewrite via TRUMP stories on the prospect's top 2 objections.",
    frameworks: [
      "Brunson chunk 17 (belief-rewrite)",
      "Brunson chunk 18+19 (stack slide)",
      "Hormozi CLOSER (`reference_hormozi_sales_training.md`)",
    ],
    reachedBy: [
      { segment: "inbound-audit", aroundDay: 2 },
      { segment: "mfg-lookalike", aroundDay: 10 },
      { segment: "cold-scouted", aroundDay: 47 },
    ],
  },
  {
    stage: "mock-backend",
    label: "Mock Backend Showcase",
    fires:
      "Live tour at /clients/<slug>/portal (footer feather + 1212 password). Prospect sees the AI System backend they'd actually get. Ben drives for $10k+ closes; Madie drives for $997 second-yes upgrades.",
    frameworks: [
      "Brunson stack-slide visualization layer",
      "Hormozi sell-at-greatest-deprivation",
      "BlueJays mock-backend skill (`aios/.claude/skills/mock_backend/SKILL.md`)",
    ],
    reachedBy: [
      { segment: "inbound-audit", aroundDay: 3 },
      { segment: "mfg-lookalike", aroundDay: 20 },
      { segment: "cold-scouted", aroundDay: 50 },
    ],
  },
  {
    stage: "card-on-hand",
    label: "Card-on-Hand Close",
    fires:
      "$200 move-forward discount pre-framed during discovery so the close-call payment ask feels like a thank-you, not a discount-grab. BAM-FAM follow-through.",
    frameworks: [
      "Luis $200 move-forward (`reference_hormozi_luis_frameworks.md`)",
      "Annie default-close + BAM-FAM (`reference_hormozi_annie_frameworks.md`)",
      "Hormozi closer-or-further decision frame",
    ],
    reachedBy: [
      { segment: "inbound-audit", aroundDay: 3 },
      { segment: "mfg-lookalike", aroundDay: 25 },
      { segment: "cold-scouted", aroundDay: 52 },
    ],
  },
  {
    stage: "payment-link",
    label: "Stripe Payment Link",
    fires:
      "Stripe Payment Link generated mid-call. Q1 installment ($2,500) for installment plans; $9,700 pay-in-full link with the $300 discount for full-pay. Card-on-file ask immediately after to lock the remaining quarterly installments.",
    frameworks: [
      "Pay-in-full $300 discount (`project_ai_system_pricing.md`)",
      "Brunson LTV philosophy (never the last sale)",
      "BlueJays pricing-alignment rule (CLAUDE.md handoff PDFs)",
    ],
    reachedBy: [
      { segment: "inbound-audit", aroundDay: 3 },
      { segment: "mfg-lookalike", aroundDay: 25 },
      { segment: "cold-scouted", aroundDay: 52 },
    ],
  },
];

/**
 * Given a segment + day, return the close phase the prospect is at (or
 * null if they haven't reached the ladder yet). Used by dashboards and
 * the attribution stack — never by the funnel cron (close is manual).
 */
export function getCloseStageAt(
  segment: "inbound-audit" | "cold-scouted" | "mfg-lookalike",
  day: number,
): CloseStage | null {
  let current: CloseStage | null = null;
  for (const phase of UNIVERSAL_CLOSE_LADDER) {
    const reach = phase.reachedBy.find((r) => r.segment === segment);
    if (reach && day >= reach.aroundDay) current = phase.stage;
  }
  return current;
}

export const BLUEJAYS_FUNNELS: BluejaysFunnel[] = [
  // ─────────────────────────────────────────────────────────────────
  // FUNNEL 1 — PRIMARY: Inbound Audit → $10k AI System
  // The /audit lead magnet feeds directly into this funnel. Most
  // pre-Day-19 FB launch budget routes here. Baked in 116-Funnels
  // pre-call trifecta + Brunson HSO recursion + stack slide + Hormozi
  // BAM-FAM close.
  // ─────────────────────────────────────────────────────────────────
  {
    segment: "inbound-audit",
    audienceTag: "inbound-audit",
    emoji: "🎯",
    title: "Inbound Audit → $10k AI System",
    pitch:
      "Lead magnet `/audit` is the entry — every submitter enters here. Brunson Hook-Story-Offer at every step + 116-Funnels pre-call trifecta (FAQ videos + value-drop emails + 2-min Madie callback) + Hormozi CLOSER on the discovery call. Stack slide deployed at first close attempt. Manufacturer ICP prioritized; service businesses route to $997 site instead.",
    accentText: "text-amber-300",
    cardClass: "border-amber-500/40 bg-amber-500/[0.05] ring-1 ring-amber-500/20",
    landingPath: "/audit",
    leadMagnet: {
      label: "🎯 Lead magnet — /audit (4 reasons your product isn't selling)",
      href: "/audit",
    },
    frameworks: [
      "116-Funnels L13 (pre-call trifecta)",
      "Brunson HSO + stack slide",
      "Hormozi CLOSER + BAM-FAM",
    ],
    defaultCounts: {
      total: 47,
      newCount: 9,
      enrolledCount: 22,
      wonCount: 3,
    },
    steps: [
      {
        day: 0,
        channel: "email",
        label: "Audit ready — instant report email (curiosity headline)",
        transcript:
          "Hook: curiosity (4 reasons your product isn't selling — specifics revealed inside). Story: 60-second scan revealed N leaks costing orders. Offer: read the full audit on the thank-you page. Brunson chunk 13 (LP-level HSO) + chunk 9 (recursive HSO). 116-Funnels chunk 2 (curiosity > clarity at headline altitude).",
        cumulativeReachPct: 100,
      },
      {
        day: 0,
        channel: "email",
        label: "Thank-you page — 60-sec FAQ videos answer top 5 objections",
        transcript:
          "Hook: each FAQ thumbnail is a scroll-stopper headline. Story: 60-sec answer with the right belief embedded. Offer: book-a-call CTA at the end of each video. 116-Funnels chunk 13a — up to 40% show-rate lift. Top 5 objections extracted from Madie's last 10 sales-call recordings via Claude.",
        cumulativeReachPct: 60,
      },
      {
        day: 0,
        channel: "call",
        label: "Madie 2-min callback — Typeform → triage call SLA",
        transcript:
          "116-Funnels chunk 13c — every audit submission gets a call within 2 minutes. 90-second triage: current site, biggest pain, age/role. Outcome: ICP classification (manufacturer / service / author) + asset triage decision. Annie 60-sec lead-followup (`reference_hormozi_annie_frameworks.md`) is the closest Hormozi analog.",
        cumulativeReachPct: 40,
      },
      {
        day: 0,
        channel: "email",
        label: "Personalized pre-call asset send (manufacturer / service / author)",
        transcript:
          "116-Funnels chunk 13c — personalized asset triage based on Madie's 2-min call: Manufacturer → ITC + Tekky case studies, payment screenshots, mock-backend Loom. Service → Hector friend-rate flip story. Author → Bloodlines case study + AI System author bonus modules. Without this layer, every prospect gets generic assets and gray-zone closes never happen.",
        cumulativeReachPct: 28,
      },
      {
        day: 1,
        channel: "email",
        label: "Value-drop email 1 — 'How fast does $10k AI System ROI?' (belief-rewrite #1)",
        transcript:
          "116-Funnels chunk 13b — replaces generic 'your call is in 3 hours' reminder with a value drop wrapped around the #1 objection. Body: Luis 12-month outcome math ($2.5M → $3.6M = +44% rev, +41% profit — `reference_hormozi_luis_frameworks.md`). Brunson chunk 17 — belief-rewrite via better story.",
        cumulativeReachPct: 22,
      },
      {
        day: 2,
        channel: "call",
        label: "Madie discovery call — stack slide + belief-rewrite + default-close",
        transcript:
          "Brunson chunk 17 — rewrite false beliefs via TRUMP stories. Brunson chunk 18+19 — stack slide deploys here: 17 Universal + 4 Manufacturer (or 5 Author) modules with explicit $ values per module, total > $50k vs $10k price. Hormozi CLOSER framework (`reference_hormozi_sales_training.md`) + Annie default-close (`reference_hormozi_annie_frameworks.md`).",
        cumulativeReachPct: 14,
      },
      {
        day: 2,
        channel: "email",
        label: "Value-drop email 2 — 'I'm just starting out, will it work?' (belief-rewrite #2)",
        transcript:
          "116-Funnels chunk 13b — second value-drop. Body: Tekky pre-close story (manufacturer prospect, same skepticism, $10,000 closed because deliverable was AI System not website). Brunson chunk 17 — TRUMP story for belief #2.",
        cumulativeReachPct: 12,
      },
      {
        day: 3,
        channel: "call",
        label: "Mock backend demo + close attempt #1 (Hormozi card-on-hand)",
        transcript:
          "Brunson chunk 18+19 stack slide is now visualized via the live mock-backend tour at /clients/<slug>/portal (footer feather + '1212' password). Hormozi card-on-hand close (`reference_hormozi_luis_frameworks.md`) — prospect pre-framed for the $200 move-forward discount + immediate-payment ask. Hormozi BAM-FAM (`reference_hormozi_annie_frameworks.md`).",
        cumulativeReachPct: 8,
      },
      {
        day: 7,
        channel: "email",
        label: "Value-drop 3 + final SMS — 'I retire previews after 30 days' (reason-now)",
        transcript:
          "Hormozi reason-now CTA (`reference_hormozi_lead_magnets_frameworks.md` chunk 17 — any reason beats no reason). Body: 3rd belief-rewrite + scarcity. Cory 3-email mini-campaign pattern (`reference_hormozi_cory_frameworks.md`).",
        cumulativeReachPct: 6,
      },
      {
        day: 14,
        channel: "email",
        label: "Final call — $10k close OR route to long-nurture / $997 downsell",
        transcript:
          "Hormozi 'closer or further' decision frame (`reference_hormozi_closing.md`). If service-business ICP detected → route to $997 site offer (not eligible for AI System per offer-ladder lock). If manufacturer/author and still warm → long-nurture (Hormozi reactivation angles). Brunson second-yes ladder gate — first yes is hardest; the post-close ladder lives in the funnel below.",
        cumulativeReachPct: 4,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // FUNNEL 2: Cold-Scouted → $997 → $10k Ladder
  // Apollo + Google Places auto-scouted prospects. The $997 site is
  // the GATE / quick-win front-end (Hormozi `reference_hormozi_offer_design.md`
  // pricing-audit pattern). Brunson second-yes ladder activates on
  // qualified manufacturer-ICP $997 buyers — automatic $10k AI System
  // upsell offer at D45.
  // ─────────────────────────────────────────────────────────────────
  {
    segment: "cold-scouted",
    audienceTag: "cold-scouted",
    emoji: "❄️",
    title: "Cold-Scouted → $997 → $10k Ladder",
    pitch:
      "Apollo + Google Places auto-scouted. 30-day email cadence with Brunson Hook-Story-Offer per touch + 116-Funnels William-Brown low-pressure headlines. Dream 100 paid-ad layer runs in parallel (Brunson chunk 7 — buy-in track). Post-$997-close, qualified manufacturer prospects route into the automatic $10k AI System second-yes ladder (Brunson chunk 20 — 30-46% take rate target).",
    accentText: "text-sky-300",
    cardClass: "border-sky-500/20 bg-sky-500/[0.04]",
    landingPath: "/audit",
    frameworks: [
      "Brunson HSO + second-yes ladder",
      "116-Funnels L2 (William Brown LP pattern)",
      "Hormozi quick-win front-end",
    ],
    defaultCounts: {
      total: 224,
      newCount: 38,
      enrolledCount: 92,
      wonCount: 6,
    },
    steps: [
      {
        day: 0,
        channel: "email",
        label: "Day-0 pitch — preview link + reveal-a-problem hook",
        transcript:
          "Brunson HSO (chunk 9+10). Hook: reveal-a-problem (`reference_hormozi_lead_magnets_frameworks.md` — most {category} sites lose bids at the same 3 spots). Story: we built you a preview — link below. Offer: click to see your custom preview. Hormozi-aligned negatives-specific / positives-vague (`reference_hormozi_lead_magnets_frameworks.md` chunk 4).",
        cumulativeReachPct: 100,
      },
      {
        day: 2,
        channel: "voicemail",
        label: "Ringless voicemail — 30s personalized + preview link reference",
        transcript:
          "Hormozi voicemail-drop pattern. References the prospect's actual business name + the preview URL spoken aloud (forcing-function for them to check email). 116-Funnels L7 — voicemail is acceptable on cold; SMS is NOT (TCPA gate — `feedback_l7_reels_follow_stories_sell.md` is for IG content not SMS, but smsConsent gate per CLAUDE.md Rule 35 blocks cold SMS regardless).",
        cumulativeReachPct: 78,
      },
      {
        day: 5,
        channel: "email",
        label: "William-Brown low-pressure follow-up — 'curious what you'd change?'",
        transcript:
          "116-Funnels chunk 2 — William Brown $500-600k/mo single-funnel runs on this exact phrasing. Low-pressure pattern: 'Here's how I might be able to help you' (NOT 'here's the exact 9-step system you need'). Inverts the typical follow-up framing.",
        cumulativeReachPct: 60,
      },
      {
        day: 7,
        channel: "ad",
        label: "Dream 100 paid layer activates — retargets prospect's follower-audience overlap",
        transcript:
          "Brunson chunk 7 — buy-in track parallel to email. Meta/LinkedIn Ad Library lookalike: take the prospect's industry-adjacent dream-100 entries (their podcasts / IG creators / FB groups) and target the AUDIENCES of those dream-100 entries. Joel camera-roll blitz (`reference_hormozi_joel_frameworks.md`) provides creative volume.",
        cumulativeReachPct: 50,
      },
      {
        day: 12,
        channel: "email",
        label: "Value reframe — competitor compare + Brunson stack slide preview",
        transcript:
          "Brunson chunk 18 stack slide condensed into email body: '$997 covers custom design + domain + hosting setup = standalone $2,500+ value.' Hormozi 'agency aggregate framing' (`feedback_no_client_names_in_paid_ads.md` allows post-click client names — this is post-click).",
        cumulativeReachPct: 40,
      },
      {
        day: 21,
        channel: "email",
        label: "Social proof — 3 closed in their category (proof > guarantees)",
        transcript:
          "116-Funnels chunk 5 — proof REPLACES guarantees in burned markets (agency-services IS burned). Body: 3 specific case studies in the prospect's category with payment-screenshot screenshots + video case-study links. Brunson chunk 5 (proof distribution everywhere). Hormozi 3-believability-markers-within-5-seconds.",
        cumulativeReachPct: 28,
      },
      {
        day: 30,
        channel: "email",
        label: "Final touch — 'I retire previews after 30 days' (reason-now)",
        transcript:
          "Hormozi reason-now CTA (`reference_hormozi_lead_magnets_frameworks.md` chunk 17+18 — any reason beats no reason; even nonsense reasons outperform no reason). Brunson chunk 9 HSO: hook=preview-retiring scarcity, story=2 mins to claim, offer=Stripe checkout link.",
        cumulativeReachPct: 16,
      },
      {
        day: 45,
        channel: "email",
        label: "POST-CLOSE second-yes — $10k AI System upgrade for manufacturer ICP",
        transcript:
          "Brunson chunk 20 — Second Yes is where ALL the profit lives. Target 30-46% take rate on manufacturer-ICP $997 buyers. Post-purchase only (autopilot framing per `feedback_offer_ladder_two_tiers.md`). 2-min upgrade video (Brunson book-funnel pattern) + Hormozi mid-delivery-ascension. Service businesses NOT eligible (per `project_10k_package_vertical_split.md`).",
        cumulativeReachPct: 8,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // FUNNEL 3: Dream 100 / Manufacturer → $10k Direct
  // Hand-managed, highest-ticket. Brunson Dream-100 work-in track
  // (relationship build) + buy-in track (paid ads to their follower
  // audiences). Ben handles discovery calls personally given the
  // ticket size (Hormozi never-sell-alone with Ben as senior on
  // $10k+ closes). Tilman 63-NOs cadence on outreach persistence.
  // ─────────────────────────────────────────────────────────────────
  {
    segment: "mfg-lookalike",
    audienceTag: "mfg-lookalike",
    emoji: "🏭",
    title: "Dream 100 / Manufacturer → $10k Direct",
    pitch:
      "Hand-managed high-ticket play for top-100 manufacturer ICP entries (Brunson Dream-100 work-in track — chunk 6+7+8). Parallel paid-ads target their podcast/IG/YT follower audiences (buy-in track). Stack slide email drop at D10. Discovery call handled by Ben (not Madie) given ticket size. Tilman 63-NOs cadence — keep going, one yes unlocks the cascade. Attribution: any non-inbound prospect with category in MANUFACTURER_CATEGORIES (mfg-*) — covers scouted manufacturers + manually-added Dream-100 entries.",
    accentText: "text-fuchsia-300",
    cardClass: "border-fuchsia-500/30 bg-fuchsia-500/[0.04]",
    landingPath: "/agency",
    frameworks: [
      "Brunson Dream 100 (work-in + buy-in)",
      "Brunson stack slide + belief-rewrite",
      "Hormozi never-sell-alone (Ben senior on $10k+)",
    ],
    defaultCounts: {
      total: 32,
      newCount: 11,
      enrolledCount: 8,
      wonCount: 2,
    },
    steps: [
      {
        day: 0,
        channel: "email",
        label: "Dream-100 work-in — personalized email + custom preview already built",
        transcript:
          "Brunson chunk 6+7 work-in track — hand-written. References their specific channel + place-of-origin copy. Preview site IS the hook (Brunson HSO chunk 9 — the preview is a category-of-one hook for cold high-ticket). Hormozi 'lead-with-pain' ad-copy pattern (`reference_hormozi_sales_training.md`).",
        cumulativeReachPct: 100,
      },
      {
        day: 0,
        channel: "ad",
        label: "Dream-100 buy-in — paid ad targets their follower audience (parallel)",
        transcript:
          "Brunson chunk 7 buy-in track runs IN PARALLEL with work-in. Meta + LinkedIn ad targets the follower audience of the dream-100 entry (their podcast listeners, IG followers, FB group members). Tony Robbins 12-yr work-in is the long tail — buy-in compresses the timeline to today.",
        cumulativeReachPct: 75,
      },
      {
        day: 3,
        channel: "voicemail",
        label: "Personalized VM — references their channel + invites 20-min discovery",
        transcript:
          "Hormozi voicemail-drop. Specific: references their podcast/YouTube channel + a specific recent episode/post they made (proves it's not automated). Invites 20-min discovery call with Ben (not generic 'jump on a call').",
        cumulativeReachPct: 55,
      },
      {
        day: 7,
        channel: "linkedin",
        label: "LinkedIn voice note — Brunson HSO at DM altitude",
        transcript:
          "Brunson chunk 9 recursive HSO — voice note format is the hook (most cold DMs are text, voice stops the scroll). Story: 30-second 'why I built you a preview.' Offer: 20-min discovery. Joel content-ladder principle (`reference_hormozi_joel_frameworks.md`).",
        cumulativeReachPct: 38,
      },
      {
        day: 10,
        channel: "email",
        label: "Stack slide drop — 17 Universal + 4 Manufacturer modules + value math",
        transcript:
          "Brunson chunk 18+19 stack slide as email body. Each module gets a $-value line. Total ≈ $50k+ vs $10k price. Hormozi 'sell at the point of greatest deprivation' (`reference_hormozi_lead_magnets_frameworks.md` chunk 12) — by D10 the prospect has consumed the preview + voicemail + LinkedIn DM and is most aware of their problem.",
        cumulativeReachPct: 28,
      },
      {
        day: 15,
        channel: "call",
        label: "Discovery call with BEN (high-ticket = senior; not Madie)",
        transcript:
          "Hormozi 'never-sell-alone' — but inverted: $10k+ closes get the senior, not the closer-in-training. Ben handles. Brunson chunk 17 belief-rewrite stories deployed. CLOSER framework (`reference_hormozi_sales_training.md`).",
        cumulativeReachPct: 18,
      },
      {
        day: 20,
        channel: "call",
        label: "Mock backend showcase + closing call (Hormozi card-on-hand)",
        transcript:
          "Live mock-backend tour at /clients/<slug>/portal — Ben drives, prospect sees the AI System backend they'd actually get. Hormozi card-on-hand close. Brunson stack slide live-walked. Annie default-close (`reference_hormozi_annie_frameworks.md`).",
        cumulativeReachPct: 12,
      },
      {
        day: 25,
        channel: "call",
        label: "$10k close — Stripe Payment Link + $200 move-forward discount pre-framed",
        transcript:
          "Luis $200 move-forward discount pattern (`reference_hormozi_luis_frameworks.md`) — pre-framed during the D15+D20 calls so the close-call payment ask feels like a thank-you, not a discount-grab. Stripe Payment Link generated mid-call. BAM-FAM (Annie). Brunson LTV philosophy: never the last sale — second-yes ladder activates on Day 1 of fulfillment.",
        cumulativeReachPct: 8,
      },
    ],
  },
];
