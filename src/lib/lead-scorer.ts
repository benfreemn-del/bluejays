/**
 * Lead Priority Scorer
 *
 * Scores prospects 0-100 so Ben can prioritize personal attention
 * on the highest-value leads. Higher score = more worth calling directly.
 *
 * Scoring breakdown (100 pts total):
 *   Google Rating    — up to 30 pts (4.5+ = 30, 4.0+ = 20, 3.5+ = 10)
 *   Review Count     — up to 25 pts (log scale, 100+ reviews = 25)
 *   Category Tier    — up to 20 pts (high-value industries score highest)
 *   Has Bad Website  — 10 pts (no website or clearly outdated = easier pitch)
 *   Revenue Tier     — up to 15 pts (enterprise/high revenue = more budget)
 */

import type { Prospect } from "./types";

// Categories ranked by typical willingness to pay + deal size
const CATEGORY_TIER: Record<string, "high" | "medium" | "low"> = {
  "dental": "high",
  "law-firm": "high",
  "medical": "high",
  "real-estate": "high",
  "accounting": "high",
  "chiropractic": "high",
  "insurance": "high",
  "med-spa": "high",
  "veterinary": "high",
  "electrician": "medium",
  "plumber": "medium",
  "roofing": "medium",
  "hvac": "medium",
  "auto-repair": "medium",
  "salon": "medium",
  "fitness": "medium",
  "general-contractor": "medium",
  "interior-design": "medium",
  "photography": "medium",
  "physical-therapy": "medium",
  "landscaping": "low",
  "cleaning": "low",
  "pest-control": "low",
  "moving": "low",
  "tattoo": "low",
  "florist": "low",
  "daycare": "low",
  "tutoring": "low",
  "pool-spa": "low",
  "martial-arts": "low",
  "catering": "low",
  "pet-services": "low",
};

const REVENUE_TIER_SCORES: Record<string, number> = {
  enterprise: 15,
  high: 12,
  medium: 8,
  low: 4,
  unknown: 0,
};

export interface ScoredProspect {
  prospectId: string;
  score: number;
  grade: "A" | "B" | "C" | "D";
  breakdown: {
    rating: number;
    reviews: number;
    category: number;
    website: number;
    revenue: number;
  };
  callNow: boolean; // score >= 75 — worth a personal call
}

export function calculatePriorityScore(prospect: Prospect): ScoredProspect {
  let rating = 0;
  let reviews = 0;
  let category = 0;
  let website = 0;
  let revenue = 0;

  // Google Rating (0-30 pts)
  const r = prospect.googleRating || 0;
  if (r >= 4.5) rating = 30;
  else if (r >= 4.0) rating = 20;
  else if (r >= 3.5) rating = 10;
  else if (r > 0) rating = 5;

  // Review Count (0-25 pts, log scale)
  const rc = prospect.reviewCount || 0;
  if (rc >= 200) reviews = 25;
  else if (rc >= 100) reviews = 20;
  else if (rc >= 50) reviews = 15;
  else if (rc >= 20) reviews = 10;
  else if (rc >= 5) reviews = 5;

  // Category Tier (0-20 pts)
  const tier = CATEGORY_TIER[prospect.category] || "low";
  if (tier === "high") category = 20;
  else if (tier === "medium") category = 12;
  else category = 5;

  // No/bad website (0-10 pts) — easier pitch
  if (!prospect.currentWebsite) website = 10;
  else website = 0;

  // Revenue Tier (0-15 pts)
  revenue = REVENUE_TIER_SCORES[prospect.estimatedRevenueTier || "unknown"] || 0;

  const score = Math.min(100, rating + reviews + category + website + revenue);

  const grade: "A" | "B" | "C" | "D" =
    score >= 75 ? "A" :
    score >= 55 ? "B" :
    score >= 35 ? "C" : "D";

  return {
    prospectId: prospect.id,
    score,
    grade,
    breakdown: { rating, reviews, category, website, revenue },
    callNow: score >= 75,
  };
}

/**
 * Sort an array of prospects by priority score, highest first.
 */
export function sortByPriority(prospects: Prospect[]): Prospect[] {
  return [...prospects].sort((a, b) => {
    const scoreA = calculatePriorityScore(a).score;
    const scoreB = calculatePriorityScore(b).score;
    return scoreB - scoreA;
  });
}

/**
 * Get the top N highest-priority prospects from a list.
 */
export function getTopLeads(prospects: Prospect[], n = 20): Array<Prospect & { priorityScore: number; grade: string }> {
  return prospects
    .map((p) => ({ ...p, priorityScore: calculatePriorityScore(p).score, grade: calculatePriorityScore(p).grade }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, n);
}
