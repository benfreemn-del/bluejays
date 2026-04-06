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
const WA_COUNTIES_GEOJSON_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/us-states/WA-53-washington-counties.json";

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

    if (abbr === "WA" && !countiesGeo) {
      // Fetch WA county TopoJSON → convert
      fetch(WA_COUNTIES_GEOJSON_URL)
        .then((r) => r.json())
        .then((topo) => {
          // Convert TopoJSON to GeoJSON
          const objectKey = Object.keys(topo.objects)[0];
          const obj = topo.objects[objectKey];
          const features = obj.geometries.map((geom: Record<string, unknown>) => {
            const coords = topoToGeoCoords(geom, topo);
            return {
              type: "Feature",
              properties: (geom.properties || {}) as Record<string, string>,
              geometry: { type: geom.type as string, coordinates: coords },
            };
          });
          setCountiesGeo({ type: "FeatureCollection", features });
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
      setScoutResult(`Found ${data.prospects.length} businesses in ${scoutCounty}!`);
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
        <svg viewBox="-130 24 65 30" className="w-full h-auto" style={{ maxHeight: "500px" }}>
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
      {view === "county" && selectedState === "WA" && countiesGeo && (
        <div>
          <svg viewBox="-124.8 45.5 8.5 3.5" className="w-full h-auto mb-4" style={{ maxHeight: "400px" }}>
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
      {view === "county" && selectedState === "WA" && !countiesGeo && (
        <div className="py-20 text-center text-muted">Loading county boundaries...</div>
      )}

      {/* Non-WA state */}
      {view === "county" && selectedState !== "WA" && (
        <div className="py-16 text-center text-muted">
          <p className="text-lg mb-2">County view for {STATE_NAMES_FULL[selectedState] || selectedState}</p>
          <p className="text-sm">Washington state has full county mapping. More states coming soon.</p>
        </div>
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

function lighten(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
}

// TopoJSON arc decoding
function topoToGeoCoords(geom: Record<string, unknown>, topo: Record<string, unknown>): number[][][] | number[][][][] {
  const arcs = topo.arcs as number[][][];
  const transform = topo.transform as { scale: number[]; translate: number[] } | undefined;

  function decodeArc(arcIdx: number): number[][] {
    const isReversed = arcIdx < 0;
    const idx = isReversed ? ~arcIdx : arcIdx;
    const arc = arcs[idx];
    const coords: number[][] = [];
    let x = 0, y = 0;
    for (const pt of arc) {
      x += pt[0];
      y += pt[1];
      if (transform) {
        coords.push([
          x * transform.scale[0] + transform.translate[0],
          y * transform.scale[1] + transform.translate[1],
        ]);
      } else {
        coords.push([x, y]);
      }
    }
    return isReversed ? coords.reverse() : coords;
  }

  function decodeRing(arcIndices: number[]): number[][] {
    const ring: number[][] = [];
    for (const idx of arcIndices) {
      const decoded = decodeArc(idx);
      ring.push(...(ring.length > 0 ? decoded.slice(1) : decoded));
    }
    return ring;
  }

  if (geom.type === "Polygon") {
    const arcRings = geom.arcs as number[][];
    return arcRings.map(decodeRing);
  } else if (geom.type === "MultiPolygon") {
    const multiArcs = geom.arcs as number[][][];
    return multiArcs.map((poly) => poly.map(decodeRing));
  }
  return [];
}

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
