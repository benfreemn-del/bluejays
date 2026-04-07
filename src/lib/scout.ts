import { v4 as uuidv4 } from "uuid";
import type { Prospect, ScoutOptions, Category } from "./types";
import { getMockProspects } from "./mock-prospects";
import { addProspect, getAllProspects } from "./store";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function scoutWithGoogle(options: ScoutOptions): Promise<Prospect[]> {
  const { city, state, category, limit = 10 } = options;
  const query = `${category.replace("-", " ")} in ${city}${state ? `, ${state}` : ""}`;

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(`Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
  }

  const results = data.results.slice(0, limit);
  const now = new Date().toISOString();

  const prospects: Prospect[] = results.map(
    (place: {
      name: string;
      formatted_address: string;
      formatted_phone_number?: string;
      website?: string;
      rating?: number;
      user_ratings_total?: number;
    }) => ({
      id: uuidv4(),
      businessName: place.name,
      phone: place.formatted_phone_number,
      address: place.formatted_address,
      city,
      state: state || "",
      category,
      currentWebsite: place.website,
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
    })
  );

  return prospects;
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
];

export async function scout(options: ScoutOptions): Promise<Prospect[]> {
  // Only scout categories with built templates
  if (!ACTIVE_CATEGORIES.includes(options.category)) {
    console.log(`\n⚠️ Category "${options.category}" doesn't have a premium template yet. Skipping.`);
    console.log(`  Active categories: ${ACTIVE_CATEGORIES.join(", ")}`);
    return [];
  }

  console.log(
    `\n🔍 Scouting for ${options.category} businesses in ${options.city}...`
  );

  let prospects: Prospect[];

  if (GOOGLE_API_KEY) {
    console.log("  Using Google Places API");
    prospects = await scoutWithGoogle(options);
  } else {
    console.log("  Using mock data (set GOOGLE_PLACES_API_KEY for real results)");
    prospects = scoutWithMockData(options);
  }

  // Dedup: skip businesses already in the system (especially dismissed ones)
  const existing = await getAllProspects();
  const existingNames = new Set(existing.map((p) => p.businessName.toLowerCase()));
  const newProspects = prospects.filter((p) => !existingNames.has(p.businessName.toLowerCase()));

  if (newProspects.length < prospects.length) {
    console.log(`  Skipped ${prospects.length - newProspects.length} duplicates (already in system)`);
  }

  // Save new prospects to the store
  for (const prospect of newProspects) {
    await addProspect(prospect);
  }

  console.log(`  Found ${newProspects.length} new businesses\n`);
  return newProspects;
}
