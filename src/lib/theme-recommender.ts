/**
 * Theme Recommender — AI-driven light/dark theme pre-selection for preview sites.
 *
 * Uses business type, scraped brand colors, and industry norms to automatically
 * pick the better theme (light vs dark) for each prospect's preview site.
 *
 * The admin can always override the AI's choice before approving.
 */

import type { Category, Prospect } from "./types";

export type ThemeMode = "light" | "dark";

export interface ThemeRecommendation {
  recommended: ThemeMode;
  confidence: number; // 0-100
  reasons: string[];
}

/**
 * Categories that lean toward LIGHT themes based on industry norms.
 * Feminine/elegant, medical/professional, family-oriented businesses.
 */
const LIGHT_LEANING_CATEGORIES: Category[] = [
  "salon",
  "florist",
  "daycare",
  "photography",
  "interior-design",
  "catering",
  "dental",
  "medical",
  "chiropractic",
  "physical-therapy",
  "veterinary",
  "pet-services",
  "accounting",
  "insurance",
  "tutoring",
  "church",
  "real-estate",
  "law-firm",
  "spa" as Category, // future-proofing
];

/**
 * Categories that lean toward DARK themes based on industry norms.
 * Masculine/trade, rugged, nightlife, edgy businesses.
 */
const DARK_LEANING_CATEGORIES: Category[] = [
  "electrician",
  "plumber",
  "hvac",
  "roofing",
  "auto-repair",
  "general-contractor",
  "pest-control",
  "moving",
  "fitness",
  "tattoo",
  "martial-arts",
  "pool-spa",
  "towing",
  "construction",
  "painting",
  "fencing",
  "tree-service",
  "pressure-washing",
  "garage-door",
  "locksmith",
  "restaurant",
  "landscaping",
  "cleaning",
];

/**
 * Analyze a hex color to determine if it's light or dark.
 * Returns a value from 0 (dark) to 255 (light) based on perceived luminance.
 */
function getPerceivedLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length < 6) return 128; // fallback for invalid colors
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  // Perceived luminance formula (ITU-R BT.709)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check if a color is warm-toned (reds, oranges, yellows, pinks).
 */
function isWarmColor(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length < 6) return false;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return r > g && r > b && r > 120;
}

/**
 * Check if a color is cool-toned (blues, greens, teals).
 */
function isCoolColor(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length < 6) return false;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return b > r || (g > r && g > 120);
}

/**
 * Recommend a theme (light or dark) for a prospect's preview site.
 *
 * Decision factors (weighted):
 * 1. Category/industry norms (strongest signal)
 * 2. Scraped brand color luminance and warmth
 * 3. Business type characteristics
 */
export function recommendTheme(prospect: Prospect): ThemeRecommendation {
  const reasons: string[] = [];
  let lightScore = 0;
  let darkScore = 0;

  const { category, scrapedData } = prospect;
  const brandColor = scrapedData?.brandColor;

  // Factor 1: Category/industry norms (weight: 40 points)
  if (LIGHT_LEANING_CATEGORIES.includes(category)) {
    lightScore += 40;
    reasons.push(`${category} businesses typically perform better with light themes for trust and approachability`);
  } else if (DARK_LEANING_CATEGORIES.includes(category)) {
    darkScore += 40;
    reasons.push(`${category} businesses typically perform better with dark themes for a bold, professional look`);
  } else {
    // Neutral category — slight lean toward dark (the current default)
    darkScore += 15;
    reasons.push(`${category} is a neutral category; defaulting to dark theme`);
  }

  // Factor 2: Brand color analysis (weight: 30 points)
  if (brandColor) {
    const luminance = getPerceivedLuminance(brandColor);
    const warm = isWarmColor(brandColor);
    const cool = isCoolColor(brandColor);

    if (luminance > 180) {
      // Very light brand color — looks better on dark background for contrast
      darkScore += 25;
      reasons.push(`Brand color ${brandColor} is light (luminance ${Math.round(luminance)}) — pops better on dark backgrounds`);
    } else if (luminance < 80) {
      // Very dark brand color — looks better on light background for contrast
      lightScore += 25;
      reasons.push(`Brand color ${brandColor} is dark (luminance ${Math.round(luminance)}) — more visible on light backgrounds`);
    } else if (warm) {
      // Warm colors (pink, red, orange) often pair well with light themes for elegance
      lightScore += 15;
      reasons.push(`Brand color ${brandColor} is warm-toned — pairs well with light themes`);
    } else if (cool) {
      // Cool colors (blue, green, teal) work well on dark backgrounds
      darkScore += 15;
      reasons.push(`Brand color ${brandColor} is cool-toned — pairs well with dark themes`);
    } else {
      // Neutral brand color — no strong preference
      darkScore += 5;
      reasons.push(`Brand color ${brandColor} is neutral — slight dark preference`);
    }
  } else {
    // No brand color scraped — rely more on category
    reasons.push("No brand color found; relying on industry norms");
  }

  // Factor 3: Revenue tier and review signals (weight: 15 points)
  if (prospect.estimatedRevenueTier === "high") {
    // High-revenue businesses often benefit from light, premium-feeling themes
    lightScore += 10;
    reasons.push("High-revenue business — light themes convey premium quality");
  } else if (prospect.estimatedRevenueTier === "low") {
    // Lower-revenue trades often prefer bold, dark themes
    darkScore += 10;
    reasons.push("Lower-revenue tier — dark themes convey strength and reliability");
  }

  // Factor 4: Google rating as trust signal (weight: 15 points)
  if (prospect.googleRating && prospect.googleRating >= 4.5 && prospect.reviewCount && prospect.reviewCount >= 50) {
    // Well-reviewed businesses benefit from light themes that showcase trust
    lightScore += 10;
    reasons.push(`Strong reputation (${prospect.googleRating} stars, ${prospect.reviewCount} reviews) — light theme emphasizes trust`);
  }

  const recommended: ThemeMode = lightScore >= darkScore ? "light" : "dark";
  const total = lightScore + darkScore;
  const winnerScore = Math.max(lightScore, darkScore);
  const confidence = total > 0 ? Math.round((winnerScore / total) * 100) : 50;

  return {
    recommended,
    confidence,
    reasons,
  };
}

/**
 * Get the effective theme for a prospect.
 * Returns the manually selected theme if set, otherwise the AI recommendation.
 */
export function getEffectiveTheme(prospect: Prospect): ThemeMode {
  if (prospect.selectedTheme) {
    return prospect.selectedTheme;
  }
  return recommendTheme(prospect).recommended;
}
