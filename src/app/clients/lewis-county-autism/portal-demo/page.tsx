"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  SUPPORTERS,
  PARTNERS,
  RECURRING_DONORS,
  PIPELINES,
  UPCOMING_EVENTS,
  WA_COUNTIES,
  OVERVIEW_STATS,
  type Supporter,
  type CommunityPartner,
  type Pipeline,
  type PipelineStep,
} from "./mock-data";

const PASSWORD = "1212";
const COOKIE = "bj_lcac_demo_unlocked";
const ACCENT = "#0d9488"; // teal — LCAC brand-adjacent
const ACCENT_WARM = "#f59e0b"; // warm gold for highlights

type TabId = "overview" | "supporters" | "map" | "events" | "pipelines" | "partners";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "overview", label: "Overview", emoji: "🌟" },
  { id: "supporters", label: "Supporters", emoji: "🤝" },
  { id: "map", label: "Service Map", emoji: "🗺️" },
  { id: "events", label: "Events", emoji: "📅" },
  { id: "pipelines", label: "Pipelines", emoji: "🌱" },
  { id: "partners", label: "Community Partners", emoji: "🤲" },
];

const STATUS_TONES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  new:          { bg: "rgba(14,165,233,0.12)", text: "#7dd3fc", border: "rgba(14,165,233,0.4)", label: "New" },
  engaged:      { bg: "rgba(139,92,246,0.12)", text: "#c4b5fd", border: "rgba(139,92,246,0.4)", label: "Engaged" },
  in_program:   { bg: "rgba(245,158,11,0.12)", text: "#fcd34d", border: "rgba(245,158,11,0.4)", label: "In Program" },
  monthly_giver:{ bg: "rgba(16,185,129,0.12)", text: "#6ee7b7", border: "rgba(16,185,129,0.4)", label: "Monthly Giver" },
  sustained:    { bg: "rgba(13,148,136,0.12)", text: "#5eead4", border: "rgba(13,148,136,0.4)", label: "Sustained" },
  lapsed:       { bg: "rgba(100,116,139,0.12)", text: "#94a3b8", border: "rgba(100,116,139,0.4)", label: "Lapsed" },
  stewardship:  { bg: "rgba(244,114,182,0.12)", text: "#f9a8d4", border: "rgba(244,114,182,0.4)", label: "Stewardship" },
};

export default function LCACPortalDemo() {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");

  useEffect(() => {
    if (typeof document !== "undefined" && document.cookie.includes(`${COOKIE}=1`)) {
      setUnlocked(true);
    }
  }, []);

  if (!unlocked) {
    return <PasswordGate onUnlock={(input) => {
      if (input.trim() === PASSWORD) {
        document.cookie = `${COOKIE}=1; path=/; max-age=86400; samesite=lax`;
        setUnlocked(true);
        return true;
      }
      return false;
    }} />;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e7eb", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.25rem 1rem 3rem" }}>
        <Tabs current={tab} onChange={setTab} />
        <div style={{ marginTop: "1.5rem" }}>
          {tab === "overview" && <OverviewTab />}
          {tab === "supporters" && <SupportersTab />}
          {tab === "map" && <ServiceMapTab />}
          {tab === "events" && <EventsTab />}
          {tab === "pipelines" && <PipelinesTab />}
          {tab === "partners" && <PartnersTab />}
        </div>
      </div>
      <Footer />
    </main>
  );
}

function PasswordGate({ onUnlock }: { onUnlock: (input: string) => boolean }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "#64748b", fontWeight: 700, marginBottom: 12 }}>
          BlueJays · LCAC Mission Dashboard
        </p>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, color: "white", margin: "0 0 8px" }}>
          Lewis County Autism Coalition
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28 }}>
          A live preview of the mission dashboard LCAC could log into.
          Type the demo code to unlock.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const ok = onUnlock(value);
            if (!ok) setError(true);
          }}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            inputMode="numeric"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Demo code"
            style={{
              width: "100%", padding: "14px 16px",
              background: "#111827", color: "white",
              border: `2px solid ${error ? "#f43f5e" : "#1f2937"}`,
              borderRadius: 10, fontSize: 22, textAlign: "center",
              letterSpacing: "0.4em", fontFamily: "monospace",
              outline: "none",
            }}
            autoFocus
          />
          {error && <p style={{ fontSize: 12, color: "#f87171", margin: 0 }}>Try again — hint: it&apos;s the same 4 digits everywhere.</p>}
          <button
            type="submit"
            style={{
              padding: "12px 16px",
              background: ACCENT, color: "white",
              border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}
          >
            Unlock dashboard
          </button>
        </form>
        <p style={{ fontSize: 11, color: "#475569", marginTop: 24 }}>
          Mock data. The dashboard is exactly what LCAC&apos;s mission-ops backend would feel like.
        </p>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 10,
      background: "rgba(10,10,10,0.85)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "#64748b", fontWeight: 700, margin: 0 }}>
            501(c)(3) · Lewis County, WA
          </p>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, color: "white", margin: "2px 0 0", letterSpacing: "-0.01em" }}>
            Lewis County Autism Coalition
            <span style={{ color: "#475569", fontWeight: 400 }}> · Mission Dashboard</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="https://lcautism-coalition.vercel.app/" target="_blank" style={{ fontSize: 11, color: "#94a3b8", textDecoration: "none", fontWeight: 600 }}>
            ↗ Live site
          </Link>
        </div>
      </div>
    </header>
  );
}

function Tabs({ current, onChange }: { current: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav style={{ display: "flex", gap: 4, overflowX: "auto", borderBottom: "1px solid #1f2937", marginBottom: -1 }}>
      {TABS.map((t) => {
        const active = current === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              padding: "10px 14px", whiteSpace: "nowrap",
              background: "transparent", border: "none",
              color: active ? "white" : "#64748b",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              borderBottom: `2px solid ${active ? ACCENT : "transparent"}`,
              transition: "color 0.2s",
            }}
          >
            <span style={{ marginRight: 6 }}>{t.emoji}</span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

/* ───────────────────────── TAB 1: OVERVIEW ───────────────────────── */

function OverviewTab() {
  const s = OVERVIEW_STATS;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <section>
        <h2 style={ssTitle}>This month at a glance</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginTop: 10 }}>
          <Stat label="Supporters" value={s.totalSupporters} sub="people in the community" />
          <Stat label="New (30d)" value={s.newSupporters30d} sub="first-time touchpoints" accent />
          <Stat label="Families in program" value={s.familiesInProgram} sub="active SMART / SDCC / services" />
          <Stat label="Monthly recurring" value={`$${s.monthlyRecurringUsd}/mo`} sub={`$${(s.monthlyRecurringUsd * 12).toLocaleString()} annualized`} accent />
          <Stat label="YTD giving" value={`$${s.totalGivenYtdUsd.toLocaleString()}`} sub="recurring + one-time" />
          <Stat label="Volunteer hours YTD" value={s.totalVolunteerHoursYtd.toLocaleString()} sub="sustained + occasional" />
        </div>
      </section>

      <DonationImpactCalculator />

      <section style={card()}>
        <h2 style={ssTitle}>Top 5 hottest supporters right now</h2>
        <p style={ssLead}>Scored by AI on caregiver status, event attendance, giving history, and local ties.</p>
        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
          {SUPPORTERS.slice(0, 5).map((s) => (
            <SupporterRow key={s.id} s={s} />
          ))}
        </ul>
      </section>

      <section style={card()}>
        <h2 style={ssTitle}>What you&apos;re looking at</h2>
        <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
          This is the live mission dashboard for the BlueJays AI Marketing System,
          tuned for nonprofits. Every supporter is scored. Every pipeline is
          monitored. Every county on the service map shows the gap between
          families known to LCAC and families estimated to need services.
          The numbers below are mock — the system is real, and runs identically
          for our paying clients today.
        </p>
      </section>
    </div>
  );
}

function DonationImpactCalculator() {
  const [monthly, setMonthly] = useState(50);
  const impact = useMemo(() => {
    const tiers: Array<[number, string]> = [
      [10, "newsletter + community-event invitations stay free"],
      [25, "1 family receives a year of resource navigation"],
      [50, "1 caregiver attends quarterly support group + materials"],
      [100, "2 kids attend a week of summer sensory camp"],
      [250, "1 court-support advocate retainer for a 6-month case"],
      [500, "1 family receives a full year of coordinated SMART services"],
    ];
    let match = tiers[0]![1];
    for (const [threshold, msg] of tiers) {
      if (monthly >= threshold) match = msg;
    }
    return { match, annualized: monthly * 12, kidsCampWeeks: Math.floor(monthly / 50), familiesYr: Math.max(1, Math.floor(monthly / 25)) };
  }, [monthly]);

  return (
    <section style={{ ...card(), background: `linear-gradient(135deg, rgba(13,148,136,0.08), rgba(245,158,11,0.06))` }}>
      <h2 style={ssTitle}>Donation Impact Calculator</h2>
      <p style={ssLead}>Built into the supporter portal — every prospective donor sees the impact of their gift, in concrete program units, before they click give.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
          <span>$10/mo</span><span>$500/mo</span>
        </div>
        <input
          type="range" min={10} max={500} step={5}
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          style={{ width: "100%", accentColor: ACCENT }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            ${monthly}<span style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>/mo</span>
          </span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            = <span style={{ color: ACCENT_WARM, fontWeight: 700 }}>${impact.annualized.toLocaleString()}</span>/yr
          </span>
        </div>
        <p style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: 12, fontSize: 14, color: "#fde68a", margin: 0 }}>
          <strong>That covers:</strong> {impact.match}
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────── TAB 2: SUPPORTERS ───────────────────────── */

function SupportersTab() {
  const [filter, setFilter] = useState<"all" | "monthly_giver" | "in_program" | "new" | "lapsed">("all");
  const filtered = useMemo(
    () => SUPPORTERS.filter((s) => filter === "all" || s.status === filter).slice(0, 50),
    [filter],
  );
  return (
    <section style={card({ padding: 0 })}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ ...ssTitle, marginBottom: 4 }}>Supporters</h2>
          <p style={ssLead}>The people who keep LCAC running — first-timers, sustainers, caregivers, donors.</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["all", "monthly_giver", "in_program", "new", "lapsed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: "5px 10px", borderRadius: 999,
                background: filter === f ? ACCENT : "transparent",
                border: `1px solid ${filter === f ? ACCENT : "#334155"}`,
                color: filter === f ? "white" : "#94a3b8",
                fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {f === "all" ? `All (${SUPPORTERS.length})` : STATUS_TONES[f]?.label || f}
            </button>
          ))}
        </div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {filtered.map((s) => <SupporterRow key={s.id} s={s} divider />)}
      </ul>
      {filtered.length === 0 && (
        <p style={{ padding: 24, textAlign: "center", color: "#64748b", fontSize: 13 }}>
          No supporters match this filter. Try &quot;all&quot; to see everyone.
        </p>
      )}
    </section>
  );
}

function SupporterRow({ s, divider }: { s: Supporter; divider?: boolean }) {
  const tone = STATUS_TONES[s.status] || STATUS_TONES.new!;
  return (
    <li style={{
      padding: "10px 18px",
      borderTop: divider ? "1px solid #1f2937" : "none",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
    }}>
      <div style={{ minWidth: 0, flex: "1 1 200px" }}>
        <p style={{ margin: 0, fontWeight: 600, color: "white", fontSize: 14 }}>
          {s.contact_name}
          {s.household_name && <span style={{ color: "#64748b", fontWeight: 400 }}> · {s.household_name}</span>}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
          {s.city}, WA {s.zip} · {s.signals.event_attendance_count} events
          {s.signals.is_caregiver && " · caregiver"}
          {s.signals.is_monthly_donor && " · monthly giver"}
          {s.signals.service_recipient_alum && " · service alum"}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
        <span style={{
          padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.06em",
          background: tone.bg, color: tone.text, border: `1px solid ${tone.border}`,
        }}>
          {tone.label}
        </span>
        <ScorePill score={s.score} />
        {s.lifetime_value > 0 && (
          <span style={{ fontSize: 12, color: "#cbd5e1", fontFamily: "monospace", minWidth: 56, textAlign: "right" }}>
            ${(s.lifetime_value / 1000).toFixed(1)}k
          </span>
        )}
      </div>
    </li>
  );
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? "#34d399" : score >= 60 ? ACCENT : "#94a3b8";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 32, height: 22, borderRadius: 999,
      background: `${color}22`, color, border: `1px solid ${color}66`,
      fontSize: 11, fontWeight: 700, fontFamily: "monospace",
    }}>{score}</span>
  );
}

/* ───────────────────────── TAB 3: SERVICE MAP ───────────────────────── */

function ServiceMapTab() {
  const maxReach = Math.max(...WA_COUNTIES.map((c) => c.reach_score));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <section style={card()}>
        <h2 style={ssTitle}>Service-area reach map</h2>
        <p style={ssLead}>Lewis County is the home base. Adjacent counties + WA INCLUDE statewide cohort. Higher saturation = LCAC is reaching more of the estimated family need.</p>

        <div style={{ position: "relative", aspectRatio: "2 / 1.2", marginTop: 14, borderRadius: 12, overflow: "hidden", background: "linear-gradient(135deg, #0f172a, #020617)", border: "1px solid #1f2937" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.18, backgroundImage: "repeating-linear-gradient(45deg, rgba(148,163,184,0.1) 0, rgba(148,163,184,0.1) 1px, transparent 1px, transparent 30px), repeating-linear-gradient(-45deg, rgba(148,163,184,0.1) 0, rgba(148,163,184,0.1) 1px, transparent 1px, transparent 30px)" }} />

          {/* WA state outline (rough) */}
          <svg viewBox="0 0 100 60" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }}>
            <path d="M 4 6 L 60 4 L 64 8 L 60 22 L 50 26 L 46 30 L 38 32 L 32 36 L 20 42 L 8 50 Z" fill="none" stroke={ACCENT} strokeWidth="0.4" />
          </svg>

          {WA_COUNTIES.map((c) => {
            const size = 14 + (c.reach_score / maxReach) * 42;
            const isHome = c.name === "Lewis";
            const color = isHome ? ACCENT_WARM : c.reach_score > 50 ? ACCENT : c.reach_score > 20 ? "#94a3b8" : "#475569";
            return (
              <div key={c.name} style={{ position: "absolute", left: `${c.cx + 8}%`, top: `${c.cy + 10}%`, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{
                  width: size, height: size, borderRadius: "50%",
                  background: color, opacity: 0.7,
                  boxShadow: isHome ? `0 0 30px ${ACCENT_WARM}99` : `0 0 16px ${color}66`,
                  border: isHome ? "2px solid white" : "none",
                }} />
                <p style={{ margin: "4px 0 0", fontSize: 10, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>
                  {c.name}
                </p>
                <p style={{ margin: 0, fontSize: 9, color: "#94a3b8" }}>{c.reach_score}% reach</p>
              </div>
            );
          })}
        </div>
      </section>

      <section style={card()}>
        <h2 style={{ ...ssTitle, marginBottom: 10 }}>By-county breakdown</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {WA_COUNTIES.map((c) => (
            <div key={c.name} style={{
              padding: 12, borderRadius: 10,
              border: c.name === "Lewis" ? `1px solid ${ACCENT_WARM}66` : "1px solid #1f2937",
              background: c.name === "Lewis" ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.02)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{c.name} County</span>
                <span style={{ fontSize: 11, color: c.reach_score > 50 ? "#5eead4" : "#fbbf24", fontWeight: 700 }}>
                  {c.reach_score}%
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${c.reach_score}%`, background: c.name === "Lewis" ? ACCENT_WARM : ACCENT }} />
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#cbd5e1" }}>
                {c.active_families} families · {c.active_supporters} supporters · {c.active_partners} partners
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 10, color: "#64748b", fontStyle: "italic" }}>{c.notes}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── TAB 4: EVENTS ───────────────────────── */

function EventsTab() {
  return (
    <section style={card()}>
      <h2 style={ssTitle}>Upcoming events</h2>
      <p style={ssLead}>Coalition meetings, programs, fundraisers, training. RSVP counts auto-update from the public events page.</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
        {UPCOMING_EVENTS.map((e) => {
          const fillPct = Math.round((e.rsvp_count / e.capacity) * 100);
          const isHot = fillPct > 80;
          return (
            <li key={e.id} style={{ padding: "12px 0", borderTop: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "white", fontSize: 14 }}>
                  {e.name}
                  {isHot && <span style={{ marginLeft: 8, fontSize: 10, padding: "1px 6px", borderRadius: 999, background: "rgba(244,114,182,0.15)", color: "#f9a8d4", border: "1px solid rgba(244,114,182,0.4)" }}>Selling Fast</span>}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
                  {new Date(e.date_iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {e.city} · {labelEventType(e.type)}
                </p>
              </div>
              <div style={{ minWidth: 180, textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#cbd5e1", fontWeight: 600 }}>
                  {e.rsvp_count} / {e.capacity} RSVPs
                </p>
                <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginTop: 5 }}>
                  <div style={{ height: "100%", width: `${fillPct}%`, background: isHot ? "#f9a8d4" : ACCENT }} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function labelEventType(t: string) {
  switch (t) {
    case "coalition": return "Coalition Meeting";
    case "program": return "Program";
    case "fundraiser": return "Fundraiser";
    case "training": return "Training";
    case "community": return "Community";
    default: return t;
  }
}

/* ───────────────────────── TAB 5: PIPELINES ───────────────────────── */

function PipelinesTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...ssLead, marginTop: 0 }}>
        Four engagement pipelines run automatically — new supporter onboarding,
        one-time donor to recurring, volunteer onboarding, community partner activation.
        Every step is monotonically dropping — that&apos;s how a real pipeline works.
      </p>
      {PIPELINES.map((p) => <PipelineCard key={p.id} pipeline={p} />)}
    </div>
  );
}

function PipelineCard({ pipeline }: { pipeline: Pipeline }) {
  return (
    <article style={card()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17, color: "white" }}>
            {pipeline.name}
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{pipeline.audience}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            ● {pipeline.status}
          </span>
          <span style={{ fontSize: 11, color: "#cbd5e1", fontFamily: "monospace" }}>
            {pipeline.total_in_pipeline} in flight · {pipeline.recent_completions} completed (30d)
          </span>
        </div>
      </div>
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {pipeline.steps.map((step, i) => (
          <PipelineStepRow key={i} step={step} prev={pipeline.steps[i - 1]} />
        ))}
      </ol>
    </article>
  );
}

function PipelineStepRow({ step, prev }: { step: PipelineStep; prev?: PipelineStep }) {
  const drop = prev ? prev.reach_pct - step.reach_pct : 0;
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 4 }}>
          <span style={{ color: "#cbd5e1" }}>
            <span style={{ color: "#64748b", marginRight: 6 }}>D{step.day_offset}</span>
            {step.label}
          </span>
          <span style={{ color: "white", fontWeight: 700, fontFamily: "monospace" }}>{step.reach_pct}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${step.reach_pct}%`, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}cc)` }} />
        </div>
      </div>
      <div style={{ width: 60, textAlign: "right" }}>
        {drop > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: "rgba(244,63,94,0.12)", color: "#fda4af", border: "1px solid rgba(244,63,94,0.35)" }}>
            −{drop}pp
          </span>
        )}
      </div>
    </li>
  );
}

/* ───────────────────────── TAB 6: PARTNERS ───────────────────────── */

const CAT_LABELS: Record<CommunityPartner["category"], string> = {
  school_district: "School District",
  healthcare_provider: "Healthcare",
  county_state_agency: "Agency",
  therapy_clinic: "Therapy Clinic",
  faith_community: "Faith",
  family_nonprofit: "Nonprofit",
  law_enforcement: "Law Enforcement",
  existing_supporter_referral: "Supporter Referral",
};

function PartnersTab() {
  const sorted = useMemo(() => [...PARTNERS].sort((a, b) => b.referrals_lifetime - a.referrals_lifetime), []);
  return (
    <section style={card({ padding: 0 })}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #1f2937" }}>
        <h2 style={{ ...ssTitle, marginBottom: 4 }}>Community partners</h2>
        <p style={ssLead}>The 20 organizations referring families + amplifying LCAC&apos;s reach. Active = 12+ referrals lifetime.</p>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sorted.map((p) => (
          <li key={p.id} style={{ padding: "12px 18px", borderTop: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0, flex: "1 1 280px" }}>
              <p style={{ margin: 0, fontWeight: 700, color: "white", fontSize: 14 }}>
                {p.org_name}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
                {p.primary_contact} · {p.city}, {p.county} County · {CAT_LABELS[p.category]}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
              <span style={{
                padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                background: p.status === "active" ? "rgba(16,185,129,0.15)" : p.status === "warm" ? "rgba(245,158,11,0.12)" : p.status === "exploring" ? "rgba(139,92,246,0.12)" : "rgba(100,116,139,0.12)",
                color: p.status === "active" ? "#6ee7b7" : p.status === "warm" ? "#fcd34d" : p.status === "exploring" ? "#c4b5fd" : "#94a3b8",
                border: `1px solid ${p.status === "active" ? "rgba(16,185,129,0.4)" : p.status === "warm" ? "rgba(245,158,11,0.4)" : "rgba(100,116,139,0.4)"}`,
              }}>
                {p.status}
              </span>
              <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 12 }}>
                <span style={{ color: ACCENT_WARM, fontWeight: 700 }}>{p.referrals_lifetime}</span>
                <span style={{ color: "#64748b" }}> refs</span>
                <p style={{ margin: "1px 0 0", fontSize: 10, color: "#94a3b8" }}>
                  {p.families_served_from_refs} families served
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────────────────── FOOTER ───────────────────────── */

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #1f2937", background: "#020617" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>
          Mock data. Every number resets on reload.
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>
          Built by BlueJays · Mission Dashboard preview for Lewis County Autism Coalition
        </p>
      </div>
    </footer>
  );
}

/* ───────────────────────── PRIMITIVES ───────────────────────── */

function card(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid #1f2937",
    borderRadius: 14,
    padding: 18,
    ...extra,
  };
}

const ssTitle: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 16,
  color: "white",
  margin: "0 0 4px",
  letterSpacing: "-0.005em",
};

const ssLead: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "#94a3b8",
  lineHeight: 1.55,
};

function Stat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      ...card(),
      padding: 12,
      borderColor: accent ? `${ACCENT}66` : "#1f2937",
      background: accent ? "rgba(13,148,136,0.05)" : "rgba(255,255,255,0.02)",
    }}>
      <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b", fontWeight: 700 }}>
        {label}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: accent ? ACCENT : "white", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {value}
      </p>
      {sub && <p style={{ margin: "1px 0 0", fontSize: 10, color: "#64748b" }}>{sub}</p>}
    </div>
  );
}
