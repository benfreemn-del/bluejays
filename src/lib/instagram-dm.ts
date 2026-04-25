import type { Prospect, Category } from "./types";
import { CATEGORY_CONFIG } from "./types";

export interface DmMessage {
  type: "initial" | "follow-up-1" | "follow-up-2";
  message: string;
  previewUrl: string;
}

// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

function getCategoryHook(category: Category): string {
  const hooks: Partial<Record<Category, string>> = {
    "real-estate": "I love the properties you work with",
    dental: "your practice looks amazing",
    "law-firm": "your firm has a great reputation",
    landscaping: "the outdoor spaces you create are incredible",
    salon: "your work is seriously stunning",
    electrician: "I can tell you do quality work",
    plumber: "your business has a solid reputation",
    hvac: "you clearly know your craft",
    roofing: "the work you do looks top-notch",
    "auto-repair": "your shop has some great reviews",
    fitness: "your clients clearly love training with you",
    veterinary: "it's clear you care about the animals you treat",
  };
  return hooks[category] || "what you've built is really impressive";
}

export function generateInitialDm(prospect: Prospect): DmMessage {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl}`;
  const hook = getCategoryHook(prospect.category);

  const message = `Hey ${name}! 👋 I came across ${prospect.businessName} and ${hook}. I actually went ahead and built you a free website — no catch, just wanted to show you what's possible. Check it out: ${previewUrl}`;

  return { type: "initial", message, previewUrl };
}

export function generateFollowUp1(prospect: Prospect): DmMessage {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl}`;

  const message = `Hey ${name}, just following up — did you get a chance to check out that website I built for ${prospect.businessName}? Here's the link again: ${previewUrl} Would love to hear your thoughts! 🙌`;

  return { type: "follow-up-1", message, previewUrl };
}

export function generateFollowUp2(prospect: Prospect): DmMessage {
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl}`;

  const message = `Last one from me ${name} — the site I made for ${prospect.businessName} is still live if you want to check it out: ${previewUrl} No pressure at all, just thought you'd want to see it! ✌️`;

  return { type: "follow-up-2", message, previewUrl };
}

export function getAllDmSequence(prospect: Prospect): DmMessage[] {
  return [
    generateInitialDm(prospect),
    generateFollowUp1(prospect),
    generateFollowUp2(prospect),
  ];
}

export function getInstagramSearchUrl(businessName: string): string {
  return `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(businessName)}`;
}
