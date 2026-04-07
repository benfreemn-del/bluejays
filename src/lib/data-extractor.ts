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
  placeId?: string | null
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
      console.log(`  📋 Level 1: Cheerio scraping ${website}...`);
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
          `  ✅ Level 1 success: phone=${!!data.phone}, services=${data.services.length}, photos=${data.photos.length}`
        );
      } else {
        console.log(`  ⚠️ Level 1: Cheerio returned no useful data (site may use JS rendering)`);
      }
    } catch (err) {
      console.log(`  ⚠️ Level 1 failed: ${(err as Error).message}`);
    }
  }

  // ── LEVEL 2: Google Places Details API ──
  if (!data.phone || data.services.length === 0 || data.photos.length === 0) {
    try {
      console.log(`  📋 Level 2: Google Places Details...`);
      const placeData = await fetchGooglePlaceDetails(businessName, city, placeId);
      if (placeData) {
        data = mergeScrapedData(data, placeData);
        methods.push("google-places");
        console.log(
          `  ✅ Level 2 success: phone=${!!data.phone}, photos=${data.photos.length}`
        );
      }
    } catch (err) {
      console.log(`  ⚠️ Level 2 failed: ${(err as Error).message}`);
    }
  }

  // ── LEVEL 3: Web search fallback ──
  if (!data.phone || data.services.length === 0) {
    try {
      console.log(`  📋 Level 3: Web search fallback...`);
      const searchData = await searchForBusinessData(businessName, city);
      if (searchData) {
        data = mergeScrapedData(data, searchData);
        methods.push("web-search");
        console.log(
          `  ✅ Level 3 success: phone=${!!data.phone}, services=${data.services.length}`
        );
      }
    } catch (err) {
      console.log(`  ⚠️ Level 3 failed: ${(err as Error).message}`);
    }
  }

  // Ensure business name is set
  data.businessName = data.businessName || businessName;

  // Calculate quality
  const quality = calculateQuality(data);
  console.log(
    `  📊 Extraction complete: quality=${quality}, methods=[${methods.join(", ")}], phone=${!!data.phone}, services=${data.services.length}, photos=${data.photos.length}`
  );

  return { data, methods, quality };
}

/**
 * Fetch business details from Google Places API.
 */
async function fetchGooglePlaceDetails(
  businessName: string,
  city: string,
  placeId?: string | null
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

    // Try Google search for the business phone number
    const searchQuery = encodeURIComponent(
      `"${businessName}" ${city} phone number site:yelp.com OR site:bbb.org OR site:yellowpages.com`
    );

    // Use Google Places text search as a more reliable method
    if (GOOGLE_API_KEY) {
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        `${businessName} in ${city}`
      )}&key=${GOOGLE_API_KEY}`;
      const res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
      const searchData = await res.json();

      if (searchData.status === "OK" && searchData.results?.[0]) {
        const place = searchData.results[0];
        const data: Partial<ScrapedData> = {};

        // Get details for the first result
        if (place.place_id) {
          const details = await fetchGooglePlaceDetails(businessName, city, place.place_id);
          if (details) return details;
        }
      }
    }
  } catch {
    // Search failed
  }

  return null;
}

/**
 * Merge new data into existing data, preferring non-empty values.
 */
function mergeScrapedData(
  existing: ScrapedData,
  newData: Partial<ScrapedData>
): ScrapedData {
  return {
    businessName: newData.businessName || existing.businessName,
    tagline: newData.tagline || existing.tagline,
    phone: newData.phone || existing.phone,
    address: newData.address || existing.address,
    services:
      (newData.services?.length || 0) > (existing.services?.length || 0)
        ? newData.services!
        : existing.services,
    testimonials:
      (newData.testimonials?.length || 0) > (existing.testimonials?.length || 0)
        ? newData.testimonials!
        : existing.testimonials,
    photos: [
      ...existing.photos,
      ...(newData.photos || []).filter((p) => !existing.photos.includes(p)),
    ].slice(0, 20),
    about: newData.about || existing.about,
    hours: newData.hours || existing.hours,
    socialLinks: { ...existing.socialLinks, ...newData.socialLinks },
    brandColor: newData.brandColor || existing.brandColor,
    logoUrl: newData.logoUrl || existing.logoUrl,
  };
}

/**
 * Calculate data quality based on what we have.
 */
function calculateQuality(data: ScrapedData): "high" | "medium" | "low" {
  const checks = [
    !!data.phone,
    data.services.length >= 3,
    !!data.about && data.about.length > 50,
    data.photos.length >= 2,
    !!data.brandColor,
    data.testimonials.length >= 1,
    !!data.hours,
    !!data.tagline,
    !!data.address,
  ];
  const score = checks.filter(Boolean).length;
  if (score >= 6) return "high";
  if (score >= 3) return "medium";
  return "low";
}
