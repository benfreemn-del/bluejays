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

const CLAUDE_MODEL = "claude-sonnet-4-6";
const OPENAI_MODEL = "gpt-4.1-mini";

// Cost rates per million tokens (2026 pricing)
const CLAUDE_INPUT_RATE = 3.0 / 1_000_000;
const CLAUDE_OUTPUT_RATE = 15.0 / 1_000_000;
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
  dental:           { avgValue: 600,  monthlyVisitors: 800 },
  veterinary:       { avgValue: 250,  monthlyVisitors: 600 },
  salon:            { avgValue: 120,  monthlyVisitors: 800 },
  electrician:      { avgValue: 800,  monthlyVisitors: 400 },
  plumber:          { avgValue: 600,  monthlyVisitors: 500 },
  hvac:             { avgValue: 1200, monthlyVisitors: 400 },
  roofing:          { avgValue: 8000, monthlyVisitors: 350 },
  "auto-repair":    { avgValue: 350,  monthlyVisitors: 700 },
  "law-firm":       { avgValue: 3500, monthlyVisitors: 600 },
  fitness:          { avgValue: 100,  monthlyVisitors: 1200 },
  "real-estate":    { avgValue: 8000, monthlyVisitors: 1500 },
  landscaping:      { avgValue: 1200, monthlyVisitors: 400 },
  cleaning:         { avgValue: 220,  monthlyVisitors: 600 },
  chiropractic:     { avgValue: 200,  monthlyVisitors: 500 },
  accounting:       { avgValue: 800,  monthlyVisitors: 500 },
  insurance:        { avgValue: 600,  monthlyVisitors: 400 },
  "interior-design":{ avgValue: 4000, monthlyVisitors: 500 },
  moving:           { avgValue: 800,  monthlyVisitors: 800 },
  "pest-control":   { avgValue: 200,  monthlyVisitors: 500 },
  "med-spa":        { avgValue: 400,  monthlyVisitors: 700 },
  catering:         { avgValue: 1500, monthlyVisitors: 400 },
  "general-contractor": { avgValue: 15000, monthlyVisitors: 400 },
  general:          { avgValue: 300,  monthlyVisitors: 500 },
};

function estimateMoneyLeak(args: {
  category: string;
  overallScore: number;
}): { monthlyEstimate: number; estimateLow: number; estimateHigh: number; methodology: string } {
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
    methodology:
      `Based on industry-typical traffic for ${args.category.replace("-", " ")} businesses, ` +
      `a small conversion lift from fixing the issues below. Conservative — ` +
      `actual lift could be higher.`,
  };
}

const BLUEJAYS_BENCHMARK_BY_CATEGORY: Record<string, { template: string; url: string }> = {
  dental: { template: "Emerald City Dental (V2)", url: "https://bluejayportfolio.com/v2/dental" },
  electrician: { template: "Cascade Electric Co. (V2)", url: "https://bluejayportfolio.com/v2/electrician" },
  plumber: { template: "Emerald City Plumbing (V2)", url: "https://bluejayportfolio.com/v2/plumber" },
  hvac: { template: "Summit Heating & Air (V2)", url: "https://bluejayportfolio.com/v2/hvac" },
  roofing: { template: "Summit Roofing NW (V2)", url: "https://bluejayportfolio.com/v2/roofing" },
  "auto-repair": { template: "Pacific Auto Works (V2)", url: "https://bluejayportfolio.com/v2/auto-repair" },
  "law-firm": { template: "Pacific Law Group (V2)", url: "https://bluejayportfolio.com/v2/law-firm" },
  salon: { template: "Velvet Hair Studio (V2)", url: "https://bluejayportfolio.com/v2/salon" },
  fitness: { template: "Iron & Oak Fitness (V2)", url: "https://bluejayportfolio.com/v2/fitness" },
  "real-estate": { template: "Puget Sound Realty (V2)", url: "https://bluejayportfolio.com/v2/real-estate" },
  veterinary: { template: "Northshore Vet Clinic (V2)", url: "https://bluejayportfolio.com/v2/veterinary" },
  photography: { template: "Cascade Lens Photography (V2)", url: "https://bluejayportfolio.com/v2/photography" },
  landscaping: { template: "Cascade Landscapes (V2)", url: "https://bluejayportfolio.com/v2/landscaping" },
  cleaning: { template: "Crystal Clean Co. (V2)", url: "https://bluejayportfolio.com/v2/cleaning" },
  chiropractic: { template: "Align Chiropractic (V2)", url: "https://bluejayportfolio.com/v2/chiropractic" },
  accounting: { template: "Evergreen Tax & Advisory (V2)", url: "https://bluejayportfolio.com/v2/accounting" },
  insurance: { template: "Puget Sound Insurance Group (V2)", url: "https://bluejayportfolio.com/v2/insurance" },
  "interior-design": { template: "Cascadia Interiors (V2)", url: "https://bluejayportfolio.com/v2/interior-design" },
  moving: { template: "Cascade Movers (V2)", url: "https://bluejayportfolio.com/v2/moving" },
  "pest-control": { template: "Evergreen Pest Solutions (V2)", url: "https://bluejayportfolio.com/v2/pest-control" },
};

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
        (err) => ({
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
      runTechnicalAnalysis(ctx).catch((err) => ({
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

    // Compute cost
    const claudeCost =
      heroResult.tokensIn * CLAUDE_INPUT_RATE +
      heroResult.tokensOut * CLAUDE_OUTPUT_RATE;
    const openaiCost =
      technicalResult.tokensIn * OPENAI_INPUT_RATE +
      technicalResult.tokensOut * OPENAI_OUTPUT_RATE;
    const totalCost = claudeCost + openaiCost;

    auditContent.cost = {
      totalUsd: totalCost,
      modelsUsed: [heroResult.model, technicalResult.model],
    };

    // Save to DB
    await supabase
      .from("site_audits")
      .update({
        status: "ready",
        audit_content: auditContent,
        models_used: [heroResult.model, technicalResult.model],
        cost_usd: totalCost,
        generated_at: new Date().toISOString(),
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
  model: string;
  error?: string;
}

async function runHeroAnalysis(
  ctx: SiteContext,
  category: string,
  businessName: string,
): Promise<HeroAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return mockHeroAnalysis(ctx, category);
  }

  const prompt = buildHeroPrompt(ctx, category, businessName);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const data = await res.json();
  const text: string = data.content?.[0]?.text || "";
  const tokensIn = data.usage?.input_tokens || 0;
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
    model: CLAUDE_MODEL,
  };
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

async function runTechnicalAnalysis(ctx: SiteContext): Promise<TechnicalAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    return mockTechnicalAnalysis(ctx);
  }

  const prompt = buildTechnicalPrompt(ctx);

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

function buildHeroPrompt(
  ctx: SiteContext,
  category: string,
  businessName: string,
): string {
  const benchmark = BLUEJAYS_BENCHMARK_BY_CATEGORY[category];
  const benchmarkLine = benchmark
    ? `Reference benchmark: BlueJays' V2 ${benchmark.template} at ${benchmark.url}`
    : "No specific BlueJays V2 template available for this category yet.";

  return `You are auditing a small-business website on behalf of BlueJays — an agency that sells $997 site rebuilds + 48-hour delivery to local businesses.

CRITICAL — your tone:
- Plain English, 7th-grade reading level. Short sentences. No jargon.
- Address the owner DIRECTLY ("you", "your customers"). Never "the user" or "the website".
- Lead with the COST of the problem (lost customers, missed bookings, wasted ad spend) — never lead with the technical issue.
- Specific > generic. Quote their actual copy. Reference real numbers.
- Match Hormozi's tone: blunt, friendly, direct. "Your title is barely a tweet. Google shows 60 chars; you're using 18. That's free real estate you're throwing away."
- If something is GOOD, say so plainly: "Your X is dialed in" — celebrate it. Don't say "no action needed".

Business: ${businessName}
Category: ${category}
URL: ${ctx.url}
${benchmarkLine}

Site signals:
- Page title: "${ctx.title}" (${ctx.title.length} chars)
- Meta description: "${ctx.metaDescription}" (${ctx.metaDescription.length} chars)
- H1: "${ctx.h1Text}"
- All H1-H3 headings: ${JSON.stringify(ctx.headings.slice(0, 15))}
- Body excerpt (first 2K chars): """${ctx.bodyExcerpt}"""
${ctx.fetchError ? `- Fetch error: ${ctx.fetchError}` : ""}

Return STRICT JSON ONLY:

{
  "headline": "<the actual H1 they're using, or your read of their primary headline>",
  "cta": "<their primary CTA copy as found, or 'No clear CTA found'>",
  "score": <0-100 — how strong is hero/positioning/copy/social-proof overall>,
  "findings": [
    {
      "category": "hero" | "copy" | "cta" | "social_proof" | "structure" | "trust" | "brand_fit",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<5-8 words, plain English. NOT 'Sub-optimal hero copy structure'. YES 'Your hero doesn't say what you do'>",
      "observation": "<2-3 sentences. PUNCHY. Lead with the cost. Quote their copy. Example: 'Your hero just says \\"Welcome\\" - a customer landing here in 3 seconds has no idea if you can fix their problem. Most leave by then.'>",
      "recommendation": "<2-3 sentences. Specific fix in plain English. NO jargon. Example: 'Lead with what you DO and who you HELP. Try: \\"Same-day plumbing for Tacoma homeowners — ${"$"}99 service call, no surprise fees.\\"'>",
      "blueJaysSolution": "<one sentence on how BlueJays' V2 ${category} template solves this>"
    }
  ]
}

Generate 4-6 findings total. STRICT GUIDELINES:
- 1-2 must be severity="critical" or "high" if the site is below 70 score
- 1-2 should be severity="low" — these are STRENGTHS the site is doing right (NOT problems). Frame the title celebratively ("Your meta description nails it").
- Skip generic SEO advice that any tool could give. Focus on what's losing them CUSTOMERS.
- Never say "improve", "optimize", "enhance" — say what to do instead.
- If category-specific patterns apply (dental: online booking, electrician: license number, salon: book online, etc.), call them out by name.

JSON only. No prose before/after.`;
}

function buildTechnicalPrompt(ctx: SiteContext): string {
  return `Audit this site's technical SEO + mobile readiness. Return STRICT JSON.

CRITICAL — tone rules (this is a customer-facing audit, not a Lighthouse report):
- Plain English. 7th-grade reading level. Short sentences.
- Address them as "you". Lead with COST (customers lost, money wasted), not the technical metric.
- "Your site loads 14 external scripts. On a phone over LTE that's 4-6 seconds of staring at a blank screen. Most leave by then." NOT "External script count is high, may impact mobile performance."
- If something is GOOD, celebrate it. "All 22 of your images have alt text — Google AND screen readers love this." NOT "Maintain descriptive alt text."
- 1-2 of your findings should be severity="low" = STRENGTHS the site does right. The rest are real problems.

URL: ${ctx.url}
Title: "${ctx.title}" (${ctx.title.length} chars)
Meta description: "${ctx.metaDescription}" (${ctx.metaDescription.length} chars)
H1: "${ctx.h1Text}"
Total H1-H3: ${ctx.headings.length}
Images: ${ctx.imageCount} total, ${ctx.imagesWithAlt} with alt text
External scripts: ${ctx.externalScripts}
Viewport meta: ${ctx.hasViewport}
Favicon: ${ctx.hasFavicon}
Body length: ${ctx.bodyExcerpt.length} chars
${ctx.fetchError ? `Fetch error: ${ctx.fetchError}` : ""}

Return JSON:
{
  "score": <0-100>,
  "seoFindings": [{ "category": "seo", "severity": "...", "title": "...", "observation": "...", "recommendation": "..." }],
  "technicalFindings": [{ "category": "technical", "severity": "...", "title": "...", "observation": "...", "recommendation": "..." }],
  "mobileFindings": [{ "category": "mobile", "severity": "...", "title": "...", "observation": "...", "recommendation": "..." }]
}

Generate 2-3 findings per category (6-9 total max). Reference actual numbers ("18 chars" not "short title"). NO Lighthouse-speak. Frame each fix in plain English with a one-line "what good looks like" anchor.

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
  const benchmark = BLUEJAYS_BENCHMARK_BY_CATEGORY[businessCategory] || {
    template: "BlueJays V2 portfolio",
    url: "https://bluejayportfolio.com/templates",
  };

  const heroFindings = heroResult.findings.filter((f) =>
    ["hero", "copy", "cta", "structure", "brand_fit"].includes(f.category),
  );
  const trustFindings = heroResult.findings.filter((f) =>
    ["social_proof", "trust"].includes(f.category),
  );

  // Combine all findings
  const allFindings = [
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

  // Prioritized roadmap: ONLY findings with severity > low. Low-severity
  // findings are STRENGTHS — they belong in the strengths section, not
  // the fix-list. (Bug fix 2026-04-26: items 6+7 in the original audit
  // were strengths leaking into the fix list.) Cap at 5 per research
  // recommendation — "3-5 prioritized issues, 40+ paralyzes."
  const fixFindings = allFindings.filter((f) => f.severity !== "low");
  const sortedFixes = fixFindings
    .slice()
    .sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0));

  const prioritizedRoadmap = sortedFixes.slice(0, 5).map((f, i) => ({
    rank: i + 1,
    title: f.title,
    impact: severityToImpact(f.severity),
    effort: estimateEffort(f.category, f.severity),
    blueJaysCanDo: !!f.blueJaysSolution,
  }));

  const overallScore = Math.round((heroResult.score + technicalResult.score) / 2);
  const moneyLeak = estimateMoneyLeak({ category: businessCategory, overallScore });

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

  // One-line summary tuned to score
  const oneLineSummary =
    overallScore >= 80
      ? `${businessName}'s site is solid — but a few high-impact tweaks could materially lift conversions.`
      : overallScore >= 60
        ? `${businessName}'s site has the bones right but is leaving real money on the table.`
        : overallScore >= 40
          ? `${businessName}'s current site is hurting your conversions more than helping. The good news: every issue we found is fixable.`
          : `${businessName}'s current site is actively costing you customers. We'd recommend a full rebuild before another marketing dollar gets spent.`;

  return {
    url,
    businessCategory,
    generatedAt: new Date().toISOString(),
    promptVersion: 2, // v2 = Hormozi-tone refactor (2026-04-26): plain-English, cost-anchored prompts, money-leak estimate, fixed strength leak into roadmap, less aggressive Rebuild labeling
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
      gapSummary: `Compare to our ${benchmark.template} — that's the quality bar we'd ship for ${businessName}.`,
    },
    moneyLeak,
    prioritizedRoadmap,
    strengths,
    callToAction: {
      headline: "Good ideas alone don't fix funnels. Execution does.",
      body: `You now have ${prioritizedRoadmap.length} prioritized fixes for ${businessName}. The catch: most small businesses don't ship them — they get stuck on which to do first, how to test, and how to actually execute. We'll rebuild your site to fix all of these in 48 hours for $997. No retainers, no monthly fees.`,
      primaryButtonText: "Rebuild My Site — $997",
      primaryButtonUrl: "https://bluejayportfolio.com/contact?source=audit",
      secondaryButtonText: "Book a 15-min walkthrough",
      secondaryButtonUrl: "https://bluejayportfolio.com/book?source=audit",
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
        blueJaysSolution: `Our V2 ${category} template hero leads with the customer's outcome, not your service category.`,
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
        blueJaysSolution: "Our V2 templates pull Google review data directly into a prominent above-the-fold strip.",
      },
    ],
    headline: ctx.h1Text || "(no H1 found)",
    cta: "(MOCK) Primary CTA copy",
    score: 55,
    tokensIn: 0,
    tokensOut: 0,
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
