"use client";

/**
 * ops-map.client.tsx — Leaflet service map for the Mt View ops backend.
 *
 * Renders every recurring property as a circle pin colored by net margin
 * (green healthy / amber thin / red losing), plus one polyline per crew
 * tracing the route loop from the shop. Click a pin for that stop's
 * economics. Dynamically imported with ssr:false from page.tsx.
 *
 * z-index containment: relies on the global `.leaflet-container { isolation:
 * isolate }` rule in globals.css (NON-NEGOTIABLE map rule).
 */

import "leaflet/dist/leaflet.css";
import { useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";

import { SHOP } from "./mock-ops-data";
import { allRouteEconomics, usd, pct, hrs } from "./profit-engine";

const COLORS = {
  moss: "#15803d",
  warn: "#c2410c",
  loss: "#b91c1c",
  bark: "#6B5A3E",
  ink: "#1C1F1A",
  paper: "#F5F1E8",
  stone: "#A8A294",
};

function marginColor(marginPct: number): string {
  if (marginPct < 0) return COLORS.loss;
  if (marginPct < 15) return COLORS.warn;
  return COLORS.moss;
}

export default function OpsMap() {
  const routes = useMemo(() => allRouteEconomics(), []);

  // Flatten stops with their economics + crew color for pins.
  const pins = useMemo(
    () =>
      routes.flatMap((re) =>
        re.stops.map((s) => ({
          id: s.property.id,
          lat: s.property.lat,
          lng: s.property.lng,
          eco: s,
          crewName: re.crew.name,
          day: re.route.day,
        })),
      ),
    [routes],
  );

  // Polyline path per route: shop → each stop → back to shop.
  const routeLines = useMemo(
    () =>
      routes.map((re) => ({
        id: re.route.id,
        color: re.crew.color,
        day: re.route.day,
        crew: re.crew.name,
        path: [
          [SHOP.lat, SHOP.lng] as [number, number],
          ...re.stops.map((s) => [s.property.lat, s.property.lng] as [number, number]),
          [SHOP.lat, SHOP.lng] as [number, number],
        ],
      })),
    [routes],
  );

  const [activeDay, setActiveDay] = useState<string | "all">("all");

  return (
    <div style={{ position: "relative" }}>
      {/* Day filter overlay */}
      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, display: "flex", gap: 6, flexWrap: "wrap", background: "rgba(245,241,232,0.92)", padding: 6, borderRadius: 4, border: `1px solid rgba(168,162,148,0.5)` }}>
        <DayBtn label="All" on={activeDay === "all"} onClick={() => setActiveDay("all")} />
        {routes.map((re) => (
          <DayBtn key={re.route.id} label={re.route.day.slice(0, 3)} color={re.crew.color} on={activeDay === re.route.day} onClick={() => setActiveDay(re.route.day)} />
        ))}
      </div>

      <MapContainer
        center={[47.55, -122.25]}
        zoom={10}
        style={{ height: 540, width: "100%", background: "#E8E5DC" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />

        {/* Route polylines */}
        {routeLines
          .filter((rl) => activeDay === "all" || rl.day === activeDay)
          .map((rl) => (
            <Polyline key={rl.id} positions={rl.path} pathOptions={{ color: rl.color, weight: 3, opacity: 0.55, dashArray: "6 6" }} />
          ))}

        {/* Shop marker */}
        <CircleMarker center={[SHOP.lat, SHOP.lng]} radius={9} pathOptions={{ color: COLORS.paper, weight: 2, fillColor: COLORS.bark, fillOpacity: 1 }}>
          <Tooltip direction="top" offset={[0, -8]}>
            <strong>{SHOP.name}</strong><br />{SHOP.address}, {SHOP.city}
          </Tooltip>
        </CircleMarker>

        {/* Property pins */}
        {pins
          .filter((p) => activeDay === "all" || p.day === activeDay)
          .map((p) => {
            const color = marginColor(p.eco.netMarginPct);
            return (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={9}
                pathOptions={{ color: COLORS.paper, weight: 1.5, fillColor: color, fillOpacity: 0.9 }}
              >
                <Popup>
                  <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minWidth: 210 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.ink }}>{p.eco.property.customer}</div>
                    <div style={{ fontSize: 11, color: COLORS.stone, marginBottom: 8 }}>
                      {p.eco.property.address}, {p.eco.property.city} · {p.day} · {p.crewName.split("'")[0]}&apos;s
                    </div>
                    <PopRow label="Revenue / visit" value={usd(p.eco.revenue)} />
                    <PopRow label="Labor (burdened)" value={"−" + usd(p.eco.laborCost)} red />
                    <PopRow label="Drive cost" value={"−" + usd(p.eco.driveCost)} red sub={`${hrs(p.eco.driveHours)} · ${p.eco.driveMiles.toFixed(0)}mi`} />
                    <PopRow label="Materials" value={"−" + usd(p.eco.materials)} red />
                    <PopRow label="Overhead" value={"−" + usd(p.eco.overhead)} red />
                    <div style={{ borderTop: `1px solid #e5e3dc`, marginTop: 6, paddingTop: 6 }}>
                      <PopRow label="Net / visit" value={(p.eco.netProfit < 0 ? "−" : "") + usd(Math.abs(p.eco.netProfit))} bold valueColor={color} />
                      <PopRow label="Margin" value={pct(p.eco.netMarginPct)} bold valueColor={color} />
                    </div>
                  </div>
                </Popup>
                <Tooltip direction="top" offset={[0, -8]}>
                  <strong>{p.eco.property.customer}</strong> · {usd(p.eco.netProfit)} ({pct(p.eco.netMarginPct)})
                </Tooltip>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}

function DayBtn({ label, on, onClick, color }: { label: string; on: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: on ? COLORS.ink : "transparent",
        color: on ? COLORS.paper : COLORS.ink,
        border: `1px solid ${on ? COLORS.ink : "rgba(168,162,148,0.5)"}`,
        padding: "5px 10px",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        borderRadius: 3,
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {color && <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />}
      {label}
    </button>
  );
}

function PopRow({ label, value, red, bold, sub, valueColor }: { label: string; value: string; red?: boolean; bold?: boolean; sub?: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0", fontSize: 12 }}>
      <span style={{ color: COLORS.stone }}>{label}{sub && <span style={{ color: "#bdb8ab", marginLeft: 4 }}>· {sub}</span>}</span>
      <span style={{ color: valueColor ?? (red ? COLORS.warn : COLORS.ink), fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}
