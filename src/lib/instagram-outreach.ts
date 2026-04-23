/**
 * Instagram DM Outreach Module
 *
 * Comprehensive DM template system for Instagram outreach as an additional
 * funnel channel. Templates are personalized using prospect data and aligned
 * with the 7-step funnel sequence.
 *
 * Note: Actual Instagram API integration is stubbed out. This module focuses
 * on the template system, DM history tracking, and send scheduling.
 */

import type { Prospect, Category } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { getShortPreviewUrl } from "./short-urls";

// ─── Types ───────────────────────────────────────────────────────────

export type DmStepType =
  | "initial-outreach"
  | "follow-up-gentle"
  | "value-add"
  | "social-proof"
  | "check-your-site"
  | "final-nudge"
  | "re-engagement";

export interface InstagramDmTemplate {
  stepType: DmStepType;
  funnelDay: number;
  label: string;
  message: string;
  previewUrl: string;
  characterCount: number;
}

export interface DmHistoryEntry {
  id: string;
  stepType: DmStepType;
  message: string;
  sentAt: string;
  status: "pending" | "sent" | "delivered" | "read" | "replied" | "failed";
  instagramHandle: string;
}

export interface InstagramOutreachData {
  prospectId: string;
  businessName: string;
  instagramHandle: string | null;
  instagramProfileUrl: string | null;
  instagramSearchUrl: string;
  templates: InstagramDmTemplate[];
  dmHistory: DmHistoryEntry[];
}

// ─── Category-specific compliments for DMs ───────────────────────────

const CATEGORY_COMPLIMENTS: Partial<Record<Category, string>> = {
  "real-estate": "your listings are looking great",
  dental: "your practice has an amazing reputation",
  "law-firm": "your firm clearly has a strong track record",
  landscaping: "the outdoor spaces you create are incredible",
  salon: "your work is absolutely stunning",
  electrician: "I can tell you do quality work",
  plumber: "your business has a solid reputation in the area",
  hvac: "you clearly know your craft",
  roofing: "the work you do looks top-notch",
  "auto-repair": "your shop has some great reviews",
  fitness: "your clients clearly love training with you",
  veterinary: "it's clear you care about the animals you treat",
  chiropractic: "your patients clearly trust you",
  accounting: "your firm has a great professional reputation",
  insurance: "your clients clearly value your guidance",
  cleaning: "your attention to detail really shows",
  restaurant: "your food looks incredible",
  photography: "your portfolio is seriously impressive",
  "interior-design": "your design work is beautiful",
  construction: "your builds look really solid",
  "general-contractor": "the quality of your projects really stands out",
  "tree-service": "your work looks really professional",
  "pressure-washing": "those before/after results are impressive",
  painting: "the transformations you do are amazing",
  "med-spa": "your treatments and results look incredible",
  "appliance-repair": "your quick turnaround and expertise really stand out",
  "junk-removal": "your before-and-after cleanouts are so satisfying",
  "carpet-cleaning": "those cleaning results are seriously impressive",
  "event-planning": "the events you put together look absolutely stunning",
};

function getCategoryCompliment(category: Category): string {
  return CATEGORY_COMPLIMENTS[category] || "what you've built is really impressive";
}

// ─── Template Generators ─────────────────────────────────────────────

// Instagram DMs go to prospects — must use the short /p/[code] URL per
// CLAUDE.md "Short URL Rules". The full /preview/[uuid] was 85+ chars,
// which wrapped badly in Instagram's DM text box and looked like spam.
function getPreviewUrl(prospect: Prospect): string {
  return getShortPreviewUrl(prospect);
}

function getFirstName(prospect: Prospect): string {
  return prospect.ownerName?.split(" ")[0] || "there";
}

/**
 * Day 0 — Initial Outreach DM
 * Sent alongside the initial email/SMS. Casual, complimentary, includes link.
 */
function generateInitialOutreach(prospect: Prospect): InstagramDmTemplate {
  const name = getFirstName(prospect);
  const compliment = getCategoryCompliment(prospect.category);
  const previewUrl = getPreviewUrl(prospect);
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label.toLowerCase() || "business";

  const message = `Hey ${name}! I came across ${prospect.businessName} and ${compliment}. I actually specialize in building websites for ${categoryLabel} businesses and went ahead and made one for you — completely free, no strings attached. Check it out here: ${previewUrl} Would love to hear what you think!`;

  return {
    stepType: "initial-outreach",
    funnelDay: 0,
    label: "Initial Outreach",
    message,
    previewUrl,
    characterCount: message.length,
  };
}

/**
 * Day 5 — Gentle Follow-Up DM
 * Casual nudge if they haven't responded to the initial DM.
 */
function generateFollowUpGentle(prospect: Prospect): InstagramDmTemplate {
  const name = getFirstName(prospect);
  const previewUrl = getPreviewUrl(prospect);

  const message = `Hey ${name}, just following up — did you get a chance to check out that website I built for ${prospect.businessName}? Here's the link again: ${previewUrl} No pressure at all, just thought you'd want to see it!`;

  return {
    stepType: "follow-up-gentle",
    funnelDay: 5,
    label: "Gentle Follow-Up",
    message,
    previewUrl,
    characterCount: message.length,
  };
}

/**
 * Day 12 — Value Add DM
 * Focuses on a specific benefit relevant to their category.
 */
function generateValueAdd(prospect: Prospect): InstagramDmTemplate {
  const name = getFirstName(prospect);
  const previewUrl = getPreviewUrl(prospect);
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label.toLowerCase() || "business";
  const city = prospect.city;

  const services = prospect.scrapedData?.services || [];
  const servicesMention = services.length > 0
    ? ` I noticed you offer ${services[0].name}${services.length > 1 ? ` and ${services.length - 1} other services` : ""} — the site showcases all of them.`
    : "";

  const message = `Hey ${name}! Quick thought — I looked at what other ${categoryLabel} businesses in ${city} are doing online, and ${prospect.businessName} could really stand out with a proper website.${servicesMention} The one I built for you is designed to actually bring in new customers: ${previewUrl}`;

  return {
    stepType: "value-add",
    funnelDay: 12,
    label: "Value Add",
    message,
    previewUrl,
    characterCount: message.length,
  };
}

/**
 * Day 21 — Social Proof DM
 * Mentions rating/reviews to build credibility.
 */
function generateSocialProof(prospect: Prospect): InstagramDmTemplate {
  const name = getFirstName(prospect);
  const previewUrl = getPreviewUrl(prospect);
  const rating = prospect.googleRating;
  const reviewCount = prospect.reviewCount || 0;

  let ratingMention = "";
  if (rating && rating >= 4.0 && reviewCount > 5) {
    ratingMention = ` Your ${rating}-star rating with ${reviewCount} reviews is amazing — the website I built puts that front and center so new customers see it right away.`;
  } else if (rating) {
    ratingMention = ` The website I built is designed to help build your online reputation and attract more great reviews.`;
  }

  const message = `Hey ${name}! Just wanted to share — businesses like ${prospect.businessName} that have a professional website see way more inbound leads.${ratingMention} Your site is still live here if you want to take a look: ${previewUrl}`;

  return {
    stepType: "social-proof",
    funnelDay: 21,
    label: "Social Proof",
    message,
    previewUrl,
    characterCount: message.length,
  };
}

/**
 * Special — "Check Out Your New Site" DM
 * Used when a site has been generated/updated and we want to re-engage.
 */
function generateCheckYourSite(prospect: Prospect): InstagramDmTemplate {
  const name = getFirstName(prospect);
  const previewUrl = getPreviewUrl(prospect);
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label.toLowerCase() || "business";

  const message = `Hey ${name}! I just finished building a custom website for ${prospect.businessName} — it's designed specifically for ${categoryLabel} businesses in ${prospect.city} and it's completely free to check out. Take a look and let me know what you think: ${previewUrl}`;

  return {
    stepType: "check-your-site",
    funnelDay: 0,
    label: "Check Your New Site",
    message,
    previewUrl,
    characterCount: message.length,
  };
}

/**
 * Day 30 — Final Nudge DM
 * Last attempt, low-pressure, leaves the door open.
 */
function generateFinalNudge(prospect: Prospect): InstagramDmTemplate {
  const name = getFirstName(prospect);
  const previewUrl = getPreviewUrl(prospect);

  const message = `Last message from me ${name} — the website I built for ${prospect.businessName} is still live if you ever want to check it out: ${previewUrl} If you're ever looking to upgrade your online presence, just shoot me a message. No pressure at all!`;

  return {
    stepType: "final-nudge",
    funnelDay: 30,
    label: "Final Nudge",
    message,
    previewUrl,
    characterCount: message.length,
  };
}

/**
 * Re-engagement DM
 * Used to re-engage prospects who previously didn't respond but may be ready now.
 */
function generateReEngagement(prospect: Prospect): InstagramDmTemplate {
  const name = getFirstName(prospect);
  const previewUrl = getPreviewUrl(prospect);
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label.toLowerCase() || "business";

  const message = `Hey ${name}! I reached out a while back about a website for ${prospect.businessName}. Just wanted to let you know the site is still live and I've been updating our ${categoryLabel} templates — it's looking even better now. Take a fresh look: ${previewUrl}`;

  return {
    stepType: "re-engagement",
    funnelDay: 60,
    label: "Re-Engagement",
    message,
    previewUrl,
    characterCount: message.length,
  };
}

// ─── Main API ────────────────────────────────────────────────────────

/**
 * Generate all DM templates for a prospect's Instagram outreach sequence.
 */
export function generateAllDmTemplates(prospect: Prospect): InstagramDmTemplate[] {
  return [
    generateInitialOutreach(prospect),
    generateFollowUpGentle(prospect),
    generateValueAdd(prospect),
    generateSocialProof(prospect),
    generateCheckYourSite(prospect),
    generateFinalNudge(prospect),
    generateReEngagement(prospect),
  ];
}

/**
 * Generate the full Instagram outreach data for a prospect.
 */
export function getInstagramOutreachData(prospect: Prospect): InstagramOutreachData {
  const instagramHandle = prospect.instagramHandle
    || (prospect.scrapedData?.socialLinks?.instagram
      ? extractHandleFromUrl(prospect.scrapedData.socialLinks.instagram)
      : null);

  const instagramProfileUrl = instagramHandle
    ? `https://www.instagram.com/${instagramHandle.replace("@", "")}/`
    : null;

  const instagramSearchUrl = `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(prospect.businessName)}`;

  return {
    prospectId: prospect.id,
    businessName: prospect.businessName,
    instagramHandle,
    instagramProfileUrl,
    instagramSearchUrl,
    templates: generateAllDmTemplates(prospect),
    dmHistory: [], // Populated from database in production
  };
}

/**
 * Extract a handle from an Instagram URL.
 */
function extractHandleFromUrl(url: string): string | null {
  const match = url.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
  if (match && match[1] && !["explore", "accounts", "p", "reel", "stories", "direct"].includes(match[1])) {
    return `@${match[1]}`;
  }
  return null;
}

// ─── Stubbed Instagram API Integration ───────────────────────────────

/**
 * STUB: Send a DM via Instagram API.
 * In production, this would use the Instagram Graph API or a third-party service.
 */
export async function sendInstagramDm(
  instagramHandle: string,
  message: string,
  _prospectId: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log(`[STUB] Would send Instagram DM to ${instagramHandle}:`);
  console.log(`  Message: ${message.slice(0, 100)}...`);

  // Simulate API response
  return {
    success: true,
    messageId: `ig_dm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}

/**
 * STUB: Check if an Instagram handle exists and is a business account.
 */
export async function verifyInstagramAccount(
  handle: string
): Promise<{ exists: boolean; isBusinessAccount: boolean; followerCount?: number }> {
  console.log(`[STUB] Would verify Instagram account: ${handle}`);

  return {
    exists: true,
    isBusinessAccount: true,
    followerCount: undefined,
  };
}

/**
 * STUB: Get DM conversation history with a prospect.
 */
export async function getDmHistory(
  _instagramHandle: string,
  _prospectId: string
): Promise<DmHistoryEntry[]> {
  // In production, this would fetch from database
  return [];
}
