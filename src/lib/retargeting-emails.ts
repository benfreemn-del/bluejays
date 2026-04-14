/**
 * Retargeting Email Sequence
 *
 * Secondary email sequence for prospects who showed engagement but didn't convert:
 * - Opened emails but didn't click → "Opener" segment
 * - Clicked but didn't claim → "Clicker" segment
 *
 * Key differences from the main funnel:
 * - Shorter: 3-4 emails max
 * - Warmer tone: acknowledges they've seen the site
 * - Different pain points: focuses on what they're missing, not what we built
 * - More personal: references their specific engagement behavior
 * - Softer CTAs: "take another look" instead of "claim now"
 *
 * Timing: Triggered after the main funnel completes (day 30+) or when
 * engagement signals indicate the prospect is warm but stalled.
 */

import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { EMAIL_FOOTER } from "./email-templates";

export type RetargetSegment = "opener" | "clicker";

export interface RetargetEmail {
  subject: string;
  body: string;
  sequence: number;
  segment: RetargetSegment;
  delayDays: number; // days after retarget enrollment
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function footer(prospectId: string): string {
  return EMAIL_FOOTER
    .replace("{{baseUrl}}", BASE_URL)
    .replace("{{prospectId}}", prospectId);
}

// ═══════════════════════════════════════════════════════════════
// OPENER SEQUENCE — Opened emails but never clicked the preview link
// Strategy: Curiosity + low-commitment CTA + different value angles
// ═══════════════════════════════════════════════════════════════

function getOpenerSequence(prospect: Prospect): RetargetEmail[] {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const biz = prospect.businessName;
  const category = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;
  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl || `/preview/${prospect.id}`}`;
  const proposalUrl = `${BASE_URL}/proposal/${prospect.id}`;

  return [
    {
      subject: `${name}, the site I built for ${biz} is still here`,
      body: `Hey ${name},

Running a ${category.toLowerCase()} business takes serious dedication — I respect that. I just wanted to let you know the website I put together for ${biz} is still live and waiting for you.

I'm not going to pitch you on it. I just genuinely think you'd be impressed if you took 30 seconds to look:

${previewUrl}

No login, no credit card, no commitment. Just a quick peek. The preview stays live for 30 days.

Either way, I'm rooting for ${biz}.

Best,
The BlueJays Team
${footer(prospect.id)}`,
      sequence: 1,
      segment: "opener" as RetargetSegment,
      delayDays: 0,
    },
    {
      subject: `What ${category.toLowerCase()} businesses are doing differently in 2025`,
      body: `Hey ${name},

I work with a lot of ${category.toLowerCase()} businesses, and there's a pattern I keep seeing: the ones that are growing fastest all have one thing in common — a website that actually works for them, not against them.

I'm talking about sites that:
- Show up when people search for "${category.toLowerCase()} near me"
- Look professional on a phone (where most local searches happen)
- Make it dead simple for someone to call or book

That's exactly what I built for ${biz}. It's sitting here ready to go: ${previewUrl}

I put together a quick breakdown of what's included and how it compares to what you'd pay elsewhere: ${proposalUrl}

No pressure at all. Just thought you'd want to know what's possible.

Best,
The BlueJays Team
${footer(prospect.id)}`,
      sequence: 2,
      segment: "opener" as RetargetSegment,
      delayDays: 4,
    },
    {
      subject: `Honest question, ${name}`,
      body: `Hey ${name},

I'll keep this short. I built a custom website for ${biz} a while back, and I've sent you a couple notes about it. I'm not sure if the timing was off or if it just wasn't interesting — either way, totally fine.

But I wanted to ask honestly: is there something specific holding you back? I hear a lot of things from business owners:

- "I already have a website" → Totally fair. The one I built is a modern upgrade, and you can compare them side by side.
- "$997 is too much" → I get it. But that one-time fee includes custom website design, domain registration, and hosting setup. After year one, maintenance is just $100/year for domain renewal, hosting, ongoing maintenance, and support.
- "I don't have time for this" → That's the best part — we handle the setup and ongoing maintenance. You just say "go."

If none of those apply and you're just not interested, I respect that 100%. Just reply "pass" and I won't bother you again.

Wishing you the best,
The BlueJays Team
${footer(prospect.id)}`,
      sequence: 3,
      segment: "opener" as RetargetSegment,
      delayDays: 8,
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// CLICKER SEQUENCE — Clicked the preview but didn't claim
// Strategy: They liked what they saw. Address the gap between interest and action.
// ═══════════════════════════════════════════════════════════════

function getClickerSequence(prospect: Prospect): RetargetEmail[] {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const biz = prospect.businessName;
  const category = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;
  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl || `/preview/${prospect.id}`}`;
  const claimUrl = `${BASE_URL}/claim/${prospect.id}`;
  const compareUrl = `${BASE_URL}/compare/${prospect.id}`;
  const bookingUrl = `${BASE_URL}/book/${prospect.id}`;

  return [
    {
      subject: `${name}, you checked out your new site — what did you think?`,
      body: `Hey ${name},

I noticed you took a look at the website I built for ${biz} — thanks for checking it out! I'd genuinely love to hear what you thought.

A few things worth knowing:
- Everything you saw is just the STARTING POINT. Once you're on board, we customize colors, photos, content, layout — whatever you want.
- It's already mobile-optimized and SEO-ready.
- We handle the custom website design, domain registration, and hosting setup.
- After year one, maintenance is $100/year for domain renewal, hosting, ongoing maintenance, and support.
- 3 other ${category.toLowerCase()} businesses in your area upgraded their sites with us recently — it's becoming the standard for getting found online.

If you liked what you saw but have questions, I'm right here. Or if you'd rather chat with a real person, here's a link to book a quick call: ${bookingUrl}

Your preview stays live for 30 days: ${previewUrl}

Best,
The BlueJays Team
${footer(prospect.id)}`,
      sequence: 1,
      segment: "clicker" as RetargetSegment,
      delayDays: 0,
    },
    {
      subject: `What ${category.toLowerCase()} businesses winning online have in common`,
      body: `Hey ${name},

Quick thought experiment: how many potential customers search for "${category.toLowerCase()} near me" every month in your area?

Industry data says it's probably 500-2,000+ searches. The businesses that show up first with a professional, mobile-friendly site are the ones getting those calls.

The site I built for ${biz} is designed to capture those searches and turn them into phone calls. Here's how it stacks up against what you have now: ${compareUrl}

At $997 one-time, you get the custom website design, domain registration, and hosting setup — or 3 payments of $349 if that's easier. After year one, maintenance is just $100/year for domain renewal, hosting, ongoing maintenance, and support. Most ${category.toLowerCase()} businesses make that back quickly from new customers who found them online.

Your preview stays live for 30 days — after that I'll need to free up the slot: ${claimUrl}

Best,
The BlueJays Team
${footer(prospect.id)}`,
      sequence: 2,
      segment: "clicker" as RetargetSegment,
      delayDays: 3,
    },
    {
      subject: `Quick honest pitch for ${biz}`,
      body: `Hey ${name},

I'll keep this one short. I know you checked out the site, and I hope you liked what you saw.

Here's my honest pitch: for $997 one-time (or 3 payments of $349), you get a professional website that would cost $3,000-$10,000 anywhere else. That fee includes custom website design, domain registration, and hosting setup. After year one, maintenance is just $100/year for domain renewal, hosting, ongoing maintenance, and support. You focus on running your business.

A handful of other ${category.toLowerCase()} businesses have already claimed theirs this month — I just want to make sure you don't miss the window on yours.

If the timing isn't right, I totally understand. But if you're ready, claiming it takes about 2 minutes: ${claimUrl}

Whatever you decide, I wish you and ${biz} nothing but success.

Best,
The BlueJays Team
${footer(prospect.id)}`,
      sequence: 3,
      segment: "clicker" as RetargetSegment,
      delayDays: 7,
    },
    {
      subject: `A free breakdown for ${biz}`,
      body: `Hey ${name},

One last thing before I head out — I wanted to share something useful regardless of what you decide.

Whether or not you claim the full website, I put together a free proposal for ${biz} that breaks down:
- What's working (and not working) with your current online presence
- Specific opportunities to get more customers from Google
- How your site compares to top ${category.toLowerCase()} businesses in your area

It's yours to keep regardless: ${BASE_URL}/proposal/${prospect.id}

If you ever want to revisit the website, it's here: ${previewUrl}

All the best,
The BlueJays Team
${footer(prospect.id)}`,
      sequence: 4,
      segment: "clicker" as RetargetSegment,
      delayDays: 14,
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Get the retargeting email sequence for a prospect based on their segment.
 */
export function getRetargetSequence(
  prospect: Prospect,
  segment: RetargetSegment
): RetargetEmail[] {
  return segment === "opener"
    ? getOpenerSequence(prospect)
    : getClickerSequence(prospect);
}

/**
 * Get a specific retargeting email by segment and sequence number.
 */
export function getRetargetEmail(
  prospect: Prospect,
  segment: RetargetSegment,
  sequenceNumber: number
): RetargetEmail | undefined {
  const sequence = getRetargetSequence(prospect, segment);
  return sequence.find((e) => e.sequence === sequenceNumber);
}

/**
 * Determine which retarget segment a prospect belongs to based on engagement.
 * Returns null if the prospect doesn't qualify for retargeting.
 *
 * Qualification rules:
 * - Must have completed main funnel OR been contacted 30+ days ago
 * - Must NOT be in a stop status (paid, unsubscribed, dismissed)
 * - "clicker" = clicked preview link (status: link_clicked, engaged, or has preview visits)
 * - "opener" = opened emails but never clicked (status: contacted with email opens)
 */
export function determineRetargetSegment(
  prospect: Prospect,
  emailOpens: number,
  emailClicks: number,
  previewVisits: number
): RetargetSegment | null {
  // Don't retarget prospects in terminal states
  const stopStatuses = ["paid", "claimed", "unsubscribed", "dismissed", "interested", "responded"];
  if (stopStatuses.includes(prospect.status)) return null;

  // Don't retarget if funnel is paused (they replied)
  if (prospect.funnelPaused) return null;

  // Clicker segment: clicked links or visited preview but didn't claim
  if (emailClicks > 0 || previewVisits > 0 || prospect.status === "link_clicked") {
    return "clicker";
  }

  // Opener segment: opened emails but never clicked
  if (emailOpens >= 2) {
    return "opener";
  }

  return null;
}

/**
 * Get all retarget sequence metadata (for the funnel simulator).
 */
export function getRetargetSequenceMetadata(): {
  opener: { count: number; totalDays: number };
  clicker: { count: number; totalDays: number };
} {
  return {
    opener: { count: 3, totalDays: 8 },
    clicker: { count: 4, totalDays: 14 },
  };
}
