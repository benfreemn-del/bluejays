"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  TileLayer,
  Tooltip,
} from "react-leaflet";
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

const LAYER_OPTIONS: Array<{ id: MapLayer; label: string; emoji: string }> = [
  { id: "all", label: "All markets", emoji: "🗺️" },
  { id: "mls", label: "MLS host cities only", emoji: "⚽" },
  { id: "cities", label: "Cities only", emoji: "🏙️" },
];

/** Population → bullet radius in px (sqrt scale). */
function popRadius(population: number): number {
  return Math.max(3, Math.min(22, Math.sqrt(population / 4000)));
}

export default function TekkyMapClient() {
  const [layer, setLayer] = useState<MapLayer>("all");
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [lockedState, setLockedState] = useState<string | null>(null);
  const [statesGeoJson, setStatesGeoJson] =
    useState<FeatureCollection | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummaryRow[]>([]);
  const [scrapeStatus, setScrapeStatus] = useState<{
    key: string; // `${city}|${state}|${audience}`
    state: "running" | "done" | "error";
    message?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(STATE_BORDERS_URL)
      .then((r) => r.json())
      .then((j: FeatureCollection) => {
        if (!cancelled) setStatesGeoJson(j);
      })
      .catch(() => {
        // network blip — map still renders without state outlines
      });
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

  /* GeoJSON style + event hooks */
  const stateStyle = (feature?: Feature<Geometry>) => {
    const name = (feature?.properties?.name ?? "") as string;
    const isFocus = focusState && stateNameToAbbr(name) === focusState;
    return {
      color: isFocus ? "#facc15" : "#1e293b",
      weight: isFocus ? 2 : 0.7,
      fillColor: isFocus ? "#facc15" : "#0f172a",
      fillOpacity: isFocus ? 0.08 : 0.35,
    };
  };

  const onEachState = (feature: Feature<Geometry>, leafletLayer: Layer) => {
    const fullName = (feature.properties?.name ?? "") as string;
    const abbr = stateNameToAbbr(fullName);
    leafletLayer.on({
      mouseover: () => setHoveredState(abbr),
      mouseout: () => setHoveredState(null),
      click: () => {
        setLockedState((prev) => (prev === abbr ? null : abbr));
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

          {statesGeoJson && (
            <GeoJSON
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
            Click a state to lock the sidebar. ECNL/MLS NEXT/USL layers
            land once we wire real data.
          </div>
        </div>
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
                            runScrape(t.name, t.state, aud);
                          }}
                          disabled={isRunning}
                          title={`Scrape ${meta.label} in ${t.name}, ${t.state}`}
                          className="text-[10px] font-bold rounded-md px-1.5 py-1 border border-slate-700 hover:border-amber-400 transition disabled:opacity-50 flex flex-col items-center gap-0.5"
                          style={{ color: meta.color }}
                        >
                          <span>
                            {meta.emoji} {isRunning ? "…" : meta.label}
                          </span>
                          <span className="text-slate-400 font-normal">
                            {count > 0 ? `${count} leads` : "scrape"}
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

        <div className="p-4 mt-2 text-[10px] text-slate-500 italic border-t border-white/[0.04]">
          Data: mlssoccer.com (host cities) + US Census (population).
          ECNL/MLS NEXT/USL & per-audience scoring queued for when we
          wire real sources.
        </div>
      </aside>
    </div>
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
