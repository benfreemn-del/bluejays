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
    subject: `A quick thought about ${prospect.businessName}'s online presence`,
    body: `Hi ${name},

I was doing some research on local businesses in your area and wanted to share a quick thought. Did you know that having a modern, fast-loading website can significantly increase the number of customers who reach out to you?

Many businesses with great services lose out on potential clients simply because their online presence doesn't reflect the quality of their work. That's exactly why I built this custom website for ${prospect.businessName}:

${previewUrl}
${buildVideoBlock(videoUrl)}
I thought you'd find this interesting, and I'd love to help you get it set up if you're ready to take your online presence to the next level. Take a look when you have a moment, and let me know what you think.

Best,
The BlueJays Team
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`,
    sequence: 3,
  };
}
