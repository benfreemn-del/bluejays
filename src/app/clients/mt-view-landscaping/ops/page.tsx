"use client";

/**
 * /clients/mt-view-landscaping/ops — Mountain View operations + profitability
 * backend (bespoke). Visual-first build on mock data (mock-ops-data.ts); the
 * job-costing math lives in profit-engine.ts. No DB writes yet — on approval
 * the types promote 1:1 to Supabase tables and the seed arrays become queries.
 *
 * Tabs: P&L · Routes · Crew · Customers · Map
 * Theme matches the Mt View front-end: Paper + Ink + forest green.
 * Password-gated (1976 — founding year), cookie bj_mtv_ops_unlocked.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ASSUMPTIONS,
  MAINTENANCE_OVERHEAD_MONTHLY,
  MONTHLY_OVERHEAD_TOTAL,
  TIER_LABEL,
  SHOP,
} from "./mock-ops-data";
import {
  allRouteEconomics,
  crewBlendedWage,
  crewBurdenedWage,
  crewProfitability,
  customerProfitability,
  employeeCosts,
  monthlyProfitAndLoss,
  overheadPerHour,
  routeEconomics,
  usd,
  pct,
  hrs,
  weeklyBillableHours,
  weeklyProfitAndLoss,
  type ProfitAndLoss,
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

type TabId = "pnl" | "routes" | "crew" | "customers" | "map";
const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "pnl", label: "P&L", emoji: "▤" },
  { id: "routes", label: "Routes", emoji: "➔" },
  { id: "crew", label: "Crew", emoji: "✦" },
  { id: "customers", label: "Customers", emoji: "◈" },
  { id: "map", label: "Map", emoji: "⌖" },
];

/* profit → color */
function moneyColor(n: number): string {
  if (n < 0) return C.loss;
  return C.ink;
}
function marginTone(marginPct: number): { color: string; bg: string; label: string } {
  if (marginPct < 0) return { color: C.loss, bg: C.lossSoft, label: "Losing" };
  if (marginPct < 15) return { color: C.warn, bg: C.warnSoft, label: "Thin" };
  return { color: C.moss, bg: C.mossSoft, label: "Healthy" };
}

export default function MtViewOps() {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<TabId>("pnl");

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
          {tab === "pnl" && <PnlTab />}
          {tab === "routes" && <RoutesTab />}
          {tab === "crew" && <CrewTab />}
          {tab === "customers" && <CustomersTab />}
          {tab === "map" && <MapTab />}
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
          Crews, pay, drive time, and the real profit on every route — once expenses and taxes come out. Mock data for now.
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
          Mock data
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
        <p>Mountain View Landscape &amp; Design · Operations Backend · Mock data only</p>
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
function PnlTab() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const pl = useMemo<ProfitAndLoss>(() => period === "weekly" ? weeklyProfitAndLoss() : monthlyProfitAndLoss(), [period]);
  const ohRate = overheadPerHour();

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 10 }}>Profit &amp; Loss</p>
          <h2 style={{ fontFamily: FONT_DISP, fontSize: 36, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0, lineHeight: 1.1 }}>
            {usd(pl.takeHome)} <span style={{ fontSize: 18, color: C.stone, fontWeight: 400 }}>take-home / {period === "weekly" ? "week" : "month"}</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(28,31,26,0.7)", marginTop: 8, maxWidth: 560 }}>
            {usd(pl.revenue)} in recurring maintenance revenue → {pct(pl.netMarginPct)} net margin after labor, drive, overhead, and a {(ASSUMPTIONS.taxSetAsidePct * 100).toFixed(0)}% tax set-aside.
          </p>
        </div>
        <Toggle value={period} onChange={setPeriod} options={[{ id: "weekly", label: "Weekly" }, { id: "monthly", label: "Monthly" }]} />
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
        <Kpi label="Revenue" value={usd(pl.revenue)} sub="recurring maintenance" />
        <Kpi label="Net profit (pre-tax)" value={usd(pl.netProfit)} sub={pct(pl.netMarginPct) + " margin"} accent />
        <Kpi label="Take-home" value={usd(pl.takeHome)} sub={`after ${(ASSUMPTIONS.taxSetAsidePct * 100).toFixed(0)}% tax set-aside`} />
        <Kpi label="Profit / crew-hour" value={usd(pl.profitPerCrewHour, { cents: true })} sub={`${hrs(pl.totalHours)} billed`} />
        <Kpi label="Drive miles" value={Math.round(pl.driveMiles).toLocaleString()} sub={`${hrs(pl.driveHours)} windshield time`} warn />
      </div>

      {/* P&L breakdown + Overhead */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,3fr) minmax(0,2fr)", gap: 24 }} className="ops-2col">
        <Card title={`Where the money goes · ${period}`}>
          <PnlWaterfall pl={pl} />
        </Card>

        <Card title="Fixed overhead (monthly)">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {ASSUMPTIONS.monthlyOverhead.map((o) => (
              <li key={o.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(168,162,148,0.25)", fontSize: 13 }}>
                <span style={{ color: C.ink }}>{o.label}</span>
                <span style={{ color: C.ink, fontWeight: 500 }}>{usd(o.monthlyUsd)}</span>
              </li>
            ))}
            <li style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0 6px", fontSize: 13, fontWeight: 600, borderBottom: "1px solid rgba(168,162,148,0.25)" }}>
              <span>Whole company / month</span>
              <span>{usd(MONTHLY_OVERHEAD_TOTAL)}</span>
            </li>
            <li style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0 0", fontSize: 14, fontWeight: 700, color: C.moss }}>
              <span>Maintenance share ({(ASSUMPTIONS.maintenanceOverheadSharePct * 100).toFixed(0)}%)</span>
              <span>{usd(MAINTENANCE_OVERHEAD_MONTHLY)}</span>
            </li>
          </ul>
          <div style={{ marginTop: 16, padding: 12, background: C.sage, fontSize: 12, color: C.ink, lineHeight: 1.5 }}>
            Install + design carries the other {(100 - ASSUMPTIONS.maintenanceOverheadSharePct * 100).toFixed(0)}%. Maintenance&apos;s slice, spread across <strong>{hrs(weeklyBillableHours())}</strong> billable crew-hours/week, means every productive hour must clear <strong>{usd(ohRate, { cents: true })}/hr</strong> just to cover the shop, trucks, and admin.
          </div>
        </Card>
      </div>

      <p style={{ fontSize: 12, color: C.stone, lineHeight: 1.6 }}>
        Labor burden of {(ASSUMPTIONS.laborBurdenPct * 100).toFixed(0)}% (payroll taxes, WA workers-comp, insurance, PTO) is layered onto every wage. Drive cost = crew wages while driving + truck fuel &amp; maintenance per mile. Numbers are mock — they go live when crews + customers are wired to the database.
      </p>
    </div>
  );
}

function PnlWaterfall({ pl }: { pl: ProfitAndLoss }) {
  const rows: { label: string; amount: number; kind: "in" | "out" | "net" }[] = [
    { label: "Revenue", amount: pl.revenue, kind: "in" },
    { label: "Crew labor (burdened)", amount: -pl.laborCost, kind: "out" },
    { label: "Drive cost (wages + truck)", amount: -pl.driveCost, kind: "out" },
    { label: "Materials + disposal", amount: -pl.materials, kind: "out" },
    { label: "Gross profit", amount: pl.grossProfit, kind: "net" },
    { label: "Fixed overhead", amount: -pl.overhead, kind: "out" },
    { label: "Net profit (pre-tax)", amount: pl.netProfit, kind: "net" },
    { label: `Tax set-aside (${(ASSUMPTIONS.taxSetAsidePct * 100).toFixed(0)}%)`, amount: -pl.taxSetAside, kind: "out" },
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
function RoutesTab() {
  const routes = useMemo(() => allRouteEconomics(), []);
  const [activeId, setActiveId] = useState(routes[0]?.route.id ?? "");
  const active = routes.find((r) => r.route.id === activeId) ?? routes[0];

  const gmapsUrl = useMemo(() => {
    const pts = active.stops.map((s) => `${s.property.address}, ${s.property.city}`);
    return `https://www.google.com/maps/dir/${encodeURIComponent(`${SHOP.address}, ${SHOP.city}`)}/${pts.map((p) => encodeURIComponent(p)).join("/")}`;
  }, [active]);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Route Economics</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>Profit on every route.</h2>
        <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
          Each maintenance day, stop by stop — revenue against burdened labor, drive cost, materials, and overhead.
        </p>
      </div>

      {/* Day selector */}
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

      {/* Route summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12 }}>
        <Mini label="Revenue" value={usd(active.revenue)} />
        <Mini label="All-in cost" value={usd(active.revenue - active.netProfit)} />
        <Mini label="Net profit" value={usd(active.netProfit)} color={moneyColor(active.netProfit)} accent />
        <Mini label="Net margin" value={pct(active.netMarginPct)} color={marginTone(active.netMarginPct).color} />
        <Mini label="Profit / hr" value={usd(active.profitPerHour, { cents: true })} />
        <Mini label="Drive time" value={`${active.driveTimePct.toFixed(0)}%`} sub={`${active.driveMiles.toFixed(0)} mi`} warn />
      </div>

      {/* Per-stop table */}
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
function CrewTab() {
  // Only crews actually running maintenance routes get a profitability card —
  // the install/design crew's jobs aren't modeled in this maintenance tool yet.
  const crews = useMemo(() => crewProfitability().filter((c) => c.weeklyHours > 0), []);
  const emps = useMemo(() => employeeCosts(), []);

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Crews &amp; Pay</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>What each crew costs — and earns.</h2>
        <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
          Burdened wages, weekly hours, and the profit each crew throws off after their loaded labor cost.
        </p>
      </div>

      {/* Crew cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 16 }}>
        {crews.map((c) => (
          <div key={c.crew.id} style={{ background: C.bone, border: "1px solid rgba(168,162,148,0.35)", padding: "20px 22px", borderTop: `3px solid ${c.crew.color}` }}>
            <p style={{ fontFamily: FONT_DISP, fontSize: 20, fontWeight: 500, color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>{c.crew.name}</p>
            <p style={{ fontSize: 12, color: C.stone, margin: "3px 0 16px" }}>{c.members.length} crew · {usd(c.burdenedWage, { cents: true })}/hr burdened</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <CrewStat label="Weekly revenue" value={usd(c.weeklyRevenue)} />
              <CrewStat label="Weekly net" value={usd(c.weeklyNetProfit)} color={moneyColor(c.weeklyNetProfit)} />
              <CrewStat label="Net margin" value={pct(c.netMarginPct)} color={marginTone(c.netMarginPct).color} />
              <CrewStat label="Profit / hr" value={usd(c.profitPerHour, { cents: true })} />
            </div>
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {c.members.map((m) => (
                <span key={m.id} style={{ fontSize: 11, background: C.sage, color: C.ink, padding: "4px 9px", borderRadius: 3 }}>
                  {m.name.split(" ")[0]} · {usd(m.hourlyRate)}/hr
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Employee roster */}
      <Card title="Employee roster · pay + loaded cost">
        <div style={{ overflowX: "auto" }}>
          <table className="ops-tbl">
            <thead>
              <tr>
                <th>Employee</th><th>Role</th><th>Pay</th><th>Base $/hr</th><th>Burden</th><th>Loaded $/hr</th><th>Wk hrs</th><th>Wk labor cost</th>
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
                  <td style={{ fontWeight: 600, color: e.weeklyLaborCost > 0 ? C.warn : C.stone }}>{e.weeklyLaborCost > 0 ? usd(e.weeklyLaborCost) : (e.employee.billable ? "install side" : "overhead")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: C.stone, margin: "14px 0 0", lineHeight: 1.5 }}>
          Bonnie&apos;s field hours sit in overhead (she runs the route but isn&apos;t billed against a stop). &quot;Loaded $/hr&quot; is base wage + {(ASSUMPTIONS.laborBurdenPct * 100).toFixed(0)}% burden — the number that actually hits a job cost.
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

/* ════════════════════ CUSTOMERS TAB ════════════════════ */
function CustomersTab() {
  const all = useMemo(() => customerProfitability(), []);
  const [sort, setSort] = useState<"margin" | "revenue">("margin");
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
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Maintenance Customers</p>
          <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>Who&apos;s actually profitable.</h2>
          <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
            {all.length} recurring properties · {usd(totalMrr)}/mo revenue · {usd(totalProfit)}/mo net · <span style={{ color: losers > 0 ? C.warn : C.moss, fontWeight: 600 }}>{losers} below 15% margin</span>
          </p>
        </div>
        <Toggle value={sort} onChange={setSort} options={[{ id: "margin", label: "By margin" }, { id: "revenue", label: "By revenue" }]} />
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table className="ops-tbl">
            <thead>
              <tr>
                <th>Customer</th><th>City</th><th>Tier</th><th>Crew</th><th>$/visit</th><th>MRR</th><th>Net/visit</th><th>Net/mo</th><th>Margin</th>
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
function MapTab() {
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
        <OpsMap />
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
