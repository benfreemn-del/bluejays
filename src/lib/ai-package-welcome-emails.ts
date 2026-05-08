/**
 * AI Package ($9,700) post-purchase welcome sequence.
 *
 * Three emails over the first 48 hours after a prospect's pricing_tier
 * flips to 'fullsystem' (i.e. the AI Package is paid). Closes the
 * "Day 1 of being a paying client is silent" gap that was costing
 * early-stage trust on every $9.7K close.
 *
 * Cadence:
 *   Email 1 (immediate) · "Welcome — here's what's happening this week"
 *   Email 2 (Day 1)     · "Meet your AI bots" (link to portal AI map)
 *   Email 3 (Day 2)     · "Your first lead lands in X days"
 *
 * Sequence numbers 110-112 reserved for AI Package welcome — distinct
 * from the website-tier welcome (100), onboarding reminders (101-103),
 * and upsell welcomes (200s).
 *
 * Tone: warm + concrete. No marketing-speak, no "we're so excited."
 * Every email tells them exactly what's about to happen + what to
 * expect from BlueJays in the next 24 hours. The promise that gets
 * paid in the next email.
 */

import type { EmailTemplate } from "./email-templates";

const FOOTER = `

— Ben Freeman
Founder, BlueJays
ben@bluejayportfolio.com
(360) 555-0100

—
You're receiving this because you purchased the AI Marketing System.
You can unsubscribe at the bottom of any non-essential email — but
we'll keep emailing you operational updates on your build.`;

/**
 * Email 1 · IMMEDIATE on AI Package payment.
 * Welcome + the 14-day what-to-expect roadmap.
 */
export function getAIPackageWelcome1(args: {
  businessName: string;
  ownerFirstName?: string;
  portalUrl: string;
}): EmailTemplate {
  const { businessName, portalUrl } = args;
  const name = args.ownerFirstName || "there";

  const subject = `${name}, here's what happens this week — ${businessName}`;

  const body = `Hi ${name},

You just bought the AI Marketing System for ${businessName}. Thank you. I take this seriously — let me walk you through exactly what's about to happen so day one isn't a black box.

THIS WEEK
  Day 1 (today): I'm starting your discovery doc — your three audience segments, your competitor scan, and the lead-magnet concept for your industry. You'll get a portal login email tomorrow.
  Day 3: First call. 30 minutes. We confirm audience targeting + walk through the funnel mock I built for you.
  Day 7: Your custom site goes live in staging. You get the link + revisions process.
  Day 14: Ad accounts up, funnel sequences live, first lead in your inbox.

WHAT I NEED FROM YOU
  Just confirm this email landed. Reply with "got it" — that's it for today. I'll send your portal login + onboarding form tomorrow morning.

TIMELINE GUARANTEE
  100 qualified leads in 90 days from go-live. If we don't hit it, we keep working at no additional cost until we do. That's in writing.

Your portal (you'll set this up tomorrow):
${portalUrl}

I'll be your single point of contact through the whole build. Direct phone, direct email — no account managers, no rotating reps.

Welcome aboard.${FOOTER}`;

  return { subject, body, sequence: 110 };
}

/**
 * Email 2 · Day 1 (24h after payment).
 * Meet the AI stack — links to the portal AI bot map.
 */
export function getAIPackageWelcome2(args: {
  businessName: string;
  ownerFirstName?: string;
  portalUrl: string;
  aiSkillsUrl: string;
}): EmailTemplate {
  const { businessName, portalUrl, aiSkillsUrl } = args;
  const name = args.ownerFirstName || "there";

  const subject = `Meet the AI bots running on ${businessName}`;

  const body = `Hi ${name},

Most agencies sell "AI marketing" as a black box. We don't. Here's the visual map of every AI bot now running on ${businessName}'s account:

${aiSkillsUrl}

Each card shows what the bot does, whether it's live yet, and which part of your funnel it touches. Click any one to see the details.

A few highlights:
  Hyperloop A/B — picks the winning ad headlines + email subjects automatically. You don't tweak. It learns.
  AI Inbound Responder — drafts replies to every email in your voice. You hit send.
  Per-audience funnels — three tracks running in parallel, one for each of your customer types.
  Weekly Digest — hits your inbox every Monday with last week's leads + spend + conversion.

Your portal main page lives here:
${portalUrl}

If anything on the bot map is unclear, hit reply and I'll record a 60-second walkthrough video for it.${FOOTER}`;

  return { subject, body, sequence: 111 };
}

/**
 * Email 3 · Day 2 (48h after payment).
 * Concrete countdown to first lead — sets expectation + invites
 * onboarding-form completion as the unblock.
 */
export function getAIPackageWelcome3(args: {
  businessName: string;
  ownerFirstName?: string;
  daysToFirstLead?: number;
  onboardingUrl: string;
}): EmailTemplate {
  const { businessName, onboardingUrl } = args;
  const name = args.ownerFirstName || "there";
  const days = args.daysToFirstLead ?? 12;

  const subject = `${days} days to your first lead — ${businessName}`;

  const body = `Hi ${name},

Quick update on ${businessName}'s build.

WHERE WE ARE TODAY
  Discovery doc: drafted. Three audience segments locked in.
  Funnel architecture: mapped. 3 tracks × email + SMS + voicemail.
  Site copy: in progress, first draft ready Day 4.
  Ad accounts: pending your approval to be added as admin.

WHAT UNBLOCKS YOUR FIRST LEAD FASTEST
  Step 1 of the onboarding form. ~5 minutes. Logo, brand colors, services list. Without this I can't build the polished site — and the polished site is what your ads point at:

${onboardingUrl}

THE COUNTDOWN
  Most clients see their first lead ~${days} days after kickoff. The exact number depends on (a) ad-account approval speed (Meta is 3-7 days) and (b) how fast onboarding step 1 lands. If both happen this week, you're closer to ${Math.max(8, days - 4)} days.

I'll send a status email Friday with a real ETA based on where we are.

Talk Friday.${FOOTER}`;

  return { subject, body, sequence: 112 };
}
