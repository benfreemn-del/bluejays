"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Layer } from "leaflet";

import majorCitiesData from "@/data/us-major-cities.json";
import soccerTownsData from "@/data/us-soccer-towns.json";

/**
 * Tekky lead-scrape map.
 *
 * Data discipline (intentional, see CLAUDE.md):
 *   - Population bullets: top US cities by census population
 *   - Golden bullets: ONLY verifiable MLS host cities (mlssoccer.com)
 *
 * Audience-scoring (parent / coach / player) was removed in favor of
 * concrete data only. Re-add it when we wire real sources (ECNL roster,
 * MLS NEXT roster, US Census Hispanic share, US Youth Soccer counts).
 * The TODO list is in src/data/us-soccer-towns.json under
 * `_TODO_DATA_SOURCES`.
 */

type City = {
  name: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
};

type MlsMarket = City & {
  club: string;
  founded: number;
};

type MapLayer = "all" | "mls" | "cities";

type TekkyAudience = "parent" | "coach" | "player";

type MarketSummaryRow = {
  city: string;
  state: string;
  audience: TekkyAudience;
  count: number;
};

type TekkyLeadStatus =
  | "new"
  | "contacted"
  | "responded"
  | "converted"
  | "dismissed";

type TekkyLead = {
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
  status: TekkyLeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const LEAD_STATUS_COLOR: Record<TekkyLeadStatus, string> = {
  new: "bg-slate-700/50 text-slate-200",
  contacted: "bg-blue-500/20 text-blue-300",
  responded: "bg-amber-500/20 text-amber-300",
  converted: "bg-emerald-500/20 text-emerald-300",
  dismissed: "bg-rose-500/20 text-rose-300 line-through",
};

const AUDIENCE_META: Record<
  TekkyAudience,
  { label: string; emoji: string; color: string }
> = {
  parent: { label: "Parents", emoji: "👪", color: "#fbbf24" },
  coach: { label: "Coaches", emoji: "🏟️", color: "#60a5fa" },
  player: { label: "Players", emoji: "🥇", color: "#a3e635" },
};

const STATE_BORDERS_URL =
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";
const COUNTIES_URL =
  "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json";

/** First two digits of a county FIPS = state FIPS. Map → 2-letter
 * USPS abbr so we can filter counties by the locked state. */
const STATE_FIPS_TO_ABBR: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
  "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
  "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
  "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY",
};

const LAYER_OPTIONS: Array<{ id: MapLayer; label: string; emoji: string }> = [
  { id: "all", label: "All markets", emoji: "🗺️" },
  { id: "mls", label: "MLS host cities only", emoji: "⚽" },
  { id: "cities", label: "Cities only", emoji: "🏙️" },
];

/** Population → bullet radius in px (sqrt scale). */
function popRadius(population: number): number {
  return Math.max(3, Math.min(22, Math.sqrt(population / 4000)));
}

/**
 * ZoomController — child of <MapContainer>, fires fitBounds whenever
 * the parent passes a new bounds object (e.g. on state click). Null
 * resets to the default US view.
 */
function ZoomController({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, { padding: [40, 40], duration: 0.8 });
    } else {
      map.flyTo([39.5, -97], 4, { duration: 0.8 });
    }
  }, [bounds, map]);
  return null;
}

export default function TekkyMapClient() {
  const [layer, setLayer] = useState<MapLayer>("all");
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [lockedState, setLockedState] = useState<string | null>(null);
  const [statesGeoJson, setStatesGeoJson] =
    useState<FeatureCollection | null>(null);
  const [countiesGeoJson, setCountiesGeoJson] =
    useState<FeatureCollection | null>(null);
  const [showCounties, setShowCounties] = useState(true);
  // When a county is clicked, opens an audience picker drawer.
  const [countyTarget, setCountyTarget] = useState<{
    name: string;
    state: string;
  } | null>(null);
  // Bounds to fly to when a state is clicked. null = default US view.
  const [zoomBounds, setZoomBounds] = useState<L.LatLngBounds | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummaryRow[]>([]);
  const [scrapeStatus, setScrapeStatus] = useState<{
    key: string; // `${city}|${state}|${audience}`
    state: "running" | "done" | "error";
    message?: string;
  } | null>(null);
  const [drawer, setDrawer] = useState<{
    city: string;
    state: string;
    audience: TekkyAudience | null;
  } | null>(null);
  const [drawerLeads, setDrawerLeads] = useState<TekkyLead[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(STATE_BORDERS_URL)
      .then((r) => r.json())
      .then((j: FeatureCollection) => {
        if (!cancelled) setStatesGeoJson(j);
      })
      .catch(() => {});
    fetch(COUNTIES_URL)
      .then((r) => r.json())
      .then((j: FeatureCollection) => {
        if (!cancelled) setCountiesGeoJson(j);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Pull lead-count summary so the sidebar + tooltips can show how
  // many leads we already have per market/audience.
  const refreshSummary = async () => {
    try {
      const r = await fetch("/api/dashboard/tekky-scrape");
      const j = (await r.json()) as { ok: boolean; summary?: MarketSummaryRow[] };
      if (j.ok && j.summary) setMarketSummary(j.summary);
    } catch {
      // silent — summary is a nice-to-have
    }
  };
  useEffect(() => {
    refreshSummary();
  }, []);

  /** Fire one scrape against a (city, state, audience) target. */
  const runScrape = async (
    city: string,
    state: string,
    audience: TekkyAudience,
  ) => {
    const key = `${city}|${state}|${audience}`;
    setScrapeStatus({ key, state: "running" });
    try {
      const r = await fetch("/api/dashboard/tekky-scrape", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ city, state, audience }),
      });
      const j = (await r.json()) as {
        ok: boolean;
        inserted?: number;
        skipped?: number;
        found?: number;
        error?: string;
      };
      if (!j.ok) {
        setScrapeStatus({
          key,
          state: "error",
          message: j.error ?? "Scrape failed",
        });
        return;
      }
      setScrapeStatus({
        key,
        state: "done",
        message: `+${j.inserted ?? 0} new · ${j.skipped ?? 0} dup · ${j.found ?? 0} found`,
      });
      refreshSummary();
    } catch (err) {
      setScrapeStatus({
        key,
        state: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  };

  /** Open the drawer for one (city, state, audience?) target. */
  const openDrawer = async (
    city: string,
    state: string,
    audience: TekkyAudience | null,
  ) => {
    setDrawer({ city, state, audience });
    setDrawerLoading(true);
    setDrawerLeads([]);
    try {
      const params = new URLSearchParams({ city, state });
      if (audience) params.set("audience", audience);
      const r = await fetch(`/api/dashboard/tekky-scrape?${params}`);
      const j = (await r.json()) as { ok: boolean; leads?: TekkyLead[] };
      if (j.ok && j.leads) setDrawerLeads(j.leads);
    } catch {
      // silent
    }
    setDrawerLoading(false);
  };

  /** Patch one lead optimistically. */
  const patchLead = async (id: string, patch: Partial<TekkyLead>) => {
    setDrawerLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
    await fetch(`/api/dashboard/tekky-scrape/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {});
  };

  const deleteLead = async (id: string) => {
    setDrawerLeads((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/dashboard/tekky-scrape/${id}`, {
      method: "DELETE",
    }).catch(() => {});
    refreshSummary();
  };

  const summaryFor = (
    city: string,
    state: string,
    audience: TekkyAudience,
  ): number => {
    const row = marketSummary.find(
      (r) =>
        r.city === city && r.state === state && r.audience === audience,
    );
    return row?.count ?? 0;
  };

  const cities = (majorCitiesData.cities as City[]) ?? [];
  const mlsMarkets = (soccerTownsData.mls_markets as MlsMarket[]) ?? [];

  const mlsKeys = useMemo(
    () => new Set(mlsMarkets.map((t) => `${t.name}|${t.state}`)),
    [mlsMarkets],
  );

  // Cities that aren't ALSO an MLS market — drawn as plain grey dots.
  const plainCities = useMemo(
    () => cities.filter((c) => !mlsKeys.has(`${c.name}|${c.state}`)),
    [cities, mlsKeys],
  );

  const showCities = layer === "all" || layer === "cities";
  const showMls = layer === "all" || layer === "mls";

  // Sidebar list — focus state filters; otherwise national
  const focusState = lockedState ?? hoveredState;
  const sidebarMarkets = useMemo(() => {
    const pool = focusState
      ? mlsMarkets.filter((t) => t.state === focusState)
      : mlsMarkets;
    return [...pool].sort((a, b) => b.population - a.population);
  }, [mlsMarkets, focusState]);

  const sidebarCities = useMemo(() => {
    const pool = focusState
      ? cities.filter((c) => c.state === focusState)
      : cities;
    return [...pool].sort((a, b) => b.population - a.population).slice(0, 10);
  }, [cities, focusState]);

  // Filter counties to the locked state for both the map render
  // and the sidebar list.
  const visibleCounties = useMemo(() => {
    if (!countiesGeoJson) return null;
    if (!lockedState) return countiesGeoJson;
    const target = Object.entries(STATE_FIPS_TO_ABBR).find(
      ([, abbr]) => abbr === lockedState,
    )?.[0];
    if (!target) return countiesGeoJson;
    return {
      ...countiesGeoJson,
      features: countiesGeoJson.features.filter((f) => {
        const id = String(f.id ?? "").padStart(5, "0");
        return id.slice(0, 2) === target;
      }),
    } as FeatureCollection;
  }, [countiesGeoJson, lockedState]);

  // Sidebar county list — much richer than the 1-3 cities we have
  // per state in the curated dataset.
  const sidebarCounties = useMemo(() => {
    if (!lockedState || !visibleCounties) return [];
    return visibleCounties.features
      .map((f) => {
        const name = (f.properties?.NAME ?? f.properties?.name ?? "") as string;
        return name;
      })
      .filter((n) => n.length > 0)
      .sort();
  }, [lockedState, visibleCounties]);

  /* GeoJSON style + event hooks */
  const stateStyle = (feature?: Feature<Geometry>) => {
    const name = (feature?.properties?.name ?? "") as string;
    const isFocus = focusState && stateNameToAbbr(name) === focusState;
    const isLocked = lockedState && stateNameToAbbr(name) === lockedState;
    return {
      color: isFocus ? "#facc15" : "#1e293b",
      weight: isFocus ? 2 : 0.7,
      // When locked, we want clicks to pass through to the county
      // polygons underneath. Setting fillOpacity to 0 + interactive=false
      // (handled in onEachState) makes that work.
      fillColor: isFocus ? "#facc15" : "#0f172a",
      fillOpacity: isFocus ? 0.08 : 0.35,
    };
  };

  const onEachState = (feature: Feature<Geometry>, leafletLayer: Layer) => {
    const fullName = (feature.properties?.name ?? "") as string;
    const abbr = stateNameToAbbr(fullName);
    // When this state is currently the locked one, disable its
    // interactivity so clicks pass through to the county polygons
    // beneath. Without this, the user can only ever click the state
    // (one big polygon swallows all clicks).
    if (lockedState && abbr === lockedState) {
      const path = leafletLayer as L.Path;
      const elem = (path as L.Path & { _path?: SVGElement })._path;
      if (elem) elem.style.pointerEvents = "none";
      return;
    } else {
      const path = leafletLayer as L.Path;
      const elem = (path as L.Path & { _path?: SVGElement })._path;
      if (elem) elem.style.pointerEvents = "";
    }
    leafletLayer.on({
      mouseover: () => setHoveredState(abbr),
      mouseout: () => setHoveredState(null),
      click: () => {
        // Toggle: clicking an already-locked state unlocks back to US view.
        setLockedState((prev) => {
          if (prev === abbr) {
            setZoomBounds(null);
            return null;
          }
          // Compute bounds of the state polygon and trigger a zoom.
          const layerWithBounds = leafletLayer as Layer & {
            getBounds?: () => L.LatLngBounds;
          };
          if (typeof layerWithBounds.getBounds === "function") {
            setZoomBounds(layerWithBounds.getBounds());
          }
          return abbr;
        });
      },
    });
  };

  const countyStyle = () => ({
    color: "#1e293b",
    weight: 0.4,
    fillColor: "#0a0f1c",
    fillOpacity: 0.10,
  });

  const onEachCounty = (
    feature: Feature<Geometry>,
    leafletLayer: Layer,
  ) => {
    const id = String(feature.id ?? "").padStart(5, "0");
    const stateFips = id.slice(0, 2);
    const stateAbbr = STATE_FIPS_TO_ABBR[stateFips];
    const countyName = (feature.properties?.NAME ?? feature.properties?.name ?? "Unknown") as string;

    leafletLayer.on({
      mouseover: () => {
        const path = leafletLayer as L.Path;
        path.setStyle({
          color: "#facc15",
          weight: 1.5,
          fillColor: "#facc15",
          fillOpacity: 0.25,
        });
      },
      mouseout: () => {
        const path = leafletLayer as L.Path;
        path.setStyle(countyStyle());
      },
      click: (e) => {
        // Stop event so it doesn't bubble to the state polygon underneath.
        L.DomEvent.stopPropagation(e);
        if (!stateAbbr) return;
        setCountyTarget({ name: countyName, state: stateAbbr });
      },
    });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-0 h-[calc(100vh-64px)]">
      {/* MAP */}
      <div className="relative">
        <MapContainer
          center={[39.5, -97]}
          zoom={4}
          minZoom={3}
          maxZoom={11}
          scrollWheelZoom
          className="h-full w-full bg-[#020617]"
          worldCopyJump={false}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <ZoomController bounds={zoomBounds} />

          {/* County overlay — fades on hover, click to scout. Filtered
              to the locked state when zoomed for perf + clarity. */}
          {showCounties && visibleCounties && (
            <GeoJSON
              key={`counties-${lockedState ?? "us"}`}
              data={visibleCounties}
              style={countyStyle}
              onEachFeature={onEachCounty}
            />
          )}

          {statesGeoJson && (
            <GeoJSON
              key={`states-${lockedState ?? "us"}`}
              data={statesGeoJson}
              style={stateStyle}
              onEachFeature={onEachState}
            />
          )}

          {/* Plain population bullets — slate, sized by pop */}
          {showCities &&
            plainCities.map((c) => (
              <CircleMarker
                key={`city-${c.name}-${c.state}`}
                center={[c.lat, c.lng]}
                radius={popRadius(c.population)}
                pathOptions={{
                  color: "#475569",
                  weight: 1,
                  fillColor: "#94a3b8",
                  fillOpacity: 0.35,
                }}
              >
                <Tooltip direction="top" offset={[0, -4]} opacity={0.95}>
                  <div className="text-xs">
                    <div className="font-bold">
                      {c.name}, {c.state}
                    </div>
                    <div className="text-slate-300">
                      {c.population.toLocaleString()} pop.
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}

          {/* MLS host cities — golden glow halo */}
          {showMls &&
            mlsMarkets.map((t) => {
              const r = popRadius(t.population) + 4;
              return (
                <CircleMarker
                  key={`mls-halo-${t.name}-${t.state}`}
                  center={[t.lat, t.lng]}
                  radius={r + 6}
                  pathOptions={{
                    color: "#facc15",
                    weight: 0,
                    fillColor: "#facc15",
                    fillOpacity: 0.18,
                  }}
                />
              );
            })}
          {showMls &&
            mlsMarkets.map((t) => {
              const r = popRadius(t.population) + 4;
              return (
                <CircleMarker
                  key={`mls-core-${t.name}-${t.state}`}
                  center={[t.lat, t.lng]}
                  radius={r}
                  pathOptions={{
                    color: "#fde047",
                    weight: 1.2,
                    fillColor: "#facc15",
                    fillOpacity: 0.85,
                  }}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -8]}
                    opacity={0.95}
                    sticky
                  >
                    <div className="text-xs max-w-[260px]">
                      <div className="font-bold text-amber-400">
                        ⚽ {t.name}, {t.state}
                      </div>
                      <div className="text-slate-300 mb-0.5">
                        {t.population.toLocaleString()} pop.
                      </div>
                      <div className="text-slate-200">
                        Hosts <span className="font-bold">{t.club}</span>
                        <span className="text-slate-500"> · est. {t.founded}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 italic">
                        Source: mlssoccer.com
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
        </MapContainer>

        {/* Prominent "Back to US" button when a state is locked */}
        {lockedState && (
          <button
            onClick={() => {
              setLockedState(null);
              setCountyTarget(null);
              setZoomBounds(null);
            }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs px-4 py-2 shadow-2xl border border-amber-300 flex items-center gap-2"
          >
            ← Back to US · {stateAbbrToName(lockedState)}
          </button>
        )}

        {/* Layer filter — overlaid top-left */}
        <div className="absolute top-3 left-3 z-[1000] rounded-xl bg-slate-900/90 border border-white/10 backdrop-blur p-2 shadow-2xl">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 px-1">
            Layers
          </div>
          <div className="flex flex-col gap-1">
            {LAYER_OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => setLayer(o.id)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition text-left whitespace-nowrap ${
                  layer === o.id
                    ? "bg-amber-500 border-amber-300 text-slate-950"
                    : "border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                <span className="mr-1.5">{o.emoji}</span>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend — overlaid bottom-left */}
        <div className="absolute bottom-3 left-3 z-[1000] rounded-xl bg-slate-900/90 border border-white/10 backdrop-blur p-3 shadow-2xl text-[11px] space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className="inline-block rounded-full"
              style={{
                width: 14,
                height: 14,
                background: "#facc15",
                boxShadow: "0 0 8px #facc1588",
              }}
            />
            <span className="text-slate-300">MLS host city (verified)</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block rounded-full"
              style={{
                width: 12,
                height: 12,
                background: "#94a3b8",
              }}
            />
            <span className="text-slate-300">Major city · sized by pop.</span>
          </div>
          <div className="text-slate-500 pt-1 max-w-[220px]">
            Click a state to zoom + show counties. Click any county to
            scrape leads by audience.
          </div>
          <button
            onClick={() => setShowCounties((v) => !v)}
            className={`mt-2 text-[10px] font-bold px-2 py-1 rounded border w-full ${
              showCounties
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "border-slate-700 text-slate-500"
            }`}
          >
            counties {showCounties ? "✓ on" : "off"}
          </button>
        </div>

        {/* County scout drawer — opens on county click */}
        {countyTarget && (
          <div className="absolute top-3 right-3 z-[1000] rounded-xl bg-slate-900/95 border border-amber-500/40 backdrop-blur p-3 shadow-2xl w-[260px]">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                  Scout this county
                </div>
                <div className="text-sm font-bold text-white">
                  {countyTarget.name}
                  <span className="text-slate-400 font-normal ml-1">
                    {countyTarget.state}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCountyTarget(null)}
                className="text-slate-400 hover:text-white text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">
              Pick an audience. Google Places search runs across the
              county and matching businesses land in the Leads tab.
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(["parent", "coach", "player"] as TekkyAudience[]).map((aud) => {
                const meta = AUDIENCE_META[aud];
                const k = `${countyTarget.name}|${countyTarget.state}|${aud}`;
                const isRunning =
                  scrapeStatus?.key === k && scrapeStatus.state === "running";
                return (
                  <button
                    key={aud}
                    onClick={() =>
                      runScrape(countyTarget.name, countyTarget.state, aud)
                    }
                    disabled={isRunning}
                    className="text-[11px] font-bold rounded-md px-2 py-2 border border-slate-700 hover:border-amber-400 transition disabled:opacity-50 flex flex-col items-center gap-0.5"
                    style={{ color: meta.color }}
                  >
                    <span>{meta.emoji}</span>
                    <span>{isRunning ? "…" : meta.label}</span>
                  </button>
                );
              })}
            </div>
            {scrapeStatus &&
              scrapeStatus.key.startsWith(
                `${countyTarget.name}|${countyTarget.state}|`,
              ) && (
                <div
                  className={`mt-2 text-[10px] ${
                    scrapeStatus.state === "error"
                      ? "text-rose-400"
                      : scrapeStatus.state === "done"
                        ? "text-emerald-400"
                        : "text-slate-400"
                  }`}
                >
                  {scrapeStatus.message ?? "running…"}
                </div>
              )}
          </div>
        )}
      </div>

      {/* SIDEBAR */}
      <aside className="border-l border-white/[0.06] bg-[#0a0f1c] overflow-y-auto">
        <div className="sticky top-0 bg-[#0a0f1c]/95 backdrop-blur border-b border-white/[0.06] p-4 z-10">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            {focusState
              ? lockedState
                ? "Locked focus"
                : "Hovering"
              : "National"}
          </div>
          <h2 className="text-base font-bold tracking-tight mt-0.5">
            {focusState ? stateAbbrToName(focusState) : "All US markets"}
          </h2>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {lockedState && (
              <button
                onClick={() => setLockedState(null)}
                className="text-slate-400 hover:text-white underline"
              >
                Clear lock
              </button>
            )}
          </div>
        </div>

        {/* MLS markets section */}
        <section>
          <div className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-wider text-amber-300 font-bold">
            ⚽ MLS host cities
            {focusState ? "" : ` · ${sidebarMarkets.length} nationwide`}
          </div>
          <ol className="divide-y divide-white/[0.04]">
            {sidebarMarkets.length === 0 && (
              <li className="px-4 py-3 text-xs text-slate-500">
                No MLS host city in {focusState}.
              </li>
            )}
            {sidebarMarkets.map((t) => {
              const audiences: TekkyAudience[] = ["parent", "coach", "player"];
              return (
                <li
                  key={`mls-${t.name}-${t.state}`}
                  className="px-4 py-3 hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] bg-amber-400 text-slate-950">
                      ⚽
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">
                        {t.name}
                        <span className="text-slate-500 font-normal ml-1">
                          {t.state}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-200 truncate">
                        {t.club}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {t.population.toLocaleString()} pop. · est.{" "}
                        {t.founded}
                      </div>
                    </div>
                  </div>
                  {/* Per-audience scrape controls */}
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {audiences.map((aud) => {
                      const meta = AUDIENCE_META[aud];
                      const k = `${t.name}|${t.state}|${aud}`;
                      const isRunning =
                        scrapeStatus?.key === k &&
                        scrapeStatus.state === "running";
                      const count = summaryFor(t.name, t.state, aud);
                      return (
                        <button
                          key={aud}
                          onClick={(e) => {
                            e.stopPropagation();
                            // No leads yet → scrape. Already have some → open
                            // the drawer. Shift-click to force a re-scrape.
                            if (e.shiftKey || count === 0) {
                              runScrape(t.name, t.state, aud);
                            } else {
                              openDrawer(t.name, t.state, aud);
                            }
                          }}
                          disabled={isRunning}
                          title={
                            count > 0
                              ? `${count} ${meta.label} leads — click to view, shift-click to scrape more`
                              : `Scrape ${meta.label} in ${t.name}, ${t.state}`
                          }
                          className="text-[10px] font-bold rounded-md px-1.5 py-1 border border-slate-700 hover:border-amber-400 transition disabled:opacity-50 flex flex-col items-center gap-0.5"
                          style={{ color: meta.color }}
                        >
                          <span>
                            {meta.emoji} {isRunning ? "…" : meta.label}
                          </span>
                          <span className="text-slate-400 font-normal">
                            {count > 0 ? `${count} leads ›` : "scrape"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {scrapeStatus &&
                    scrapeStatus.key.startsWith(`${t.name}|${t.state}|`) && (
                      <div
                        className={`mt-1.5 text-[10px] ${
                          scrapeStatus.state === "error"
                            ? "text-rose-400"
                            : scrapeStatus.state === "done"
                              ? "text-emerald-400"
                              : "text-slate-400"
                        }`}
                      >
                        {scrapeStatus.message ?? "running…"}
                      </div>
                    )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Top cities section (focus state only) */}
        {focusState && (
          <section>
            <div className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Top cities by population
            </div>
            <ol className="divide-y divide-white/[0.04]">
              {sidebarCities.length === 0 && (
                <li className="px-4 py-3 text-xs text-slate-500">
                  No cities in dataset for {focusState}.
                </li>
              )}
              {sidebarCities.map((c, i) => (
                <li
                  key={`city-${c.name}-${c.state}`}
                  className="px-4 py-2 flex items-start gap-3 hover:bg-slate-800/40 transition"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] bg-slate-700 text-slate-300">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate text-sm">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {c.population.toLocaleString()} pop.
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Counties list — only when state is locked. Each county gets
            a click-to-pick-audience action. Click selects the county
            (same as clicking it on the map) and opens the audience
            drawer top-right. */}
        {lockedState && sidebarCounties.length > 0 && (
          <section>
            <div className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-wider text-amber-300 font-bold flex items-center justify-between">
              <span>Counties in {stateAbbrToName(lockedState)}</span>
              <span className="text-slate-500">{sidebarCounties.length}</span>
            </div>
            <ol className="divide-y divide-white/[0.04] max-h-[400px] overflow-y-auto">
              {sidebarCounties.map((c) => (
                <li
                  key={`co-${c}`}
                  className="px-4 py-2 hover:bg-slate-800/40 transition flex items-center justify-between gap-2"
                >
                  <span className="text-xs text-slate-200 truncate flex-1">
                    {c} County
                  </span>
                  <button
                    onClick={() =>
                      setCountyTarget({ name: c, state: lockedState })
                    }
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                  >
                    Scout →
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="p-4 mt-2 text-[10px] text-slate-500 italic border-t border-white/[0.04]">
          Data: mlssoccer.com (host cities) + US Census (population).
          ECNL/MLS NEXT/USL & per-audience scoring queued for when we
          wire real sources.
        </div>
      </aside>

      {/* DRAWER — slides in from the right when a lead-count badge is clicked */}
      {drawer && (
        <div
          className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawer(null)}
        >
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-[#0a0f1c] border-l border-white/10 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0a0f1c]/95 backdrop-blur border-b border-white/[0.06] p-4 z-10 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  {drawer.audience
                    ? `${AUDIENCE_META[drawer.audience].label} leads`
                    : "All leads"}
                </div>
                <h2 className="text-lg font-bold tracking-tight">
                  {drawer.city}, {drawer.state}
                </h2>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {drawerLoading
                    ? "Loading…"
                    : `${drawerLeads.length} lead${drawerLeads.length === 1 ? "" : "s"} · ${drawerLeads.filter((l) => l.status === "new").length} new`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {drawer.audience && (
                  <button
                    onClick={() =>
                      runScrape(drawer.city, drawer.state, drawer.audience!)
                    }
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-amber-400/40 text-amber-300 hover:bg-amber-400/10"
                  >
                    ↻ Scrape more
                  </button>
                )}
                <button
                  onClick={() => setDrawer(null)}
                  className="text-slate-400 hover:text-white text-lg leading-none px-2"
                  aria-label="Close drawer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Lead list */}
            {drawerLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Loading…
              </div>
            ) : drawerLeads.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No leads yet for this market. Click{" "}
                <span className="text-amber-300 font-bold">↻ Scrape more</span>{" "}
                to run the audience-scoped Google Places search.
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {drawerLeads.map((l) => (
                  <LeadRow
                    key={l.id}
                    lead={l}
                    onPatch={(patch) => patchLead(l.id, patch)}
                    onDelete={() => deleteLead(l.id)}
                  />
                ))}
              </ul>
            )}

            <div className="p-4 text-[10px] text-slate-500 italic border-t border-white/[0.04]">
              Source: Google Places. Dedupe via google_place_id.
              Status flow: new → contacted → responded → converted.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* ───────────── Lead row (drawer) ───────────── */

function LeadRow({
  lead,
  onPatch,
  onDelete,
}: {
  lead: TekkyLead;
  onPatch: (patch: Partial<TekkyLead>) => void;
  onDelete: () => void;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(lead.notes ?? "");
  const STATUSES: TekkyLeadStatus[] = [
    "new",
    "contacted",
    "responded",
    "converted",
    "dismissed",
  ];
  return (
    <li className="p-4 hover:bg-slate-800/30 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm truncate">
              {lead.business_name}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${LEAD_STATUS_COLOR[lead.status]}`}
            >
              {lead.status}
            </span>
            {typeof lead.google_rating === "number" && (
              <span className="text-[10px] text-amber-300">
                ★ {lead.google_rating}
                {lead.google_review_count
                  ? ` (${lead.google_review_count})`
                  : ""}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 space-y-0.5">
            {lead.phone && (
              <div>
                <a
                  href={`tel:${lead.phone}`}
                  className="hover:text-white"
                >
                  📞 {lead.phone}
                </a>
              </div>
            )}
            {lead.website && (
              <div className="truncate">
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline truncate"
                >
                  🌐 {lead.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {lead.address && (
              <div className="text-slate-500 truncate">📍 {lead.address}</div>
            )}
          </div>
          <div className="text-[10px] text-slate-600 mt-1 truncate">
            via &ldquo;{lead.source_query}&rdquo;
          </div>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onPatch({ status: s })}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border transition ${
              lead.status === s
                ? `${LEAD_STATUS_COLOR[s]} border-current`
                : "border-slate-700 text-slate-500 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowNotes((v) => !v)}
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-slate-700 text-slate-400 hover:text-white"
        >
          📝 {showNotes ? "Hide" : "Notes"}
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${lead.business_name}"?`)) onDelete();
          }}
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
        >
          Delete
        </button>
      </div>

      {showNotes && (
        <div className="mt-2">
          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            onBlur={() => {
              if (notesDraft !== (lead.notes ?? "")) {
                onPatch({ notes: notesDraft });
              }
            }}
            rows={3}
            placeholder="Notes (saves on blur)…"
            className="w-full rounded bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-500"
          />
        </div>
      )}
    </li>
  );
}

/* ───────────── State name <-> abbreviation helpers ───────────── */

const STATE_NAME_TO_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR",
  California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE",
  "District of Columbia": "DC", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME",
  Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
  Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE",
  Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
  "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR",
  Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT",
  Vermont: "VT", Virginia: "VA", Washington: "WA",
  "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
  "Puerto Rico": "PR",
};

const STATE_ABBR_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAME_TO_ABBR).map(([k, v]) => [v, k]),
);

function stateNameToAbbr(name: string): string {
  return STATE_NAME_TO_ABBR[name] ?? name;
}

function stateAbbrToName(abbr: string): string {
  return STATE_ABBR_TO_NAME[abbr] ?? abbr;
}
