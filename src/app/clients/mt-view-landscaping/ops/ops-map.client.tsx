"use client";

/**
 * ops-map.client.tsx — Leaflet dispatch map for the Mt View ops backend.
 *
 * Left: the map. Right: a panel to flip through CREWS (grouped maintenance /
 * construction) and DAYS of the week. Pick a crew + day and the map shows that
 * crew's route for that day — stops colored by margin, the route line in the
 * crew's color, and the day's numbers. Construction crews are project-based
 * (no daily route) and show their roster instead.
 *
 * Props are fully data-driven (crews/employees/routes/shop) so it scales as
 * crews + routes are edited. Relies on the global `.leaflet-container {
 * isolation: isolate }` rule in globals.css.
 */

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

import { SIDE_LABEL, type Crew, type CrewSide, type Employee, type ShopInfo } from "./mock-ops-data";
import { usd, pct, hrs, type RouteEconomics } from "./profit-engine";

const COLORS = {
  moss: "#15803d",
  warn: "#c2410c",
  loss: "#b91c1c",
  bark: "#6B5A3E",
  ink: "#1C1F1A",
  paper: "#F5F1E8",
  bone: "#FBF8F1",
  stone: "#A8A294",
  sage: "#E4E6DC",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FONT = "'Inter', system-ui, sans-serif";

function marginColor(m: number): string {
  if (m < 0) return COLORS.loss;
  if (m < 15) return COLORS.warn;
  return COLORS.moss;
}

/** Fits the map to a set of points whenever they change. `fitKey` changes
 *  only when the active route changes, so this doesn't refit every render. */
function FitBounds({ points, fitKey }: { points: [number, number][]; fitKey: string }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 11);
    else map.fitBounds(points, { padding: [40, 40], maxZoom: 13 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);
  return null;
}

export default function OpsMap({
  routes,
  crews,
  employees,
  shop,
}: {
  routes: RouteEconomics[];
  crews: Crew[];
  employees: Employee[];
  shop: ShopInfo;
}) {
  // default to the first crew that actually has a route
  const firstWithRoute = crews.find((c) => routes.some((r) => r.crew.id === c.id)) ?? crews[0];
  const [crewId, setCrewId] = useState<string>(firstWithRoute?.id ?? "");

  const crew = crews.find((c) => c.id === crewId) ?? firstWithRoute;
  const crewRoutes = useMemo(() => routes.filter((r) => r.crew.id === crewId), [routes, crewId]);
  const routeByDay = useMemo(() => {
    const m: Record<string, RouteEconomics> = {};
    for (const r of crewRoutes) m[r.route.day] = r;
    return m;
  }, [crewRoutes]);

  // default selected day = this crew's first route day
  const [day, setDay] = useState<string>(crewRoutes[0]?.route.day ?? "Monday");
  const effectiveDay = routeByDay[day] ? day : crewRoutes[0]?.route.day ?? day;
  const active = routeByDay[effectiveDay] ?? null;

  function pickCrew(id: string) {
    setCrewId(id);
    const cr = routes.filter((r) => r.crew.id === id);
    setDay(cr[0]?.route.day ?? "Monday");
  }

  const members = employees.filter((e) => e.crewId === crewId);
  const fitKey = `${crewId}|${effectiveDay}|${active ? "r" : "x"}`;

  const points = useMemo<[number, number][]>(() =>
    active
      ? [[shop.lat, shop.lng], ...active.stops.map((s) => [s.property.lat, s.property.lng] as [number, number])]
      : [[shop.lat, shop.lng]],
    [active, shop],
  );
  const line = useMemo<[number, number][]>(() =>
    active
      ? [[shop.lat, shop.lng], ...active.stops.map((s) => [s.property.lat, s.property.lng] as [number, number]), [shop.lat, shop.lng]]
      : [],
    [active, shop],
  );

  const sides: CrewSide[] = ["maintenance", "construction"];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 0, background: COLORS.bone }}>
      {/* MAP */}
      <div style={{ flex: "1 1 420px", minWidth: 300 }}>
        <MapContainer center={[47.5, -122.2]} zoom={10} style={{ height: 560, width: "100%", background: "#E8E5DC" }} scrollWheelZoom={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap &copy; CARTO" />
          <FitBounds points={points} fitKey={fitKey} />

          {active && (
            <Polyline positions={line} pathOptions={{ color: crew?.color ?? COLORS.moss, weight: 3, opacity: 0.6, dashArray: "6 6" }} />
          )}

          {/* shop */}
          <CircleMarker center={[shop.lat, shop.lng]} radius={9} pathOptions={{ color: COLORS.paper, weight: 2, fillColor: COLORS.bark, fillOpacity: 1 }}>
            <Tooltip direction="top" offset={[0, -8]}><strong>{shop.name}</strong><br />{shop.address}, {shop.city}</Tooltip>
          </CircleMarker>

          {/* stops for the active route */}
          {active?.stops.map((s, i) => {
            const color = marginColor(s.netMarginPct);
            return (
              <CircleMarker key={s.property.id} center={[s.property.lat, s.property.lng]} radius={10} pathOptions={{ color: COLORS.paper, weight: 1.5, fillColor: color, fillOpacity: 0.92 }}>
                <Popup>
                  <div style={{ fontFamily: FONT, minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.ink }}>{i + 1}. {s.property.customer}</div>
                    <div style={{ fontSize: 11, color: COLORS.stone, marginBottom: 6 }}>{s.property.address}, {s.property.city}</div>
                    <PopRow label="Revenue" value={usd(s.revenue)} />
                    <PopRow label="All-in cost" value={"−" + usd(s.revenue - s.netProfit)} red />
                    <div style={{ borderTop: "1px solid #e5e3dc", marginTop: 5, paddingTop: 5 }}>
                      <PopRow label="Profit" value={(s.netProfit < 0 ? "−" : "") + usd(Math.abs(s.netProfit))} bold valueColor={color} />
                      <PopRow label="Margin" value={pct(s.netMarginPct)} bold valueColor={color} />
                    </div>
                  </div>
                </Popup>
                <Tooltip direction="top" offset={[0, -8]}><strong>{i + 1}. {s.property.customer}</strong> · {pct(s.netMarginPct)}</Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* PANEL */}
      <div style={{ flex: "1 1 280px", maxWidth: 340, borderLeft: `1px solid rgba(168,162,148,0.4)`, padding: "16px 18px", maxHeight: 560, overflowY: "auto" }}>
        {/* crews */}
        <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.stone, fontWeight: 700, margin: "0 0 8px" }}>Crews</p>
        {sides.map((side) => {
          const list = crews.filter((c) => c.side === side);
          if (!list.length) return null;
          return (
            <div key={side} style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 11, color: COLORS.bark, fontWeight: 600, margin: "0 0 6px" }}>{SIDE_LABEL[side]}</p>
              <div style={{ display: "grid", gap: 6 }}>
                {list.map((c) => {
                  const on = c.id === crewId;
                  const has = routes.some((r) => r.crew.id === c.id);
                  return (
                    <button key={c.id} type="button" onClick={() => pickCrew(c.id)}
                      style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "left", background: on ? COLORS.sage : "transparent", border: `1px solid ${on ? c.color : "rgba(168,162,148,0.4)"}`, boxShadow: `inset 4px 0 0 ${c.color}`, padding: "8px 10px 8px 13px", borderRadius: 4, cursor: "pointer", fontFamily: FONT }}>
                      <span style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: on ? 700 : 500, color: COLORS.ink, display: "block" }}>{c.name}</span>
                        <span style={{ fontSize: 11, color: COLORS.stone }}>{employees.filter((e) => e.crewId === c.id).length} people{has ? "" : " · project-based"}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* days */}
        <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: COLORS.stone, fontWeight: 700, margin: "14px 0 8px" }}>Day</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {DAYS.map((d) => {
            const has = !!routeByDay[d];
            const on = d === effectiveDay && has;
            return (
              <button key={d} type="button" onClick={() => setDay(d)} disabled={!has}
                style={{ background: on ? COLORS.ink : has ? COLORS.bone : "transparent", color: on ? COLORS.paper : has ? COLORS.ink : COLORS.stone, border: `1px solid ${on ? COLORS.ink : "rgba(168,162,148,0.4)"}`, padding: "6px 9px", fontSize: 11, fontWeight: 600, borderRadius: 3, cursor: has ? "pointer" : "default", opacity: has ? 1 : 0.5, fontFamily: FONT }}
                title={has ? "" : "No route this day"}>
                {d.slice(0, 3)}
              </button>
            );
          })}
        </div>

        {/* selected detail */}
        <div style={{ marginTop: 16, borderTop: `1px solid rgba(168,162,148,0.4)`, paddingTop: 14 }}>
          {active ? (
            <>
              <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, margin: 0, fontFamily: FONT }}>{active.route.day} · {crew?.name}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                <Stat label="Stops" value={String(active.stops.length)} />
                <Stat label="Hours" value={hrs(active.totalHours)} />
                <Stat label="Revenue" value={usd(active.revenue)} />
                <Stat label="Profit" value={usd(active.netProfit)} color={marginColor(active.netMarginPct)} />
                <Stat label="Margin" value={pct(active.netMarginPct)} color={marginColor(active.netMarginPct)} />
                <Stat label="Drive" value={`${active.driveMiles.toFixed(0)} mi`} />
              </div>
              <ol style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
                {active.stops.map((s, i) => (
                  <li key={s.property.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(168,162,148,0.25)", fontSize: 12 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: marginColor(s.netMarginPct), color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, color: COLORS.ink }}>{s.property.customer}</span>
                    <span style={{ color: marginColor(s.netMarginPct), fontWeight: 600 }}>{pct(s.netMarginPct)}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, margin: 0, fontFamily: FONT }}>{crew?.name}</p>
              <p style={{ fontSize: 12.5, color: COLORS.ink, lineHeight: 1.55, margin: "8px 0 0", background: COLORS.sage, padding: "10px 12px", borderRadius: 4 }}>
                {crew?.side === "construction"
                  ? "Build crew — works job to job, not a daily route. Their projects show up here once jobs are added."
                  : "No route on this day."}
              </p>
            </div>
          )}

          {/* crew roster */}
          {members.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: COLORS.stone, fontWeight: 700, margin: "0 0 6px" }}>On this crew</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {members.map((m) => (
                  <span key={m.id} style={{ fontSize: 11, background: COLORS.sage, color: COLORS.ink, padding: "3px 8px", borderRadius: 3 }}>{m.name}</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: COLORS.stone, margin: "8px 0 0", lineHeight: 1.5 }}>Edit crews + members on the Setup and Crew tabs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.stone, fontWeight: 600, margin: 0 }}>{label}</p>
      <p style={{ fontSize: 17, fontWeight: 700, color: color ?? COLORS.ink, margin: "1px 0 0", fontFamily: FONT }}>{value}</p>
    </div>
  );
}

function PopRow({ label, value, red, bold, valueColor }: { label: string; value: string; red?: boolean; bold?: boolean; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0", fontSize: 12 }}>
      <span style={{ color: COLORS.stone }}>{label}</span>
      <span style={{ color: valueColor ?? (red ? COLORS.warn : COLORS.ink), fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}
