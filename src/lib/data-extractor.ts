/**
 * DATA EXTRACTOR — Cascading failsafe chain for business data extraction.
 *
 * Level 1: Cheerio HTML scraper (traditional)
 * Level 2: Google Places Details API (phone, website, hours, photos)
 * Level 3: Web search fallback (search for business info)
 *
 * Every prospect MUST have a phone number before generation.
 */

import { scrapeWebsite } from "./scraper";
import type { ScrapedData } from "./types";
import { logCost, COST_RATES } from "./cost-logger";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface ExtractionResult {
  data: ScrapedData;
  methods: string[];
  quality: "high" | "medium" | "low";
}

/**
 * Extract business data using all available methods.
 * Cascades through multiple sources until we have enough data.
 */
export async function extractBusinessData(
  businessName: string,
  city: string,
  website?: string | null,
  placeId?: string | null,
  prospectId?: string
): Promise<ExtractionResult> {
  const methods: string[] = [];
  let data: ScrapedData = {
    businessName,
    services: [],
    testimonials: [],
    photos: [],
  };

  // ── LEVEL 1: Cheerio HTML scraper ──
  if (website) {
    try {
      console.log(`  Level 1: Cheerio scraping ${website}...`);
      const scraped = await scrapeWebsite(website);
      const hasUsefulData =
        scraped.phone ||
        scraped.services.length > 0 ||
        scraped.about ||
        scraped.photos.length > 0;

      if (hasUsefulData) {
        data = mergeScrapedData(data, scraped);
        methods.push("cheerio");
        console.log(
          `  Level 1 success: phone=${!!data.phone}, services=${data.services.length}, photos=${data.photos.length}`
        );
      } else {
        console.log(`  Level 1 returned no useful data`);
      }
    } catch (err) {
      console.log(`  Level 1 failed: ${(err as Error).message}`);
    }
  }

  // ── LEVEL 2: Google Places Details ──
  if (GOOGLE_API_KEY) {
    try {
      console.log(`  Level 2: Google Places Details...`);
      const placeData = await fetchGooglePlaceDetails(businessName, city, placeId, prospectId);
      if (placeData) {
        data = mergeScrapedData(data, placeData);
        methods.push("google-places");
        console.log(
          `  Level 2 success: phone=${!!data.phone}, photos=${data.photos.length}`
        );
      }
    } catch (err) {
      console.log(`  Level 2 failed: ${(err as Error).message}`);
    }
  }

  // ── LEVEL 3: Web search fallback ──
  if (!data.phone || data.photos.length === 0) {
    try {
      console.log(`  Level 3: Web search fallback...`);
      const searchData = await searchForBusinessData(businessName, city);
      if (searchData) {
        data = mergeScrapedData(data, searchData);
        methods.push("web-search");
        console.log(`  Level 3 success: phone=${!!data.phone}`);
      }
    } catch (err) {
      console.log(`  Level 3 failed: ${(err as Error).message}`);
    }
  }

  // Calculate quality score
  const quality = calculateQuality(data);

  return { data, methods, quality };
}

/**
 * Fetch business details from Google Places API.
 */
async function fetchGooglePlaceDetails(
  businessName: string,
  city: string,
  placeId?: string | null,
  prospectId?: string
): Promise<Partial<ScrapedData> | null> {
  if (!GOOGLE_API_KEY) {
    console.log("    No Google API key configured");
    return null;
  }

  // If we don't have a placeId, search for it
  let resolvedPlaceId = placeId;
  if (!resolvedPlaceId) {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      `${businessName} in ${city}`
    )}&key=${GOOGLE_API_KEY}`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
    const searchData = await searchRes.json();

    // Log cost for the text search
    await logCost({
      prospectId,
      service: "google_places_search",
      action: "scout",
      costUsd: COST_RATES.google_places_search,
      metadata: { query: `${businessName} in ${city}` },
    });

    if (searchData.status === "OK" && searchData.results?.[0]) {
      resolvedPlaceId = searchData.results[0].place_id;
    } else {
      return null;
    }
  }

  // Fetch full details
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${resolvedPlaceId}&fields=formatted_phone_number,website,opening_hours,photos,reviews,editorial_summary&key=${GOOGLE_API_KEY}`;
  const detailsRes = await fetch(detailsUrl, { signal: AbortSignal.timeout(10000) });
  const detailsData = await detailsRes.json();

  // Log cost for the details request
  await logCost({
    prospectId,
    service: "google_places_detail",
    action: "scout",
    costUsd: COST_RATES.google_places_detail,
    metadata: { placeId: resolvedPlaceId },
  });

  if (!detailsData.result) return null;

  const result = detailsData.result;
  const data: Partial<ScrapedData> = {};

  if (result.formatted_phone_number) {
    data.phone = result.formatted_phone_number;
  }

  if (result.opening_hours?.weekday_text) {
    data.hours = result.opening_hours.weekday_text.slice(0, 3).join(", ");
  }

  if (result.editorial_summary?.overview) {
    data.about = result.editorial_summary.overview;
  }

  // Get Google photo URLs (up to 5)
  if (result.photos?.length > 0) {
    data.photos = result.photos.slice(0, 5).map(
      (photo: { photo_reference: string }) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
    );
  }

  // Extract review testimonials
  if (result.reviews?.length > 0) {
    data.testimonials = result.reviews
      .filter((r: { rating: number }) => r.rating >= 4)
      .slice(0, 3)
      .map((r: { author_name: string; text: string }) => ({
        name: r.author_name,
        text: r.text.length > 200 ? r.text.slice(0, 200) + "..." : r.text,
      }));
  }

  return data;
}

/**
 * Search the web for business data as last resort.
 * Uses Google Custom Search or direct search patterns.
 */
async function searchForBusinessData(
  businessName: string,
  city: string
): Promise<Partial<ScrapedData> | null> {
  // Try to find the business on Yelp via direct URL pattern
  try {
    const yelpSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const citySlug = city
      .split(",")[0]
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const yelpUrl = `https://www.yelp.com/biz/${yelpSlug}-${citySlug}`;
    const response = await fetch(yelpUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });

    if (response.ok) {
      const html = await response.text();
      const data: Partial<ScrapedData> = {};

      // Extract phone from Yelp page
      const phoneMatch = html.match(
        /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
      );
      if (phoneMatch) {
        data.phone = phoneMatch[0];
      }

      return Object.keys(data).length > 0 ? data : null;
    }
  } catch {
    // Yelp search failed, continue
  }

  return null;
}

/**
 * Merge two ScrapedData objects, preferring non-empty values from the newer source.
 */
function mergeScrapedData(
  existing: ScrapedData,
  incoming: Partial<ScrapedData>
): ScrapedData {
  return {
    businessName: incoming.businessName || existing.businessName,
    tagline: incoming.tagline || existing.tagline,
    email: incoming.email || existing.email,
    phone: incoming.phone || existing.phone,
    address: incoming.address || existing.address,
    services:
      incoming.services && incoming.services.length > 0
        ? incoming.services
        : existing.services,
    testimonials:
      incoming.testimonials && incoming.testimonials.length > 0
        ? incoming.testimonials
        : existing.testimonials,
    photos:
      incoming.photos && incoming.photos.length > 0
        ? [...new Set([...existing.photos, ...incoming.photos])]
        : existing.photos,
    hours: incoming.hours || existing.hours,
    socialLinks: { ...existing.socialLinks, ...incoming.socialLinks },
    about: incoming.about || existing.about,
    brandColor: incoming.brandColor || existing.brandColor,
    logoUrl: incoming.logoUrl || existing.logoUrl,
  };
}

/**
 * Calculate data quality based on completeness.
 */
function calculateQuality(
  data: ScrapedData
): "high" | "medium" | "low" {
  let score = 0;
  if (data.phone) score += 3;
  if (data.about) score += 2;
  if (data.services.length > 0) score += 2;
  if (data.photos.length > 0) score += 2;
  if (data.testimonials.length > 0) score += 1;
  if (data.hours) score += 1;
  if (data.email) score += 1;

  if (score >= 8) return "high";
  if (score >= 4) return "medium";
  return "low";
}
