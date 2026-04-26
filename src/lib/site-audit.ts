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
    ? `Benchmark: BlueJays' V2 ${benchmark.template} at ${benchmark.url}`
    : "No specific BlueJays V2 template available for this category yet.";

  return `You are auditing a small-business website on behalf of BlueJays — a custom website agency that sells $997 site rebuilds + 48-hour delivery to local businesses. Your job: find the hero/positioning/copy/CTA/social-proof problems that are losing this business sales, and recommend specific fixes. Tone: confident, direct, expert — never generic. Frame findings around what BLUEJAYS would do better.

Business: ${businessName}
Category: ${category}
URL: ${ctx.url}
${benchmarkLine}

Site signals:
- Page title: "${ctx.title}"
- Meta description: "${ctx.metaDescription}"
- H1: "${ctx.h1Text}"
- All H1-H3 headings: ${JSON.stringify(ctx.headings.slice(0, 15))}
- Body excerpt (first 2K chars): """${ctx.bodyExcerpt}"""
${ctx.fetchError ? `- Fetch error: ${ctx.fetchError} (you may need to base your audit on the URL + category alone)` : ""}

Return STRICT JSON ONLY in this shape:

{
  "headline": "<the actual H1 they're using, or your read of their primary headline>",
  "cta": "<their primary CTA copy as found, or 'No clear CTA found'>",
  "score": <0-100 — how strong is the hero/positioning/copy stack overall>,
  "findings": [
    {
      "category": "hero" | "copy" | "cta" | "social_proof" | "structure" | "trust" | "brand_fit",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "<short 5-8 word problem name>",
      "observation": "<what is wrong, specifically — quote their copy or describe what's missing>",
      "recommendation": "<how to fix it, specific>",
      "blueJaysSolution": "<how BlueJays' V2 ${category} template solves this>"
    }
  ]
}

Generate 5-8 findings total across the categories. At least 2 should be 'critical' or 'high'. Be SPECIFIC — generic findings like 'add more social proof' are useless. Quote their actual copy when calling something out. If their hero is good, say so and call it out as a strength in the recommendation field.

JSON only. No prose before/after.`;
}

function buildTechnicalPrompt(ctx: SiteContext): string {
  return `Analyze this website's technical SEO + mobile readiness based on the signals below. Return STRICT JSON.

URL: ${ctx.url}
Title: "${ctx.title}" (${ctx.title.length} chars)
Meta description: "${ctx.metaDescription}" (${ctx.metaDescription.length} chars)
H1 found: "${ctx.h1Text}"
Total H1-H3: ${ctx.headings.length}
Images: ${ctx.imageCount} total, ${ctx.imagesWithAlt} with alt text
External scripts: ${ctx.externalScripts}
Has viewport meta: ${ctx.hasViewport}
Has favicon: ${ctx.hasFavicon}
Body length: ${ctx.bodyExcerpt.length} chars (truncated to 2.5K)
${ctx.fetchError ? `Fetch error: ${ctx.fetchError}` : ""}

Return JSON in this shape:
{
  "score": <0-100>,
  "seoFindings": [{ "category": "seo", "severity": "...", "title": "...", "observation": "...", "recommendation": "..." }],
  "technicalFindings": [{ "category": "technical", "severity": "...", "title": "...", "observation": "...", "recommendation": "..." }],
  "mobileFindings": [{ "category": "mobile", "severity": "...", "title": "...", "observation": "...", "recommendation": "..." }]
}

Generate 2-4 findings per category. Be specific. Reference the actual numbers (e.g. "Title is 11 chars — Google truncates at ~60 and yours is 85% under-utilized"). Include fixes in plain language.`;
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

  // Combine all findings to build the prioritized roadmap
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
  const sorted = allFindings
    .slice()
    .sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0));

  const prioritizedRoadmap = sorted.slice(0, 7).map((f, i) => ({
    rank: i + 1,
    title: f.title,
    impact: severityToImpact(f.severity),
    effort: estimateEffort(f.category),
    blueJaysCanDo: !!f.blueJaysSolution,
  }));

  const overallScore = Math.round((heroResult.score + technicalResult.score) / 2);

  // Strengths — pull from low-severity findings + a baseline
  const strengths = sorted
    .filter((f) => f.severity === "low")
    .slice(0, 3)
    .map((f) => f.recommendation || f.observation);
  if (strengths.length === 0) {
    strengths.push(`${businessName} has a working website — that puts you ahead of 30% of small businesses in your category.`);
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
    promptVersion: 1,
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

function estimateEffort(category: string): "high" | "medium" | "low" {
  if (["hero", "copy", "cta"].includes(category)) return "low";
  if (["structure", "trust", "social_proof", "brand_fit"].includes(category)) return "medium";
  return "high";
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
