import type { GeneratedSiteData } from "./generator";
import type { Prospect } from "./types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_ANTHROPIC_MODEL =
  process.env.ANTHROPIC_HANDOFF_MODEL || "claude-opus-4-20250514";

interface ClaudeMessageResponse {
  content?: Array<{ type?: string; text?: string }>;
}

interface ClaudeHandoffResponseShape {
  summary?: unknown;
  siteData?: unknown;
}

export interface ClaudeHandoffInput {
  prospect: Prospect;
  siteData: GeneratedSiteData;
  adminNotes: string;
  selectedTheme?: "light" | "dark";
  qcGuide: string;
  currentQcNotes?: string;
}

export interface ClaudeHandoffResult {
  model: string;
  prompt: string;
  responseText: string;
  summary: string;
  siteData: GeneratedSiteData;
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

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
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
      return {
        name,
        text,
        rating,
      };
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

function normalizeReturnedSiteData(
  existingSiteData: GeneratedSiteData,
  returnedSiteData: unknown,
  selectedTheme?: "light" | "dark"
): GeneratedSiteData {
  if (!isRecord(returnedSiteData)) {
    return {
      ...existingSiteData,
      themeMode: selectedTheme || existingSiteData.themeMode,
    };
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
    photos: normalizeStringArray(returnedSiteData.photos, existingSiteData.photos),
    hours: cleanOptionalString(returnedSiteData.hours) || existingSiteData.hours,
    socialLinks: normalizeSocialLinks(returnedSiteData.socialLinks, existingSiteData.socialLinks),
    stats: normalizeStats(returnedSiteData.stats, existingSiteData.stats),
    themeMode:
      returnedSiteData.themeMode === "light" || returnedSiteData.themeMode === "dark"
        ? returnedSiteData.themeMode
        : selectedTheme || existingSiteData.themeMode,
    city: cleanOptionalString(returnedSiteData.city) || existingSiteData.city,
  };
}

export function buildClaudeHandoffPrompt({
  prospect,
  siteData,
  adminNotes,
  selectedTheme,
  qcGuide,
  currentQcNotes,
}: ClaudeHandoffInput): string {
  return [
    "You are Claude Opus acting as the BlueJays site-revision agent.",
    "Your job is to revise a generated local-business website JSON payload based on the user's notes while preserving real business context and passing BlueJays QC.",
    "",
    "OUTPUT INSTRUCTIONS:",
    "Return exactly one JSON object and nothing else.",
    "The JSON object must have this shape:",
    JSON.stringify(
      {
        summary: "Short summary of the revisions Claude made.",
        siteData: {
          id: siteData.id,
          category: siteData.category,
          businessName: siteData.businessName,
          tagline: siteData.tagline,
          accentColor: siteData.accentColor,
          heroGradient: siteData.heroGradient,
          phone: siteData.phone,
          address: siteData.address,
          about: siteData.about,
          services: siteData.services,
          testimonials: siteData.testimonials,
          photos: siteData.photos,
          hours: siteData.hours,
          socialLinks: siteData.socialLinks,
          stats: siteData.stats,
          themeMode: selectedTheme || siteData.themeMode,
          city: siteData.city,
        },
      },
      null,
      2
    ),
    "",
    "REVISION RULES:",
    "- Keep the existing site schema and return valid JSON.",
    "- Preserve the current prospect id and category exactly.",
    "- Apply the admin notes precisely.",
    "- Use the business context and existing scraped/generated data; do not invent implausible facts.",
    "- Prefer existing image URLs unless a note explicitly requires a swap.",
    "- Keep copy concise, local, specific, and conversion-focused.",
    "- Ensure the result is likely to pass QC for personalization, business specificity, and category fit.",
    "- If the selected theme is provided, set themeMode to that value.",
    "",
    "BUSINESS CONTEXT:",
    JSON.stringify(
      {
        id: prospect.id,
        businessName: prospect.businessName,
        category: prospect.category,
        city: prospect.city,
        state: prospect.state,
        phone: prospect.phone,
        website: prospect.currentWebsite,
        email: prospect.email,
        selectedTheme: selectedTheme || prospect.selectedTheme,
        aiThemeRecommendation: prospect.aiThemeRecommendation,
        scrapedData: prospect.scrapedData || null,
      },
      null,
      2
    ),
    "",
    "ADMIN NOTES TO APPLY:",
    adminNotes,
    "",
    "CURRENT QC NOTES:",
    currentQcNotes || "No stored QC notes yet.",
    "",
    "BLUEJAYS VISUAL QC GUIDE:",
    qcGuide,
    "",
    "CURRENT SITE DATA JSON:",
    JSON.stringify(siteData, null, 2),
  ].join("\n");
}

export async function runClaudeHandoff(
  input: ClaudeHandoffInput
): Promise<ClaudeHandoffResult> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured. Add ANTHROPIC_API_KEY in the environment.");
  }

  const prompt = buildClaudeHandoffPrompt(input);
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 6400,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as ClaudeMessageResponse;
  const responseText = extractTextFromClaudeResponse(data);
  const parsed = JSON.parse(extractFirstJsonObject(responseText)) as ClaudeHandoffResponseShape;
  const mergedSiteData = normalizeReturnedSiteData(
    input.siteData,
    parsed.siteData,
    input.selectedTheme
  );

  return {
    model: DEFAULT_ANTHROPIC_MODEL,
    prompt,
    responseText,
    summary: cleanString(parsed.summary, "Claude applied the requested revisions."),
    siteData: mergedSiteData,
  };
}
