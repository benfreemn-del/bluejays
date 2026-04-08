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
BlueJays Business Solutions, WA
You're receiving this because we built a free website for your business.
Unsubscribe: {{baseUrl}}/unsubscribe/{{prospectId}}
`;

export function getPitchEmail(
  prospect: Prospect,
  previewUrl: string
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

It's modern, mobile-friendly, and designed specifically for ${category.toLowerCase()} businesses like yours. Take 30 seconds to check it out.

If you love it, we can have it live on your own domain within 48 hours. If not, no hard feelings at all.

Either way, I'd love to hear what you think.

Best,
The BlueJays Team
bluejaycontactme@gmail.com
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace("{{prospectId}}", prospect.id)}`;

  return { subject, body, sequence: 1 };
}

export function getFollowUp1(
  prospect: Prospect,
  previewUrl: string
): EmailTemplate {
  const name =
    prospect.ownerName?.split(" ")[0] || prospect.businessName;

  return {
    subject: `Quick follow-up — did you see your new site, ${name}?`,
    body: `Hi ${name},

Just wanted to make sure you had a chance to check out the website I built for ${prospect.businessName}:

${previewUrl}

I put a lot of thought into making it perfect for your business. It's fully responsive, fast-loading, and ready to go live whenever you are.

Would love to hear your thoughts — even a quick "looks good" or "not interested" helps me out!

Best,
The BlueJays Team
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace("{{prospectId}}", prospect.id)}`,
    sequence: 2,
  };
}

export function getFollowUp2(
  prospect: Prospect,
  previewUrl: string
): EmailTemplate {
  const name =
    prospect.ownerName?.split(" ")[0] || prospect.businessName;

  return {
    subject: `Last chance — your custom ${prospect.businessName} website`,
    body: `Hi ${name},

This is my last note about the website I built for ${prospect.businessName}:

${previewUrl}

I'm going to be moving on to other businesses in your area soon, so I wanted to give you one last chance to claim it before I do.

If you're interested, just reply to this email and we'll get it set up on your domain. If not, no worries — I wish you all the best!

Best,
The BlueJays Team
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace("{{prospectId}}", prospect.id)}`,
    sequence: 3,
  };
}
