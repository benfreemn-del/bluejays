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
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BILLING_LABEL,
  SIDE_LABEL,
  TIER_LABEL,
  WEEKDAYS,
  type BillingStatus,
  type Crew,
  type CrewSide,
  type DailyRoute,
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
  type CrewPayroll,
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

type TabId = "home" | "pnl" | "routes" | "map" | "crew" | "timeclock" | "customers" | "setup";
const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "home", label: "Home", emoji: "⌂" },
  { id: "pnl", label: "P&L", emoji: "▤" },
  { id: "routes", label: "Routes", emoji: "➔" },
  { id: "map", label: "Map", emoji: "⌖" },
  { id: "crew", label: "Crew", emoji: "✦" },
  { id: "timeclock", label: "Time Clock", emoji: "◷" },
  { id: "customers", label: "Customers", emoji: "◈" },
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

function switchMode(to: "example" | "real") {
  document.cookie = `bj_mtv_ops_mode=${to}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  window.location.reload();
}

export default function OpsClient({ dataset, mode = "example" }: { dataset: OpsDataset; mode?: "example" | "real" }) {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<TabId>("home");

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
      <Header mode={mode} />
      <ModeBanner mode={mode} />
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "1.25rem 1.25rem 4rem" }}>
        <Tabs current={tab} onChange={setTab} />
        <div style={{ marginTop: "2rem" }}>
          {tab === "home" && <HomeTab E={E} dataset={dataset} onGo={setTab} />}
          {tab === "pnl" && <PnlTab E={E} assumptions={dataset.assumptions} />}
          {tab === "routes" && <RoutesTab E={E} dataset={dataset} />}
          {tab === "crew" && <CrewTab E={E} dataset={dataset} />}
          {tab === "timeclock" && <TimeClockTab E={E} dataset={dataset} />}
          {tab === "customers" && <CustomersTab E={E} dataset={dataset} />}
          {tab === "map" && <MapTab E={E} dataset={dataset} />}
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
function Header({ mode }: { mode: "example" | "real" }) {
  const real = mode === "real";
  return (
    <header style={{ background: C.paper, borderBottom: `1px solid rgba(28,31,26,0.08)`, position: "sticky", top: 0, zIndex: 30, backdropFilter: "blur(8px)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", background: C.moss, color: C.paper, fontFamily: FONT_DISP, fontSize: 18, fontWeight: 500 }}>MV</span>
          <div>
            <p style={{ fontFamily: FONT_DISP, fontSize: 18, color: C.ink, fontWeight: 500, letterSpacing: "-0.01em", margin: 0, lineHeight: 1.05 }}>Mountain View</p>
            <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone, marginTop: 2, fontWeight: 500 }}>Operations Backend</p>
          </div>
        </div>
        {/* Example ⇄ Real data switch */}
        <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid rgba(168,162,148,0.5)`, borderRadius: 999, overflow: "hidden", fontFamily: FONT_BODY }}>
          <button type="button" onClick={() => !real || switchMode("example")} disabled={!real}
            style={{ background: !real ? C.bark : "transparent", color: !real ? C.paper : C.ink, border: 0, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: real ? "pointer" : "default" }}>
            Example data
          </button>
          <button type="button" onClick={() => real || switchMode("real")} disabled={real}
            style={{ background: real ? C.moss : "transparent", color: real ? C.paper : C.ink, border: 0, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: real ? "default" : "pointer" }}>
            Real data
          </button>
        </div>
      </div>
    </header>
  );
}

function ModeBanner({ mode }: { mode: "example" | "real" }) {
  const real = mode === "real";
  return (
    <div style={{ background: real ? C.moss : C.warnSoft, color: real ? C.paper : C.bark, borderBottom: `1px solid ${real ? "rgba(0,0,0,0.1)" : "rgba(194,65,12,0.25)"}` }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "9px 1.25rem", fontSize: 13, fontFamily: FONT_BODY, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700 }}>{real ? "● You're on your REAL data." : "● You're viewing EXAMPLE data."}</span>
        <span style={{ opacity: 0.92 }}>
          {real
            ? "Everything you type in here is saved and kept. Build it up over time."
            : "This is a sample so you can see how it works. Flip to “Real data” (top right) to start entering your own — nothing here is lost when you switch."}
        </span>
      </div>
    </div>
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
    { label: "Crew pay (with taxes)", amount: -pl.laborCost, kind: "out" },
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
function RoutesTab({ E, dataset }: { E: OpsEngine; dataset: OpsDataset }) {
  const shop = dataset.shop;
  const router = useRouter();
  const routes = useMemo(() => E.allRouteEconomics(), [E]);
  const [activeId, setActiveId] = useState(routes[0]?.route.id ?? "");
  const active = routes.find((r) => r.route.id === activeId) ?? routes[0];
  const [managing, setManaging] = useState(false);
  const [addingDay, setAddingDay] = useState(false);
  const canBuild = dataset.crews.length > 0;

  const gmapsUrl = useMemo(() => {
    if (!active) return "#";
    const pts = active.stops.map((s) => `${s.property.address}, ${s.property.city}`);
    return `https://www.google.com/maps/dir/${encodeURIComponent(`${shop.address}, ${shop.city}`)}/${pts.map((p) => encodeURIComponent(p)).join("/")}`;
  }, [active, shop]);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {addingDay && <AddRouteDayForm crews={dataset.crews} sortOrder={routes.length} onClose={() => setAddingDay(false)} onDone={() => { setAddingDay(false); router.refresh(); }} />}
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Route Economics</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>Profit on every route.</h2>
        <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
          Each maintenance day, stop by stop — money in against crew pay, drive cost, materials, and office costs.
        </p>
      </div>

      {!active ? (
        <Card>
          <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6, margin: "0 0 14px" }}>
            No routes yet. {canBuild ? "Add a route day — pick a weekday and the crew that runs it, then add your customers to it." : "First add a crew on the Setup tab, then come back here to build your routes."}
          </p>
          {canBuild && <AddBtn onClick={() => setAddingDay(true)}>+ Add a route day</AddBtn>}
        </Card>
      ) : (
        <>
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
            {canBuild && (
              <button type="button" onClick={() => setAddingDay(true)} style={{ background: "transparent", color: C.moss, border: `1px dashed rgba(168,162,148,0.6)`, padding: "12px 16px", cursor: "pointer", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, minWidth: 110 }}>+ New day</button>
            )}
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

      <Card title="Stops on this day" right={
        <button type="button" onClick={() => setManaging((m) => !m)} style={{ background: "transparent", border: 0, color: C.moss, cursor: "pointer", fontSize: 13, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>
          {managing ? "Done" : "Add or remove stops"}
        </button>
      }>
        {managing ? (
          <RouteStopEditor
            route={dataset.routes.find((r) => r.id === active.route.id)!}
            properties={dataset.properties}
            onDone={() => router.refresh()}
          />
        ) : (
          <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.55, margin: 0 }}>
            {active.stops.length} stops on {active.route.day}. Click <strong>Add or remove stops</strong> to put a new customer on this day or take one off — the route re-prices itself.
          </p>
        )}
      </Card>
        </>
      )}
    </div>
  );
}

function AddRouteDayForm({ crews, sortOrder, onClose, onDone }: { crews: Crew[]; sortOrder: number; onClose: () => void; onDone: () => void }) {
  const maint = crews.filter((c) => c.side === "maintenance");
  const [day, setDay] = useState("Monday");
  const [crewId, setCrewId] = useState(maint[0]?.id ?? crews[0]?.id ?? "");
  const [ret, setRet] = useState("20");
  const [retMi, setRetMi] = useState("12");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!crewId) { setErr("Pick a crew."); return; }
    setSaving(true); setErr("");
    const res = await opsMutate("routes", "upsert", {
      day, crewId, returnDriveMinutes: ret || 0, returnDriveMiles: retMi || 0, sortOrder,
    });
    setSaving(false);
    if (res.ok) onDone(); else setErr(res.error ?? "Could not add the day.");
  }

  return (
    <Modal title="Add a route day" onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Fld label="Which day">
            <select style={inputStyle} value={day} onChange={(e) => setDay(e.target.value)}>
              {WEEKDAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Fld>
          <Fld label="Which crew runs it">
            <select style={inputStyle} value={crewId} onChange={(e) => setCrewId(e.target.value)}>
              {crews.map((c) => <option key={c.id} value={c.id}>{c.name} ({SIDE_LABEL[c.side]})</option>)}
            </select>
          </Fld>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Fld label="Drive home after (min)" hint="from the last stop back to the shop"><input style={inputStyle} type="number" step="1" value={ret} onChange={(e) => setRet(e.target.value)} /></Fld>
          <Fld label="Drive home after (mi)"><input style={inputStyle} type="number" step="0.5" value={retMi} onChange={(e) => setRetMi(e.target.value)} /></Fld>
        </div>
        <p style={{ fontSize: 12, color: C.stone, margin: 0, lineHeight: 1.5 }}>
          This makes an empty day for that crew. Next, add your customers to it with &quot;Add or remove stops.&quot;
        </p>
        {err && <p style={{ color: C.loss, fontSize: 13, margin: 0 }}>{err}</p>}
        <FormActions onCancel={onClose} saving={saving} isEdit={false} />
      </form>
    </Modal>
  );
}

function RouteStopEditor({ route, properties, onDone }: { route: DailyRoute; properties: Property[]; onDone: () => void }) {
  const propById = useMemo(() => Object.fromEntries(properties.map((p) => [p.id, p])), [properties]);
  const onRoute = new Set(route.stops.map((s) => s.propertyId));
  const available = properties.filter((p) => !onRoute.has(p.id)).sort((a, b) => a.customer.localeCompare(b.customer));
  const [pid, setPid] = useState(available[0]?.id ?? "");
  const [svc, setSvc] = useState("45");
  const [dmin, setDmin] = useState("15");
  const [dmi, setDmi] = useState("8");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  async function removeStop(stopId: string) {
    setBusy(stopId);
    const res = await opsMutate("route_stops", "delete", { id: stopId });
    setBusy("");
    if (res.ok) onDone(); else setErr(res.error ?? "Could not remove.");
  }
  async function addStop(e: React.FormEvent) {
    e.preventDefault();
    if (!pid) { setErr("Pick a customer to add."); return; }
    setBusy("add"); setErr("");
    const res = await opsMutate("route_stops", "upsert", {
      routeId: route.id, propertyId: pid, seq: route.stops.length + 1,
      serviceMinutes: svc || 0, driveMinutes: dmin || 0, driveMiles: dmi || 0,
    });
    setBusy("");
    if (res.ok) onDone(); else setErr(res.error ?? "Could not add.");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.stone, fontWeight: 600, margin: "0 0 8px" }}>On {route.day} now</p>
        <div style={{ display: "grid", gap: 6 }}>
          {route.stops.map((s, i) => {
            const p = propById[s.propertyId];
            return (
              <div key={s.id ?? i} style={{ display: "flex", alignItems: "center", gap: 10, background: C.paper, border: "1px solid rgba(168,162,148,0.3)", padding: "8px 12px" }}>
                <span style={{ color: C.stone, fontSize: 12, minWidth: 18 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 14, color: C.ink }}>{p?.customer ?? s.propertyId} <span style={{ color: C.stone, fontSize: 12 }}>· {(s.serviceMinutes / 60).toFixed(1)}h · {s.driveMiles.toFixed(0)}mi drive</span></span>
                <button type="button" disabled={!s.id || busy === s.id} onClick={() => s.id && removeStop(s.id)} style={{ background: "transparent", border: 0, color: C.loss, cursor: "pointer", fontSize: 16, padding: "0 4px" }} title="Remove from this day">{busy === s.id ? "…" : "✕"}</button>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={addStop} style={{ background: C.sage, padding: "14px 16px", display: "grid", gap: 12 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.bark, fontWeight: 700, margin: 0 }}>Add a customer to {route.day}</p>
        {available.length === 0 ? (
          <p style={{ fontSize: 13, color: C.ink, margin: 0 }}>Every customer is already on a route. Add a new customer on the Customers tab first.</p>
        ) : (
          <>
            <Fld label="Customer">
              <select style={inputStyle} value={pid} onChange={(e) => setPid(e.target.value)}>
                {available.map((p) => <option key={p.id} value={p.id}>{p.customer} — {p.city}</option>)}
              </select>
            </Fld>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Fld label="Time on site (min)"><input style={inputStyle} type="number" step="5" value={svc} onChange={(e) => setSvc(e.target.value)} /></Fld>
              <Fld label="Drive to it (min)"><input style={inputStyle} type="number" step="1" value={dmin} onChange={(e) => setDmin(e.target.value)} /></Fld>
              <Fld label="Drive to it (mi)"><input style={inputStyle} type="number" step="0.5" value={dmi} onChange={(e) => setDmi(e.target.value)} /></Fld>
            </div>
            <button type="submit" disabled={busy === "add"} style={{ justifySelf: "start", background: C.bark, color: C.paper, border: 0, padding: "10px 20px", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
              {busy === "add" ? "Adding…" : "+ Add to this day"}
            </button>
          </>
        )}
        {err && <p style={{ color: C.loss, fontSize: 13, margin: 0 }}>{err}</p>}
      </form>
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
            What each crew costs (their pay plus taxes), the hours they work, and the profit they bring in after that.
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
                <th>Employee</th><th>Role</th><th>Pay</th><th>Pay $/hr</th><th>+ Taxes</th><th>True cost / hr</th><th>Wk hrs</th><th>Wk pay cost</th><th></th>
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
          &quot;True cost / hr&quot; is their pay plus {(assumptions.laborBurdenPct * 100).toFixed(0)}% for payroll taxes, workers-comp, and insurance — the real number a job costs you. Owners who run a route but aren&apos;t billed to a stop show as office cost.
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
      <p style={{ fontSize: 12, color: C.stone, margin: "3px 0 16px" }}>{c.members.length} people · {usd(c.burdenedWage, { cents: true })}/hr all-in</p>

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
  const [bill, setBill] = useState<"all" | BillingStatus>("all");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    let r = [...all];
    if (bill !== "all") r = r.filter((c) => (propsById[c.property.id]?.billingStatus ?? "unbilled") === bill);
    const qq = q.trim().toLowerCase();
    if (qq) r = r.filter((c) => c.property.customer.toLowerCase().includes(qq) || c.property.city.toLowerCase().includes(qq));
    r.sort((a, b) => sort === "margin" ? a.netMarginPct - b.netMarginPct : b.monthlyRevenue - a.monthlyRevenue);
    return r;
  }, [all, sort, bill, q, propsById]);

  async function cycleBill(p: Property) {
    const cur = p.billingStatus ?? "unbilled";
    const next: BillingStatus = cur === "unbilled" ? "billed" : cur === "billed" ? "paid" : "unbilled";
    await opsMutate("properties", "upsert", { id: p.id, billingStatus: next });
    router.refresh();
  }

  const losers = all.filter((c) => c.losingMoney || c.netMarginPct < 15).length;
  const totalMrr = all.reduce((s, c) => s + c.monthlyRevenue, 0);
  const totalProfit = all.reduce((s, c) => s + c.monthlyNetProfit, 0);
  const owed = dataset.properties.filter((p) => (p.billingStatus ?? "unbilled") !== "paid").reduce((s, p) => s + p.pricePerVisitUsd * dataset.weeksPerMonth, 0);
  const billCounts = { unbilled: 0, billed: 0, paid: 0 } as Record<BillingStatus, number>;
  for (const p of dataset.properties) billCounts[p.billingStatus ?? "unbilled"]++;

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
            {all.length} customers · {usd(totalMrr)}/mo revenue · {usd(totalProfit)}/mo net · <span style={{ color: losers > 0 ? C.warn : C.moss, fontWeight: 600 }}>{losers} below 15% margin</span> · <span style={{ color: owed > 0 ? C.warn : C.moss, fontWeight: 600 }}>{usd(owed)}/mo owed</span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Toggle value={sort} onChange={setSort} options={[{ id: "margin", label: "By margin" }, { id: "revenue", label: "By revenue" }]} />
          <AddBtn onClick={() => setEditing("new")}>+ Add customer</AddBtn>
        </div>
      </div>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a customer or city…"
        style={{ width: "100%", maxWidth: 340, padding: "10px 14px", border: "1px solid rgba(168,162,148,0.5)", background: C.bone, fontSize: 14, fontFamily: FONT_BODY, color: C.ink, outline: "none", borderRadius: 4 }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {([["all", `All ${all.length}`], ["unbilled", `Not billed ${billCounts.unbilled}`], ["billed", `Billed ${billCounts.billed}`], ["paid", `Paid ${billCounts.paid}`]] as [typeof bill, string][]).map(([id, lbl]) => {
          const on = bill === id;
          return (
            <button key={id} type="button" onClick={() => setBill(id)}
              style={{ background: on ? C.ink : "transparent", color: on ? C.paper : C.ink, border: `1px solid ${on ? C.ink : "rgba(168,162,148,0.45)"}`, padding: "7px 13px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: FONT_BODY, borderRadius: 3 }}>
              {lbl}
            </button>
          );
        })}
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table className="ops-tbl">
            <thead>
              <tr>
                <th>Customer</th><th>City</th><th>Plan</th><th>Crew</th><th>Per visit</th><th>Per month</th><th>Profit / mo</th><th>Margin</th><th>Bill</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const tone = marginTone(c.netMarginPct);
                const p = propsById[c.property.id] ?? c.property;
                const bs = p.billingStatus ?? "unbilled";
                const bt = { unbilled: { c: C.warn, bg: C.warnSoft }, billed: { c: "#0369a1", bg: "#e0f2fe" }, paid: { c: C.moss, bg: C.mossSoft } }[bs];
                return (
                  <tr key={c.property.id}>
                    <td style={{ fontWeight: 500 }}>{c.property.customer}</td>
                    <td style={{ textAlign: "left", color: C.stone, fontSize: 12 }}>{c.property.city}</td>
                    <td style={{ textAlign: "left" }}><TierPill tier={c.property.tier} /></td>
                    <td style={{ textAlign: "left", color: C.stone, fontSize: 12 }}>{c.crew ? c.crew.name.split("'")[0] + "'s" : "—"}</td>
                    <td>{usd(c.property.pricePerVisitUsd)}</td>
                    <td style={{ fontWeight: 500 }}>{usd(c.monthlyRevenue)}</td>
                    <td style={{ fontWeight: 700, color: moneyColor(c.monthlyNetProfit) }}>{c.monthlyNetProfit < 0 ? "−" : ""}{usd(Math.abs(c.monthlyNetProfit))}</td>
                    <td><span style={{ background: tone.bg, color: tone.color, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 3 }}>{pct(c.netMarginPct)}</span></td>
                    <td>
                      <button type="button" onClick={() => cycleBill(p)} title="Click to change" style={{ background: bt.bg, color: bt.c, border: 0, fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 3, cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>{BILLING_LABEL[bs]}</button>
                    </td>
                    <td><EditLink onClick={() => setEditing(p)} /></td>
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
function MapTab({ E, dataset }: { E: OpsEngine; dataset: OpsDataset }) {
  const routes = useMemo<RouteEconomics[]>(() => E.allRouteEconomics(), [E]);
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Dispatch Map</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>Pick a crew and a day.</h2>
        <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
          Flip through your crews and the days of the week on the right. The map shows that crew&apos;s route — stops colored by margin (green healthy, amber thin, red losing). Click a pin for the stop&apos;s numbers.
        </p>
      </div>
      <div style={{ border: "1px solid rgba(168,162,148,0.4)" }}>
        <OpsMap routes={routes} crews={dataset.crews} employees={dataset.employees} shop={dataset.shop} />
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

/* ════════════════════ TIME CLOCK TAB ════════════════════ */
function TimeClockTab({ E, dataset }: { E: OpsEngine; dataset: OpsDataset }) {
  const burden = dataset.assumptions.laborBurdenPct;
  const loaded = (e: Employee) => e.hourlyRate * (1 + (e.burdenPctOverride ?? burden));
  const days = [...WEEKDAYS];

  const initial: Record<string, Record<string, string>> = {};
  for (const t of dataset.timesheets) {
    (initial[t.employeeId] ??= {})[t.weekday] = String(t.hours);
  }
  const [grid, setGrid] = useState(initial);
  const [savingCell, setSavingCell] = useState<string>("");

  const cell = (eid: string, d: string) => grid[eid]?.[d] ?? "";
  const empHours = (eid: string) => days.reduce((s, d) => s + (parseFloat(grid[eid]?.[d] || "0") || 0), 0);
  function setCell(eid: string, d: string, v: string) {
    setGrid((p) => ({ ...p, [eid]: { ...(p[eid] || {}), [d]: v } }));
  }
  async function saveCell(eid: string, d: string) {
    const raw = grid[eid]?.[d] ?? "";
    setSavingCell(eid + d);
    await opsMutate("timesheets", "upsert", { employeeId: eid, weekday: d, hours: raw === "" ? 0 : Number(raw) || 0 });
    setSavingCell("");
  }

  const plannedByCrew: Record<string, number> = {};
  for (const p of E.payroll()) plannedByCrew[p.crew.id] = p.plannedHours;

  // live totals from the local grid
  const empById = Object.fromEntries(dataset.employees.map((e) => [e.id, e]));
  function crewTotals(crew: Crew) {
    let hours = 0, cost = 0;
    for (const id of crew.memberIds) {
      const e = empById[id]; if (!e) continue;
      const h = empHours(id); hours += h; cost += h * loaded(e);
    }
    return { hours, cost };
  }
  const sideTotals = (side: CrewSide) =>
    dataset.crews.filter((c) => c.side === side).reduce((acc, c) => {
      const t = crewTotals(c); return { hours: acc.hours + t.hours, cost: acc.cost + t.cost };
    }, { hours: 0, cost: 0 });
  const maint = sideTotals("maintenance");
  const build = sideTotals("construction");

  const sides: CrewSide[] = ["maintenance", "construction"];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Time Clock</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>Hours this week.</h2>
        <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0", maxWidth: 640 }}>
          Type each person&apos;s hours for the day. The build crews are tracked here only — no job paperwork. Maintenance hours get checked against the route plan so you can see if a crew ran over.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
        <Mini label="Total hours" value={hrs(maint.hours + build.hours)} accent />
        <Mini label="Total labor cost" value={usd(maint.cost + build.cost)} />
        <Mini label="Maintenance" value={`${hrs(maint.hours)} · ${usd(maint.cost)}`} />
        <Mini label="Construction" value={`${hrs(build.hours)} · ${usd(build.cost)}`} />
      </div>

      {sides.map((side) => (
        <Card key={side} title={`${SIDE_LABEL[side]} crews`}>
          {dataset.crews.filter((c) => c.side === side).map((crew) => {
            const members = crew.memberIds.map((id) => empById[id]).filter(Boolean) as Employee[];
            const t = crewTotals(crew);
            const planned = plannedByCrew[crew.id] ?? 0;
            return (
              <div key={crew.id} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <p style={{ fontWeight: 600, color: C.ink, margin: 0, fontSize: 14 }}>{crew.name}</p>
                  {side === "maintenance" && planned > 0 && (
                    <span style={{ fontSize: 12, color: t.hours > planned + 0.5 ? C.warn : C.stone }}>
                      planned {hrs(planned)} · clocked {hrs(t.hours)}{t.hours > planned + 0.5 ? " · over" : ""}
                    </span>
                  )}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="ops-tbl" style={{ minWidth: 640 }}>
                    <thead>
                      <tr>
                        <th>Person</th>
                        {days.map((d) => <th key={d} style={{ textAlign: "center" }}>{d.slice(0, 3)}</th>)}
                        <th>Hrs</th><th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((e) => (
                        <tr key={e.id}>
                          <td style={{ fontWeight: 500 }}>{e.name}</td>
                          {days.map((d) => (
                            <td key={d} style={{ textAlign: "center", padding: "6px 4px" }}>
                              <input
                                type="number" step="0.5" min="0"
                                value={cell(e.id, d)}
                                onChange={(ev) => setCell(e.id, d, ev.target.value)}
                                onBlur={() => saveCell(e.id, d)}
                                style={{ width: 46, textAlign: "center", padding: "5px 4px", border: `1px solid ${savingCell === e.id + d ? C.moss : "rgba(168,162,148,0.5)"}`, background: C.paper, fontSize: 13, fontFamily: FONT_BODY, borderRadius: 3 }}
                              />
                            </td>
                          ))}
                          <td style={{ fontWeight: 600 }}>{hrs(empHours(e.id))}</td>
                          <td style={{ color: C.warn, fontWeight: 600 }}>{usd(empHours(e.id) * loaded(e))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </Card>
      ))}
      <p style={{ fontSize: 12, color: C.stone, lineHeight: 1.6 }}>
        Hours save on their own as you type. Cost = hours × loaded pay rate (base + {(burden * 100).toFixed(0)}% burden).
      </p>
    </div>
  );
}

/* ════════════════════ HOME TAB ════════════════════ */
function HomeTab({ E, dataset, onGo }: { E: OpsEngine; dataset: OpsDataset; onGo: (t: TabId) => void }) {
  const pl = useMemo(() => E.monthlyProfitAndLoss(), [E]);
  const customers = useMemo(() => E.customerProfitability(), [E]);
  const routes = useMemo(() => E.allRouteEconomics(), [E]);
  const payroll = useMemo(() => E.payroll(), [E]);

  // build the "needs attention" list
  type Alert = { tone: "warn" | "loss" | "info"; text: string; cta: string; go: TabId };
  const alerts: Alert[] = [];

  const losing = customers.filter((c) => c.perVisit && c.perVisit.netProfit < 0);
  const thin = customers.filter((c) => c.perVisit && c.netMarginPct >= 0 && c.netMarginPct < 15);
  if (losing.length) alerts.push({ tone: "loss", text: `${losing.length} customer${losing.length > 1 ? "s are" : " is"} losing money every visit (worst: ${losing.sort((a, b) => a.netMarginPct - b.netMarginPct)[0].property.customer}).`, cta: "See customers", go: "customers" });
  if (thin.length) alerts.push({ tone: "warn", text: `${thin.length} more customers are under 15% margin — too thin.`, cta: "See customers", go: "customers" });

  const badRoutes = routes.filter((r) => r.netMarginPct < 10).sort((a, b) => a.netMarginPct - b.netMarginPct);
  if (badRoutes.length) alerts.push({ tone: "warn", text: `${badRoutes[0].route.day}'s route is only ${pct(badRoutes[0].netMarginPct)} margin — usually too much drive time.`, cta: "See routes", go: "routes" });

  const unbilled = dataset.properties.filter((p) => (p.billingStatus ?? "unbilled") === "unbilled");
  const billedUnpaid = dataset.properties.filter((p) => p.billingStatus === "billed");
  if (unbilled.length) alerts.push({ tone: "warn", text: `${unbilled.length} customers haven't been billed this month.`, cta: "See billing", go: "customers" });
  if (billedUnpaid.length) alerts.push({ tone: "info", text: `${billedUnpaid.length} customers are billed but haven't paid yet.`, cta: "See billing", go: "customers" });

  const over = payroll.filter((p) => p.crew.side === "maintenance" && p.hasClock && p.clockedHours > p.plannedHours + 1);
  if (over.length) alerts.push({ tone: "warn", text: `${over[0].crew.name} clocked ${hrs(over[0].clockedHours)} vs ${hrs(over[0].plannedHours)} planned — running over.`, cta: "See time clock", go: "timeclock" });

  const ot = E.employeeCosts().filter((e) => e.overtimeHours > 0);
  const otTotal = ot.reduce((s, e) => s + e.overtimeCost, 0);
  if (otTotal > 0) alerts.push({ tone: "info", text: `${usd(otTotal * E.weeksPerMonth)}/mo is going to overtime (${ot.length} people).`, cta: "See crew", go: "crew" });

  const buildPay = payroll.filter((p) => p.crew.side === "construction").reduce((s, p) => s + p.laborCost, 0);
  const totalMrr = customers.reduce((s, c) => s + c.monthlyRevenue, 0);
  const owed = dataset.properties.filter((p) => p.billingStatus !== "paid").reduce((s, p) => s + p.pricePerVisitUsd * dataset.weeksPerMonth, 0);

  const toneColor = { warn: C.warn, loss: C.loss, info: "#0369a1" };
  const toneBg = { warn: C.warnSoft, loss: C.lossSoft, info: "#e0f2fe" };

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 10 }}>This Week</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 36, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0, lineHeight: 1.1 }}>
          Good morning, Bonnie.
        </h2>
        <p style={{ fontSize: 16, color: "rgba(28,31,26,0.7)", marginTop: 8, maxWidth: 600 }}>
          Here&apos;s where the maintenance side stands and what needs you today.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px,1fr))", gap: 16 }}>
        <Kpi label="Take-home / month" value={usd(pl.takeHome)} sub={pct(pl.netMarginPct) + " margin"} accent />
        <Kpi label="Recurring revenue" value={usd(totalMrr)} sub={`${customers.length} customers`} />
        <Kpi label="Money owed to you" value={usd(owed)} sub="billed + unbilled" warn={owed > 0} />
        <Kpi label="Build crew payroll" value={usd(buildPay)} sub="from the time clock / wk" />
      </div>

      {dataset.crews.length === 0 && dataset.properties.length === 0 && (
        <Card title="Start here — fill it in, in this order">
          <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 8 }}>
            {[
              ["Setup", "setup", "Add your trucks, then your crews (maintenance and build)."],
              ["Crew", "crew", "Add your people and put them on a crew. Set their pay."],
              ["Customers", "customers", "Add your maintenance customers — what they pay and how often."],
              ["Routes", "routes", "Make a route day for each crew, then add customers to each day."],
              ["Time Clock", "timeclock", "Each week, type in everyone's hours."],
            ].map(([label, id, desc], i) => (
              <li key={id as string}>
                <button type="button" onClick={() => onGo(id as TabId)}
                  style={{ width: "100%", textAlign: "left", background: C.bone, border: "1px solid rgba(168,162,148,0.3)", padding: "11px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: FONT_BODY, borderRadius: 4 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: C.moss, color: C.paper, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontWeight: 700, color: C.ink, fontSize: 14, minWidth: 92 }}>{label}</span>
                  <span style={{ flex: 1, fontSize: 13.5, color: "rgba(28,31,26,0.72)" }}>{desc}</span>
                  <span style={{ color: C.moss, fontWeight: 600 }}>→</span>
                </button>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <Card title="Needs your attention">
        {alerts.length === 0 ? (
          <p style={{ fontSize: 14, color: C.moss }}>All clear — nothing flagged this week.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {alerts.map((a, i) => (
              <li key={i}>
                <button type="button" onClick={() => onGo(a.go)}
                  style={{ width: "100%", textAlign: "left", background: toneBg[a.tone], border: `1px solid ${toneColor[a.tone]}40`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: FONT_BODY, borderRadius: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: toneColor[a.tone], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, color: C.ink, lineHeight: 1.45 }}>{a.text}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: toneColor[a.tone], whiteSpace: "nowrap" }}>{a.cta} →</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Where to go — what each page is for">
        <div style={{ display: "grid", gap: 8 }}>
          {([
            ["pnl", "P&L", "Your bottom line — what you keep after everything is paid."],
            ["customers", "Customers", "Every customer, what they pay, and who's been billed or still owes."],
            ["routes", "Routes", "Each day's route and what it earns. Add or drop a customer from a day."],
            ["map", "Map", "See a crew's route on a map. Click between crews and days."],
            ["crew", "Crew", "Your crews, who's on them, and what they cost versus earn."],
            ["timeclock", "Time Clock", "Type in everyone's hours for the week."],
            ["setup", "Setup", "Change your business numbers, trucks, and crews."],
          ] as [TabId, string, string][]).map(([id, label, desc]) => (
            <button key={id} type="button" onClick={() => onGo(id)}
              style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", background: C.bone, border: "1px solid rgba(168,162,148,0.3)", padding: "12px 14px", cursor: "pointer", fontFamily: FONT_BODY, borderRadius: 4 }}>
              <span style={{ fontWeight: 700, color: C.ink, fontSize: 14, minWidth: 92 }}>{label}</span>
              <span style={{ flex: 1, fontSize: 13.5, color: "rgba(28,31,26,0.72)" }}>{desc}</span>
              <span style={{ color: C.moss, fontWeight: 600 }}>→</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
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
  const [confirm, setConfirm] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
      <button type="submit" disabled={saving} style={{ background: C.moss, color: C.paper, border: 0, padding: "12px 24px", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: FONT_BODY }}>
        {saving ? "Saving…" : "Save"}
      </button>
      <button type="button" onClick={onCancel} style={{ background: "transparent", color: C.ink, border: `1px solid rgba(168,162,148,0.5)`, padding: "12px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT_BODY }}>
        Cancel
      </button>
      {isEdit && onDelete && (
        <button type="button"
          onClick={() => { if (confirm) { onDelete(); } else { setConfirm(true); setTimeout(() => setConfirm(false), 4000); } }}
          disabled={deleting}
          style={{ marginLeft: "auto", background: confirm ? C.loss : "transparent", color: confirm ? C.paper : C.loss, border: `1px solid ${confirm ? C.loss : C.loss + "40"}`, padding: "12px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
          {deleting ? "Removing…" : confirm ? "Tap again to remove" : "Remove"}
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
  // Map-pin lookup: coordinates fill in automatically from the address so the
  // operator never types latitude/longitude by hand.
  const [geo, setGeo] = useState<{ status: "idle" | "looking" | "found" | "notfound"; label?: string }>(
    property?.lat != null && property?.lng != null ? { status: "found" } : { status: "idle" }
  );
  const [showManual, setShowManual] = useState(false);
  const lastLookup = useRef<string>("");
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  // Geocode the current address → lat/lng. Returns the coords if found.
  async function lookupCoords(opts?: { force?: boolean }): Promise<{ lat: string; lng: string } | null> {
    const address = f.address.trim();
    const city = f.city.trim();
    if (!address && !city) return null;
    const key = `${address}|${city}`.toLowerCase();
    if (!opts?.force && key === lastLookup.current) return null; // unchanged since last lookup
    lastLookup.current = key;
    setGeo({ status: "looking" });
    try {
      const res = await fetch(
        `/api/clients/mt-view-landscaping/ops/geocode?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}`
      );
      const j = await res.json();
      if (j.ok) {
        const lat = String(j.lat);
        const lng = String(j.lng);
        setF((p) => ({ ...p, lat, lng }));
        setGeo({ status: "found", label: j.label });
        return { lat, lng };
      }
    } catch {
      /* fall through to not-found */
    }
    setGeo({ status: "notfound" });
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.customer.trim()) { setErr("Customer name is required."); return; }
    setSaving(true); setErr("");
    // Make sure coordinates are filled before saving — if she typed an address
    // but the blur lookup didn't run, do a final geocode now so the map pin lands.
    let lat = f.lat;
    let lng = f.lng;
    if ((lat === "" || lng === "") && (f.address.trim() || f.city.trim())) {
      const found = await lookupCoords({ force: true });
      if (found) { lat = found.lat; lng = found.lng; }
    }
    const row: Record<string, unknown> = {
      ...f,
      pricePerVisitUsd: f.pricePerVisitUsd || 0,
      materialsPerVisitUsd: f.materialsPerVisitUsd || 0,
      visitsPerMonth: f.visitsPerMonth || 4,
      lat: lat === "" ? null : lat,
      lng: lng === "" ? null : lng,
      startedAt: f.startedAt === "" ? null : f.startedAt,
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
        <Fld label="Address"><input style={inputStyle} value={f.address} onChange={(e) => set("address", e.target.value)} onBlur={() => lookupCoords()} placeholder="8240 168th Ave SE" /></Fld>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <Fld label="City"><input style={inputStyle} value={f.city} onChange={(e) => set("city", e.target.value)} onBlur={() => lookupCoords()} /></Fld>
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
        {/* Map pin — fills in automatically from the address. No typing coordinates. */}
        <div style={{ border: "1px solid rgba(168,162,148,0.4)", background: C.bone, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 13, lineHeight: 1.45 }}>
              {geo.status === "idle" && <span style={{ color: C.stone }}>📍 The map pin fills in by itself once you type the address above.</span>}
              {geo.status === "looking" && <span style={{ color: C.ink }}>📍 Finding this address on the map…</span>}
              {geo.status === "found" && <span style={{ color: C.moss, fontWeight: 600 }}>📍 Pinned on the map ✓</span>}
              {geo.status === "notfound" && <span style={{ color: C.ink }}>Couldn&apos;t find that address automatically. Double-check the address, or enter the location by hand below.</span>}
            </div>
            {(f.address.trim() || f.city.trim()) && (
              <button type="button" onClick={() => lookupCoords({ force: true })} style={{ background: "transparent", border: 0, color: C.moss, cursor: "pointer", fontSize: 12, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2, padding: 0, whiteSpace: "nowrap" }}>
                Find again
              </button>
            )}
          </div>
          {geo.status === "found" && geo.label && (
            <p style={{ fontSize: 11, color: C.stone, margin: "6px 0 0" }}>{geo.label}</p>
          )}
          <button type="button" onClick={() => setShowManual((s) => !s)} style={{ background: "transparent", border: 0, color: C.stone, cursor: "pointer", fontSize: 11, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2, padding: 0, marginTop: 8 }}>
            {showManual ? "Hide coordinates" : "Enter location by hand"}
          </button>
          {showManual && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
              <Fld label="Lat"><input style={inputStyle} type="number" step="0.0001" value={f.lat} onChange={(e) => set("lat", e.target.value)} /></Fld>
              <Fld label="Lng"><input style={inputStyle} type="number" step="0.0001" value={f.lng} onChange={(e) => set("lng", e.target.value)} /></Fld>
            </div>
          )}
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
            <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: C.paper, border: "1px solid rgba(168,162,148,0.3)", boxShadow: `inset 3px 0 0 ${c.color}`, padding: "12px 14px 12px 16px" }}>
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
      <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.55, margin: "0 0 16px", maxWidth: 640 }}>
        These four numbers drive every dollar figure in the whole tool. Set them once. If you&apos;re not sure, the numbers already in here are sensible starting points — change them when you know your real figures.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px,1fr))", gap: 14 }}>
        <Fld label="Extra payroll cost %" hint="On top of wages: payroll taxes, workers-comp, insurance.">
          <input style={inputStyle} type="number" step="1" value={burden} onChange={(e) => setBurden(e.target.value)} />
        </Fld>
        <Fld label="Office cost share %" hint="How much of the shop/insurance/admin the maintenance side carries (construction covers the rest).">
          <input style={inputStyle} type="number" step="1" value={ohShare} onChange={(e) => setOhShare(e.target.value)} />
        </Fld>
        <Fld label="Save for taxes %" hint="What you set aside from profit for income tax.">
          <input style={inputStyle} type="number" step="1" value={tax} onChange={(e) => setTax(e.target.value)} />
        </Fld>
        <Fld label="Overtime pay rate" hint="1.5 means time-and-a-half.">
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
