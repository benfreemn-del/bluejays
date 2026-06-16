"use client";

/**
 * OpsClient — interactive shell for the Mt View operations backend. Receives
 * the full OpsDataset from the server component (page.tsx, which reads it from
 * Supabase via ops-store, mock fallback) and builds the job-costing engine
 * from it. No data fetching here — pure presentation + the password gate.
 *
 * Tabs: P&L · Routes · Crew · Customers · Map
 * Theme matches the Mt View front-end: Paper + Ink + forest green.
 * Password-gated (1976), cookie bj_mtv_ops_unlocked.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  SIDE_LABEL,
  TIER_LABEL,
  type Crew,
  type CrewSide,
  type Employee,
  type OpsAssumptions,
  type OpsDataset,
  type Property,
  type ShopInfo,
  type Vehicle,
} from "./mock-ops-data";
import {
  createEngine,
  usd,
  pct,
  hrs,
  type CrewProfitability,
  type OpsEngine,
  type ProfitAndLoss,
  type RouteEconomics,
} from "./profit-engine";

const OpsMap = dynamic(() => import("./ops-map.client"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 540, display: "flex", alignItems: "center", justifyContent: "center", background: "#EDEAE0", color: "#A8A294", fontSize: 13 }}>
      Loading map…
    </div>
  ),
});

const PASSWORD = "1976";
const COOKIE = "bj_mtv_ops_unlocked";

const C = {
  paper: "#F5F1E8",
  ink: "#1C1F1A",
  moss: "#15803d",
  mossBright: "#22c55e",
  mossSoft: "#dcfce7",
  stone: "#A8A294",
  bark: "#6B5A3E",
  sage: "#E4E6DC",
  bone: "#FBF8F1",
  warn: "#c2410c",
  warnSoft: "#ffedd5",
  loss: "#b91c1c",
  lossSoft: "#fee2e2",
};

const FONT_BODY = "'Inter', system-ui, sans-serif";
const FONT_DISP = "'Playfair Display', Georgia, serif";

type TabId = "pnl" | "routes" | "crew" | "customers" | "map" | "setup";
const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "pnl", label: "P&L", emoji: "▤" },
  { id: "routes", label: "Routes", emoji: "➔" },
  { id: "crew", label: "Crew", emoji: "✦" },
  { id: "customers", label: "Customers", emoji: "◈" },
  { id: "map", label: "Map", emoji: "⌖" },
  { id: "setup", label: "Setup", emoji: "⚙" },
];

function moneyColor(n: number): string {
  return n < 0 ? C.loss : C.ink;
}
function marginTone(marginPct: number): { color: string; bg: string; label: string } {
  if (marginPct < 0) return { color: C.loss, bg: C.lossSoft, label: "Losing" };
  if (marginPct < 15) return { color: C.warn, bg: C.warnSoft, label: "Thin" };
  return { color: C.moss, bg: C.mossSoft, label: "Healthy" };
}

export default function OpsClient({ dataset }: { dataset: OpsDataset }) {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<TabId>("pnl");

  const E = useMemo(() => createEngine(dataset), [dataset]);

  useEffect(() => {
    if (typeof document !== "undefined" && document.cookie.includes(`${COOKIE}=1`)) {
      setUnlocked(true);
    }
  }, []);

  if (!unlocked) {
    return (
      <PasswordGate
        onUnlock={(input) => {
          if (input.trim() === PASSWORD) {
            document.cookie = `${COOKIE}=1; path=/; max-age=86400; samesite=lax`;
            setUnlocked(true);
            return true;
          }
          return false;
        }}
      />
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: C.paper, color: C.ink, fontFamily: FONT_BODY }}>
      <Header />
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "1.25rem 1.25rem 4rem" }}>
        <Tabs current={tab} onChange={setTab} />
        <div style={{ marginTop: "2rem" }}>
          {tab === "pnl" && <PnlTab E={E} assumptions={dataset.assumptions} />}
          {tab === "routes" && <RoutesTab E={E} shop={dataset.shop} />}
          {tab === "crew" && <CrewTab E={E} dataset={dataset} />}
          {tab === "customers" && <CustomersTab E={E} dataset={dataset} />}
          {tab === "map" && <MapTab E={E} shop={dataset.shop} />}
          {tab === "setup" && <SetupTab dataset={dataset} />}
        </div>
      </div>
      <Footer />
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 880px) { .ops-2col { grid-template-columns: 1fr !important; } }
        .ops-tbl { width: 100%; border-collapse: collapse; }
        .ops-tbl th { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: ${C.stone}; font-weight: 600; text-align: right; padding: 10px 10px; border-bottom: 1px solid rgba(168,162,148,0.4); white-space: nowrap; }
        .ops-tbl th:first-child, .ops-tbl td:first-child { text-align: left; }
        .ops-tbl td { font-size: 13px; color: ${C.ink}; padding: 11px 10px; border-bottom: 1px solid rgba(168,162,148,0.25); text-align: right; white-space: nowrap; }
        .ops-tbl tr:hover td { background: rgba(220,252,231,0.25); }
      ` }} />
    </main>
  );
}

/* ════════════════════ PASSWORD GATE ════════════════════ */
function PasswordGate({ onUnlock }: { onUnlock: (input: string) => boolean }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  return (
    <main style={{ minHeight: "100vh", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: FONT_BODY }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 16 }}>
          Mountain View — Operations Backend
        </p>
        <h1 style={{ fontFamily: FONT_DISP, fontSize: 44, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.018em", color: C.ink, margin: "0 0 12px" }}>
          Know every job&apos;s number.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(28,31,26,0.7)", marginBottom: 28 }}>
          Crews, pay, drive time, and the real profit on every route — once expenses and taxes come out.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); if (!onUnlock(val)) setErr(true); }}>
          <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone, marginBottom: 8 }}>Passcode</label>
          <input
            type="password" value={val} autoFocus
            onChange={(e) => { setVal(e.target.value); setErr(false); }}
            style={{ width: "100%", background: "transparent", border: 0, borderBottom: `1px solid ${err ? C.warn : "rgba(168,162,148,0.5)"}`, padding: "10px 0", fontSize: 18, color: C.ink, outline: "none", fontFamily: FONT_BODY }}
          />
          {err && <p style={{ fontSize: 13, color: C.warn, marginTop: 8 }}>That passcode doesn&apos;t look right.</p>}
          <button type="submit" style={{ marginTop: 28, background: C.bark, color: C.paper, border: 0, padding: "14px 32px", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT_BODY, fontWeight: 500, cursor: "pointer" }}>
            Enter →
          </button>
        </form>
        <Link href="/clients/mt-view-landscaping" style={{ display: "inline-block", marginTop: 28, fontSize: 12, color: C.moss, textDecoration: "underline", textUnderlineOffset: 4 }}>
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}

/* ════════════════════ CHROME ════════════════════ */
function Header() {
  return (
    <header style={{ background: C.paper, borderBottom: `1px solid rgba(28,31,26,0.08)`, position: "sticky", top: 0, zIndex: 30, backdropFilter: "blur(8px)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", background: C.moss, color: C.paper, fontFamily: FONT_DISP, fontSize: 18, fontWeight: 500 }}>MV</span>
          <div>
            <p style={{ fontFamily: FONT_DISP, fontSize: 18, color: C.ink, fontWeight: 500, letterSpacing: "-0.01em", margin: 0, lineHeight: 1.05 }}>Mountain View</p>
            <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone, marginTop: 2, fontWeight: 500 }}>Operations Backend</p>
          </div>
        </div>
        <span style={{ fontSize: 11, color: C.stone, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.moss, marginRight: 6, verticalAlign: "middle" }} />
          Live data
        </span>
      </div>
    </header>
  );
}

function Tabs({ current, onChange }: { current: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav style={{ display: "flex", gap: 4, borderBottom: `1px solid rgba(168,162,148,0.35)`, overflowX: "auto" }}>
      {TABS.map((t) => {
        const active = current === t.id;
        return (
          <button key={t.id} type="button" onClick={() => onChange(t.id)}
            style={{ background: "transparent", border: 0, borderBottom: active ? `2px solid ${C.moss}` : "2px solid transparent", padding: "14px 18px", fontSize: 14, fontFamily: FONT_BODY, fontWeight: active ? 600 : 500, color: active ? C.ink : "rgba(28,31,26,0.6)", cursor: "pointer", whiteSpace: "nowrap" }}>
            <span style={{ color: C.moss, marginRight: 8 }}>{t.emoji}</span>{t.label}
          </button>
        );
      })}
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{ background: C.ink, color: "rgba(245,241,232,0.7)", padding: "32px 1.25rem 28px", marginTop: 60 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, fontSize: 12 }}>
        <p>Mountain View Landscape &amp; Design · Operations Backend</p>
        <p>Built by <a href="https://bluejayportfolio.com" style={{ color: C.paper, textDecoration: "underline" }}>BlueJays</a></p>
      </div>
    </footer>
  );
}

function Card({ title, children, right }: { title?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ background: C.bone, border: "1px solid rgba(168,162,148,0.35)", padding: "22px 24px" }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: C.moss, fontWeight: 600, margin: 0 }}>{title}</p>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

/* ════════════════════ P&L TAB ════════════════════ */
function PnlTab({ E, assumptions }: { E: OpsEngine; assumptions: OpsAssumptions }) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const pl = useMemo<ProfitAndLoss>(() => period === "weekly" ? E.weeklyProfitAndLoss() : E.monthlyProfitAndLoss(), [period, E]);
  const ohRate = E.overheadPerHour();

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 10 }}>Profit &amp; Loss</p>
          <h2 style={{ fontFamily: FONT_DISP, fontSize: 36, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0, lineHeight: 1.1 }}>
            {usd(pl.takeHome)} <span style={{ fontSize: 18, color: C.stone, fontWeight: 400 }}>take-home / {period === "weekly" ? "week" : "month"}</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(28,31,26,0.7)", marginTop: 8, maxWidth: 560 }}>
            {usd(pl.revenue)} in recurring maintenance revenue → {pct(pl.netMarginPct)} net margin after labor, drive, overhead, and a {(assumptions.taxSetAsidePct * 100).toFixed(0)}% tax set-aside.
          </p>
        </div>
        <Toggle value={period} onChange={setPeriod} options={[{ id: "weekly", label: "Weekly" }, { id: "monthly", label: "Monthly" }]} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
        <Kpi label="Revenue" value={usd(pl.revenue)} sub="recurring maintenance" />
        <Kpi label="Net profit (pre-tax)" value={usd(pl.netProfit)} sub={pct(pl.netMarginPct) + " margin"} accent />
        <Kpi label="Take-home" value={usd(pl.takeHome)} sub={`after ${(assumptions.taxSetAsidePct * 100).toFixed(0)}% tax set-aside`} />
        <Kpi label="Profit / crew-hour" value={usd(pl.profitPerCrewHour, { cents: true })} sub={`${hrs(pl.totalHours)} billed`} />
        <Kpi label="Drive miles" value={Math.round(pl.driveMiles).toLocaleString()} sub={`${hrs(pl.driveHours)} windshield time`} warn />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,3fr) minmax(0,2fr)", gap: 24 }} className="ops-2col">
        <Card title={`Where the money goes · ${period}`}>
          <PnlWaterfall pl={pl} assumptions={assumptions} />
        </Card>

        <Card title="Fixed overhead (monthly)">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {assumptions.monthlyOverhead.map((o) => (
              <li key={o.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(168,162,148,0.25)", fontSize: 13 }}>
                <span style={{ color: C.ink }}>{o.label}</span>
                <span style={{ color: C.ink, fontWeight: 500 }}>{usd(o.monthlyUsd)}</span>
              </li>
            ))}
            <li style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0 6px", fontSize: 13, fontWeight: 600, borderBottom: "1px solid rgba(168,162,148,0.25)" }}>
              <span>Whole company / month</span>
              <span>{usd(E.monthlyOverheadTotal)}</span>
            </li>
            <li style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0 0", fontSize: 14, fontWeight: 700, color: C.moss }}>
              <span>Maintenance share ({(assumptions.maintenanceOverheadSharePct * 100).toFixed(0)}%)</span>
              <span>{usd(E.maintenanceOverheadMonthly)}</span>
            </li>
          </ul>
          <div style={{ marginTop: 16, padding: 12, background: C.sage, fontSize: 12, color: C.ink, lineHeight: 1.5 }}>
            Install + design carries the other {(100 - assumptions.maintenanceOverheadSharePct * 100).toFixed(0)}%. Maintenance&apos;s slice, spread across <strong>{hrs(E.weeklyBillableHours())}</strong> billable crew-hours/week, means every productive hour must clear <strong>{usd(ohRate, { cents: true })}/hr</strong> just to cover the shop, trucks, and admin.
          </div>
        </Card>
      </div>

      <p style={{ fontSize: 12, color: C.stone, lineHeight: 1.6 }}>
        Labor burden of {(assumptions.laborBurdenPct * 100).toFixed(0)}% (payroll taxes, WA workers-comp, insurance, PTO) is layered onto every wage. Drive cost = crew wages while driving + truck fuel &amp; maintenance per mile.
      </p>
    </div>
  );
}

function PnlWaterfall({ pl, assumptions }: { pl: ProfitAndLoss; assumptions: OpsAssumptions }) {
  const rows: { label: string; amount: number; kind: "in" | "out" | "net" }[] = [
    { label: "Revenue", amount: pl.revenue, kind: "in" },
    { label: "Crew labor (burdened)", amount: -pl.laborCost, kind: "out" },
    { label: "Drive cost (wages + truck)", amount: -pl.driveCost, kind: "out" },
    { label: "Materials + disposal", amount: -pl.materials, kind: "out" },
    { label: "Overtime", amount: -pl.overtime, kind: "out" },
    { label: "Gross profit", amount: pl.grossProfit, kind: "net" },
    { label: "Fixed overhead", amount: -pl.overhead, kind: "out" },
    { label: "Net profit (pre-tax)", amount: pl.netProfit, kind: "net" },
    { label: `Tax set-aside (${(assumptions.taxSetAsidePct * 100).toFixed(0)}%)`, amount: -pl.taxSetAside, kind: "out" },
    { label: "Take-home", amount: pl.takeHome, kind: "net" },
  ];
  const max = pl.revenue || 1;
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 4 }}>
      {rows.map((r) => {
        const isNet = r.kind === "net";
        const barPct = Math.min(100, (Math.abs(r.amount) / max) * 100);
        const barColor = r.kind === "in" ? C.moss : r.kind === "out" ? "rgba(194,65,12,0.55)" : C.bark;
        return (
          <li key={r.label} style={{ padding: isNet ? "10px 0" : "6px 0", borderTop: isNet ? "1px solid rgba(168,162,148,0.4)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 5 }}>
              <span style={{ fontSize: isNet ? 14 : 13, color: C.ink, fontWeight: isNet ? 700 : 400 }}>{r.label}</span>
              <span style={{ fontSize: isNet ? 14 : 13, color: r.amount < 0 ? C.warn : isNet ? C.moss : C.ink, fontWeight: isNet ? 700 : 500 }}>
                {r.amount < 0 ? "−" : ""}{usd(Math.abs(r.amount))}
              </span>
            </div>
            <div style={{ height: isNet ? 7 : 5, background: "rgba(168,162,148,0.18)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${barPct}%`, height: "100%", background: barColor, borderRadius: 3 }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ════════════════════ ROUTES TAB ════════════════════ */
function RoutesTab({ E, shop }: { E: OpsEngine; shop: ShopInfo }) {
  const routes = useMemo(() => E.allRouteEconomics(), [E]);
  const [activeId, setActiveId] = useState(routes[0]?.route.id ?? "");
  const active = routes.find((r) => r.route.id === activeId) ?? routes[0];

  const gmapsUrl = useMemo(() => {
    if (!active) return "#";
    const pts = active.stops.map((s) => `${s.property.address}, ${s.property.city}`);
    return `https://www.google.com/maps/dir/${encodeURIComponent(`${shop.address}, ${shop.city}`)}/${pts.map((p) => encodeURIComponent(p)).join("/")}`;
  }, [active, shop]);

  if (!active) return <p style={{ color: C.stone }}>No routes yet.</p>;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Route Economics</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>Profit on every route.</h2>
        <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
          Each maintenance day, stop by stop — revenue against burdened labor, drive cost, materials, and overhead.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {routes.map((r) => {
          const on = r.route.id === active.route.id;
          const tone = marginTone(r.netMarginPct);
          return (
            <button key={r.route.id} type="button" onClick={() => setActiveId(r.route.id)}
              style={{ background: on ? C.ink : C.bone, color: on ? C.paper : C.ink, border: `1px solid ${on ? C.ink : "rgba(168,162,148,0.4)"}`, padding: "12px 16px", cursor: "pointer", textAlign: "left", fontFamily: FONT_BODY, flex: 1, minWidth: 150 }}>
              <p style={{ fontFamily: FONT_DISP, fontSize: 18, fontWeight: 500, margin: 0, lineHeight: 1 }}>{r.route.day}</p>
              <p style={{ fontSize: 11, letterSpacing: "0.06em", margin: "5px 0 0", opacity: on ? 0.85 : 0.7 }}>
                {r.stops.length} stops · {usd(r.netProfit)} net · <span style={{ color: on ? C.paper : tone.color, fontWeight: 600 }}>{pct(r.netMarginPct)}</span>
              </p>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12 }}>
        <Mini label="Revenue" value={usd(active.revenue)} />
        <Mini label="All-in cost" value={usd(active.revenue - active.netProfit)} />
        <Mini label="Net profit" value={usd(active.netProfit)} color={moneyColor(active.netProfit)} accent />
        <Mini label="Net margin" value={pct(active.netMarginPct)} color={marginTone(active.netMarginPct).color} />
        <Mini label="Profit / hr" value={usd(active.profitPerHour, { cents: true })} />
        <Mini label="Drive time" value={`${active.driveTimePct.toFixed(0)}%`} sub={`${active.driveMiles.toFixed(0)} mi`} warn />
      </div>

      <Card title={`${active.route.day} · ${active.crew.name}`} right={
        <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.moss, textDecoration: "none", borderBottom: `1px solid ${C.moss}`, paddingBottom: 2, fontWeight: 600 }}>Open route in Google Maps →</a>
      }>
        <div style={{ overflowX: "auto" }}>
          <table className="ops-tbl">
            <thead>
              <tr>
                <th>Stop</th><th>Tier</th><th>Svc</th><th>Drive</th><th>Revenue</th><th>Labor</th><th>Drive $</th><th>OH</th><th>Net</th><th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {active.stops.map((s, i) => {
                const tone = marginTone(s.netMarginPct);
                return (
                  <tr key={s.property.id}>
                    <td>
                      <span style={{ color: C.stone, marginRight: 8 }}>{i + 1}</span>
                      <span style={{ fontWeight: 500 }}>{s.property.customer}</span>
                      <span style={{ color: C.stone, fontSize: 11, marginLeft: 6 }}>{s.property.city}</span>
                    </td>
                    <td style={{ textAlign: "left" }}><TierPill tier={s.property.tier} /></td>
                    <td style={{ color: C.stone }}>{hrs(s.serviceHours)}</td>
                    <td style={{ color: C.stone }}>{hrs(s.driveHours)} · {s.driveMiles.toFixed(0)}mi</td>
                    <td style={{ fontWeight: 500 }}>{usd(s.revenue)}</td>
                    <td style={{ color: C.warn }}>−{usd(s.laborCost)}</td>
                    <td style={{ color: C.warn }}>−{usd(s.driveCost)}</td>
                    <td style={{ color: C.warn }}>−{usd(s.overhead)}</td>
                    <td style={{ fontWeight: 700, color: moneyColor(s.netProfit) }}>{s.netProfit < 0 ? "−" : ""}{usd(Math.abs(s.netProfit))}</td>
                    <td><span style={{ background: tone.bg, color: tone.color, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 3 }}>{pct(s.netMarginPct)}</span></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: "right", fontWeight: 600, color: C.stone, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: 14 }}>Route total +return</td>
                <td style={{ fontWeight: 700, paddingTop: 14 }}>{usd(active.revenue)}</td>
                <td style={{ fontWeight: 700, color: C.warn, paddingTop: 14 }}>−{usd(active.laborCost)}</td>
                <td style={{ fontWeight: 700, color: C.warn, paddingTop: 14 }}>−{usd(active.driveCost)}</td>
                <td style={{ fontWeight: 700, color: C.warn, paddingTop: 14 }}>−{usd(active.overhead)}</td>
                <td style={{ fontWeight: 800, color: moneyColor(active.netProfit), paddingTop: 14 }}>{usd(active.netProfit)}</td>
                <td style={{ fontWeight: 700, paddingTop: 14 }}>{pct(active.netMarginPct)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p style={{ fontSize: 12, color: C.stone, margin: "14px 0 0", lineHeight: 1.5 }}>
          Drive $ includes the return-to-shop leg ({active.route.returnToShop.driveMiles.toFixed(0)} mi) at the route level — unbilled windshield time that quietly eats margin. Watch any stop where the margin pill turns amber or red.
        </p>
      </Card>
    </div>
  );
}

function TierPill({ tier }: { tier: keyof typeof TIER_LABEL }) {
  const tones: Record<string, { bg: string; c: string }> = {
    essentials: { bg: "rgba(14,165,233,0.12)", c: "#0369a1" },
    full_care: { bg: "rgba(21,128,61,0.12)", c: C.moss },
    estate: { bg: "rgba(168,85,247,0.14)", c: "#7e22ce" },
  };
  const t = tones[tier];
  return <span style={{ background: t.bg, color: t.c, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 3, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{TIER_LABEL[tier]}</span>;
}

/* ════════════════════ CREW TAB ════════════════════ */
function CrewTab({ E, dataset }: { E: OpsEngine; dataset: OpsDataset }) {
  const assumptions = dataset.assumptions;
  const router = useRouter();
  const crews = useMemo(() => E.crewProfitability(), [E]);
  const emps = useMemo(() => E.employeeCosts(), [E]);
  const [editing, setEditing] = useState<Employee | null | "new">(null);
  const closeAndRefresh = () => { setEditing(null); router.refresh(); };
  const sides: CrewSide[] = ["maintenance", "construction"];

  return (
    <div style={{ display: "grid", gap: 28 }}>
      {editing !== null && (
        <EmployeeForm
          employee={editing === "new" ? null : editing}
          crews={dataset.crews}
          onClose={() => setEditing(null)}
          onDone={closeAndRefresh}
        />
      )}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Crews &amp; Pay</p>
          <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>What each crew costs — and earns.</h2>
          <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
            Burdened wages, weekly hours, and the profit each crew throws off after their loaded labor cost.
          </p>
        </div>
        <AddBtn onClick={() => setEditing("new")}>+ Add employee</AddBtn>
      </div>

      {sides.map((side) => {
        const sideCrews = crews.filter((c) => c.crew.side === side);
        if (sideCrews.length === 0) return null;
        return (
          <div key={side}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
              <h3 style={{ fontFamily: FONT_DISP, fontSize: 22, fontWeight: 500, color: C.ink, margin: 0 }}>{SIDE_LABEL[side]}</h3>
              <span style={{ fontSize: 12, color: C.stone }}>{side === "maintenance" ? "runs the weekly routes" : "runs build projects"}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16 }}>
              {sideCrews.map((c) => <CrewCard key={c.crew.id} c={c} />)}
            </div>
          </div>
        );
      })}

      <Card title="Employee roster · pay + loaded cost">
        <div style={{ overflowX: "auto" }}>
          <table className="ops-tbl">
            <thead>
              <tr>
                <th>Employee</th><th>Role</th><th>Pay</th><th>Base $/hr</th><th>Burden</th><th>Loaded $/hr</th><th>Wk hrs</th><th>Wk labor cost</th><th></th>
              </tr>
            </thead>
            <tbody>
              {emps.map((e) => (
                <tr key={e.employee.id}>
                  <td style={{ fontWeight: 500 }}>{e.employee.name}</td>
                  <td style={{ textAlign: "left", color: C.stone, fontSize: 12 }}>{e.employee.role}</td>
                  <td style={{ color: C.stone }}>{e.employee.payType}</td>
                  <td>{usd(e.employee.hourlyRate)}</td>
                  <td style={{ color: C.stone }}>+{(e.burdenPct * 100).toFixed(0)}%</td>
                  <td style={{ fontWeight: 500 }}>{usd(e.burdenedHourly, { cents: true })}</td>
                  <td style={{ color: e.weeklyHours > 0 ? C.ink : C.stone }}>{e.weeklyHours > 0 ? hrs(e.weeklyHours) : "—"}</td>
                  <td style={{ fontWeight: 600, color: e.weeklyLaborCost > 0 ? C.warn : C.stone }}>{e.weeklyLaborCost > 0 ? usd(e.weeklyLaborCost) : (e.employee.billable ? "build crew" : "office")}</td>
                  <td><EditLink onClick={() => setEditing(e.employee)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: C.stone, margin: "14px 0 0", lineHeight: 1.5 }}>
          Bonnie&apos;s field hours sit in overhead (she runs the route but isn&apos;t billed against a stop). &quot;Loaded $/hr&quot; is base wage + {(assumptions.laborBurdenPct * 100).toFixed(0)}% burden — the number that actually hits a job cost.
        </p>
      </Card>
    </div>
  );
}

function CrewStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: C.stone, margin: 0 }}>{label}</p>
      <p style={{ fontFamily: FONT_DISP, fontSize: 22, fontWeight: 500, color: color ?? C.ink, margin: "2px 0 0", letterSpacing: "-0.01em" }}>{value}</p>
    </div>
  );
}

function CrewCard({ c }: { c: CrewProfitability }) {
  const [open, setOpen] = useState(false);
  const hasRoutes = c.routeBreakdown.length > 0;
  return (
    <div style={{ background: C.bone, border: "1px solid rgba(168,162,148,0.35)", padding: "20px 22px", borderTop: `3px solid ${c.crew.color}` }}>
      <p style={{ fontFamily: FONT_DISP, fontSize: 20, fontWeight: 500, color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>{c.crew.name}</p>
      <p style={{ fontSize: 12, color: C.stone, margin: "3px 0 16px" }}>{c.members.length} people · {usd(c.burdenedWage, { cents: true })}/hr loaded</p>

      {hasRoutes ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <CrewStat label="Money in / week" value={usd(c.weeklyRevenue)} />
            <CrewStat label="Profit / week" value={usd(c.weeklyNetProfit)} color={moneyColor(c.weeklyNetProfit)} />
            <CrewStat label="Margin" value={pct(c.netMarginPct)} color={marginTone(c.netMarginPct).color} />
            <CrewStat label="Profit / hr" value={usd(c.profitPerHour, { cents: true })} />
          </div>
          {c.weeklyOvertimeCost > 0 && (
            <p style={{ fontSize: 12, color: C.warn, margin: "10px 0 0", fontWeight: 500 }}>
              Profit already takes out −{usd(c.weeklyOvertimeCost)} of overtime this week.
            </p>
          )}
          <button type="button" onClick={() => setOpen(!open)}
            style={{ marginTop: 14, background: "transparent", border: 0, color: C.moss, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, textDecoration: "underline", textUnderlineOffset: 2 }}>
            {open ? "Hide what they did ▲" : "See what they did this week ▾"}
          </button>
          {open && (
            <div style={{ marginTop: 12, overflowX: "auto" }}>
              <table className="ops-tbl">
                <thead>
                  <tr><th>Day</th><th>Stops</th><th>Hours</th><th>Money in</th><th>Cost</th><th>Profit</th><th>Margin</th></tr>
                </thead>
                <tbody>
                  {c.routeBreakdown.map((r) => (
                    <tr key={r.routeId}>
                      <td style={{ fontWeight: 500 }}>{r.day}</td>
                      <td style={{ color: C.stone }}>{r.stops}</td>
                      <td style={{ color: C.stone }}>{hrs(r.hours)}</td>
                      <td>{usd(r.revenue)}</td>
                      <td style={{ color: C.warn }}>−{usd(r.cost)}</td>
                      <td style={{ fontWeight: 700, color: moneyColor(r.netProfit) }}>{r.netProfit < 0 ? "−" : ""}{usd(Math.abs(r.netProfit))}</td>
                      <td><span style={{ background: marginTone(r.netMarginPct).bg, color: marginTone(r.netMarginPct).color, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 3 }}>{pct(r.netMarginPct)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: 11, color: C.stone, margin: "10px 0 0", lineHeight: 1.5 }}>
                This is how you spot a crew to tweak — a low-margin day usually means too much drive time for the work, or prices set too low.
              </p>
            </div>
          )}
        </>
      ) : (
        <div style={{ background: C.sage, padding: "14px 16px", fontSize: 13, color: C.ink, lineHeight: 1.55 }}>
          Build crew — paid by the <strong>project</strong>, not a weekly route. Job profit will show here once jobs are added. Their pay still counts in payroll below.
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {c.members.map((m) => (
          <span key={m.id} style={{ fontSize: 11, background: C.sage, color: C.ink, padding: "4px 9px", borderRadius: 3 }}>
            {m.name.split(" ")[0]} · {usd(m.hourlyRate)}/hr
          </span>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════ CUSTOMERS TAB ════════════════════ */
function CustomersTab({ E, dataset }: { E: OpsEngine; dataset: OpsDataset }) {
  const router = useRouter();
  const all = useMemo(() => E.customerProfitability(), [E]);
  const [sort, setSort] = useState<"margin" | "revenue">("margin");
  const [editing, setEditing] = useState<Property | null | "new">(null);
  const closeAndRefresh = () => { setEditing(null); router.refresh(); };
  const propsById = useMemo(() => Object.fromEntries(dataset.properties.map((p) => [p.id, p])), [dataset.properties]);
  const rows = useMemo(() => {
    const r = [...all];
    r.sort((a, b) => sort === "margin" ? a.netMarginPct - b.netMarginPct : b.monthlyRevenue - a.monthlyRevenue);
    return r;
  }, [all, sort]);

  const losers = all.filter((c) => c.losingMoney || c.netMarginPct < 15).length;
  const totalMrr = all.reduce((s, c) => s + c.monthlyRevenue, 0);
  const totalProfit = all.reduce((s, c) => s + c.monthlyNetProfit, 0);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {editing !== null && (
        <PropertyForm
          property={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onDone={closeAndRefresh}
        />
      )}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Maintenance Customers</p>
          <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>Who&apos;s actually profitable.</h2>
          <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
            {all.length} recurring properties · {usd(totalMrr)}/mo revenue · {usd(totalProfit)}/mo net · <span style={{ color: losers > 0 ? C.warn : C.moss, fontWeight: 600 }}>{losers} below 15% margin</span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Toggle value={sort} onChange={setSort} options={[{ id: "margin", label: "By margin" }, { id: "revenue", label: "By revenue" }]} />
          <AddBtn onClick={() => setEditing("new")}>+ Add customer</AddBtn>
        </div>
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table className="ops-tbl">
            <thead>
              <tr>
                <th>Customer</th><th>City</th><th>Tier</th><th>Crew</th><th>$/visit</th><th>MRR</th><th>Net/visit</th><th>Net/mo</th><th>Margin</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const tone = marginTone(c.netMarginPct);
                return (
                  <tr key={c.property.id}>
                    <td style={{ fontWeight: 500 }}>{c.property.customer}</td>
                    <td style={{ textAlign: "left", color: C.stone, fontSize: 12 }}>{c.property.city}</td>
                    <td style={{ textAlign: "left" }}><TierPill tier={c.property.tier} /></td>
                    <td style={{ textAlign: "left", color: C.stone, fontSize: 12 }}>{c.crew ? c.crew.name.split("'")[0] + "'s" : "—"}</td>
                    <td>{usd(c.property.pricePerVisitUsd)}</td>
                    <td style={{ fontWeight: 500 }}>{usd(c.monthlyRevenue)}</td>
                    <td style={{ color: moneyColor(c.perVisit?.netProfit ?? 0) }}>{c.perVisit ? (c.perVisit.netProfit < 0 ? "−" : "") + usd(Math.abs(c.perVisit.netProfit)) : "—"}</td>
                    <td style={{ fontWeight: 700, color: moneyColor(c.monthlyNetProfit) }}>{c.monthlyNetProfit < 0 ? "−" : ""}{usd(Math.abs(c.monthlyNetProfit))}</td>
                    <td><span style={{ background: tone.bg, color: tone.color, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 3 }}>{pct(c.netMarginPct)}</span></td>
                    <td><EditLink onClick={() => setEditing(propsById[c.property.id] ?? c.property)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: C.stone, margin: "14px 0 0", lineHeight: 1.5 }}>
          Sorted worst-margin first so the money-losers surface at the top. A thin or negative margin usually means the drive is too long for the ticket — re-sequence the route, cluster the stop, or raise the price.
        </p>
      </Card>
    </div>
  );
}

/* ════════════════════ MAP TAB ════════════════════ */
function MapTab({ E, shop }: { E: OpsEngine; shop: ShopInfo }) {
  const routes = useMemo<RouteEconomics[]>(() => E.allRouteEconomics(), [E]);
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Service Map</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>Every property, color-coded by profit.</h2>
        <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
          Green = healthy margin, amber = thin, red = losing money. Lines trace each crew&apos;s route from the shop. Click a pin for the stop&apos;s economics.
        </p>
      </div>
      <div style={{ border: "1px solid rgba(168,162,148,0.4)" }}>
        <OpsMap routes={routes} shop={shop} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: C.ink }}>
        <Legend color={C.moss} label="Healthy (15%+ margin)" />
        <Legend color={C.warn} label="Thin (0–15%)" />
        <Legend color={C.loss} label="Losing money" />
        <Legend color={C.bark} label="Shop / yard" square />
      </div>
    </div>
  );
}

function Legend({ color, label, square }: { color: string; label: string; square?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 12, height: 12, borderRadius: square ? 2 : "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

/* ════════════════════ EDIT FORMS ════════════════════ */
async function opsMutate(entity: string, op: "upsert" | "delete", row: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/clients/mt-view-landscaping/ops/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity, op, row }),
    });
    const j = await res.json();
    return { ok: !!j.ok, error: j.error };
  } catch {
    return { ok: false, error: "Network error." };
  }
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(28,31,26,0.45)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 1rem", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.paper, width: "100%", maxWidth: 560, border: `1px solid rgba(168,162,148,0.5)`, boxShadow: "0 20px 60px rgba(28,31,26,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid rgba(168,162,148,0.3)` }}>
          <h3 style={{ fontFamily: FONT_DISP, fontSize: 22, fontWeight: 500, color: C.ink, margin: 0 }}>{title}</h3>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: 0, fontSize: 22, color: C.stone, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: "22px" }}>{children}</div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.stone, fontWeight: 600, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid rgba(168,162,148,0.5)", background: C.bone, fontSize: 14, fontFamily: FONT_BODY, color: C.ink, outline: "none" };

function Fld({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: C.stone, margin: "4px 0 0" }}>{hint}</p>}
    </div>
  );
}

function FormActions({ onCancel, onDelete, saving, deleting, isEdit }: { onCancel: () => void; onDelete?: () => void; saving: boolean; deleting?: boolean; isEdit: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
      <button type="submit" disabled={saving} style={{ background: C.moss, color: C.paper, border: 0, padding: "12px 24px", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: FONT_BODY }}>
        {saving ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={onCancel} style={{ background: "transparent", color: C.ink, border: `1px solid rgba(168,162,148,0.5)`, padding: "12px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT_BODY }}>
        Cancel
      </button>
      {isEdit && onDelete && (
        <button type="button" onClick={onDelete} disabled={deleting} style={{ marginLeft: "auto", background: "transparent", color: C.loss, border: `1px solid ${C.loss}40`, padding: "12px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT_BODY }}>
          {deleting ? "Removing…" : "Remove"}
        </button>
      )}
    </div>
  );
}

function EmployeeForm({ employee, crews, onClose, onDone }: { employee: Employee | null; crews: Crew[]; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({
    name: employee?.name ?? "",
    role: employee?.role ?? "",
    payType: employee?.payType ?? "hourly",
    hourlyRate: String(employee?.hourlyRate ?? ""),
    crewId: employee?.crewId ?? "",
    tenureYears: String(employee?.tenureYears ?? ""),
    phone: employee?.phone ?? "",
    billable: employee?.billable ?? true,
    overtimeHoursWeekly: String(employee?.overtimeHoursWeekly ?? ""),
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) { setErr("Name is required."); return; }
    setSaving(true); setErr("");
    const row: Record<string, unknown> = { ...f, hourlyRate: f.hourlyRate || 0, tenureYears: f.tenureYears || 0, overtimeHoursWeekly: f.overtimeHoursWeekly || 0 };
    if (employee) row.id = employee.id;
    const res = await opsMutate("employees", "upsert", row);
    setSaving(false);
    if (res.ok) onDone(); else setErr(res.error ?? "Save failed.");
  }
  async function remove() {
    if (!employee) return;
    setDeleting(true);
    const res = await opsMutate("employees", "delete", { id: employee.id });
    setDeleting(false);
    if (res.ok) onDone(); else setErr(res.error ?? "Remove failed.");
  }

  return (
    <Modal title={employee ? "Edit employee" : "Add employee"} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <Fld label="Name"><input style={inputStyle} value={f.name} onChange={(e) => set("name", e.target.value)} autoFocus /></Fld>
        <Fld label="Role"><input style={inputStyle} value={f.role} onChange={(e) => set("role", e.target.value)} placeholder="Crew · Maintenance" /></Fld>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Fld label="Pay type">
            <select style={inputStyle} value={f.payType} onChange={(e) => set("payType", e.target.value)}>
              <option value="hourly">Hourly</option>
              <option value="salary">Salary</option>
            </select>
          </Fld>
          <Fld label="Rate ($/hr)" hint="Salaried: hourly equivalent">
            <input style={inputStyle} type="number" step="0.01" value={f.hourlyRate} onChange={(e) => set("hourlyRate", e.target.value)} />
          </Fld>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Fld label="Crew" hint="Switch sides by moving them to a different crew">
            <select style={inputStyle} value={f.crewId} onChange={(e) => set("crewId", e.target.value)}>
              <option value="">— None (office / overhead) —</option>
              {crews.map((c) => <option key={c.id} value={c.id}>{c.name} ({SIDE_LABEL[c.side]})</option>)}
            </select>
          </Fld>
          <Fld label="Tenure (yrs)"><input style={inputStyle} type="number" step="1" value={f.tenureYears} onChange={(e) => set("tenureYears", e.target.value)} /></Fld>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Fld label="Phone"><input style={inputStyle} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Fld>
          <Fld label="Overtime hrs / week" hint="Paid at the OT rate">
            <input style={inputStyle} type="number" step="0.5" value={f.overtimeHoursWeekly} onChange={(e) => set("overtimeHoursWeekly", e.target.value)} />
          </Fld>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.ink, cursor: "pointer" }}>
          <input type="checkbox" checked={f.billable} onChange={(e) => set("billable", e.target.checked)} style={{ accentColor: C.moss, width: 16, height: 16 }} />
          Billable to routes (uncheck for owners/admin whose time is overhead)
        </label>
        {err && <p style={{ color: C.loss, fontSize: 13, margin: 0 }}>{err}</p>}
        <FormActions onCancel={onClose} onDelete={remove} saving={saving} deleting={deleting} isEdit={!!employee} />
      </form>
    </Modal>
  );
}

function PropertyForm({ property, onClose, onDone }: { property: Property | null; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({
    customer: property?.customer ?? "",
    address: property?.address ?? "",
    city: property?.city ?? "",
    tier: property?.tier ?? "full_care",
    pricePerVisitUsd: String(property?.pricePerVisitUsd ?? ""),
    materialsPerVisitUsd: String(property?.materialsPerVisitUsd ?? ""),
    visitsPerMonth: String(property?.visitsPerMonth ?? 4),
    lat: property?.lat != null ? String(property.lat) : "",
    lng: property?.lng != null ? String(property.lng) : "",
    startedAt: property?.startedAt ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.customer.trim()) { setErr("Customer name is required."); return; }
    setSaving(true); setErr("");
    const row: Record<string, unknown> = {
      ...f,
      pricePerVisitUsd: f.pricePerVisitUsd || 0,
      materialsPerVisitUsd: f.materialsPerVisitUsd || 0,
      visitsPerMonth: f.visitsPerMonth || 4,
      lat: f.lat === "" ? null : f.lat,
      lng: f.lng === "" ? null : f.lng,
    };
    if (property) row.id = property.id;
    const res = await opsMutate("properties", "upsert", row);
    setSaving(false);
    if (res.ok) onDone(); else setErr(res.error ?? "Save failed.");
  }
  async function remove() {
    if (!property) return;
    setDeleting(true);
    const res = await opsMutate("properties", "delete", { id: property.id });
    setDeleting(false);
    if (res.ok) onDone(); else setErr(res.error ?? "Remove failed.");
  }

  return (
    <Modal title={property ? "Edit customer" : "Add customer"} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <Fld label="Customer / property name"><input style={inputStyle} value={f.customer} onChange={(e) => set("customer", e.target.value)} autoFocus /></Fld>
        <Fld label="Address"><input style={inputStyle} value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="8240 168th Ave SE" /></Fld>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <Fld label="City"><input style={inputStyle} value={f.city} onChange={(e) => set("city", e.target.value)} /></Fld>
          <Fld label="Tier">
            <select style={inputStyle} value={f.tier} onChange={(e) => set("tier", e.target.value)}>
              <option value="essentials">Essentials</option>
              <option value="full_care">Full Care</option>
              <option value="estate">Estate</option>
            </select>
          </Fld>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Fld label="$ / visit"><input style={inputStyle} type="number" step="0.01" value={f.pricePerVisitUsd} onChange={(e) => set("pricePerVisitUsd", e.target.value)} /></Fld>
          <Fld label="Materials / visit"><input style={inputStyle} type="number" step="0.01" value={f.materialsPerVisitUsd} onChange={(e) => set("materialsPerVisitUsd", e.target.value)} /></Fld>
          <Fld label="Visits / mo"><input style={inputStyle} type="number" step="1" value={f.visitsPerMonth} onChange={(e) => set("visitsPerMonth", e.target.value)} /></Fld>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Fld label="Lat" hint="for the map"><input style={inputStyle} type="number" step="0.0001" value={f.lat} onChange={(e) => set("lat", e.target.value)} /></Fld>
          <Fld label="Lng" hint="for the map"><input style={inputStyle} type="number" step="0.0001" value={f.lng} onChange={(e) => set("lng", e.target.value)} /></Fld>
        </div>
        <p style={{ fontSize: 12, color: C.stone, margin: 0, lineHeight: 1.5 }}>
          New customers show revenue immediately; profit/margin appears once they&apos;re added to a route day (route editing — next).
        </p>
        {err && <p style={{ color: C.loss, fontSize: 13, margin: 0 }}>{err}</p>}
        <FormActions onCancel={onClose} onDelete={remove} saving={saving} deleting={deleting} isEdit={!!property} />
      </form>
    </Modal>
  );
}

function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{ background: C.bark, color: C.paper, border: 0, padding: "10px 18px", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
      {children}
    </button>
  );
}

function EditLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ background: "transparent", border: 0, color: C.moss, cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "2px 6px", textDecoration: "underline", textUnderlineOffset: 2 }}>
      Edit
    </button>
  );
}

/* ════════════════════ SETUP TAB ════════════════════ */
function SetupTab({ dataset }: { dataset: OpsDataset }) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const [editVehicle, setEditVehicle] = useState<Vehicle | null | "new">(null);
  const [editCrew, setEditCrew] = useState<Crew | null | "new">(null);
  const vehName = (id: string) => dataset.vehicles.find((v) => v.id === id)?.name ?? "—";

  return (
    <div style={{ display: "grid", gap: 28 }}>
      {editVehicle !== null && (
        <VehicleForm vehicle={editVehicle === "new" ? null : editVehicle} onClose={() => setEditVehicle(null)} onDone={() => { setEditVehicle(null); refresh(); }} />
      )}
      {editCrew !== null && (
        <CrewForm crew={editCrew === "new" ? null : editCrew} vehicles={dataset.vehicles} onClose={() => setEditCrew(null)} onDone={() => { setEditCrew(null); refresh(); }} />
      )}

      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Setup</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>Change the numbers behind it all.</h2>
        <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
          Edit your business numbers, trucks, and crews here. Everything else on the other tabs updates the moment you save.
        </p>
      </div>

      {/* Business numbers */}
      <AssumptionsForm assumptions={dataset.assumptions} onDone={refresh} />

      {/* Trucks */}
      <Card title="Trucks">
        <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.55, margin: "0 0 14px" }}>
          A truck&apos;s gas mileage and upkeep set its cost per mile. Change a truck and every route that uses it re-prices itself.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {dataset.vehicles.map((v) => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: C.paper, border: "1px solid rgba(168,162,148,0.3)", padding: "12px 14px" }}>
              <div>
                <p style={{ fontWeight: 600, color: C.ink, margin: 0, fontSize: 14 }}>{v.name}</p>
                <p style={{ fontSize: 12, color: C.stone, margin: "2px 0 0" }}>{v.mpg} mpg · {usd(v.fuelCostPerGal, { cents: true })}/gal gas · {usd(v.maintenancePerMile, { cents: true })}/mi upkeep</p>
              </div>
              <EditLink onClick={() => setEditVehicle(v)} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}><AddBtn onClick={() => setEditVehicle("new")}>+ Add truck</AddBtn></div>
      </Card>

      {/* Crews */}
      <Card title="Crews">
        <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.55, margin: "0 0 14px" }}>
          Set which side a crew works and which truck they drive. Move people between crews on the Crew tab.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {dataset.crews.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: C.paper, border: "1px solid rgba(168,162,148,0.3)", borderLeft: `3px solid ${c.color}`, padding: "12px 14px" }}>
              <div>
                <p style={{ fontWeight: 600, color: C.ink, margin: 0, fontSize: 14 }}>{c.name}</p>
                <p style={{ fontSize: 12, color: C.stone, margin: "2px 0 0" }}>{SIDE_LABEL[c.side]} · drives {vehName(c.vehicleId)} · {c.memberIds.length} people</p>
              </div>
              <EditLink onClick={() => setEditCrew(c)} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}><AddBtn onClick={() => setEditCrew("new")}>+ Add crew</AddBtn></div>
      </Card>
    </div>
  );
}

function AssumptionsForm({ assumptions, onDone }: { assumptions: OpsAssumptions; onDone: () => void }) {
  const [burden, setBurden] = useState(String(Math.round(assumptions.laborBurdenPct * 100)));
  const [ohShare, setOhShare] = useState(String(Math.round(assumptions.maintenanceOverheadSharePct * 100)));
  const [tax, setTax] = useState(String(Math.round(assumptions.taxSetAsidePct * 100)));
  const [otMult, setOtMult] = useState(String(assumptions.overtimeMultiplier));
  const [lines, setLines] = useState(assumptions.monthlyOverhead.map((l) => ({ label: l.label, monthlyUsd: String(l.monthlyUsd) })));
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const setLine = (i: number, k: "label" | "monthlyUsd", v: string) =>
    setLines((p) => p.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  const addLine = () => setLines((p) => [...p, { label: "", monthlyUsd: "" }]);
  const removeLine = (i: number) => setLines((p) => p.filter((_, idx) => idx !== i));

  async function save() {
    setSaving(true); setErr(""); setDone(false);
    const row = {
      laborBurdenPct: (parseFloat(burden) || 0) / 100,
      maintenanceOverheadSharePct: (parseFloat(ohShare) || 0) / 100,
      taxSetAsidePct: (parseFloat(tax) || 0) / 100,
      overtimeMultiplier: parseFloat(otMult) || 1.5,
      overheadLines: lines
        .map((l) => ({ label: l.label.trim(), monthlyUsd: parseFloat(l.monthlyUsd) || 0 }))
        .filter((l) => l.label),
    };
    const res = await opsMutate("assumptions", "upsert", row);
    setSaving(false);
    if (res.ok) { setDone(true); onDone(); } else setErr(res.error ?? "Save failed.");
  }

  return (
    <Card title="Business numbers">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px,1fr))", gap: 14 }}>
        <Fld label="Extra payroll cost %" hint="taxes, insurance, etc.">
          <input style={inputStyle} type="number" step="1" value={burden} onChange={(e) => setBurden(e.target.value)} />
        </Fld>
        <Fld label="Office cost share %" hint="maintenance's slice">
          <input style={inputStyle} type="number" step="1" value={ohShare} onChange={(e) => setOhShare(e.target.value)} />
        </Fld>
        <Fld label="Save for taxes %">
          <input style={inputStyle} type="number" step="1" value={tax} onChange={(e) => setTax(e.target.value)} />
        </Fld>
        <Fld label="Overtime pay rate" hint="1.5 = time-and-a-half">
          <input style={inputStyle} type="number" step="0.1" value={otMult} onChange={(e) => setOtMult(e.target.value)} />
        </Fld>
      </div>

      <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.stone, fontWeight: 600, margin: "22px 0 10px" }}>Monthly office costs</p>
      <div style={{ display: "grid", gap: 8 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input style={{ ...inputStyle, flex: 2 }} value={l.label} placeholder="What it's for" onChange={(e) => setLine(i, "label", e.target.value)} />
            <input style={{ ...inputStyle, flex: 1 }} type="number" value={l.monthlyUsd} placeholder="$ / mo" onChange={(e) => setLine(i, "monthlyUsd", e.target.value)} />
            <button type="button" onClick={() => removeLine(i)} style={{ background: "transparent", border: 0, color: C.loss, cursor: "pointer", fontSize: 18, padding: "0 6px" }}>✕</button>
          </div>
        ))}
        <button type="button" onClick={addLine} style={{ background: "transparent", border: `1px dashed rgba(168,162,148,0.6)`, color: C.moss, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: "9px", fontFamily: FONT_BODY }}>+ Add a cost</button>
      </div>

      {err && <p style={{ color: C.loss, fontSize: 13, margin: "12px 0 0" }}>{err}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
        <button type="button" onClick={save} disabled={saving} style={{ background: C.moss, color: C.paper, border: 0, padding: "12px 24px", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: FONT_BODY }}>
          {saving ? "Saving…" : "Save numbers"}
        </button>
        {done && <span style={{ fontSize: 13, color: C.moss, fontWeight: 600 }}>Saved ✓</span>}
      </div>
    </Card>
  );
}

function VehicleForm({ vehicle, onClose, onDone }: { vehicle: Vehicle | null; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({
    name: vehicle?.name ?? "",
    mpg: String(vehicle?.mpg ?? ""),
    fuelCostPerGal: String(vehicle?.fuelCostPerGal ?? "4.85"),
    maintenancePerMile: String(vehicle?.maintenancePerMile ?? "0.18"),
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) { setErr("Give the truck a name."); return; }
    setSaving(true); setErr("");
    const row: Record<string, unknown> = { ...f, mpg: f.mpg || 0, fuelCostPerGal: f.fuelCostPerGal || 0, maintenancePerMile: f.maintenancePerMile || 0 };
    if (vehicle) row.id = vehicle.id;
    const res = await opsMutate("vehicles", "upsert", row);
    setSaving(false);
    if (res.ok) onDone(); else setErr(res.error ?? "Save failed.");
  }
  async function remove() {
    if (!vehicle) return;
    setDeleting(true);
    const res = await opsMutate("vehicles", "delete", { id: vehicle.id });
    setDeleting(false);
    if (res.ok) onDone(); else setErr(res.error ?? "Remove failed.");
  }

  return (
    <Modal title={vehicle ? "Edit truck" : "Add truck"} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <Fld label="Truck name"><input style={inputStyle} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Truck 1 — F-250" autoFocus /></Fld>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Fld label="Gas mileage (mpg)"><input style={inputStyle} type="number" step="0.1" value={f.mpg} onChange={(e) => set("mpg", e.target.value)} /></Fld>
          <Fld label="Gas $/gallon"><input style={inputStyle} type="number" step="0.01" value={f.fuelCostPerGal} onChange={(e) => set("fuelCostPerGal", e.target.value)} /></Fld>
          <Fld label="Upkeep $/mile" hint="tires, repairs"><input style={inputStyle} type="number" step="0.01" value={f.maintenancePerMile} onChange={(e) => set("maintenancePerMile", e.target.value)} /></Fld>
        </div>
        <p style={{ fontSize: 12, color: C.stone, margin: 0, lineHeight: 1.5 }}>
          Lower gas mileage or higher upkeep makes every mile cost more — so routes that drive a lot will show less profit.
        </p>
        {err && <p style={{ color: C.loss, fontSize: 13, margin: 0 }}>{err}</p>}
        <FormActions onCancel={onClose} onDelete={remove} saving={saving} deleting={deleting} isEdit={!!vehicle} />
      </form>
    </Modal>
  );
}

function CrewForm({ crew, vehicles, onClose, onDone }: { crew: Crew | null; vehicles: Vehicle[]; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({
    name: crew?.name ?? "",
    side: crew?.side ?? "maintenance",
    vehicleId: crew?.vehicleId ?? (vehicles[0]?.id ?? ""),
    color: crew?.color ?? "#2f7d4f",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) { setErr("Give the crew a name."); return; }
    setSaving(true); setErr("");
    const row: Record<string, unknown> = { ...f };
    if (crew) row.id = crew.id;
    const res = await opsMutate("crews", "upsert", row);
    setSaving(false);
    if (res.ok) onDone(); else setErr(res.error ?? "Save failed.");
  }
  async function remove() {
    if (!crew) return;
    setDeleting(true);
    const res = await opsMutate("crews", "delete", { id: crew.id });
    setDeleting(false);
    if (res.ok) onDone(); else setErr(res.error ?? "Remove failed.");
  }

  return (
    <Modal title={crew ? "Edit crew" : "Add crew"} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <Fld label="Crew name"><input style={inputStyle} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Bonnie's Maintenance Crew" autoFocus /></Fld>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Fld label="Side">
            <select style={inputStyle} value={f.side} onChange={(e) => set("side", e.target.value)}>
              <option value="maintenance">Maintenance (runs routes)</option>
              <option value="construction">Construction (runs projects)</option>
            </select>
          </Fld>
          <Fld label="Truck">
            <select style={inputStyle} value={f.vehicleId} onChange={(e) => set("vehicleId", e.target.value)}>
              <option value="">— None —</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Fld>
        </div>
        <Fld label="Color" hint="shows on the map + cards">
          <input type="color" value={f.color} onChange={(e) => set("color", e.target.value)} style={{ width: 60, height: 40, border: "1px solid rgba(168,162,148,0.5)", background: C.bone, cursor: "pointer" }} />
        </Fld>
        {err && <p style={{ color: C.loss, fontSize: 13, margin: 0 }}>{err}</p>}
        <FormActions onCancel={onClose} onDelete={remove} saving={saving} deleting={deleting} isEdit={!!crew} />
      </form>
    </Modal>
  );
}

/* ════════════════════ SHARED BITS ════════════════════ */
function Kpi({ label, value, sub, accent, warn }: { label: string; value: string; sub?: string; accent?: boolean; warn?: boolean }) {
  const bg = accent ? C.mossSoft : warn ? C.warnSoft : C.bone;
  const border = accent ? "rgba(21,128,61,0.35)" : warn ? "rgba(194,65,12,0.3)" : "rgba(168,162,148,0.35)";
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, padding: "18px 20px" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, fontWeight: 500, margin: 0 }}>{label}</p>
      <p style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 500, color: C.ink, margin: "6px 0 3px", letterSpacing: "-0.018em", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: accent ? C.moss : warn ? C.warn : "rgba(28,31,26,0.6)", margin: 0, fontWeight: accent || warn ? 600 : 400 }}>{sub}</p>}
    </div>
  );
}

function Mini({ label, value, sub, color, accent, warn }: { label: string; value: string; sub?: string; color?: string; accent?: boolean; warn?: boolean }) {
  return (
    <div style={{ background: accent ? C.mossSoft : warn ? C.warnSoft : C.bone, border: `1px solid ${accent ? "rgba(21,128,61,0.3)" : warn ? "rgba(194,65,12,0.25)" : "rgba(168,162,148,0.3)"}`, padding: "12px 14px" }}>
      <p style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: C.stone, fontWeight: 600, margin: 0 }}>{label}</p>
      <p style={{ fontFamily: FONT_DISP, fontSize: 22, fontWeight: 500, color: color ?? C.ink, margin: "3px 0 0", letterSpacing: "-0.01em" }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: C.stone, margin: "1px 0 0" }}>{sub}</p>}
    </div>
  );
}

function Toggle<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[] }) {
  return (
    <div style={{ display: "inline-flex", border: `1px solid rgba(168,162,148,0.5)`, borderRadius: 4, overflow: "hidden" }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)}
            style={{ background: on ? C.ink : "transparent", color: on ? C.paper : C.ink, border: 0, padding: "9px 16px", fontSize: 12, fontWeight: on ? 600 : 500, cursor: "pointer", fontFamily: FONT_BODY }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
