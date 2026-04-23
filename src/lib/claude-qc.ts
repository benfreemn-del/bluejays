import * as cheerio from "cheerio";
import type { GeneratedSiteData } from "./generator";
import { scrapeWebsite } from "./scraper";
import type { Prospect, ScrapedData, ServiceItem, Testimonial } from "./types";
import { OpenAI } from "openai";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_ANTHROPIC_MODEL =
  process.env.ANTHROPIC_HANDOFF_MODEL || "claude-opus-4-20250514";

// Use cheap OpenAI model for QC & supercharge; reserve Claude Opus for notes/handoff
const QC_MODEL = process.env.QC_MODEL || "gpt-4.1-mini";
const USE_OPENAI_FOR_QC = process.env.USE_OPENAI_FOR_QC !== "false"; // default true

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
const MAX_PROMPT_CHARS = 48000;
const MAX_RULE_SECTION_CHARS = 8000;
const MAX_PROSPECT_SECTION_CHARS = 5000;
const MAX_SITE_DATA_SECTION_CHARS = 12000;
const MAX_RESEARCH_SUMMARY_CHARS = 12000;
const MAX_AUTOMATED_QC_NOTES_CHARS = 8000;
const MAX_PAGE_SNIPPET_CHARS = 700;

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

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function compactText(value: string, maxChars: number): string {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxChars) return normalized;
  const sliceLength = Math.max(0, maxChars - 32);
  return `${normalized.slice(0, sliceLength).trimEnd()} …[truncated]`;
}

function estimateTokenCount(value: string): number {
  return Math.ceil(value.length / 4);
}

function stringifyCompact(value: unknown, maxChars: number): string {
  return compactText(JSON.stringify(value, null, 2), maxChars);
}

function buildProspectPromptSummary(prospect: Prospect): string {
  return [
    `ID: ${prospect.id}`,
    `Business: ${prospect.businessName}`,
    `Category: ${prospect.category}`,
    `City: ${prospect.city || "n/a"}`,
    `Address: ${prospect.address || "n/a"}`,
    `Owner: ${prospect.ownerName || "n/a"}`,
    `Phone: ${prospect.phone || "n/a"}`,
    `Email: ${prospect.email || "n/a"}`,
    `Website: ${prospect.currentWebsite || "n/a"}`,
    `Theme: ${prospect.selectedTheme || prospect.aiThemeRecommendation || "n/a"}`,
    `Status: ${prospect.status}`,
  ].join("\n");
}

function buildSiteDataPromptSummary(siteData: GeneratedSiteData): string {
  const lines = [
    `Business: ${siteData.businessName}`,
    `Category: ${siteData.category}`,
    `City: ${siteData.city || "n/a"}`,
    `Tagline: ${siteData.tagline || "n/a"}`,
    `Accent color: ${siteData.accentColor}`,
    `Brand color source: ${siteData.brandColorSource || "unknown"}`,
    `Theme mode: ${siteData.themeMode}`,
    `Phone: ${siteData.phone || "n/a"}`,
    `Address: ${siteData.address || "n/a"}`,
    `About: ${compactText(siteData.about || "", 1200) || "n/a"}`,
    `Services: ${(siteData.services || []).slice(0, 8).map((service) => service.name).join(", ") || "n/a"}`,
    `Testimonials: ${(siteData.testimonials || []).slice(0, 4).map((testimonial) => `${testimonial.name}: ${compactText(testimonial.text, 180)}`).join(" | ") || "n/a"}`,
    `Photos: ${(siteData.photos || []).length}`,
    `Stats: ${(siteData.stats || []).slice(0, 4).map((stat) => `${stat.value} ${stat.label}`).join(" | ") || "n/a"}`,
    `Research brief summary: ${siteData.researchBrief?.summary || "n/a"}`,
  ];
  return lines.join("\n");
}

function buildBudgetedPrompt(sections: Array<{ heading?: string; body: string; maxChars?: number }>): string {
  const normalizedSections = sections
    .map((section) => {
      const body = section.maxChars ? compactText(section.body, section.maxChars) : normalizeWhitespace(section.body);
      return section.heading ? `${section.heading}\n${body}` : body;
    })
    .filter((section) => section.trim().length > 0);

  let prompt = normalizedSections.join("\n\n");
  if (prompt.length <= MAX_PROMPT_CHARS) return prompt;

  prompt = normalizedSections
    .map((section) => compactText(section, Math.min(section.length, Math.floor(MAX_PROMPT_CHARS / normalizedSections.length) + 400)))
    .join("\n\n");

  if (prompt.length > MAX_PROMPT_CHARS) {
    prompt = compactText(prompt, MAX_PROMPT_CHARS);
  }

  return prompt;
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

async function callOpenAI(prompt: string): Promise<{ model: string; responseText: string }> {
  const client = new OpenAI();
  const model = QC_MODEL;
  const response = await client.chat.completions.create({
    model,
    max_tokens: 4096,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });
  const responseText = response.choices?.[0]?.message?.content || "";
  if (!responseText) {
    throw new Error("OpenAI returned an empty response.");
  }
  return { model, responseText };
}

async function callClaude(prompt: string): Promise<{ model: string; responseText: string }> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }
  const model = DEFAULT_ANTHROPIC_MODEL;
  if (prompt.length > MAX_PROMPT_CHARS) {
    throw new Error(
      `Claude prompt exceeded hard budget (${estimateTokenCount(prompt)} est. tokens / ${prompt.length} chars).`
    );
  }
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

// Smart caller: uses OpenAI for QC/supercharge, falls back to Claude if OpenAI not available
async function callQcModel(prompt: string): Promise<{ model: string; responseText: string }> {
  if (USE_OPENAI_FOR_QC && process.env.OPENAI_API_KEY) {
    return callOpenAI(prompt);
  }
  return callClaude(prompt);
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
    if (!merged.brandColorSource && entry.brandColorSource) merged.brandColorSource = entry.brandColorSource;
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
    .slice(0, MAX_PAGE_SNIPPET_CHARS);

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
  if (research.mergedScrapedData.brandColorSource) {
    lines.push(`Brand color source: ${research.mergedScrapedData.brandColorSource}`);
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
      compactText(
        `Page ${index + 1}: ${page.url}\nTitle: ${page.title || "n/a"}\nDescription: ${page.description || "n/a"}\nHeadings: ${page.headings.join(" | ") || "n/a"}\nSnippet: ${page.snippet}`,
        1800
      )
    );
  });

  return compactText(lines.join("\n\n"), MAX_RESEARCH_SUMMARY_CHARS);
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
    researchBrief:
      isRecord(returnedSiteData.researchBrief) || Array.isArray(returnedSiteData.researchBrief)
        ? existingSiteData.researchBrief
        : existingSiteData.researchBrief,
  };
}

function buildSuperchargePrompt(input: ClaudeSuperchargeInput): string {
  const researchSummary = input.websiteResearch?.summary || "No current-website research was available.";
  const researchBriefSummary = input.siteData.researchBrief?.summary || "No structured research brief was attached to the generated site data.";

  return buildBudgetedPrompt([
    {
      body: [
        "You are BlueJays' premium website supercharge agent.",
        "Your #1 priority is QUALITY, SMOOTHNESS, and CUSTOMIZATION from the real business.",
        "",
        "Supercharge priorities (in order):",
        "1. QUALITY — Every section must feel polished, professional, and smooth. No rough edges, no awkward copy, no jarring transitions.",
        "2. CUSTOMIZATION — Pull as much as possible from the real business website and scraped info: brand colors, real photos, actual services, real testimonials, tone of voice, team info, hours, specialties. The site should feel like it was hand-built for THIS business.",
        "3. SMOOTHNESS — The overall flow should feel cohesive. Hero → services → about → testimonials → contact should tell a story.",
        "",
        "Hard rules:",
        "- NEVER use duplicate images anywhere in the site. Every image must be unique.",
        "- NEVER use broken or invalid image URLs.",
        "- NEVER use placeholder testimonials (e.g. 'Happy Customer', 'John D.'). Use real ones from the business or remove the section.",
        "- ALWAYS include the real city name in the about section and throughout the site.",
        "- Prefer real business facts over generic defaults. If the research has it, use it.",
        "- Keep the same schema as the provided siteData object.",
        "- Do not invent facts not supported by the original website, prospect record, or current site data.",
        "- Return ONLY valid JSON with this exact shape: {\"summary\": string, \"siteData\": GeneratedSiteData }.",
      ].join("\n"),
    },
    { heading: "Non-negotiable BlueJays rules:", body: input.claudeRules, maxChars: MAX_RULE_SECTION_CHARS },
    { heading: "Automated QC rules:", body: input.qcRules, maxChars: MAX_RULE_SECTION_CHARS },
    { heading: "Prospect record summary:", body: buildProspectPromptSummary(input.prospect), maxChars: MAX_PROSPECT_SECTION_CHARS },
    { heading: "Current generated site data summary:", body: buildSiteDataPromptSummary(input.siteData), maxChars: MAX_SITE_DATA_SECTION_CHARS },
    { heading: "Current generated site data JSON (compressed):", body: stringifyCompact(input.siteData, MAX_SITE_DATA_SECTION_CHARS), maxChars: MAX_SITE_DATA_SECTION_CHARS },
    { heading: "Structured research brief (treat this as the minimum factual backbone for content decisions):", body: researchBriefSummary, maxChars: 4000 },
    { heading: "Original-website research summary:", body: researchSummary, maxChars: MAX_RESEARCH_SUMMARY_CHARS },
  ]);
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
  const researchBriefSummary = input.siteData.researchBrief?.summary || "No structured research brief was attached to the generated site data.";

  return buildBudgetedPrompt([
    {
      body: [
        "You are BlueJays' QC reviewer.",
        "Review the generated site and decide if it's ready for outreach.",
        "",
        "=== INSTANT FAIL GATES (any one of these = automatic fail, score capped at 49) ===",
        "1. BROKEN IMAGES: Any image URL that is broken, returns an error, or is a data URI / SVG placeholder.",
        "2. DUPLICATE IMAGES: Any image appearing more than once anywhere on the site (same URL or same Unsplash photo ID).",
        "3. WRONG/MISSING CITY: The about section or site content doesn't mention the prospect's actual city.",
        "4. PLACEHOLDER TESTIMONIALS: Fake names like 'Happy Customer', 'John D.', 'Sarah M.' or clearly generic testimonial text.",
        "",
        "If ANY instant fail gate is triggered, set passed=false and score to no higher than 49. List the specific blockers.",
        "",
        "=== SCORING (only if no instant fails) ===",
        "- 85-100: premium, custom-feeling, smooth, outreach-ready.",
        "- 70-84: good quality, usable for outreach with minor polish gaps. PASSES.",
        "- 50-69: needs improvement but no hard fails.",
        "- below 50: reserved for instant fail gates only.",
        "",
        "Score fairly. A site with correct city, real business info, all unique working images, and decent copy should score 70+. These are lead-gen previews, not pixel-perfect agency work. Pass threshold is 70.",
        "",
        "Return ONLY valid JSON with this exact shape:",
        '{"summary": string, "premiumVerdict": string, "score": number, "passed": boolean, "strengths": string[], "blockers": string[], "notes": string[]}',
      ].join("\n"),
    },
    { heading: "BlueJays master rules:", body: input.claudeRules, maxChars: MAX_RULE_SECTION_CHARS },
    { heading: "Automated QC rules:", body: input.qcRules, maxChars: MAX_RULE_SECTION_CHARS },
    { heading: "Visual QC guide:", body: input.qcGuide, maxChars: MAX_RULE_SECTION_CHARS },
    { heading: "Prospect record summary:", body: buildProspectPromptSummary(input.prospect), maxChars: MAX_PROSPECT_SECTION_CHARS },
    { heading: "Current generated site data summary:", body: buildSiteDataPromptSummary(input.siteData), maxChars: MAX_SITE_DATA_SECTION_CHARS },
    { heading: "Structured research brief that generation should have followed:", body: researchBriefSummary, maxChars: 4000 },
    { heading: "Original-website research summary:", body: researchSummary, maxChars: MAX_RESEARCH_SUMMARY_CHARS },
    { heading: "Automated QC findings that ran alongside you:", body: input.automatedQcNotes, maxChars: MAX_AUTOMATED_QC_NOTES_CHARS },
  ]);
}

export async function runClaudeSupercharge(
  input: ClaudeSuperchargeInput
): Promise<ClaudeSuperchargeResult> {
  const prompt = buildSuperchargePrompt(input);
  const { model, responseText } = await callQcModel(prompt);
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
  const { model, responseText } = await callQcModel(prompt);
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
