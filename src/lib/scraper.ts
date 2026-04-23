import * as cheerio from "cheerio";
import type { ScrapedData, ServiceItem, Testimonial } from "./types";
import { canonicalizeCity, normalizeAddress } from "./address-normalizer";

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  console.log(`  🌐 Scraping ${url}...`);

  try {
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

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, nav, footer noise
    $("script, style, noscript, iframe").remove();

    const address = extractAddress($, html);
    const logoUrl = extractLogo($, url);
    const branding = await extractBranding($, html, logoUrl);
    const data: ScrapedData = {
      businessName: extractBusinessName($),
      tagline: extractTagline($),
      email: extractEmail($, html),
      phone: extractPhone($, html),
      address,
      city: canonicalizeCity(undefined, address),
      services: extractServices($),
      testimonials: extractTestimonials($),
      photos: extractPhotos($, url),
      about: extractAbout($),
      hours: extractHours($, html),
      socialLinks: extractSocialLinks($),
      brandColor: branding.brandColor,
      brandColorSource: branding.brandColorSource,
      logoUrl,
    };

    console.log(
      `  ✅ Scraped: ${data.businessName || "Unknown"} — ${data.services.length} services, ${data.testimonials.length} testimonials, ${data.photos.length} photos`
    );

    return data;
  } catch (error) {
    console.log(`  ⚠️ Scrape failed: ${(error as Error).message}`);
    return {
      businessName: "",
      services: [],
      testimonials: [],
      photos: [],
    };
  }
}

function extractBusinessName($: cheerio.CheerioAPI): string {
  // Try meta tags first
  const ogTitle = $('meta[property="og:site_name"]').attr("content");
  if (ogTitle) return ogTitle.trim();

  // Try title tag, remove common suffixes
  const title = $("title").text().trim();
  if (title) {
    return title
      .split(/[|\-–—]/)[0]
      .trim();
  }

  // Try h1
  const h1 = $("h1").first().text().trim();
  if (h1 && h1.length < 60) return h1;

  return "";
}

function extractTagline($: cheerio.CheerioAPI): string | undefined {
  const ogDesc = $('meta[property="og:description"]').attr("content");
  if (ogDesc && ogDesc.length < 200) return ogDesc.trim();

  const metaDesc = $('meta[name="description"]').attr("content");
  if (metaDesc && metaDesc.length < 200) return metaDesc.trim();

  // Look for subtitle near h1
  const subtitle = $("h1")
    .first()
    .next("p, h2, .subtitle, .tagline")
    .first()
    .text()
    .trim();
  if (subtitle && subtitle.length > 10 && subtitle.length < 200)
    return subtitle;

  return undefined;
}

function extractEmail($: cheerio.CheerioAPI, html: string): string | undefined {
  // Try mailto: links first (most reliable)
  const mailtoLink = $('a[href^="mailto:"]').first().attr("href");
  if (mailtoLink) {
    const email = mailtoLink.replace("mailto:", "").split("?")[0].trim();
    if (isValidEmail(email)) return email;
  }

  // Look for email in common contact elements
  const contactSelectors = [
    '[class*="contact"] a[href*="@"]',
    '[class*="email"]',
    '[id*="email"]',
    'footer a[href*="@"]',
  ];
  for (const selector of contactSelectors) {
    const el = $(selector).first();
    const href = el.attr("href") || "";
    const text = el.text().trim();
    if (href.includes("mailto:")) {
      const email = href.replace("mailto:", "").split("?")[0].trim();
      if (isValidEmail(email)) return email;
    }
    if (isValidEmail(text)) return text;
  }

  // Regex for email addresses in the HTML (last resort — can find spam traps)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = html.match(emailRegex) || [];
  // Filter out common false positives
  const filtered = matches.filter(e =>
    !e.includes("example.com") &&
    !e.includes("sentry") &&
    !e.includes("webpack") &&
    !e.includes("wix") &&
    !e.includes("googleapis") &&
    !e.includes("schema.org") &&
    !e.endsWith(".png") &&
    !e.endsWith(".jpg") &&
    e.length < 60
  );
  if (filtered.length > 0) return filtered[0];

  return undefined;
}

function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) && email.length < 60;
}

function extractPhone($: cheerio.CheerioAPI, html: string): string | undefined {
  // Try tel: links
  const telLink = $('a[href^="tel:"]').first().attr("href");
  if (telLink) return telLink.replace("tel:", "").trim();

  // Regex for phone numbers in the HTML
  const phoneRegex =
    /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
  const match = html.match(phoneRegex);
  return match ? match[0] : undefined;
}

function extractAddress(
  $: cheerio.CheerioAPI,
  html: string
): string | undefined {
  // Try schema.org structured data
  const streetAddress = $('[itemprop="streetAddress"]').text().trim();
  if (streetAddress) {
    const locality = $('[itemprop="addressLocality"]').text().trim();
    const region = $('[itemprop="addressRegion"]').text().trim();
    return normalizeAddress([streetAddress, locality, region].filter(Boolean).join(", "));
  }

  // Look for address-like elements
  const addressEl = $("address, .address, [class*='address']")
    .first()
    .text()
    .trim();
  if (addressEl && addressEl.length < 200) return normalizeAddress(addressEl);

  // Regex for street addresses
  const addrRegex =
    /\d{1,5}\s[\w\s]{2,30}(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Ct|Court|Pl|Place)\.?/i;
  const match = html.match(addrRegex);
  return match ? normalizeAddress(match[0]) : undefined;
}

function extractServices($: cheerio.CheerioAPI): ServiceItem[] {
  const services: ServiceItem[] = [];
  const seen = new Set<string>();

  // Look for service sections — broad selectors to catch most site structures
  const serviceSelectors = [
    '[class*="service"] li',
    '[class*="service"] .card',
    '[class*="service"] article',
    '[class*="service"] h3',
    '[class*="service"] h4',
    '[id*="service"] li',
    '[id*="service"] h3',
    '[id*="service"] h4',
    ".services li",
    ".services h3",
    '[class*="menu"] .item',
    '[class*="pricing"] .plan',
    '[class*="offering"] li',
    '[class*="offering"] h3',
    '[class*="what-we"] li',
    '[class*="what-we"] h3',
    '[class*="solution"] h3',
    '[class*="feature"] h3',
    '[class*="feature"] h4',
    '[class*="specialt"] li',
    '[class*="specialt"] h3',
    '[class*="practice"] li',
    '[class*="practice"] h3',
  ];

  for (const selector of serviceSelectors) {
    $(selector).each((_, el) => {
      const name = $(el).find("h3, h4, strong, .title").first().text().trim() ||
        $(el).text().trim().split("\n")[0].trim();
      if (!name || name.length > 80 || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());

      const desc = $(el).find("p, .description").first().text().trim();
      const price = $(el)
        .find('[class*="price"], .price')
        .first()
        .text()
        .trim();

      services.push({
        name,
        description: desc || undefined,
        price: price || undefined,
      });
    });

    if (services.length >= 4) break;
  }

  return services.slice(0, 12);
}

function extractTestimonials($: cheerio.CheerioAPI): Testimonial[] {
  const testimonials: Testimonial[] = [];

  const reviewSelectors = [
    '[class*="testimonial"]',
    '[class*="review"]',
    '[class*="quote"]',
    ".testimonial",
    ".review",
    "blockquote",
  ];

  for (const selector of reviewSelectors) {
    $(selector).each((_, el) => {
      const text =
        $(el).find("p, .text, .content, .quote-text").first().text().trim() ||
        $(el).text().trim();
      const name =
        $(el).find(".name, .author, cite, strong").first().text().trim() ||
        "Happy Customer";

      if (text && text.length > 20 && text.length < 500) {
        testimonials.push({ name, text });
      }
    });

    if (testimonials.length >= 3) break;
  }

  return testimonials.slice(0, 5);
}

function extractPhotos($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const photos: string[] = [];
  const seen = new Set<string>();

  // Get meaningful images (not icons/logos)
  $("img").each((_, el) => {
    const rawSrc = $(el).attr("src") || $(el).attr("data-src");
    const src = rawSrc?.trim();
    if (!src) return;

    let fullUrl = "";
    try {
      fullUrl = src.startsWith("http") ? src : new URL(src, baseUrl).href;
      fullUrl = fullUrl.trim();
    } catch {
      return;
    }

    if (!fullUrl) return;
    if (seen.has(fullUrl)) return;
    seen.add(fullUrl);

    // Skip tiny images (likely icons) and SVGs
    const width = parseInt($(el).attr("width") || "0");
    const height = parseInt($(el).attr("height") || "0");
    if ((width > 0 && width < 50) || (height > 0 && height < 50)) return;
    if (fullUrl.toLowerCase().endsWith(".svg") || fullUrl.toLowerCase().includes("icon")) return;
    if (fullUrl.toLowerCase().includes("logo") && photos.length > 0) return;

    photos.push(fullUrl);
  });

  return photos.slice(0, 20);
}

function extractAbout($: cheerio.CheerioAPI): string | undefined {
  const aboutSelectors = [
    '[id*="about"] p',
    '[class*="about"] p',
    "#about p",
    ".about p",
    '[class*="story"] p',
    '[class*="bio"] p',
    '[class*="who-we"] p',
    '[class*="mission"] p',
    '[class*="overview"] p',
    '[class*="intro"] p',
    '[class*="welcome"] p',
    '[class*="description"] p',
    'section p', // fallback: first substantial paragraph on the page
  ];

  for (const selector of aboutSelectors) {
    const text = $(selector).first().text().trim();
    if (text && text.length > 50 && text.length < 1000) return text;
  }

  return undefined;
}

function extractHours(
  $: cheerio.CheerioAPI,
  html: string
): string | undefined {
  const hoursEl = $('[class*="hours"], [class*="schedule"], [itemprop="openingHours"]')
    .first()
    .text()
    .trim();
  if (hoursEl && hoursEl.length < 200) return hoursEl;

  // Look for common hour patterns
  const hourRegex =
    /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[\s-]+(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)?[a-z]*\s*:?\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*[-–]\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)/i;
  const match = html.match(hourRegex);
  return match ? match[0] : undefined;
}

async function extractBranding(
  $: cheerio.CheerioAPI,
  html: string,
  logoUrl?: string
): Promise<Pick<ScrapedData, "brandColor" | "brandColorSource">> {
  const officialSiteColor = extractOfficialSiteBrandColor($, html);
  if (officialSiteColor) {
    return {
      brandColor: officialSiteColor,
      brandColorSource: "official-site",
    };
  }

  const logoColor = await extractLogoBrandColor(logoUrl);
  if (logoColor) {
    return {
      brandColor: logoColor,
      brandColorSource: "logo",
    };
  }

  return {};
}

function extractOfficialSiteBrandColor($: cheerio.CheerioAPI, html: string): string | undefined {
  const weightedCandidates: Array<{ color: string; weight: number }> = [];

  const pushCandidate = (value: string | undefined, weight: number) => {
    const normalized = normalizeBrandColor(value);
    if (!normalized) return;
    weightedCandidates.push({ color: normalized, weight });
  };

  pushCandidate($('meta[name="theme-color"]').attr("content"), 10);
  pushCandidate($('meta[name="msapplication-TileColor"]').attr("content"), 9);
  pushCandidate($('meta[property="og:site_name"]').attr("content"), 0);

  const cssPatterns = [
    { regex: /--(?:primary|accent|brand|main|theme)(?:-color)?[^:]*:\s*([^;]+)/gi, weight: 8 },
    { regex: /--(?:color-primary|primary-color|brand-color|accent-color|theme-color)[^:]*:\s*([^;]+)/gi, weight: 8 },
    { regex: /(?:background(?:-color)?|color|fill|stroke)\s*:\s*([^;}{]+)/gi, weight: 2 },
  ];

  for (const { regex, weight } of cssPatterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      pushCandidate(match[1], weight);
    }
  }

  $("header, nav, .navbar, .menu, .btn, button, a, [class*='hero'], [class*='cta'], [class*='primary']").each((_, el) => {
    const style = $(el).attr("style");
    if (!style) return;
    const styleMatches = style.match(/(?:background(?:-color)?|color|fill|stroke)\s*:\s*([^;]+)/gi) || [];
    for (const styleMatch of styleMatches) {
      const [, value] = styleMatch.split(":");
      pushCandidate(value, 4);
    }
  });

  if (weightedCandidates.length === 0) return undefined;

  const scoreByColor = new Map<string, number>();
  for (const candidate of weightedCandidates) {
    scoreByColor.set(candidate.color, (scoreByColor.get(candidate.color) || 0) + candidate.weight);
  }

  return [...scoreByColor.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color)
    .find((color) => isUsableBrandColor(color));
}

async function extractLogoBrandColor(logoUrl?: string): Promise<string | undefined> {
  if (!logoUrl) return undefined;

  try {
    const response = await fetch(logoUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return undefined;

    const contentType = response.headers.get("content-type")?.toLowerCase() || "";
    const looksSvg = contentType.includes("svg") || logoUrl.toLowerCase().endsWith(".svg");
    if (!looksSvg) return undefined;

    const svg = await response.text();
    const matches = svg.match(/(?:fill|stroke)=["']([^"']+)["']/gi) || [];
    for (const match of matches) {
      const value = match.split("=")[1]?.replace(/["']/g, "");
      const normalized = normalizeBrandColor(value);
      if (normalized && isUsableBrandColor(normalized)) {
        return normalized;
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function normalizeBrandColor(color: string | undefined): string | undefined {
  if (!color) return undefined;

  const trimmed = color.trim().toLowerCase();
  const hexMatch = trimmed.match(/#([0-9a-f]{3}|[0-9a-f]{6})\b/i);
  if (hexMatch) {
    const rawHex = hexMatch[1];
    const normalizedHex = rawHex.length === 3
      ? rawHex.split("").map((char) => `${char}${char}`).join("")
      : rawHex;
    return `#${normalizedHex}`;
  }

  const rgbMatch = trimmed.match(/rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch.slice(1, 4).map((value) => Math.max(0, Math.min(255, Number(value))));
    return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  }

  return undefined;
}

function isUsableBrandColor(color: string): boolean {
  const normalized = normalizeBrandColor(color);
  if (!normalized) return false;

  const hex = normalized.slice(1);
  if (hex === "ffffff" || hex === "000000") return false;
  if (/^([0-9a-f]{2})\1\1$/i.test(hex)) return false;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = ((max + min) / 2) / 255;
  const saturation = max === min ? 0 : (max - min) / max;

  if (lightness < 0.12 || lightness > 0.82) return false;
  if (saturation < 0.18) return false;
  if (r > 235 && g > 235 && b < 80) return false;

  return true;
}

function extractLogo($: cheerio.CheerioAPI, baseUrl: string): string | undefined {
  // Try common logo patterns
  const logoSelectors = [
    'img[class*="logo"]',
    'img[id*="logo"]',
    'img[alt*="logo" i]',
    '.logo img',
    '#logo img',
    'header img:first-of-type',
    '.navbar img:first-of-type',
    'nav img:first-of-type',
  ];

  for (const selector of logoSelectors) {
    const src = $(selector).first().attr("src") || $(selector).first().attr("data-src");
    if (src) {
      return src.startsWith("http") ? src : new URL(src, baseUrl).href;
    }
  }

  // Try link icon/apple-touch-icon as fallback
  const appleIcon = $('link[rel="apple-touch-icon"]').attr("href");
  if (appleIcon) return appleIcon.startsWith("http") ? appleIcon : new URL(appleIcon, baseUrl).href;

  return undefined;
}

function extractSocialLinks(
  $: cheerio.CheerioAPI
): Record<string, string> | undefined {
  const links: Record<string, string> = {};
  const platforms = ["facebook", "instagram", "twitter", "linkedin", "yelp", "youtube", "tiktok"];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const platform of platforms) {
      if (href.includes(`${platform}.com`) && !links[platform]) {
        links[platform] = href;
      }
    }
  });

  return Object.keys(links).length > 0 ? links : undefined;
}

/**
 * Extract an Instagram handle from a URL.
 * Handles formats like:
 *   https://www.instagram.com/username/
 *   https://instagram.com/username
 *   instagram.com/username?hl=en
 */
export function extractInstagramHandle(url: string): string | null {
  const match = url.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
  if (match && match[1] && !['explore', 'accounts', 'p', 'reel', 'stories', 'direct'].includes(match[1])) {
    return `@${match[1]}`;
  }
  return null;
}
