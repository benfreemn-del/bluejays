import * as cheerio from "cheerio";
import type { ScrapedData, ServiceItem, Testimonial } from "./types";

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

    const data: ScrapedData = {
      businessName: extractBusinessName($),
      tagline: extractTagline($),
      phone: extractPhone($, html),
      address: extractAddress($, html),
      services: extractServices($),
      testimonials: extractTestimonials($),
      photos: extractPhotos($, url),
      about: extractAbout($),
      hours: extractHours($, html),
      socialLinks: extractSocialLinks($),
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
    return [streetAddress, locality, region].filter(Boolean).join(", ");
  }

  // Look for address-like elements
  const addressEl = $("address, .address, [class*='address']")
    .first()
    .text()
    .trim();
  if (addressEl && addressEl.length < 200) return addressEl;

  // Regex for street addresses
  const addrRegex =
    /\d{1,5}\s[\w\s]{2,30}(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Ct|Court|Pl|Place)\.?/i;
  const match = html.match(addrRegex);
  return match ? match[0] : undefined;
}

function extractServices($: cheerio.CheerioAPI): ServiceItem[] {
  const services: ServiceItem[] = [];
  const seen = new Set<string>();

  // Look for service sections
  const serviceSelectors = [
    '[class*="service"] li',
    '[class*="service"] .card',
    '[class*="service"] article',
    '[id*="service"] li',
    '[id*="service"] h3',
    ".services li",
    ".services h3",
    '[class*="menu"] .item',
    '[class*="pricing"] .plan',
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
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (!src) return;

    const fullUrl = src.startsWith("http") ? src : new URL(src, baseUrl).href;
    if (seen.has(fullUrl)) return;
    seen.add(fullUrl);

    // Skip tiny images (likely icons) and SVGs
    const width = parseInt($(el).attr("width") || "0");
    const height = parseInt($(el).attr("height") || "0");
    if ((width > 0 && width < 50) || (height > 0 && height < 50)) return;
    if (fullUrl.endsWith(".svg") || fullUrl.includes("icon")) return;
    if (fullUrl.includes("logo") && photos.length > 0) return;

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
