"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Prospect, Category } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";

interface MapViewProps {
  prospects: Prospect[];
  onStateClick: (state: string) => void;
}

type ViewLevel = "us" | "county";

// GeoJSON Feature type
interface GeoFeature {
  type: string;
  properties: Record<string, string>;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJSON {
  type: string;
  features: GeoFeature[];
}

const US_STATES_GEOJSON_URL = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";
const ALL_COUNTIES_GEOJSON_URL = "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json";
// WA state FIPS code is 53
const WA_FIPS = "53";

export default function MapView({ prospects }: MapViewProps) {
  const [view, setView] = useState<ViewLevel>("us");
  const [selectedState, setSelectedState] = useState("");
  const [hoveredName, setHoveredName] = useState("");
  const [statesGeo, setStatesGeo] = useState<GeoJSON | null>(null);
  const [countiesGeo, setCountiesGeo] = useState<GeoJSON | null>(null);
  const [scoutCounty, setScoutCounty] = useState("");
  const [scoutCategory, setScoutCategory] = useState<Category>("dental");
  const [scouting, setScouting] = useState(false);
  const [scoutResult, setScoutResult] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Group prospects by state
  const stateData: Record<string, { count: number; hasPaid: boolean }> = {};
  for (const p of prospects) {
    const st = p.state || "WA";
    if (!stateData[st]) stateData[st] = { count: 0, hasPaid: false };
    stateData[st].count++;
    if (p.status === "paid") stateData[st].hasPaid = true;
  }

  // Group by city
  const countyData: Record<string, { count: number; hasPaid: boolean; categories: string[] }> = {};
  for (const p of prospects) {
    const c = p.city || "Unknown";
    if (!countyData[c]) countyData[c] = { count: 0, hasPaid: false, categories: [] };
    countyData[c].count++;
    if (p.status === "paid") countyData[c].hasPaid = true;
    if (!countyData[c].categories.includes(p.category)) countyData[c].categories.push(p.category);
  }

  // Load GeoJSON data
  useEffect(() => {
    fetch(US_STATES_GEOJSON_URL)
      .then((r) => r.json())
      .then(setStatesGeo)
      .catch(() => {});
  }, []);

  const getColor = useCallback((name: string, isState: boolean) => {
    if (isState) {
      // Match state name to abbreviation
      const abbr = STATE_ABBR[name];
      const d = abbr ? stateData[abbr] : null;
      if (!d) return "#1a2744";
      if (d.hasPaid) return "#166534";
      return "#92400e";
    } else {
      const d = countyData[name];
      if (!d) return "#1a2744";
      if (d.hasPaid) return "#166534";
      return "#92400e";
    }
  }, [stateData, countyData]);

  const getBorderColor = useCallback((name: string, isState: boolean) => {
    if (isState) {
      const abbr = STATE_ABBR[name];
      const d = abbr ? stateData[abbr] : null;
      if (!d) return "#334155";
      if (d.hasPaid) return "#22c55e";
      return "#f59e0b";
    } else {
      const d = countyData[name];
      if (!d) return "#334155";
      if (d.hasPaid) return "#22c55e";
      return "#f59e0b";
    }
  }, [stateData, countyData]);

  const handleStateClick = (stateName: string) => {
    const abbr = STATE_ABBR[stateName] || stateName;
    setSelectedState(abbr);
    setView("county");
    setScoutCounty("");
    setScoutResult("");

    if (!countiesGeo) {
      const fips = STATE_FIPS[abbr] || WA_FIPS;
      fetch(ALL_COUNTIES_GEOJSON_URL)
        .then((r) => r.json())
        .then((geo: GeoJSON) => {
          const filtered = {
            ...geo,
            features: geo.features.filter(
              (f) => f.properties.STATE === fips
            ),
          };
          setCountiesGeo(filtered);
        })
        .catch(() => {});
    }
  };

  const handleCountyScout = async () => {
    if (!scoutCounty) return;
    setScouting(true);
    setScoutResult("");
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: `${scoutCounty}, ${selectedState}`, category: scoutCategory, limit: 5 }),
      });
      const data = await res.json();
      for (const p of data.prospects) {
        await fetch(`/api/generate/${p.id}`, { method: "POST" });
      }
      setScoutResult(`Found ${data.prospects.length} businesses in ${scoutCounty}! Switch to Table View to manage them.`);
      onStateClick(selectedState); // trigger parent refresh
    } catch {
      setScoutResult("Error running scout.");
    } finally {
      setScouting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {view === "county" && (
            <button
              onClick={() => { setView("us"); setSelectedState(""); setScoutCounty(""); setScoutResult(""); }}
              className="text-sm text-blue-electric hover:underline"
            >
              &larr; Back to US
            </button>
          )}
          <h3 className="font-semibold">
            {view === "us" ? "United States" : `${STATE_NAMES_FULL[selectedState] || selectedState} Counties`}
          </h3>
          {hoveredName && (
            <span className="text-sm text-muted ml-2">
              {hoveredName}
              {view === "us" && stateData[STATE_ABBR[hoveredName]] && (
                <span className="text-blue-electric ml-1">({stateData[STATE_ABBR[hoveredName]].count} prospects)</span>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-[#334155] bg-[#1a2744] inline-block" /> Not Started
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-amber-500 bg-[#92400e] inline-block" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-green-500 bg-[#166534] inline-block" /> Completed
          </span>
        </div>
      </div>

      {/* US Map with real GeoJSON */}
      {view === "us" && statesGeo && (
        <svg viewBox="-130 -50 65 26" className="w-full h-auto" style={{ maxHeight: "500px" }}>
          {statesGeo.features.map((feature, i) => {
            const name = feature.properties.name;
            const fillColor = getColor(name, true);
            const strokeColor = getBorderColor(name, true);
            const isHovered = hoveredName === name;

            return (
              <g key={i}>
                {renderGeoPath(feature).map((path, pi) => (
                  <path
                    key={pi}
                    d={path}
                    fill={isHovered ? lighten(fillColor) : fillColor}
                    stroke={isHovered ? "#fff" : strokeColor}
                    strokeWidth={isHovered ? 0.15 : 0.05}
                    className="cursor-pointer transition-colors duration-150"
                    onMouseEnter={() => setHoveredName(name)}
                    onMouseLeave={() => setHoveredName("")}
                    onClick={() => handleStateClick(name)}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      )}

      {/* Loading state */}
      {view === "us" && !statesGeo && (
        <div className="py-20 text-center text-muted">Loading map data...</div>
      )}

      {/* County View */}
      {view === "county" && countiesGeo && countiesGeo.features.length > 0 && (
        <div>
          <svg viewBox={getCountyViewBox(countiesGeo)} className="w-full h-auto mb-4" style={{ maxHeight: "400px" }}>
            {countiesGeo.features.map((feature, i) => {
              const name = feature.properties.NAME || feature.properties.name || `County ${i}`;
              const fillColor = getColor(name, false);
              const strokeColor = getBorderColor(name, false);
              const isHovered = hoveredName === name;
              const isSelected = scoutCounty === name;

              return (
                <g key={i}>
                  {renderGeoPath(feature).map((path, pi) => (
                    <path
                      key={pi}
                      d={path}
                      fill={isSelected ? "#1e40af" : isHovered ? lighten(fillColor) : fillColor}
                      stroke={isSelected ? "#3b82f6" : isHovered ? "#fff" : strokeColor}
                      strokeWidth={isSelected ? 0.04 : isHovered ? 0.03 : 0.015}
                      className="cursor-pointer transition-colors duration-150"
                      onMouseEnter={() => setHoveredName(name)}
                      onMouseLeave={() => setHoveredName("")}
                      onClick={() => { setScoutCounty(name); setScoutResult(""); }}
                    />
                  ))}
                </g>
              );
            })}
          </svg>

          {/* Scout Panel */}
          {scoutCounty && (
            <div className="p-5 rounded-xl bg-surface-light border border-border">
              <h4 className="font-semibold mb-1">{scoutCounty} County, {selectedState}</h4>
              {countyData[scoutCounty] ? (
                <p className="text-sm text-muted mb-3">
                  {countyData[scoutCounty].count} prospects — {countyData[scoutCounty].categories.join(", ")}
                </p>
              ) : (
                <p className="text-sm text-muted mb-3">No prospects yet — run a scout!</p>
              )}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-muted mb-1">Category</label>
                  <select
                    value={scoutCategory}
                    onChange={(e) => setScoutCategory(e.target.value as Category)}
                    className="w-full h-10 px-3 rounded-lg bg-surface border border-border text-foreground text-sm"
                  >
                    {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCountyScout}
                  disabled={scouting}
                  className="h-10 px-5 rounded-lg bg-blue-electric text-white text-sm font-medium disabled:opacity-50"
                >
                  {scouting ? "Scouting..." : "Run Scout"}
                </button>
              </div>
              {scoutResult && <p className="mt-3 text-sm text-blue-electric">{scoutResult}</p>}
            </div>
          )}
        </div>
      )}

      {/* County loading */}
      {view === "county" && (!countiesGeo || countiesGeo.features.length === 0) && (
        <div className="py-20 text-center text-muted">Loading county boundaries...</div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// Convert GeoJSON geometry to SVG path
function renderGeoPath(feature: GeoFeature): string[] {
  const paths: string[] = [];
  const { type, coordinates } = feature.geometry;

  if (type === "Polygon") {
    const rings = coordinates as number[][][];
    let d = "";
    for (const ring of rings) {
      d += ring.map((pt, i) => `${i === 0 ? "M" : "L"}${pt[0]},${-pt[1]}`).join(" ") + "Z ";
    }
    paths.push(d);
  } else if (type === "MultiPolygon") {
    const polys = coordinates as number[][][][];
    for (const poly of polys) {
      let d = "";
      for (const ring of poly) {
        d += ring.map((pt, i) => `${i === 0 ? "M" : "L"}${pt[0]},${-pt[1]}`).join(" ") + "Z ";
      }
      paths.push(d);
    }
  }
  return paths;
}

function getCountyViewBox(geo: GeoJSON): string {
  let minX = 999, maxX = -999, minY = 999, maxY = -999;
  for (const f of geo.features) {
    const coords = f.geometry.type === "Polygon"
      ? (f.geometry.coordinates as number[][][])
      : (f.geometry.coordinates as number[][][][]).flat();
    for (const ring of coords) {
      for (const pt of ring) {
        if (pt[0] < minX) minX = pt[0];
        if (pt[0] > maxX) maxX = pt[0];
        if (-pt[1] < minY) minY = -pt[1];
        if (-pt[1] > maxY) maxY = -pt[1];
      }
    }
  }
  const pad = 0.5;
  return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
}

function lighten(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
}

const STATE_FIPS: Record<string, string> = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06", CO: "08", CT: "09",
  DE: "10", FL: "12", GA: "13", HI: "15", ID: "16", IL: "17", IN: "18",
  IA: "19", KS: "20", KY: "21", LA: "22", ME: "23", MD: "24", MA: "25",
  MI: "26", MN: "27", MS: "28", MO: "29", MT: "30", NE: "31", NV: "32",
  NH: "33", NJ: "34", NM: "35", NY: "36", NC: "37", ND: "38", OH: "39",
  OK: "40", OR: "41", PA: "42", RI: "44", SC: "45", SD: "46", TN: "47",
  TX: "48", UT: "49", VT: "50", VA: "51", WA: "53", WV: "54", WI: "55", WY: "56",
};

const STATE_ABBR: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
  "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
  "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
  "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
  "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
  "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
  "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
};

const STATE_NAMES_FULL: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBR).map(([name, abbr]) => [abbr, name])
);
