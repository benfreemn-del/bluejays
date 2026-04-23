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
// Strip any accidentally embedded query params from the base URL env var
const _rawBase = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
const BASE = _rawBase.split("?")[0].replace(/\/$/, "");
const BEN_PHONE = process.env.BEN_PHONE || "(253) 886-3753";

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

// ─────────────────────────────────────────────────────────────────────────────
// Sequence email 1 — The pitch
// Goal: get them to open the preview link OR book a walkthrough call.
// ─────────────────────────────────────────────────────────────────────────────

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
  const rating = prospect.googleRating;
  const reviewCount = prospect.reviewCount;
  const bookUrl = `${BASE}/book/${prospect.id}`;

  // A/B subject lines — A is curiosity, B references their actual Google presence
  const variant = getSubjectVariant(prospect.id);
  const subject =
    variant === "A"
      ? `${name}, I built a website for ${prospect.businessName}`
      : rating
        ? `Your ${rating}★ rating deserves a better website, ${name}`
        : `${prospect.businessName} should be easier to find online`;

  // Discovery line — specific to what we know about them
  let discoveryLine: string;
  if (rating && reviewCount && reviewCount > 5) {
    discoveryLine = `I found ${prospect.businessName} while researching ${category.toLowerCase()} businesses${city ? ` in ${city}` : ""} — ${reviewCount} Google reviews at ${rating} stars is impressive. But I noticed your online presence doesn't match the quality those reviews describe.`;
  } else if (!hasWebsite) {
    discoveryLine = `I was searching for ${category.toLowerCase()} businesses${city ? ` in ${city}` : ""} and couldn't find ${prospect.businessName} with a proper website. That means every time someone searches online right now, they're calling your competitors first.`;
  } else {
    discoveryLine = `I found ${prospect.businessName} while searching for top-rated ${category.toLowerCase()} businesses${city ? ` in ${city}` : ""} — your work clearly speaks for itself. I wanted to see if your website does too.`;
  }

  const videoBlock = videoUrl
    ? `\nI recorded a quick 90-second walkthrough if you'd rather watch than click:\n${videoUrl}\n`
    : "";

  const proposalBlock = proposalUrl
    ? `\nPersonalized breakdown (ROI estimate, what's included, agency comparison):\n${proposalUrl}\n`
    : "";

  const footer = EMAIL_FOOTER
    .replace("{{baseUrl}}", BASE)
    .replace("{{prospectId}}", prospect.id);

  const body = `Hi ${name},

${discoveryLine}

I went ahead and built you a website that fixes that. You can see it here:

${previewUrl}
${videoBlock}${proposalBlock}No login, no credit card — just your actual site, ready to go. It takes about 30 seconds to look.

When someone searches for a ${category.toLowerCase()}${city ? ` in ${city}` : ""} right now, they're choosing based on what they see online first. This makes sure the first impression matches the quality of your work.

See more ${category.toLowerCase()} examples: ${BASE}/v2/${prospect.category}

If you'd rather see it live, I'll walk you through everything in 15 minutes — no pressure:
${bookUrl}

Or call/text me directly: ${BEN_PHONE}

— Ben
${CONTACT_EMAIL}
${footer}`;

  return { subject, body, sequence: 1, subjectVariant: variant };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sequence email 2 — Push for the call, not the preview
// Goal: get them on a 15-min call with Ben. Preview is secondary.
// Sent ~3 days after email 1.
// ─────────────────────────────────────────────────────────────────────────────

export function getFollowUp1(
  prospect: Prospect,
  previewUrl: string,
  _videoUrl?: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const category = CATEGORY_CONFIG[prospect.category].label;
  const city = prospect.city || "";
  const bookUrl = `${BASE}/book/${prospect.id}`;

  const footer = EMAIL_FOOTER
    .replace("{{baseUrl}}", BASE)
    .replace("{{prospectId}}", prospect.id);

  // Use a different angle from email 1 — competitor/market context
  const cityLine = city ? ` in ${city}` : "";

  return {
    subject: `${name}, still want to show you this`,
    body: `Hi ${name},

Sent a note a few days ago about the website I built for ${prospect.businessName} — wanted to follow up in case it got buried.

The short version: someone's searching for a ${category.toLowerCase()}${cityLine} right now. The business with the best-looking online presence gets the call. Right now that's probably not you — and I'd like to change that.

The easiest way to see it is a quick 15-minute call. I'll pull up the site, walk you through it, and answer anything you're wondering. No pitch, no pressure:

Book a time: ${bookUrl}

Or if you'd rather just look on your own first:
${previewUrl}

Either way — call or text me anytime: ${BEN_PHONE}

— Ben
${CONTACT_EMAIL}
${footer}`,
    sequence: 2,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sequence email 3 — Short, human, asks for a real response
// Goal: a reply. Any reply. Not a click, not a booking — a conversation.
// Sent ~7 days after email 1.
// ─────────────────────────────────────────────────────────────────────────────

export function getFollowUp2(
  prospect: Prospect,
  _previewUrl: string,
  _videoUrl?: string,
): EmailTemplate {
  const name = prospect.ownerName?.split(" ")[0] || prospect.businessName;
  const bookUrl = `${BASE}/book/${prospect.id}`;

  const footer = EMAIL_FOOTER
    .replace("{{baseUrl}}", BASE)
    .replace("{{prospectId}}", prospect.id);

  return {
    subject: `Quick honest question, ${name}`,
    body: `Hi ${name},

Last one from me — I promise.

I've sent a couple notes about the website I built for ${prospect.businessName}. I don't know if the timing's off, if you already have something in the works, or if the emails just got lost.

Honest question: is there something specific that's holding you back? Price, timing, you already have a site, something else?

If you just reply to this email I'll get it. Or if you'd rather talk through it live:
${bookUrl}

And if you're just not interested, that's completely fine — just say "pass" and I won't bother you again.

— Ben
${BEN_PHONE}
${CONTACT_EMAIL}
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
Reply here, email ${CONTACT_EMAIL}, or call/text ${BEN_PHONE} — Ben checks both daily.


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
${CONTACT_EMAIL} | ${BEN_PHONE}`,
    sequence: 0,
  };
}
