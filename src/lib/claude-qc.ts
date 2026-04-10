import * as cheerio from "cheerio";
import type { GeneratedSiteData } from "./generator";
import { scrapeWebsite } from "./scraper";
import type { Prospect, ScrapedData, ServiceItem, Testimonial } from "./types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_ANTHROPIC_MODEL =
  process.env.ANTHROPIC_HANDOFF_MODEL || "claude-opus-4-20250514";

const RELEVANT_PATH_HINTS = [
  "about",
  "service",
  "services",
  "pricing",
  "menu",
  "gallery",
  "portfolio",
  "team",
  "staff",
  "contact",
  "review",
  "testimonial",
  "faq",
  "hours",
  "location",
  "projects",
  "work",
];

const MAX_RESEARCH_PAGES = 5;

interface ClaudeMessageResponse {
  content?: Array<{ type?: string; text?: string }>;
}

interface WebsiteResearchPage {
  url: string;
  title?: string;
  description?: string;
  headings: string[];
  snippet: string;
}

export interface WebsiteResearch {
  sourceUrl?: string;
  pages: WebsiteResearchPage[];
  mergedScrapedData: Partial<ScrapedData>;
  summary: string;
}

interface ClaudeSuperchargeResponseShape {
  summary?: unknown;
  siteData?: unknown;
}

interface ClaudeQcResponseShape {
  summary?: unknown;
  premiumVerdict?: unknown;
  score?: unknown;
  passed?: unknown;
  strengths?: unknown;
  blockers?: unknown;
  notes?: unknown;
}

export interface ClaudeSuperchargeInput {
  prospect: Prospect;
  siteData: GeneratedSiteData;
  websiteResearch?: WebsiteResearch | null;
  claudeRules: string;
  qcRules: string;
}

export interface ClaudeSuperchargeResult {
  model: string;
  prompt: string;
  responseText: string;
  summary: string;
  siteData: GeneratedSiteData;
}

export interface ClaudeQcReviewInput {
  prospect: Prospect;
  siteData: GeneratedSiteData;
  websiteResearch?: WebsiteResearch | null;
  claudeRules: string;
  qcRules: string;
  qcGuide: string;
  automatedQcNotes: string;
}

export interface ClaudeQcReviewResult {
  model: string;
  prompt: string;
  responseText: string;
  summary: string;
  premiumVerdict: string;
  score: number;
  passed: boolean;
  strengths: string[];
  blockers: string[];
  notes: string[];
  qualityNotes: string;
}

function getAnthropicApiKey() {
  return process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() || fallback : fallback;
}

function cleanOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeServices(
  value: unknown,
  fallback: GeneratedSiteData["services"]
): GeneratedSiteData["services"] {
  if (!Array.isArray(value)) return fallback;

  const normalized = value
    .filter(isRecord)
    .map((service) => {
      const name = cleanString(service.name);
      if (!name) return null;
      return {
        name,
        description: cleanOptionalString(service.description),
        price: cleanOptionalString(service.price),
        icon: cleanOptionalString(service.icon),
      };
    })
    .filter((service): service is NonNullable<typeof service> => Boolean(service));

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeTestimonials(
  value: unknown,
  fallback: GeneratedSiteData["testimonials"]
): GeneratedSiteData["testimonials"] {
  if (!Array.isArray(value)) return fallback;

  const normalized = value
    .filter(isRecord)
    .map((testimonial) => {
      const name = cleanString(testimonial.name);
      const text = cleanString(testimonial.text);
      if (!name || !text) return null;
      const rating = typeof testimonial.rating === "number" ? testimonial.rating : undefined;
      return { name, text, rating };
    })
    .filter((testimonial): testimonial is NonNullable<typeof testimonial> => Boolean(testimonial));

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeStats(
  value: unknown,
  fallback: GeneratedSiteData["stats"]
): GeneratedSiteData["stats"] {
  if (!Array.isArray(value)) return fallback;

  const normalized = value
    .filter(isRecord)
    .map((stat) => {
      const label = cleanString(stat.label);
      const valueText = cleanString(stat.value);
      if (!label || !valueText) return null;
      return { label, value: valueText };
    })
    .filter((stat): stat is NonNullable<typeof stat> => Boolean(stat));

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeSocialLinks(
  value: unknown,
  fallback: GeneratedSiteData["socialLinks"]
): GeneratedSiteData["socialLinks"] {
  if (!isRecord(value)) return fallback;

  const normalized = Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => typeof entryValue === "string" && entryValue.trim())
      .map(([key, entryValue]) => [key, (entryValue as string).trim()])
  );

  return Object.keys(normalized).length > 0 ? normalized : fallback;
}

function extractTextFromClaudeResponse(data: ClaudeMessageResponse): string {
  if (!Array.isArray(data.content)) return "";
  return data.content
    .filter((block) => block?.type === "text" && typeof block.text === "string")
    .map((block) => block.text?.trim() || "")
    .filter(Boolean)
    .join("\n\n");
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function extractFirstJsonObject(text: string): string {
  const normalized = stripCodeFences(text);
  const firstBrace = normalized.indexOf("{");
  if (firstBrace === -1) {
    throw new Error("Claude response did not include a JSON object");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = firstBrace; i < normalized.length; i += 1) {
    const char = normalized[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return normalized.slice(firstBrace, i + 1);
      }
    }
  }

  throw new Error("Claude response JSON was incomplete");
}

async function callClaude(prompt: string): Promise<{ model: string; responseText: string }> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const model = DEFAULT_ANTHROPIC_MODEL;
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Anthropic request failed (${response.status}): ${errorText || response.statusText}`);
  }

  const data = (await response.json()) as ClaudeMessageResponse;
  const responseText = extractTextFromClaudeResponse(data);
  if (!responseText) {
    throw new Error("Claude returned an empty response.");
  }

  return { model, responseText };
}

function dedupePhotos(photos: string[] | undefined): string[] {
  if (!photos?.length) return [];
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const photo of photos) {
    const clean = photo.trim();
    if (!clean) continue;
    const base = clean.split("?")[0].toLowerCase();
    if (seen.has(base)) continue;
    seen.add(base);
    normalized.push(clean);
  }
  return normalized;
}

function dedupeServices(services: ServiceItem[] | undefined): ServiceItem[] {
  if (!services?.length) return [];
  const seen = new Set<string>();
  return services.filter((service) => {
    const key = service.name.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeTestimonials(testimonials: Testimonial[] | undefined): Testimonial[] {
  if (!testimonials?.length) return [];
  const seen = new Set<string>();
  return testimonials.filter((testimonial) => {
    const key = `${testimonial.name}::${testimonial.text}`.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeScrapedDataEntries(entries: Partial<ScrapedData>[]): Partial<ScrapedData> {
  const merged: Partial<ScrapedData> = {
    businessName: "",
    services: [],
    testimonials: [],
    photos: [],
    socialLinks: {},
  };

  for (const entry of entries) {
    if (!entry) continue;

    if (!merged.businessName && entry.businessName) merged.businessName = entry.businessName;
    if (!merged.tagline && entry.tagline) merged.tagline = entry.tagline;
    if (!merged.email && entry.email) merged.email = entry.email;
    if (!merged.phone && entry.phone) merged.phone = entry.phone;
    if (!merged.address && entry.address) merged.address = entry.address;
    if ((!merged.about || merged.about.length < (entry.about?.length || 0)) && entry.about) merged.about = entry.about;
    if (!merged.hours && entry.hours) merged.hours = entry.hours;
    if (!merged.brandColor && entry.brandColor) merged.brandColor = entry.brandColor;
    if (!merged.logoUrl && entry.logoUrl) merged.logoUrl = entry.logoUrl;

    merged.services = dedupeServices([...(merged.services || []), ...(entry.services || [])]);
    merged.testimonials = dedupeTestimonials([...(merged.testimonials || []), ...(entry.testimonials || [])]);
    merged.photos = dedupePhotos([...(merged.photos || []), ...(entry.photos || [])]);
    merged.socialLinks = {
      ...(merged.socialLinks || {}),
      ...(entry.socialLinks || {}),
    };
  }

  if (!merged.services?.length) delete merged.services;
  if (!merged.testimonials?.length) delete merged.testimonials;
  if (!merged.photos?.length) delete merged.photos;
  if (!Object.keys(merged.socialLinks || {}).length) delete merged.socialLinks;

  return merged;
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function summarizePage(url: string, html: string): WebsiteResearchPage {
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, svg").remove();

  const title = $("title").first().text().trim() || undefined;
  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    undefined;
  const headings = $("h1, h2, h3")
    .slice(0, 8)
    .map((_, element) => $(element).text().replace(/\s+/g, " ").trim())
    .get()
    .filter(Boolean)
    .slice(0, 8);
  const snippet = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500);

  return {
    url,
    title,
    description,
    headings,
    snippet,
  };
}

function getRelevantLinks(baseUrl: string, html: string): string[] {
  const base = new URL(baseUrl);
  const $ = cheerio.load(html);
  const candidates = new Set<string>();

  $("a[href]").each((_, element) => {
    const rawHref = ($(element).attr("href") || "").trim();
    const anchorText = $(element).text().replace(/\s+/g, " ").trim().toLowerCase();
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return;

    let resolved: URL;
    try {
      resolved = new URL(rawHref, base);
    } catch {
      return;
    }

    if (resolved.hostname !== base.hostname) return;

    const pathname = resolved.pathname.toLowerCase();
    const haystack = `${pathname} ${anchorText}`;
    if (!RELEVANT_PATH_HINTS.some((hint) => haystack.includes(hint))) return;

    resolved.hash = "";
    resolved.search = "";
    candidates.add(resolved.toString());
  });

  return [...candidates].filter((url) => url !== base.toString()).slice(0, MAX_RESEARCH_PAGES - 1);
}

function buildWebsiteResearchSummary(research: WebsiteResearch): string {
  const lines = [
    `Source URL: ${research.sourceUrl || "none"}`,
    `Pages analyzed: ${research.pages.length}`,
  ];

  if (research.mergedScrapedData.brandColor) {
    lines.push(`Brand color found: ${research.mergedScrapedData.brandColor}`);
  }
  if (research.mergedScrapedData.services?.length) {
    lines.push(`Services found: ${research.mergedScrapedData.services.slice(0, 8).map((service) => service.name).join(", ")}`);
  }
  if (research.mergedScrapedData.photos?.length) {
    lines.push(`Photos found: ${research.mergedScrapedData.photos.length}`);
  }
  if (research.mergedScrapedData.testimonials?.length) {
    lines.push(`Testimonials found: ${research.mergedScrapedData.testimonials.length}`);
  }

  research.pages.forEach((page, index) => {
    lines.push(
      `Page ${index + 1}: ${page.url}\nTitle: ${page.title || "n/a"}\nHeadings: ${page.headings.join(" | ") || "n/a"}\nSnippet: ${page.snippet}`
    );
  });

  return lines.join("\n\n");
}

export async function researchBusinessWebsite(websiteUrl?: string): Promise<WebsiteResearch | null> {
  if (!websiteUrl?.trim()) return null;

  const rootUrl = websiteUrl.trim();
  const scrapedEntries: Partial<ScrapedData>[] = [];
  const pages: WebsiteResearchPage[] = [];

  try {
    const homeHtml = await fetchHtml(rootUrl);
    pages.push(summarizePage(rootUrl, homeHtml));
    scrapedEntries.push(await scrapeWebsite(rootUrl));

    const links = getRelevantLinks(rootUrl, homeHtml);
    for (const link of links) {
      try {
        const [html, scraped] = await Promise.all([fetchHtml(link), scrapeWebsite(link)]);
        pages.push(summarizePage(link, html));
        scrapedEntries.push(scraped);
      } catch (error) {
        console.warn(`[claude-qc] Skipping research page ${link}:`, error);
      }
    }
  } catch (error) {
    console.warn(`[claude-qc] Website research failed for ${rootUrl}:`, error);
    return null;
  }

  const mergedScrapedData = mergeScrapedDataEntries(scrapedEntries);
  const research: WebsiteResearch = {
    sourceUrl: rootUrl,
    pages,
    mergedScrapedData,
    summary: "",
  };
  research.summary = buildWebsiteResearchSummary(research);
  return research;
}

function normalizeReturnedSiteData(
  existingSiteData: GeneratedSiteData,
  returnedSiteData: unknown
): GeneratedSiteData {
  if (!isRecord(returnedSiteData)) {
    return existingSiteData;
  }

  return {
    ...existingSiteData,
    ...returnedSiteData,
    id: existingSiteData.id,
    category: existingSiteData.category,
    businessName: cleanString(returnedSiteData.businessName, existingSiteData.businessName),
    tagline: cleanString(returnedSiteData.tagline, existingSiteData.tagline),
    accentColor: cleanString(returnedSiteData.accentColor, existingSiteData.accentColor),
    heroGradient: cleanString(returnedSiteData.heroGradient, existingSiteData.heroGradient),
    phone: cleanString(returnedSiteData.phone, existingSiteData.phone),
    address: cleanString(returnedSiteData.address, existingSiteData.address),
    about: cleanString(returnedSiteData.about, existingSiteData.about),
    services: normalizeServices(returnedSiteData.services, existingSiteData.services),
    testimonials: normalizeTestimonials(returnedSiteData.testimonials, existingSiteData.testimonials),
    photos: dedupePhotos(normalizeStringArray(returnedSiteData.photos, existingSiteData.photos)),
    hours: cleanOptionalString(returnedSiteData.hours) || existingSiteData.hours,
    socialLinks: normalizeSocialLinks(returnedSiteData.socialLinks, existingSiteData.socialLinks),
    stats: normalizeStats(returnedSiteData.stats, existingSiteData.stats),
    themeMode:
      returnedSiteData.themeMode === "light" || returnedSiteData.themeMode === "dark"
        ? returnedSiteData.themeMode
        : existingSiteData.themeMode,
    city: cleanOptionalString(returnedSiteData.city) || existingSiteData.city,
  };
}

function buildSuperchargePrompt(input: ClaudeSuperchargeInput): string {
  const researchSummary = input.websiteResearch?.summary || "No current-website research was available.";
  return [
    "You are Claude acting as BlueJays' premium website supercharge agent.",
    "Run a DEEP supercharge pass before QC. Your job is to upgrade the generated site data so the preview feels like a custom-built $997 website for this exact business, not a template swap.",
    "",
    "Supercharge objectives:",
    "1. Go deep on the prospect's original business website and use everything available: brand colors, real photos, copy/text, services, pricing, testimonials, tone of voice, team info, hours, specialties.",
    "2. Upgrade the generated site data to match the real business as closely as possible.",
    "3. Make the generated site feel custom-built for the business, not a template with the name swapped.",
    "4. Maintain $997 quality throughout. Every section should feel premium.",
    "",
    "Non-negotiable BlueJays rules:",
    input.claudeRules,
    "",
    "Automated QC rules:",
    input.qcRules,
    "",
    "Prospect record:",
    JSON.stringify(input.prospect, null, 2),
    "",
    "Current generated site data (rewrite this object intelligently):",
    JSON.stringify(input.siteData, null, 2),
    "",
    "Original-website research summary:",
    researchSummary,
    "",
    "Important instructions:",
    "- Prefer real business facts, services, positioning, testimonials, tone, and imagery signals from the original website over generic defaults.",
    "- Keep the same schema as the provided siteData object.",
    "- Do not invent facts that are not supported by the original website, prospect record, or current site data.",
    "- Tighten copy, improve specificity, remove generic filler, and make the site feel premium.",
    "- Keep image URLs that are already valid if they still make sense; replace weak imagery only when you have a stronger option from the research or existing data.",
    "- Return ONLY valid JSON with this exact shape: {\"summary\": string, \"siteData\": GeneratedSiteData }.",
  ].join("\n");
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeScore(value: unknown, fallback = 0): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildClaudeQcPrompt(input: ClaudeQcReviewInput): string {
  const researchSummary = input.websiteResearch?.summary || "No current-website research was available.";
  return [
    "You are Claude acting as BlueJays' senior QC reviewer.",
    "This is NOT just an automated lint pass. Review the prospect holistically and decide whether the generated site feels like a premium $997 product.",
    "",
    "Your review responsibilities:",
    "- Evaluate whether the site data looks custom-built for this business.",
    "- Check content quality, specificity, trust signals, premium positioning, and brand fit.",
    "- Use the original website research to judge how well the generated site matches the real business.",
    "- Identify any premium-quality gaps that automated rules would miss.",
    "- Contribute detailed QC notes and a quality score.",
    "",
    "BlueJays master rules:",
    input.claudeRules,
    "",
    "Automated QC rules:",
    input.qcRules,
    "",
    "Visual QC guide:",
    input.qcGuide,
    "",
    "Prospect record:",
    JSON.stringify(input.prospect, null, 2),
    "",
    "Current generated site data to review:",
    JSON.stringify(input.siteData, null, 2),
    "",
    "Original-website research summary:",
    researchSummary,
    "",
    "Automated QC findings that ran alongside you:",
    input.automatedQcNotes,
    "",
    "Score guidance:",
    "- 90-100: premium, custom-feeling, outreach-ready.",
    "- 80-89: strong but still has meaningful polish gaps.",
    "- 70-79: borderline; usable but not convincingly premium.",
    "- below 70: not acceptable for a $997 product.",
    "",
    "Return ONLY valid JSON with this exact shape:",
    '{"summary": string, "premiumVerdict": string, "score": number, "passed": boolean, "strengths": string[], "blockers": string[], "notes": string[]}',
  ].join("\n");
}

export async function runClaudeSupercharge(
  input: ClaudeSuperchargeInput
): Promise<ClaudeSuperchargeResult> {
  const prompt = buildSuperchargePrompt(input);
  const { model, responseText } = await callClaude(prompt);
  const parsed = JSON.parse(extractFirstJsonObject(responseText)) as ClaudeSuperchargeResponseShape;

  return {
    model,
    prompt,
    responseText,
    summary: cleanString(parsed.summary, "Claude supercharged the site data."),
    siteData: normalizeReturnedSiteData(input.siteData, parsed.siteData),
  };
}

export async function runClaudeQcReview(
  input: ClaudeQcReviewInput
): Promise<ClaudeQcReviewResult> {
  const prompt = buildClaudeQcPrompt(input);
  const { model, responseText } = await callClaude(prompt);
  const parsed = JSON.parse(extractFirstJsonObject(responseText)) as ClaudeQcResponseShape;

  const summary = cleanString(parsed.summary, "Claude reviewed the site.");
  const premiumVerdict = cleanString(parsed.premiumVerdict, "Needs more premium refinement.");
  const score = normalizeScore(parsed.score, 65);
  const passed = normalizeBoolean(parsed.passed, score >= 70);
  const strengths = normalizeStringArray(parsed.strengths, []);
  const blockers = normalizeStringArray(parsed.blockers, []);
  const notes = normalizeStringArray(parsed.notes, []);

  const qualityNotes = [
    `Claude summary: ${summary}`,
    `Premium verdict: ${premiumVerdict}`,
    `Claude score: ${score}/100 ${passed ? "PASS" : "FAIL"}`,
    strengths.length ? `Strengths:\n${strengths.map((entry) => `- ${entry}`).join("\n")}` : "",
    blockers.length ? `Blockers:\n${blockers.map((entry) => `- ${entry}`).join("\n")}` : "",
    notes.length ? `Detailed notes:\n${notes.map((entry) => `- ${entry}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    model,
    prompt,
    responseText,
    summary,
    premiumVerdict,
    score,
    passed,
    strengths,
    blockers,
    notes,
    qualityNotes,
  };
}
