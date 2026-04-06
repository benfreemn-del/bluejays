import * as cheerio from "cheerio";
import type { ScrapedData, ServiceItem, Testimonial } from "./types";

const MAX_PAGES = 15;
const TIMEOUT_MS = 10000;

interface PageContent {
  url: string;
  title: string;
  text: string;
  html: string;
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function getInternalLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const links = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const resolved = new URL(href, baseUrl);
      // Only same-domain, no anchors, no files
      if (resolved.hostname !== base.hostname) return;
      if (resolved.pathname.match(/\.(pdf|jpg|jpeg|png|gif|svg|css|js|zip|doc)$/i)) return;
      resolved.hash = "";
      links.add(resolved.href);
    } catch {
      // Invalid URL, skip
    }
  });

  return Array.from(links);
}

export async function deepScrapeWebsite(url: string): Promise<{
  scrapedData: ScrapedData;
  rawPages: PageContent[];
  pagesScraped: number;
}> {
  console.log(`  🕷️ Deep scraping ${url} (up to ${MAX_PAGES} pages)...`);

  const visited = new Set<string>();
  const toVisit = [url];
  const pages: PageContent[] = [];

  // BFS crawl
  while (toVisit.length > 0 && visited.size < MAX_PAGES) {
    const currentUrl = toVisit.shift()!;
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    const html = await fetchPage(currentUrl);
    if (!html) continue;

    const $ = cheerio.load(html);
    $("script, style, noscript, iframe").remove();

    const title = $("title").text().trim();
    const text = $("body").text().replace(/\s+/g, " ").trim();

    pages.push({ url: currentUrl, title, text, html });
    console.log(`    Page ${pages.length}: ${title || currentUrl}`);

    // Discover new links
    const links = getInternalLinks($, currentUrl);
    for (const link of links) {
      if (!visited.has(link) && !toVisit.includes(link)) {
        toVisit.push(link);
      }
    }
  }

  console.log(`  ✅ Scraped ${pages.length} pages from ${url}`);

  // Extract data from all pages combined
  const scrapedData = extractFromAllPages(pages, url);

  return {
    scrapedData,
    rawPages: pages,
    pagesScraped: pages.length,
  };
}

function extractFromAllPages(pages: PageContent[], baseUrl: string): ScrapedData {
  const allServices: ServiceItem[] = [];
  const allTestimonials: Testimonial[] = [];
  const allPhotos: string[] = [];
  let businessName = "";
  let tagline = "";
  let phone = "";
  let address = "";
  let about = "";
  let hours = "";
  const socialLinks: Record<string, string> = {};
  const seenServices = new Set<string>();
  const seenTestimonials = new Set<string>();

  for (const page of pages) {
    const $ = cheerio.load(page.html);

    // Business name (from first page)
    if (!businessName) {
      const ogName = $('meta[property="og:site_name"]').attr("content");
      businessName = ogName || page.title.split(/[|\-–—]/)[0].trim();
    }

    // Tagline
    if (!tagline) {
      const desc = $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content");
      if (desc && desc.length < 200) tagline = desc.trim();
    }

    // Phone
    if (!phone) {
      const telLink = $('a[href^="tel:"]').first().attr("href");
      if (telLink) phone = telLink.replace("tel:", "").trim();
      else {
        const match = page.text.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
        if (match) phone = match[0];
      }
    }

    // Address
    if (!address) {
      const streetAddr = $('[itemprop="streetAddress"]').text().trim();
      if (streetAddr) {
        const locality = $('[itemprop="addressLocality"]').text().trim();
        const region = $('[itemprop="addressRegion"]').text().trim();
        address = [streetAddr, locality, region].filter(Boolean).join(", ");
      }
    }

    // About (look for about-like content on any page)
    if (!about || page.url.toLowerCase().includes("about")) {
      const aboutSelectors = [
        '[id*="about"] p', '[class*="about"] p', '#about p',
        '.about p', '[class*="story"] p', '[class*="bio"] p',
        '[class*="mission"] p',
      ];
      for (const sel of aboutSelectors) {
        const text = $(sel).first().text().trim();
        if (text && text.length > 50 && text.length < 1000) {
          about = text;
          break;
        }
      }
    }

    // Services (from any page, especially services/menu pages)
    const serviceSelectors = [
      '[class*="service"] h3', '[class*="service"] h4',
      '[id*="service"] h3', '[class*="menu"] .item',
      '[class*="offering"] h3', '[class*="solution"] h3',
    ];
    for (const sel of serviceSelectors) {
      $(sel).each((_, el) => {
        const name = $(el).text().trim();
        if (name && name.length > 2 && name.length < 80 && !seenServices.has(name.toLowerCase())) {
          seenServices.add(name.toLowerCase());
          const desc = $(el).next("p").text().trim();
          const price = $(el).parent().find('[class*="price"]').text().trim();
          allServices.push({ name, description: desc || undefined, price: price || undefined });
        }
      });
    }

    // Testimonials / reviews
    const reviewSelectors = [
      '[class*="testimonial"]', '[class*="review"]', 'blockquote',
    ];
    for (const sel of reviewSelectors) {
      $(sel).each((_, el) => {
        const text = $(el).find("p, .text, .content").first().text().trim() || $(el).text().trim();
        const name = $(el).find(".name, .author, cite, strong").first().text().trim() || "Customer";
        if (text && text.length > 20 && text.length < 500 && !seenTestimonials.has(text.slice(0, 50))) {
          seenTestimonials.add(text.slice(0, 50));
          allTestimonials.push({ name, text });
        }
      });
    }

    // Photos
    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (!src) return;
      const fullUrl = src.startsWith("http") ? src : new URL(src, baseUrl).href;
      const width = parseInt($(el).attr("width") || "0");
      if ((width > 0 && width < 50) || fullUrl.endsWith(".svg") || fullUrl.includes("icon")) return;
      if (!allPhotos.includes(fullUrl)) allPhotos.push(fullUrl);
    });

    // Hours
    if (!hours) {
      const hoursEl = $('[class*="hours"], [itemprop="openingHours"]').first().text().trim();
      if (hoursEl && hoursEl.length < 200) hours = hoursEl;
    }

    // Social links
    const platforms = ["facebook", "instagram", "twitter", "linkedin", "yelp", "youtube", "tiktok"];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      for (const p of platforms) {
        if (href.includes(`${p}.com`) && !socialLinks[p]) socialLinks[p] = href;
      }
    });
  }

  return {
    businessName,
    tagline: tagline || undefined,
    phone: phone || undefined,
    address: address || undefined,
    services: allServices.slice(0, 15),
    testimonials: allTestimonials.slice(0, 8),
    photos: allPhotos.slice(0, 30),
    hours: hours || undefined,
    socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
    about: about || undefined,
  };
}
