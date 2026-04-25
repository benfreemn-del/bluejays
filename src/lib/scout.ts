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
  isLikelyChain,
  type ScoutingScore,
  type WebsiteQualityResult,
} from "./scout-optimizer";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function runGooglePlacesQuery(
  query: string,
  options: ScoutOptions,
  pageToken?: string
): Promise<{ prospects: Prospect[]; nextPageToken?: string }> {
  const { city, state, category, limit = 10 } = options;

  // Step 1: Text Search to find businesses (use pageToken for next batch if provided)
  let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
  if (pageToken) {
    // Google requires a short delay before next_page_token is valid (non-negotiable per Google docs)
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

async function scoutWithGoogle(options: ScoutOptions): Promise<{ prospects: Prospect[]; nextPageToken?: string }> {
  const { city, state, category, pageToken } = options;

  // If a pageToken was passed in, we're continuing pagination on the previously-used query.
  // Just run the single token-based call and return.
  if (pageToken) {
    const fallbackQuery = `${(getSmartQueries(category, 1)[0] || category.replace(/-/g, " "))} in ${city}${state ? `, ${state}` : ""}`;
    return runGooglePlacesQuery(fallbackQuery, options, pageToken);
  }

  // Use top 3 smart queries for better search coverage (Fix 2)
  const smartQueries = getSmartQueries(category, 3);
  console.log(`  [Scout Optimizer] Looping top ${smartQueries.length} smart queries for ${category}`);

  const allProspects: Prospect[] = [];
  const seenNames = new Set<string>();
  // Return the page token from the first query, so the caller can continue paginating
  // the most-common (best-results) query across pages.
  let firstPageToken: string | undefined;

  for (let i = 0; i < smartQueries.length; i++) {
    const queryText = smartQueries[i];
    const fullQuery = `${queryText} in ${city}${state ? `, ${state}` : ""}`;
    console.log(`  [Scout Optimizer] Query ${i + 1}/${smartQueries.length}: "${fullQuery}"`);

    try {
      const result = await runGooglePlacesQuery(fullQuery, options);
      if (i === 0) firstPageToken = result.nextPageToken;

      for (const p of result.prospects) {
        const key = p.businessName.toLowerCase().trim();
        if (!seenNames.has(key)) {
          seenNames.add(key);
          allProspects.push(p);
        }
      }
    } catch (err) {
      console.warn(`  [Scout Optimizer] Query "${fullQuery}" failed: ${(err as Error).message}`);
      // Continue to next query — don't fail the whole scout because one variant 500'd
    }
  }

  return { prospects: allProspects, nextPageToken: firstPageToken };
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
export const ACTIVE_CATEGORIES: Category[] = [
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

  // Fix 4 — Chain/franchise blocklist: filter spammy national brands BEFORE the API write,
  // saving ~$0.10/lead generation cycles on McDonald's #1234, Jiffy Lube franchise locations, etc.
  const beforeChainFilter = prospects.length;
  prospects = prospects.filter((p) => {
    if (isLikelyChain(p.businessName)) {
      console.log(`  [Scout Optimizer] Skipping likely chain: ${p.businessName}`);
      return false;
    }
    return true;
  });
  const skippedChains = beforeChainFilter - prospects.length;
  if (skippedChains > 0) {
    console.log(`  [Scout Optimizer] Skipped ${skippedChains} likely chain/franchise prospects`);
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

  // Fix 5 — Run website-quality checks for ALL prospects with a website BEFORE saving,
  // using a hand-rolled concurrency-5 pool (no new dependencies). Modern Squarespace/Wix
  // sites are filtered out so we don't waste a generation cycle on prospects we can't sell to.
  const allCandidates = [...newProspects, ...rescoutedProspects];
  const candidateQuality = new Map<string, WebsiteQualityResult>();
  const websiteCandidates = allCandidates.filter((p) => !!p.currentWebsite);

  if (websiteCandidates.length > 0) {
    console.log(`  [Scout Optimizer] Checking website quality for ${websiteCandidates.length} prospects (concurrency 5)...`);
    const concurrency = 5;
    let cursor = 0;
    const workers = new Array(Math.min(concurrency, websiteCandidates.length))
      .fill(null)
      .map(async () => {
        while (true) {
          const idx = cursor++;
          if (idx >= websiteCandidates.length) return;
          const p = websiteCandidates[idx];
          try {
            const q = await checkWebsiteQuality(p.currentWebsite!);
            candidateQuality.set(p.id, q);
          } catch {
            // ignore — we keep the prospect when check fails
          }
        }
      });
    await Promise.allSettled(workers);
  }

  // Decide which prospects survive the modern-website filter
  let filteredModern = 0;
  const survivingNew: Prospect[] = [];
  const survivingRescouted: Prospect[] = [];

  for (const p of newProspects) {
    const q = candidateQuality.get(p.id);
    if (q && q.isModern && q.score < 30) {
      console.log(`  [Scout Optimizer] Filtered ${p.businessName} — modern website detected (score: ${q.score}, signals: ${q.signals.join(", ")})`);
      filteredModern++;
      continue;
    }
    survivingNew.push(p);
  }
  for (const p of rescoutedProspects) {
    const q = candidateQuality.get(p.id);
    if (q && q.isModern && q.score < 30) {
      console.log(`  [Scout Optimizer] Filtered ${p.businessName} — modern website detected (score: ${q.score}, signals: ${q.signals.join(", ")})`);
      filteredModern++;
      continue;
    }
    survivingRescouted.push(p);
  }

  if (filteredModern > 0) {
    console.log(`  [Scout Optimizer] Skipped ${filteredModern} prospects with modern Squarespace/Wix/Webflow/Shopify sites (pre-save)`);
  }

  // Save survivors (Fix 5: only enqueue prospects that passed the modern-website check)
  for (const prospect of survivingNew) {
    await addProspect(prospect);
  }

  // Update re-scouted survivors (change status back from dismissed to scouted)
  for (const prospect of survivingRescouted) {
    await updateProspect(prospect.id, {
      status: "scouted",
      phone: prospect.phone || undefined,
    });
  }

  const totalFound = survivingNew.length + survivingRescouted.length;
  console.log(`  Found ${totalFound} businesses (${survivingNew.length} new, ${survivingRescouted.length} re-scouted)`);

  // Score the surviving prospects (using the website-quality data we already gathered)
  const scoredResults: Prospect[] = [];
  for (const prospect of [...survivingNew, ...survivingRescouted]) {
    const websiteQuality = candidateQuality.get(prospect.id);
    const score = calculateScoutingScore(prospect, websiteQuality);
    console.log(`  [Scout Optimizer] ${prospect.businessName}: Score ${score.overall}/100 (${score.grade}) — ${score.recommendation}`);
    scoredResults.push(prospect);
  }

  // Sort by scouting score (best prospects first)
  scoredResults.sort((a, b) => {
    const scoreA = calculateScoutingScore(a, candidateQuality.get(a.id)).overall;
    const scoreB = calculateScoutingScore(b, candidateQuality.get(b.id)).overall;
    return scoreB - scoreA;
  });

  console.log(`  Final: ${scoredResults.length} prospects after quality filtering\n`);
  return { prospects: scoredResults, nextPageToken };
}
