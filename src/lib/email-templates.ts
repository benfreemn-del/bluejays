import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";

export interface EmailTemplate {
  subject: string;
  body: string;
  sequence: number;
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

  const subject = `${name}, I made something for ${prospect.businessName}`;

  const discoveryLine = hasWebsite
    ? `I found ${prospect.businessName} while searching for top-rated ${category.toLowerCase()} businesses${city ? ` in ${city}` : ""} — your reviews stood out.`
    : `I was looking for ${category.toLowerCase()} businesses${city ? ` in ${city}` : ""} and came across ${prospect.businessName} — but noticed you don't have a website yet.`;

  const body = `Hi ${name},

${discoveryLine}

I went ahead and built you a custom website — completely free, no strings attached. We've done this for 200+ local businesses across 30+ industries, and I wanted to do the same for ${prospect.businessName}.

See your site: ${previewUrl}
${buildVideoBlock(videoUrl)}
See more ${category.toLowerCase()} sites we've built: https://bluejayportfolio.com/v2/${prospect.category}

If you want it live on your own domain, we can do that within 48 hours — $997 one-time (or 3 payments of $349).

Would love to hear what you think.

Best,
The BlueJays Team
bluejaycontactme@gmail.com
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`;

  return { subject, body, sequence: 1 };
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

What did you think of the website I built for ${prospect.businessName}?

${previewUrl}
${buildVideoBlock(videoUrl)}
Over 80% of people who search for a local business online visit within 24 hours. A site like this pays for itself fast.

A quick "love it" or "not for me" works — either way, I appreciate your time.

Best,
The BlueJays Team
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

We designed your new site as a direct upgrade to your current one — same branding, better experience. Compare them side by side: ${previewUrl}
${buildVideoBlock(videoUrl)}
Your preview stays live for 30 days, then we move on to the next business. If you want it, it's $997 one-time (or 3 payments of $349) and we'll have it on your domain within 48 hours.

See what we've built for other ${category.toLowerCase()} businesses: https://bluejayportfolio.com/v2/${prospect.category}

Worth a look, or not your thing?

Best,
The BlueJays Team
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`,
    sequence: 3,
  };
}
