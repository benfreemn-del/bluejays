"use client";

/**
 * /clients/mt-view-landscaping/portal-demo — owner-portal mock backend.
 *
 * Password-gated demo (1976 — Mt View founding year). Shows Tim + Bonnie
 * what the operator dashboard looks like with realistic fake data BEFORE
 * they're paying customers of the AI Marketing System tier.
 *
 * 5 tabs: Overview · Leads · Route Ops · Reviews · Account
 * Theme matches the front-end: Paper (#F5F1E8) + Ink (#1C1F1A) + forest
 * green accents (#15803d). Playfair Display + Inter typography.
 *
 * NO real data writes — all mutations are local state only. Cookie
 * `bj_mtv_demo_unlocked` flags the password as entered.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LEADS,
  TASKS,
  ROUTES,
  REVIEWS,
  RECENT_ACTIVITY,
  STATS,
  SERVICE_LABELS,
  type Lead,
  type LeadStatus,
  type Task,
  type DailyRoute,
  type Review,
} from "./mock-data";

const PASSWORD = "1976";
const COOKIE = "bj_mtv_demo_unlocked";

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
};

type TabId = "overview" | "leads" | "route" | "reviews" | "account";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "overview", label: "Overview", emoji: "✦" },
  { id: "leads", label: "Leads", emoji: "✉" },
  { id: "route", label: "Route Ops", emoji: "✓" },
  { id: "reviews", label: "Reviews", emoji: "★" },
  { id: "account", label: "Account", emoji: "◐" },
];

const FONT_BODY = "'Inter', system-ui, sans-serif";
const FONT_DISP = "'Playfair Display', Georgia, serif";

export default function MtViewPortalDemo() {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");

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
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.25rem 1.25rem 4rem" }}>
        <Tabs current={tab} onChange={setTab} />
        <div style={{ marginTop: "2rem" }}>
          {tab === "overview" && <OverviewTab onJumpTo={setTab} />}
          {tab === "leads" && <LeadsTab />}
          {tab === "route" && <RouteTab />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "account" && <AccountTab />}
        </div>
      </div>
      <Footer />
    </main>
  );
}


/* ────────────── PASSWORD GATE ────────────── */
function PasswordGate({ onUnlock }: { onUnlock: (input: string) => boolean }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  return (
    <main style={{ minHeight: "100vh", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: FONT_BODY }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 16 }}>
          Mountain View — Owner Portal Preview
        </p>
        <h1 style={{ fontFamily: FONT_DISP, fontSize: 44, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.018em", color: C.ink, margin: "0 0 12px" }}>
          A peek at the dashboard.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(28,31,26,0.7)", marginBottom: 28 }}>
          This is a demo of what Tim and Bonnie's owner portal would look like once Mountain View is on the AI Marketing System tier. Leads, route ops, reviews, the works. Mock data — never shared publicly.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const ok = onUnlock(val);
            if (!ok) setErr(true);
          }}
        >
          <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone, marginBottom: 8 }}>
            Passcode
          </label>
          <input
            type="password"
            value={val}
            onChange={(e) => { setVal(e.target.value); setErr(false); }}
            autoFocus
            style={{
              width: "100%",
              background: "transparent",
              border: 0,
              borderBottom: `1px solid ${err ? C.warn : "rgba(168,162,148,0.5)"}`,
              padding: "10px 0",
              fontSize: 18,
              color: C.ink,
              outline: "none",
              fontFamily: FONT_BODY,
            }}
          />
          {err && <p style={{ fontSize: 13, color: C.warn, marginTop: 8 }}>That passcode doesn't look right.</p>}
          <button
            type="submit"
            style={{
              marginTop: 28,
              background: C.bark,
              color: C.paper,
              border: 0,
              padding: "14px 32px",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: FONT_BODY,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Enter Preview →
          </button>
        </form>
        <p style={{ marginTop: 36, fontSize: 12, color: C.stone, lineHeight: 1.5 }}>
          Forgot the passcode? Text Ben at (555) 555-0100.
        </p>
        <Link href="/clients/mt-view-landscaping" style={{ display: "inline-block", marginTop: 12, fontSize: 12, color: C.moss, textDecoration: "underline", textUnderlineOffset: 4 }}>
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}

/* ────────────── HEADER ────────────── */
function Header() {
  return (
    <header style={{ background: C.paper, borderBottom: `1px solid rgba(28,31,26,0.08)`, position: "sticky", top: 0, zIndex: 30, backdropFilter: "blur(8px)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", background: C.moss, color: C.paper, fontFamily: FONT_DISP, fontSize: 18, fontWeight: 500 }}>
            MV
          </span>
          <div>
            <p style={{ fontFamily: FONT_DISP, fontSize: 18, color: C.ink, fontWeight: 500, letterSpacing: "-0.01em", margin: 0, lineHeight: 1.05 }}>Mountain View</p>
            <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone, marginTop: 2, fontWeight: 500 }}>Owner Portal · Preview</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 11, color: C.stone, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.moss, marginRight: 6, verticalAlign: "middle" }} />
            Demo mode
          </span>
          <Link href="/clients/mt-view-landscaping" style={{ fontSize: 12, color: C.ink, textDecoration: "none", borderBottom: `1px solid ${C.stone}`, paddingBottom: 2 }}>
            ← Public site
          </Link>
        </div>
      </div>
    </header>
  );
}


/* ────────────── TABS ────────────── */
function Tabs({ current, onChange }: { current: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav style={{ display: "flex", gap: 4, borderBottom: `1px solid rgba(168,162,148,0.35)`, overflowX: "auto" }}>
      {TABS.map((t) => {
        const active = current === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              background: "transparent",
              border: 0,
              borderBottom: active ? `2px solid ${C.moss}` : "2px solid transparent",
              padding: "14px 18px",
              fontSize: 14,
              fontFamily: FONT_BODY,
              fontWeight: active ? 600 : 500,
              color: active ? C.ink : "rgba(28,31,26,0.6)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "color 200ms",
            }}
          >
            <span style={{ color: C.moss, marginRight: 8 }}>{t.emoji}</span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

/* ────────────── FOOTER ────────────── */
function Footer() {
  return (
    <footer style={{ background: C.ink, color: "rgba(245,241,232,0.7)", padding: "32px 1.25rem 28px", marginTop: 60 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, fontSize: 12 }}>
        <p>Mountain View Landscape & Design · Owner Portal Preview · Mock data only</p>
        <p>Built by <a href="https://bluejayportfolio.com" style={{ color: C.paper, textDecoration: "underline" }}>BlueJays</a></p>
      </div>
    </footer>
  );
}


/* ════════════════════════════ OVERVIEW TAB ════════════════════════════ */
function OverviewTab({ onJumpTo }: { onJumpTo: (t: TabId) => void }) {
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 10 }}>This Week</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 36, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0, lineHeight: 1.1 }}>
          Good morning, Tim.
        </h2>
        <p style={{ fontSize: 16, color: "rgba(28,31,26,0.7)", marginTop: 10, maxWidth: 540 }}>
          18 leads this month, ${(STATS.pipelineValue / 1000).toFixed(0)}k in active pipeline, 23 maintenance stops on the route this week.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <KpiCard label="New leads this month" value={STATS.leadsThisMonth.toString()} sub={`${STATS.uncontacted} uncontacted`} accent={STATS.uncontacted > 0} />
        <KpiCard label="Pipeline value" value={`$${(STATS.pipelineValue / 1000).toFixed(0)}k`} sub="open quotes + site visits" />
        <KpiCard label="Maintenance customers" value={STATS.maintenanceCustomers.toString()} sub={`$${STATS.monthlyRecurring.toLocaleString()}/mo recurring`} />
        <KpiCard label="Route stops this week" value={STATS.routeStops.toString()} sub="across 4 route days" />
        <KpiCard label="Google rating" value={STATS.reviewsAvg.toFixed(1)} sub={`${STATS.reviewsCount} reviews`} />
      </div>

      {/* Two-col: Recent activity + Today's focus */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,3fr) minmax(0,2fr)", gap: 24 }} className="mtv-2col">
        <Card title="Recent activity">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {RECENT_ACTIVITY.map((a) => (
              <li key={a.id} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid rgba(168,162,148,0.25)" }}>
                <span style={{ fontSize: 11, color: C.stone, minWidth: 90, paddingTop: 2 }}>{a.ts}</span>
                <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.5, flex: 1 }}>
                  <KindDot kind={a.kind} />
                  {a.text}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Action needed">
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            <ActionRow
              icon="⚠"
              text={`${STATS.uncontacted} new leads not yet contacted`}
              cta="Open Leads →"
              onClick={() => onJumpTo("leads")}
              warn
            />
            <ActionRow
              icon="✓"
              text="Tuesday route ready (7 stops · ~7.5h)"
              cta="View Route →"
              onClick={() => onJumpTo("route")}
            />
            <ActionRow
              icon="★"
              text="2 private reviews (<5★) need a response"
              cta="Open Reviews →"
              onClick={() => onJumpTo("reviews")}
              warn
            />
            <ActionRow
              icon="↺"
              text="3 active quotes — followup in 48h window"
              cta="Open Leads →"
              onClick={() => onJumpTo("leads")}
            />
          </ul>
        </Card>
      </div>

      {/* Open Tasks */}
      <Card title="Open tasks">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {TASKS.filter((t) => !t.done).slice(0, 6).map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </ul>
      </Card>

      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 880px) { .mtv-2col { grid-template-columns: 1fr !important; } }` }} />
    </div>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? C.mossSoft : C.bone,
      border: `1px solid ${accent ? "rgba(21,128,61,0.35)" : "rgba(168,162,148,0.35)"}`,
      padding: "20px 22px",
      transition: "transform 200ms, box-shadow 200ms",
    }}>
      <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: C.stone, fontWeight: 500, margin: 0 }}>{label}</p>
      <p style={{ fontFamily: FONT_DISP, fontSize: 38, fontWeight: 500, color: C.ink, margin: "6px 0 4px", letterSpacing: "-0.018em", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: accent ? C.moss : "rgba(28,31,26,0.6)", margin: 0, fontWeight: accent ? 600 : 400 }}>{sub}</p>}
    </div>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.bone, border: "1px solid rgba(168,162,148,0.35)", padding: "22px 24px" }}>
      {title && <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: C.moss, fontWeight: 600, margin: "0 0 16px" }}>{title}</p>}
      {children}
    </div>
  );
}

function KindDot({ kind }: { kind: string }) {
  const colors: Record<string, string> = {
    lead: C.moss,
    review: "#fbbf24",
    route: C.bark,
    task: "#0ea5e9",
    renewal: "#a855f7",
  };
  return <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: colors[kind] ?? C.stone, marginRight: 10, verticalAlign: "middle" }} />;
}

function ActionRow({ icon, text, cta, onClick, warn }: { icon: string; text: string; cta: string; onClick: () => void; warn?: boolean }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        style={{
          width: "100%",
          textAlign: "left",
          background: warn ? C.warnSoft : "rgba(220,252,231,0.5)",
          border: `1px solid ${warn ? "rgba(194,65,12,0.3)" : "rgba(21,128,61,0.25)"}`,
          padding: "12px 14px",
          fontFamily: FONT_BODY,
          fontSize: 14,
          color: C.ink,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          transition: "background 200ms",
        }}
      >
        <span style={{ fontSize: 18, color: warn ? C.warn : C.moss }}>{icon}</span>
        <span style={{ flex: 1, lineHeight: 1.4 }}>{text}</span>
        <span style={{ fontSize: 12, color: warn ? C.warn : C.moss, fontWeight: 600, letterSpacing: "0.04em" }}>{cta}</span>
      </button>
    </li>
  );
}

function TaskRow({ task }: { task: Task }) {
  const pColor: Record<Task["priority"], string> = {
    high: C.warn,
    med: C.bark,
    low: C.stone,
  };
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(168,162,148,0.25)" }}>
      <input type="checkbox" defaultChecked={task.done} style={{ accentColor: C.moss, width: 16, height: 16 }} />
      <span style={{ fontSize: 14, color: C.ink, flex: 1 }}>{task.title}</span>
      <span style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: pColor[task.priority], fontWeight: 600 }}>{task.priority}</span>
      <span style={{ fontSize: 12, color: C.stone, minWidth: 90, textAlign: "right" }}>{task.assignee} · {formatDate(task.due)}</span>
    </li>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}


/* ════════════════════════════ LEADS TAB ════════════════════════════ */
const STATUS_PILL: Record<LeadStatus, { label: string; bg: string; text: string }> = {
  new:         { label: "New",          bg: "rgba(21,128,61,0.12)",  text: C.moss },
  contacted:   { label: "Contacted",    bg: "rgba(14,165,233,0.12)", text: "#0369a1" },
  site_visit:  { label: "Site Visit",   bg: "rgba(168,85,247,0.12)", text: "#7e22ce" },
  quoted:      { label: "Quoted",       bg: "rgba(245,158,11,0.12)", text: "#b45309" },
  won:         { label: "Won",          bg: "rgba(34,197,94,0.18)",  text: "#15803d" },
  lost:        { label: "Lost",         bg: "rgba(148,163,184,0.18)",text: "#64748b" },
  in_route:    { label: "On Route",     bg: "rgba(107,90,62,0.18)",  text: C.bark },
};

function LeadsTab() {
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const filtered = useMemo(() => filter === "all" ? LEADS : LEADS.filter((l) => l.status === filter), [filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: LEADS.length };
    for (const l of LEADS) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, []);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>
            All Leads
          </h2>
          <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
            {LEADS.length} total · {counts.new ?? 0} need first contact · ${(LEADS.reduce((s, l) => s + (l.estimatedValue ?? 0), 0) / 1000).toFixed(0)}k total pipeline
          </p>
        </div>
        <button
          type="button"
          style={{ background: C.bark, color: C.paper, border: 0, padding: "12px 22px", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, cursor: "pointer", fontFamily: FONT_BODY }}
        >
          + Add Lead
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <FilterChip label="All" count={counts.all} active={filter === "all"} onClick={() => setFilter("all")} />
        {(Object.keys(STATUS_PILL) as LeadStatus[]).map((s) => (
          <FilterChip
            key={s}
            label={STATUS_PILL[s].label}
            count={counts[s] ?? 0}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      {/* Lead list */}
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map((l) => <LeadCard key={l.id} lead={l} />)}
        {filtered.length === 0 && (
          <div style={{ background: C.bone, border: "1px dashed rgba(168,162,148,0.5)", padding: "32px", textAlign: "center", color: C.stone }}>
            No leads in this status yet.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? C.ink : "transparent",
        color: active ? C.paper : C.ink,
        border: `1px solid ${active ? C.ink : "rgba(168,162,148,0.45)"}`,
        padding: "8px 14px",
        fontSize: 12,
        fontFamily: FONT_BODY,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 150ms",
        letterSpacing: "0.02em",
      }}
    >
      {label} <span style={{ opacity: 0.6, marginLeft: 6 }}>{count}</span>
    </button>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false);
  const pill = STATUS_PILL[lead.status];
  return (
    <article style={{ background: C.bone, border: "1px solid rgba(168,162,148,0.35)", padding: "18px 22px", transition: "border-color 200ms" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
          <span style={{ width: 38, height: 38, borderRadius: "50%", background: C.moss, color: C.paper, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISP, fontSize: 14, fontWeight: 500, flexShrink: 0 }}>
            {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: FONT_DISP, fontSize: 18, fontWeight: 500, color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>{lead.name}</p>
            <p style={{ fontSize: 12, color: C.stone, margin: "2px 0 0" }}>
              {SERVICE_LABELS[lead.service]} · {lead.city} · {timeAgo(lead.receivedAt)}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lead.estimatedValue && <span style={{ fontFamily: FONT_DISP, fontSize: 18, fontWeight: 500, color: C.ink }}>${(lead.estimatedValue / 1000).toFixed(0)}k</span>}
          <span style={{ background: pill.bg, color: pill.text, fontSize: 11, fontWeight: 600, padding: "4px 10px", letterSpacing: "0.04em" }}>{pill.label}</span>
          <button type="button" onClick={() => setExpanded(!expanded)} style={{ background: "transparent", border: 0, color: C.moss, cursor: "pointer", fontSize: 18, padding: "0 4px" }}>
            {expanded ? "−" : "+"}
          </button>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(168,162,148,0.3)", display: "grid", gap: 12 }}>
          <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6, margin: 0 }}>{lead.message}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12, fontSize: 13 }}>
            <Field label="Phone" value={lead.phone} link={`tel:${lead.phone}`} />
            <Field label="Email" value={lead.email} link={`mailto:${lead.email}`} />
            <Field label="Address" value={`${lead.address}, ${lead.city}`} link={`https://maps.google.com/?q=${encodeURIComponent(`${lead.address}, ${lead.city}`)}`} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <ActionBtn>Call</ActionBtn>
            <ActionBtn>Email</ActionBtn>
            <ActionBtn>Schedule site visit</ActionBtn>
            <ActionBtn>Quote</ActionBtn>
          </div>
        </div>
      )}
    </article>
  );
}

function Field({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.stone, margin: 0 }}>{label}</p>
      {link ? (
        <a href={link} style={{ color: C.ink, textDecoration: "none", borderBottom: `1px solid ${C.stone}`, paddingBottom: 1, fontSize: 13 }}>{value}</a>
      ) : (
        <p style={{ color: C.ink, fontSize: 13, margin: "2px 0 0" }}>{value}</p>
      )}
    </div>
  );
}

function ActionBtn({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" style={{ background: "transparent", border: `1px solid ${C.moss}`, color: C.moss, padding: "8px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", letterSpacing: "0.04em", fontFamily: FONT_BODY }}>
      {children}
    </button>
  );
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}


/* ════════════════════════════ ROUTE OPS TAB ════════════════════════════ */
function RouteTab() {
  const [day, setDay] = useState<DailyRoute["day"]>("Tuesday");
  const currentRoute = ROUTES.find((r) => r.day === day)!;
  const allStopsAddresses = currentRoute.stops.map((s) => `${s.address}, ${s.city}`).join("/");
  const gMapsRouteUrl = currentRoute.stops.length > 0
    ? `https://www.google.com/maps/dir/${encodeURIComponent(allStopsAddresses)}`
    : "#";

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>This Week's Route</p>
          <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>
            Bonnie's recurring routes.
          </h2>
          <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
            {STATS.routeStops} stops across 4 route days · ${STATS.monthlyRecurring.toLocaleString()}/mo recurring revenue
          </p>
        </div>
        {currentRoute.stops.length > 0 && (
          <a
            href={gMapsRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: C.moss, color: C.paper, padding: "12px 22px", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, textDecoration: "none", fontFamily: FONT_BODY }}
          >
            Open in Google Maps →
          </a>
        )}
      </div>

      {/* Day tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ROUTES.map((r) => (
          <button
            key={r.day}
            type="button"
            onClick={() => setDay(r.day)}
            style={{
              background: day === r.day ? C.ink : C.bone,
              color: day === r.day ? C.paper : C.ink,
              border: `1px solid ${day === r.day ? C.ink : "rgba(168,162,148,0.4)"}`,
              padding: "12px 18px",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: FONT_BODY,
              flex: 1,
              minWidth: 140,
              transition: "all 150ms",
            }}
          >
            <p style={{ fontFamily: FONT_DISP, fontSize: 18, fontWeight: 500, margin: 0, lineHeight: 1 }}>{r.day}</p>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", margin: "4px 0 0", opacity: 0.7 }}>
              {r.totalStops} stops · ~{r.estHours}h · {r.crew}
            </p>
          </button>
        ))}
      </div>

      {/* Route stops */}
      <Card title={`${currentRoute.day} · ${currentRoute.crew}`}>
        {currentRoute.stops.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.stone }}>
            <p style={{ fontFamily: FONT_DISP, fontSize: 24, color: C.ink, margin: "0 0 6px" }}>Open day.</p>
            <p style={{ fontSize: 14 }}>{currentRoute.crew} has flex time for installs, callbacks, or weather-day buffers.</p>
          </div>
        ) : (
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {currentRoute.stops.map((s, i) => (
              <li key={s.id} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: i < currentRoute.stops.length - 1 ? "1px solid rgba(168,162,148,0.3)" : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <span style={{ width: 32, height: 32, borderRadius: "50%", background: C.moss, color: C.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISP, fontSize: 13, fontWeight: 500 }}>{i + 1}</span>
                  {i < currentRoute.stops.length - 1 && <span style={{ width: 1, flex: 1, background: "rgba(168,162,148,0.4)", marginTop: 6 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <p style={{ fontFamily: FONT_DISP, fontSize: 18, fontWeight: 500, color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>{s.customer}</p>
                    <span style={{ fontSize: 12, color: C.bark, fontWeight: 600, whiteSpace: "nowrap" }}>{s.estMinutes} min</span>
                  </div>
                  <p style={{ fontSize: 13, color: C.ink, margin: "4px 0 0" }}>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(`${s.address}, ${s.city}`)}`} target="_blank" rel="noopener noreferrer" style={{ color: C.ink, borderBottom: `1px dotted ${C.stone}`, textDecoration: "none" }}>{s.address}, {s.city}</a>
                  </p>
                  <p style={{ fontSize: 13, color: C.moss, fontWeight: 500, margin: "6px 0 0" }}>{s.service}</p>
                  {s.notes && (
                    <p style={{ fontSize: 13, color: C.warn, margin: "6px 0 0", background: C.warnSoft, padding: "8px 12px", borderLeft: `2px solid ${C.warn}` }}>
                      ⚑ {s.notes}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {/* Crew assignment summary */}
      <Card title="Crew Assignment">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <CrewCard name="Tim Hunsaker" role="Design + Install · Thursday flex" stops="install crew" />
          <CrewCard name="Bonnie Hunsaker" role="Maintenance route · Tu/W/F" stops={`${STATS.routeStops} stops/wk`} />
          <CrewCard name="Marcus Vega" role="Crew lead — Bonnie's route" stops="5 years tenure" />
          <CrewCard name="José Restrepo" role="Crew · Install + Hardscape" stops="11 years tenure" />
        </div>
      </Card>
    </div>
  );
}

function CrewCard({ name, role, stops }: { name: string; role: string; stops: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.paper, border: "1px solid rgba(168,162,148,0.3)", padding: "14px 16px" }}>
      <span style={{ width: 40, height: 40, borderRadius: "50%", background: C.bark, color: C.paper, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISP, fontSize: 14, fontWeight: 500, flexShrink: 0 }}>
        {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
      </span>
      <div>
        <p style={{ fontFamily: FONT_DISP, fontSize: 15, fontWeight: 500, color: C.ink, margin: 0 }}>{name}</p>
        <p style={{ fontSize: 12, color: C.stone, margin: "2px 0 0" }}>{role}</p>
        <p style={{ fontSize: 11, color: C.moss, fontWeight: 600, margin: "2px 0 0", letterSpacing: "0.04em", textTransform: "uppercase" }}>{stops}</p>
      </div>
    </div>
  );
}


/* ════════════════════════════ REVIEWS TAB ════════════════════════════ */
function ReviewsTab() {
  const google = REVIEWS.filter((r) => r.source === "google");
  const privateR = REVIEWS.filter((r) => r.source === "private");
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Review Funnel</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>
          {STATS.reviewsAvg.toFixed(1)} on Google — {STATS.reviewsCount} reviews.
        </h2>
        <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
          5-star reviews route to your Google listing automatically. Anything below 5 lands here as private feedback so you can respond directly without it ever showing publicly.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 24 }} className="mtv-2col">
        <Card title={`Public — Google (${google.length})`}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 16 }}>
            {google.map((r) => <ReviewCard key={r.id} review={r} />)}
          </ul>
        </Card>

        <Card title={`Private feedback (${privateR.length})`}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 16 }}>
            {privateR.map((r) => <ReviewCard key={r.id} review={r} />)}
            {privateR.length === 0 && (
              <li style={{ color: C.stone, fontSize: 13 }}>No private feedback yet.</li>
            )}
          </ul>
          <div style={{ marginTop: 18, padding: 12, background: C.mossSoft, border: `1px solid rgba(21,128,61,0.3)` }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.moss, margin: "0 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>How this works</p>
            <p style={{ fontSize: 12, color: C.ink, margin: 0, lineHeight: 1.5 }}>
              When a customer rates 1-4 stars, they're invited to share feedback with you directly instead of posting publicly. Keeps your Google rating clean + gives you a chance to make it right.
            </p>
          </div>
        </Card>
      </div>

      <Card title="Request a review">
        <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6, margin: "0 0 14px" }}>
          Drop a customer's phone number — they'll get a text invite to leave a star rating.
        </p>
        <form style={{ display: "flex", gap: 8, flexWrap: "wrap" }} onSubmit={(e) => e.preventDefault()}>
          <input type="tel" placeholder="(253) 555-0123" style={{ flex: 1, minWidth: 200, padding: "10px 14px", border: "1px solid rgba(168,162,148,0.45)", background: C.paper, fontSize: 14, fontFamily: FONT_BODY }} />
          <input type="text" placeholder="Customer first name (optional)" style={{ flex: 1, minWidth: 180, padding: "10px 14px", border: "1px solid rgba(168,162,148,0.45)", background: C.paper, fontSize: 14, fontFamily: FONT_BODY }} />
          <button type="submit" style={{ background: C.bark, color: C.paper, border: 0, padding: "10px 20px", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, cursor: "pointer", fontFamily: FONT_BODY }}>
            Send Invite →
          </button>
        </form>
      </Card>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <li style={{ background: C.paper, border: "1px solid rgba(168,162,148,0.3)", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <p style={{ fontFamily: FONT_DISP, fontSize: 15, fontWeight: 500, color: C.ink, margin: 0 }}>{review.name}</p>
        <span style={{ color: "#f59e0b", fontSize: 14, letterSpacing: 2 }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
      </div>
      <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.55, margin: 0 }}>"{review.text}"</p>
      <p style={{ fontSize: 11, color: C.stone, margin: "8px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </li>
  );
}

/* ════════════════════════════ ACCOUNT TAB ════════════════════════════ */
function AccountTab() {
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 900 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: C.moss, fontWeight: 600, marginBottom: 8 }}>Account</p>
        <h2 style={{ fontFamily: FONT_DISP, fontSize: 32, fontWeight: 400, letterSpacing: "-0.018em", color: C.ink, margin: 0 }}>
          Tim Hunsaker
        </h2>
        <p style={{ fontSize: 14, color: "rgba(28,31,26,0.7)", margin: "6px 0 0" }}>
          Mountain View Landscape & Design · founded 1976
        </p>
      </div>

      <Card title="Subscription">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 14 }}>
          <SubItem name="Hosting + Domain" tier="Custom · $100/yr" status="Active" />
          <SubItem name="AI Marketing System" tier="Not enabled" status="Available" />
          <SubItem name="Lead Reply Drafter" tier="Not enabled" status="Available" />
          <SubItem name="Auto SMS Responder" tier="Not enabled" status="Available" />
        </div>
        <div style={{ marginTop: 18, padding: 14, background: C.mossSoft, border: `1px solid rgba(21,128,61,0.3)` }}>
          <p style={{ fontSize: 12, color: C.moss, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>This is the preview</p>
          <p style={{ fontSize: 13, color: C.ink, margin: 0, lineHeight: 1.5 }}>
            You're seeing what the operator portal would look like on the AI Marketing System tier — leads in one place, routes mapped, reviews funneled, the full surface. To turn it on for Mountain View, text Ben at (555) 555-0100.
          </p>
        </div>
      </Card>

      <Card title="Owner accounts">
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          <OwnerRow name="Tim Hunsaker" email="tim@mountainviewlandscape.com" role="Owner · Founder" />
          <OwnerRow name="Bonnie Hunsaker" email="bonnie@mountainviewlandscape.com" role="Owner · Maintenance Director" />
        </ul>
      </Card>

      <Card title="Lead routing">
        <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, margin: "0 0 12px" }}>
          New leads from the website forward to both inboxes simultaneously:
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
          <li style={{ fontSize: 13, color: C.ink }}><span style={{ color: C.moss, marginRight: 8 }}>→</span>mtviewlandscapeonline@gmail.com <span style={{ color: C.stone, fontSize: 11, marginLeft: 8 }}>(primary)</span></li>
          <li style={{ fontSize: 13, color: C.ink }}><span style={{ color: C.moss, marginRight: 8 }}>→</span>info@mountainviewlandscape.com <span style={{ color: C.stone, fontSize: 11, marginLeft: 8 }}>(cc)</span></li>
        </ul>
      </Card>
    </div>
  );
}

function SubItem({ name, tier, status }: { name: string; tier: string; status: string }) {
  const active = status === "Active";
  return (
    <div style={{ background: C.paper, border: `1px solid ${active ? "rgba(21,128,61,0.4)" : "rgba(168,162,148,0.35)"}`, padding: "12px 14px" }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: C.ink, margin: 0 }}>{name}</p>
      <p style={{ fontSize: 11, color: C.stone, margin: "2px 0 6px" }}>{tier}</p>
      <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px", background: active ? C.mossSoft : "rgba(168,162,148,0.2)", color: active ? C.moss : C.stone }}>{status}</span>
    </div>
  );
}

function OwnerRow({ name, email, role }: { name: string; email: string; role: string }) {
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(168,162,148,0.25)" }}>
      <span style={{ width: 36, height: 36, borderRadius: "50%", background: C.bark, color: C.paper, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISP, fontSize: 13, fontWeight: 500 }}>
        {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, color: C.ink, margin: 0, fontWeight: 500 }}>{name}</p>
        <p style={{ fontSize: 12, color: C.stone, margin: 0 }}>{email} · {role}</p>
      </div>
    </li>
  );
}
