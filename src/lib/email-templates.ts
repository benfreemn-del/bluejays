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

const CONTACT_EMAIL = process.env.FROM_EMAIL || "ben@bluejayportfolio.com";
const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

/**
 * CAN-SPAM compliant email footer.
 * Appended to every outbound email in the funnel.
 */
export const EMAIL_FOOTER = `
—
BlueJays | bluejayportfolio.com | Washington, USA
You're receiving this because we built a free website preview for your business.
Unsubscribe: {{baseUrl}}/unsubscribe/{{prospectId}}
`;

export function getPitchEmail(
  prospect: Prospect,
  previewUrl: string,
  videoUrl?: string,
  proposalUrl?: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
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
    : `I was searching for ${category.toLowerCase()} businesses${city ? ` in ${city}` : ""} and came across ${prospect.businessName} — noticed you don't have a website yet.`;

  const proposalBlock = proposalUrl
    ? `\nI also put together a short personalized breakdown — ROI estimate, what's included, and how it compares to agency pricing:\n${proposalUrl}\n`
    : "";

  const videoBlock = videoUrl
    ? `\nI recorded a quick 90-second walkthrough of the site if you'd rather watch than click:\n${videoUrl}\n`
    : "";

  const footer = EMAIL_FOOTER
    .replace("{{baseUrl}}", BASE)
    .replace("{{prospectId}}", prospect.id);

  const body = `Hi ${name},

${discoveryLine}

Your work clearly speaks for itself — but does your online presence? I went ahead and built a website that does.

See it here: ${previewUrl}
${videoBlock}${proposalBlock}When someone searches for ${category.toLowerCase()} services${city ? ` in ${city}` : ""} right now, they're choosing based on what they see online first. This makes sure that first impression matches the quality of your work.

More ${category.toLowerCase()} examples: ${BASE}/v2/${prospect.category}

If you want a 15-min walkthrough, I'll show you everything live — no pressure: https://calendly.com/bluejaycontactme/website-walkthrough

— Ben
${CONTACT_EMAIL}
${footer}`;

  return { subject, body, sequence: 1, subjectVariant: variant };
}

export function getFollowUp1(
  prospect: Prospect,
  previewUrl: string,
  videoUrl?: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const category = CATEGORY_CONFIG[prospect.category].label;
  const city = prospect.city || "";

  const videoBlock = videoUrl
    ? `\nWalkthrough video (90 seconds): ${videoUrl}\n`
    : "";

  const footer = EMAIL_FOOTER
    .replace("{{baseUrl}}", BASE)
    .replace("{{prospectId}}", prospect.id);

  return {
    subject: `${name} — quick question about your new site`,
    body: `Hi ${name},

Wanted to follow up on the website preview I sent over for ${prospect.businessName}.

${previewUrl}
${videoBlock}
When someone searches "${category.toLowerCase()}${city ? ` ${city}` : ""}" right now, the businesses with a strong online presence win the click — regardless of who does better work.

I built this so ${prospect.businessName} is the one they find first.

Happy to walk you through it live: https://calendly.com/bluejaycontactme/website-walkthrough

— Ben
${footer}`,
    sequence: 2,
  };
}

export function getFollowUp2(
  prospect: Prospect,
  previewUrl: string,
  videoUrl?: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const category = CATEGORY_CONFIG[prospect.category].label;

  const videoBlock = videoUrl
    ? `\nWalkthrough video: ${videoUrl}\n`
    : "";

  const footer = EMAIL_FOOTER
    .replace("{{baseUrl}}", BASE)
    .replace("{{prospectId}}", prospect.id);

  return {
    subject: `Last note on this, ${name}`,
    body: `Hi ${name},

I'll keep this short — I genuinely think ${prospect.businessName} deserves a better online presence, so I built one.

${previewUrl}
${videoBlock}
The preview stays live for 30 days. After that I move on. If you ever want to revisit it, I'm easy to reach.

See what we've done for other ${category.toLowerCase()} businesses: ${BASE}/v2/${prospect.category}

— Ben
${footer}`,
    sequence: 3,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Post-purchase lifecycle emails
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Day-30 referral invite — sent to paid clients 30 days after payment.
 */
export function getReferralEmail(
  prospect: Prospect,
  referralCode: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const category = CATEGORY_CONFIG[prospect.category].label;
  const referralUrl = `${BASE}?ref=${referralCode}`;

  return {
    subject: `${name} — a quick thank-you and something for your network`,
    body: `Hi ${name},

It's been about a month since ${prospect.businessName} went live — hope customers are already finding you online.

Quick thank-you, and a small offer:

If you know any other local business owners who could use a premium website, share your personal link:

${referralUrl}

Every business that claims a site through your link earns you $50 off your next annual renewal. Roofing, dental, auto shops — if they have a business, they need a site.

Thanks for trusting us with ${prospect.businessName}'s online presence.

— Ben
${CONTACT_EMAIL}

P.S. See what we've built across all industries at ${BASE}.`,
    sequence: 0,
  };
}

/**
 * Formal site handoff email — sent when Ben marks the site as delivered.
 */
export function getHandoffEmail(
  prospect: Prospect,
  liveUrl: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;

  return {
    subject: `${prospect.businessName} is live — here's everything you need`,
    body: `Hi ${name},

Your website is live. Bookmark this email — it's your complete reference going forward.

Your site: ${liveUrl}


What's covered at $100/year
---
Your annual plan renews automatically and includes:
  - Domain renewal (you never lose your address)
  - Hosting (your site stays up, always)
  - Maintenance and security updates
  - Support — reply to this email anytime
  - Minor content updates (hours, phone, services, photos)


How to request a change
---
Reply to this email with:
  - What you want updated
  - Any new text, photos, or info to use

Most updates are done within 48 hours.


How to send us materials
---
New photos, a refreshed bio, your logo — just reply to this email with the files attached.
Or upload anytime at: ${BASE}/onboarding/${prospect.id}


Questions?
---
Reply here or email ${CONTACT_EMAIL} — Ben checks it daily.


Congratulations, ${name}. Your work deserves to be found — and now it will be.

— Ben @ BlueJays`,
    sequence: 0,
  };
}

/**
 * Monthly performance report — sent to paid clients once a month.
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
      ? `\nHeads up — your annual plan renews soon. We'll send a reminder before anything is charged.\n`
      : "";

  return {
    subject: `${prospect.businessName} — ${monthName} update`,
    body: `Hi ${name},

Monthly check-in on ${prospect.businessName}'s website (${daysLive} days live).

${liveUrl}
${renewalReminder}

A few quick wins to get more from your site this month:

- Add your website to your Google Business Profile — it's the #1 traffic driver
- Put the URL in your Instagram bio and Facebook About section
- Ask happy customers to mention your website when they leave a Google review
- Add it to your business cards, invoices, and email signature
- Send us any new photos — fresh content helps with Google rankings


Need something updated?
---
New hours, services, a team photo — just reply to this email. It's included in your plan and usually done within 48 hours.

— Ben @ BlueJays
${CONTACT_EMAIL}`,
    sequence: 0,
  };
}
