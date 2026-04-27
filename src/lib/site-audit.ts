/**
 * Site Audit module — Hormozi salty-pretzel lead-magnet engine.
 *
 * Per Ben's 10-question gate (2026-04-26): prospects submit a URL +
 * business category, we run a comprehensive AI audit (Claude for
 * hero/positioning where quality matters, GPT-4.1-mini for SEO/technical
 * mechanical work), synthesize into a structured report, store in
 * `site_audits` table, and trigger a 5-email Hormozi-style sequence.
 *
 * Self-improving loop (#8A): every audit logs cost + models used, and
 * the audit_prompt_versions table tracks conversion-by-prompt-version
 * so a weekly cron can tune the prompts based on what's converting.
 *
 * Mock-mode safe: when ANTHROPIC_API_KEY OR OPENAI_API_KEY is absent,
 * uses stubbed responses so local dev / CI keeps working.
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import { logCost } from "./cost-logger";
import {
  formatHeroPainPointsBlock,
  formatTechPainPointsBlock,
} from "./audit-category-pain-points";

const CLAUDE_MODEL = "claude-sonnet-4-6";
const OPENAI_MODEL = "gpt-4.1-mini";

// Cost rates per million tokens (2026 pricing)
const CLAUDE_INPUT_RATE = 3.0 / 1_000_000;
const CLAUDE_OUTPUT_RATE = 15.0 / 1_000_000;
const CLAUDE_CACHE_READ_RATE = 0.3 / 1_000_000; // 90% cheaper than uncached input
const OPENAI_INPUT_RATE = 0.4 / 1_000_000;
const OPENAI_OUTPUT_RATE = 1.6 / 1_000_000;

export interface SiteContext {
  url: string;
  title: string;
  metaDescription: string;
  h1Text: string;
  headings: string[];
  bodyExcerpt: string; // first 2K chars of visible text
  imageCount: number;
  imagesWithAlt: number;
  externalScripts: number;
  hasViewport: boolean;
  hasFavicon: boolean;
  screenshotUrl: string;
  fetchedAt: string;
  fetchError?: string;
}

export interface AuditFinding {
  category: "hero" | "copy" | "cta" | "social_proof" | "structure" | "trust" | "technical" | "seo" | "mobile" | "brand_fit";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  observation: string;
  recommendation: string;
  blueJaysSolution?: string;
}

export interface AuditContent {
  url: string;
  businessCategory: string;
  generatedAt: string;
  promptVersion: number;
  overallScore: number; // 0-100
  oneLineSummary: string;
  heroAnalysis: {
    score: number;
    headline: string;
    cta: string;
    findings: AuditFinding[];
  };
  copyAndPositioning: {
    score: number;
    findings: AuditFinding[];
  };
  trustAndSocialProof: {
    score: number;
    findings: AuditFinding[];
  };
  technicalAndSeo: {
    score: number;
    findings: AuditFinding[];
  };
  mobileAndUx: {
    score: number;
    findings: AuditFinding[];
  };
  blueJaysBenchmark: {
    referenceTemplate: string;
    referenceUrl: string;
    gapSummary: string;
  };
  prioritizedRoadmap: Array<{
    rank: number;
    title: string;
    impact: "high" | "medium" | "low";
    effort: "high" | "medium" | "low";
    blueJaysCanDo: boolean;
    /** Estimated $/month recovered when this fix lands. Deterministic
     *  formula based on severity weight × share of total recovery. The
     *  sum of all 5 fixes caps at ~60% of currentLeak (Q6A: conservative).
     *  0 when score >= 80 (no leak to recover). */
    recoveryMonthly: number;
    /** Leads/month — recoveryMonthly / avgLeadValue, where avgLeadValue
     *  = avgCustomerValue × DEFAULT_CLOSE_RATE. Spec is per Q2C.
     *  Stacks under the dollar number on each fix card. */
    recoveryLeads: number;
    /** Customers/month — kept for backward-compat with v5 audits and
     *  used by the "Stop the leak" total because customer counts
     *  read more concrete than lead counts at the punchline. */
    recoveryCustomers: number;
  }>;
  strengths: string[];
  /** Hormozi-style money-leak anchor: rough monthly $ this site is
   *  costing the prospect in missed leads/conversions. Conservative
   *  per-vertical formula — NEVER overclaim. Per research deliverable
   *  Section G Risk #2: "Saying 'you're losing $50K/month' to a one-chair
   *  salon makes you look like a scammer. Better to underclaim by 30%
   *  than overclaim by 10%." */
  moneyLeak: {
    monthlyEstimate: number; // USD
    estimateLow: number;
    estimateHigh: number;
    methodology: string; // one-line plain-English explanation
    avgCustomerValue: number; // displayed as the "avg lead chip" near hero
  };
  /** "Stop the leak" total — sum of per-fix recovery numbers, framed as
   *  the bridge from the audit to the $997 offer. Conservative: ~60% of
   *  the current leak. All zeros when score >= 80 (healthy site). */
  recoveryProjection: {
    totalMonthly: number;
    totalLeads: number;
    totalCustomers: number;
    avgCustomerValue: number;
    capPercent: number; // e.g. 0.60 = "60% of leak recovered"
    methodology: string;
  };
  callToAction: {
    headline: string;
    body: string;
    primaryButtonText: string;
    primaryButtonUrl: string;
    secondaryButtonText: string;
    secondaryButtonUrl: string;
  };
  cost: {
    totalUsd: number;
    modelsUsed: string[];
  };
}

/**
 * Per-vertical money-leak estimator. Conservative formulas — better to
 * UNDERclaim by 30% than OVERclaim by 10% (research Risk #2).
 *
 * Formula: avgCustomerValue × estimatedMonthlySiteVisitors × estLiftFromFix
 * The numbers below are deliberately conservative midpoints from public
 * SMB benchmarks — not aspirational marketing math.
 *
 * - avgCustomerValue: average ticket / project value
 * - monthlyVisitors: assumed for a small-business site (mostly local)
 * - liftPercent: typical conversion lift from fixing a 60-or-below site
 *
 * For low-confidence categories or when the audit score is high (80+),
 * we skip the money-leak entirely or use the lowest tier — overclaiming
 * to a healthy site reads as scammy.
 */
const VERTICAL_LEAK_RATES: Record<string, { avgValue: number; monthlyVisitors: number }> = {
  // Healthcare-adjacent
  dental:                { avgValue: 600,   monthlyVisitors: 800 },
  veterinary:            { avgValue: 250,   monthlyVisitors: 600 },
  chiropractic:          { avgValue: 200,   monthlyVisitors: 500 },
  "physical-therapy":    { avgValue: 250,   monthlyVisitors: 500 },
  "med-spa":             { avgValue: 400,   monthlyVisitors: 700 },
  medical:               { avgValue: 350,   monthlyVisitors: 600 },
  // Trades / home services
  electrician:           { avgValue: 800,   monthlyVisitors: 400 },
  plumber:               { avgValue: 600,   monthlyVisitors: 500 },
  hvac:                  { avgValue: 1200,  monthlyVisitors: 400 },
  roofing:               { avgValue: 8000,  monthlyVisitors: 350 },
  "auto-repair":         { avgValue: 350,   monthlyVisitors: 700 },
  landscaping:           { avgValue: 1200,  monthlyVisitors: 400 },
  cleaning:              { avgValue: 220,   monthlyVisitors: 600 },
  "carpet-cleaning":     { avgValue: 250,   monthlyVisitors: 500 },
  moving:                { avgValue: 800,   monthlyVisitors: 800 },
  "pest-control":        { avgValue: 200,   monthlyVisitors: 500 },
  "general-contractor":  { avgValue: 15000, monthlyVisitors: 400 },
  construction:          { avgValue: 12000, monthlyVisitors: 350 },
  painting:              { avgValue: 3500,  monthlyVisitors: 400 },
  "pressure-washing":    { avgValue: 350,   monthlyVisitors: 500 },
  "tree-service":        { avgValue: 1200,  monthlyVisitors: 350 },
  fencing:               { avgValue: 4500,  monthlyVisitors: 350 },
  "garage-door":         { avgValue: 600,   monthlyVisitors: 400 },
  locksmith:             { avgValue: 180,   monthlyVisitors: 600 },
  towing:                { avgValue: 150,   monthlyVisitors: 700 },
  "junk-removal":        { avgValue: 350,   monthlyVisitors: 500 },
  "appliance-repair":    { avgValue: 220,   monthlyVisitors: 500 },
  "pool-spa":            { avgValue: 350,   monthlyVisitors: 400 },
  // Professional services
  "law-firm":            { avgValue: 3500,  monthlyVisitors: 600 },
  accounting:            { avgValue: 800,   monthlyVisitors: 500 },
  insurance:             { avgValue: 600,   monthlyVisitors: 400 },
  "real-estate":         { avgValue: 8000,  monthlyVisitors: 1500 },
  // Lifestyle / beauty / creative
  salon:                 { avgValue: 120,   monthlyVisitors: 800 },
  "interior-design":     { avgValue: 4000,  monthlyVisitors: 500 },
  photography:           { avgValue: 800,   monthlyVisitors: 600 },
  florist:               { avgValue: 100,   monthlyVisitors: 600 },
  tattoo:                { avgValue: 350,   monthlyVisitors: 500 },
  "event-planning":      { avgValue: 6000,  monthlyVisitors: 400 },
  catering:              { avgValue: 1500,  monthlyVisitors: 400 },
  restaurant:            { avgValue: 60,    monthlyVisitors: 2500 },
  // Fitness / community
  fitness:               { avgValue: 100,   monthlyVisitors: 1200 },
  "martial-arts":        { avgValue: 150,   monthlyVisitors: 600 },
  church:                { avgValue: 80,    monthlyVisitors: 500 },
  daycare:               { avgValue: 1400,  monthlyVisitors: 600 },
  tutoring:              { avgValue: 600,   monthlyVisitors: 500 },
  "pet-services":        { avgValue: 80,    monthlyVisitors: 700 },
  // Fallback
  general:               { avgValue: 300,   monthlyVisitors: 500 },
};

function estimateMoneyLeak(args: {
  category: string;
  overallScore: number;
}): { monthlyEstimate: number; estimateLow: number; estimateHigh: number; methodology: string; avgCustomerValue: number } {
  const rates = VERTICAL_LEAK_RATES[args.category] || VERTICAL_LEAK_RATES["general"];
  // Lift % depends on how bad the site is. Cap aggressively — never claim
  // that fixing a single site delivers more than 5% absolute conversion lift.
  const liftPercent =
    args.overallScore >= 80 ? 0.005
      : args.overallScore >= 60 ? 0.012
      : args.overallScore >= 40 ? 0.025
      : 0.04;

  // Apply 0.7× safety margin so we always underclaim
  const baseLeakMonthly = rates.avgValue * rates.monthlyVisitors * liftPercent * 0.7;

  // Range: ±35% from the midpoint. Round to nearest $50.
  const low = Math.round((baseLeakMonthly * 0.65) / 50) * 50;
  const high = Math.round((baseLeakMonthly * 1.35) / 50) * 50;
  const mid = Math.round(baseLeakMonthly / 50) * 50;

  return {
    monthlyEstimate: mid,
    estimateLow: low,
    estimateHigh: high,
    avgCustomerValue: rates.avgValue,
    methodology:
      `Based on how much traffic ${args.category.replace("-", " ")} sites usually get, ` +
      `plus a small bump from fixing the things below. We're being safe — ` +
      `the real number could be bigger.`,
  };
}

const BLUEJAYS_BENCHMARK_BY_CATEGORY: Record<string, { template: string; url: string }> = {
  // Healthcare
  dental:             { template: "Emerald City Dental",          url: "https://bluejayportfolio.com/v2/dental" },
  veterinary:         { template: "Northshore Vet Clinic",        url: "https://bluejayportfolio.com/v2/veterinary" },
  chiropractic:       { template: "Align Chiropractic",           url: "https://bluejayportfolio.com/v2/chiropractic" },
  "physical-therapy": { template: "Summit PT & Rehab",            url: "https://bluejayportfolio.com/v2/physical-therapy" },
  medical:            { template: "Cascade Medical Group",        url: "https://bluejayportfolio.com/v2/medical" },
  "med-spa":          { template: "Radiance Med Spa",             url: "https://bluejayportfolio.com/v2/med-spa" },
  daycare:            { template: "Sunshine Daycare Center",      url: "https://bluejayportfolio.com/v2/daycare" },
  // Trades
  electrician:        { template: "Cascade Electric Co.",         url: "https://bluejayportfolio.com/v2/electrician" },
  plumber:            { template: "Emerald City Plumbing",        url: "https://bluejayportfolio.com/v2/plumber" },
  hvac:               { template: "Summit Heating & Air",         url: "https://bluejayportfolio.com/v2/hvac" },
  roofing:            { template: "Summit Roofing NW",            url: "https://bluejayportfolio.com/v2/roofing" },
  "auto-repair":      { template: "Pacific Auto Works",           url: "https://bluejayportfolio.com/v2/auto-repair" },
  "general-contractor":{ template: "Summit Builders NW",         url: "https://bluejayportfolio.com/v2/general-contractor" },
  construction:       { template: "Cascade Construction Co.",     url: "https://bluejayportfolio.com/v2/construction" },
  "garage-door":      { template: "Northwest Garage Door",        url: "https://bluejayportfolio.com/v2/garage-door" },
  fencing:            { template: "Pacific Fence & Gate",         url: "https://bluejayportfolio.com/v2/fencing" },
  painting:           { template: "Cascade Painting Pros",        url: "https://bluejayportfolio.com/v2/painting" },
  "pressure-washing": { template: "NW Pressure Washing",         url: "https://bluejayportfolio.com/v2/pressure-washing" },
  "tree-service":     { template: "Cascade Tree Service",         url: "https://bluejayportfolio.com/v2/tree-service" },
  "pool-spa":         { template: "Pacific Pool & Spa",           url: "https://bluejayportfolio.com/v2/pool-spa" },
  locksmith:          { template: "Cascade Lock & Key",           url: "https://bluejayportfolio.com/v2/locksmith" },
  towing:             { template: "Northwest Towing",             url: "https://bluejayportfolio.com/v2/towing" },
  "appliance-repair": { template: "ProFix Appliance Repair",      url: "https://bluejayportfolio.com/v2/appliance-repair" },
  "carpet-cleaning":  { template: "FreshStart Carpet Cleaning",   url: "https://bluejayportfolio.com/v2/carpet-cleaning" },
  "junk-removal":     { template: "CleanSlate Junk Removal",      url: "https://bluejayportfolio.com/v2/junk-removal" },
  // Professional services
  "law-firm":         { template: "Pacific Law Group",            url: "https://bluejayportfolio.com/v2/law-firm" },
  accounting:         { template: "Evergreen Tax & Advisory",     url: "https://bluejayportfolio.com/v2/accounting" },
  insurance:          { template: "Puget Sound Insurance Group",  url: "https://bluejayportfolio.com/v2/insurance" },
  "real-estate":      { template: "Puget Sound Realty",           url: "https://bluejayportfolio.com/v2/real-estate" },
  // Lifestyle / beauty
  salon:              { template: "Velvet Hair Studio",           url: "https://bluejayportfolio.com/v2/salon" },
  fitness:            { template: "Iron & Oak Fitness",           url: "https://bluejayportfolio.com/v2/fitness" },
  "martial-arts":     { template: "Cascade Martial Arts",         url: "https://bluejayportfolio.com/v2/martial-arts" },
  tattoo:             { template: "Cascade Tattoo Studio",        url: "https://bluejayportfolio.com/v2/tattoo" },
  photography:        { template: "Cascade Lens Photography",     url: "https://bluejayportfolio.com/v2/photography" },
  "interior-design":  { template: "Cascadia Interiors",          url: "https://bluejayportfolio.com/v2/interior-design" },
  florist:            { template: "Bloom & Branch Florals",       url: "https://bluejayportfolio.com/v2/florist" },
  // Home services
  landscaping:        { template: "Cascade Landscapes",           url: "https://bluejayportfolio.com/v2/landscaping" },
  cleaning:           { template: "Crystal Clean Co.",            url: "https://bluejayportfolio.com/v2/cleaning" },
  "pest-control":     { template: "Evergreen Pest Solutions",     url: "https://bluejayportfolio.com/v2/pest-control" },
  moving:             { template: "Cascade Movers",               url: "https://bluejayportfolio.com/v2/moving" },
  // Food & events
  restaurant:         { template: "Cascade Kitchen",              url: "https://bluejayportfolio.com/v2/restaurant" },
  catering:           { template: "Ember & Oak Catering",         url: "https://bluejayportfolio.com/v2/catering" },
  "event-planning":   { template: "Elevate Events",               url: "https://bluejayportfolio.com/v2/event-planning" },
  // Education & community
  tutoring:           { template: "Bright Minds Tutoring",        url: "https://bluejayportfolio.com/v2/tutoring" },
  church:             { template: "Grace Community Church",       url: "https://bluejayportfolio.com/v2/church" },
  // Pet & animal
  "pet-services":     { template: "Happy Tails Pet Care",         url: "https://bluejayportfolio.com/v2/pet-services" },
};

// Similarity map: unknown/variant category names → closest V2 category
const CATEGORY_SIMILARITY: Record<string, string> = {
  // Healthcare variants
  orthodontist: "dental", dentist: "dental", teeth: "dental",
  optometrist: "medical", doctor: "medical", clinic: "medical",
  chiropractor: "chiropractic",
  therapist: "physical-therapy", rehab: "physical-therapy", pt: "physical-therapy",
  spa: "med-spa", medspa: "med-spa",
  childcare: "daycare", preschool: "daycare", nursery: "daycare",
  vet: "veterinary", "animal-hospital": "veterinary",
  // Trade variants
  electrical: "electrician", electric: "electrician",
  plumbing: "plumber", drain: "plumber",
  heating: "hvac", cooling: "hvac", "air-conditioning": "hvac",
  roofer: "roofing",
  mechanic: "auto-repair", automotive: "auto-repair", "car-repair": "auto-repair",
  contractor: "general-contractor", builder: "general-contractor", handyman: "general-contractor", remodeling: "general-contractor",
  "home-improvement": "general-contractor",
  exterminator: "pest-control", "bug-control": "pest-control",
  mover: "moving", movers: "moving",
  "carpet-cleaner": "carpet-cleaning", carpets: "carpet-cleaning",
  "pressure-washer": "pressure-washing", "power-washing": "pressure-washing",
  arborist: "tree-service", "tree-trimming": "tree-service",
  locksmith: "locksmith", locks: "locksmith",
  tow: "towing", "tow-truck": "towing",
  "junk-hauling": "junk-removal", "debris-removal": "junk-removal",
  appliances: "appliance-repair",
  // Professional services variants
  lawyer: "law-firm", attorney: "law-firm", legal: "law-film",
  cpa: "accounting", bookkeeper: "accounting", taxes: "accounting",
  "insurance-agent": "insurance",
  realtor: "real-estate", "real-estate-agent": "real-estate", realty: "real-estate",
  // Lifestyle variants
  "hair-salon": "salon", barbershop: "salon", barber: "salon", "nail-salon": "salon",
  gym: "fitness", crossfit: "fitness", yoga: "fitness",
  "martial-art": "martial-arts", karate: "martial-arts", judo: "martial-arts", bjj: "martial-arts",
  "tattoo-shop": "tattoo", "tattoo-parlor": "tattoo",
  photographer: "photography",
  "interior-decorator": "interior-design", "home-design": "interior-design",
  flowers: "florist", "flower-shop": "florist",
  // Home services variants
  "lawn-care": "landscaping", "lawn-mowing": "landscaping",
  "house-cleaning": "cleaning", maid: "cleaning",
  "pool-cleaning": "pool-spa", pool: "pool-spa",
  // Food variants
  cafe: "restaurant", diner: "restaurant", "coffee-shop": "restaurant",
  "food-catering": "catering",
  "event-planner": "event-planning", "wedding-planner": "event-planning",
  // Education variants
  tutor: "tutoring", "test-prep": "tutoring",
  // Pet variants
  "dog-grooming": "pet-services", "pet-grooming": "pet-services",
  "dog-walker": "pet-services", "pet-boarding": "pet-services",
  kennel: "pet-services",
};

function findBestBenchmark(category: string): { template: string; url: string } {
  const norm = category.toLowerCase().trim();
  // Exact match
  if (BLUEJAYS_BENCHMARK_BY_CATEGORY[norm]) return BLUEJAYS_BENCHMARK_BY_CATEGORY[norm];
  // Similarity map match
  if (CATEGORY_SIMILARITY[norm]) {
    const mapped = CATEGORY_SIMILARITY[norm];
    if (BLUEJAYS_BENCHMARK_BY_CATEGORY[mapped]) return BLUEJAYS_BENCHMARK_BY_CATEGORY[mapped];
  }
  // Partial substring match against known keys
  const keys = Object.keys(BLUEJAYS_BENCHMARK_BY_CATEGORY);
  const partial = keys.find((k) => norm.includes(k.replace("-", "")) || k.replace("-", "").includes(norm));
  if (partial) return BLUEJAYS_BENCHMARK_BY_CATEGORY[partial];
  // Final fallback
  return { template: "BlueJays Premium Examples", url: "https://bluejayportfolio.com/v2" };
}

/**
 * Fetch the target site and extract the key elements we'll feed to the
 * AI. Best-effort — if the fetch fails (CORS, 403, JS-rendered, etc.),
 * we still return a SiteContext with the screenshot URL so the audit
 * can fall back to vision-based analysis.
 */
export async function fetchSiteContext(url: string): Promise<SiteContext> {
  const screenshotUrl = `https://image.thum.io/get/width/1400/fullpage/noanimate/wait/5/png/${url}`;

  const ctx: SiteContext = {
    url,
    title: "",
    metaDescription: "",
    h1Text: "",
    headings: [],
    bodyExcerpt: "",
    imageCount: 0,
    imagesWithAlt: 0,
    externalScripts: 0,
    hasViewport: false,
    hasFavicon: false,
    screenshotUrl,
    fetchedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BlueJaysAuditBot/1.0; +https://bluejayportfolio.com/audit)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      ctx.fetchError = `HTTP ${res.status}`;
      return ctx;
    }

    const html = await res.text();

    // Tolerant DOM-light extraction (no DOMParser in Node — use regex).
    ctx.title = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || "").trim().slice(0, 200);
    ctx.metaDescription = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] || "").trim().slice(0, 400);
    ctx.h1Text = (html.match(/<h1[^>]*>([^<]*)<\/h1>/i)?.[1] || "").trim().slice(0, 200);
    ctx.headings = Array.from(html.matchAll(/<h[1-3][^>]*>([^<]*)<\/h[1-3]>/gi))
      .map((m) => m[1].trim())
      .filter(Boolean)
      .slice(0, 25);
    ctx.imageCount = (html.match(/<img\s/gi) || []).length;
    ctx.imagesWithAlt = (html.match(/<img[^>]*\salt=["']/gi) || []).length;
    ctx.externalScripts = (html.match(/<script[^>]*\ssrc=["']/gi) || []).length;
    ctx.hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
    ctx.hasFavicon = /<link[^>]*rel=["'][^"']*icon[^"']*["']/i.test(html);

    // Strip tags + scripts to get body text.
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    ctx.bodyExcerpt = stripped.slice(0, 2500);
  } catch (err) {
    ctx.fetchError = err instanceof Error ? err.message : String(err);
  }

  return ctx;
}

/**
 * Run the audit — main entry point. Orchestrates fetch + Claude + GPT
 * + synthesis + DB write. Returns the saved audit row ID.
 *
 * Steps:
 *  1. Fetch site context
 *  2. Run Claude on hero/positioning (in parallel with #3)
 *  3. Run GPT-mini on SEO/technical
 *  4. Synthesize results into structured AuditContent
 *  5. Update site_audits row with status='ready' + content + cost
 *  6. Caller (API route) sends the welcome email
 */
export async function runAudit(args: {
  auditId: string;
  prospect: { id: string; businessName: string; email: string | null };
  targetUrl: string;
  businessCategory: string;
}): Promise<{ ok: boolean; auditId: string; error?: string }> {
  const { auditId, prospect, targetUrl, businessCategory } = args;

  if (!isSupabaseConfigured()) {
    return { ok: false, auditId, error: "Supabase not configured" };
  }

  // Mark as generating
  await supabase
    .from("site_audits")
    .update({ status: "generating" })
    .eq("id", auditId);

  try {
    const ctx = await fetchSiteContext(targetUrl);

    // Run both AI calls in parallel
    const [heroResult, technicalResult] = await Promise.all([
      runHeroAnalysis(ctx, businessCategory, prospect.businessName).catch(
        (err): HeroAnalysisResult => ({
          findings: [],
          headline: "Analysis unavailable",
          cta: "Analysis unavailable",
          score: 50,
          tokensIn: 0,
          tokensOut: 0,
          model: "fallback",
          error: err instanceof Error ? err.message : String(err),
        }),
      ),
      runTechnicalAnalysis(ctx, businessCategory).catch((err) => ({
        seoFindings: [],
        technicalFindings: [],
        mobileFindings: [],
        score: 50,
        tokensIn: 0,
        tokensOut: 0,
        model: "fallback",
        error: err instanceof Error ? err.message : String(err),
      })),
    ]);

    const auditContent = synthesizeAudit({
      url: targetUrl,
      businessCategory,
      businessName: prospect.businessName,
      ctx,
      heroResult,
      technicalResult,
    });

    // Compute cost — cache reads billed at 90% discount vs uncached input
    const claudeCost =
      heroResult.tokensIn * CLAUDE_INPUT_RATE +
      heroResult.tokensOut * CLAUDE_OUTPUT_RATE +
      heroResult.cacheReadTokens * CLAUDE_CACHE_READ_RATE;
    const openaiCost =
      technicalResult.tokensIn * OPENAI_INPUT_RATE +
      technicalResult.tokensOut * OPENAI_OUTPUT_RATE;
    const totalCost = claudeCost + openaiCost;

    auditContent.cost = {
      totalUsd: totalCost,
      modelsUsed: [heroResult.model, technicalResult.model],
    };

    // Save to DB. Includes audit_prompt variant ID in metadata when
    // a Hyperloop-evolved prompt was used, so conversion analytics
    // can join site_audits.metadata.audit_prompt_variant_id back to
    // hyperloop_variants for Bayesian prompt grading.
    await supabase
      .from("site_audits")
      .update({
        status: "ready",
        audit_content: auditContent,
        models_used: [heroResult.model, technicalResult.model],
        cost_usd: totalCost,
        generated_at: new Date().toISOString(),
        metadata: {
          audit_prompt_variant_id: heroResult.promptVariantId ?? null,
          prompt_source: heroResult.promptVariantId ? "hyperloop" : "hardcoded",
        },
      })
      .eq("id", auditId);

    // Log per-action costs
    await logCost({
      prospectId: prospect.id,
      service: "anthropic",
      action: "site_audit_hero",
      costUsd: claudeCost,
      metadata: { auditId, tokensIn: heroResult.tokensIn, tokensOut: heroResult.tokensOut },
    });
    await logCost({
      prospectId: prospect.id,
      service: "openai",
      action: "site_audit_technical",
      costUsd: openaiCost,
      metadata: { auditId, tokensIn: technicalResult.tokensIn, tokensOut: technicalResult.tokensOut },
    });

    return { ok: true, auditId };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[site-audit] runAudit failed:", reason);
    await supabase
      .from("site_audits")
      .update({
        status: "failed",
        failed_reason: reason,
      })
      .eq("id", auditId);
    return { ok: false, auditId, error: reason };
  }
}

interface HeroAnalysisResult {
  findings: AuditFinding[];
  headline: string;
  cta: string;
  score: number;
  tokensIn: number;
  tokensOut: number;
  cacheReadTokens: number;
  model: string;
  /** ID of the Hyperloop audit_prompt variant used (if any). Lets us
   *  attribute audit-to-paid conversion back to the prompt that
   *  produced this audit, so Bayesian can grade prompt variants. */
  promptVariantId?: string;
  error?: string;
}

/**
 * Fetch the currently-active audit_prompt override for this category.
 *
 * Lookup order:
 *   1. category-specific (variant.metadata.category === category)
 *   2. generic (variant.metadata.category IS NULL or absent)
 *   3. null (caller falls back to hardcoded buildHeroPrompt)
 *
 * This is how Hyperloop evolves prompts over time — when the loop
 * generates new audit_prompt variants for a category, those variants
 * land here and start producing audits. Bayesian compares conversion
 * rates across variants; winners stay active, losers get retired.
 *
 * Variants are evaluated in (kind=audit_prompt) namespace so
 * cross-category comparisons don't fight (per-category prompts have
 * their own analyzer cohort once category lookup hits N+ variants).
 */
async function loadAuditPromptOverride(
  category: string,
): Promise<{ id: string; systemPrompt: string } | null> {
  try {
    // Try category-specific first
    const { data: catSpecific } = await supabase
      .from("hyperloop_variants")
      .select("id, content, metadata")
      .eq("kind", "audit_prompt")
      .eq("status", "active")
      .filter("metadata->>category", "eq", category)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (catSpecific) {
      const content = (catSpecific.content ?? {}) as Record<string, unknown>;
      const sp = typeof content.systemPrompt === "string" ? content.systemPrompt : null;
      if (sp) return { id: catSpecific.id as string, systemPrompt: sp };
    }

    // Fallback to generic (no category set)
    const { data: generic } = await supabase
      .from("hyperloop_variants")
      .select("id, content, metadata")
      .eq("kind", "audit_prompt")
      .eq("status", "active")
      .is("metadata->category", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (generic) {
      const content = (generic.content ?? {}) as Record<string, unknown>;
      const sp = typeof content.systemPrompt === "string" ? content.systemPrompt : null;
      if (sp) return { id: generic.id as string, systemPrompt: sp };
    }
  } catch (err) {
    // Don't fail the audit if Hyperloop tables are missing or RLS
    // blocks. Default-prompt fallback always works.
    console.warn("[site-audit] loadAuditPromptOverride failed (using hardcoded):", err);
  }
  return null;
}

async function runHeroAnalysis(
  ctx: SiteContext,
  category: string,
  businessName: string,
): Promise<HeroAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return mockHeroAnalysis(ctx, category);
  }

  // Try Hyperloop-evolved override first; fall back to hardcoded.
  // The override (if found) replaces the whole prompt — operator/AI
  // generating the variant is responsible for keeping the JSON output
  // schema intact + interpolating ctx fields if needed.
  const override = await loadAuditPromptOverride(category);

  // Build API payload — standard path uses prompt caching (~90% cost savings
  // on the static rubric). Override path skips caching (dynamic content).
  let apiBody: Record<string, unknown>;
  if (override?.systemPrompt) {
    const fullPrompt = interpolatePromptTemplate(override.systemPrompt, { ctx, category, businessName });
    apiBody = {
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: fullPrompt }],
    };
  } else {
    apiBody = {
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: [{ type: "text", text: buildHeroStaticSystem(), cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: buildHeroDynamicUser(ctx, category, businessName) }],
    };
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31",
    },
    body: JSON.stringify(apiBody),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const data = await res.json();
  const text: string = data.content?.[0]?.text || "";
  const cacheReadTokens = data.usage?.cache_read_input_tokens || 0;
  const cacheWriteTokens = data.usage?.cache_creation_input_tokens || 0;
  // uncached input + cache writes are both billed at standard input rate
  const tokensIn = (data.usage?.input_tokens || 0) + cacheWriteTokens;
  const tokensOut = data.usage?.output_tokens || 0;

  const parsed = parseJsonResponse<{
    findings: AuditFinding[];
    headline: string;
    cta: string;
    score: number;
  }>(text, {
    findings: [],
    headline: ctx.h1Text || "Headline analysis unavailable",
    cta: "CTA analysis unavailable",
    score: 50,
  });

  return {
    findings: parsed.findings,
    headline: parsed.headline,
    cta: parsed.cta,
    score: parsed.score,
    tokensIn,
    tokensOut,
    cacheReadTokens,
    model: CLAUDE_MODEL,
    promptVariantId: override?.id, // tracked in audit metadata for attribution
  };
}

/**
 * Replace {placeholders} in a Hyperloop-generated prompt template with
 * the dynamic per-prospect context. Supported placeholders:
 *
 *   {businessName}    — prospect business name
 *   {category}        — vertical (dental / electrician / ...)
 *   {url}             — target site URL
 *   {title}           — page <title>
 *   {metaDescription} — meta description content
 *   {h1}              — first h1 text
 *   {headings}        — JSON array of h1-h3 strings (truncated)
 *   {bodyExcerpt}     — first 2K chars of stripped body
 *
 * Templates that don't use placeholders work unchanged. Templates that
 * reference unknown placeholders leave them in place — the AI sees the
 * literal string, which is usually OK and easy to debug.
 */
function interpolatePromptTemplate(
  template: string,
  args: { ctx: SiteContext; category: string; businessName: string },
): string {
  const { ctx, category, businessName } = args;
  const map: Record<string, string> = {
    businessName,
    category,
    url: ctx.url,
    title: ctx.title || "",
    metaDescription: ctx.metaDescription || "",
    h1: ctx.h1Text || "",
    headings: JSON.stringify(ctx.headings.slice(0, 15)),
    bodyExcerpt: ctx.bodyExcerpt || "",
  };
  return template.replace(/\{(\w+)\}/g, (full, key) => {
    return key in map ? map[key] : full;
  });
}

interface TechnicalAnalysisResult {
  seoFindings: AuditFinding[];
  technicalFindings: AuditFinding[];
  mobileFindings: AuditFinding[];
  score: number;
  tokensIn: number;
  tokensOut: number;
  model: string;
  error?: string;
}

async function runTechnicalAnalysis(
  ctx: SiteContext,
  category: string,
): Promise<TechnicalAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    return mockTechnicalAnalysis(ctx);
  }

  const prompt = buildTechnicalPrompt(ctx, category);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a technical SEO + UX auditor. Analyze the provided site context and return findings as STRICT JSON only — no prose, no markdown.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content || "";
  const tokensIn = data.usage?.prompt_tokens || 0;
  const tokensOut = data.usage?.completion_tokens || 0;

  const parsed = parseJsonResponse<{
    seoFindings: AuditFinding[];
    technicalFindings: AuditFinding[];
    mobileFindings: AuditFinding[];
    score: number;
  }>(text, {
    seoFindings: [],
    technicalFindings: [],
    mobileFindings: [],
    score: 50,
  });

  return {
    seoFindings: parsed.seoFindings,
    technicalFindings: parsed.technicalFindings,
    mobileFindings: parsed.mobileFindings,
    score: parsed.score,
    tokensIn,
    tokensOut,
    model: OPENAI_MODEL,
  };
}

/* -------------------- Prompts -------------------- */

/**
 * Static rubric that never changes across audits — safe to cache via
 * Anthropic prompt caching. Category/business/URL context goes in the
 * dynamic user message instead (see buildHeroDynamicUser).
 */
function buildHeroStaticSystem(): string {
  return `You are auditing a small-business website for BlueJays ($997 site rebuilds, 48-hr delivery).

TONE — non-negotiable:
- Address the owner as "you". Never "the user" or "the website".
- 3rd-grade reading level. Write like you're talking to a friend over a beer, NOT writing a report.
  - SHORT words (most under 6 letters). SHORT sentences (under 12 words).
  - BANNED words: optimize, leverage, enhance, align, synergy, sub-optimal, holistic, robust, streamline, maximize, utilize, facilitate, prioritize, conversion, engagement, methodology, UX, above-the-fold, social proof, positioning, V2, template.
  - BANNED tech jargon (CRITICAL — these never appear in your output, not in titles, not anywhere): H1, H2, H3, H4, heading tag, title tag, meta tag, viewport tag, alt text, schema, schema markup, structured data, JSON-LD, LocalBusiness schema, ElectricalContractor schema, favicon, script, scripts, render, lazy-load, lazy-loading, viewport, DOM, CSS, SEO (say 'Google ranking' instead).
  - When you mean H1/heading: say "the big text at the top of your page" or "your main headline".
  - When you mean meta description: say "the blurb Google shows under your link".
  - When you mean schema: say "the address-book info Google reads about your business".
  - When you mean favicon: say "the little icon next to your tab name".
  - When you mean viewport tag: say "mobile scaling tag" (this is a tiny technical detail — NOT the same as the site actually looking good on phones).
  - When you mean scripts: say "code files your page loads".
  - YES words: fix, change, drop, swap, push, win, get, lose, beat, kill, miss, grab, lift, sink.
  - If a 9-year-old can't read it out loud and get it, rewrite it.
- One punchy sentence beats three good ones. SHORT.
- Lead with cost (lost customers, missed jobs, wasted money) — never the technical issue.
- Quote their actual copy. Reference real numbers.

UNIVERSAL RULES — apply to every category:
1. EVERY site should have images. Stock or real, doesn't matter — but a text-only or near-text-only page (under ~3 images) is a 'critical' or 'high' finding. People skim with their eyes, not their brains.
2. The BEST sites are ONE PAGE. Visitor scrolls. Sees everything. Decides. Calls. Multi-page nav (About / Services / Contact / etc) makes them click, get lost, and bounce. If you see signs of multi-page architecture (heavy top nav, no scroll-to anchors, content split across routes), call it out: "Your site makes visitors click around to find basics. One scrolling page closes faster."
3. Phone number must be on the hero AND clickable. If you can't tell from the body excerpt whether the phone is tap-to-call, flag the risk.
4. MOBILE RULE (CRITICAL): A mobile scaling tag being present does NOT mean the site looks good on phones. Most old sites have the tag and still look completely broken on mobile — text too small, buttons too close together, images overflowing, layout falling apart. If the site shows ANY signs of poor mobile quality (old platform like Flash/old Wix, lots of fixed-width content, no responsive images, heavy script load), flag mobile layout as a SEPARATE finding regardless of the tag. Never give a pass on mobile just because the tag exists.

Return STRICT JSON ONLY:

{
  "headline": "<their actual big headline at top of page>",
  "cta": "<their primary CTA copy, or 'No clear CTA found'>",
  "score": <0-100 — hero/positioning/copy/social-proof overall>,
  "findings": [
    {
      "category": "hero" | "copy" | "cta" | "social_proof" | "structure" | "trust" | "brand_fit",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<5-8 words. 3rd-grade. 'Your hero doesn't say what you do' NOT 'Sub-optimal hero structure'>",
      "observation": "<ONE sentence, max 20 words. 3rd-grade. The problem + cost. Example: 'Your hero just says Welcome. A new visitor has 3 seconds to get it, and most bail.'>",
      "recommendation": "<ONE sentence, max 20 words. 3rd-grade. The fix, plain. Example: 'Tell them what you do and who you help: Same-day plumbing for Tacoma homes, ${"$"}99 to come out.'>",
      "blueJaysSolution": "<ONE short sentence (under 18 words). 3rd-grade. How a BlueJays build fixes it. NEVER say 'V2', 'template', or 'tag'. Say 'a BlueJays site' or 'a BlueJays build'.>"
    }
  ]
}

Generate 4-6 findings total. RULES:
- 1-2 severity="critical" or "high" if score below 70
- 1-2 severity="low" = STRENGTHS (celebratory title, e.g. "Your meta description nails it")
- ABSOLUTE RULE: celebratory tone ("Great", "Good", "Solid", "Working well", "All X have Y") → severity MUST be "low". No exceptions.
- Observations and recommendations: ONE sentence each, max 25 words. NEVER more than 25 words. If you can't say it in 25 words, the finding isn't sharp enough.
- Skip generic SEO advice. Focus on what's losing them CUSTOMERS.
- Never say "improve", "optimize", "enhance".

JSON only.`;
}

/**
 * Dynamic per-audit context: business identity + site signals.
 * This is the user message that pairs with the cached system rubric.
 */
function buildHeroDynamicUser(
  ctx: SiteContext,
  category: string,
  businessName: string,
): string {
  const benchmark = BLUEJAYS_BENCHMARK_BY_CATEGORY[category];
  const benchmarkLine = benchmark
    ? `Quality bar to compare against: BlueJays' ${benchmark.template} site at ${benchmark.url}`
    : "No specific BlueJays example site for this category yet.";
  const painBlock = formatHeroPainPointsBlock(category);

  return `Business: ${businessName}
Category: ${category}
URL: ${ctx.url}
${benchmarkLine}

${painBlock}

Site signals (these are LABELS for your reference — do NOT echo these label names back in your output. Translate to plain English per the BANNED tech jargon rules above):
- Browser-tab title: "${ctx.title}" (${ctx.title.length} chars)
- Google-snippet blurb: "${ctx.metaDescription}" (${ctx.metaDescription.length} chars)
- Big headline at top of page: "${ctx.h1Text}"
- All section headlines: ${JSON.stringify(ctx.headings.slice(0, 15))}
- Image count on page: ${ctx.imageCount}
- Body (first 2K of words on the page): """${ctx.bodyExcerpt}"""
${ctx.fetchError ? `- Fetch error: ${ctx.fetchError}` : ""}`;
}

function buildHeroPrompt(
  ctx: SiteContext,
  category: string,
  businessName: string,
): string {
  const benchmark = BLUEJAYS_BENCHMARK_BY_CATEGORY[category];
  const benchmarkLine = benchmark
    ? `Quality bar to compare against: BlueJays' ${benchmark.template} site at ${benchmark.url}`
    : "No specific BlueJays example site for this category yet.";
  const painBlock = formatHeroPainPointsBlock(category);

  return `You are auditing a small-business website for BlueJays ($997 site rebuilds, 48-hr delivery).

TONE — non-negotiable:
- Address the owner as "you". Never "the user" or "the website".
- 3rd-grade reading level. Write like you're talking to a friend over a beer, NOT writing a report.
  - SHORT words (most under 6 letters). SHORT sentences (under 12 words).
  - BANNED words: optimize, leverage, enhance, align, synergy, sub-optimal, holistic, robust, streamline, maximize, utilize, facilitate, prioritize, conversion, engagement, methodology, UX, above-the-fold, social proof, positioning, V2, template.
  - BANNED tech jargon (CRITICAL — these never appear in your output, not in titles, not anywhere): H1, H2, H3, H4, heading tag, title tag, meta tag, viewport tag, alt text, schema, schema markup, structured data, JSON-LD, LocalBusiness schema, ElectricalContractor schema, favicon, script, scripts, render, lazy-load, lazy-loading, viewport, DOM, CSS, SEO (say 'Google ranking' instead).
  - When you mean H1/heading: say "the big text at the top of your page" or "your main headline".
  - When you mean meta description: say "the blurb Google shows under your link".
  - When you mean schema: say "the address-book info Google reads about your business".
  - When you mean favicon: say "the little icon next to your tab name".
  - When you mean viewport tag: say "mobile scaling tag" (this is a tiny technical detail — NOT the same as the site actually looking good on phones).
  - When you mean scripts: say "code files your page loads".
  - YES words: fix, change, drop, swap, push, win, get, lose, beat, kill, miss, grab, lift, sink.
  - If a 9-year-old can't read it out loud and get it, rewrite it.
- One punchy sentence beats three good ones. SHORT.
- Lead with cost (lost customers, missed jobs, wasted money) — never the technical issue.
- Quote their actual copy. Reference real numbers.

UNIVERSAL RULES — apply to every category:
1. EVERY site should have images. Stock or real, doesn't matter — but a text-only or near-text-only page (under ~3 images) is a 'critical' or 'high' finding. People skim with their eyes, not their brains.
2. The BEST sites are ONE PAGE. Visitor scrolls. Sees everything. Decides. Calls. Multi-page nav (About / Services / Contact / etc) makes them click, get lost, and bounce. If you see signs of multi-page architecture (heavy top nav, no scroll-to anchors, content split across routes), call it out: "Your site makes visitors click around to find basics. One scrolling page closes faster."
3. Phone number must be on the hero AND clickable. If you can't tell from the body excerpt whether the phone is tap-to-call, flag the risk.
4. MOBILE RULE (CRITICAL): A mobile scaling tag being present does NOT mean the site looks good on phones. Most old sites have the tag and still look completely broken on mobile — text too small, buttons too close together, images overflowing, layout falling apart. If the site shows ANY signs of poor mobile quality (old platform like Flash/old Wix, lots of fixed-width content, no responsive images, heavy script load), flag mobile layout as a SEPARATE finding regardless of the tag. Never give a pass on mobile just because the tag exists.

Business: ${businessName}
Category: ${category}
URL: ${ctx.url}
${benchmarkLine}

${painBlock}

Site signals (these are LABELS for your reference — do NOT echo these label names back in your output. Translate to plain English per the BANNED tech jargon rules above):
- Browser-tab title: "${ctx.title}" (${ctx.title.length} chars)
- Google-snippet blurb: "${ctx.metaDescription}" (${ctx.metaDescription.length} chars)
- Big headline at top of page: "${ctx.h1Text}"
- All section headlines: ${JSON.stringify(ctx.headings.slice(0, 15))}
- Image count on page: ${ctx.imageCount}
- Body (first 2K of words on the page): """${ctx.bodyExcerpt}"""
${ctx.fetchError ? `- Fetch error: ${ctx.fetchError}` : ""}

Return STRICT JSON ONLY:

{
  "headline": "<their actual H1>",
  "cta": "<their primary CTA copy, or 'No clear CTA found'>",
  "score": <0-100 — hero/positioning/copy/social-proof overall>,
  "findings": [
    {
      "category": "hero" | "copy" | "cta" | "social_proof" | "structure" | "trust" | "brand_fit",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<5-8 words. 3rd-grade. 'Your hero doesn't say what you do' NOT 'Sub-optimal hero structure'>",
      "observation": "<ONE sentence, max 20 words. 3rd-grade. The problem + cost. Example: 'Your hero just says Welcome. A new visitor has 3 seconds to get it, and most bail.'>",
      "recommendation": "<ONE sentence, max 20 words. 3rd-grade. The fix, plain. Example: 'Tell them what you do and who you help: Same-day plumbing for Tacoma homes, ${"$"}99 to come out.'>",
      "blueJaysSolution": "<ONE short sentence (under 18 words). 3rd-grade. How a BlueJays ${category} site fixes it. NEVER say 'V2', 'template', or 'tag' — owners don't know those words. Say 'BlueJays' site' or 'a BlueJays build'.>"
    }
  ]
}

Generate 4-6 findings total. RULES:
- 1-2 severity="critical" or "high" if score below 70
- 1-2 severity="low" = STRENGTHS (celebratory title, e.g. "Your meta description nails it")
- ABSOLUTE RULE: celebratory tone ("Great", "Good", "Solid", "Working well", "All X have Y") → severity MUST be "low". No exceptions.
- Observations and recommendations: ONE sentence each, max 25 words. NEVER more than 25 words. If you can't say it in 25 words, the finding isn't sharp enough.
- Skip generic SEO advice. Focus on what's losing them CUSTOMERS.
- Never say "improve", "optimize", "enhance".

JSON only.`;
}

function buildTechnicalPrompt(ctx: SiteContext, category: string): string {
  const techPainBlock = formatTechPainPointsBlock(category);
  return `Audit this site's Google-ranking + phone readiness. Return STRICT JSON.

TONE — non-negotiable:
- 3rd-grade reading level. Write like you're texting a friend.
  - SHORT words. SHORT sentences (under 12 words).
  - BANNED words: optimize, leverage, enhance, streamline, maximize, utilize, facilitate, sub-optimal, prioritize, conversion, methodology, UX, above-the-fold, social proof, positioning, V2, template.
  - BANNED tech jargon (CRITICAL — never in titles, never in your output): H1, H2, H3, H4, heading tag, title tag, meta tag, viewport tag, alt text, schema, schema markup, structured data, JSON-LD, LocalBusiness schema, favicon, script, scripts, lazy-load, lazy-loading, DOM, CSS, SEO (say 'Google ranking').
  - When you mean H1/heading: say "the big text at the top of your page" or "your main headline".
  - When you mean schema: say "the address-book info Google reads about your business".
  - When you mean favicon: say "the little icon next to your tab name".
  - When you mean viewport tag / mobile scaling declaration: say "mobile scaling tag" — it's a tiny technical detail. NEVER say this is "phone-friendly" or a sign the site works on phones.
  - When you mean scripts: say "code files your page loads".
  - When you mean alt text: say "label for your image so Google + screen readers know what's in it".
  - YES words: fix, swap, drop, slow, fast, big, small, lose, win, miss, beat.
  - If a 9-year-old can't read it, rewrite it.
- Address them as "you". Lead with cost (customers lost, money wasted).
- "Your site loads 14 code files. On a phone that's 5+ seconds of blank screen. Most people leave." NOT "External script count is high."
- Celebrate good things plainly: "All 22 of your images have labels Google can read. Google loves that."

URL: ${ctx.url}
Category: ${category}

Site signals (LABELS for your reference — do NOT echo these label names back in your output. Translate to plain English per the BANNED tech jargon rules above):
- Browser-tab title: "${ctx.title}" (${ctx.title.length} chars)
- Google-snippet blurb: "${ctx.metaDescription}" (${ctx.metaDescription.length} chars)
- Big headline at top: "${ctx.h1Text}"
- Section headline count: ${ctx.headings.length}
- Images on page: ${ctx.imageCount} total, ${ctx.imagesWithAlt} with image labels
- Code files loaded: ${ctx.externalScripts}
- Mobile scaling tag present: ${ctx.hasViewport ? "yes" : "no"} — NOTE: this tag means almost nothing on its own. Having it does NOT mean the site looks good on phones. Most broken mobile sites have it. You MUST evaluate actual mobile quality separately based on the number of code files, body content, and platform signals.
- Tab icon present: ${ctx.hasFavicon ? "yes" : "no"}
- Body length: ${ctx.bodyExcerpt.length} chars
${ctx.fetchError ? `Fetch error: ${ctx.fetchError}` : ""}

${techPainBlock}

MOBILE EVALUATION RULE: The mobile scaling tag being present is NOT a passing grade for mobile. Evaluate actual phone experience separately. If you see heavy script loads, an old-platform site, or anything suggesting fixed-width or unresponsive layout, flag it as a "high" or "critical" mobile finding. Only mark mobile as a strength ("low" severity) if there are clear signs the site genuinely renders well on phones — not just because the scaling tag exists.

Return JSON:
{
  "score": <0-100>,
  "seoFindings": [{ "category": "seo", "severity": "...", "title": "...", "observation": "...", "recommendation": "..." }],
  "technicalFindings": [{ "category": "technical", "severity": "...", "title": "...", "observation": "...", "recommendation": "..." }],
  "mobileFindings": [{ "category": "mobile", "severity": "...", "title": "...", "observation": "...", "recommendation": "..." }]
}

Generate 1-2 findings per category (3-6 total max). RULES:
- Reference real numbers ("18 chars" not "short title")
- ONE sentence per observation, ONE sentence per recommendation. Max 20 words EACH. 3rd-grade. Never more.
- Title: 5-8 words, 3rd-grade plain English.
- 1-2 must be severity="low" = STRENGTHS — but NEVER mark mobile as a strength unless you have real evidence the site renders well on phones.

ABSOLUTE RULE: celebratory tone ("Great", "Good", "Solid", "All X have Y", "Working well") → severity MUST be "low". No exceptions.

JSON only.`;
}

/* -------------------- Synthesis -------------------- */

function synthesizeAudit(args: {
  url: string;
  businessCategory: string;
  businessName: string;
  ctx: SiteContext;
  heroResult: HeroAnalysisResult;
  technicalResult: TechnicalAnalysisResult;
}): AuditContent {
  const { url, businessCategory, businessName, ctx, heroResult, technicalResult } = args;
  const benchmark = findBestBenchmark(businessCategory);

  const heroFindings = heroResult.findings.filter((f) =>
    ["hero", "copy", "cta", "structure", "brand_fit"].includes(f.category),
  );
  const trustFindings = heroResult.findings.filter((f) =>
    ["social_proof", "trust"].includes(f.category),
  );

  // Combine all findings
  const allFindingsRaw = [
    ...heroResult.findings,
    ...technicalResult.seoFindings,
    ...technicalResult.technicalFindings,
    ...technicalResult.mobileFindings,
  ];

  const severityRank: Record<string, number> = {
    critical: 100,
    high: 70,
    medium: 40,
    low: 20,
  };

  // Topic-based dedup: Claude (hero/positioning) and GPT (technical/seo)
  // both look at the same site signals and frequently flag the same
  // underlying issue. e.g. "H1 is a phone number" gets caught 3 times
  // (hero + technical + mobile) and "meta description is good" gets
  // celebrated twice. Group by topic, keep highest-severity, drop dups.
  const allFindings = dedupeByTopic(allFindingsRaw, severityRank);

  // Prioritized roadmap: ONLY findings with severity > low. Low-severity
  // findings are STRENGTHS — they belong in the strengths section, not
  // the fix-list. (Bug fix 2026-04-26: items 6+7 in the original audit
  // were strengths leaking into the fix list.) Cap at 5 per research
  // recommendation — "3-5 prioritized issues, 40+ paralyzes."
  const fixFindings = allFindings.filter((f) => f.severity !== "low");
  const sortedFixes = fixFindings
    .slice()
    .sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0));

  const top5Fixes = sortedFixes.slice(0, 5);
  const overallScore = Math.round((heroResult.score + technicalResult.score) / 2);
  const moneyLeak = estimateMoneyLeak({ category: businessCategory, overallScore });

  // Per-fix recovery — deterministic, no AI (Q1B). Each fix gets a share
  // of the total recovery pool proportional to its severity weight. The
  // pool itself is RECOVERY_CAP_PERCENT × currentLeak (Q6A: conservative).
  const totalRecoveryPool = Math.round(moneyLeak.monthlyEstimate * RECOVERY_CAP_PERCENT);
  const weights = top5Fixes.map((f) => severityWeight(f.severity));
  const sumWeights = weights.reduce((a, b) => a + b, 0) || 1;
  const avgCustomerValue = (VERTICAL_LEAK_RATES[businessCategory] || VERTICAL_LEAK_RATES["general"]).avgValue;

  // Avg lead value — what each lead is worth before the close-rate
  // discount. Used to translate $/mo into leads/mo (Q2C: leads/mo
  // gives natural variation per fix; e.g. $1,200/mo / $480 = 3 leads).
  const avgLeadValue = Math.max(1, Math.round(avgCustomerValue * DEFAULT_CLOSE_RATE));

  const prioritizedRoadmap = top5Fixes.map((f, i) => {
    const share = weights[i] / sumWeights;
    // Round per-fix recovery to nearest $50 so the numbers feel deliberate
    // not algorithmic. Hidden when score >= 80 (no leak).
    const recoveryMonthly =
      overallScore >= 80 ? 0 : Math.max(50, Math.round((totalRecoveryPool * share) / 50) * 50);
    const recoveryLeads =
      avgLeadValue > 0 ? Math.max(1, Math.round(recoveryMonthly / avgLeadValue)) : 0;
    const recoveryCustomers =
      avgCustomerValue > 0 ? Math.max(1, Math.round(recoveryMonthly / avgCustomerValue)) : 0;
    return {
      rank: i + 1,
      title: f.title,
      impact: severityToImpact(f.severity),
      effort: estimateEffort(f.category, f.severity),
      blueJaysCanDo: !!f.blueJaysSolution,
      recoveryMonthly,
      recoveryLeads,
      recoveryCustomers,
    };
  });

  // Total "Stop the leak" projection — what we put on the bridge-to-CTA box.
  const recoveryProjection = {
    totalMonthly: prioritizedRoadmap.reduce((sum, r) => sum + r.recoveryMonthly, 0),
    totalLeads: prioritizedRoadmap.reduce((sum, r) => sum + r.recoveryLeads, 0),
    totalCustomers: prioritizedRoadmap.reduce((sum, r) => sum + r.recoveryCustomers, 0),
    avgCustomerValue,
    capPercent: RECOVERY_CAP_PERCENT,
    methodology: `Conservative math: avg ${businessCategory.replace("-", " ")} customer is worth ~${"$"}${avgCustomerValue.toLocaleString()}. We rounded down on close rate AND on lift. The real recovery is probably 2x what we show.`,
  };

  // Strengths — celebratory copy from low-severity findings ONLY.
  // Use the title (Hormozi-tone praise) instead of recommendation
  // (which used to be "no action needed" boilerplate).
  const strengths = allFindings
    .filter((f) => f.severity === "low")
    .slice(0, 3)
    .map((f) => f.title); // The title is now phrased celebratively per the Hormozi prompt
  if (strengths.length === 0) {
    strengths.push(`${businessName} has a working website — that puts you ahead of plenty of competitors who don't.`);
  }

  // One-line summary — 3rd-grade Hormozi-tone, money-anchored when leak > 0.
  const leakStr = moneyLeak.monthlyEstimate > 0
    ? `about ${"$"}${moneyLeak.monthlyEstimate.toLocaleString()}/month in lost customers`
    : "real money";
  const oneLineSummary =
    overallScore >= 80
      ? `${businessName}'s site works. A few small tweaks below can make it work even better.`
      : overallScore >= 60
        ? `${businessName}'s site has good bones. But it's losing ${leakStr}. Every problem below has a fix.`
        : overallScore >= 40
          ? `${businessName}'s site is costing you customers right now — ${leakStr}. Every. Single. Day. Good news: we can fix it.`
          : `${businessName}'s site is losing customers fast — ${leakStr}. Don't spend more on ads. Fix the site first.`;

  return {
    url,
    businessCategory,
    generatedAt: new Date().toISOString(),
    promptVersion: 6, // v6 = jargon kill + leads switch (2026-04-26): banned UX/above-the-fold/social proof/positioning/V2/template/tag from prompts, renamed BLUEJAYS_BENCHMARK templates to drop "(V2)" suffix, switched per-fix unit from customers→leads (with 0.4 default close rate, gives natural variation 2/3/3/2/2 instead of all-1s), added recoveryLeads to type + recoveryProjection.totalLeads. CTA headline → "You know the problems. Now fix them." Page section titles plain English (Top of Your Page / Your Words / Why People Trust You / Google & Tech / On Phones / What yours could look like).
    overallScore,
    oneLineSummary,
    heroAnalysis: {
      score: heroResult.score,
      headline: heroResult.headline,
      cta: heroResult.cta,
      findings: heroFindings,
    },
    copyAndPositioning: {
      score: heroResult.score,
      findings: heroResult.findings.filter((f) => f.category === "copy"),
    },
    trustAndSocialProof: {
      score: heroResult.score,
      findings: trustFindings,
    },
    technicalAndSeo: {
      score: technicalResult.score,
      findings: [...technicalResult.seoFindings, ...technicalResult.technicalFindings],
    },
    mobileAndUx: {
      score: technicalResult.score,
      findings: technicalResult.mobileFindings,
    },
    blueJaysBenchmark: {
      referenceTemplate: benchmark.template,
      referenceUrl: benchmark.url,
      gapSummary: `See our ${benchmark.template}. That's what your site should look like.`,
    },
    moneyLeak,
    recoveryProjection,
    prioritizedRoadmap,
    strengths,
    callToAction: {
      headline: "You know the problems. Now fix them.",
      body: `You now have ${prioritizedRoadmap.length} fixes for ${businessName}. Most owners see this list and do nothing for 6 months. They lose tens of thousands. We'll rebuild your site in 48 hours to fix all of them. Most shops charge $5,000–$15,000. We charge $997 (or 3 small payments of $349). No monthly fees. 100% money-back if you don't love it.`,
      primaryButtonText: "Start with 3 × $349",
      primaryButtonUrl: "https://bluejayportfolio.com/contact?source=audit&plan=installment",
      secondaryButtonText: "Or $997 once",
      secondaryButtonUrl: "https://bluejayportfolio.com/contact?source=audit&plan=full",
    },
    cost: {
      totalUsd: 0, // populated by caller
      modelsUsed: [],
    },
  };
}

function severityToImpact(s: string): "high" | "medium" | "low" {
  if (s === "critical" || s === "high") return "high";
  if (s === "medium") return "medium";
  return "low";
}

/**
 * Severity → relative recovery weight. Critical fixes recover more
 * than mediums proportionally. Used to apportion the total recovery
 * pool across the top 5 fixes.
 */
function severityWeight(s: string): number {
  if (s === "critical") return 4;
  if (s === "high")     return 3;
  if (s === "medium")   return 2;
  return 1; // 'low' — almost never in the roadmap (we filter strengths out)
}

/**
 * Recovery cap: how much of the current monthly leak can the fixes
 * realistically claw back? Conservative 60% per Ben's design (Q6A) —
 * we'd rather underclaim and overdeliver than the reverse. Healthy
 * sites (score >= 80) have no leak so this is moot.
 */
const RECOVERY_CAP_PERCENT = 0.60;

/**
 * Default close rate for converting LEADS → paying CUSTOMERS at SMB
 * scale. 40% is conservative for service businesses (most quote-based
 * trades close 30–50%). Used to translate avgCustomerValue (the closed
 * deal value in VERTICAL_LEAK_RATES) into avgLeadValue, so per-fix
 * recovery shows leads/month not customers/month (Q2C: leads stacked
 * under the dollar number).
 */
const DEFAULT_CLOSE_RATE = 0.4;

/**
 * Topic-based dedup. Claude + GPT often flag the same issue from different
 * angles (e.g., "H1 is a phone number" caught by hero/technical/mobile;
 * "meta description is good" celebrated by both). Group findings by a
 * derived topic key, keep the highest-severity finding per topic, drop
 * the rest.
 *
 * Topic detection uses keyword fingerprinting against the title +
 * observation. Add to TOPIC_PATTERNS as new common dups appear.
 */
function dedupeByTopic(
  findings: AuditFinding[],
  severityRank: Record<string, number>,
): AuditFinding[] {
  const TOPIC_PATTERNS: Array<{ key: string; rx: RegExp }> = [
    // H1 = phone number (caught by hero/technical/mobile)
    { key: "h1_phone_number", rx: /(h1|headline|main heading|main headline).*(phone|\(\d{3}\)|number)/i },
    { key: "h1_phone_number", rx: /phone.*\b(h1|headline|heading)\b/i },
    // H1 not descriptive (separate from phone-specific)
    { key: "h1_not_descriptive", rx: /h1.*not descriptive|h1.*lacks|h1.*generic/i },
    // H1 / main heading missing entirely — caught by both hero ("No H1
    // means Google ignores your page") and tech ("Missing H1 Heading")
    // (Bug fix 2026-04-27: was producing 2 of the top 5 fixes for the
    // same underlying issue.)
    { key: "h1_missing", rx: /(no h1|missing h1|h1.*missing|zero h1|h1.*absent|main headline.*missing|big text at the top.*(missing|none|no))/i },
    { key: "h1_missing", rx: /(missing|no).*main (heading|headline)/i },
    // Title length
    { key: "title_length", rx: /\btitle\b.*(short|length|character|under|truncat)/i },
    // Meta description (both as strength and as fix)
    { key: "meta_description_good", rx: /meta description.*(does the job|works|solid|good|optimal|fits|nails|dialed|excellent)/i },
    { key: "meta_description_actionable", rx: /meta description.*(actionable|cta|call.to.action|invite)/i },
    { key: "meta_description_missing", rx: /meta description.*(missing|absent|empty|no\b)/i },
    // Alt text coverage
    { key: "alt_text", rx: /alt (text|attribute|tag).*(image|all|images|coverage)/i },
    { key: "alt_text", rx: /image.*alt/i },
    // External scripts / performance
    { key: "external_scripts", rx: /(external script|script.*load|too many script|script count|\d+ external)/i },
    // Viewport meta tag
    { key: "viewport", rx: /viewport (meta )?tag/i },
    // Favicon
    { key: "favicon", rx: /favicon/i },
    // Page length / thin content
    { key: "page_length", rx: /(page length|content length|thin content|low.*content|word count)/i },
    // CTA copy
    { key: "cta_copy", rx: /\bcta\b|\bcall.to.action\b|primary button|contact us/i },
    // Social proof / reviews
    { key: "social_proof", rx: /\breviews?\b|testimonial|social proof|star rating/i },
    // Hero copy quality
    { key: "hero_copy", rx: /hero copy|hero (text|reads|says)/i },
    // Heading structure / persuasion
    { key: "heading_structure", rx: /(h2|h3|heading).*(persua|direct|instruct|generic)/i },
    // Mobile rendering
    { key: "mobile_loading", rx: /mobile.*(load|slow|speed)|(slow|load).*mobile/i },
    // Email professionalism (gmail vs branded)
    { key: "email_branded", rx: /(gmail|personal email|branded email|email.*business)/i },
    // Schema markup — hero + tech both flag it
    { key: "schema_missing", rx: /(localbusiness|schema|structured data|json.?ld|address.book.info)/i },
    // Phone not tap-to-call (mobile + hero both flag it)
    { key: "phone_tap_to_call", rx: /(tap.to.call|click.to.call|tel:|phone.*clickable|phone.*not.*link)/i },
    // Phone buried / not on hero
    { key: "phone_buried", rx: /(phone.*buried|phone.*not.*on.*hero|phone.*footer|phone.*hidden|phone.*hard to find)/i },
  ];

  function topicOf(f: AuditFinding): string {
    const txt = `${f.title} ${f.observation}`.toLowerCase();
    for (const p of TOPIC_PATTERNS) {
      if (p.rx.test(txt)) return p.key;
    }
    // Fallback: word-fingerprint of title (first 4 significant words)
    const sig = f.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["your", "site", "page", "with", "from", "this", "that"].includes(w))
      .slice(0, 3)
      .sort()
      .join("_");
    return sig || `unique_${Math.random().toString(36).slice(2, 8)}`;
  }

  const byTopic = new Map<string, AuditFinding>();
  for (const f of findings) {
    const topic = topicOf(f);
    const existing = byTopic.get(topic);
    if (!existing) {
      byTopic.set(topic, f);
      continue;
    }
    // Keep the higher-severity. If equal, prefer the longer recommendation
    // (more specific guidance wins).
    const existingRank = severityRank[existing.severity] || 0;
    const newRank = severityRank[f.severity] || 0;
    if (newRank > existingRank) {
      byTopic.set(topic, f);
    } else if (newRank === existingRank && (f.recommendation?.length || 0) > (existing.recommendation?.length || 0)) {
      byTopic.set(topic, f);
    }
  }

  return Array.from(byTopic.values());
}

/**
 * Effort estimation drives the badge ("Easy fix" / "Moderate" / "Rebuild").
 * Rule for picking: most fixes should be Easy or Moderate — Rebuild is
 * reserved for problems where a structural overhaul is the only way out.
 * Per research deliverable Risk #3: "1 of every 4 findings should land
 * in 'Rebuild' territory" — that's the salty-pretzel mechanic. Don't
 * label everything Rebuild (current bug: estimateEffort('seo')='high'
 * meant every technical/SEO finding showed Rebuild).
 *
 * Severity also factors in: a critical-severity hero issue is still a
 * "Rebuild" because the whole hero block needs replacement, while a
 * critical-severity SEO issue (missing meta description) is "Easy fix".
 */
function estimateEffort(category: string, severity: string): "high" | "medium" | "low" {
  // Critical hero/structure problems = rebuild territory
  if (severity === "critical" && ["hero", "structure", "brand_fit"].includes(category)) {
    return "high";
  }
  // Easy fixes — copy tweaks, CTA buttons, meta tags, alt text
  if (["copy", "cta", "seo"].includes(category)) return "low";
  // Moderate — needs more thought but not a rebuild
  if (["hero", "social_proof", "trust", "mobile"].includes(category)) return "medium";
  // Heavy lifts — structural site changes, technical performance
  if (["structure", "technical", "brand_fit"].includes(category)) {
    return severity === "critical" || severity === "high" ? "high" : "medium";
  }
  return "medium";
}

/* -------------------- Mocks (local dev / no API key) -------------------- */

function mockHeroAnalysis(ctx: SiteContext, category: string): HeroAnalysisResult {
  return {
    findings: [
      {
        category: "hero",
        severity: "high",
        title: "Hero headline lacks specificity",
        observation: `Current H1: "${ctx.h1Text || "(none found)"}". Generic — could apply to any ${category} business.`,
        recommendation: "Lead with a specific outcome the customer wants. Replace category labels with results.",
        blueJaysSolution: `A BlueJays ${category} site leads with the customer's outcome, not your service category.`,
      },
      {
        category: "cta",
        severity: "critical",
        title: "Primary CTA buried below the fold",
        observation: "No CTA visible in the first viewport. Customers shouldn't have to scroll to take action.",
        recommendation: "Add a primary CTA in the hero — phone number AND form trigger.",
        blueJaysSolution: "Every BlueJays site has a hero CTA + sticky 24/7 contact button.",
      },
      {
        category: "social_proof",
        severity: "high",
        title: "No reviews or testimonials surfaced",
        observation: "We couldn't find a review count, star rating, or testimonial section on the homepage.",
        recommendation: "Pull your Google reviews onto the homepage. Show 3-5 specific ones with names + locations.",
        blueJaysSolution: "A BlueJays site pulls real Google reviews onto the homepage, right where new visitors see them.",
      },
    ],
    headline: ctx.h1Text || "(no H1 found)",
    cta: "(MOCK) Primary CTA copy",
    score: 55,
    tokensIn: 0,
    tokensOut: 0,
    cacheReadTokens: 0,
    model: "mock_claude",
  };
}

function mockTechnicalAnalysis(ctx: SiteContext): TechnicalAnalysisResult {
  return {
    seoFindings: [
      {
        category: "seo",
        severity: ctx.metaDescription ? "low" : "high",
        title: ctx.metaDescription ? "Meta description present" : "Missing meta description",
        observation: ctx.metaDescription ? `${ctx.metaDescription.length} chars` : "No meta description tag found",
        recommendation: ctx.metaDescription ? "Solid baseline" : "Add a 150-160 char meta description with your primary keyword and call-to-action",
      },
    ],
    technicalFindings: [
      {
        category: "technical",
        severity: ctx.imageCount > 0 && ctx.imagesWithAlt < ctx.imageCount * 0.5 ? "medium" : "low",
        title: "Image alt text coverage",
        observation: `${ctx.imagesWithAlt}/${ctx.imageCount} images have alt text`,
        recommendation: "Every image should have descriptive alt text — Google uses it for ranking and screen readers need it.",
      },
    ],
    mobileFindings: [
      {
        category: "mobile",
        severity: ctx.hasViewport ? "low" : "critical",
        title: ctx.hasViewport ? "Viewport meta tag present" : "Missing viewport meta tag",
        observation: ctx.hasViewport ? "Site declares mobile viewport — good baseline" : "No viewport meta tag — site won't render correctly on mobile.",
        recommendation: ctx.hasViewport ? "Verify mobile breakpoints work — test on a real phone." : 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      },
    ],
    score: 60,
    tokensIn: 0,
    tokensOut: 0,
    model: "mock_openai",
  };
}

/* -------------------- Helpers -------------------- */

function parseJsonResponse<T>(text: string, fallback: T): T {
  // Pull the first {...} block from the response, even if wrapped in
  // ```json fences or surrounded by prose.
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Try to find first { ... } block
    const blockMatch = candidate.match(/\{[\s\S]*\}/);
    if (blockMatch) {
      try {
        return JSON.parse(blockMatch[0]) as T;
      } catch {
        /* fall through */
      }
    }
    return fallback;
  }
}
