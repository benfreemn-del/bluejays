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
import mlsNextClubsData from "@/data/us-mls-next-clubs.json";
import uslClubsData from "@/data/us-usl-clubs.json";
import ecnlClubsData from "@/data/us-ecnl-clubs.json";
import ncaaSoccerData from "@/data/us-ncaa-soccer.json";
import rclClubsData from "@/data/us-rcl-clubs.json";

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

type MlsNextClub = {
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
};

type UslClub = MlsNextClub & {
  league: "USLC" | "USL1";
};

type EcnlClub = MlsNextClub & {
  /** "boys" | "girls" | "both" — drives icon color */
  division: "boys" | "girls" | "both";
};

type NcaaSchool = MlsNextClub & {
  /** Which D1 sides the school fields. */
  divisions: Array<"mens" | "womens">;
};

type RclClub = MlsNextClub & {
  /** "full" RCL members vs "provisional" — different visual weight */
  membership: "full" | "provisional";
};

type MapLayer = "all" | "mls" | "next" | "usl" | "ecnl" | "ncaa" | "rcl" | "cities";

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
  { id: "next", label: "MLS NEXT clubs", emoji: "🏆" },
  { id: "usl", label: "USL Champ + League One", emoji: "🥈" },
  { id: "ecnl", label: "ECNL clubs (youth)", emoji: "🥇" },
  { id: "ncaa", label: "NCAA D1 soccer", emoji: "🎓" },
  { id: "rcl", label: "RCL Select (WA)", emoji: "🌲" },
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
  // Audiences the user has staged in the drawer (multi-select). Click
  // an audience tile → toggle. Click the green Run button → fires
  // sequentially through every staged audience for the focused county.
  const [stagedAudiences, setStagedAudiences] = useState<Set<TekkyAudience>>(
    new Set(),
  );
  const toggleStaged = (aud: TekkyAudience) => {
    setStagedAudiences((prev) => {
      const next = new Set(prev);
      if (next.has(aud)) next.delete(aud);
      else next.add(aud);
      return next;
    });
  };
  // Set of "city|state|audience" keys that returned 0 results last
  // time we tried — show a red X over those tiles. Persisted to
  // localStorage so the indicator survives page reloads.
  const [exhausted, setExhausted] = useState<Set<string>>(new Set());
  // ── Universal AI-package map state ─────────────────────────────
  //  inProgress = blue ring while a scout is actively scraping
  //  completed  = green ring once the tile has been successfully scouted
  //  Both are county×audience-keyed and follow the same pattern as
  //  exhausted; completed persists so the owner sees their progress
  //  across sessions.
  const [inProgress, setInProgress] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // Hydrate exhausted + completed sets from localStorage once on mount.
  // inProgress is intentionally ephemeral — an in-flight request that
  // didn't actually finish shouldn't survive a reload.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tekky-map.exhausted");
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        if (Array.isArray(arr)) setExhausted(new Set(arr));
      }
      const rawDone = localStorage.getItem("tekky-map.completed");
      if (rawDone) {
        const arr = JSON.parse(rawDone) as string[];
        if (Array.isArray(arr)) setCompleted(new Set(arr));
      }
    } catch {
      // ignore
    }
  }, []);
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
    // Mark blue (in-progress) for the universal map rule.
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
        clearInProgress();
        return;
      }
      setScrapeStatus({
        key,
        state: "done",
        message: `+${j.inserted ?? 0} new · ${j.skipped ?? 0} dup · ${j.found ?? 0} found`,
      });
      // Tile is "exhausted" (red ✕) if NOTHING new came in — either
      // Places returned zero, or every result was already in the
      // database (all dupes). The owner cares about "did this scout
      // surface any new value?", not "did Google return anything".
      const noNewValue = (j.inserted ?? 0) === 0;
      if (noNewValue) {
        setExhausted((prev) => {
          const next = new Set(prev);
          next.add(key);
          try {
            localStorage.setItem(
              "tekky-map.exhausted",
              JSON.stringify(Array.from(next)),
            );
          } catch {
            // ignore
          }
          return next;
        });
        // If this tile was previously green-completed, drop that — a
        // re-run that yields nothing new should read as exhausted, not
        // doubly-decorated.
        setCompleted((prev) => {
          if (!prev.has(key)) return prev;
          const next = new Set(prev);
          next.delete(key);
          try {
            localStorage.setItem(
              "tekky-map.completed",
              JSON.stringify(Array.from(next)),
            );
          } catch {
            // ignore
          }
          return next;
        });
      } else {
        // Found results → make sure this tile isn't stale-marked exhausted.
        setExhausted((prev) => {
          if (!prev.has(key)) return prev;
          const next = new Set(prev);
          next.delete(key);
          try {
            localStorage.setItem(
              "tekky-map.exhausted",
              JSON.stringify(Array.from(next)),
            );
          } catch {
            // ignore
          }
          return next;
        });
        // Mark green (completed) — universal map rule.
        setCompleted((prev) => {
          const next = new Set(prev);
          next.add(key);
          try {
            localStorage.setItem(
              "tekky-map.completed",
              JSON.stringify(Array.from(next)),
            );
          } catch {
            // ignore
          }
          return next;
        });
      }
      clearInProgress();
      // Drop the "primed/staged" amber ring for THIS audience once it
      // finishes so the green/red completion state is visible.
      setStagedAudiences((prev) => {
        if (!prev.has(audience)) return prev;
        const next = new Set(prev);
        next.delete(audience);
        return next;
      });
      refreshSummary();
    } catch (err) {
      setScrapeStatus({
        key,
        state: "error",
        message: err instanceof Error ? err.message : "Network error",
      });
      clearInProgress();
      setStagedAudiences((prev) => {
        if (!prev.has(audience)) return prev;
        const next = new Set(prev);
        next.delete(audience);
        return next;
      });
    }
  };

  /** Run all currently-staged audiences sequentially against a county. */
  const runAllStaged = async (city: string, state: string) => {
    // Snapshot the staged set so concurrent toggles during the run
    // don't change what fires.
    const queue = Array.from(stagedAudiences);
    for (const aud of queue) {
      // eslint-disable-next-line no-await-in-loop
      await runScrape(city, state, aud);
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
  const nextClubs = (mlsNextClubsData.clubs as MlsNextClub[]) ?? [];
  const uslClubs: UslClub[] = [
    ...((uslClubsData.championship as UslClub[]) ?? []),
    ...((uslClubsData.league_one as UslClub[]) ?? []),
  ];
  const ecnlClubs = (ecnlClubsData.clubs as EcnlClub[]) ?? [];
  const ncaaSchools = (ncaaSoccerData.schools as NcaaSchool[]) ?? [];
  const rclClubs = (rclClubsData.clubs as RclClub[]) ?? [];

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
  const showNext = layer === "all" || layer === "next";
  const showUsl = layer === "all" || layer === "usl";
  const showEcnl = layer === "all" || layer === "ecnl";
  const showNcaa = layer === "all" || layer === "ncaa";
  const showRcl = layer === "all" || layer === "rcl";

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

  // Aggregate the three status sets to a per-county verdict so the
  // county polygon itself shows blue/green/red — not just the audience
  // tile in the drawer. Priority: in-progress > completed > exhausted.
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
      // Priority order — never downgrade.
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
    // Selected county wins over status — keep it amber while the drawer
    // is open so the user always knows which county they're scouting.
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
    if (!stateAbbr) {
      return {
        color: "#475569",
        weight: 0.8,
        fillColor: "#0a0f1c",
        fillOpacity: 0.1,
      };
    }
    const status = countyStatus.get(`${countyName}|${stateAbbr}`);
    if (status === "in-progress") {
      return {
        color: "#3b82f6",
        weight: 1.5,
        fillColor: "#3b82f6",
        fillOpacity: 0.32,
      };
    }
    if (status === "completed") {
      return {
        color: "#22c55e",
        weight: 1,
        fillColor: "#22c55e",
        fillOpacity: 0.22,
      };
    }
    if (status === "exhausted") {
      return {
        color: "#ef4444",
        weight: 0.6,
        fillColor: "#ef4444",
        fillOpacity: 0.12,
      };
    }
    return {
      color: "#475569",
      weight: 0.8,
      fillColor: "#0a0f1c",
      fillOpacity: 0.1,
    };
  };

  const countyStyle = (feature?: Feature<Geometry>) => {
    if (!feature)
      return { color: "#475569", weight: 0.8, fillColor: "#0a0f1c", fillOpacity: 0.1 };
    const id = String(feature.id ?? "").padStart(5, "0");
    const stateAbbr = STATE_FIPS_TO_ABBR[id.slice(0, 2)];
    const countyName = (feature.properties?.NAME ??
      feature.properties?.name ??
      "Unknown") as string;
    return styleForCounty(countyName, stateAbbr);
  };

  // Hash the status sets so the GeoJSON layer remounts (and re-applies
  // the new fill colors) every time a tile transitions state.
  const countyStatusKey = useMemo(
    () =>
      `${inProgress.size}-${completed.size}-${exhausted.size}-${
        countyTarget ? `${countyTarget.name}|${countyTarget.state}` : "none"
      }-${
        Array.from(inProgress).sort().join(",") +
        "|" +
        Array.from(completed).sort().join(",") +
        "|" +
        Array.from(exhausted).sort().join(",")
      }`,
    [inProgress, completed, exhausted, countyTarget],
  );

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
        path.setStyle(styleForCounty(countyName, stateAbbr));
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

          {/* USL Championship + League One — sky-blue bullets.
               24 + 13 = 37 pro clubs. Different from MLS NEXT
               (youth dev) — these are second-tier pro markets. */}
          {showUsl &&
            uslClubs.map((c, i) => (
              <CircleMarker
                key={`usl-${c.name}-${i}`}
                center={[c.lat, c.lng]}
                radius={c.league === "USLC" ? 7 : 5}
                pathOptions={{
                  color: c.league === "USLC" ? "#0ea5e9" : "#38bdf8",
                  weight: 1.2,
                  fillColor: c.league === "USLC" ? "#0284c7" : "#0ea5e9",
                  fillOpacity: 0.85,
                }}
              >
                <Tooltip direction="top" offset={[0, -4]} opacity={0.95}>
                  <div className="text-xs max-w-[260px]">
                    <div className="font-bold text-sky-300">
                      🥈 {c.name}
                    </div>
                    <div className="text-slate-300 mb-0.5">
                      {c.city}, {c.state}
                    </div>
                    <div className="text-[10px] text-slate-500 italic">
                      {c.league === "USLC" ? "USL Championship (D2)" : "USL League One (D3)"} · Source: uslchampionship.com
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}

          {/* MLS NEXT clubs — smaller emerald bullets to differentiate
               from the gold MLS host cities. Many cluster around the
               same metro (LA has 4+, Orlando has 3) so we use small
               radii to avoid crowding. */}
          {showNext &&
            nextClubs.map((c, i) => (
              <CircleMarker
                key={`next-${c.name}-${i}`}
                center={[c.lat, c.lng]}
                radius={5}
                pathOptions={{
                  color: "#10b981",
                  weight: 1,
                  fillColor: "#34d399",
                  fillOpacity: 0.85,
                }}
              >
                <Tooltip direction="top" offset={[0, -4]} opacity={0.95}>
                  <div className="text-xs max-w-[260px]">
                    <div className="font-bold text-emerald-400">
                      🏆 {c.name}
                    </div>
                    <div className="text-slate-300 mb-0.5">
                      {c.city}, {c.state}
                    </div>
                    <div className="text-[10px] text-slate-500 italic">
                      MLS NEXT Homegrown Division · Source: mlssoccer.com
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}

          {/* ECNL clubs (Elite Clubs National League) — youth tier ABOVE
               MLS NEXT for many regions. Highest TEKKY-LTV audience.
               Pink/violet bullets to differentiate from emerald (NEXT)
               and sky-blue (USL). Boys vs Girls vs Both → icon variant. */}
          {showEcnl &&
            ecnlClubs.map((c, i) => {
              const color =
                c.division === "girls"
                  ? "#ec4899" // pink-500
                  : c.division === "boys"
                    ? "#a855f7" // purple-500
                    : "#d946ef"; // fuchsia-500 for "both"
              return (
                <CircleMarker
                  key={`ecnl-${c.name}-${i}`}
                  center={[c.lat, c.lng]}
                  radius={4.5}
                  pathOptions={{
                    color,
                    weight: 1,
                    fillColor: color,
                    fillOpacity: 0.8,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -4]} opacity={0.95}>
                    <div className="text-xs max-w-[260px]">
                      <div className="font-bold text-pink-300">🥇 {c.name}</div>
                      <div className="text-slate-300 mb-0.5">
                        {c.city}, {c.state}
                      </div>
                      <div className="text-[10px] text-slate-500 italic">
                        ECNL{" "}
                        {c.division === "both"
                          ? "Boys + Girls"
                          : c.division === "girls"
                            ? "Girls"
                            : "Boys"}{" "}
                        · Source: theecnl.com (verified subset)
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}

          {/* NCAA D1 soccer programs — 240 schools (men's + women's
               combined). Indigo/navy bullets to convey academic /
               institutional and stay distinct from emerald (NEXT),
               sky (USL), pink (ECNL), gold (MLS). Small radius (3.5px)
               so the dense northeast / mid-atlantic clusters don't
               turn the map into a smear. */}
          {showNcaa &&
            ncaaSchools.map((s, i) => {
              const both = s.divisions.length > 1;
              return (
                <CircleMarker
                  key={`ncaa-${s.name}-${i}`}
                  center={[s.lat, s.lng]}
                  radius={both ? 4 : 3.5}
                  pathOptions={{
                    color: "#4f46e5",
                    weight: 1,
                    fillColor: both ? "#6366f1" : "#818cf8",
                    fillOpacity: 0.8,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -4]} opacity={0.95}>
                    <div className="text-xs max-w-[260px]">
                      <div className="font-bold text-indigo-300">
                        🎓 {s.name}
                      </div>
                      <div className="text-slate-300 mb-0.5">
                        {s.city}, {s.state}
                      </div>
                      <div className="text-[10px] text-slate-500 italic">
                        NCAA D1 ·{" "}
                        {s.divisions.includes("mens") &&
                        s.divisions.includes("womens")
                          ? "Men's + Women's"
                          : s.divisions.includes("mens")
                            ? "Men's only"
                            : "Women's only"}{" "}
                        · Source: ncaa.com / Wikipedia
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}

          {/* RCL Select (Washington Youth Soccer · Regional Club League)
               — competitive Select-tier youth clubs, below MLS NEXT and
               ECNL but above rec. WA-only currently. Teal pins to keep
               distinct from emerald (NEXT) / pink (ECNL) / indigo (NCAA). */}
          {showRcl &&
            rclClubs.map((c, i) => {
              const isFull = c.membership === "full";
              return (
                <CircleMarker
                  key={`rcl-${c.name}-${i}`}
                  center={[c.lat, c.lng]}
                  radius={isFull ? 5 : 4}
                  pathOptions={{
                    color: "#14b8a6",
                    weight: isFull ? 1.2 : 1,
                    fillColor: isFull ? "#14b8a6" : "#5eead4",
                    fillOpacity: isFull ? 0.85 : 0.65,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -4]} opacity={0.95}>
                    <div className="text-xs max-w-[260px]">
                      <div className="font-bold text-teal-300">🌲 {c.name}</div>
                      <div className="text-slate-300 mb-0.5">
                        {c.city}, {c.state}
                      </div>
                      <div className="text-[10px] text-slate-500 italic">
                        RCL Select ·{" "}
                        {isFull ? "Full member" : "Provisional"} · Source:
                        washingtonyouthsoccer.org
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
                width: 10,
                height: 10,
                background: "#34d399",
              }}
            />
            <span className="text-slate-300">MLS NEXT club ({nextClubs.length} verified)</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block rounded-full"
              style={{
                width: 10,
                height: 10,
                background: "#0284c7",
              }}
            />
            <span className="text-slate-300">USL Champ + League One ({uslClubs.length})</span>
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
                onClick={() => {
                  setCountyTarget(null);
                  setStagedAudiences(new Set());
                }}
                className="text-slate-400 hover:text-white text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">
              Tap any combination of audiences, then hit Run. Each one
              fires a Google Places search across the county; matches
              land in the Leads tab tagged by audience.
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
            {/* Quick-select shortcut — "all 3" is the most common ask. */}
            <div className="flex items-center justify-between mb-1.5">
              <button
                type="button"
                onClick={() => {
                  const all: TekkyAudience[] = ["parent", "coach", "player"];
                  const allStaged = all.every((a) => stagedAudiences.has(a));
                  setStagedAudiences(allStaged ? new Set() : new Set(all));
                }}
                className="text-[9px] uppercase tracking-wider font-bold text-amber-300 hover:text-amber-200"
              >
                {(["parent", "coach", "player"] as TekkyAudience[]).every((a) =>
                  stagedAudiences.has(a),
                )
                  ? "Clear all"
                  : "Stage all 3"}
              </button>
              <span className="text-[9px] text-slate-500">
                {stagedAudiences.size} staged
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(["parent", "coach", "player"] as TekkyAudience[]).map((aud) => {
                const meta = AUDIENCE_META[aud];
                const k = `${countyTarget.name}|${countyTarget.state}|${aud}`;
                const isRunning =
                  (scrapeStatus?.key === k && scrapeStatus.state === "running") ||
                  inProgress.has(k);
                const isExhausted = exhausted.has(k);
                const isCompleted = completed.has(k);
                const isStaged = stagedAudiences.has(aud);
                // ── Universal AI-package status ring ─────────────────
                //  running: blue-500   (in progress — wins over staging)
                //  staged:  amber      (primed/ready)
                //  done:    green-500  (already completed)
                //  default: slate-700
                const ringClass = isRunning
                  ? "border-blue-400 bg-blue-500/25 ring-2 ring-blue-400 animate-pulse"
                  : isStaged
                    ? "border-amber-400 bg-amber-500/15 ring-2 ring-amber-400"
                    : isCompleted
                      ? "border-green-500 bg-green-500/10 ring-1 ring-green-500/50"
                      : "border-slate-700 hover:border-amber-400";
                return (
                  <button
                    key={aud}
                    onClick={() => toggleStaged(aud)}
                    disabled={isRunning}
                    title={
                      isRunning
                        ? `Scouting ${meta.label.toLowerCase()} now…`
                        : isStaged
                          ? `${meta.label} — staged · click to remove`
                          : isCompleted
                            ? `${meta.label} — already scouted (re-run to refresh)`
                            : `Stage ${meta.label.toLowerCase()}`
                    }
                    className={`relative text-[11px] font-bold rounded-md px-2 py-2 border transition disabled:opacity-50 flex flex-col items-center gap-0.5 ${ringClass}`}
                    style={{ color: meta.color }}
                  >
                    {/* Checkbox indicator (top-left) when staged */}
                    {isStaged && !isRunning && (
                      <span
                        aria-hidden
                        className="absolute top-0.5 left-0.5 w-3 h-3 rounded-sm bg-amber-400 text-slate-950 text-[9px] font-black leading-none flex items-center justify-center"
                      >
                        ✓
                      </span>
                    )}
                    <span>{meta.emoji}</span>
                    <span>{isRunning ? "…" : meta.label}</span>
                    {isCompleted && !isRunning && !isExhausted && !isStaged && (
                      <span
                        aria-hidden
                        title="Already scouted"
                        className="absolute top-0.5 right-0.5 text-green-400 text-[10px] leading-none"
                      >
                        ✓
                      </span>
                    )}
                    {isExhausted && (
                      <span
                        aria-label="Resource exhausted"
                        title="Last scrape returned no new results"
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <span className="text-rose-500 text-3xl font-black drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
                          ✕
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Green Run button — fires the scrape against ALL staged
                 audiences sequentially. Disabled until at least one is
                 picked. Shows count when 2+. */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-slate-400">
                {stagedAudiences.size === 0
                  ? "Select audience(s)"
                  : stagedAudiences.size === 1
                    ? `Ready: ${AUDIENCE_META[Array.from(stagedAudiences)[0]!].label}`
                    : `Ready: ${stagedAudiences.size} audiences`}
              </span>
              <div className="flex-1" />
              <button
                onClick={() => {
                  if (stagedAudiences.size === 0) return;
                  runAllStaged(countyTarget.name, countyTarget.state);
                }}
                disabled={stagedAudiences.size === 0 || inProgress.size > 0}
                className="text-[11px] font-black uppercase tracking-wider rounded-md px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ▶ Run
                {stagedAudiences.size > 1 ? ` ×${stagedAudiences.size}` : ""}
              </button>
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
