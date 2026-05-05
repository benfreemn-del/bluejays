"use client";

/**
 * ITC tractor-market map for the owner portal. Slug-gated — renders
 * only for client_slug = "itc-quick-attach".
 *
 * Data discipline (matches the rest of the system):
 *   - US counties: Plotly's open GeoJSON (geojson-counties-fips.json)
 *   - State borders: PublicaMundi GeoJSON
 *   - City bullets sized by population: src/data/us-major-cities.json
 *   - Verified ITC pins (HQ + Cascade dealer): src/data/itc-verified-pins.json
 *
 * Per-audience overlay layers (Dealers / Foresters / Hunters / Hobbyists)
 * show only when concrete data sources are wired. Until then the layer
 * toggle just hides/shows the verified pins. See _TODO_DATA_SOURCES in
 * the verified-pins JSON for the concrete feeds queued.
 */

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

import majorCitiesData from "@/data/us-major-cities.json";
import itcPinsData from "@/data/itc-verified-pins.json";

type City = {
  name: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
};

type ItcPin = {
  kind: "hq" | "dealer";
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  label: string;
  detail: string;
};

type Layer = "all" | "dealers" | "foresters" | "hunters" | "hobbyists" | "tym";

const LAYER_OPTIONS: Array<{
  id: Layer;
  label: string;
  emoji: string;
  hint: string;
}> = [
  { id: "all", label: "All markets", emoji: "🗺️", hint: "Population-sized cities + verified ITC pins" },
  { id: "dealers", label: "Dealers", emoji: "🤝", hint: "Verified dealers (more wired when locator data lands)" },
  { id: "tym", label: "TYM owners", emoji: "⚙️", hint: "TYM dealer concentrations (data source queued)" },
  { id: "foresters", label: "Foresters", emoji: "🌲", hint: "USDA forest-county overlay (data source queued)" },
  { id: "hunters", label: "Hunters", emoji: "🦌", hint: "State hunting-license counts (data source queued)" },
  { id: "hobbyists", label: "Sub-compact owners", emoji: "🚜", hint: "USDA Ag-census compact-tractor sales (data source queued)" },
];

const STATE_BORDERS_URL =
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";
const COUNTIES_URL =
  "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json";

function popRadius(population: number): number {
  return Math.max(3, Math.min(22, Math.sqrt(population / 4000)));
}

export default function ItcMarketMap() {
  const [layer, setLayer] = useState<Layer>("all");
  const [statesGeoJson, setStatesGeoJson] =
    useState<FeatureCollection | null>(null);
  const [countiesGeoJson, setCountiesGeoJson] =
    useState<FeatureCollection | null>(null);
  const [showCounties, setShowCounties] = useState(true);

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

  const cities = (majorCitiesData.cities as City[]) ?? [];
  const pins = (itcPinsData.pins as ItcPin[]) ?? [];

  // Layer filter: when "all" or "dealers", show every verified pin.
  // Other layers currently have no concrete data — empty state shown.
  const showPins = layer === "all" || layer === "dealers";
  const showCities = layer === "all";

  // Sidebar: top 10 cities by population, optionally filtered to a state
  // when the user later clicks one.
  const [focusState, setFocusState] = useState<string | null>(null);
  const sidebarCities = useMemo(() => {
    const pool = focusState
      ? cities.filter((c) => c.state === focusState)
      : cities;
    return [...pool]
      .sort((a, b) => b.population - a.population)
      .slice(0, 12);
  }, [cities, focusState]);

  const stateStyle = (feature?: Feature<Geometry>) => {
    const name = (feature?.properties?.name ?? "") as string;
    const isFocus = focusState && stateNameToAbbr(name) === focusState;
    return {
      color: isFocus ? "#facc15" : "#1e293b",
      weight: isFocus ? 1.5 : 0.6,
      fillColor: isFocus ? "#facc15" : "#0f172a",
      fillOpacity: isFocus ? 0.07 : 0.30,
    };
  };

  const countyStyle = () => ({
    color: "#1e293b",
    weight: 0.25,
    fillColor: "#0a0f1c",
    fillOpacity: 0.15,
  });

  const onEachState = (feature: Feature<Geometry>, leafletLayer: import("leaflet").Layer) => {
    const fullName = (feature.properties?.name ?? "") as string;
    const abbr = stateNameToAbbr(fullName);
    leafletLayer.on({
      mouseover: () => setFocusState(abbr),
      mouseout: () => setFocusState(null),
    });
  };

  const activeLayer = LAYER_OPTIONS.find((o) => o.id === layer);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-3 h-[640px]">
      {/* MAP */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#020617]">
        <MapContainer
          center={[39.5, -97]}
          zoom={4}
          minZoom={3}
          maxZoom={11}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Counties layer — toggleable, faint by default */}
          {showCounties && countiesGeoJson && (
            <GeoJSON
              key="counties"
              data={countiesGeoJson}
              style={countyStyle}
            />
          )}

          {/* State borders — focus highlight on hover */}
          {statesGeoJson && (
            <GeoJSON
              key="states"
              data={statesGeoJson}
              style={stateStyle}
              onEachFeature={onEachState}
            />
          )}

          {/* Population-sized city bullets */}
          {showCities &&
            cities.map((c) => (
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

          {/* Verified ITC pins (HQ + dealer) */}
          {showPins &&
            pins.map((p) => (
              <CircleMarker
                key={`pin-${p.name}`}
                center={[p.lat, p.lng]}
                radius={p.kind === "hq" ? 11 : 9}
                pathOptions={{
                  color: p.kind === "hq" ? "#fde047" : "#34d399",
                  weight: 2,
                  fillColor: p.kind === "hq" ? "#facc15" : "#10b981",
                  fillOpacity: 0.85,
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.95} sticky>
                  <div className="text-xs max-w-[260px]">
                    <div className={`font-bold ${p.kind === "hq" ? "text-amber-400" : "text-emerald-400"}`}>
                      {p.kind === "hq" ? "🏭" : "🤝"} {p.name}
                    </div>
                    <div className="text-slate-300 mb-1">
                      {p.city}, {p.state} · {p.label}
                    </div>
                    <div className="text-slate-200 italic">{p.detail}</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
        </MapContainer>

        {/* Layer filter top-left */}
        <div className="absolute top-3 left-3 z-[1000] rounded-xl bg-slate-900/95 border border-white/10 backdrop-blur p-2 shadow-2xl max-w-[230px]">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 px-1 flex items-center justify-between">
            <span>Layers</span>
            <button
              onClick={() => setShowCounties((v) => !v)}
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                showCounties
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "border-slate-700 text-slate-500"
              }`}
            >
              counties {showCounties ? "✓" : "○"}
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {LAYER_OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => setLayer(o.id)}
                className={`text-[11px] font-semibold px-2 py-1.5 rounded-lg border transition text-left whitespace-nowrap ${
                  layer === o.id
                    ? "bg-amber-500 border-amber-300 text-slate-950"
                    : "border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                <span className="mr-1">{o.emoji}</span>
                {o.label}
              </button>
            ))}
          </div>
          {activeLayer && (
            <p className="text-[9px] text-slate-500 mt-2 px-1 leading-tight">
              {activeLayer.hint}
            </p>
          )}
        </div>

        {/* Legend bottom-left */}
        <div className="absolute bottom-3 left-3 z-[1000] rounded-xl bg-slate-900/95 border border-white/10 backdrop-blur p-2.5 shadow-2xl text-[10px] space-y-1">
          <div className="flex items-center gap-2">
            <span style={{ width: 11, height: 11, background: "#facc15", borderRadius: "50%" }} />
            <span className="text-slate-300">ITC HQ (Blossvale NY)</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ width: 9, height: 9, background: "#10b981", borderRadius: "50%" }} />
            <span className="text-slate-300">Verified dealer</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ width: 9, height: 9, background: "#94a3b8", borderRadius: "50%" }} />
            <span className="text-slate-300">City · sized by pop.</span>
          </div>
        </div>

        {/* Empty-state callout for layers without data yet */}
        {(layer === "tym" ||
          layer === "foresters" ||
          layer === "hunters" ||
          layer === "hobbyists") && (
          <div className="absolute top-3 right-3 z-[1000] rounded-xl bg-amber-950/80 border border-amber-500/40 backdrop-blur px-3 py-2 shadow-2xl text-[10px] text-amber-200 max-w-[240px]">
            <p className="font-bold mb-0.5">{activeLayer?.emoji} {activeLayer?.label} layer queued</p>
            <p>Concrete data source needs to be wired. See us-major-cities.json + itc-verified-pins.json for the current verified set.</p>
          </div>
        )}
      </div>

      {/* SIDEBAR */}
      <aside className="rounded-2xl bg-[#0a0f1c] border border-white/[0.06] overflow-y-auto">
        <div className="p-4 border-b border-white/[0.04]">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            {focusState ? "Hovering" : "National"}
          </div>
          <h3 className="text-sm font-bold tracking-tight">
            {focusState
              ? `Top cities — ${stateAbbrToName(focusState)}`
              : "Top US cities by population"}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">
            Bullet size on map = population. Hover a state to filter this list.
          </p>
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
                <div className="font-bold text-white truncate text-xs">
                  {c.name}
                  <span className="text-slate-500 font-normal ml-1">
                    {c.state}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {c.population.toLocaleString()} pop.
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Verified pins block */}
        <div className="p-4 mt-2 border-t border-white/[0.04]">
          <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-2">
            ⚙️ Verified ITC pins ({pins.length})
          </div>
          <ul className="space-y-2">
            {pins.map((p) => (
              <li key={p.name} className="text-[11px]">
                <div className="font-bold text-white">
                  {p.kind === "hq" ? "🏭" : "🤝"} {p.name}
                </div>
                <div className="text-slate-400">
                  {p.city}, {p.state}
                </div>
                <div className="text-[10px] text-slate-500 italic">
                  {p.detail}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-slate-500 italic mt-3">
            Add a TYM/Kioti/Mahindra/Branson dealer locator and these pins
            multiply automatically.
          </p>
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
