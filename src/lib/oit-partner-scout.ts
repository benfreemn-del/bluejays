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
import { getServiceClient } from "./service-clients";
import { emitSignal } from "./agent-signals";

/**
 * Per-tenant signal copy for the daily-digest emit. Centralized here so
 * every caller (cron route, manual trigger, smoke test) emits identically.
 * Add a new tenant here when its scout config lands in service-clients.
 */
const SCOUT_SIGNAL_COPY: Record<
  string,
  { source: string; titleNoun: string; detailSuffix: string }
> = {
  "olympic-inspections": {
    source: "oit-partner-scout",
    titleNoun: "partner candidate",
    detailSuffix: "Open the Affiliates Map.",
  },
  "zenith-sports": {
    source: "sports-partner-scout",
    titleNoun: "soccer-program partner candidate",
    detailSuffix: "New clubs / academies / leagues across MLS metros.",
  },
};

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

type ScoutResult = {
  scanned: number;
  inserted: number;
  duplicates: number;
  errors: string[];
};

async function placesTextSearch(
  query: string,
  clientSlug: string,
): Promise<{
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
    clientSlug,
    service: "google_places",
    action: "text_search",
    costUsd: 0.032,
    metadata: { query, source: "partner-scout" },
  });
  return data;
}

async function placeDetails(
  placeId: string,
  clientSlug: string,
): Promise<{
  phone?: string;
  website?: string;
}> {
  if (!GOOGLE_API_KEY || !placeId) return {};
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website&key=${GOOGLE_API_KEY}`;
  const r = await fetch(url);
  const data = await r.json();
  await logCost({
    clientSlug,
    service: "google_places",
    action: "place_details",
    costUsd: 0.017,
    metadata: { placeId, source: "partner-scout" },
  });
  return {
    phone: data.result?.formatted_phone_number,
    website: data.result?.website,
  };
}

/**
 * Optional progress reporter — called by `runPartnerScout` after each
 * city/query iteration. Used by the manual-scan UI to write progress
 * to the `scan_jobs` table so the client can poll for a real progress
 * bar (instead of staring at a frozen "scanning…" button).
 */
export type ScoutProgress = {
  pct: number; // 0-100
  phase: string; // human-readable
  scanned: number;
  inserted: number;
  duplicates: number;
  errorsSoFar: number;
};

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
 *
 * `onProgress` fires after each (city × query) iteration completes.
 * Awaited — supply an async callback to stream progress to a DB row
 * the UI is polling.
 */
export async function runPartnerScout(
  clientSlug: string = "olympic-inspections",
  opts: { onProgress?: (p: ScoutProgress) => Promise<void> | void } = {},
): Promise<ScoutResult> {
  const result: ScoutResult = {
    scanned: 0,
    inserted: 0,
    duplicates: 0,
    errors: [],
  };

  const config = getServiceClient(clientSlug);
  if (!config) {
    result.errors.push(`unknown_service_client: ${clientSlug}`);
    return result;
  }
  if (config.scoutCities.length === 0 || config.scoutQueries.length === 0) {
    result.errors.push(`no_scout_config_for: ${clientSlug}`);
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

  // Same dedup for client_leads — locked 2026-05-10 per Ben spec:
  // outreach-channel scouts also land in the Leads tab so the
  // owner can enroll them into the funnel directly. refer-out
  // channel partners (mold remediation, naturopathic) stay
  // affiliates-only since Luke doesn't outreach TO them.
  const { data: existingLeads } = await supabase
    .from("client_leads")
    .select("name, raw_payload")
    .eq("client_slug", clientSlug)
    .eq("source", "oit-partner-scout");
  const existingLeadKeys = new Set<string>(
    (existingLeads ?? []).map((r) => {
      const payload = (r.raw_payload ?? {}) as Record<string, unknown>;
      const placeId = typeof payload.place_id === "string" ? payload.place_id : "";
      return `${(r.name || "").toLowerCase()}::${placeId}`;
    }),
  );

  const totalIterations = config.scoutCities.length * config.scoutQueries.length;
  let iterationsDone = 0;

  for (const city of config.scoutCities) {
    for (const q of config.scoutQueries) {
      const fullQuery = `${q.query} in ${city.city}, ${city.state}`;
      try {
        const { results, status } = await placesTextSearch(fullQuery, clientSlug);
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
            ? await placeDetails(place.place_id, clientSlug)
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

          // ── Double-write to client_leads (every channel) ──
          // Locked 2026-05-10 per Ben spec: every scouted business
          // appears in the Leads tab so the owner can sort + filter
          // by category. Affiliates board still has the same data
          // for the map view; this is the parallel surface for the
          // pipeline workflow.
          {
            const leadKey = `${place.name.toLowerCase()}::${place.place_id ?? ""}`;
            if (!existingLeadKeys.has(leadKey)) {
              // Map scout role → OIT audience taxonomy. 7 audiences:
              //   realtor / property-management → realtor / property-mgmt
              //   mold-remediation → mold-remediator
              //   water-damage → restoration
              //   naturopathic → naturopath
              const audience =
                q.role === "realtor"
                  ? "realtor"
                  : q.role === "property-management"
                    ? "property-mgmt"
                    : q.role === "mold-remediation"
                      ? "mold-remediator"
                      : q.role === "water-damage"
                        ? "restoration"
                        : q.role === "naturopathic"
                          ? "naturopath"
                          : q.role === "well-services"
                            ? "well-services"
                            : q.role === "radon-mitigation"
                              ? "radon-mitigation"
                              : q.role === "septic-services"
                                ? "septic-services"
                                : null;
              const { error: leadErr } = await supabase
                .from("client_leads")
                .insert({
                  client_slug: clientSlug,
                  name: place.name,
                  phone: details.phone ?? null,
                  audience_segment: audience,
                  intent: `Cold-scout · ${q.role}`,
                  source: "oit-partner-scout",
                  funnel_status: "not_enrolled",
                  raw_payload: {
                    place_id: place.place_id,
                    address: place.formatted_address,
                    rating: place.rating,
                    review_count: place.user_ratings_total,
                    website: details.website ?? null,
                    city: city.city,
                    state: city.state,
                    region: city.region,
                    role: q.role,
                    channel: q.channel,
                    fit_score: fitScore,
                    query: fullQuery,
                  },
                });
              if (leadErr) {
                result.errors.push(`lead-insert ${place.name}: ${leadErr.message}`);
              } else {
                existingLeadKeys.add(leadKey);
              }
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`${fullQuery}: ${msg}`);
      }
      iterationsDone += 1;
      if (opts.onProgress) {
        try {
          await opts.onProgress({
            pct: Math.min(99, Math.round((iterationsDone / totalIterations) * 100)),
            phase: `${city.city} · ${q.role}`,
            scanned: result.scanned,
            inserted: result.inserted,
            duplicates: result.duplicates,
            errorsSoFar: result.errors.length,
          });
        } catch {
          // never let progress reporting break the scout itself
        }
      }
    }
  }

  await logHeartbeat(`partner_scout_${clientSlug.replace(/-/g, "_")}`, {
    scanned: result.scanned,
    inserted: result.inserted,
    duplicates: result.duplicates,
    errors: result.errors.length,
  });

  // Surface new candidates in the daily digest. Lives here (not in the
  // cron route) so any caller — cron, manual trigger, smoke test — emits
  // identically. B4 audit fix.
  if (result.inserted > 0) {
    const copy = SCOUT_SIGNAL_COPY[clientSlug] ?? {
      source: `partner-scout-${clientSlug}`,
      titleNoun: "partner candidate",
      detailSuffix: "Open the Affiliates view.",
    };
    await emitSignal({
      source: copy.source,
      kind: "new-affiliates",
      severity: "notice",
      clientSlug,
      title: `${result.inserted} new ${copy.titleNoun}${result.inserted === 1 ? "" : "s"}`,
      detail: `Scanned ${result.scanned} businesses, ${result.duplicates} dupes. ${copy.detailSuffix}`,
      target: "daily-digest",
      metadata: {
        inserted: result.inserted,
        scanned: result.scanned,
        duplicates: result.duplicates,
      },
    });
  }

  return result;
}

/**
 * @deprecated Use runPartnerScout("olympic-inspections") instead.
 * Kept as an alias so the cron route + any callers don't break.
 */
export const runOitPartnerScout = runPartnerScout;
