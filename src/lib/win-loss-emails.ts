/**
 * Win-loss survey email — fires once per prospect when they hit
 * dismissed / unsubscribed status without ever paying for the AI
 * Package ($9,700 tier).
 *
 * Goal: get a one-line reply from the prospect explaining WHY they
 * walked. Five categories cover most: price, timing, fit, competitor,
 * "we just decided to wait." Without this data, funnel optimization
 * is blind — Hormozi's win-loss feedback loop (Rule 45).
 *
 * Tone: warm, low-pressure, explicit "no worries if not." Most owners
 * actually answer if you make it easy and ask once. Replying once is
 * a 30-sec lift; we never re-ask.
 *
 * Sequence number 250 reserved (separate range from cold-outreach
 * pitch 0-30, post-purchase 100-200, audit 400-499).
 */

import type { EmailTemplate } from "./email-templates";

export function getWinLossSurveyEmail(args: {
  businessName: string;
  ownerFirstName?: string;
}): EmailTemplate {
  const { businessName } = args;
  const name = args.ownerFirstName || "there";

  const subject = `Quick — what got in the way for ${businessName}?`;

  const body = `Hi ${name},

Saw ${businessName} ended up not moving forward with the AI Marketing System and I just wanted to ask — totally no pressure, just trying to learn:

What got in the way?

If you reply with one of these (or just a sentence), I'd really appreciate it:

  · Price — too expensive for where you're at
  · Timing — bad week / month, might revisit later
  · Fit — wasn't right for your business specifically
  · Competitor — went with another agency / DIY approach
  · Just decided to wait

Reply once and I won't email you again. Genuinely just trying to make the offer better for the next ${businessName} I talk to.

Worst case scenario — you ignore this and life moves on, no harm done.

Best,
Ben

— Ben Freeman
Founder, BlueJays
ben@bluejayportfolio.com

—
You can ignore or reply STOP anytime.`;

  return { subject, body, sequence: 250 };
}
