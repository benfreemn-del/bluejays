"use client";

/**
 * MOCK BACKEND — Meyer Electric demo
 * ───────────────────────────────────
 * Password-gated (1212) demo of what a Meyer Electric AI System backend
 * would look like. Pure mock data, zero real APIs. Built for live demos
 * to wow the prospect on the sales call.
 *
 * Architecture per Ben's locked answers (2026-05-06):
 *   - URL: /clients/meyer-electric/portal-demo (Q1=A)
 *   - Gate: client-side password, sessionStorage on success (Q2=A)
 *   - Entry: small secondary feather in public-site footer (Q3=A)
 *   - Scale: 200 leads, 30 affiliates, 15 customers (Q4=B)
 *   - Tabs: Overview / Leads / Map / Funnels / Customers / Affiliates /
 *           AI Skills / Settings (Q5=A)
 *   - Interactive: ALL FOUR (Q6=E) — Powerwall ROI · Generator Sizer ·
 *                  Service-Area Heatmap · Outage Recovery Simulator
 *   - Lead scoring: full 3-tier signals (Q7=C)
 *   - Persistence: pure mock, reload resets (Q8=A)
 *   - Branding: BlueJays dashboard frame + Meyer yellow accents (Q9=C)
 *
 * For reuse on other prospects: see docs/MOCK_BACKEND_PLAYBOOK.md +
 * docs/mock-backends/<industry>.md (this is the electrician config).
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  MOCK_LEADS,
  MOCK_AFFILIATES,
  MOCK_REPEAT_CUSTOMERS,
  WA_COUNTIES,
  FUNNELS,
  type Lead,
  type LeadStatus,
} from "./mock-data";

const ACCENT = "#facc15"; // Meyer yellow (carryover from public site)
const ACCENT_ORANGE = "#f97316";
const PASSWORD = "1212";

type Tab =
  | "overview"
  | "leads"
  | "map"
  | "funnels"
  | "customers"
  | "affiliates"
  | "ai-skills"
  | "settings";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "overview", label: "Overview", emoji: "🏠" },
  { id: "leads", label: "Leads", emoji: "📥" },
  { id: "map", label: "Map", emoji: "🗺️" },
  { id: "funnels", label: "Funnels", emoji: "🎯" },
  { id: "customers", label: "Customers", emoji: "💼" },
  { id: "affiliates", label: "Affiliates", emoji: "🤝" },
  { id: "ai-skills", label: "AI Skills", emoji: "🧠" },
  { id: "settings", label: "Settings", emoji: "⚙️" },
];

export default function MeyerPortalDemo() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("bj_demo") === "ok") {
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwInput === PASSWORD) {
      setUnlocked(true);
      window.sessionStorage.setItem("bj_demo", "ok");
      setPwError("");
    } else {
      setPwError("Wrong password.");
      setPwInput("");
    }
  };

  if (!unlocked) {
    return (
      <PasswordGate
        pwInput={pwInput}
        setPwInput={setPwInput}
        pwError={pwError}
        onSubmit={handleUnlock}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <FeatherMark size={28} />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                BlueJays System · Demo
              </p>
              <h1 className="truncate text-base sm:text-lg font-semibold">
                Meyer Electric{" "}
                <span className="text-slate-500 font-normal">/ Backend</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/clients/meyer-electric"
              className="text-[11px] uppercase tracking-wider text-slate-400 hover:text-white border border-slate-700 px-2.5 py-1.5 rounded"
            >
              ← Site
            </Link>
            <span
              className="text-[10px] uppercase tracking-[0.18em] font-bold px-2 py-1 rounded"
              style={{ background: ACCENT, color: "#0a0a0a" }}
            >
              DEMO
            </span>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 flex gap-1 sm:gap-2 text-sm overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-2.5 px-3 sm:px-4 border-b-2 transition font-semibold flex items-center gap-1.5 whitespace-nowrap ${
                tab === t.id
                  ? "border-yellow-400 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-base">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-32">
        {tab === "overview" && <OverviewTab />}
        {tab === "leads" && <LeadsTab />}
        {tab === "map" && <MapTab />}
        {tab === "funnels" && <FunnelsTab />}
        {tab === "customers" && <CustomersTab />}
        {tab === "affiliates" && <AffiliatesTab />}
        {tab === "ai-skills" && <AISkillsTab />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}

/* ───────────────────────── PASSWORD GATE ───────────────────────── */

function PasswordGate({
  pwInput,
  setPwInput,
  pwError,
  onSubmit,
}: {
  pwInput: string;
  setPwInput: (v: string) => void;
  pwError: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-950 px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/8 bg-slate-900/60 p-8 sm:p-10"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
      >
        <div className="flex justify-center mb-6">
          <FeatherMark size={56} />
        </div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-white text-center tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Meyer Electric Backend
        </h1>
        <p className="mt-2 text-sm text-slate-400 text-center">
          Demo portal · password protected
        </p>
        <form onSubmit={onSubmit} className="mt-7 space-y-3">
          <input
            type="password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            autoFocus
            inputMode="numeric"
            placeholder="Enter password"
            className="w-full h-12 px-4 rounded-md bg-slate-950 border border-slate-700 text-white text-center text-lg tracking-[0.4em] focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />
          {pwError && (
            <p className="text-rose-400 text-xs text-center">{pwError}</p>
          )}
          <button
            type="submit"
            className="w-full h-12 rounded-md font-bold uppercase tracking-wide text-sm text-black hover:brightness-110 active:scale-[0.97] transition-all"
            style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_ORANGE} 100%)`,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Unlock
          </button>
        </form>
        <p className="mt-6 text-[11px] text-slate-600 text-center">
          Built by BlueJays · Sample backend for demo purposes
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────── FEATHER MARK ───────────────────────── */

function FeatherMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className="text-yellow-400 shrink-0"
      style={{ filter: "drop-shadow(0 0 8px rgba(250, 204, 21, 0.4))" }}
    >
      <path d="M28 4c-2 0-4 1-6 3l-12 12c-1 1-2 3-2 5l-2 4 4-2c2 0 4-1 5-2l12-12c2-2 3-4 3-6 0-1-1-2-2-2zm-4 4l-2 2c-1 1-1 2 0 3l2 2-2 2c-1 1-1 2 0 3-1-1-2-1-3 0l-2 2-3-2c-1-1-2-1-3 0l-2 2 8-8c1-1 4-3 7-6z" />
    </svg>
  );
}

/* ───────────────────────── HELPERS ───────────────────────── */

function fmtMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusColor(s: LeadStatus): { bg: string; text: string; label: string } {
  switch (s) {
    case "new": return { bg: "rgba(59, 130, 246, 0.15)", text: "rgb(96, 165, 250)", label: "New" };
    case "contacted": return { bg: "rgba(168, 85, 247, 0.15)", text: "rgb(192, 132, 252)", label: "Contacted" };
    case "follow_up": return { bg: "rgba(250, 204, 21, 0.15)", text: "rgb(250, 204, 21)", label: "Follow-up" };
    case "quote_sent": return { bg: "rgba(249, 115, 22, 0.15)", text: "rgb(251, 146, 60)", label: "Quote Sent" };
    case "won": return { bg: "rgba(34, 197, 94, 0.15)", text: "rgb(74, 222, 128)", label: "Won" };
    case "lost": return { bg: "rgba(239, 68, 68, 0.15)", text: "rgb(248, 113, 113)", label: "Lost" };
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return "rgb(34, 197, 94)";   // emerald — hot
  if (score >= 60) return "rgb(250, 204, 21)";  // yellow — warm
  if (score >= 40) return "rgb(249, 115, 22)";  // orange — tepid
  return "rgb(148, 163, 184)";                  // slate — cold
}

/* ───────────────────────── OVERVIEW TAB ───────────────────────── */

function OverviewTab() {
  const stats = useMemo(() => {
    const totalLeads = MOCK_LEADS.length;
    const won = MOCK_LEADS.filter((l) => l.status === "won").length;
    const newLeads = MOCK_LEADS.filter((l) => l.status === "new").length;
    const hotLeads = MOCK_LEADS.filter((l) => l.lead_score >= 75).length;
    const pipelineValue = MOCK_LEADS
      .filter((l) => ["new", "contacted", "follow_up", "quote_sent"].includes(l.status))
      .reduce((s, l) => s + l.job_estimate, 0);
    const wonRevenue = MOCK_LEADS.filter((l) => l.status === "won")
      .reduce((s, l) => s + l.job_estimate, 0);
    const conversion = totalLeads > 0 ? (won / totalLeads) * 100 : 0;
    return { totalLeads, won, newLeads, hotLeads, pipelineValue, wonRevenue, conversion };
  }, []);

  const recentHot = useMemo(
    () => MOCK_LEADS.filter((l) => l.lead_score >= 75 && l.status !== "won" && l.status !== "lost").slice(0, 8),
    []
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Welcome back, Kyle
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Here&rsquo;s what&rsquo;s happening across Meyer Electric this week.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pipeline Value" value={fmtMoney(stats.pipelineValue)} sub="Active opportunities" tone="yellow" />
        <StatCard label="Won This Year" value={fmtMoney(stats.wonRevenue)} sub={`${stats.won} jobs closed`} tone="emerald" />
        <StatCard label="Hot Leads" value={String(stats.hotLeads)} sub="Score ≥ 75" tone="orange" />
        <StatCard label="New (last 30 days)" value={String(stats.newLeads)} sub="Untouched" tone="slate" />
      </div>

      {/* Hot leads list */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h3 className="text-lg font-bold">🔥 Hot leads to call today</h3>
          <span className="text-xs text-slate-500">Top 8 by score</span>
        </div>
        <div className="rounded-xl border border-white/8 overflow-hidden">
          {recentHot.map((l, i) => (
            <div
              key={l.id}
              className="flex items-center gap-3 sm:gap-4 px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition"
            >
              <div
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{
                  background: `${scoreColor(l.lead_score)}15`,
                  color: scoreColor(l.lead_score),
                  border: `1px solid ${scoreColor(l.lead_score)}40`,
                }}
              >
                {l.lead_score}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate">
                  {l.business_name || l.contact_name}
                </div>
                <div className="text-[12px] text-slate-500 truncate">
                  {l.city}, {l.county} · {l.signals.powerwall_eligible && "⚡ Powerwall · "}
                  {l.signals.generator_eligible && "🔌 Generac · "}
                  {l.signals.repeat_customer && "🔁 Repeat · "}
                  {l.signals.urgency === "high" && "🚨 Urgent · "}
                  {fmtMoney(l.job_estimate)} est.
                </div>
              </div>
              <div
                className="hidden sm:block text-[11px] uppercase tracking-wider px-2 py-1 rounded"
                style={{ background: statusColor(l.status).bg, color: statusColor(l.status).text }}
              >
                {statusColor(l.status).label}
              </div>
              <div className="text-[11px] text-slate-500 shrink-0">{fmtDate(l.last_touched_at)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction emoji="📥" label="View all leads" tab="leads" />
        <QuickAction emoji="🗺️" label="See heatmap" tab="map" />
        <QuickAction emoji="🎯" label="Funnel analytics" tab="funnels" />
        <QuickAction emoji="🤝" label="Partner network" tab="affiliates" />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "yellow" | "emerald" | "orange" | "slate" }) {
  const colors: Record<string, string> = {
    yellow: "rgb(250, 204, 21)",
    emerald: "rgb(74, 222, 128)",
    orange: "rgb(251, 146, 60)",
    slate: "rgb(148, 163, 184)",
  };
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-500">{label}</div>
      <div className="mt-1.5 text-2xl sm:text-3xl font-bold tabular-nums" style={{ color: colors[tone], fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function QuickAction({ emoji, label }: { emoji: string; label: string; tab: Tab }) {
  return (
    <button
      type="button"
      className="rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-yellow-400/30 transition p-4 text-left"
      onClick={() => {
        // Note: these QuickActions are illustrative. The real navigation
        // lives in the tab bar above. Click here is a no-op for the demo.
      }}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
      <div className="mt-1 text-[11px] text-slate-500">Open →</div>
    </button>
  );
}

/* ───────────────────────── LEADS TAB ───────────────────────── */

function LeadsTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    return MOCK_LEADS.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (typeFilter !== "all" && l.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (l.business_name || "").toLowerCase().includes(q) ||
          l.contact_name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.county.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, statusFilter, typeFilter]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Leads
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {filtered.length} of {MOCK_LEADS.length} · sorted by score
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="search"
          placeholder="Search name, city, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] h-10 px-4 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
          className="h-10 px-3 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
        >
          <option value="all">All status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="follow_up">Follow-up</option>
          <option value="quote_sent">Quote sent</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
        >
          <option value="all">All types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="property_mgmt">Property Mgmt</option>
          <option value="general_contractor">GC / Contractor</option>
          <option value="industrial">Industrial</option>
        </select>
      </div>

      {/* Lead list */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_120px_100px_110px] sm:grid-cols-[60px_1.6fr_1fr_120px_120px_110px] gap-3 px-4 py-2.5 border-b border-white/8 bg-white/[0.02] text-[11px] uppercase tracking-wider font-semibold text-slate-500">
          <div>Score</div>
          <div>Name</div>
          <div className="hidden sm:block">Location</div>
          <div>Status</div>
          <div className="text-right">Est.</div>
          <div className="text-right">Last</div>
        </div>
        <div className="max-h-[640px] overflow-y-auto">
          {filtered.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelected(l)}
              className="w-full grid grid-cols-[60px_1fr_120px_100px_110px] sm:grid-cols-[60px_1.6fr_1fr_120px_120px_110px] gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition text-left items-center"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{
                  background: `${scoreColor(l.lead_score)}15`,
                  color: scoreColor(l.lead_score),
                  border: `1px solid ${scoreColor(l.lead_score)}40`,
                }}
              >
                {l.lead_score}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{l.business_name || l.contact_name}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {l.signals.powerwall_eligible && "⚡ "}
                  {l.signals.generator_eligible && "🔌 "}
                  {l.signals.repeat_customer && "🔁 "}
                  {l.signals.urgency === "high" && "🚨 "}
                  {l.signals.affiliate_source ? `via ${l.signals.affiliate_source}` : l.type.replace("_", " ")}
                </div>
              </div>
              <div className="hidden sm:block text-xs text-slate-400 truncate">
                {l.city}, {l.county}
              </div>
              <div>
                <span
                  className="text-[10px] uppercase tracking-wider px-2 py-1 rounded"
                  style={{ background: statusColor(l.status).bg, color: statusColor(l.status).text }}
                >
                  {statusColor(l.status).label}
                </span>
              </div>
              <div className="text-sm font-semibold text-right tabular-nums">{fmtMoney(l.job_estimate)}</div>
              <div className="text-[11px] text-slate-500 text-right">{fmtDate(l.last_touched_at)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <LeadDetailDrawer lead={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function LeadDetailDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-2xl bg-slate-900 border border-white/8 rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                style={{
                  background: `${scoreColor(lead.lead_score)}15`,
                  color: scoreColor(lead.lead_score),
                  border: `1px solid ${scoreColor(lead.lead_score)}40`,
                }}
              >
                {lead.lead_score}
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {lead.business_name || lead.contact_name}
                </h2>
                <p className="text-xs text-slate-500">
                  {lead.business_name && `${lead.contact_name} · `}
                  {lead.type.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* Contact */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <ContactRow label="Phone" value={lead.phone} />
          <ContactRow label="Email" value={lead.email} />
          <ContactRow label="Address" value={lead.address} />
          <ContactRow label="Status" value={statusColor(lead.status).label} />
        </div>

        {/* Signals — what makes this lead score what it scored */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400 mb-3">Signals</h3>
          <div className="grid grid-cols-2 gap-2">
            <SignalChip on={lead.signals.powerwall_eligible} label="⚡ Powerwall fit" />
            <SignalChip on={lead.signals.generator_eligible} label="🔌 Generac fit" />
            <SignalChip on={lead.signals.repeat_customer} label="🔁 Repeat customer" />
            <SignalChip on={!!lead.signals.affiliate_source} label="🤝 Affiliate-sourced" />
            <SignalChip on={lead.signals.urgency === "high"} label="🚨 Urgent (recent storm)" />
            <SignalChip on={lead.signals.seasonal_peak} label="🌧 Storm season" />
            <SignalChip on={!!lead.signals.multi_property} label="🏢 Multi-property" />
            <SignalChip on={!!lead.signals.has_solar} label="☀️ Solar installed" />
          </div>
        </div>

        {/* Property / business specifics */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400 mb-3">Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {lead.signals.property_value && (
              <DetailRow label="Property value" value={fmtMoney(lead.signals.property_value)} />
            )}
            {lead.signals.home_age_yrs && (
              <DetailRow label="Home age" value={`${lead.signals.home_age_yrs} years`} />
            )}
            {lead.signals.monthly_electric_bill && (
              <DetailRow label="Monthly bill" value={fmtMoney(lead.signals.monthly_electric_bill)} />
            )}
            {lead.signals.sq_ft && (
              <DetailRow label="Sq ft" value={`${lead.signals.sq_ft.toLocaleString()} sqft`} />
            )}
            {lead.signals.affiliate_source && (
              <DetailRow label="Source" value={lead.signals.affiliate_source} />
            )}
            <DetailRow label="Job estimate" value={fmtMoney(lead.job_estimate)} />
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="mb-6 rounded-lg p-4" style={{ background: "rgba(250, 204, 21, 0.06)", border: `1px solid rgba(250, 204, 21, 0.18)` }}>
            <div className="text-[11px] uppercase tracking-wider text-yellow-400 font-semibold mb-1">Notes</div>
            <div className="text-sm text-slate-300">{lead.notes}</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            className="flex-1 h-11 rounded-lg font-bold text-sm text-black hover:brightness-110 active:scale-[0.97] transition"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_ORANGE} 100%)`, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            📞 Call
          </button>
          <button
            type="button"
            className="flex-1 h-11 rounded-lg font-bold text-sm text-white border-2 border-white/15 hover:bg-white/[0.04] transition"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ✉️ Email Quote
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className="mt-0.5 text-sm text-white">{value}</div>
    </div>
  );
}
function SignalChip({ on, label }: { on: boolean; label: string }) {
  return (
    <div className={`text-xs px-3 py-2 rounded-md ${on ? "bg-yellow-400/10 text-yellow-300 border border-yellow-400/30" : "bg-slate-800/40 text-slate-600 border border-slate-800"}`}>
      {label}
    </div>
  );
}
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/[0.02] border border-white/5 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

/* ───────────────────────── MAP TAB (county heatmap) ─────────────────────── */

function MapTab() {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const total = useMemo(() => WA_COUNTIES.reduce((s, c) => s + c.active_leads, 0), []);
  const totalRevenue = useMemo(
    () => WA_COUNTIES.reduce((s, c) => s + c.closed_jobs_ytd * c.avg_job_value, 0),
    []
  );
  const focused = WA_COUNTIES.find((c) => c.name === hoveredCounty) || WA_COUNTIES[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          🗺️ Service-area heatmap
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Lead density across {WA_COUNTIES.length} Washington counties · Olympic Peninsula focus
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active Leads" value={String(total)} sub="Across WA" tone="yellow" />
        <StatCard label="Closed (YTD)" value={String(WA_COUNTIES.reduce((s, c) => s + c.closed_jobs_ytd, 0))} sub="Jobs delivered" tone="emerald" />
        <StatCard label="YTD Revenue" value={fmtMoney(totalRevenue)} sub="Closed jobs only" tone="orange" />
        <StatCard label="Hot Counties" value={String(WA_COUNTIES.filter((c) => c.lead_score >= 70).length)} sub="Score ≥ 70" tone="slate" />
      </div>

      {/* Stylized WA map — county circles sized + colored by lead density */}
      <div
        className="relative rounded-2xl border border-white/8 bg-slate-900/40 p-4 sm:p-6 overflow-hidden"
        style={{ minHeight: 360 }}
      >
        {/* Background grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden="true">
          <defs>
            <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#fff" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>
        {/* WA stylized outline as a faint backdrop */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M 4 14 L 8 8 L 60 6 L 96 8 L 96 28 L 92 38 L 86 44 L 78 48 L 60 50 L 40 52 L 26 50 L 14 44 L 6 36 L 4 24 Z"
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(250, 204, 21, 0.15)"
            strokeWidth="0.4"
          />
        </svg>
        {/* County dots */}
        <div className="relative" style={{ height: 320 }}>
          {WA_COUNTIES.map((c) => {
            const size = 18 + (c.lead_score / 100) * 56; // 18-74 px
            const color = scoreColor(c.lead_score);
            const isFocus = hoveredCounty === c.name;
            return (
              <button
                key={c.fips}
                type="button"
                onMouseEnter={() => setHoveredCounty(c.name)}
                onFocus={() => setHoveredCounty(c.name)}
                onMouseLeave={() => setHoveredCounty(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 focus:outline-none focus:scale-110"
                style={{ left: `${c.cx}%`, top: `${c.cy}%`, width: size, height: size }}
              >
                <span
                  className="block w-full h-full rounded-full"
                  style={{
                    background: color,
                    opacity: isFocus ? 0.9 : 0.55,
                    boxShadow: isFocus ? `0 0 24px ${color}` : `0 0 12px ${color}40`,
                  }}
                />
                <span
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-bold pointer-events-none"
                  style={{ color: c.lead_score > 50 ? "#0a0a0a" : "#fff" }}
                >
                  {c.lead_score}
                </span>
                <span
                  className="absolute left-1/2 -translate-x-1/2 mt-1 text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap"
                  style={{ top: "100%", color: isFocus ? "#fff" : "rgba(255,255,255,0.55)" }}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Focused county detail */}
      <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/[0.03] p-5">
        <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-yellow-400">Focused county</div>
        <h3 className="mt-1 text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {focused.name} County
        </h3>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Lead Score" value={String(focused.lead_score)} sub="0-100" tone="yellow" />
          <StatCard label="Active Leads" value={String(focused.active_leads)} sub="In pipeline" tone="emerald" />
          <StatCard label="YTD Jobs" value={String(focused.closed_jobs_ytd)} sub="Closed" tone="orange" />
          <StatCard label="Storms (30d)" value={String(focused.storms_30d)} sub="Outage signals" tone="slate" />
        </div>
        <p className="mt-4 text-sm text-slate-400 leading-relaxed">{focused.notes}</p>
      </div>
    </div>
  );
}

/* ───────────────────────── FUNNELS TAB ───────────────────────── */

function FunnelsTab() {
  const [activeFunnel, setActiveFunnel] = useState(FUNNELS[0].id);
  const f = FUNNELS.find((x) => x.id === activeFunnel) || FUNNELS[0];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          🎯 Funnels
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Per-audience automated outreach sequences. Each funnel has its own steps + conversion data.
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {FUNNELS.map((fn) => (
          <button
            key={fn.id}
            type="button"
            onClick={() => setActiveFunnel(fn.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeFunnel === fn.id ? "bg-yellow-400 text-black" : "bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"}`}
          >
            {fn.name}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-white/8 bg-slate-900/40 p-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold">{f.name}</h3>
            <p className="text-sm text-slate-400 mt-0.5">{f.audience}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Leads</div>
              <div className="text-lg font-bold tabular-nums">{f.total_leads}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Won</div>
              <div className="text-lg font-bold text-emerald-400 tabular-nums">{f.total_won}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Convert</div>
              <div className="text-lg font-bold text-yellow-400 tabular-nums">{f.conversion_rate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">{f.description}</p>
        {/* Funnel steps */}
        <div className="space-y-3">
          {f.steps.map((step, i) => {
            const widthPct = step.conversion_pct;
            return (
              <div key={step.step}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-white/8">
                      {step.step}
                    </span>
                    <span className="text-sm font-semibold text-white">{step.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">{step.channel}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(step.conversion_pct) }}>
                    {step.conversion_pct}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${widthPct}%`,
                      background: `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_ORANGE} 100%)`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Day +{step.day_offset}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-5 border-t border-white/8 flex items-center justify-between text-sm">
          <span className="text-slate-400">Avg job value</span>
          <span className="font-bold text-yellow-400">{fmtMoney(f.avg_job_value)}</span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── CUSTOMERS TAB ───────────────────────── */

function CustomersTab() {
  const total = MOCK_REPEAT_CUSTOMERS.reduce((s, c) => s + c.lifetime_value, 0);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          💼 Repeat customers
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {MOCK_REPEAT_CUSTOMERS.length} commercial accounts · {fmtMoney(total)} lifetime value
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MOCK_REPEAT_CUSTOMERS.map((c) => (
          <div key={c.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 hover:border-yellow-400/30 transition">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h3 className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{c.business_name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 capitalize">{c.industry.replace("_", " ")} · {c.location}</p>
              </div>
              <span
                className="text-[10px] uppercase tracking-wider px-2 py-1 rounded shrink-0"
                style={{
                  background: c.contract_status === "active" ? "rgba(34,197,94,0.15)" : c.contract_status === "expiring_soon" ? "rgba(250,204,21,0.15)" : "rgba(239,68,68,0.15)",
                  color: c.contract_status === "active" ? "rgb(74,222,128)" : c.contract_status === "expiring_soon" ? "rgb(250,204,21)" : "rgb(248,113,113)",
                }}
              >
                {c.contract_status.replace("_", " ")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-xs">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">LTV</div>
                <div className="font-bold text-yellow-400">{fmtMoney(c.lifetime_value)}</div>
              </div>
              <div className="text-xs">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Jobs</div>
                <div className="font-bold">{c.jobs_completed}</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{c.primary_contact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── AFFILIATES TAB ───────────────────────── */

function AffiliatesTab() {
  const total = MOCK_AFFILIATES.reduce((s, a) => s + a.closed_revenue, 0);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          🤝 Affiliate partners
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {MOCK_AFFILIATES.length} partners · {fmtMoney(total)} closed revenue · referral pipeline
        </p>
      </div>
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr_70px_70px_120px_90px] gap-3 px-4 py-2.5 border-b border-white/8 bg-white/[0.02] text-[11px] uppercase tracking-wider font-semibold text-slate-500">
          <div>Name / Co.</div>
          <div className="hidden sm:block">Category</div>
          <div className="text-right">Refs</div>
          <div className="text-right">Closed</div>
          <div className="text-right">Revenue</div>
          <div>Status</div>
        </div>
        <div className="max-h-[640px] overflow-y-auto">
          {MOCK_AFFILIATES.map((a) => {
            const tone = a.status === "active" ? { bg: "rgba(34,197,94,0.15)", text: "rgb(74,222,128)" } : a.status === "warm" ? { bg: "rgba(250,204,21,0.15)", text: "rgb(250,204,21)" } : { bg: "rgba(148,163,184,0.15)", text: "rgb(148,163,184)" };
            return (
              <div key={a.id} className="grid grid-cols-[1.5fr_1fr_70px_70px_120px_90px] gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{a.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{a.company}</div>
                </div>
                <div className="hidden sm:block text-xs text-slate-400 capitalize self-center">{a.category.replace("_", " ")}</div>
                <div className="text-sm font-semibold text-right tabular-nums self-center">{a.referrals_lifetime}</div>
                <div className="text-sm font-semibold text-emerald-400 text-right tabular-nums self-center">{a.jobs_closed}</div>
                <div className="text-sm font-bold text-yellow-400 text-right tabular-nums self-center">{fmtMoney(a.closed_revenue)}</div>
                <div className="self-center">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded" style={{ background: tone.bg, color: tone.text }}>
                    {a.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── AI SKILLS TAB (interactive features) ─────── */

function AISkillsTab() {
  const [active, setActive] = useState<"powerwall" | "generator" | "outage" | null>(null);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          🧠 AI Skills
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Customer-facing tools that qualify leads + close deals at the kitchen table.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <SkillCard emoji="⚡" label="Powerwall ROI Calculator" desc="Slider tool that shows 7-year payback timeline based on utility rate + monthly bill." active={active === "powerwall"} onOpen={() => setActive("powerwall")} />
        <SkillCard emoji="🔌" label="Generator Sizing Tool" desc="Sq ft + appliances → recommended kW + matching Generac model." active={active === "generator"} onOpen={() => setActive("generator")} />
        <SkillCard emoji="🌧" label="Outage Recovery Simulator" desc="Animated timeline showing what happens when grid fails: Powerwall → Generac → home stays powered." active={active === "outage"} onOpen={() => setActive("outage")} />
      </div>
      {active === "powerwall" && <PowerwallROI />}
      {active === "generator" && <GeneratorSizer />}
      {active === "outage" && <OutageSimulator />}
    </div>
  );
}

function SkillCard({ emoji, label, desc, active, onOpen }: { emoji: string; label: string; desc: string; active: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`text-left rounded-xl border p-4 hover:bg-white/[0.04] transition ${active ? "border-yellow-400/60 bg-yellow-400/[0.04]" : "border-white/8 bg-white/[0.02]"}`}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 text-sm font-bold">{label}</div>
      <div className="mt-1 text-[11px] text-slate-500 leading-relaxed">{desc}</div>
      <div className="mt-2 text-[11px] uppercase tracking-wider font-semibold" style={{ color: active ? ACCENT : "rgb(148,163,184)" }}>
        {active ? "Open ▾" : "Open ▸"}
      </div>
    </button>
  );
}

/* ───── Powerwall ROI Calculator ───── */

function PowerwallROI() {
  const [bill, setBill] = useState(280);
  const [rate, setRate] = useState(0.13);
  const [hasSolar, setHasSolar] = useState(false);
  const cost = 13000;
  const annualBillReduction = bill * 12 * (hasSolar ? 0.85 : 0.45);
  const yearsToPayback = cost / annualBillReduction;
  return (
    <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/[0.03] p-6">
      <h3 className="text-lg font-bold mb-1">⚡ Tesla Powerwall — ROI Calculator</h3>
      <p className="text-xs text-slate-400 mb-5">Adjust the sliders to see your client&rsquo;s payback timeline.</p>
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <SliderInput label="Monthly bill" value={bill} min={100} max={800} step={20} onChange={setBill} format={(v) => `$${v}`} />
        <SliderInput label="Utility rate ($/kWh)" value={rate} min={0.08} max={0.22} step={0.01} onChange={setRate} format={(v) => `$${v.toFixed(2)}`} />
        <div className="rounded-lg bg-slate-900 border border-slate-700 p-3 flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Solar installed?</div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setHasSolar(false)} className={`flex-1 h-9 rounded text-xs font-semibold ${!hasSolar ? "bg-yellow-400 text-black" : "bg-slate-800 text-slate-400"}`}>No</button>
            <button type="button" onClick={() => setHasSolar(true)} className={`flex-1 h-9 rounded text-xs font-semibold ${hasSolar ? "bg-yellow-400 text-black" : "bg-slate-800 text-slate-400"}`}>Yes</button>
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <ResultCard label="Powerwall cost" value={fmtMoney(cost)} sub="Installed" />
        <ResultCard label="Annual savings" value={fmtMoney(Math.round(annualBillReduction))} sub="Reduced bills" tone="emerald" />
        <ResultCard label="Payback" value={`${yearsToPayback.toFixed(1)} yrs`} sub="Then pure savings" tone="yellow" />
      </div>
    </div>
  );
}

/* ───── Generator Sizer ───── */

function GeneratorSizer() {
  const [sqft, setSqft] = useState(2400);
  const [hasAC, setHasAC] = useState(true);
  const [hasWell, setHasWell] = useState(false);
  const [hasEV, setHasEV] = useState(false);
  const baseLoad = sqft * 0.005; // ~1 kW per 200 sqft baseline
  const totalKw = baseLoad + (hasAC ? 4 : 0) + (hasWell ? 2 : 0) + (hasEV ? 7 : 0);
  const recommendedKw = Math.ceil(totalKw / 4) * 4 + 4; // round up + buffer
  const model = recommendedKw <= 14 ? "Generac 14kW Guardian" : recommendedKw <= 22 ? "Generac 22kW Guardian" : recommendedKw <= 26 ? "Generac 26kW Guardian" : "Generac 38kW Protector";
  const installed = 8500 + recommendedKw * 320;
  return (
    <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/[0.03] p-6">
      <h3 className="text-lg font-bold mb-1">🔌 Generator Sizing Tool</h3>
      <p className="text-xs text-slate-400 mb-5">Pick the home&rsquo;s appliances. We calculate the right kW + matching Generac model.</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <SliderInput label="Home sq ft" value={sqft} min={800} max={6000} step={100} onChange={setSqft} format={(v) => v.toLocaleString()} />
        <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Add load</div>
          <div className="space-y-1.5">
            <ToggleRow on={hasAC} onChange={setHasAC} label="Central A/C (+4kW)" />
            <ToggleRow on={hasWell} onChange={setHasWell} label="Well pump (+2kW)" />
            <ToggleRow on={hasEV} onChange={setHasEV} label="EV charger (+7kW)" />
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <ResultCard label="Recommended" value={`${recommendedKw}kW`} sub="With safety buffer" tone="yellow" />
        <ResultCard label="Generac model" value={model.replace("Generac ", "")} sub={model.split(" ").slice(2).join(" ")} />
        <ResultCard label="Installed price" value={fmtMoney(installed)} sub="With ATS + permit" tone="emerald" />
      </div>
    </div>
  );
}

/* ───── Outage Recovery Simulator ───── */

function OutageSimulator() {
  const [phase, setPhase] = useState<"normal" | "outage" | "powerwall" | "generac">("normal");
  return (
    <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/[0.03] p-6">
      <h3 className="text-lg font-bold mb-1">🌧 Outage Recovery Simulator</h3>
      <p className="text-xs text-slate-400 mb-5">Click each phase to see what happens when the grid drops.</p>
      <div className="flex gap-2 flex-wrap mb-5">
        {(["normal", "outage", "powerwall", "generac"] as const).map((p) => (
          <button key={p} type="button" onClick={() => setPhase(p)} className={`px-3 py-2 rounded-md text-xs font-semibold capitalize ${phase === p ? "bg-yellow-400 text-black" : "bg-slate-900 border border-slate-700 text-slate-400"}`}>
            {p === "powerwall" ? "Powerwall kicks in" : p === "generac" ? "Generac fires up" : p}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
        <div className="grid grid-cols-3 gap-4 items-center">
          <Tile label="Grid" status={phase === "normal" ? "live" : "offline"} />
          <span className="text-3xl text-center" style={{ color: phase === "normal" ? "rgb(74,222,128)" : phase === "outage" ? "rgb(248,113,113)" : ACCENT }}>→</span>
          <Tile label="Home" status={phase === "outage" ? "offline" : "live"} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <Tile label="Powerwall" status={phase === "powerwall" || phase === "generac" ? "live" : phase === "outage" ? "ready" : "idle"} />
          <Tile label="Generac" status={phase === "generac" ? "live" : "idle"} />
        </div>
        <div className="mt-5 text-sm text-slate-400 leading-relaxed">
          {phase === "normal" && <>✅ Grid is up. Home runs normally. Powerwall is fully charged. Generac is on standby (auto-tested weekly).</>}
          {phase === "outage" && <>🔴 Grid drops. Within 200ms the home senses it. Powerwall takes over INSTANTLY — you don&rsquo;t even notice.</>}
          {phase === "powerwall" && <>🟡 Powerwall powers the whole home. Typical capacity: 13.5 kWh = ~12 hours of essentials. App shows usage live.</>}
          {phase === "generac" && <>🟢 If outage runs long, Generac auto-starts in ~8 seconds. Powerwall recharges from generator. Home runs indefinitely.</>}
        </div>
      </div>
    </div>
  );
}

function Tile({ label, status }: { label: string; status: "live" | "offline" | "ready" | "idle" }) {
  const colors: Record<string, { bg: string; border: string; text: string; pulse: boolean }> = {
    live: { bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.5)", text: "rgb(74,222,128)", pulse: true },
    offline: { bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.5)", text: "rgb(248,113,113)", pulse: false },
    ready: { bg: "rgba(250,204,21,0.10)", border: "rgba(250,204,21,0.5)", text: "rgb(250,204,21)", pulse: false },
    idle: { bg: "rgba(148,163,184,0.06)", border: "rgba(148,163,184,0.2)", text: "rgb(148,163,184)", pulse: false },
  };
  const c = colors[status];
  return (
    <div className="rounded-lg p-4 text-center" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">{label}</div>
      <div className="text-base font-bold uppercase" style={{ color: c.text, fontFamily: "'Space Grotesk', sans-serif" }}>
        {status}
        {c.pulse && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      </div>
    </div>
  );
}

function SliderInput({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <div className="rounded-lg bg-slate-900 border border-slate-700 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        <div className="text-base font-bold tabular-nums" style={{ color: ACCENT }}>{format(value)}</div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" style={{ accentColor: ACCENT }} />
    </div>
  );
}

function ToggleRow({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="w-full flex items-center gap-2 text-xs hover:opacity-80 transition">
      <span className={`w-9 h-5 rounded-full relative transition ${on ? "bg-yellow-400" : "bg-slate-700"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
      <span className={on ? "text-white" : "text-slate-400"}>{label}</span>
    </button>
  );
}

function ResultCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "yellow" | "emerald" }) {
  const color = tone === "yellow" ? ACCENT : tone === "emerald" ? "rgb(74,222,128)" : "rgb(255,255,255)";
  return (
    <div className="rounded-lg border border-white/8 bg-slate-900/40 p-4">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className="mt-1.5 text-2xl font-bold tabular-nums" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}

/* ───────────────────────── SETTINGS TAB ───────────────────────── */

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          ⚙️ Settings
        </h2>
        <p className="text-sm text-slate-400 mt-1">Mock backend — read-only demo. Real backend connects to Stripe / Twilio / Google Ads.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <SettingsCard label="Business" desc="Meyer Electric LLC · 35 Robbins Rd, Sequim WA · License MEYERE*862P1" />
        <SettingsCard label="Phone" desc="(360) 477-2202 · Twilio + auto-text on missed call · ATS-approved" />
        <SettingsCard label="Hours" desc="Mon-Fri 8 AM - 5 PM · After-hours auto-responder · Emergency dispatch line on" />
        <SettingsCard label="Sender domain" desc="meyerelectric.com · SendGrid authenticated · DKIM + SPF + DMARC pass" />
        <SettingsCard label="Service area" desc="10 cities across Clallam, Jefferson, Kitsap, Mason counties" />
        <SettingsCard label="Integrations" desc="Stripe (deposits) · Twilio (SMS) · Google Ads · Meta · GA4 · Tesla Energy API" />
      </div>
      <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/[0.03] p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">This is a demo</p>
          <p className="text-xs text-slate-400 mt-0.5">All data is simulated. The real backend has live integrations + auto-flows.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.sessionStorage.removeItem("bj_demo");
            window.location.reload();
          }}
          className="h-9 px-4 rounded-md text-xs font-semibold border border-rose-500/30 text-rose-400 hover:border-rose-500/60"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function SettingsCard({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <div className="text-[11px] uppercase tracking-wider text-yellow-400 font-semibold">{label}</div>
      <div className="mt-1 text-sm text-slate-300">{desc}</div>
    </div>
  );
}
