"use client";

/**
 * BlueJays scout map — react-leaflet rewrite (2026-05-06).
 *
 * Visual + UX cloned from the Tekky map at
 * `src/app/dashboard/tekky-map/map.client.tsx` per Ben 2026-05-06
 * ("update the bluejay map to look like the zenith map"). Adapted for
 * BlueJays admin scope:
 *   - Uses /api/scout (city + category + pageToken) — preserves the
 *     existing scout flow and dropdown contract.
 *   - 47-category scout dropdown lives in the right-rail drawer when a
 *     county is clicked (was the bottom panel in v1).
 *   - Universal scout-state ring (blue=in-progress / green=completed /
 *     red ✕=exhausted) per Tekky map rule. Persists across reloads
 *     via `localStorage` key `bluejays-map.{exhausted,completed}`.
 *   - Prospect-aware fill on counties (4-color scheme PRESERVED from
 *     the v1 SVG map) so the "fully scouted vs has-contacts vs scouted"
 *     coverage view is still legible at a glance.
 *
 * BlueJays color rules honored:
 *   - Sky-blue accent (#0ea5e9 / #38bdf8) for active state hover + CTAs
 *   - Dark slate base (`#020617` map bg, `#0f172a` state fill)
 *   - The 4 prospect-status colors stay the same as v1: dark-slate
 *     untouched, red `#7f1d1d` scouted, blue `#1e3a5f` contacted,
 *     emerald `#166534` fully-scouted.
 *
 * Static `import` is fine because this file is consumed from
 * `src/app/dashboard/page.tsx` which is already a `"use client"` page.
 * Leaflet's window-only globals don't run at module-eval time so
 * Next.js SSR doesn't choke. (Tekky's map.client.tsx is wrapped in
 * `dynamic(..., { ssr: false })` from a server-rendered page; this one
 * doesn't need that.)
 */

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Layer } from "leaflet";
import type { Prospect, Category } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";

interface MapViewProps {
  prospects: Prospect[];
  onStateClick: (state: string) => void;
}

// ────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────

const STATES_GEOJSON_URL =
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";
const COUNTIES_GEOJSON_URL =
  "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json";

/** First two digits of a county FIPS = state FIPS. */
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

const STATE_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO",
  Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH",
  Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
  "District of Columbia": "DC",
};

const STATE_NAMES_FULL: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBR).map(([name, abbr]) => [abbr, name]),
);

const TOTAL_CATEGORIES = Object.keys(CATEGORY_CONFIG).length;

function stateNameToAbbr(name: string): string | null {
  return STATE_ABBR[name] ?? null;
}

/** Parse "King, WA" → { county: "King", state: "WA" }. */
function parseCity(city: string): { county: string; state: string | null } {
  const m = city.match(/^(.+),\s*([A-Z]{2})$/);
  if (m) return { county: m[1].trim(), state: m[2] };
  return { county: city, state: null };
}

// ────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────────────

export default function MapView({ prospects, onStateClick }: MapViewProps) {
  // GeoJSON layers
  const [statesGeoJson, setStatesGeoJson] = useState<FeatureCollection | null>(null);
  const [countiesGeoJson, setCountiesGeoJson] = useState<FeatureCollection | null>(null);

  // Hover + lock state
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [lockedState, setLockedState] = useState<string | null>(null);
  const [zoomBounds, setZoomBounds] = useState<L.LatLngBounds | null>(null);

  // County target = currently-clicked county (opens scout drawer)
  const [countyTarget, setCountyTarget] = useState<{ name: string; state: string } | null>(null);

  // Scout drawer state
  const [scoutCategory, setScoutCategory] = useState<Category>("dental");
  const [scouting, setScouting] = useState(false);
  const [scoutResult, setScoutResult] = useState("");
  const [pageTokens, setPageTokens] = useState<Record<string, string>>({});

  // Universal scout-state sets — keyed by `${county}|${state}|${category}`.
  // Mirrors Tekky's pattern: blue ring during scrape, green when results
  // came in, red ✕ when nothing new. Persists in localStorage.
  const [inProgress, setInProgress] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [exhausted, setExhausted] = useState<Set<string>>(new Set());

  // Hydrate exhausted + completed from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bluejays-map.exhausted");
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        if (Array.isArray(arr)) setExhausted(new Set(arr));
      }
      const rawDone = localStorage.getItem("bluejays-map.completed");
      if (rawDone) {
        const arr = JSON.parse(rawDone) as string[];
        if (Array.isArray(arr)) setCompleted(new Set(arr));
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch GeoJSON once on mount
  useEffect(() => {
    let cancelled = false;
    fetch(STATES_GEOJSON_URL)
      .then((r) => r.json())
      .then((j: FeatureCollection) => {
        if (!cancelled) setStatesGeoJson(j);
      })
      .catch(() => {});
    fetch(COUNTIES_GEOJSON_URL)
      .then((r) => r.json())
      .then((j: FeatureCollection) => {
        if (!cancelled) setCountiesGeoJson(j);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Derived: prospect-aware state stats ────────────────────────────
  const stateData = useMemo(() => {
    const grouped: Record<string, { count: number; contacted: number }> = {};
    for (const p of prospects) {
      const s = p.state || "WA";
      if (!grouped[s]) grouped[s] = { count: 0, contacted: 0 };
      grouped[s].count++;
      if (p.status === "contacted" || p.status === "responded") grouped[s].contacted++;
    }
    return grouped;
  }, [prospects]);

  // ── Derived: prospect-aware county stats (county+state keyed) ──────
  const countyData = useMemo(() => {
    type Bucket = {
      count: number;
      hasContacted: boolean;
      categories: Set<string>;
      isFullyScouted: boolean;
    };
    const grouped: Record<string, Bucket> = {};
    for (const p of prospects) {
      const { county, state: cityState } = parseCity(p.city || "Unknown");
      const stateAbbr = cityState ?? p.state ?? "";
      if (!stateAbbr) continue;
      const key = `${county}|${stateAbbr}`;
      if (!grouped[key]) {
        grouped[key] = { count: 0, hasContacted: false, categories: new Set(), isFullyScouted: false };
      }
      grouped[key].count++;
      if (p.status === "contacted" || p.status === "responded") {
        grouped[key].hasContacted = true;
      }
      grouped[key].categories.add(p.category);
    }
    for (const v of Object.values(grouped)) {
      v.isFullyScouted = v.categories.size >= TOTAL_CATEGORIES;
    }
    return grouped;
  }, [prospects]);

  // ── Derived: counties filtered to the locked state ─────────────────
  const visibleCounties = useMemo(() => {
    if (!countiesGeoJson) return null;
    if (!lockedState) return countiesGeoJson;
    const targetFips = Object.entries(STATE_FIPS_TO_ABBR).find(
      ([, abbr]) => abbr === lockedState,
    )?.[0];
    if (!targetFips) return countiesGeoJson;
    return {
      ...countiesGeoJson,
      features: countiesGeoJson.features.filter((f) => {
        const id = String(f.id ?? "").padStart(5, "0");
        return id.slice(0, 2) === targetFips;
      }),
    } as FeatureCollection;
  }, [countiesGeoJson, lockedState]);

  // Hash the universal-status sets so the GeoJSON layer remounts
  // (and re-applies new fill colors) on every status transition.
  const countyStatusKey = useMemo(
    () =>
      `${inProgress.size}-${completed.size}-${exhausted.size}-${
        countyTarget ? `${countyTarget.name}|${countyTarget.state}` : "none"
      }-${prospects.length}-${
        Array.from(inProgress).sort().join(",") +
        "|" +
        Array.from(completed).sort().join(",") +
        "|" +
        Array.from(exhausted).sort().join(",")
      }`,
    [inProgress, completed, exhausted, countyTarget, prospects.length],
  );

  // ── Style functions ───────────────────────────────────────────────
  const styleForCounty = useCallback(
    (countyName: string, stateAbbr: string | undefined) => {
      // Selected (target) county = amber highlight
      if (
        countyTarget &&
        countyTarget.name === countyName &&
        countyTarget.state === stateAbbr
      ) {
        return {
          color: "#facc15",
          weight: 2.5,
          fillColor: "#facc15",
          fillOpacity: 0.32,
        };
      }

      // Universal scout-state — match against any-category for THIS county.
      // We're only previewing the rolled-up status here; the per-category
      // detail lives in the drawer.
      const prefix = `${countyName}|${stateAbbr}|`;
      let anyInProgress = false;
      for (const k of inProgress) {
        if (k.startsWith(prefix)) {
          anyInProgress = true;
          break;
        }
      }
      if (anyInProgress) {
        return {
          color: "#3b82f6",
          weight: 1.8,
          fillColor: "#3b82f6",
          fillOpacity: 0.32,
        };
      }

      // Prospect-aware fill — preserve v1 4-color semantics.
      const data = stateAbbr ? countyData[`${countyName}|${stateAbbr}`] : null;
      if (data && data.count > 0) {
        if (data.isFullyScouted) {
          return {
            color: "#22c55e",
            weight: 1.2,
            fillColor: "#166534",
            fillOpacity: 0.55,
          };
        }
        if (data.hasContacted) {
          return {
            color: "#3b82f6",
            weight: 1,
            fillColor: "#1e3a5f",
            fillOpacity: 0.55,
          };
        }
        return {
          color: "#ef4444",
          weight: 1,
          fillColor: "#7f1d1d",
          fillOpacity: 0.45,
        };
      }

      // No prospects — fall through to universal status (last-scrape outcome)
      let anyCompleted = false;
      let anyExhausted = false;
      for (const k of completed) {
        if (k.startsWith(prefix)) {
          anyCompleted = true;
          break;
        }
      }
      if (!anyCompleted) {
        for (const k of exhausted) {
          if (k.startsWith(prefix)) {
            anyExhausted = true;
            break;
          }
        }
      }
      if (anyCompleted) {
        return {
          color: "#22c55e",
          weight: 1,
          fillColor: "#22c55e",
          fillOpacity: 0.18,
        };
      }
      if (anyExhausted) {
        return {
          color: "#ef4444",
          weight: 0.6,
          fillColor: "#ef4444",
          fillOpacity: 0.1,
        };
      }
      return {
        color: "#475569",
        weight: 0.6,
        fillColor: "#0a0f1c",
        fillOpacity: 0.1,
      };
    },
    [countyTarget, inProgress, completed, exhausted, countyData],
  );

  const countyStyle = useCallback(
    (feature?: Feature<Geometry>) => {
      if (!feature)
        return { color: "#475569", weight: 0.6, fillColor: "#0a0f1c", fillOpacity: 0.1 };
      const id = String(feature.id ?? "").padStart(5, "0");
      const stateAbbr = STATE_FIPS_TO_ABBR[id.slice(0, 2)];
      const countyName = (feature.properties?.NAME ??
        feature.properties?.name ??
        "Unknown") as string;
      return styleForCounty(countyName, stateAbbr);
    },
    [styleForCounty],
  );

  const stateStyle = useCallback(
    (feature?: Feature<Geometry>) => {
      const name = (feature?.properties?.name ?? "") as string;
      const abbr = stateNameToAbbr(name);
      const isLocked = lockedState && abbr === lockedState;
      const isHovered = hoveredState && abbr === hoveredState;
      const data = abbr ? stateData[abbr] : null;

      if (isLocked) {
        // Locked state = transparent so click passes through to counties.
        return {
          color: "#0ea5e9",
          weight: 2,
          fillColor: "#0ea5e9",
          fillOpacity: 0.05,
        };
      }
      if (data && data.count > 0) {
        return {
          color: isHovered ? "#0ea5e9" : "#0369a1",
          weight: isHovered ? 1.8 : 0.9,
          fillColor: "#0c4a6e",
          fillOpacity: isHovered ? 0.45 : 0.28,
        };
      }
      return {
        color: isHovered ? "#facc15" : "#1e293b",
        weight: isHovered ? 1.5 : 0.5,
        fillColor: "#0f172a",
        fillOpacity: isHovered ? 0.35 : 0.2,
      };
    },
    [lockedState, hoveredState, stateData],
  );

  // ── Event handlers ────────────────────────────────────────────────
  const onEachState = useCallback(
    (feature: Feature<Geometry>, leafletLayer: Layer) => {
      const fullName = (feature.properties?.name ?? "") as string;
      const abbr = stateNameToAbbr(fullName);
      if (!abbr) return;

      // When this state is locked, disable interactivity so clicks pass
      // through to the county polygons beneath. Without this, clicks get
      // swallowed by the state polygon.
      const path = leafletLayer as L.Path & { _path?: SVGElement };
      if (lockedState && abbr === lockedState) {
        if (path._path) path._path.style.pointerEvents = "none";
        return;
      } else if (path._path) {
        path._path.style.pointerEvents = "";
      }

      leafletLayer.on({
        mouseover: () => setHoveredState(abbr),
        mouseout: () => setHoveredState(null),
        click: () => {
          setLockedState((prev) => {
            if (prev === abbr) {
              setZoomBounds(null);
              return null;
            }
            const polygonLayer = leafletLayer as L.Polygon;
            if (typeof polygonLayer.getBounds === "function") {
              setZoomBounds(polygonLayer.getBounds());
            }
            // Preserve v1 callback — opens the parent's ScoutModal.
            onStateClick(abbr);
            return abbr;
          });
        },
      });
    },
    [lockedState, onStateClick],
  );

  const onEachCounty = useCallback(
    (feature: Feature<Geometry>, leafletLayer: Layer) => {
      const id = String(feature.id ?? "").padStart(5, "0");
      const stateAbbr = STATE_FIPS_TO_ABBR[id.slice(0, 2)];
      const countyName = (feature.properties?.NAME ??
        feature.properties?.name ??
        "Unknown") as string;

      leafletLayer.on({
        mouseover: () => {
          const path = leafletLayer as L.Path;
          path.setStyle({
            color: "#facc15",
            weight: 1.8,
            fillColor: "#facc15",
            fillOpacity: 0.3,
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
          setScoutResult("");
        },
      });
    },
    [styleForCounty],
  );

  // ── Universal status helpers ──────────────────────────────────────
  const persistSet = (key: string, set: Set<string>) => {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch {
      // ignore
    }
  };

  const markExhausted = (key: string) => {
    setExhausted((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      persistSet("bluejays-map.exhausted", next);
      return next;
    });
    setCompleted((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      persistSet("bluejays-map.completed", next);
      return next;
    });
  };

  const markCompleted = (key: string) => {
    setCompleted((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      persistSet("bluejays-map.completed", next);
      return next;
    });
    setExhausted((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      persistSet("bluejays-map.exhausted", next);
      return next;
    });
  };

  // ── Scout fire (preserves v1 /api/scout contract) ────────────────
  const handleCountyScout = useCallback(async () => {
    if (!countyTarget) return;
    setScouting(true);
    setScoutResult("");
    const key = `${countyTarget.name}|${countyTarget.state}|${scoutCategory}`;
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
      const tokenKey = `${countyTarget.name}-${scoutCategory}`;
      const existingToken = pageTokens[tokenKey];
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: `${countyTarget.name}, ${countyTarget.state}`,
          category: scoutCategory,
          limit: 5,
          pageToken: existingToken || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.error || !res.ok) {
        markExhausted(key);
        const catLabel = CATEGORY_CONFIG[scoutCategory]?.label || scoutCategory;
        setScoutResult(`${catLabel} done for ${countyTarget.name}.`);
        return;
      }

      if (data.nextPageToken) {
        setPageTokens((prev) => ({ ...prev, [tokenKey]: data.nextPageToken }));
      } else {
        setPageTokens((prev) => {
          const n = { ...prev };
          delete n[tokenKey];
          return n;
        });
      }

      const newProspects = (data.prospects ?? []) as Array<{ id: string }>;
      if (newProspects.length === 0) {
        markExhausted(key);
        const catLabel = CATEGORY_CONFIG[scoutCategory]?.label || scoutCategory;
        setScoutResult(
          `No new ${catLabel} businesses in ${countyTarget.name}.`,
        );
      } else {
        // Generate sites for new prospects (v1 behavior)
        for (const p of newProspects) {
          await fetch(`/api/generate/${p.id}`, { method: "POST" }).catch(() => {});
        }
        markCompleted(key);
        setScoutResult(
          `Found ${newProspects.length} new businesses in ${countyTarget.name}!`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      markExhausted(key);
      setScoutResult(`Scrape error: ${msg}`);
    } finally {
      clearInProgress();
      setScouting(false);
    }
  }, [countyTarget, scoutCategory, pageTokens]);

  // Categories not yet exhausted for the focused county
  const availableCategories = useMemo(() => {
    if (!countyTarget) return Object.keys(CATEGORY_CONFIG) as Category[];
    return (Object.keys(CATEGORY_CONFIG) as Category[]).filter((cat) => {
      const k = `${countyTarget.name}|${countyTarget.state}|${cat}`;
      return !exhausted.has(k);
    });
  }, [countyTarget, exhausted]);

  // Auto-pick first available category if current is exhausted for this county
  const lastSwitchedCountyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!countyTarget) return;
    const id = `${countyTarget.name}|${countyTarget.state}`;
    if (id !== lastSwitchedCountyRef.current) {
      lastSwitchedCountyRef.current = id;
      if (
        availableCategories.length > 0 &&
        !availableCategories.includes(scoutCategory)
      ) {
        setScoutCategory(availableCategories[0]);
      }
    }
  }, [countyTarget, availableCategories, scoutCategory]);

  // Top states for sidebar (US view)
  const topStates = useMemo(() => {
    return Object.entries(stateData)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 12);
  }, [stateData]);

  // Counties hit in the locked state (sidebar count)
  const lockedStateCountiesHit = useMemo(() => {
    if (!lockedState) return 0;
    return Object.keys(countyData).filter((k) => k.endsWith(`|${lockedState}`)).length;
  }, [lockedState, countyData]);

  return (
    <div
      className="grid lg:grid-cols-[1fr_360px] gap-0 rounded-xl overflow-hidden border border-border bg-surface"
      style={{ height: "calc(100vh - 240px)", minHeight: "560px" }}
    >
      {/* MAP */}
      <div className="relative">
        <MapContainer
          center={[39.5, -97]}
          zoom={4}
          minZoom={3}
          maxZoom={11}
          scrollWheelZoom
          className="h-full w-full"
          style={{ background: "#020617" }}
          worldCopyJump={false}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <ZoomController bounds={zoomBounds} />

          {/* County overlay — filtered to the locked state when zoomed */}
          {visibleCounties && (
            <GeoJSON
              key={`counties-${lockedState ?? "us"}-${countyStatusKey}`}
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
        </MapContainer>

        {/* Hover label overlay — only when no state is locked */}
        {hoveredState && !lockedState && (
          <div className="absolute top-3 left-3 px-3 py-2 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-sky-500/30 pointer-events-none z-10">
            <div className="text-[10px] uppercase tracking-widest text-sky-400 font-bold">
              {STATE_NAMES_FULL[hoveredState] ?? hoveredState}
            </div>
            <div className="text-sm text-white">
              {(stateData[hoveredState]?.count ?? 0).toLocaleString()}{" "}
              prospect{stateData[hoveredState]?.count === 1 ? "" : "s"}
            </div>
          </div>
        )}

        {/* Status legend — bottom-left overlay */}
        <div className="absolute bottom-3 left-3 px-3 py-2 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-white/10 pointer-events-none z-10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/75">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-[#475569] bg-[#0a0f1c] inline-block" />
              Untouched
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-red-500 bg-[#7f1d1d] inline-block" />
              Scouted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-blue-500 bg-[#1e3a5f] inline-block" />
              Contacted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-green-500 bg-[#166534] inline-block" />
              Fully scouted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-400 bg-blue-500/30 inline-block" />
              Scouting…
            </span>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="bg-slate-950 border-l border-border overflow-y-auto">
        {!lockedState ? (
          <div className="p-5">
            <h3 className="text-lg font-bold text-white mb-1">United States</h3>
            <p className="text-xs text-slate-400 mb-4">
              Click any state on the map to drill down to counties + scout new
              leads.
            </p>

            {/* National stats */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-sky-400 font-bold">
                  Prospects
                </p>
                <p className="text-2xl font-black text-white tabular-nums">
                  {prospects.length.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                  Active states
                </p>
                <p className="text-2xl font-black text-white tabular-nums">
                  {Object.keys(stateData).length}
                </p>
              </div>
            </div>

            {/* Top states */}
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
              Top states · click to focus
            </p>
            <div className="space-y-1">
              {topStates.length === 0 && (
                <p className="text-xs text-slate-500 italic px-2">
                  No prospects yet — click any state on the map to start scouting.
                </p>
              )}
              {topStates.map(([abbr, d]) => (
                <button
                  key={abbr}
                  type="button"
                  onClick={() => {
                    setLockedState(abbr);
                    onStateClick(abbr);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-white/5 hover:border-sky-500/40 hover:bg-sky-500/10 transition-colors text-left"
                >
                  <span className="text-sm font-semibold text-white">
                    {STATE_NAMES_FULL[abbr] ?? abbr}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 tabular-nums">
                      {d.count.toLocaleString()}
                    </span>
                    <span className="text-sky-400">→</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5">
            <button
              type="button"
              onClick={() => {
                setLockedState(null);
                setZoomBounds(null);
                setCountyTarget(null);
                setScoutResult("");
              }}
              className="text-xs text-sky-400 hover:underline mb-3 inline-flex items-center gap-1"
            >
              ← Back to US
            </button>
            <h3 className="text-lg font-bold text-white mb-1">
              {STATE_NAMES_FULL[lockedState] ?? lockedState}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Click any county on the map to scout it.
            </p>

            {/* State stats */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-sky-400 font-bold">
                  Prospects in state
                </p>
                <p className="text-2xl font-black text-white tabular-nums">
                  {(stateData[lockedState]?.count ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                  Counties hit
                </p>
                <p className="text-2xl font-black text-white tabular-nums">
                  {lockedStateCountiesHit}
                </p>
              </div>
            </div>

            {/* Scout drawer (visible when a county is selected) */}
            {countyTarget ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="font-bold text-amber-200">
                    {countyTarget.name} County
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setCountyTarget(null);
                      setScoutResult("");
                    }}
                    className="text-slate-500 hover:text-white text-sm leading-none"
                    aria-label="Close county drawer"
                  >
                    ✕
                  </button>
                </div>
                {countyData[`${countyTarget.name}|${countyTarget.state}`] ? (
                  <p className="text-xs text-slate-300 mb-3">
                    {countyData[`${countyTarget.name}|${countyTarget.state}`].count}{" "}
                    prospect
                    {countyData[`${countyTarget.name}|${countyTarget.state}`]
                      .count === 1
                      ? ""
                      : "s"}{" "}
                    ·{" "}
                    <span
                      className={
                        countyData[
                          `${countyTarget.name}|${countyTarget.state}`
                        ].isFullyScouted
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }
                    >
                      {
                        countyData[
                          `${countyTarget.name}|${countyTarget.state}`
                        ].categories.size
                      }
                      /{TOTAL_CATEGORIES} categories
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mb-3">
                    No prospects yet — fire a scout!
                  </p>
                )}

                <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                  Category
                </label>
                <select
                  value={scoutCategory}
                  onChange={(e) => setScoutCategory(e.target.value as Category)}
                  className="w-full h-9 px-2 rounded-md bg-slate-900 border border-white/10 text-white text-sm mb-3"
                >
                  {availableCategories.length === 0 ? (
                    <option value="">All categories exhausted</option>
                  ) : (
                    availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_CONFIG[cat]?.label ?? cat}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  onClick={handleCountyScout}
                  disabled={scouting || availableCategories.length === 0}
                  className="w-full h-10 rounded-md bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold transition-colors"
                >
                  {scouting ? "Scouting…" : "Run Scout"}
                </button>
                {scoutResult && (
                  <p className="mt-3 text-xs text-sky-300 leading-relaxed">
                    {scoutResult}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic px-2 py-4">
                No county selected — click a county on the map to open the scout
                panel.
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
