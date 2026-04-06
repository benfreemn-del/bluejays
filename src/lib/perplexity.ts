import type { Category, ScrapedData } from "./types";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

interface PerplexityResponse {
  choices: { message: { content: string } }[];
}

async function queryPerplexity(prompt: string): Promise<string> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY not set");
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data: PerplexityResponse = await response.json();
  return data.choices[0].message.content;
}

export async function researchBusiness(
  businessName: string,
  city: string,
  category: Category
): Promise<ScrapedData> {
  console.log(`  🔎 Researching "${businessName}" via Perplexity...`);

  const prompt = `Research the business "${businessName}" in ${city}. It's a ${category.replace("-", " ")} business. Find and return the following information in a structured way:

1. Business name (official)
2. A short tagline or description (1 sentence)
3. Phone number
4. Full address
5. Services they offer (list each with a brief description and price if available)
6. Customer testimonials or notable reviews (3 if possible, with reviewer name and quote)
7. Business hours
8. Social media links (Instagram, Facebook, etc.)
9. A brief "about" paragraph (2-3 sentences)
10. Their Instagram handle if they have one

Format each section clearly with labels.`;

  const result = await queryPerplexity(prompt);
  return parsePerplexityResult(result, businessName);
}

export async function findBusinesses(
  city: string,
  category: Category,
  limit: number = 10
): Promise<
  {
    name: string;
    address: string;
    phone?: string;
    website?: string;
    rating?: string;
    instagram?: string;
  }[]
> {
  console.log(
    `  🔎 Finding ${category} businesses in ${city} via Perplexity...`
  );

  const prompt = `Find ${limit} ${category.replace("-", " ")} businesses in ${city} that either have no website, a poor quality website, or an outdated website. For each business, provide:

1. Business name
2. Address
3. Phone number
4. Current website (or "none")
5. Google rating and review count if available
6. Instagram handle if they have one

Focus on established businesses that appear to be doing well (good reviews, been around for years) but have weak web presence. List them numbered.`;

  const result = await queryPerplexity(prompt);
  return parseBusinessList(result);
}

export async function generatePersonalizedPitch(
  businessName: string,
  ownerName: string | undefined,
  category: Category,
  city: string,
  previewUrl: string
): Promise<{ emailSubject: string; emailBody: string; instagramDm: string }> {
  console.log(`  🔎 Generating personalized pitch for "${businessName}"...`);

  const name = ownerName?.split(" ")[0] || businessName;

  const prompt = `Write outreach copy for a web design agency called BlueJays pitching to "${businessName}" (a ${category.replace("-", " ")} business in ${city}). The owner/contact name is "${name}".

We already built them a free preview website at: ${previewUrl}

Write THREE things:

1. EMAIL - Subject line and body. Casual, confident tone. Don't mention price. Include the preview link. Make it personal to their specific industry. Keep it short (under 150 words).

2. INSTAGRAM DM - A short, friendly DM (under 50 words) that teases the free website and includes the preview link. Should feel natural, not salesy.

3. FOLLOW-UP DM - A second shorter DM (under 30 words) if they don't respond after 3 days.

Format clearly with "EMAIL SUBJECT:", "EMAIL BODY:", "INSTAGRAM DM:", "FOLLOW-UP DM:" labels.`;

  const result = await queryPerplexity(prompt);
  return parsePitchResult(result, businessName, name, previewUrl);
}

export function isPerplexityAvailable(): boolean {
  return !!PERPLEXITY_API_KEY;
}

// --- Parsers (extract structured data from Perplexity text responses) ---

function parsePerplexityResult(
  text: string,
  fallbackName: string
): ScrapedData {
  // Basic parsing — Perplexity returns natural language, so we extract what we can
  const lines = text.split("\n").filter((l) => l.trim());

  const phoneMatch = text.match(
    /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
  );
  const instagramMatch = text.match(
    /@[\w.]+|instagram\.com\/([\w.]+)/i
  );

  return {
    businessName: fallbackName,
    tagline: extractAfterLabel(text, "tagline", "description") || undefined,
    phone: phoneMatch?.[0] || undefined,
    address: extractAfterLabel(text, "address") || undefined,
    services: extractListItems(text, "services", "service"),
    testimonials: extractTestimonialsFromText(text),
    photos: [],
    hours: extractAfterLabel(text, "hours", "business hours") || undefined,
    socialLinks: instagramMatch
      ? { instagram: `https://instagram.com/${instagramMatch[1] || instagramMatch[0].replace("@", "")}` }
      : undefined,
    about: extractAfterLabel(text, "about") || undefined,
  };
}

function parseBusinessList(
  text: string
): {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: string;
  instagram?: string;
}[] {
  const businesses: {
    name: string;
    address: string;
    phone?: string;
    website?: string;
    rating?: string;
    instagram?: string;
  }[] = [];

  // Split by numbered items
  const items = text.split(/\n\d+[\.\)]\s*/);
  for (const item of items) {
    if (!item.trim()) continue;
    const lines = item.split("\n").filter((l) => l.trim());
    if (lines.length === 0) continue;

    const name = lines[0].replace(/^\*+|\*+$/g, "").trim();
    if (!name || name.length < 3) continue;

    const phoneMatch = item.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    const instagramMatch = item.match(/@[\w.]+/);

    businesses.push({
      name,
      address: extractLineContaining(lines, "address", "addr") || "",
      phone: phoneMatch?.[0],
      website: extractLineContaining(lines, "website", "site", "http") || undefined,
      rating: extractLineContaining(lines, "rating", "star", "review") || undefined,
      instagram: instagramMatch?.[0],
    });
  }

  return businesses;
}

function parsePitchResult(
  text: string,
  businessName: string,
  name: string,
  previewUrl: string
): { emailSubject: string; emailBody: string; instagramDm: string } {
  const emailSubject =
    extractAfterLabel(text, "email subject") ||
    `${businessName} — I built you a new website`;

  const emailBody =
    extractBetweenLabels(text, "email body", "instagram dm") ||
    `Hi ${name}, I built a free website for ${businessName}. Check it out: ${previewUrl}`;

  const instagramDm =
    extractAfterLabel(text, "instagram dm") ||
    `Hey ${name}! I came across ${businessName} and loved what you do. I actually built you a free website — check it out: ${previewUrl}`;

  return { emailSubject, emailBody, instagramDm };
}

// --- Helper extractors ---

function extractAfterLabel(text: string, ...labels: string[]): string | null {
  for (const label of labels) {
    const regex = new RegExp(
      `${label}[:\\s]*(.+?)(?:\\n|$)`,
      "im"
    );
    const match = text.match(regex);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return null;
}

function extractBetweenLabels(
  text: string,
  startLabel: string,
  endLabel: string
): string | null {
  const startRegex = new RegExp(`${startLabel}[:\\s]*`, "im");
  const endRegex = new RegExp(`${endLabel}[:\\s]*`, "im");
  const startMatch = startRegex.exec(text);
  const endMatch = endRegex.exec(text);
  if (startMatch && endMatch && endMatch.index > startMatch.index) {
    return text
      .slice(startMatch.index + startMatch[0].length, endMatch.index)
      .trim();
  }
  return null;
}

function extractListItems(
  text: string,
  ...sectionLabels: string[]
): { name: string; description?: string }[] {
  const items: { name: string; description?: string }[] = [];
  for (const label of sectionLabels) {
    const regex = new RegExp(
      `${label}[:\\s]*\\n([\\s\\S]*?)(?:\\n\\n|$)`,
      "im"
    );
    const match = text.match(regex);
    if (match) {
      const lines = match[1].split("\n").filter((l) => l.trim());
      for (const line of lines) {
        const cleaned = line.replace(/^[\s\-\*\d.]+/, "").trim();
        if (cleaned.length > 3) {
          const parts = cleaned.split(/[:\-–—]/, 2);
          items.push({
            name: parts[0].trim(),
            description: parts[1]?.trim() || undefined,
          });
        }
      }
      if (items.length > 0) break;
    }
  }
  return items;
}

function extractTestimonialsFromText(
  text: string
): { name: string; text: string }[] {
  const testimonials: { name: string; text: string }[] = [];
  const quoteRegex = /"([^"]{20,200})"\s*[-–—]\s*(\w[\w\s.]+)/g;
  let match;
  while ((match = quoteRegex.exec(text)) !== null) {
    testimonials.push({ name: match[2].trim(), text: match[1].trim() });
  }
  return testimonials.slice(0, 5);
}

function extractLineContaining(
  lines: string[],
  ...keywords: string[]
): string | null {
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (keywords.some((kw) => lower.includes(kw))) {
      return line.replace(/^[\s\-\*]+/, "").trim();
    }
  }
  return null;
}
