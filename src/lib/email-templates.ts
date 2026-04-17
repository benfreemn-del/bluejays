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

/**
 * "Your 4.8⭐ with 62 reviews stood out" — skipped when we don't have the data.
 */
function buildRatingBlurb(prospect: Prospect): string {
  if (prospect.googleRating && prospect.reviewCount && prospect.reviewCount >= 5) {
    return ` Your ${prospect.googleRating}-star rating with ${prospect.reviewCount} reviews is exactly the kind of reputation a strong website should be matching.`;
  }
  return "";
}

/**
 * Pulls the first service name from scrapedData when available so follow-ups
 * can reference a specific offering (e.g., "emergency repair", "kitchen remodels").
 */
function getTopService(prospect: Prospect): string | undefined {
  const services = prospect.scrapedData?.services;
  if (!services || services.length === 0) return undefined;
  const name = services[0]?.name;
  return name && name.length > 2 && name.length < 40 ? name.toLowerCase() : undefined;
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

  const ratingBlurb = buildRatingBlurb(prospect);

  const body = `Hi ${name},

${discoveryLine}${ratingBlurb}

Your reviews tell one story — the question is whether your website tells the same one. So I built one that does.

See your site: ${previewUrl}
${buildVideoBlock(videoUrl)}
Your customers are searching for ${category.toLowerCase()} services online right now. When they find you, what do they see? A site like this makes sure their first impression matches the quality of your work.

See more ${category.toLowerCase()} sites we've built: https://bluejayportfolio.com/v2/${prospect.category}

The full build is $997 one-time — custom design, domain registration, and hosting setup all included. If that feels heavy right now, we also split it into 3 payments of $349.

Book a quick 15-min walkthrough — I'll show you everything live, no pressure: https://calendly.com/bluejaycontactme/website-walkthrough

What's one thing about your business you'd want front-and-center on a new site?

— Ben @ BlueJays
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
  const categoryPhrase = prospect.category.replace("-", " ");
  const city = prospect.city || prospect.address?.split(",")[0] || "your area";

  return {
    subject: `${name} — what do ${city} customers see when they search "${categoryPhrase}"?`,
    body: `Hi ${name},

Quick test — pull up your phone, Google "${categoryPhrase} near me" in ${city}, and look at the top result.

Is it ${prospect.businessName}? Or is it a competitor with a stronger website?

I built this for you specifically so that answer flips: ${previewUrl}
${buildVideoBlock(videoUrl)}
It's $997 one-time — custom design, domain registration, and hosting setup included. 3 payments of $349 if that's easier.

More ${categoryPhrase} sites in this style: https://bluejayportfolio.com/v2/${prospect.category}

15 minutes on a Zoom and I'll show you exactly how this ranks you higher: https://calendly.com/bluejaycontactme/website-walkthrough

When was the last time you Googled your own business name from your phone — what did you see?

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
  const topService = getTopService(prospect);
  const serviceHook = topService
    ? `I made sure ${topService} is front-and-center — it's the first thing visitors see, because it's clearly what you do best.`
    : `I designed it around what you actually do best — front and center, not buried on some "services" sub-page.`;

  return {
    subject: `I looked at your current site, ${name} — here's the side-by-side`,
    body: `Hi ${name},

I built this site for ${prospect.businessName} because your work deserves a website that doesn't make visitors second-guess the quality.

Compare for yourself: ${previewUrl}
${buildVideoBlock(videoUrl)}
${serviceHook}

The businesses winning in ${category.toLowerCase()} aren't always the best at what they do — they're the best at being found. You're clearly great at the work. The website's the only thing in the way.

$997 one-time covers the custom design, domain registration, and hosting setup. Or 3 payments of $349.

This preview stays live for 30 days, then I move on and build for someone else. Worth 15 minutes before it comes down? https://calendly.com/bluejaycontactme/website-walkthrough

See other ${category.toLowerCase()} builds: https://bluejayportfolio.com/v2/${prospect.category}

One honest question — if price weren't the issue, would you want this site live for ${prospect.businessName}?

— Ben
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com").replace("{{prospectId}}", prospect.id)}`,
    sequence: 3,
  };
}
