/**
 * tekky-scrape — audience-scoped Google Places scraper for the Tekky
 * lead-discovery pipeline.
 *
 * Three audiences, each with a curated set of search queries that
 * actually surface DIFFERENT entities on Google Places:
 *
 *   parent → youth-rec leagues + booster clubs + parent-org pages
 *            (where a TEKKY ball would show up at practice via a
 *            soccer mom. NOT pro-club academies.)
 *
 *   coach  → soccer clubs, training academies, club-level coaches.
 *            Higher commercial intent — these are buyers, not just
 *            referrers.
 *
 *   player → elite training centers, ECNL/MLS NEXT-affiliated clubs,
 *            futsal academies. The "I want to get better" cohort.
 *
 * Each scrape run for a (city, state, audience) tuple is idempotent:
 * Google place_id is unique-indexed, so re-runs add only NEW rows.
 *
 * Storage: public.tekky_scrape_leads. Migration:
 *   supabase/migrations/20260508_tekky_scrape_leads.sql
 */

import { COST_RATES, logCost } from "./cost-logger";
import { normalizeAddress } from "./address-normalizer";
import { getSupabase } from "./supabase";

export type TekkyAudience = "parent" | "coach" | "player";

const QUERIES: Record<TekkyAudience, string[]> = {
  parent: [
    "youth soccer league",
    "recreational soccer club",
    "AYSO",
    "soccer mom association",
    "youth soccer parents",
  ],
  coach: [
    "soccer club",
    "soccer academy",
    "soccer training center",
    "soccer coach",
    "club soccer organization",
  ],
  player: [
    "elite soccer training",
    "ECNL soccer club",
    "MLS NEXT club",
    "soccer development academy",
    "futsal academy",
  ],
};

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export type TekkyScrapeLead = {
  id: string;
  business_name: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_place_id: string | null;
  audience: TekkyAudience;
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

async function googleTextSearch(
  query: string,
): Promise<GooglePlace[]> {
  if (!GOOGLE_API_KEY) return [];
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
  const r = await fetch(url);
  const j = (await r.json()) as { status: string; results?: GooglePlace[] };
  await logCost({
    service: "google_places",
    action: "text_search",
    costUsd: COST_RATES.google_places_search,
    clientSlug: "zenith-sports",
    metadata: { query, source: "tekky-scrape" },
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
      clientSlug: "zenith-sports",
      metadata: { placeId, source: "tekky-scrape" },
    });
    return j.result ?? null;
  } catch {
    return null;
  }
}

/**
 * Run the scrape for one (city, state, audience) target. Idempotent:
 * existing rows (same google_place_id) are skipped silently.
 */
export async function scrapeTekkyMarket(args: {
  city: string;
  state: string;
  audience: TekkyAudience;
  /** Hard cap on rows to insert per query variant (default 5). */
  perQueryLimit?: number;
}): Promise<{
  found: number;
  inserted: number;
  skipped: number;
  queries: string[];
}> {
  const { city, state, audience, perQueryLimit = 5 } = args;
  const queries = QUERIES[audience].map(
    (q) => `${q} in ${city}, ${state}`,
  );

  // Run all query variants, dedupe by place_id within this run.
  const seenPlaceIds = new Set<string>();
  const candidates: Array<{
    place: GooglePlace;
    sourceQuery: string;
  }> = [];
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
        `[tekky-scrape] query "${q}" failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  if (candidates.length === 0) {
    return { found: 0, inserted: 0, skipped: 0, queries };
  }

  // Skip place_ids that already exist in the table for ANY audience —
  // we don't want the same business to appear under three audience
  // labels for the same city. The audience that scraped it first wins.
  const sb = getSupabase();
  const placeIds = candidates.map((c) => c.place.place_id!).filter(Boolean);
  const { data: existing } = await sb
    .from("tekky_scrape_leads")
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
    // Hydrate phone + website (one extra API call per row).
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
    const { error } = await sb.from("tekky_scrape_leads").insert(row);
    if (error) {
      // Could be a race-condition unique violation if two scrapes ran
      // concurrently — treat it as a skip.
      skipped++;
      continue;
    }
    inserted++;

    // ── Mirror into client_leads so scouted businesses surface in the
    //    Zenith Sports owner portal Leads tab alongside form-captures.
    try {
      const { error: mirrorErr } = await sb.from("client_leads").insert({
        client_slug: "zenith-sports",
        audience_segment: audience,
        name: place.name ?? null,
        email: null,
        phone: details?.formatted_phone_number ?? null,
        intent: `Scouted via Google Places · ${city}, ${state}`,
        source: `scout-${audience}`,
        raw_payload: {
          scout_origin: "map",
          google_place_id: place.place_id,
          website: details?.website ?? null,
          address: place.formatted_address ?? null,
          google_rating: place.rating ?? null,
          google_review_count: place.user_ratings_total ?? null,
          source_query: sourceQuery,
        },
      });
      if (mirrorErr) {
        console.warn(
          `[tekky-scrape] client_leads mirror failed for ${place.name}:`,
          mirrorErr.message,
        );
      }
    } catch (err) {
      console.warn(
        `[tekky-scrape] client_leads mirror threw for ${place.name}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return {
    found: candidates.length,
    inserted,
    skipped,
    queries,
  };
}

/**
 * Counts of leads per (city, state) — keyed for the map UI badges.
 */
export async function getTekkyMarketSummary(): Promise<
  Array<{ city: string; state: string; audience: TekkyAudience; count: number }>
> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("tekky_scrape_leads")
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
      audience: audience as TekkyAudience,
      count,
    };
  });
}

export async function listTekkyMarketLeads(args: {
  city: string;
  state: string;
  audience?: TekkyAudience;
}): Promise<TekkyScrapeLead[]> {
  const sb = getSupabase();
  let q = sb
    .from("tekky_scrape_leads")
    .select("*")
    .eq("city", args.city)
    .eq("state", args.state)
    .order("created_at", { ascending: false });
  if (args.audience) q = q.eq("audience", args.audience);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as TekkyScrapeLead[];
}
