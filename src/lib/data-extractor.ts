/**
 * DATA EXTRACTOR — Cascading failsafe chain for business data extraction.
 *
 * Level 1: Cheerio HTML scraper (traditional)
 * Level 2: Google Places Details API (phone, website, hours, photos)
 * Level 3: Web search fallback (search for business info)
 *
 * Every prospect MUST have a phone number before generation.
 */

import { scrapeWebsite, extractInstagramHandle } from "./scraper";
import type { ScrapedData } from "./types";
import { logCost, COST_RATES } from "./cost-logger";
import { canonicalizeCity, normalizeAddress } from "./address-normalizer";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface ExtractionResult {
  data: ScrapedData;
  methods: string[];
  quality: "high" | "medium" | "low";
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
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
    city: canonicalizeCity(city),
    services: [],
    testimonials: [],
    photos: [],
  };

  // ── LEVEL 1: Cheerio HTML scraper ──
  if (website) {
    try {
      console.log(`  Level 1: Cheerio scraping ${website}...`);
      const scraped = await scrapeWebsite(website);
      const canonicalScraped: Partial<ScrapedData> = {
        ...scraped,
        address: normalizeAddress(scraped.address),
        city: canonicalizeCity(scraped.city, scraped.address),
      };
      const hasUsefulData =
        canonicalScraped.phone ||
        canonicalScraped.services?.length ||
        canonicalScraped.about ||
        canonicalScraped.photos?.length;

      if (hasUsefulData) {
        data = mergeScrapedData(data, canonicalScraped);
        methods.push("cheerio");
        console.log(
          `  Level 1 success: phone=${!!data.phone}, city=${data.city || "n/a"}, services=${data.services.length}, photos=${data.photos.length}`
        );
      } else {
        console.log("  Level 1 returned no useful data");
      }
    } catch (err) {
      console.log(`  Level 1 failed: ${(err as Error).message}`);
    }
  }

  // ── LEVEL 2: Google Places Details ──
  if (GOOGLE_API_KEY) {
    try {
      console.log("  Level 2: Google Places Details...");
      const placeData = await fetchGooglePlaceDetails(businessName, city, placeId, prospectId);
      if (placeData) {
        data = mergeScrapedData(data, placeData);
        methods.push("google-places");
        console.log(
          `  Level 2 success: phone=${!!data.phone}, city=${data.city || "n/a"}, photos=${data.photos.length}`
        );
      }
    } catch (err) {
      console.log(`  Level 2 failed: ${(err as Error).message}`);
    }
  }

  // ── LEVEL 3: Web search fallback ──
  if (!data.phone || data.photos.length === 0) {
    try {
      console.log("  Level 3: Web search fallback...");
      const searchData = await searchForBusinessData(businessName, data.city || city);
      if (searchData) {
        data = mergeScrapedData(data, searchData);
        methods.push("web-search");
        console.log(`  Level 3 success: phone=${!!data.phone}`);
      }
    } catch (err) {
      console.log(`  Level 3 failed: ${(err as Error).message}`);
    }
  }

  // Final city safety pass so county-like values never escape extraction
  data.city = canonicalizeCity(data.city, data.address) || canonicalizeCity(city, data.address);

  // Extract Instagram handle from social links if available
  if (data.socialLinks?.instagram) {
    const handle = extractInstagramHandle(data.socialLinks.instagram);
    if (handle) {
      (data as unknown as Record<string, unknown>).__instagramHandle = handle;
    }
  }

  // Calculate quality score
  const quality = calculateQuality(data);

  return { data, methods, quality };
}

function extractCityFromGoogleAddressComponents(
  components: GoogleAddressComponent[] | undefined,
  formattedAddress?: string
): string | undefined {
  if (!components?.length) {
    return canonicalizeCity(undefined, formattedAddress);
  }

  const priorityTypes = [
    "locality",
    "postal_town",
    "sublocality_level_1",
    "administrative_area_level_3",
    "neighborhood",
  ];

  for (const type of priorityTypes) {
    const component = components.find((entry) => entry.types.includes(type));
    const candidate = canonicalizeCity(component?.long_name, formattedAddress);
    if (candidate) return candidate;
  }

  return canonicalizeCity(undefined, formattedAddress);
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
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${resolvedPlaceId}&fields=name,formatted_address,address_components,formatted_phone_number,website,opening_hours,photos,reviews,editorial_summary&key=${GOOGLE_API_KEY}`;
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

  if (result.name) {
    data.businessName = result.name;
  }

  if (result.formatted_address) {
    data.address = normalizeAddress(result.formatted_address);
    data.city = extractCityFromGoogleAddressComponents(result.address_components, result.formatted_address);
  }

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
        text: r.text.length > 200 ? `${r.text.slice(0, 200)}...` : r.text,
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
  const mergedAddress = normalizeAddress(incoming.address || existing.address);
  const mergedCity =
    canonicalizeCity(incoming.city, incoming.address) ||
    canonicalizeCity(existing.city, mergedAddress);

  return {
    businessName: incoming.businessName || existing.businessName,
    tagline: incoming.tagline || existing.tagline,
    email: incoming.email || existing.email,
    phone: incoming.phone || existing.phone,
    address: mergedAddress,
    city: mergedCity,
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
        ? [...new Set([...(existing.photos || []), ...incoming.photos])]
        : existing.photos,
    hours: incoming.hours || existing.hours,
    socialLinks: { ...existing.socialLinks, ...incoming.socialLinks },
    about: incoming.about || existing.about,
    brandColor: incoming.brandColor || existing.brandColor,
    brandColorSource: incoming.brandColorSource || existing.brandColorSource,
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
  if (data.city) score += 1;

  if (score >= 9) return "high";
  if (score >= 5) return "medium";
  return "low";
}
