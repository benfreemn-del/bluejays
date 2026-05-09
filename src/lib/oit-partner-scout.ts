/**
 * oit-partner-scout — auto-discovery of affiliate-target businesses
 * for Olympic Inspections & Testing across the Olympic Peninsula.
 *
 * Different shape than `scout.ts` (which discovers prospects to PITCH
 * BlueJays services to). This scout finds businesses LUKE wants to
 * partner with: realtors, property managers, mold-remediation
 * contractors, restoration companies. Output goes to client_affiliates,
 * NOT prospects.
 *
 * Search universe: Clallam, Jefferson, Kitsap, Mason counties — the
 * Olympic Peninsula service area. Queries × cities × categories =
 * ~60 queries per run, dedupes against existing rows so re-runs are
 * cheap.
 *
 * Cron: weekly Monday morning. Affiliate-target lists don't change
 * daily — agencies open/close on monthly cadence at most.
 *
 * Cost: ~$0.05/query × 60 queries = ~$3/run. Cheap.
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import { logCost } from "./cost-logger";
import { logHeartbeat } from "./cron-heartbeat";
import { getInspectionClient } from "./inspection-clients";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

type ScoutResult = {
  scanned: number;
  inserted: number;
  duplicates: number;
  errors: string[];
};

async function placesTextSearch(query: string): Promise<{
  results: Array<{
    name: string;
    formatted_address?: string;
    place_id?: string;
    rating?: number;
    user_ratings_total?: number;
  }>;
  status: string;
}> {
  if (!GOOGLE_API_KEY) {
    return { results: [], status: "MISSING_API_KEY" };
  }
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
  const r = await fetch(url);
  const data = await r.json();
  await logCost({
    service: "google_places",
    action: "text_search",
    costUsd: 0.032,
    metadata: { query, source: "oit-partner-scout" },
  });
  return data;
}

async function placeDetails(placeId: string): Promise<{
  phone?: string;
  website?: string;
}> {
  if (!GOOGLE_API_KEY || !placeId) return {};
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website&key=${GOOGLE_API_KEY}`;
  const r = await fetch(url);
  const data = await r.json();
  await logCost({
    service: "google_places",
    action: "place_details",
    costUsd: 0.017,
    metadata: { placeId, source: "oit-partner-scout" },
  });
  return {
    phone: data.result?.formatted_phone_number,
    website: data.result?.website,
  };
}

/**
 * Run the partner scout for any inspection-style client. Idempotent:
 * dedupe key is (client_slug, lower(org_name), lower(city)) so
 * re-running just adds new businesses that have appeared since last
 * run. Reads cities + queries from the inspection-clients registry —
 * a new tenant just registers their config and this scout works
 * without code changes.
 *
 * Backwards-compatible default = olympic-inspections so existing cron
 * entry doesn't change shape.
 */
export async function runPartnerScout(
  clientSlug: string = "olympic-inspections",
): Promise<ScoutResult> {
  const result: ScoutResult = {
    scanned: 0,
    inserted: 0,
    duplicates: 0,
    errors: [],
  };

  const config = getInspectionClient(clientSlug);
  if (!config) {
    result.errors.push(`unknown_inspection_client: ${clientSlug}`);
    return result;
  }

  if (!isSupabaseConfigured()) {
    result.errors.push("supabase_not_configured");
    return result;
  }

  // Pre-load existing affiliates so we can dedupe in-memory.
  const { data: existing } = await supabase
    .from("client_affiliates")
    .select("org_name, city")
    .eq("client_slug", clientSlug);
  const existingKeys = new Set<string>(
    (existing ?? []).map(
      (r) =>
        `${(r.org_name || "").toLowerCase()}::${(r.city || "").toLowerCase()}`,
    ),
  );

  for (const city of config.scoutCities) {
    for (const q of config.scoutQueries) {
      const fullQuery = `${q.query} in ${city.city}, ${city.state}`;
      try {
        const { results, status } = await placesTextSearch(fullQuery);
        if (status === "MISSING_API_KEY") {
          result.errors.push(
            "GOOGLE_PLACES_API_KEY unset — scout returned 0 results",
          );
          break;
        }
        if (status !== "OK" && status !== "ZERO_RESULTS") {
          result.errors.push(`${fullQuery}: ${status}`);
          continue;
        }
        const top = results.slice(0, 8); // cap per-query cost
        for (const place of top) {
          result.scanned += 1;
          const key = `${place.name.toLowerCase()}::${city.city.toLowerCase()}`;
          if (existingKeys.has(key)) {
            result.duplicates += 1;
            continue;
          }
          const details = place.place_id
            ? await placeDetails(place.place_id)
            : {};
          // Score 0-100 based on review count + rating. >100 reviews +
          // 4.5+ stars = top-tier outreach target.
          const ratingScore = (place.rating ?? 0) * 10;
          const reviewScore = Math.min((place.user_ratings_total ?? 0) / 2, 50);
          const fitScore = Math.round(ratingScore + reviewScore);
          const { error } = await supabase.from("client_affiliates").insert({
            client_slug: clientSlug,
            org_name: place.name,
            role: q.role,
            channel: q.channel,
            phone: details.phone ?? null,
            website: details.website ?? null,
            city: city.city,
            state: city.state,
            region: city.region,
            fit_score: fitScore,
            status: "discovered",
            source: "oit-partner-scout",
            raw_payload: {
              place_id: place.place_id,
              address: place.formatted_address,
              rating: place.rating,
              review_count: place.user_ratings_total,
              query: fullQuery,
            },
          });
          if (error) {
            result.errors.push(`insert ${place.name}: ${error.message}`);
            continue;
          }
          existingKeys.add(key);
          result.inserted += 1;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`${fullQuery}: ${msg}`);
      }
    }
  }

  await logHeartbeat(`partner_scout_${clientSlug.replace(/-/g, "_")}`, {
    scanned: result.scanned,
    inserted: result.inserted,
    duplicates: result.duplicates,
    errors: result.errors.length,
  });

  return result;
}

/**
 * @deprecated Use runPartnerScout("olympic-inspections") instead.
 * Kept as an alias so the cron route + any callers don't break.
 */
export const runOitPartnerScout = runPartnerScout;
