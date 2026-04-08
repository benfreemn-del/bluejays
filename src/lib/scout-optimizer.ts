/**
 * Batch Scouting Optimization
 *
 * Improves Google Places scouting with:
 * 1. Smarter search terms per category (multiple query variants)
 * 2. Deduplication logic (don't re-scout businesses already in the system)
 * 3. Website quality filtering (skip businesses with good/modern websites)
 * 4. Prioritization of businesses with bad or no websites
 * 5. Scouting quality score for each prospect
 */

import type { Category, Prospect } from "./types";
import { getAllProspects } from "./store";
import { logCost, COST_RATES } from "./cost-logger";

// ==================== SMART SEARCH QUERIES ====================

/**
 * Category-specific search query variants that yield better results
 * than just searching for the category name. Each category gets
 * multiple query patterns to find more diverse businesses.
 */
export const SMART_QUERIES: Record<string, string[]> = {
  "real-estate": [
    "real estate agent",
    "realtor office",
    "real estate broker",
    "property management company",
    "home selling agent",
  ],
  dental: [
    "dentist office",
    "dental clinic",
    "family dentistry",
    "cosmetic dentist",
    "dental care",
  ],
  "law-firm": [
    "law firm",
    "attorney office",
    "lawyer",
    "legal services",
    "law office",
  ],
  landscaping: [
    "landscaping company",
    "lawn care service",
    "landscape design",
    "yard maintenance",
    "garden service",
  ],
  salon: [
    "hair salon",
    "beauty salon",
    "barber shop",
    "nail salon",
    "hair stylist",
  ],
  electrician: [
    "electrician",
    "electrical contractor",
    "electrical services",
    "licensed electrician",
    "electrical repair",
  ],
  plumber: [
    "plumber",
    "plumbing company",
    "plumbing services",
    "plumbing contractor",
    "drain cleaning service",
  ],
  hvac: [
    "HVAC company",
    "heating and cooling",
    "air conditioning repair",
    "furnace repair",
    "HVAC contractor",
  ],
  roofing: [
    "roofing company",
    "roof repair",
    "roofing contractor",
    "roof replacement",
    "roofing services",
  ],
  "general-contractor": [
    "general contractor",
    "home remodeling contractor",
    "renovation company",
    "building contractor",
    "home improvement contractor",
  ],
  "auto-repair": [
    "auto repair shop",
    "car mechanic",
    "auto body shop",
    "car repair service",
    "automotive repair",
  ],
  chiropractic: [
    "chiropractor",
    "chiropractic clinic",
    "chiropractic care",
    "spine specialist",
    "back pain clinic",
  ],
  accounting: [
    "accounting firm",
    "CPA",
    "tax preparation service",
    "bookkeeping service",
    "accountant",
  ],
  insurance: [
    "insurance agency",
    "insurance broker",
    "insurance agent",
    "home insurance",
    "auto insurance agency",
  ],
  photography: [
    "photographer",
    "photography studio",
    "wedding photographer",
    "portrait photographer",
    "photo studio",
  ],
  "interior-design": [
    "interior designer",
    "interior design firm",
    "home decorator",
    "interior decorating",
    "design studio",
  ],
  cleaning: [
    "cleaning service",
    "house cleaning",
    "maid service",
    "janitorial service",
    "commercial cleaning",
  ],
  "pest-control": [
    "pest control",
    "exterminator",
    "termite treatment",
    "pest removal service",
    "bug exterminator",
  ],
  moving: [
    "moving company",
    "movers",
    "moving service",
    "local movers",
    "relocation company",
  ],
  veterinary: [
    "veterinarian",
    "animal hospital",
    "vet clinic",
    "pet hospital",
    "animal clinic",
  ],
  fitness: [
    "gym",
    "fitness center",
    "personal trainer",
    "CrossFit gym",
    "fitness studio",
  ],
  tattoo: [
    "tattoo shop",
    "tattoo parlor",
    "tattoo studio",
    "tattoo artist",
    "custom tattoo",
  ],
  florist: [
    "florist",
    "flower shop",
    "floral design",
    "flower delivery",
    "wedding florist",
  ],
  catering: [
    "catering company",
    "catering service",
    "event catering",
    "wedding catering",
    "food catering",
  ],
  daycare: [
    "daycare center",
    "child care center",
    "preschool",
    "early learning center",
    "childcare",
  ],
  "pet-services": [
    "pet grooming",
    "dog grooming",
    "pet boarding",
    "doggy daycare",
    "pet sitting service",
  ],
  "martial-arts": [
    "martial arts school",
    "karate studio",
    "taekwondo school",
    "MMA gym",
    "jiu jitsu academy",
  ],
  "physical-therapy": [
    "physical therapy clinic",
    "physical therapist",
    "rehabilitation center",
    "sports physical therapy",
    "PT clinic",
  ],
  tutoring: [
    "tutoring center",
    "math tutor",
    "learning center",
    "private tutor",
    "academic tutoring",
  ],
  "pool-spa": [
    "pool service",
    "pool cleaning",
    "pool maintenance",
    "hot tub service",
    "pool repair",
  ],
  church: [
    "church",
    "community church",
    "baptist church",
    "non-denominational church",
    "ministry",
  ],
  restaurant: [
    "restaurant",
    "family restaurant",
    "local restaurant",
    "dining",
    "eatery",
  ],
  medical: [
    "doctor office",
    "medical clinic",
    "family doctor",
    "primary care physician",
    "medical practice",
  ],
  painting: [
    "house painter",
    "painting company",
    "painting contractor",
    "interior painting",
    "exterior painting",
  ],
  fencing: [
    "fence company",
    "fencing contractor",
    "fence installation",
    "fence repair",
    "fence builder",
  ],
  "tree-service": [
    "tree service",
    "tree removal",
    "tree trimming",
    "arborist",
    "tree care company",
  ],
  "pressure-washing": [
    "pressure washing",
    "power washing",
    "exterior cleaning",
    "pressure washing service",
    "house washing",
  ],
  "garage-door": [
    "garage door repair",
    "garage door company",
    "garage door installation",
    "overhead door service",
    "garage door service",
  ],
  locksmith: [
    "locksmith",
    "lock service",
    "emergency locksmith",
    "locksmith service",
    "key service",
  ],
  towing: [
    "towing service",
    "tow truck",
    "roadside assistance",
    "towing company",
    "auto towing",
  ],
  construction: [
    "construction company",
    "building contractor",
    "construction services",
    "commercial construction",
    "residential construction",
  ],
};

/**
 * Get the best search queries for a category.
 * Returns multiple variants for broader coverage.
 */
export function getSmartQueries(category: Category, maxQueries: number = 3): string[] {
  const queries = SMART_QUERIES[category];
  if (!queries) return [category.replace(/-/g, " ")];
  // Return up to maxQueries, prioritizing the first (most common) terms
  return queries.slice(0, maxQueries);
}

// ==================== WEBSITE QUALITY CHECK ====================

/**
 * Signals that indicate a website is modern/good (we should skip these businesses).
 */
const MODERN_WEBSITE_SIGNALS = [
  // Modern platforms
  "squarespace.com",
  "wix.com",
  "webflow.io",
  "shopify.com",
  "wordpress.com",
  // CDN/hosting that suggests professional setup
  "vercel.app",
  "netlify.app",
  "pages.dev",
];

/**
 * Signals that indicate a website is bad/outdated (we should prioritize these).
 */
const BAD_WEBSITE_SIGNALS = [
  "godaddy.com/parked",
  "under construction",
  "coming soon",
  "website builder",
  "placeholder",
  "domain for sale",
];

export interface WebsiteQualityResult {
  url: string;
  exists: boolean;
  isModern: boolean;
  isBad: boolean;
  hasSSL: boolean;
  loadTimeMs: number | null;
  signals: string[];
  score: number; // 0-100, higher = worse website = better prospect for us
}

/**
 * Quick website quality check.
 * Does a lightweight HEAD/GET request to assess website quality.
 * Returns a score where HIGHER = worse website = better prospect for BlueJays.
 */
export async function checkWebsiteQuality(url: string): Promise<WebsiteQualityResult> {
  const result: WebsiteQualityResult = {
    url,
    exists: false,
    isModern: false,
    isBad: false,
    hasSSL: false,
    loadTimeMs: null,
    signals: [],
    score: 50, // Default: neutral
  };

  if (!url) {
    result.score = 100; // No website at all = best prospect
    result.signals.push("no_website");
    return result;
  }

  try {
    // Normalize URL
    let checkUrl = url;
    if (!checkUrl.startsWith("http")) checkUrl = `https://${checkUrl}`;

    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(checkUrl, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BlueJays Scout/1.0)",
      },
    });

    clearTimeout(timeout);
    const loadTime = Date.now() - startTime;
    result.loadTimeMs = loadTime;
    result.exists = true;
    result.hasSSL = checkUrl.startsWith("https://") || response.url.startsWith("https://");

    // Check final URL after redirects
    const finalUrl = response.url.toLowerCase();

    // Check for parked/placeholder domains
    for (const signal of BAD_WEBSITE_SIGNALS) {
      if (finalUrl.includes(signal)) {
        result.isBad = true;
        result.signals.push(`bad_signal: ${signal}`);
      }
    }

    // Check for modern platform hosting
    for (const signal of MODERN_WEBSITE_SIGNALS) {
      if (finalUrl.includes(signal)) {
        result.isModern = true;
        result.signals.push(`modern_platform: ${signal}`);
      }
    }

    // Read a small portion of the body for additional signals
    const text = await response.text().catch(() => "");
    const bodyLower = text.substring(0, 10000).toLowerCase();

    // Check for modern framework indicators
    if (bodyLower.includes("__next") || bodyLower.includes("_next/static")) {
      result.isModern = true;
      result.signals.push("framework: nextjs");
    }
    if (bodyLower.includes("__nuxt") || bodyLower.includes("nuxt")) {
      result.isModern = true;
      result.signals.push("framework: nuxt");
    }
    if (bodyLower.includes("react-root") || bodyLower.includes("__gatsby")) {
      result.isModern = true;
      result.signals.push("framework: react/gatsby");
    }

    // Check for responsive design indicators
    const hasViewport = bodyLower.includes("viewport");
    const hasMediaQueries = bodyLower.includes("@media");
    if (hasViewport && hasMediaQueries) {
      result.signals.push("responsive_design");
    }

    // Check for outdated indicators
    if (bodyLower.includes("<table") && bodyLower.includes("bgcolor")) {
      result.isBad = true;
      result.signals.push("table_based_layout");
    }
    if (bodyLower.includes("flash") && bodyLower.includes(".swf")) {
      result.isBad = true;
      result.signals.push("uses_flash");
    }
    if (!hasViewport) {
      result.signals.push("no_viewport_meta");
    }

    // Check for "under construction" or placeholder content
    if (
      bodyLower.includes("under construction") ||
      bodyLower.includes("coming soon") ||
      bodyLower.includes("parked domain") ||
      bodyLower.includes("this domain")
    ) {
      result.isBad = true;
      result.signals.push("placeholder_content");
    }

    // Calculate score (higher = worse website = better for us)
    let score = 50;

    // No SSL
    if (!result.hasSSL) score += 15;

    // Slow load time
    if (loadTime > 5000) score += 15;
    else if (loadTime > 3000) score += 10;
    else if (loadTime > 2000) score += 5;
    else if (loadTime < 1000) score -= 10;

    // Bad signals
    if (result.isBad) score += 25;

    // Modern signals
    if (result.isModern) score -= 30;

    // No viewport (not mobile-friendly)
    if (!hasViewport) score += 10;

    // Table-based layout
    if (result.signals.includes("table_based_layout")) score += 15;

    // Responsive design
    if (result.signals.includes("responsive_design")) score -= 10;

    result.score = Math.max(0, Math.min(100, score));
  } catch (err) {
    // Website doesn't load at all
    result.exists = false;
    result.score = 90; // Very good prospect — website is broken
    result.signals.push("website_unreachable");
  }

  return result;
}

// ==================== SCOUTING QUALITY SCORE ====================

export interface ScoutingScore {
  overall: number; // 0-100
  breakdown: {
    websiteScore: number; // 0-40 points
    reviewScore: number; // 0-20 points
    revenueScore: number; // 0-20 points
    contactScore: number; // 0-20 points
  };
  grade: "A" | "B" | "C" | "D" | "F";
  recommendation: "high_priority" | "worth_pursuing" | "low_priority" | "skip";
}

/**
 * Calculate a scouting quality score for a prospect.
 * Higher score = better prospect for BlueJays to pursue.
 */
export function calculateScoutingScore(
  prospect: Prospect,
  websiteQuality?: WebsiteQualityResult
): ScoutingScore {
  let websiteScore = 20; // Default: neutral
  let reviewScore = 10;
  let revenueScore = 10;
  let contactScore = 10;

  // Website score (0-40): Higher if website is bad or missing
  if (websiteQuality) {
    websiteScore = Math.round((websiteQuality.score / 100) * 40);
  } else if (!prospect.currentWebsite) {
    websiteScore = 35; // No website = great prospect
  } else {
    websiteScore = 20; // Has website but we haven't checked it
  }

  // Review score (0-20): Businesses with some reviews but not too many
  // Sweet spot: 10-100 reviews (established but not huge chains)
  const reviews = prospect.reviewCount || 0;
  if (reviews === 0) {
    reviewScore = 8; // New business, might not have budget
  } else if (reviews < 10) {
    reviewScore = 12; // Small but growing
  } else if (reviews < 50) {
    reviewScore = 20; // Sweet spot
  } else if (reviews < 100) {
    reviewScore = 18; // Good
  } else if (reviews < 300) {
    reviewScore = 14; // Might already have a good site
  } else {
    reviewScore = 6; // Probably a chain or large business
  }

  // Revenue tier score (0-20)
  if (prospect.estimatedRevenueTier === "medium") {
    revenueScore = 20; // Sweet spot
  } else if (prospect.estimatedRevenueTier === "high") {
    revenueScore = 15; // Can afford it but might already have a site
  } else {
    revenueScore = 10; // Low revenue, might not have budget
  }

  // Contact score (0-20): Having both email and phone is ideal
  if (prospect.email && prospect.phone) {
    contactScore = 20;
  } else if (prospect.email || prospect.phone) {
    contactScore = 12;
  } else {
    contactScore = 4; // Hard to reach
  }

  const overall = websiteScore + reviewScore + revenueScore + contactScore;

  let grade: ScoutingScore["grade"];
  if (overall >= 80) grade = "A";
  else if (overall >= 65) grade = "B";
  else if (overall >= 50) grade = "C";
  else if (overall >= 35) grade = "D";
  else grade = "F";

  let recommendation: ScoutingScore["recommendation"];
  if (overall >= 75) recommendation = "high_priority";
  else if (overall >= 55) recommendation = "worth_pursuing";
  else if (overall >= 35) recommendation = "low_priority";
  else recommendation = "skip";

  return {
    overall,
    breakdown: { websiteScore, reviewScore, revenueScore, contactScore },
    grade,
    recommendation,
  };
}

// ==================== DEDUPLICATION ====================

export interface DeduplicationResult {
  isNew: boolean;
  existingId?: string;
  existingStatus?: string;
  matchType?: "exact_name" | "fuzzy_name" | "phone" | "address";
  matchConfidence: number;
}

/**
 * Check if a prospect already exists in the system.
 * Uses multiple matching strategies for robust deduplication.
 */
export async function checkDuplicate(
  businessName: string,
  phone?: string,
  address?: string
): Promise<DeduplicationResult> {
  const existing = await getAllProspects();
  const nameLower = businessName.toLowerCase().trim();

  // Strategy 1: Exact name match
  const exactMatch = existing.find(
    (p) => p.businessName.toLowerCase().trim() === nameLower
  );
  if (exactMatch) {
    return {
      isNew: false,
      existingId: exactMatch.id,
      existingStatus: exactMatch.status,
      matchType: "exact_name",
      matchConfidence: 1.0,
    };
  }

  // Strategy 2: Phone number match
  if (phone) {
    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
    const phoneMatch = existing.find((p) => {
      if (!p.phone) return false;
      return p.phone.replace(/\D/g, "").slice(-10) === normalizedPhone;
    });
    if (phoneMatch) {
      return {
        isNew: false,
        existingId: phoneMatch.id,
        existingStatus: phoneMatch.status,
        matchType: "phone",
        matchConfidence: 0.95,
      };
    }
  }

  // Strategy 3: Fuzzy name match (contains or Levenshtein-like)
  const fuzzyMatch = existing.find((p) => {
    const existingName = p.businessName.toLowerCase().trim();
    // Check if one name contains the other (handles "Joe's Plumbing" vs "Joe's Plumbing LLC")
    if (existingName.includes(nameLower) || nameLower.includes(existingName)) {
      // Only match if the shorter name is at least 60% of the longer name
      const shorter = Math.min(existingName.length, nameLower.length);
      const longer = Math.max(existingName.length, nameLower.length);
      return shorter / longer > 0.6;
    }
    return false;
  });
  if (fuzzyMatch) {
    return {
      isNew: false,
      existingId: fuzzyMatch.id,
      existingStatus: fuzzyMatch.status,
      matchType: "fuzzy_name",
      matchConfidence: 0.8,
    };
  }

  // Strategy 4: Address match (if both have addresses)
  if (address) {
    const normalizedAddr = address.toLowerCase().replace(/[^a-z0-9]/g, "");
    const addrMatch = existing.find((p) => {
      if (!p.address) return false;
      const existingAddr = p.address.toLowerCase().replace(/[^a-z0-9]/g, "");
      // Check if addresses share the same street number and street name
      return existingAddr === normalizedAddr;
    });
    if (addrMatch) {
      return {
        isNew: false,
        existingId: addrMatch.id,
        existingStatus: addrMatch.status,
        matchType: "address",
        matchConfidence: 0.85,
      };
    }
  }

  return { isNew: true, matchConfidence: 0 };
}

// ==================== BATCH SCOUT OPTIMIZER ====================

export interface BatchScoutOptions {
  city: string;
  state?: string;
  categories: Category[];
  maxPerCategory?: number;
  checkWebsites?: boolean;
  filterModernWebsites?: boolean;
  maxQueries?: number;
}

export interface BatchScoutResult {
  category: string;
  query: string;
  found: number;
  new: number;
  duplicates: number;
  filtered: number;
  prospects: Array<Prospect & { scoutingScore?: ScoutingScore; websiteQuality?: WebsiteQualityResult }>;
}

export interface BatchScoutSummary {
  totalFound: number;
  totalNew: number;
  totalDuplicates: number;
  totalFiltered: number;
  totalSaved: number;
  results: BatchScoutResult[];
  topProspects: Array<{ businessName: string; category: string; score: number; grade: string }>;
}

/**
 * Get a summary of scouting optimization stats for the API.
 */
export async function getScoutingStats(): Promise<{
  totalProspects: number;
  byCategory: Array<{ category: string; count: number; avgScore: number }>;
  duplicateRate: number;
  topCategories: string[];
  queriesAvailable: number;
}> {
  const prospects = await getAllProspects();
  const categoryMap = new Map<string, Prospect[]>();

  for (const p of prospects) {
    if (!categoryMap.has(p.category)) categoryMap.set(p.category, []);
    categoryMap.get(p.category)!.push(p);
  }

  const byCategory = Array.from(categoryMap.entries()).map(([category, ps]) => {
    const scores = ps.map((p) => calculateScoutingScore(p).overall);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { category, count: ps.length, avgScore };
  }).sort((a, b) => b.avgScore - a.avgScore);

  return {
    totalProspects: prospects.length,
    byCategory,
    duplicateRate: 0, // Would need historical data to calculate
    topCategories: byCategory.slice(0, 5).map((c) => c.category),
    queriesAvailable: Object.keys(SMART_QUERIES).length,
  };
}
