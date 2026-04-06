import { v4 as uuidv4 } from "uuid";
import type { Prospect, ScoutOptions } from "./types";
import { getMockProspects } from "./mock-prospects";
import { addProspect } from "./store";

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

export async function scout(options: ScoutOptions): Promise<Prospect[]> {
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

  // Save each prospect to the store
  for (const prospect of prospects) {
    await addProspect(prospect);
  }

  console.log(`  Found ${prospects.length} businesses\n`);
  return prospects;
}
