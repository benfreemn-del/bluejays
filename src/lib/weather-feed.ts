/**
 * weather-feed.ts — NWS active-alerts fetcher for storm-driven urgency.
 *
 * Per `docs/MOCK_BACKEND_TEMPLATE_AUDIT.md` roadmap #5 — 4+ categories
 * share a "recent severe weather event = lead-urgency boost" pattern:
 * roofing (hail / wind) / tree-service (storm cleanup) / hvac (heat-
 * wave / freeze) / plumber (freeze).
 *
 * Data source:
 *   · NWS public API (https://api.weather.gov) — free, no auth, no
 *     rate-limit on the /alerts/active endpoint at typical operator
 *     volumes
 *   · Returns ACTIVE alerts only (current + recent — typically last
 *     24-72 hrs depending on event type)
 *   · Historical events (past 30/60/90 days) require the NOAA Storm
 *     Events Database which is a separate CSV/API path — out of scope
 *     for v1, build when heatmap demand exists
 *
 * Cache:
 *   · 30-min TTL — alerts update on a slow cadence and re-fetching
 *     every minute would waste bandwidth without a corresponding
 *     freshness gain. Vercel-edge caching via `next: { revalidate }`.
 *   · Per-zone keying — distinct ZIPs get distinct cache entries
 *
 * Failure mode:
 *   · NWS returns 4xx / 5xx → return empty alert list. Never throw.
 *     Storm urgency is a SCORE BOOST, not a gate — its absence shouldn't
 *     break the lead-score pipeline.
 *
 * Plugs into:
 *   · per-tenant lead-score formula (urgency boost when storm in ZIP)
 *   · /spending heatmap overlay (eventually)
 *   · agent_signal emitter when a high-impact storm hits a tenant's
 *     service area (so the daily digest surfaces it for ops triage)
 */

const NWS_BASE = "https://api.weather.gov";
const FETCH_TIMEOUT_MS = 8000;
const CACHE_TTL_SECONDS = 60 * 30; // 30 min

export interface NwsAlert {
  id: string;
  /** Severe / Extreme / Moderate / Minor / Unknown */
  severity: "Severe" | "Extreme" | "Moderate" | "Minor" | "Unknown";
  /** Likely / Possible / Observed / Unknown */
  certainty: string;
  /** Immediate / Expected / Future / Past / Unknown */
  urgency: string;
  /** "Hail / Tornado / Flood / Winter Storm / Heat / etc." */
  event: string;
  headline: string | null;
  description: string | null;
  effective: string;
  expires: string;
  /** Coverage area description (e.g. "Clallam County, WA") */
  areaDesc: string;
}

/**
 * Pull active NWS alerts for a ZIP code. Returns [] on any failure.
 *
 * NWS API doesn't accept ZIP directly — we use the /points/{lat,lon}
 * endpoint to resolve a ZIP-derived lat/lon to a forecast zone, then
 * /alerts/active?zone={zoneId}. Two HTTP calls per uncached ZIP.
 *
 * For known ZIPs (cached), use the existing zoneId.
 */
export async function fetchActiveAlerts(zip: string): Promise<NwsAlert[]> {
  if (!zip || !/^\d{5}$/.test(zip)) return [];
  try {
    const latLon = await zipToLatLon(zip);
    if (!latLon) return [];
    const zoneId = await latLonToZone(latLon);
    if (!zoneId) return [];
    return await fetchAlertsByZone(zoneId);
  } catch {
    return [];
  }
}

/**
 * ZIP → {lat, lon} via the public Zippopotamus API. Free, no auth.
 * Cached aggressively since ZIP geo doesn't change.
 */
async function zipToLatLon(zip: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const r = await fetchWithTimeout(`https://api.zippopotam.us/us/${zip}`, {
      next: { revalidate: 60 * 60 * 24 * 30 }, // 30 days
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { places?: Array<{ latitude: string; longitude: string }> };
    const place = j.places?.[0];
    if (!place) return null;
    const lat = parseFloat(place.latitude);
    const lon = parseFloat(place.longitude);
    if (isNaN(lat) || isNaN(lon)) return null;
    return { lat, lon };
  } catch {
    return null;
  }
}

/**
 * lat/lon → NWS zone id (e.g. "WAZ514"). Used to query /alerts/active.
 */
async function latLonToZone(coords: { lat: number; lon: number }): Promise<string | null> {
  try {
    const r = await fetchWithTimeout(
      `${NWS_BASE}/points/${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}`,
      {
        headers: { Accept: "application/geo+json" },
        next: { revalidate: 60 * 60 * 24 * 7 }, // 7 days
      },
    );
    if (!r.ok) return null;
    const j = (await r.json()) as {
      properties?: { forecastZone?: string };
    };
    const zoneUrl = j.properties?.forecastZone;
    if (!zoneUrl) return null;
    // forecastZone is a URL like https://api.weather.gov/zones/forecast/WAZ514
    // — pull the trailing zoneId
    const m = zoneUrl.match(/\/([A-Z0-9]+)$/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * Active alerts for a zone. Cached 30 min.
 */
async function fetchAlertsByZone(zoneId: string): Promise<NwsAlert[]> {
  try {
    const r = await fetchWithTimeout(
      `${NWS_BASE}/alerts/active?zone=${zoneId}`,
      {
        headers: { Accept: "application/geo+json" },
        next: { revalidate: CACHE_TTL_SECONDS },
      },
    );
    if (!r.ok) return [];
    const j = (await r.json()) as {
      features?: Array<{
        id: string;
        properties: {
          severity: NwsAlert["severity"];
          certainty: string;
          urgency: string;
          event: string;
          headline: string | null;
          description: string | null;
          effective: string;
          expires: string;
          areaDesc: string;
        };
      }>;
    };
    return (j.features ?? []).map((f) => ({
      id: f.id,
      severity: f.properties.severity ?? "Unknown",
      certainty: f.properties.certainty ?? "Unknown",
      urgency: f.properties.urgency ?? "Unknown",
      event: f.properties.event,
      headline: f.properties.headline,
      description: f.properties.description,
      effective: f.properties.effective,
      expires: f.properties.expires,
      areaDesc: f.properties.areaDesc,
    }));
  } catch {
    return [];
  }
}

function fetchWithTimeout(url: string, init: RequestInit & { next?: { revalidate?: number } } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t));
}

/* ─────────────────── INDUSTRY-FIT FILTERS ─────────────────── */

/**
 * Industry → list of NWS event types that should boost lead urgency.
 * Match case-insensitive; substring match against event name (e.g.
 * "Severe Thunderstorm Warning" matches "thunderstorm").
 */
const INDUSTRY_RELEVANT_EVENTS: Record<string, string[]> = {
  // Roofing — hail + wind + storm-driven damage
  roofing: ["hail", "thunderstorm", "tornado", "high wind", "tropical", "hurricane"],
  // Tree service — wind / ice driving down branches
  "tree-service": ["high wind", "ice storm", "winter storm", "thunderstorm", "tornado"],
  // HVAC — heat waves + cold snaps both stress systems
  hvac: ["heat", "excessive heat", "wind chill", "freeze", "cold"],
  // Plumber — freeze events kill pipes
  plumber: ["freeze", "wind chill", "hard freeze"],
  // Roofing-adjacent — siding contractors might use the same boost
  siding: ["hail", "thunderstorm", "high wind"],
};

/**
 * Returns true if any active alert in this ZIP matches the industry's
 * relevant-event keywords. Pluggable into per-tenant lead-score formulas.
 *
 * Usage in an OIT-style score helper:
 *   const stormBoost = await hasRelevantStorm(lead.zip, "roofing");
 *   if (stormBoost) score += 18;
 */
export async function hasRelevantStorm(
  zip: string,
  industry: string,
): Promise<boolean> {
  const alerts = await fetchActiveAlerts(zip);
  if (alerts.length === 0) return false;
  const keywords = INDUSTRY_RELEVANT_EVENTS[industry] ?? [];
  if (keywords.length === 0) return false;
  return alerts.some((a) => {
    const ev = a.event.toLowerCase();
    return keywords.some((k) => ev.includes(k));
  });
}

/**
 * 0-30 numeric urgency-boost score for a ZIP × industry pair.
 * Composes Severity (Severe/Extreme = max) × Urgency (Immediate = max)
 * × Certainty (Observed = max) into a single boost number.
 *
 * Use when a tenant's lead-score formula wants gradient (not boolean)
 * urgency:
 *   const stormScore = await stormUrgencyScore(lead.zip, "roofing");
 *   score += stormScore;
 */
export async function stormUrgencyScore(
  zip: string,
  industry: string,
): Promise<number> {
  const alerts = await fetchActiveAlerts(zip);
  if (alerts.length === 0) return 0;
  const keywords = INDUSTRY_RELEVANT_EVENTS[industry] ?? [];
  if (keywords.length === 0) return 0;
  const matches = alerts.filter((a) => {
    const ev = a.event.toLowerCase();
    return keywords.some((k) => ev.includes(k));
  });
  if (matches.length === 0) return 0;
  // Take the worst match
  const worst = matches.reduce<NwsAlert>((acc, a) => {
    return severityScore(a) > severityScore(acc) ? a : acc;
  }, matches[0]);
  return Math.min(30, severityScore(worst));
}

function severityScore(a: NwsAlert): number {
  const sev = a.severity === "Extreme" ? 12 : a.severity === "Severe" ? 9 : a.severity === "Moderate" ? 5 : 2;
  const urg = a.urgency === "Immediate" ? 12 : a.urgency === "Expected" ? 8 : a.urgency === "Future" ? 4 : 1;
  const cert = a.certainty === "Observed" ? 6 : a.certainty === "Likely" ? 4 : 2;
  return sev + urg + cert;
}
