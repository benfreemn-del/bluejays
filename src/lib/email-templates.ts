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

  const body = `Hi ${name},

${discoveryLine}

I thought to myself — this business clearly does great work. But does their website reflect that? So I built one that does.

See your site: ${previewUrl}
${buildVideoBlock(videoUrl)}
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
