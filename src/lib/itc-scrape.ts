/**
 * itc-scrape — audience-scoped Google Places scraper for ITC Quick
 * Attach (tractor-accessory outbound).
 *
 * Five audiences, each with a query set that surfaces DIFFERENT
 * entities on Google Places (these are tractor-relevant — distinct
 * from the soccer audience queries in tekky-scrape.ts):
 *
 *   dealer   → tractor dealerships, equipment dealers, farm-supply
 *              retail. The B2B accessory-resale opportunity.
 *
 *   tym      → TYM-specific dealers + service centers. Smaller list,
 *              higher conversion (we already have brand-fit kits).
 *
 *   forester → tree services, firewood operations, land-clearing
 *              contractors. SawBoss + Chainbox buyers.
 *
 *   hunter   → outdoor outfitters, hunting clubs, gun shops with
 *              tractor-mount accessories. Firearm-mount pipeline.
 *
 *   hobbyist → small-acreage / hobby-farm groups, sub-compact tractor
 *              clubs, county extension offices. Top-of-funnel volume.
 *
 * Storage: public.itc_scrape_leads. Migration:
 *   supabase/migrations/20260511_itc_scrape_leads.sql
 *
 * google_place_id is unique-indexed → re-runs add only NEW rows.
 */

import { COST_RATES, logCost } from "./cost-logger";
import { normalizeAddress } from "./address-normalizer";
import { getSupabase } from "./supabase";

export type ItcAudience =
  | "dealer"
  | "tym"
  | "forester"
  | "hunter"
  | "hobbyist";

const QUERIES: Record<ItcAudience, string[]> = {
  dealer: [
    "tractor dealer",
    "tractor dealership",
    "compact tractor dealer",
    "farm equipment dealer",
    "farm supply store",
  ],
  tym: [
    "TYM tractor dealer",
    "TYM tractors",
    "TYM service center",
    "TYM equipment",
  ],
  forester: [
    "tree service",
    "firewood supplier",
    "land clearing contractor",
    "logging service",
    "arborist",
  ],
  hunter: [
    "outdoor outfitter",
    "hunting supply store",
    "gun shop",
    "sporting goods hunting",
    "hunting club",
  ],
  hobbyist: [
    "hobby farm supply",
    "small farm equipment",
    "garden tractor dealer",
    "rural lifestyle store",
    "tractor supply",
  ],
};

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export type ItcScrapeLead = {
  id: string;
  business_name: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_place_id: string | null;
  audience: ItcAudience;
  city: string;
  state: string;
  source_query: string;
  status:
    | "new"
    | "contacted"
    | "responded"
    | "converted"
    | "dismissed";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type GooglePlace = {
  place_id?: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
};

type GooglePlaceDetails = {
  formatted_phone_number?: string;
  website?: string;
};

async function googleTextSearch(query: string): Promise<GooglePlace[]> {
  if (!GOOGLE_API_KEY) return [];
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
  const r = await fetch(url);
  const j = (await r.json()) as { status: string; results?: GooglePlace[] };
  await logCost({
    service: "google_places",
    action: "text_search",
    costUsd: COST_RATES.google_places_search,
    metadata: { query, source: "itc-scrape" },
  });
  if (j.status === "ZERO_RESULTS") return [];
  if (j.status !== "OK") {
    throw new Error(`Google Places ${j.status} for "${query}"`);
  }
  return j.results ?? [];
}

async function googleDetails(
  placeId: string,
): Promise<GooglePlaceDetails | null> {
  if (!GOOGLE_API_KEY) return null;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website&key=${GOOGLE_API_KEY}`;
  try {
    const r = await fetch(url);
    const j = (await r.json()) as { result?: GooglePlaceDetails };
    await logCost({
      service: "google_places",
      action: "place_details",
      costUsd: COST_RATES.google_places_detail,
      metadata: { placeId, source: "itc-scrape" },
    });
    return j.result ?? null;
  } catch {
    return null;
  }
}

export async function scrapeItcMarket(args: {
  city: string;
  state: string;
  audience: ItcAudience;
  perQueryLimit?: number;
}): Promise<{
  found: number;
  inserted: number;
  skipped: number;
  queries: string[];
}> {
  const { city, state, audience, perQueryLimit = 5 } = args;
  const queries = QUERIES[audience].map((q) => `${q} in ${city}, ${state}`);

  const seenPlaceIds = new Set<string>();
  const candidates: Array<{ place: GooglePlace; sourceQuery: string }> = [];
  for (const q of queries) {
    try {
      const results = await googleTextSearch(q);
      for (const p of results.slice(0, perQueryLimit)) {
        if (!p.place_id || seenPlaceIds.has(p.place_id)) continue;
        seenPlaceIds.add(p.place_id);
        candidates.push({ place: p, sourceQuery: q });
      }
    } catch (err) {
      console.warn(
        `[itc-scrape] query "${q}" failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  if (candidates.length === 0) {
    return { found: 0, inserted: 0, skipped: 0, queries };
  }

  const sb = getSupabase();
  const placeIds = candidates.map((c) => c.place.place_id!).filter(Boolean);
  const { data: existing } = await sb
    .from("itc_scrape_leads")
    .select("google_place_id")
    .in("google_place_id", placeIds);
  const existingIds = new Set(
    (existing ?? []).map((r) => r.google_place_id as string),
  );

  let inserted = 0;
  let skipped = 0;
  for (const { place, sourceQuery } of candidates) {
    if (!place.place_id || existingIds.has(place.place_id)) {
      skipped++;
      continue;
    }
    const details = await googleDetails(place.place_id);
    const row = {
      business_name: place.name,
      phone: details?.formatted_phone_number ?? null,
      website: details?.website ?? null,
      address: place.formatted_address
        ? normalizeAddress(place.formatted_address)
        : null,
      google_rating: place.rating ?? null,
      google_review_count: place.user_ratings_total ?? null,
      google_place_id: place.place_id,
      audience,
      city,
      state,
      source_query: sourceQuery,
      status: "new" as const,
    };
    const { error } = await sb.from("itc_scrape_leads").insert(row);
    if (error) {
      skipped++;
      continue;
    }
    inserted++;
  }

  return { found: candidates.length, inserted, skipped, queries };
}

export async function getItcMarketSummary(): Promise<
  Array<{ city: string; state: string; audience: ItcAudience; count: number }>
> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("itc_scrape_leads")
    .select("city, state, audience");
  if (error || !data) return [];
  const map = new Map<string, number>();
  for (const r of data) {
    const k = `${r.city}|${r.state}|${r.audience}`;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([k, count]) => {
    const [city, state, audience] = k.split("|");
    return {
      city,
      state,
      audience: audience as ItcAudience,
      count,
    };
  });
}

export async function listItcMarketLeads(args: {
  city: string;
  state: string;
  audience?: ItcAudience;
}): Promise<ItcScrapeLead[]> {
  const sb = getSupabase();
  let q = sb
    .from("itc_scrape_leads")
    .select("*")
    .eq("city", args.city)
    .eq("state", args.state)
    .order("created_at", { ascending: false });
  if (args.audience) q = q.eq("audience", args.audience);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as ItcScrapeLead[];
}
