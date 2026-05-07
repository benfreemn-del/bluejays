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
 */

import type { FunnelDefLite } from "@/components/portal/FunnelVisualModal";

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
};

export const BLUEJAYS_FUNNELS: BluejaysFunnel[] = [
  {
    segment: "cold-scouted",
    audienceTag: "cold-scouted",
    emoji: "❄️",
    title: "Cold-Scouted Standard ($997)",
    pitch:
      "Auto-scout → preview built → 7-touch email cadence over 30 days. The default BlueJays funnel for every prospect Google Places + Apollo surfaces.",
    accentText: "text-sky-300",
    cardClass: "border-sky-500/20 bg-sky-500/[0.04]",
    landingPath: "/audit",
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
        label: "Day-0 pitch — preview link + ROI hook",
        cumulativeReachPct: 100,
      },
      {
        day: 2,
        channel: "voicemail",
        label: "Ringless voicemail — 30s personalized",
        cumulativeReachPct: 78,
      },
      {
        day: 5,
        channel: "email",
        label: "Gentle follow-up — 'curious what you'd change'",
        cumulativeReachPct: 60,
      },
      {
        day: 12,
        channel: "email",
        label: "Value reframe — competitor compare + 30-day guarantee",
        cumulativeReachPct: 44,
      },
      {
        day: 21,
        channel: "email",
        label: "Social proof — 3 closed in their category nearby",
        cumulativeReachPct: 31,
      },
      {
        day: 30,
        channel: "email",
        label: "Final check-in — 'last touch, want me to retire your preview?'",
        cumulativeReachPct: 18,
      },
    ],
  },

  {
    segment: "inbound-audit",
    audienceTag: "inbound-audit",
    emoji: "🎯",
    title: "Inbound Audit → 3-Fork CTA",
    pitch:
      "Higher-intent: prospect found /audit organically or via paid traffic. Hits the 3-fork CTA hub (Fix it now / Schedule call / Get my preview), then funnels by chosen path.",
    accentText: "text-amber-300",
    cardClass: "border-amber-500/30 bg-amber-500/[0.04]",
    landingPath: "/audit",
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
        label: "Audit submitted — instant 'your report is ready' email",
        cumulativeReachPct: 100,
      },
      {
        day: 0,
        channel: "email",
        label: "CTA hub click — buy / schedule / preview fork chosen",
        cumulativeReachPct: 62,
      },
      {
        day: 2,
        channel: "voicemail",
        label: "Voicemail drop — references their audit number",
        cumulativeReachPct: 38,
      },
      {
        day: 5,
        channel: "email",
        label: "Proposal email — site preview + payment plan options",
        cumulativeReachPct: 22,
      },
      {
        day: 14,
        channel: "email",
        label: "Last call — Stripe link + 'I retire previews after 30 days'",
        cumulativeReachPct: 10,
      },
    ],
  },

  {
    segment: "mfg-lookalike",
    audienceTag: "mfg-lookalike",
    emoji: "🏭",
    title: "Manufacturer Lookalike ($10K Custom)",
    pitch:
      "Manually-managed high-ticket play. Niche manufacturers + product DTC brands matching the ITC/Zenith/Nevarland 3-anchor ICP shape. Hand-written outreach only.",
    accentText: "text-fuchsia-300",
    cardClass: "border-fuchsia-500/30 bg-fuchsia-500/[0.04]",
    landingPath: "/agency",
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
        label: "Hand-written intro — references their channel + place-of-origin copy",
        cumulativeReachPct: 100,
      },
      {
        day: 3,
        channel: "voicemail",
        label: "VM drop — invites a 20-min discovery call",
        cumulativeReachPct: 64,
      },
      {
        day: 7,
        channel: "email",
        label: "Discovery-call summary + custom proposal preview",
        cumulativeReachPct: 38,
      },
      {
        day: 21,
        channel: "email",
        label: "Decision check-in — 3-payment plan reminder",
        cumulativeReachPct: 22,
      },
      {
        day: 30,
        channel: "email",
        label: "Close — Stripe Payment Link for $3,500 deposit",
        cumulativeReachPct: 10,
      },
    ],
  },
];
