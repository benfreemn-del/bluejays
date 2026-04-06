"use client";

import { useState } from "react";
import type { Prospect } from "@/lib/types";

// US state abbreviations and approximate SVG center coordinates for a simplified map
const US_STATES: Record<string, { name: string; x: number; y: number }> = {
  AL: { name: "Alabama", x: 610, y: 380 },
  AK: { name: "Alaska", x: 120, y: 470 },
  AZ: { name: "Arizona", x: 200, y: 360 },
  AR: { name: "Arkansas", x: 530, y: 350 },
  CA: { name: "California", x: 100, y: 280 },
  CO: { name: "Colorado", x: 280, y: 270 },
  CT: { name: "Connecticut", x: 760, y: 180 },
  DE: { name: "Delaware", x: 740, y: 240 },
  FL: { name: "Florida", x: 670, y: 440 },
  GA: { name: "Georgia", x: 650, y: 380 },
  HI: { name: "Hawaii", x: 250, y: 470 },
  ID: { name: "Idaho", x: 180, y: 160 },
  IL: { name: "Illinois", x: 560, y: 250 },
  IN: { name: "Indiana", x: 590, y: 250 },
  IA: { name: "Iowa", x: 490, y: 220 },
  KS: { name: "Kansas", x: 410, y: 290 },
  KY: { name: "Kentucky", x: 620, y: 290 },
  LA: { name: "Louisiana", x: 530, y: 410 },
  ME: { name: "Maine", x: 790, y: 110 },
  MD: { name: "Maryland", x: 720, y: 240 },
  MA: { name: "Massachusetts", x: 775, y: 170 },
  MI: { name: "Michigan", x: 590, y: 180 },
  MN: { name: "Minnesota", x: 460, y: 140 },
  MS: { name: "Mississippi", x: 570, y: 380 },
  MO: { name: "Missouri", x: 500, y: 290 },
  MT: { name: "Montana", x: 250, y: 120 },
  NE: { name: "Nebraska", x: 390, y: 240 },
  NV: { name: "Nevada", x: 150, y: 250 },
  NH: { name: "New Hampshire", x: 775, y: 145 },
  NJ: { name: "New Jersey", x: 745, y: 220 },
  NM: { name: "New Mexico", x: 260, y: 360 },
  NY: { name: "New York", x: 730, y: 170 },
  NC: { name: "North Carolina", x: 690, y: 310 },
  ND: { name: "North Dakota", x: 380, y: 130 },
  OH: { name: "Ohio", x: 630, y: 240 },
  OK: { name: "Oklahoma", x: 430, y: 330 },
  OR: { name: "Oregon", x: 120, y: 140 },
  PA: { name: "Pennsylvania", x: 700, y: 210 },
  RI: { name: "Rhode Island", x: 775, y: 185 },
  SC: { name: "South Carolina", x: 680, y: 340 },
  SD: { name: "South Dakota", x: 380, y: 180 },
  TN: { name: "Tennessee", x: 600, y: 320 },
  TX: { name: "Texas", x: 390, y: 400 },
  UT: { name: "Utah", x: 220, y: 260 },
  VT: { name: "Vermont", x: 760, y: 140 },
  VA: { name: "Virginia", x: 700, y: 270 },
  WA: { name: "Washington", x: 130, y: 90 },
  WV: { name: "West Virginia", x: 670, y: 265 },
  WI: { name: "Wisconsin", x: 520, y: 160 },
  WY: { name: "Wyoming", x: 270, y: 190 },
};

interface MapViewProps {
  prospects: Prospect[];
  onStateClick: (state: string) => void;
}

function getStateColor(count: number, hasContacted: boolean, hasPaid: boolean): string {
  if (hasPaid) return "#f59e0b"; // gold
  if (hasContacted) return "#f97316"; // orange
  if (count > 0) return "#0ea5e9"; // blue
  return "#2a2a2a"; // gray
}

export default function MapView({ prospects, onStateClick }: MapViewProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Group prospects by state
  const stateData: Record<string, { count: number; hasContacted: boolean; hasPaid: boolean }> = {};
  for (const p of prospects) {
    const state = p.state || "TX";
    if (!stateData[state]) {
      stateData[state] = { count: 0, hasContacted: false, hasPaid: false };
    }
    stateData[state].count++;
    if (["contacted", "responded", "paid"].includes(p.status)) {
      stateData[state].hasContacted = true;
    }
    if (p.status === "paid") {
      stateData[state].hasPaid = true;
    }
  }

  const hoveredData = hoveredState ? stateData[hoveredState] : null;
  const hoveredName = hoveredState ? US_STATES[hoveredState]?.name : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Prospect Map</h3>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#2a2a2a] border border-border inline-block" /> No data
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-electric inline-block" /> Scouted
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Contacted
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Paid
          </span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredState && hoveredName && (
        <div className="mb-2 text-sm">
          <span className="font-medium">{hoveredName}</span>
          {hoveredData ? (
            <span className="text-muted"> — {hoveredData.count} prospect{hoveredData.count !== 1 ? "s" : ""}</span>
          ) : (
            <span className="text-muted"> — Click to scout</span>
          )}
        </div>
      )}

      {/* SVG Map */}
      <svg viewBox="0 0 900 520" className="w-full h-auto">
        <rect width="900" height="520" fill="transparent" />
        {Object.entries(US_STATES).map(([abbr, { x, y }]) => {
          const data = stateData[abbr];
          const color = data
            ? getStateColor(data.count, data.hasContacted, data.hasPaid)
            : "#2a2a2a";
          const isHovered = hoveredState === abbr;

          return (
            <g key={abbr}>
              <circle
                cx={x}
                cy={y}
                r={data ? Math.min(8 + data.count * 3, 22) : 6}
                fill={color}
                opacity={isHovered ? 1 : 0.7}
                stroke={isHovered ? "#fff" : "transparent"}
                strokeWidth={2}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredState(abbr)}
                onMouseLeave={() => setHoveredState(null)}
                onClick={() => onStateClick(abbr)}
              />
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={data ? "#fff" : "#666"}
                fontSize={data ? 8 : 7}
                fontWeight={data ? "bold" : "normal"}
                className="pointer-events-none select-none"
              >
                {abbr}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
