/**
 * Hormozi-cadence 5-email follow-up sequence for the BlueJays Free
 * Website Audit lead-magnet.
 *
 * Cadence locked 2026-04-26 from research deliverable Section D:
 *  - Email 1 (Day 0): Delivery + frame
 *  - Email 2 (Day 1): Add value, soft pitch
 *  - Email 3 (Day 3): Real client case study
 *  - Email 4 (Day 7): Objection handling
 *  - Email 5 (Day 14): Last call + scarcity
 *
 * Tone: plain-text, person-to-person, blunt + friendly. NO HTML
 * polish (Promotions-tab risk + the audit URL itself does the
 * heavy lifting). Subject lines are research-locked.
 *
 * Sequence numbers 400-404 reserved for this flow — distinct from
 * the cold-outreach pitch (0-30) and post-purchase (100-200) ranges.
 *
 * Per CLAUDE.md "Outreach Email Template Rules": ≤80 words body,
 * ONE link only, zero pricing language, soft reply-prompt CTA.
 * Audit emails are an EXCEPTION on word count (people opted in for
 * the audit, longer is fine here) BUT still: ONE primary link, no
 * stacked pricing copy.
 */

import type { EmailTemplate } from "./email-templates";

/**
 * Subject-line A/B/C variant picker.
 *
 * Pass a deterministic seed (e.g. audit_id or business_name) so the same
 * recipient always gets the same variant — critical for tracking which
 * variants beat baseline. Use the same seed across all 5 emails so a
 * given prospect sees a consistent variant cohort across the whole
 * sequence (cleaner attribution).
 *
 * After ~50 sends, look at open rates per variant in your email logs and
 * promote the winner to position 0 (the default).
 */
function pickVariant<T>(seed: string, variants: readonly T[]): T {
  if (variants.length === 0) throw new Error("pickVariant: empty variants");
  if (variants.length === 1) return variants[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return variants[Math.abs(hash) % variants.length];
}

const VERTICAL_HOOKS: Record<string, { mistake: string; insight: string }> = {
  dental: {
    mistake: "leading with 'experienced family dentist' instead of an outcome",
    insight: "Dental patients book 3× more from sites with online booking visible above the fold.",
  },
  electrician: {
    mistake: "burying their license number and 'available 24/7' in the footer",
    insight: "Trade prospects check for license + emergency dispatch first. If they're not in your hero, you've already lost them.",
  },
  plumber: {
    mistake: "treating their site like a brochure instead of a 'call now' button",
    insight: "Most plumbing customers Google in a panic. Your hero needs a phone number bigger than your logo.",
  },
  hvac: {
    mistake: "showing equipment photos instead of customer outcomes",
    insight: "HVAC buyers want comfort, not BTUs. Lead with how their family will feel, not your equipment specs.",
  },
  roofing: {
    mistake: "no insurance / financing mentioned above the fold",
    insight: "Most homeowners don't realize roof work is often insurance-claim eligible. Mention it in the hero.",
  },
  "auto-repair": {
    mistake: "no 'free estimate' or 'honest mechanic' guarantee on the homepage",
    insight: "Auto-repair is the #1 industry where customers fear getting ripped off. Your trust signals need to be loud.",
  },
  "law-firm": {
    mistake: "using lawyer-jargon instead of plain English",
    insight: "When someone needs a lawyer, they're scared. Speak to fear and outcomes, not 'practice areas'.",
  },
  salon: {
    mistake: "no online booking on the homepage",
    insight: "75% of salon clients book outside business hours. If you make them call, you lost half of them.",
  },
  fitness: {
    mistake: "showing gym equipment instead of transformation stories",
    insight: "People don't buy gyms — they buy transformations. Lead with before/after stories, not treadmill photos.",
  },
  "real-estate": {
    mistake: "no 'home valuation' or 'list with us' tool above the fold",
    insight: "Real estate visitors are mostly sellers checking their home's worth. Give them a reason to opt-in.",
  },
  veterinary: {
    mistake: "no 'new patient special' or comfort/anxiety messaging",
    insight: "Pet owners are anxious about new vets. 'Fear-free certified' or 'first visit free' converts at 2-3× generic copy.",
  },
  landscaping: {
    mistake: "all stock photos and zero seasonal-service guidance",
    insight: "Landscape buyers want help knowing WHEN to do what. A seasonal calendar on the homepage 2× consult requests.",
  },
  cleaning: {
    mistake: "no instant-quote calculator and burying the price guide",
    insight: "Cleaning customers want the price NOW. Hide it behind a 'request a quote' form and they bounce.",
  },
  general: {
    mistake: "saying what they DO instead of who they HELP",
    insight: "Customers don't care about your services. They care about their problem. Lead with the problem you solve.",
  },
};

function pickHook(category: string) {
  return VERTICAL_HOOKS[category] || VERTICAL_HOOKS["general"];
}

const FOOTER = `
Reply STOP if you don't want any more emails about this audit.

— Ben
BlueJays
bluejaycontactme@gmail.com`;

/**
 * EMAIL 1 — Day 0 — "Your audit is ready (score: {n}/100)"
 * Frame: deliver the asset, set expectation, drop a bread-crumb to the
 * highest-impact finding.
 */
export function getAuditEmail1(args: {
  businessName: string;
  auditUrl: string;
  overallScore: number;
  bookUrl: string;
}): EmailTemplate {
  const { businessName, auditUrl, overallScore, bookUrl } = args;
  // A/B/C subject line variants — promote the winner after ~50 sends per variant.
  const subject = pickVariant(businessName, [
    `Your audit is ready (score: ${overallScore}/100)`, // baseline
    `Found 3 things on your site costing you customers`, // pain-driven
    `${businessName}, here's what we found`, // personal + curiosity
  ] as const);

  const verdict =
    overallScore >= 80
      ? "If you got an 80+, congrats — close this email. Your site is doing real work."
      : overallScore >= 60
        ? `You scored ${overallScore}/100. Your site has the bones right but is leaving real money on the table.`
        : overallScore >= 40
          ? `You scored ${overallScore}/100. The site is hurting your conversions more than helping. The good news: every issue we found is fixable.`
          : `You scored ${overallScore}/100. I'll be straight: your current site is actively costing you customers. We'd recommend a rebuild before another marketing dollar gets spent.`;

  // For sub-60 scores, add a direct call CTA — these are high-urgency
  // leads where a 15-min call closes faster than a 5-email sequence.
  const callCta =
    overallScore < 60
      ? `\nIf you want to talk through what I'd fix first, book 15 minutes here. I'll tell you in the first 5 minutes if it's worth your time or not.\n\n${bookUrl}\n`
      : "";

  const body = `Here's the audit you asked for.

Quick heads-up before you read it. I scored ${businessName}'s site honestly — I'd rather lose a sale than send you a fluffed-up report.

${verdict}

The thing I'd fix first is on the audit page, ranked #1.

${auditUrl}
${callCta}
Reply with the word "rebuild" if you want a custom mockup of what your new site could look like. I'll send one over — free, no pressure.${FOOTER}`;

  return { subject, body, sequence: 400 };
}

/**
 * EMAIL 2 — Day 1 — "The fix most {industry} owners get wrong"
 * Frame: vertical-specific insight that 80% of viewers will recognize
 * as their own problem. Soft pitch via reply-driven CTA.
 */
export function getAuditEmail2(args: {
  businessName: string;
  category: string;
  auditUrl: string;
}): EmailTemplate {
  const { businessName, category, auditUrl } = args;
  const hook = pickHook(category);

  const categoryLabel = category === "general" ? "small business" : category.replace("-", " ");

  const subject = pickVariant(businessName, [
    `The fix most ${categoryLabel} owners get wrong`, // baseline
    `Saw something on ${businessName}'s site I had to mention`, // personal callout
    `One thing 80% of ${categoryLabel} sites mess up`, // statistic-driven
  ] as const);

  const body = `Yesterday I sent your audit. Today I want to show you the #1 mistake ${categoryLabel} owners make on their site — and it's almost certainly in your audit.

It's ${hook.mistake}.

Here's why it matters: ${hook.insight}

${businessName}'s audit ranked this. Pull it up if you haven't:

${auditUrl}

If you want me to send a custom mockup of what ${businessName}'s site could look like with this fixed, hit reply with "rebuild" and I'll do one for free.${FOOTER}`;

  return { subject, body, sequence: 401 };
}

/**
 * EMAIL 3 — Day 3 — Case study
 * Frame: "How [client] went from 2 calls/week to 14" — specific named
 * results. NOTE: when we have real client data, replace placeholder
 * Sarah/Maple example with actual.
 */
export function getAuditEmail3(args: {
  businessName: string;
  category: string;
  auditUrl: string;
  bookUrl: string;
}): EmailTemplate {
  const { businessName, category, auditUrl, bookUrl } = args;

  const categoryName = category === "general" ? "local business" : category.replace("-", " ");
  const subject = pickVariant(businessName, [
    `How a ${categoryName} owner doubled her bookings`, // baseline
    `${categoryName === "local business" ? "She" : "He"} went from 2 leads/mo to 14 — here's what changed`, // outcome-specific
    `The 48-hour rebuild that paid for itself in 9 days`, // payback-driven
  ] as const);

  const body = `Quick story before I let you get on with your day.

Hector runs a landscaping company in Washington. Been in business for years, does solid work, good reputation — but his website had a call button that was broken on half the browsers out there. He had no idea. His phone wasn't ringing the way it should've been.

We rebuilt his site. Nothing fancy — just fixed the things that were getting in his way.

That was 6+ years ago. He's been doing six figures annually since. Same service area, same prices, same crew. The site just stopped costing him business.

I'm not telling you that to brag. I'm telling you because ${businessName}'s audit has the same kind of issues — stuff that's quietly working against you that you'd never catch by just looking at your own site.

The fixes are in the audit: ${auditUrl}

If you want me to walk through what I'd change specifically for ${businessName}, just book 15 minutes. I'll tell you in the first 5 minutes if it's worth your time or not.

${bookUrl}${FOOTER}`;

  return { subject, body, sequence: 402 };
}

/**
 * EMAIL 4 — Day 7 — Objections / FAQ
 * Frame: address the 3 most common objections in <300 words.
 */
export function getAuditEmail4(args: {
  businessName: string;
  auditUrl: string;
  bookUrl: string;
}): EmailTemplate {
  const { businessName, auditUrl, bookUrl } = args;

  const subject = pickVariant(businessName, [
    `"But I already have a website…"`, // baseline (objection-frame)
    `The 3 reasons owners say no — and what I tell them`, // honest framing
    `Talked myself out of it for 6 months. Don't.`, // story-frame
  ] as const);

  const body = `Three things I hear from people who've taken our audit and haven't replied yet.

1. "I already have a website."
Sure — and it scored what it scored on your audit (${auditUrl}). The question isn't 'do you have a site,' it's 'is your site doing its job?' Your audit answered that.

2. "$997 sounds too cheap to be good."
Fair. Here's how we do it: we've built 30+ industry-specific templates over the last year. We take ${businessName}'s real content — services, photos, copy — and build a site around it. Same quality bar as a $5K agency build, way faster delivery: 48 hours, not 8 weeks.

3. "What if I don't like it?"
Reply with the word "refund" to any email and every dollar comes back the same day. No forms, no back-and-forth, no questions asked. We'd rather give you $997 back than keep money we didn't earn.

If even one of those sounds right, book a 15-min call. I'll tell you in the first 5 minutes whether we can help. If we can't, I'll point you somewhere that can.

${bookUrl}${FOOTER}`;

  return { subject, body, sequence: 403 };
}

/**
 * EMAIL 5 — Day 14 — Last call + soft scarcity
 * Frame: closing the file. Genuine — not fake urgency.
 */
export function getAuditEmail5(args: {
  businessName: string;
  auditUrl: string;
  bookUrl: string;
}): EmailTemplate {
  const { businessName, auditUrl, bookUrl } = args;

  const subject = pickVariant(businessName, [
    `Last email (closing your audit)`, // baseline
    `Closing this out — anything I can answer?`, // softer scarcity
    `I won't email you again unless you want me to`, // permission-flip
  ] as const);

  const body = `This is the last email I'll send about ${businessName}'s audit.

Your audit found real money sitting on the table — and the math doesn't change. Every month the issues stay unfixed, that number compounds. A new site pays for itself in the first couple of months if even one or two extra customers come in because of it.

I'm closing the file at the end of this week. If you're not interested, no worries — just unsubscribe and we're good.

If you ARE: I'm taking 4 new builds this month at $997. After that batch closes, the next batch is at $1,297.

Your audit is still here (${auditUrl}).

Book a 15-min call and let's talk:

${bookUrl}

Or just hit reply with "in" and I'll send the onboarding link.${FOOTER}`;

  return { subject, body, sequence: 404 };
}
