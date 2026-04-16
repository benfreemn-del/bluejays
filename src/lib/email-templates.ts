import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";

/**
 * Deterministic A/B variant assignment — same prospect always gets the same variant.
 * Uses a simple hash of the prospect ID so Ben can compare results per-variant in analytics.
 * Variant "A" ≈ 50% of prospects, variant "B" ≈ 50%.
 */
export function getSubjectVariant(prospectId: string): "A" | "B" {
  let hash = 0;
  for (let i = 0; i < prospectId.length; i++) {
    hash = (hash * 31 + prospectId.charCodeAt(i)) >>> 0;
  }
  return hash % 2 === 0 ? "A" : "B";
}

export interface EmailTemplate {
  subject: string;
  body: string;
  sequence: number;
  /** A/B subject line variant — undefined for follow-up emails (only set on initial pitch) */
  subjectVariant?: "A" | "B";
}

/**
 * CAN-SPAM compliant email footer.
 * Appended to every outbound email in the funnel.
 */
export const EMAIL_FOOTER = `
—
BlueJays Business Solutions | Washington, USA
You're receiving this because we built a free website for your business.
Unsubscribe: {{baseUrl}}/unsubscribe/{{prospectId}}
`;

function buildVideoBlock(videoUrl?: string) {
  if (!videoUrl) return "";

  return `
I also recorded a quick personalized walkthrough of the site so you can see the full vision in under 90 seconds:

${videoUrl}
`;
}

export function getPitchEmail(
  prospect: Prospect,
  previewUrl: string,
  videoUrl?: string,
  proposalUrl?: string,
): EmailTemplate {
  const name =
    prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const category = CATEGORY_CONFIG[prospect.category].label;
  const hasWebsite = !!prospect.currentWebsite;
  const city = prospect.city || prospect.address?.split(",")[0] || "";

  // A/B test: variant A is curiosity-driven, variant B is direct/value-driven
  const variant = getSubjectVariant(prospect.id);
  const subject =
    variant === "A"
      ? `${name}, I made something for ${prospect.businessName}`
      : `New website ready for ${prospect.businessName} — take a look`;

  const discoveryLine = hasWebsite
    ? `I found ${prospect.businessName} while searching for top-rated ${category.toLowerCase()} businesses${city ? ` in ${city}` : ""} — your reviews stood out.`
    : `I was looking for ${category.toLowerCase()} businesses${city ? ` in ${city}` : ""} and came across ${prospect.businessName} — but noticed you don't have a website yet.`;

  const proposalBlock = proposalUrl
    ? `\nI also put together a short personalized analysis — specific to your business, with an ROI breakdown and a side-by-side comparison against agency pricing:\n${proposalUrl}\n`
    : "";

  const body = `Hi ${name},

${discoveryLine}

I thought to myself — this business clearly does great work. But does their website reflect that? So I built one that does.

See your site: ${previewUrl}
${buildVideoBlock(videoUrl)}${proposalBlock}
Your customers are searching for ${category.toLowerCase()} services online right now. When they find you, what do they see? A site like this makes sure their first impression matches the quality of your work.

See more ${category.toLowerCase()} sites we've built: https://bluejayportfolio.com/v2/${prospect.category}

Want to see it in action? Book a quick 15-min walkthrough — I'll show you everything live: https://calendly.com/bluejaycontactme/website-walkthrough

— Ben @ BlueJays
bluejaycontactme@gmail.com
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`;

  return { subject, body, sequence: 1, subjectVariant: variant };
}

export function getFollowUp1(
  prospect: Prospect,
  previewUrl: string,
  videoUrl?: string,
): EmailTemplate {
  const name =
    prospect.ownerName?.split(" ")[0] || prospect.businessName;

  return {
    subject: `${name} — quick question about your new site`,
    body: `Hi ${name},

Quick thought — every day without a strong website, ${prospect.businessName} is invisible to customers who are actively searching for what you do.

I built this for you: ${previewUrl}
${buildVideoBlock(videoUrl)}
Think about it: when someone Googles "${prospect.category.replace("-", " ")}" in your area, they find your competitors first. A site like this changes that — it puts you front and center.

How many customers are you losing to businesses with better websites but worse service? Probably more than you think.

15 minutes and I'll show you exactly how this works: https://calendly.com/bluejaycontactme/website-walkthrough

— Ben
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`,
    sequence: 2,
  };
}

export function getFollowUp2(
  prospect: Prospect,
  previewUrl: string,
  videoUrl?: string,
): EmailTemplate {
  const name =
    prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const category = CATEGORY_CONFIG[prospect.category].label;

  return {
    subject: `I looked at your current site, ${name} — here's the side-by-side`,
    body: `Hi ${name},

I'll be honest — I built this site for ${prospect.businessName} because I genuinely believe your work deserves to be seen. And right now, it's not getting the attention it should online.

Compare for yourself: ${previewUrl}
${buildVideoBlock(videoUrl)}
Your competitors in the ${category.toLowerCase()} space are investing in their online presence. The businesses that win aren't always the best at what they do — they're the best at being found.

You're clearly great at what you do. Let's make sure your website tells that story.

This preview stays live for 30 days, then I move on. If you want to chat about it, pick a time: https://calendly.com/bluejaycontactme/website-walkthrough

See what we've built for other ${category.toLowerCase()} businesses: https://bluejayportfolio.com/v2/${prospect.category}

— Ben
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`,
    sequence: 3,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Post-purchase lifecycle emails
// ─────────────────────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

/**
 * Day-30 referral invite — sent to paid clients 30 days after payment.
 * Includes a unique referral link; referred businesses get tracked back to this client.
 * Referrer gets $50 off their next $100/yr renewal for each successful referral.
 */
export function getReferralEmail(
  prospect: Prospect,
  referralCode: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const category = CATEGORY_CONFIG[prospect.category].label;
  const referralUrl = `${BASE}?ref=${referralCode}`;

  return {
    subject: `${name} — a thank-you + something for your network`,
    body: `Hi ${name},

It's been about a month since ${prospect.businessName} went live — I hope customers are already finding you online!

I wanted to reach out with a quick thank-you, and a little offer:

If you know any other local business owners who could use a premium website, send them your personal link:

${referralUrl}

Every business that claims a site through your link earns you $50 off your next annual renewal. No limit — the more you refer, the more you save.

Most of our best clients come from referrals because you're already vouching for the work. A roofing company, a dentist, an auto shop — if they have a business, they need a site.

Thanks again for trusting us with ${prospect.businessName}'s online presence.

— Ben @ BlueJays
bluejaycontactme@gmail.com

P.S. See what we've built for other ${category.toLowerCase()} businesses and all other industries at ${BASE}.`,
    sequence: 0,
  };
}

/**
 * Formal site handoff email — sent when Ben marks the site as delivered.
 * Covers domain credentials, $100/yr plan, how to request changes, and contact info.
 */
export function getHandoffEmail(
  prospect: Prospect,
  liveUrl: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;

  return {
    subject: `🎉 ${prospect.businessName} is live — here's everything you need`,
    body: `Hi ${name},

Your website is live! Here's your complete handoff document — save this email, it has everything you need.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR LIVE SITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${liveUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT'S COVERED — $100/YEAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your annual maintenance plan renews automatically each year and covers:
  ✓ Domain renewal (so you never lose your domain)
  ✓ Hosting fees (your site stays online, always)
  ✓ Ongoing maintenance and security updates
  ✓ Support — email us any time at bluejaycontactme@gmail.com
  ✓ Minor content updates on request (hours, phone, services)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO REQUEST CHANGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email bluejaycontactme@gmail.com with:
  • What you want changed
  • New text, photos, or info to use
  • "CHANGE REQUEST" in the subject line

Most updates are turned around within 48 hours.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO SEND US MATERIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New photos, your logo, a refreshed bio — just email them to bluejaycontactme@gmail.com.
Or upload anytime at: ${BASE}/onboarding/${prospect.id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ben @ BlueJays
bluejaycontactme@gmail.com
${BASE}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Congratulations, ${name}. Your work deserves to be found — and now it will be.

— Ben`,
    sequence: 0,
  };
}

/**
 * Monthly performance report — sent to paid clients once a month.
 * Shows proxy metrics since we don't have GA integration yet; prompts client renewal awareness.
 */
export function getMonthlyReportEmail(
  prospect: Prospect,
  liveUrl: string,
  monthName: string,
  daysLive: number,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const renewalReminder =
    daysLive >= 335
      ? `\n⚠️  Your annual plan renews soon. We'll send a reminder before any charge — nothing changes on your end.\n`
      : "";

  return {
    subject: `${prospect.businessName} — your ${monthName} website update`,
    body: `Hi ${name},

Quick monthly check-in on ${prospect.businessName}'s website.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR SITE (${daysLive} days live)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${liveUrl}
${renewalReminder}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIPS TO GET MORE FROM YOUR SITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📌 Add your website URL to your Google Business Profile — this is the #1 traffic driver
  📱 Put your website URL in your Instagram bio and Facebook "About" section
  🌟 Ask happy customers to leave a Google review and mention your website
  📇 Add the URL to your business cards, invoices, and email signature
  📸 Send us new photos anytime — fresh content keeps Google happy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEED ANYTHING CHANGED?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New hours, updated services, a team photo — just reply to this email and we'll update it within 48 hours. It's included in your plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

— Ben @ BlueJays
bluejaycontactme@gmail.com`,
    sequence: 0,
  };
}
