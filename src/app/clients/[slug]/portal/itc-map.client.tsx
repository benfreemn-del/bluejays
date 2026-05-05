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
  useMap,
} from "react-leaflet";
import L from "leaflet";
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

type ItcAudience = "dealer" | "tym" | "forester" | "hunter" | "hobbyist";

const ITC_AUDIENCE_META: Record<
  ItcAudience,
  { label: string; emoji: string; color: string }
> = {
  dealer: { label: "Dealers", emoji: "🤝", color: "#60a5fa" },
  tym: { label: "TYM", emoji: "⚙️", color: "#fbbf24" },
  forester: { label: "Foresters", emoji: "🌲", color: "#a3e635" },
  hunter: { label: "Hunters", emoji: "🦌", color: "#f87171" },
  hobbyist: { label: "Sub-compact", emoji: "🚜", color: "#34d399" },
};

// (ITC now hits its own /api/dashboard/itc-scrape pipeline — see
//  src/lib/itc-scrape.ts. No more mapping to soccer-audience buckets.)

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

export default function ItcMarketMap() {
  const [layer, setLayer] = useState<Layer>("all");
  const [statesGeoJson, setStatesGeoJson] =
    useState<FeatureCollection | null>(null);
  const [countiesGeoJson, setCountiesGeoJson] =
    useState<FeatureCollection | null>(null);
  const [showCounties, setShowCounties] = useState(true);
  const [lockedState, setLockedState] = useState<string | null>(null);
  const [zoomBounds, setZoomBounds] = useState<L.LatLngBounds | null>(null);
  const [countyTarget, setCountyTarget] = useState<{
    name: string;
    state: string;
  } | null>(null);
  const [scoutStatus, setScoutStatus] = useState<{
    key: string;
    state: "running" | "done" | "error";
    message?: string;
  } | null>(null);
  // Audience the user has staged in the drawer (one at a time). Click
  // an audience tile → selects. Click the green Run button → fires.
  const [stagedAudience, setStagedAudience] = useState<ItcAudience | null>(null);
  // Set of "city|state|audience" keys exhausted last attempt.
  // Persisted to localStorage so the red X survives page reloads.
  const [exhausted, setExhausted] = useState<Set<string>>(new Set());
  // ── Universal AI-package map state (shared rule across all client maps) ──
  //  inProgress = blue ring while a scout is actively scraping
  //  completed  = green ring once the tile has been successfully scouted
  const [inProgress, setInProgress] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem("itc-map.exhausted");
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        if (Array.isArray(arr)) setExhausted(new Set(arr));
      }
      const rawDone = localStorage.getItem("itc-map.completed");
      if (rawDone) {
        const arr = JSON.parse(rawDone) as string[];
        if (Array.isArray(arr)) setCompleted(new Set(arr));
      }
    } catch {
      // ignore
    }
  }, []);

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

  // (legacy city-click scout state removed — replaced by county-click
  //  drawer with full ITC audience picker below)

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

  // Aggregate the three status sets to a per-county verdict so the
  // county polygon colors blue/green/red — matches tekky-map exactly.
  const countyStatus = useMemo(() => {
    const map = new Map<string, "in-progress" | "completed" | "exhausted">();
    const stamp = (
      key: string,
      status: "in-progress" | "completed" | "exhausted",
    ) => {
      const [city, st] = key.split("|");
      if (!city || !st) return;
      const k = `${city}|${st}`;
      const cur = map.get(k);
      if (status === "in-progress") {
        map.set(k, "in-progress");
        return;
      }
      if (status === "completed" && cur !== "in-progress") {
        map.set(k, "completed");
        return;
      }
      if (status === "exhausted" && !cur) {
        map.set(k, "exhausted");
      }
    };
    inProgress.forEach((k) => stamp(k, "in-progress"));
    completed.forEach((k) => stamp(k, "completed"));
    exhausted.forEach((k) => stamp(k, "exhausted"));
    return map;
  }, [inProgress, completed, exhausted]);

  const styleForCounty = (countyName: string, stateAbbr: string | undefined) => {
    if (!stateAbbr) {
      return { color: "#1e293b", weight: 0.25, fillColor: "#0a0f1c", fillOpacity: 0.15 };
    }
    const status = countyStatus.get(`${countyName}|${stateAbbr}`);
    if (status === "in-progress")
      return { color: "#3b82f6", weight: 1.5, fillColor: "#3b82f6", fillOpacity: 0.32 };
    if (status === "completed")
      return { color: "#22c55e", weight: 1, fillColor: "#22c55e", fillOpacity: 0.22 };
    if (status === "exhausted")
      return { color: "#ef4444", weight: 0.6, fillColor: "#ef4444", fillOpacity: 0.12 };
    return { color: "#1e293b", weight: 0.25, fillColor: "#0a0f1c", fillOpacity: 0.15 };
  };

  const countyStyle = (feature?: Feature<Geometry>) => {
    if (!feature)
      return { color: "#1e293b", weight: 0.25, fillColor: "#0a0f1c", fillOpacity: 0.15 };
    const id = String(feature.id ?? "").padStart(5, "0");
    const stateAbbr = STATE_FIPS_TO_ABBR[id.slice(0, 2)];
    const countyName = (feature.properties?.NAME ??
      feature.properties?.name ??
      "Unknown") as string;
    return styleForCounty(countyName, stateAbbr);
  };

  const countyStatusKey = useMemo(
    () =>
      `${inProgress.size}-${completed.size}-${exhausted.size}-${
        Array.from(inProgress).sort().join(",") +
        "|" +
        Array.from(completed).sort().join(",") +
        "|" +
        Array.from(exhausted).sort().join(",")
      }`,
    [inProgress, completed, exhausted],
  );

  const onEachState = (feature: Feature<Geometry>, leafletLayer: import("leaflet").Layer) => {
    const fullName = (feature.properties?.name ?? "") as string;
    const abbr = stateNameToAbbr(fullName);
    // Disable interactivity on the locked state so clicks pass to counties.
    if (lockedState && abbr === lockedState) {
      const path = leafletLayer as L.Path;
      const elem = (path as L.Path & { _path?: SVGElement })._path;
      if (elem) elem.style.pointerEvents = "none";
      return;
    }
    leafletLayer.on({
      mouseover: () => setFocusState(abbr),
      mouseout: () => setFocusState(null),
      click: () => {
        setLockedState((prev) => {
          if (prev === abbr) {
            setZoomBounds(null);
            return null;
          }
          const layerWithBounds = leafletLayer as import("leaflet").Layer & {
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

  const onEachCounty = (
    feature: Feature<Geometry>,
    leafletLayer: import("leaflet").Layer,
  ) => {
    const id = String(feature.id ?? "").padStart(5, "0");
    const stateFips = id.slice(0, 2);
    const stateAbbr = STATE_FIPS_TO_ABBR[stateFips];
    const countyName = (feature.properties?.NAME ??
      feature.properties?.name ??
      "Unknown") as string;
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
        path.setStyle(styleForCounty(countyName, stateAbbr));
      },
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        if (!stateAbbr) return;
        setCountyTarget({ name: countyName, state: stateAbbr });
      },
    });
  };

  // Filter counties to the locked state when zoomed in.
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

  const runScout = async (
    city: string,
    state: string,
    audience: ItcAudience,
  ) => {
    const key = `${city}|${state}|${audience}`;
    setScoutStatus({ key, state: "running" });
    // Mark blue (in-progress) — universal AI-package map rule.
    setInProgress((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    const clearInProgress = () =>
      setInProgress((prev) => {
        if (!prev.has(key)) return prev;
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    try {
      const r = await fetch("/api/dashboard/itc-scrape", {
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
        setScoutStatus({ key, state: "error", message: j.error ?? "Scrape failed" });
        clearInProgress();
        return;
      }
      setScoutStatus({
        key,
        state: "done",
        message: `+${j.inserted ?? 0} new · ${j.skipped ?? 0} dup · ${j.found ?? 0} found`,
      });
      // Tile is exhausted (red ✕) if NOTHING new came in — Places
      // returned zero OR every result was already in the database.
      // "Found 14, inserted 0" reads as exhausted, not completed.
      const newValue = (j.inserted ?? 0) > 0;
      setExhausted((prev) => {
        const next = new Set(prev);
        if (!newValue) next.add(key);
        else next.delete(key);
        try {
          localStorage.setItem(
            "itc-map.exhausted",
            JSON.stringify(Array.from(next)),
          );
        } catch {
          // ignore
        }
        return next;
      });
      if (newValue) {
        // Mark green (completed) — actually surfaced new businesses.
        setCompleted((prev) => {
          const next = new Set(prev);
          next.add(key);
          try {
            localStorage.setItem(
              "itc-map.completed",
              JSON.stringify(Array.from(next)),
            );
          } catch {
            // ignore
          }
          return next;
        });
      } else {
        // Drop any prior green state so a re-run with all-dupes shows
        // only the red ✕, not both rings.
        setCompleted((prev) => {
          if (!prev.has(key)) return prev;
          const next = new Set(prev);
          next.delete(key);
          try {
            localStorage.setItem(
              "itc-map.completed",
              JSON.stringify(Array.from(next)),
            );
          } catch {
            // ignore
          }
          return next;
        });
      }
      clearInProgress();
      // Drop the staged amber ring so the green completed (or red ✕)
      // state becomes visible immediately.
      setStagedAudience((prev) => (prev === audience ? null : prev));
    } catch (err) {
      setScoutStatus({
        key,
        state: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
      clearInProgress();
      setStagedAudience((prev) => (prev === audience ? null : prev));
    }
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

          <ZoomController bounds={zoomBounds} />

          {/* Counties layer — toggleable. When a state is locked, only
              that state's counties render (perf + clarity). Each county
              is clickable to open the audience-picker drawer. */}
          {showCounties && visibleCounties && (
            <GeoJSON
              key={`counties-${lockedState ?? "us"}-${countyStatusKey}`}
              data={visibleCounties}
              style={countyStyle}
              onEachFeature={onEachCounty}
            />
          )}

          {/* State borders — focus highlight on hover */}
          {statesGeoJson && (
            <GeoJSON
              key={`states-${lockedState ?? "us"}`}
              data={statesGeoJson}
              style={stateStyle}
              onEachFeature={onEachState}
            />
          )}

          {/* Population-sized city bullets — clickable: opens audience-picker
              drawer to scout that city for tractor-customer leads. */}
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
                  fillOpacity: 0.45,
                }}
                eventHandlers={{
                  click: () => {
                    // Clicking a city is shorthand for scouting that
                    // city's county (uses the city name as the search
                    // target — Google Places matches both).
                    setCountyTarget({ name: c.name, state: c.state });
                  },
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
                    <div className="text-amber-300 italic mt-0.5">
                      Click to scout this market →
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

        {/* Prominent "Back to US" button when a state is locked */}
        {lockedState && (
          <button
            onClick={() => {
              setLockedState(null);
              setCountyTarget(null);
              setZoomBounds(null);
              setFocusState(null);
            }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs px-4 py-2 shadow-2xl border border-amber-300"
          >
            ← Back to US · {stateAbbrToName(lockedState)}
          </button>
        )}

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
        {!countyTarget &&
          (layer === "tym" ||
            layer === "foresters" ||
            layer === "hunters" ||
            layer === "hobbyists") && (
            <div className="absolute top-3 right-3 z-[1000] rounded-xl bg-amber-950/80 border border-amber-500/40 backdrop-blur px-3 py-2 shadow-2xl text-[10px] text-amber-200 max-w-[240px]">
              <p className="font-bold mb-0.5">
                {activeLayer?.emoji} {activeLayer?.label} layer queued
              </p>
              <p>
                Concrete data source needs to be wired. See us-major-cities.json
                + itc-verified-pins.json for the current verified set.
              </p>
            </div>
          )}

        {/* County scout drawer — opens when a county is clicked. Five
             ITC audience buttons (dealer / TYM / forester / hunter /
             hobbyist) each fire a Google Places scrape mapped to the
             existing tekky-scrape pipeline. */}
        {countyTarget && (
          <div className="absolute top-3 right-3 z-[1000] rounded-xl bg-slate-900/95 border border-amber-500/40 backdrop-blur p-3 shadow-2xl w-[270px]">
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
                onClick={() => {
                  setCountyTarget(null);
                  setStagedAudience(null);
                }}
                className="text-slate-400 hover:text-white text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">
              Pick an audience, then hit Run. Google Places searches the
              county; matches land in your Leads tab.
            </p>
            {/* Universal AI-package map legend */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-2 text-[9px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-blue-500 ring-1 ring-blue-400" />
                In progress
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-green-500/80 ring-1 ring-green-500" />
                Completed
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="text-rose-500 font-black">✕</span>
                No results
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {(["dealer", "tym", "forester", "hunter", "hobbyist"] as ItcAudience[]).map(
                (aud) => {
                  const meta = ITC_AUDIENCE_META[aud];
                  const k = `${countyTarget.name}|${countyTarget.state}|${aud}`;
                  const isRunning =
                    (scoutStatus?.key === k && scoutStatus.state === "running") ||
                    inProgress.has(k);
                  const isExhausted = exhausted.has(k);
                  const isCompleted = completed.has(k);
                  const isStaged = stagedAudience === aud;
                  // Universal status ring — running wins over staged so
                  // blue is visible during the actual scrape. Matches
                  // tekky-map exactly.
                  const ringClass = isRunning
                    ? "border-blue-400 bg-blue-500/25 ring-2 ring-blue-400 animate-pulse"
                    : isStaged
                      ? "border-amber-400 bg-amber-500/15 ring-1 ring-amber-400"
                      : isCompleted
                        ? "border-green-500 bg-green-500/10 ring-1 ring-green-500/50"
                        : "border-slate-700 hover:border-amber-400";
                  return (
                    <button
                      key={aud}
                      onClick={() => setStagedAudience(aud)}
                      disabled={isRunning}
                      title={
                        isRunning
                          ? `Scouting ${meta.label.toLowerCase()} now…`
                          : isCompleted
                            ? `${meta.label} — already scouted (re-run to refresh)`
                            : isExhausted
                              ? `${meta.label} — last scrape exhausted`
                              : meta.label
                      }
                      className={`relative text-[10px] font-bold rounded-md py-1.5 border transition disabled:opacity-50 flex flex-col items-center ${ringClass}`}
                      style={{ color: meta.color }}
                    >
                      <span className="text-base">{meta.emoji}</span>
                      <span className="text-[9px]">
                        {isRunning ? "…" : meta.label}
                      </span>
                      {isCompleted && !isRunning && !isExhausted && (
                        <span
                          aria-hidden
                          className="absolute top-0.5 right-0.5 text-green-400 text-[9px] leading-none"
                        >
                          ✓
                        </span>
                      )}
                      {isExhausted && (
                        <span
                          aria-label="Resource exhausted"
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <span className="text-rose-500 text-2xl font-black drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
                            ✕
                          </span>
                        </span>
                      )}
                    </button>
                  );
                },
              )}
            </div>

            {/* Green Run button — fires the scrape against the staged
                 audience. Disabled until an audience is selected. */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-slate-400">
                {stagedAudience
                  ? `Ready: ${ITC_AUDIENCE_META[stagedAudience].label}`
                  : "Select an audience"}
              </span>
              <div className="flex-1" />
              <button
                onClick={() => {
                  if (!stagedAudience) return;
                  runScout(countyTarget.name, countyTarget.state, stagedAudience);
                }}
                disabled={
                  !stagedAudience ||
                  (scoutStatus?.state === "running" &&
                    scoutStatus.key ===
                      `${countyTarget.name}|${countyTarget.state}|${stagedAudience}`)
                }
                className="text-[10px] font-black uppercase tracking-wider rounded-md px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ▶ Run
              </button>
            </div>
            {scoutStatus &&
              scoutStatus.key.startsWith(
                `${countyTarget.name}|${countyTarget.state}|`,
              ) && (
                <div
                  className={`mt-2 text-[10px] ${
                    scoutStatus.state === "error"
                      ? "text-rose-400"
                      : scoutStatus.state === "done"
                        ? "text-emerald-400"
                        : "text-slate-400"
                  }`}
                >
                  {scoutStatus.message ?? "running…"}
                </div>
              )}
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
