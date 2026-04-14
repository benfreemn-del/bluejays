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

  const subject = `${prospect.businessName} — I built you a new website (take a look)`;

  const body = `Hi ${name},

I came across ${prospect.businessName} and was impressed by what you've built${hasWebsite ? "" : " — but I noticed you don't have a website yet"}.

${hasWebsite ? `I took a look at your current site and thought I could do something special for you.` : `In today's market, ${category.toLowerCase()} businesses without a strong web presence are leaving money on the table.`}

So I went ahead and built you a brand new website — completely free, no strings attached. Here it is:

${previewUrl}
${buildVideoBlock(videoUrl)}
It's modern, mobile-friendly, and designed specifically for ${category.toLowerCase()} businesses like yours. Take 30 seconds to check it out.

See what we've built for other ${category.toLowerCase()} businesses: https://bluejayportfolio.com/v2/${prospect.category}

If you love it, we can have it live on your own domain within 48 hours. If not, no hard feelings at all.

Either way, I'd love to hear what you think.

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
    subject: `Quick follow-up — did you see your new site, ${name}?`,
    body: `Hi ${name},

Just wanted to make sure you had a chance to check out the website I built for ${prospect.businessName}:

${previewUrl}
${buildVideoBlock(videoUrl)}
I put a lot of thought into making it perfect for your business. It's fully responsive, fast-loading, and ready to go live whenever you are.

Would love to hear your thoughts — even a quick "looks good" or "not interested" helps me out!

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

  return {
    subject: `I actually looked at your current site, ${name}`,
    body: `Hi ${name},

We actually looked at your current website and designed yours as a direct upgrade — same branding, better experience. Compare them side by side: ${previewUrl}
${buildVideoBlock(videoUrl)}
Everything is already built and ready to go. We kept what works about your current site and made the experience more modern, faster, and mobile-friendly.

If you're curious what we've done for other ${CATEGORY_CONFIG[prospect.category].label.toLowerCase()} businesses, check out our portfolio: https://bluejayportfolio.com/v2/${prospect.category}

Either way, I'd love to hear what you think — even a quick "not for me" is totally fine.

Best,
The BlueJays Team
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`,
    sequence: 3,
  };
}
