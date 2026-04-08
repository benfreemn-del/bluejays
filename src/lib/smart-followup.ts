import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { EMAIL_FOOTER } from "./email-templates";

/**
 * Smart Follow-Up Generator
 *
 * Creates hyper-personalized follow-up messages by referencing
 * specific details from the prospect's business (reviews, services,
 * location, rating). Way more effective than generic templates.
 *
 * Angle selection follows the Sales Strategy Playbook Part 7:
 *
 * 1. Review Spotlight — Use when the prospect has a specific standout review
 *    that can be quoted. Highly personal, shows we actually looked at their business.
 *
 * 2. High Rating Congratulation — Use when 4.5+ stars with 50+ reviews.
 *    Acknowledges reputation, frames website as matching that quality.
 *
 * 3. Service-Specific Highlight — Use when a distinctive/high-value service
 *    was scraped. Highlights that specific service on the preview site.
 *
 * 4. Growth Opportunity — Use when moderate review count (10–50) suggesting
 *    they're growing but not yet established. Website accelerates growth.
 *
 * 5. Generic Personal Angle — Fallback when no specific data is available.
 *    Frames outreach as a question about their online presence.
 */

export type FollowUpAngle =
  | "Review Spotlight"
  | "High Rating"
  | "Service-Specific"
  | "Growth Opportunity"
  | "Generic Personal";

export interface SmartFollowUp {
  email: { subject: string; body: string };
  sms: string;
  angle: FollowUpAngle;
}

/**
 * Select the best follow-up angle and generate personalized content.
 *
 * Selection priority (per playbook):
 * 1. Review Spotlight — if a standout testimonial exists
 * 2. High Rating — if 4.5+ stars with 50+ reviews
 * 3. Service-Specific — if a distinctive service was scraped
 * 4. Growth Opportunity — if 10–50 reviews (growing but not established)
 * 5. Generic Personal — fallback
 */
export function generateSmartFollowUp(prospect: Prospect): SmartFollowUp {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const biz = prospect.businessName;
  const category = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;
  const rating = prospect.googleRating;
  const reviews = prospect.reviewCount;
  const services = prospect.scrapedData?.services || [];
  const testimonials = prospect.scrapedData?.testimonials || [];

  // 1. Review Spotlight — standout review that can be quoted
  if (testimonials.length > 0) {
    return reviewSpotlightAngle(name, biz, testimonials[0], prospect);
  }

  // 2. High Rating Congratulation — 4.5+ stars with 50+ reviews
  if (rating && rating >= 4.5 && reviews && reviews > 50) {
    return highRatingAngle(name, biz, rating, reviews, prospect);
  }

  // 3. Service-Specific Highlight — distinctive scraped service
  if (services.length > 0) {
    return serviceSpecificAngle(name, biz, services[0], category, prospect);
  }

  // 4. Growth Opportunity — moderate review count (10–50)
  if (reviews && reviews >= 10 && reviews <= 50) {
    return growthOpportunityAngle(name, biz, reviews, category, prospect);
  }

  // 5. Generic Personal Angle — fallback
  return genericPersonalAngle(name, biz, category, prospect);
}

/**
 * Determine which angle was selected for a prospect (useful for analytics).
 */
export function getSelectedAngle(prospect: Prospect): FollowUpAngle {
  const reviews = prospect.reviewCount;
  const rating = prospect.googleRating;
  const services = prospect.scrapedData?.services || [];
  const testimonials = prospect.scrapedData?.testimonials || [];

  if (testimonials.length > 0) return "Review Spotlight";
  if (rating && rating >= 4.5 && reviews && reviews > 50) return "High Rating";
  if (services.length > 0) return "Service-Specific";
  if (reviews && reviews >= 10 && reviews <= 50) return "Growth Opportunity";
  return "Generic Personal";
}

// ═══════════════════════════════════════════════════════════════
// ANGLE IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Review Spotlight — "I saw what [Reviewer Name] said about [Business Name]"
 * Highly personal, shows we actually looked at their business.
 */
function reviewSpotlightAngle(
  name: string,
  biz: string,
  review: { name: string; text: string },
  prospect: Prospect
): SmartFollowUp {
  const previewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${prospect.generatedSiteUrl}`;
  const snippet = review.text.length > 60 ? review.text.slice(0, 60) + "..." : review.text;

  return {
    angle: "Review Spotlight",
    email: {
      subject: `I saw what ${review.name} said about ${biz}`,
      body: `Hey ${name},

I was looking at ${biz}'s reviews and saw ${review.name} wrote: "${snippet}"

That kind of feedback is gold — and it's exactly the kind of thing that should be front and center on your website. The site I built for you actually features reviews like that prominently: ${previewUrl}

People trust reviews more than anything else. When a potential customer lands on your site and sees real people saying great things, it's a game-changer.

Thought you'd want to see it. Let me know what you think!

Best,
BlueJays Team
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace("{{prospectId}}", prospect.id)}`,
    },
    sms: `Hey ${name}! Saw a great review from ${review.name} about ${biz}. We featured it on the website we built you — check it out: ${previewUrl}`,
  };
}

/**
 * High Rating Congratulation — "[Rating] stars with [count] reviews — [Business] deserves a website that matches"
 * Acknowledges their reputation, frames website as matching that quality.
 */
function highRatingAngle(
  name: string,
  biz: string,
  rating: number,
  reviews: number,
  prospect: Prospect
): SmartFollowUp {
  const previewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${prospect.generatedSiteUrl}`;

  return {
    angle: "High Rating",
    email: {
      subject: `${rating} stars with ${reviews} reviews — ${biz} deserves a website that matches`,
      body: `Hey ${name},

${rating} stars across ${reviews} reviews? That's seriously impressive. Most ${CATEGORY_CONFIG[prospect.category]?.label || ""} businesses would kill for numbers like that.

But here's the thing — when someone Googles you and clicks through to your site, does it match that reputation? The website I built for you does: ${previewUrl}

Your reviews tell people you're amazing. Your website should do the same. Take a look and let me know what you think.

Best,
BlueJays Team
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace("{{prospectId}}", prospect.id)}`,
    },
    sms: `Hey ${name}! ${rating} stars on ${reviews} reviews is amazing. The site we built matches that quality — take a look: ${previewUrl}`,
  };
}

/**
 * Service-Specific Highlight — "I highlighted [Service] on your new [Business] website"
 * Works well for specialists (emergency plumber, Invisalign dentist, etc.)
 */
function serviceSpecificAngle(
  name: string,
  biz: string,
  topService: { name: string; description?: string },
  category: string,
  prospect: Prospect
): SmartFollowUp {
  const previewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${prospect.generatedSiteUrl}`;

  return {
    angle: "Service-Specific",
    email: {
      subject: `${name}, I highlighted ${topService.name} on your new ${biz} website`,
      body: `Hey ${name},

I noticed ${biz} offers ${topService.name}${topService.description ? ` — "${topService.description}"` : ""}. That's a service a lot of people search for locally.

The website I built for you makes ${topService.name} one of the first things visitors see, with a clear call-to-action to contact you: ${previewUrl}

Most ${category.toLowerCase()} websites bury their services. Yours puts them front and center where they drive calls.

Take a look!

Best,
BlueJays Team
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace("{{prospectId}}", prospect.id)}`,
    },
    sms: `Hey ${name}! I highlighted ${topService.name} on the website we built for ${biz}. Check it out: ${previewUrl}`,
  };
}

/**
 * Growth Opportunity — "[Business] has [count] reviews but is your website converting them?"
 * For businesses with 10–50 reviews: growing but not yet established.
 */
function growthOpportunityAngle(
  name: string,
  biz: string,
  reviews: number,
  category: string,
  prospect: Prospect
): SmartFollowUp {
  const previewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${prospect.generatedSiteUrl}`;

  return {
    angle: "Growth Opportunity",
    email: {
      subject: `${biz} has ${reviews} reviews but is your website converting them?`,
      body: `Hey ${name},

${reviews} reviews means people are finding ${biz} — but how many potential customers are you losing because your website doesn't close the deal?

Studies show that ${category.toLowerCase()} businesses with modern websites get 2-3x more calls than those with outdated sites or no site at all.

I built you a site designed to convert visitors into customers: ${previewUrl}

It's free to look at. If it doesn't blow you away, no worries at all.

Best,
BlueJays Team
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace("{{prospectId}}", prospect.id)}`,
    },
    sms: `Hey ${name}! ${reviews} reviews means people are finding ${biz} — the site we built converts those visitors into calls. Check it out: ${previewUrl}`,
  };
}

/**
 * Generic Personal Angle — "Quick question about [Business]'s online presence"
 * Fallback when no specific data is available.
 * Frames outreach as a question rather than a pitch.
 */
function genericPersonalAngle(
  name: string,
  biz: string,
  category: string,
  prospect: Prospect
): SmartFollowUp {
  const previewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${prospect.generatedSiteUrl}`;

  return {
    angle: "Generic Personal",
    email: {
      subject: `${name}, quick question about ${biz}'s online presence`,
      body: `Hey ${name},

Quick question: when someone searches for ${category.toLowerCase()} services in your area and finds ${biz}, what do they see?

If the answer isn't "a stunning, modern website that makes them want to call immediately" — I might be able to help. I actually already built you one: ${previewUrl}

It's 100% free to look at. I built it specifically for ${biz} because I think you deserve a web presence that matches the quality of your work.

Let me know what you think!

Best,
BlueJays Team
${EMAIL_FOOTER.replace("{{baseUrl}}", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace("{{prospectId}}", prospect.id)}`,
    },
    sms: `Hey ${name}! Quick question — does ${biz}'s website match the quality of your work? I built you a free upgrade: ${previewUrl}`,
  };
}
