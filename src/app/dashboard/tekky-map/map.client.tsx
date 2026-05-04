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

type Audience = "all" | "parent" | "coach" | "player";

type City = {
  name: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
};

type SoccerTown = City & {
  parentScore: number;
  coachScore: number;
  playerScore: number;
  why: string;
};

const STATE_BORDERS_URL =
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";

const AUDIENCE_OPTIONS: Array<{ id: Audience; label: string; emoji: string }> = [
  { id: "all", label: "All", emoji: "⚽" },
  { id: "parent", label: "Parents", emoji: "👪" },
  { id: "coach", label: "Coaches & clubs", emoji: "🏟️" },
  { id: "player", label: "Players improving", emoji: "🥇" },
];

/** Pick the relevant 0-100 score for the active audience. */
function scoreFor(t: SoccerTown, audience: Audience): number {
  if (audience === "parent") return t.parentScore;
  if (audience === "coach") return t.coachScore;
  if (audience === "player") return t.playerScore;
  return Math.max(t.parentScore, t.coachScore, t.playerScore);
}

/** Population → bullet radius in px (sqrt scale so big cities don't dwarf). */
function popRadius(population: number): number {
  return Math.max(3, Math.min(22, Math.sqrt(population / 4000)));
}

/** Soccer-score → glow intensity (color + halo size). */
function glowColor(score: number): string {
  // 50–100 → goldenrod gradient toward bright gold
  if (score >= 90) return "#fde047"; // brilliant gold
  if (score >= 80) return "#facc15"; // gold
  if (score >= 70) return "#eab308"; // amber
  if (score >= 60) return "#ca8a04"; // dark amber
  return "#a16207"; // bronze
}

export default function TekkyMapClient() {
  const [audience, setAudience] = useState<Audience>("all");
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [lockedState, setLockedState] = useState<string | null>(null);
  const [statesGeoJson, setStatesGeoJson] =
    useState<FeatureCollection | null>(null);

  // Pull state borders once.
  useEffect(() => {
    let cancelled = false;
    fetch(STATE_BORDERS_URL)
      .then((r) => r.json())
      .then((j: FeatureCollection) => {
        if (!cancelled) setStatesGeoJson(j);
      })
      .catch(() => {
        // network blip — map still renders, just without state outlines
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cities = (majorCitiesData.cities as City[]) ?? [];
  const towns = (soccerTownsData.towns as SoccerTown[]) ?? [];

  // Soccer-town keys (city + state) for quick "is this a soccer town?" lookups.
  const soccerKeys = useMemo(
    () => new Set(towns.map((t) => `${t.name}|${t.state}`)),
    [towns],
  );

  // Cities that aren't ALSO in the soccer-town list — drawn as plain
  // grey dots.
  const plainCities = useMemo(
    () => cities.filter((c) => !soccerKeys.has(`${c.name}|${c.state}`)),
    [cities, soccerKeys],
  );

  // Soccer towns filtered by the active audience (50+ score on that axis).
  const activeTowns = useMemo(() => {
    return towns.filter((t) => scoreFor(t, audience) >= 50);
  }, [towns, audience]);

  // Top-10 list for the sidebar — based on locked state, hovered state,
  // or "national" if neither.
  const focusState = lockedState ?? hoveredState;
  const top10 = useMemo(() => {
    const pool = focusState
      ? activeTowns.filter((t) => t.state === focusState)
      : activeTowns;
    return [...pool]
      .sort((a, b) => scoreFor(b, audience) - scoreFor(a, audience))
      .slice(0, 10);
  }, [activeTowns, focusState, audience]);

  /* GeoJSON style/event hooks. */
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

  const onEachState = (feature: Feature<Geometry>, layer: Layer) => {
    const fullName = (feature.properties?.name ?? "") as string;
    const abbr = stateNameToAbbr(fullName);
    layer.on({
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
          {plainCities.map((c) => (
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

          {/* Soccer-town golden bullets — glow + tooltip + audience-filtered */}
          {activeTowns.map((t) => {
            const score = scoreFor(t, audience);
            const r = popRadius(t.population) + 4;
            const color = glowColor(score);
            return (
              <CircleMarker
                key={`town-${t.name}-${t.state}`}
                center={[t.lat, t.lng]}
                radius={r + 6}
                pathOptions={{
                  color,
                  weight: 0,
                  fillColor: color,
                  fillOpacity: 0.18,
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.95} sticky>
                  <div className="text-xs max-w-[260px]">
                    <div className="font-bold text-amber-400">
                      ⚽ {t.name}, {t.state}
                    </div>
                    <div className="text-slate-300 mb-1">
                      {t.population.toLocaleString()} pop. · soccer score{" "}
                      <span className="text-amber-300 font-bold">{score}</span>
                    </div>
                    <div className="text-slate-200 italic">{t.why}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Parent {t.parentScore} · Coach {t.coachScore} · Player{" "}
                      {t.playerScore}
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
          {activeTowns.map((t) => {
            const score = scoreFor(t, audience);
            const r = popRadius(t.population) + 4;
            const color = glowColor(score);
            return (
              <CircleMarker
                key={`town-core-${t.name}-${t.state}`}
                center={[t.lat, t.lng]}
                radius={r}
                pathOptions={{
                  color: "#fde047",
                  weight: 1.2,
                  fillColor: color,
                  fillOpacity: 0.85,
                }}
              />
            );
          })}
        </MapContainer>

        {/* Audience filter — overlaid top-left of map */}
        <div className="absolute top-3 left-3 z-[1000] rounded-xl bg-slate-900/90 border border-white/10 backdrop-blur p-2 shadow-2xl">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 px-1">
            Audience
          </div>
          <div className="flex flex-col gap-1">
            {AUDIENCE_OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => setAudience(o.id)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition text-left whitespace-nowrap ${
                  audience === o.id
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
                background: "#fde047",
                boxShadow: "0 0 8px #fde04788",
              }}
            />
            <span className="text-slate-300">Soccer-town (golden)</span>
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
          <div className="text-slate-500 pt-1">
            Click a state to lock the sidebar.
          </div>
        </div>
      </div>

      {/* SIDEBAR — top-10 for focus state */}
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
            {focusState
              ? `Top 10 — ${stateAbbrToName(focusState)}`
              : "Top 10 soccer towns"}
          </h2>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Filter:{" "}
            <span className="text-amber-300 font-bold">
              {AUDIENCE_OPTIONS.find((o) => o.id === audience)?.label}
            </span>
            {lockedState && (
              <button
                onClick={() => setLockedState(null)}
                className="ml-2 text-slate-400 hover:text-white underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <ol className="divide-y divide-white/[0.04]">
          {top10.length === 0 && (
            <li className="p-6 text-center text-sm text-slate-500">
              No soccer towns scored 50+ for this filter
              {focusState ? ` in ${focusState}` : ""}.
            </li>
          )}
          {top10.map((t, i) => {
            const score = scoreFor(t, audience);
            return (
              <li
                key={`${t.name}-${t.state}`}
                className="p-3 flex items-start gap-3 hover:bg-slate-800/40 transition"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs bg-amber-400 text-slate-950">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-bold text-white truncate">
                      {t.name}
                      <span className="text-slate-500 font-normal ml-1">
                        {t.state}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-amber-300 whitespace-nowrap">
                      {score}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {t.population.toLocaleString()} pop.
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 leading-snug">
                    {t.why}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
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
