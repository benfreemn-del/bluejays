import { v4 as uuidv4 } from "uuid";
import type { Prospect, ScoutOptions, Category } from "./types";
import { getMockProspects } from "./mock-prospects";
import { addProspect, getAllProspects, updateProspect } from "./store";
import { logCost, COST_RATES } from "./cost-logger";
import { normalizeAddress } from "./address-normalizer";
import {
  getSmartQueries,
  checkDuplicate,
  checkWebsiteQuality,
  calculateScoutingScore,
  type ScoutingScore,
  type WebsiteQualityResult,
} from "./scout-optimizer";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function scoutWithGoogle(options: ScoutOptions): Promise<{ prospects: Prospect[]; nextPageToken?: string }> {
  const { city, state, category, limit = 10, pageToken } = options;

  // Use smart queries for better search coverage
  const smartQueries = getSmartQueries(category, 2);
  const primaryQuery = smartQueries[0] || category.replace("-", " ");
  const query = `${primaryQuery} in ${city}${state ? `, ${state}` : ""}`;
  console.log(`  [Scout Optimizer] Using smart query: "${query}" (${smartQueries.length} variants available)`);

  // Step 1: Text Search to find businesses (use pageToken for next batch if provided)
  let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
  if (pageToken) {
    // Google requires a short delay before next_page_token is valid
    await new Promise((r) => setTimeout(r, 2500));
    searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${pageToken}&key=${GOOGLE_API_KEY}`;
  }
  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();

  // Log Google Places search cost
  await logCost({
    service: "google_places",
    action: "text_search",
    costUsd: COST_RATES.google_places_search,
    metadata: { query, city, category },
  });

  // ZERO_RESULTS is valid — means no more businesses in this area/category
  if (searchData.status === "ZERO_RESULTS") {
    return { prospects: [], nextPageToken: undefined };
  }

  if (searchData.status !== "OK") {
    throw new Error(`Google Places API error: ${searchData.status} - ${searchData.error_message || "Unknown error"}`);
  }

  const results = searchData.results.slice(0, limit);
  const now = new Date().toISOString();
  const prospects: Prospect[] = [];

  // Step 2: Get Place Details for each result (phone, website, hours)
  for (const place of results) {
    let phone: string | undefined;
    let website: string | undefined;

    if (place.place_id) {
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website,opening_hours&key=${GOOGLE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        if (detailsData.result) {
          phone = detailsData.result.formatted_phone_number;
          website = detailsData.result.website;
        }

        // Log Google Places detail cost
        await logCost({
          service: "google_places",
          action: "place_details",
          costUsd: COST_RATES.google_places_detail,
          metadata: { placeId: place.place_id, businessName: place.name },
        });
      } catch {
        // Details fetch failed, continue without
      }
    }

    prospects.push({
      id: uuidv4(),
      businessName: place.name,
      phone,
      address: normalizeAddress(place.formatted_address) || "",
      city,
      state: state || "",
      category,
      currentWebsite: website,
      googleRating: place.rating,
      reviewCount: place.user_ratings_total,
      estimatedRevenueTier:
        (place.user_ratings_total || 0) > 100
          ? "high"
          : (place.user_ratings_total || 0) > 30
            ? "medium"
            : "low",
      status: "scouted" as const,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { prospects, nextPageToken: searchData.next_page_token };
}

function scoutWithMockData(options: ScoutOptions): Prospect[] {
  const { city, state, category, limit = 10 } = options;
  const mockData = getMockProspects(city, state || "TX", category);
  const now = new Date().toISOString();

  return mockData.slice(0, limit).map((data) => ({
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  }));
}

// Categories that have premium templates built — only scout these
const ACTIVE_CATEGORIES: Category[] = [
  "real-estate", "dental", "law-firm", "landscaping", "salon",
  "electrician", "plumber", "hvac", "roofing", "auto-repair",
  "chiropractic", "fitness", "veterinary", "photography",
  "cleaning", "pest-control", "accounting", "moving", "florist", "daycare",
  "insurance", "interior-design", "tattoo", "martial-arts",
  "physical-therapy", "tutoring", "pool-spa", "general-contractor",
  "catering", "pet-services", "church",
  // Wave 3 categories (all 46 now have premium V2 templates)
  "restaurant", "medical", "painting", "fencing", "tree-service",
  "pressure-washing", "garage-door", "locksmith", "towing", "construction",
  "med-spa", "appliance-repair", "junk-removal", "carpet-cleaning", "event-planning",
];

export async function scout(options: ScoutOptions): Promise<{ prospects: Prospect[]; nextPageToken?: string }> {
  // Only scout categories with built templates
  if (!ACTIVE_CATEGORIES.includes(options.category)) {
    console.log(`\n⚠️ Category "${options.category}" doesn't have a premium template yet. Skipping.`);
    console.log(`  Active categories: ${ACTIVE_CATEGORIES.join(", ")}`);
    return { prospects: [] };
  }

  console.log(
    `\n🔍 Scouting for ${options.category} businesses in ${options.city}...`
  );

  let prospects: Prospect[];
  let nextPageToken: string | undefined;

  if (GOOGLE_API_KEY) {
    console.log("  Using Google Places API");
    const result = await scoutWithGoogle(options);
    prospects = result.prospects;
    nextPageToken = result.nextPageToken;
  } else {
    console.log("  Using mock data (set GOOGLE_PLACES_API_KEY for real results)");
    prospects = scoutWithMockData(options);
  }

  // Dedup: only skip businesses that are ACTIVE in the pipeline (not dismissed)
  // Previously dismissed businesses can be re-added and will be tagged as "rescouted"
  const existing = await getAllProspects();
  const existingByName = new Map(existing.map((p) => [p.businessName.toLowerCase(), p]));

  const newProspects: Prospect[] = [];
  const rescoutedProspects: Prospect[] = [];
  let skippedActive = 0;

  for (const prospect of prospects) {
    const existingMatch = existingByName.get(prospect.businessName.toLowerCase());
    if (!existingMatch) {
      // Brand new — never seen before
      newProspects.push(prospect);
    } else if (existingMatch.status === "dismissed") {
      // Previously dismissed — allow re-scout with "rescouted" tag
      prospect.id = existingMatch.id; // Keep same ID
      prospect.status = "scouted" as const;
      rescoutedProspects.push(prospect);
    } else {
      // Active in pipeline — skip
      skippedActive++;
    }
  }

  if (skippedActive > 0) {
    console.log(`  Skipped ${skippedActive} active prospects (already in pipeline)`);
  }
  if (rescoutedProspects.length > 0) {
    console.log(`  ♻️ Re-scouted ${rescoutedProspects.length} previously dismissed businesses`);
  }

  // Save new prospects
  for (const prospect of newProspects) {
    await addProspect(prospect);
  }

  // Update re-scouted prospects (change status back from dismissed to scouted)
  for (const prospect of rescoutedProspects) {
    await updateProspect(prospect.id, {
      status: "scouted",
      phone: prospect.phone || undefined,
    });
  }

  const totalFound = newProspects.length + rescoutedProspects.length;
  console.log(`  Found ${totalFound} businesses (${newProspects.length} new, ${rescoutedProspects.length} re-scouted)`);

  // Calculate scouting quality scores and check website quality for new prospects
  const allResults = [...newProspects, ...rescoutedProspects];
  let checkedWebsites = 0;
  let filteredModern = 0;
  const scoredResults: Prospect[] = [];

  for (const prospect of allResults) {
    // Quick website quality check (with rate limiting)
    let websiteQuality: WebsiteQualityResult | undefined;
    if (prospect.currentWebsite && checkedWebsites < 5) {
      try {
        websiteQuality = await checkWebsiteQuality(prospect.currentWebsite);
        checkedWebsites++;

        // Filter out businesses with modern/good websites
        if (websiteQuality.isModern && websiteQuality.score < 30) {
          console.log(`  [Scout Optimizer] Filtered ${prospect.businessName} — modern website detected (score: ${websiteQuality.score})`);
          filteredModern++;
          continue;
        }
      } catch {
        // Website check failed — keep the prospect
      }
    }

    // Calculate scouting quality score
    const score = calculateScoutingScore(prospect, websiteQuality);
    console.log(`  [Scout Optimizer] ${prospect.businessName}: Score ${score.overall}/100 (${score.grade}) — ${score.recommendation}`);

    scoredResults.push(prospect);
  }

  if (filteredModern > 0) {
    console.log(`  [Scout Optimizer] Filtered out ${filteredModern} businesses with modern websites`);
  }

  // Sort by scouting score (best prospects first)
  scoredResults.sort((a, b) => {
    const scoreA = calculateScoutingScore(a).overall;
    const scoreB = calculateScoutingScore(b).overall;
    return scoreB - scoreA;
  });

  console.log(`  Final: ${scoredResults.length} prospects after quality filtering\n`);
  return { prospects: scoredResults, nextPageToken };
}
