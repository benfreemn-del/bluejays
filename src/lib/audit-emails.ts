/**
 * Hormozi-cadence 7-email follow-up sequence for the BlueJays Free
 * Website Audit lead-magnet.
 *
 * Cadence (extended 2026-05-07 from 5 to 7 emails per Ben — recovers
 * 80%+ of audit-completed-but-no-purchase prospects who were silently
 * walking out the back door):
 *  - Email 1 (Day 0):  Delivery + frame
 *  - Email 2 (Day 1):  Add value, soft pitch
 *  - Email 3 (Day 3):  Real client case study
 *  - Email 4 (Day 7):  Objection handling
 *  - Email 5 (Day 14): Last call + scarcity (the OLD final)
 *  - Email 6 (Day 30): Capacity-scarcity reopen ("opened 3 spots") · NEW
 *  - Email 7 (Day 60): Hormozi exit offer ("closing your file") · NEW
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
import { MANUFACTURER_CATEGORIES } from "./bluejays-funnels";

/**
 * Product-ICP categories that route to the $10k AI System pitch path
 * (per `project_10k_package_vertical_split.md` + offer-ladder lock at
 * `feedback_offer_ladder_two_tiers.md`). When the audit submitter's
 * category is in this set, Emails 2/3/4 swap to manufacturer-flavored
 * value-drop copy referencing Tekky / ITC / Brunson stack-slide math.
 *
 * SUPERSET of MANUFACTURER_CATEGORIES (the canonical list lives in
 * `bluejays-funnels.ts`). Adds `indie-author` + `ecommerce` because
 * those also get the $10k pitch but aren't on the manufacturer
 * Dream-100 outreach motion (different acquisition funnels but same
 * email branching).
 *
 * Any category NOT in this set defaults to the service-business path
 * ($997 site only). The service emails are the existing copy — proven
 * winners; don't touch.
 */
const PRODUCT_ICP_CATEGORIES = new Set<string>([
  ...MANUFACTURER_CATEGORIES,
  "indie-author",
  "ecommerce",
]);

function isProductIcp(category: string): boolean {
  return PRODUCT_ICP_CATEGORIES.has(category);
}

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

Want a clean copy to share with your team? Hit "Save as PDF" at the top of that page — strips the videos and CTAs, keeps just the score + the ranked fix list.
${callCta}
Reply with the word "rebuild" if you want a custom mockup of what your new site could look like. I'll send one over — free, no pressure.${FOOTER}`;

  return { subject, body, sequence: 400 };
}

/**
 * EMAIL 2 — Day 1 — Value-drop wrapping the #1 objection
 *
 * Per 116-Funnels chunk 13b — every email must be a value drop wrapped
 * around one specific objection, NOT a generic reminder. Brunson HSO
 * recursive framework: hook = curiosity-objection / story = belief-
 * rewrite TRUMP / offer = single soft CTA.
 *
 * Branches on PRODUCT_ICP_CATEGORIES:
 *  - Product ICP (manufacturers / authors / ecommerce) → objection
 *    "Is $10k just a website?" → stack slide math (17 + 4 modules)
 *  - Service businesses → existing vertical-hook copy (proven winner,
 *    don't touch). For these prospects $997 site is the offer, not $10k.
 */
export function getAuditEmail2(args: {
  businessName: string;
  category: string;
  auditUrl: string;
}): EmailTemplate {
  const { businessName, category, auditUrl } = args;

  // ── PRODUCT ICP branch ($10k AI System path) ──────────────────────
  // 116-Funnels chunk 13b — value drop on FAQ #1 ("Is $10k just a website?")
  // Pulls from audit-faq-data.ts entry `price-10k-website` belief-rewrite.
  if (isProductIcp(category)) {
    const subject = pickVariant(businessName, [
      `Why $10k for a website actually isn't a website`, // baseline
      `${businessName} — the 21-module math`, // curiosity + personal
      `If you saw the audit and thought "what would $10k actually buy me"`, // long-tail
    ] as const);

    const body = `Saw you ran the audit on ${businessName}. Quick note before tomorrow's email lands:

Most people who run the audit think the next step is "I should fix my website." That's not actually what we sell.

The $10k AI System is 21 modules. The website is one of them. The other 20 are the engine — AI inbound responder, customer-portal backend, missed-call auto-texter, review funnel, lead-scoring, content engine. Manufacturers like ${businessName} also get 4 bonus modules: distributor portal, B2B quote system, custom-order intake, inventory sync.

Math: ~$50k of standalone value. We charge $10k.

Most agencies sell you a $10k brochure. We sell you a $10k machine that keeps making your money back.

Audit's still here if you want the specifics: ${auditUrl}

Reply with "stack" and I'll send you the full breakdown — what each module does + what it'd cost if you bought it standalone.${FOOTER}`;

    return { subject, body, sequence: 401 };
  }

  // ── SERVICE business branch ($997 site path) ─────────────────────
  // Existing copy — proven winner. Vertical-hook map drives the
  // industry-specific mistake/insight pair.
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
 * EMAIL 3 — Day 3 — Case study + Brunson belief-rewrite via TRUMP story
 *
 * Per Brunson chunk 17 — better story rewrites the limiting belief.
 * Per 116-Funnels chunk 5 — proof distribution replaces guarantees in
 * burned markets.
 *
 * Branches on PRODUCT_ICP_CATEGORIES:
 *  - Product ICP → Tekky case study (manufacturer prospect, $10,000
 *    AI System, inbound doubled in month 1) — direct apples-to-apples
 *  - Service businesses → existing Hector landscaping story
 */
export function getAuditEmail3(args: {
  businessName: string;
  category: string;
  auditUrl: string;
  bookUrl: string;
}): EmailTemplate {
  const { businessName, category, auditUrl, bookUrl } = args;

  // ── PRODUCT ICP branch (Tekky / AI System case study) ────────────
  if (isProductIcp(category)) {
    const subject = pickVariant(businessName, [
      `Tekky — manufacturer + $10,000 + inbound doubled month 1`, // baseline
      `${businessName}, I want to show you a case study before tomorrow`, // curiosity
      `What happens when the AI System actually runs`, // outcome-driven
    ] as const);

    const body = `Quick case study before I let you get on with your day.

Caleb runs Tekky / Zenith Sports — manufacturer, builds soccer training equipment. He took the same audit you took. Scored similar. Had the same skepticism you might be having right now ("$10k for a website? That's insane").

He paid $10,000 in February. First month with the AI System running, his inbound inquiries doubled.

That's not a guarantee — guarantees are dead. Market got burned by too many agencies promising the moon. That's a documented result. The system pays for itself in the first quarter or it doesn't, and you'd know within 90 days.

I'm not telling you Tekky's story to brag. I'm telling you because ${businessName} is a manufacturer like Tekky — and the audit found the same shape of leaks. The 4 manufacturer-bonus modules (distributor portal, B2B quote system, custom-order intake, inventory sync) are specifically why this works for product brands.

Audit's still here: ${auditUrl}

If you want to see Tekky's actual backend — the live mock with the AI inbound responder running, the lead-scoring, the customer portal — book 15 minutes and I'll walk you through it:

${bookUrl}${FOOTER}`;

    return { subject, body, sequence: 402 };
  }

  // ── SERVICE business branch (Hector case — existing proven copy) ─
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
 * EMAIL 4 — Day 7 — Top 3 objections + Brunson belief-rewrite
 *
 * Per 116-Funnels chunk 13a — the objections every business owner asks
 * surface here in email form (mirror of the audit page FAQ accordion).
 * Per Brunson chunk 17 — each TRUMP story rewrites the limiting belief
 * with a concrete narrative.
 *
 * Branches on PRODUCT_ICP_CATEGORIES:
 *  - Product ICP → top 3 from locked FAQ stack (audit-faq-data.ts):
 *    #1 "Is $10k just a website?" / #3 "How fast does it pay back?" /
 *    #5 "Why trust you over an agency?"
 *  - Service businesses → existing $997 objection trio (proven copy)
 */
export function getAuditEmail4(args: {
  businessName: string;
  category: string;
  auditUrl: string;
  bookUrl: string;
}): EmailTemplate {
  const { businessName, category, auditUrl, bookUrl } = args;

  // ── PRODUCT ICP branch (top 3 from locked FAQ stack) ─────────────
  if (isProductIcp(category)) {
    const subject = pickVariant(businessName, [
      `The 3 objections every product owner asks first`, // baseline
      `${businessName} — top 3 questions before you book`, // personal
      `"Why $10k?" + "Will it ROI?" + "Why you?" — short answers`, // long-tail curiosity
    ] as const);

    const body = `Three questions every manufacturer asks before booking a call. Short answers:

1. "Why $10k? That seems expensive for a website."
The website is 1 of 21 modules. The AI System is the other 20 — AI inbound responder, customer-portal backend, missed-call auto-texter, review funnel, lead-scoring, content engine, plus 4 manufacturer-bonus modules (distributor portal, B2B quote system, custom-order intake, inventory sync). ~$50k of standalone value. We charge $10k. Stack-slide math, not pricing-down.

2. "How fast does it pay back?"
Tekky paid $10,000 in February. First month with the AI System running, their inbound inquiries doubled. Optimum Works (similar-shape business) went $2.5M → $3.6M in 12 months in a public case study. The system pays for itself in the first quarter or it doesn't — and you'd know within 90 days.

3. "Why trust you over an established agency?"
You probably shouldn't, if you can afford to wait 6 months and pay $40k. What you get with me instead: $10k, live in 30-60 days, with a working AI System backend you can actually SEE on a demo call BEFORE you pay. Not slides — the actual backend, live, with real mock data, that becomes yours after purchase.

Audit's still here: ${auditUrl}

If even one of those sounds right, book a 15-min call. I'll tell you in the first 5 minutes whether we're a fit.

${bookUrl}${FOOTER}`;

    return { subject, body, sequence: 403 };
  }

  // ── SERVICE business branch ($997 objection trio — existing copy) ─
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

/**
 * Email 6 — Day 30. Capacity-scarcity reopen. The Hormozi rule: real
 * scarcity > fake scarcity. Ben builds 30 sites/month max; if next
 * month's batch isn't full, he genuinely has slots. This email pulls
 * dormant audit prospects back when there's actual capacity.
 */
export function getAuditEmail6(args: {
  businessName: string;
  auditUrl: string;
  bookUrl: string;
}): EmailTemplate {
  const { businessName, auditUrl, bookUrl } = args;

  const subject = pickVariant(businessName, [
    `Just opened 3 build slots for next month`,
    `${businessName} — capacity update`,
    `Re-opening the audit conversation`,
  ] as const);

  const body = `Quick note — I just opened 3 new build slots for next month and remembered ${businessName}'s audit was sitting unread.

I cap at 30 sites a month so the work stays good. When a slot opens up I work the audit list before I open it to new traffic — figured I'd check if you're still interested before the spot fills.

Same offer: $997 one-time, you see the new site BEFORE you pay, don't love it you don't pay a cent.

Audit is still here if you want a refresher: ${auditUrl}

15 minutes on the phone if you're in:

${bookUrl}

If you've already gone another direction, no stress — just hit reply with "passed" and I'll close your file.${FOOTER}`;

  return { subject, body, sequence: 405 };
}

/**
 * Email 7 — Day 60. Hormozi exit offer. Highest-converting line in
 * the script ("if you say no I'll never call again"). Most yeses
 * actually come 30 seconds AFTER you give the prospect explicit
 * permission to say no. This is the friendly close.
 */
export function getAuditEmail7(args: {
  businessName: string;
  auditUrl: string;
  bookUrl: string;
}): EmailTemplate {
  const { businessName, auditUrl, bookUrl } = args;

  const subject = pickVariant(businessName, [
    `Closing your file — last reply?`,
    `Last email about ${businessName}'s audit`,
    `Pulling the plug unless you say otherwise`,
  ] as const);

  const body = `Last one — I'm closing ${businessName}'s file in our system this week unless you want me to keep it open.

No pitch, no pressure. If you say no right now I won't email again. Most owners I never hear from after the audit, and that's totally fine — most sites really do work well enough for what they need today.

If anything ever changes — slow leads, agency contract ends, you're tired of paying $300/mo for a site that doesn't book calls — just reply "still here" and I'll keep your audit on file.

Audit link in case you want to keep it: ${auditUrl}

If you DO want to talk, 15 min and I'll walk you through what would actually move the needle: ${bookUrl}

Either way — appreciate you running the audit. Best of luck with ${businessName}.${FOOTER}`;

  return { subject, body, sequence: 406 };
}
