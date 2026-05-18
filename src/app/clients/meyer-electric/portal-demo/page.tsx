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

import "leaflet/dist/leaflet.css";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Circle,
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip as LeafletTooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import FunnelVisualModal, {
  type FunnelDefLite,
  type FunnelStepLite,
} from "@/components/portal/FunnelVisualModal";
import {
  MOCK_LEADS,
  MOCK_AFFILIATES,
  MOCK_REPEAT_CUSTOMERS,
  WA_COUNTIES,
  PENINSULA_TOWNS,
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

  // Lead-mark state (added 2026-05-06 per Ben — bulk + one-at-a-time
  // marking on Overview AND Leads tabs). Lives at the parent so marks
  // made on the Overview tab persist when the user switches to Leads.
  // Mock-data only (Q8=A); changes never hit any API.
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, LeadStatus>
  >({});
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Persist marks to sessionStorage so a demo flow doesn't reset on
  // tab clicks. Cleared on logout / window close, matching the existing
  // unlock cookie behavior.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem("bj_demo_status_overrides");
      if (raw) setStatusOverrides(JSON.parse(raw) as Record<string, LeadStatus>);
      const rawDismissed = window.sessionStorage.getItem("bj_demo_dismissed");
      if (rawDismissed) {
        const arr = JSON.parse(rawDismissed) as string[];
        if (Array.isArray(arr)) setDismissed(new Set(arr));
      }
    } catch {
      // ignore — corrupted demo state shouldn't crash the page
    }
  }, []);

  // Single-lead mark (status pill dropdown in row). Persists.
  const setStatusOverride = (leadId: string, status: LeadStatus) => {
    setStatusOverrides((prev) => {
      const next = { ...prev, [leadId]: status };
      try {
        window.sessionStorage.setItem("bj_demo_status_overrides", JSON.stringify(next));
      } catch {}
      return next;
    });
    // Marking a status removes the lead from "dismissed" if present.
    setDismissed((prev) => {
      if (!prev.has(leadId)) return prev;
      const next = new Set(prev);
      next.delete(leadId);
      try {
        window.sessionStorage.setItem("bj_demo_dismissed", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Bulk mark — applies the same status to every selected lead. Persists.
  const bulkSetStatus = (leadIds: string[], status: LeadStatus) => {
    setStatusOverrides((prev) => {
      const next = { ...prev };
      for (const id of leadIds) next[id] = status;
      try {
        window.sessionStorage.setItem("bj_demo_status_overrides", JSON.stringify(next));
      } catch {}
      return next;
    });
    setDismissed((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of leadIds) {
        if (next.delete(id)) changed = true;
      }
      if (!changed) return prev;
      try {
        window.sessionStorage.setItem("bj_demo_dismissed", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const setDismissedFor = (leadIds: string[], on: boolean) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const id of leadIds) {
        if (on) {
          if (!next.has(id)) {
            next.add(id);
            changed = true;
          }
        } else if (next.delete(id)) {
          changed = true;
        }
      }
      if (!changed) return prev;
      try {
        window.sessionStorage.setItem("bj_demo_dismissed", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

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
        <div className="relative">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 flex gap-1 sm:gap-2 text-sm overflow-x-auto scrollbar-thin">
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
          {/* Right-edge fade — signals horizontal scroll exists on phones
              where 4-5 tabs overflow off-screen. Pre-2026-05-18 audit
              "discoverability fails" #1. */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950/95 to-transparent lg:hidden"
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-32">
        {tab === "overview" && (
          <OverviewTab
            statusOverrides={statusOverrides}
            dismissed={dismissed}
            setStatusOverride={setStatusOverride}
            bulkSetStatus={bulkSetStatus}
            setDismissedFor={setDismissedFor}
            onTabChange={setTab}
          />
        )}
        {tab === "leads" && (
          <LeadsTab
            statusOverrides={statusOverrides}
            dismissed={dismissed}
            setStatusOverride={setStatusOverride}
            bulkSetStatus={bulkSetStatus}
            setDismissedFor={setDismissedFor}
          />
        )}
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

/* ─────────────── MAP DOT-OVERLAY HELPERS ───────────────
   Place leads / customers / affiliates as deterministic
   jittered dots around their resolved peninsula town.
   Used by MapTab to render category layers on top of
   the town heatmap. Jitter is seeded by record id so
   positions are stable across renders/reloads. */

const CITY_TO_TOWN = new Map<string, (typeof PENINSULA_TOWNS)[number]>(
  PENINSULA_TOWNS.map((t) => [t.name.toLowerCase(), t]),
);

// Deterministic [-1, 1) hash from a string + salt — stable per record.
function strHash01(s: string, salt = 0): number {
  let h = salt >>> 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return ((h % 2000) / 1000) - 1;
}

// Spread ~1.5 mi (0.022° lat, 0.033° lng at 48°N).
function jitterLL(
  town: (typeof PENINSULA_TOWNS)[number],
  salt: string,
  scale = 1,
): [number, number] {
  const dLat = strHash01(salt, 17) * 0.022 * scale;
  const dLng = strHash01(salt, 41) * 0.033 * scale;
  return [town.lat + dLat, town.lng + dLng];
}

// Scan a free-form string for any peninsula-town name.
function findTownInString(s: string): (typeof PENINSULA_TOWNS)[number] | null {
  const lower = s.toLowerCase();
  for (const t of PENINSULA_TOWNS) {
    if (lower.includes(t.name.toLowerCase())) return t;
  }
  return null;
}

// Lead-type → dot color (5 buckets).
const LEAD_TYPE_COLOR: Record<string, string> = {
  residential: "#60a5fa",         // sky blue
  commercial: "#22d3ee",          // cyan
  property_mgmt: "#a78bfa",       // violet
  general_contractor: "#fb923c",  // orange
  industrial: "#f87171",          // red
};

const LEAD_TYPE_LABEL: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  property_mgmt: "Property Mgmt",
  general_contractor: "GC",
  industrial: "Industrial",
};

const CUSTOMER_COLOR = "#10b981";  // emerald — repeat $ customer
const AFFILIATE_COLOR = "#ec4899"; // pink — referral / dealer partner

/* ───────────────────────── OVERVIEW TAB ───────────────────────── */

// ─────────────────────────────────────────────────────────────────
// Shared lead-list helpers (added 2026-05-06 — bulk + single mark
// + sort by category/customer-type for Overview AND Leads tabs).
// Mock-data only: state lives in sessionStorage at the parent level
// so marks made in Overview persist when the user clicks Leads.
// ─────────────────────────────────────────────────────────────────

type LeadMarksProps = {
  statusOverrides: Record<string, LeadStatus>;
  dismissed: Set<string>;
  setStatusOverride: (leadId: string, status: LeadStatus) => void;
  bulkSetStatus: (leadIds: string[], status: LeadStatus) => void;
  setDismissedFor: (leadIds: string[], on: boolean) => void;
};

type LeadSort = "score" | "type" | "last_touched" | "estimate" | "name";

const LEAD_SORT_OPTIONS: Array<{ id: LeadSort; label: string }> = [
  { id: "score", label: "Score · high → low" },
  { id: "type", label: "Customer type · A → Z" },
  { id: "last_touched", label: "Last touched · newest" },
  { id: "estimate", label: "Job size · biggest" },
  { id: "name", label: "Name · A → Z" },
];

const STATUS_MARK_CHOICES: Array<{ id: LeadStatus; label: string; emoji: string }> = [
  { id: "new", label: "New", emoji: "🆕" },
  { id: "contacted", label: "Contacted", emoji: "📞" },
  { id: "follow_up", label: "Follow-up", emoji: "🔁" },
  { id: "quote_sent", label: "Quote sent", emoji: "📄" },
  { id: "won", label: "Won", emoji: "🏆" },
  { id: "lost", label: "Lost", emoji: "❌" },
];

const TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  property_mgmt: "Property Mgmt",
  general_contractor: "GC / Contractor",
  industrial: "Industrial",
};

/** Apply per-lead status overrides + dismiss flag on top of MOCK_LEADS. */
function applyMarks(
  leads: Lead[],
  overrides: Record<string, LeadStatus>,
  dismissedSet: Set<string>,
): Array<Lead & { _dismissed: boolean }> {
  return leads.map((l) => ({
    ...l,
    status: (overrides[l.id] ?? l.status) as LeadStatus,
    _dismissed: dismissedSet.has(l.id),
  }));
}

function sortLeads<T extends Lead>(leads: T[], sort: LeadSort): T[] {
  const copy = [...leads];
  switch (sort) {
    case "score":
      copy.sort((a, b) => b.lead_score - a.lead_score);
      break;
    case "type":
      copy.sort((a, b) => a.type.localeCompare(b.type) || b.lead_score - a.lead_score);
      break;
    case "last_touched":
      copy.sort(
        (a, b) =>
          new Date(b.last_touched_at).getTime() -
          new Date(a.last_touched_at).getTime(),
      );
      break;
    case "estimate":
      copy.sort((a, b) => b.job_estimate - a.job_estimate);
      break;
    case "name":
      copy.sort((a, b) =>
        (a.business_name || a.contact_name).localeCompare(
          b.business_name || b.contact_name,
        ),
      );
      break;
  }
  return copy;
}

/** Sort dropdown for both tabs. */
function SortDropdown({
  value,
  onChange,
  className = "",
}: {
  value: LeadSort;
  onChange: (next: LeadSort) => void;
  className?: string;
}) {
  return (
    <label className={`flex items-center gap-2 text-xs ${className}`}>
      <span className="text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap">
        Sort
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LeadSort)}
        className="h-9 px-2 rounded-md bg-slate-900 border border-slate-700 text-xs text-white focus:border-yellow-400 focus:outline-none"
      >
        {LEAD_SORT_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Sticky bulk-action toolbar. Only renders when ≥1 lead is selected. */
function BulkLeadToolbar({
  selectedIds,
  onClear,
  onMark,
  onDismiss,
}: {
  selectedIds: Set<string>;
  onClear: () => void;
  onMark: (status: LeadStatus) => void;
  onDismiss: () => void;
}) {
  if (selectedIds.size === 0) return null;
  const count = selectedIds.size;
  return (
    <div className="sticky top-[112px] z-20 rounded-xl border border-yellow-400/50 bg-yellow-950/80 backdrop-blur p-3 flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-widest font-bold text-yellow-300 px-2">
        {count} selected
      </span>
      <div className="flex flex-wrap gap-1.5">
        {STATUS_MARK_CHOICES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onMark(s.id)}
            className="h-8 px-2.5 rounded-md bg-slate-900/80 border border-white/10 hover:border-yellow-400/60 hover:bg-yellow-400/10 text-xs text-white font-semibold transition-colors flex items-center gap-1"
          >
            <span>{s.emoji}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={onDismiss}
          className="h-8 px-2.5 rounded-md bg-rose-950/40 border border-rose-500/40 hover:border-rose-400/70 hover:bg-rose-500/15 text-xs text-rose-200 font-semibold transition-colors flex items-center gap-1"
        >
          <span>🗑</span>
          <span className="hidden sm:inline">Dismiss</span>
        </button>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto h-8 px-2.5 rounded-md text-xs text-slate-400 hover:text-white"
      >
        Clear ✕
      </button>
    </div>
  );
}

/** Status pill that opens a dropdown for single-row mark.
 *  Per CLAUDE.md Owner Portal Rule 1 — control is a sibling of the
 *  row's main click target so click events don't proxy. */
function StatusPillDropdown({
  status,
  leadId,
  onMark,
  onDismiss,
  isDismissed,
}: {
  status: LeadStatus;
  leadId: string;
  onMark: (id: string, next: LeadStatus) => void;
  onDismiss: (id: string) => void;
  isDismissed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const c = isDismissed ? { bg: "rgba(244,63,94,0.10)", text: "#fda4af", label: "Dismissed" } : statusColor(status);
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        className="text-[10px] uppercase tracking-wider px-2 py-1 rounded font-semibold flex items-center gap-1 hover:brightness-125 transition"
        style={{ background: c.bg, color: c.text }}
        title="Click to change status"
      >
        <span>{c.label}</span>
        <span className="opacity-60">▾</span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-1 z-40 min-w-[180px] rounded-lg border border-white/15 bg-slate-900 shadow-xl p-1">
            {STATUS_MARK_CHOICES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onMark(leadId, s.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-left text-xs text-white hover:bg-white/[0.06] transition"
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
            <div className="my-1 border-t border-white/10" />
            <button
              type="button"
              onClick={() => {
                onDismiss(leadId);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-left text-xs text-rose-200 hover:bg-rose-500/15 transition"
            >
              <span>🗑</span>
              <span>{isDismissed ? "Restore" : "Dismiss"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Square checkbox — sibling of the row click target so it doesn't
 *  proxy clicks (Owner Portal Rule 1). */
function LeadSelectCheckbox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <span
      className="inline-flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-yellow-400 focus:ring-1 focus:ring-yellow-400 cursor-pointer"
        aria-label={ariaLabel}
      />
    </span>
  );
}

function OverviewTab({
  statusOverrides,
  dismissed,
  setStatusOverride,
  bulkSetStatus,
  setDismissedFor,
  onTabChange,
}: LeadMarksProps & { onTabChange: (tab: Tab) => void }) {
  // Sort + selection state for the Overview hot-leads list. Lives in
  // the tab so the user's "I sorted by customer type while looking
  // at the dashboard" preference doesn't bleed into Leads tab (which
  // has its own sort).
  const [sort, setSort] = useState<LeadSort>("score");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Apply marks + dismiss on top of MOCK_LEADS so the overview reflects
  // any in-session changes (Leads tab marks show up here too).
  const marked = useMemo(
    () => applyMarks(MOCK_LEADS, statusOverrides, dismissed),
    [statusOverrides, dismissed],
  );

  const stats = useMemo(() => {
    const totalLeads = marked.filter((l) => !l._dismissed).length;
    const won = marked.filter((l) => l.status === "won" && !l._dismissed).length;
    const newLeads = marked.filter((l) => l.status === "new" && !l._dismissed).length;
    const hotLeads = marked.filter((l) => l.lead_score >= 75 && !l._dismissed).length;
    const pipelineValue = marked
      .filter(
        (l) =>
          !l._dismissed &&
          ["new", "contacted", "follow_up", "quote_sent"].includes(l.status),
      )
      .reduce((s, l) => s + l.job_estimate, 0);
    const wonRevenue = marked
      .filter((l) => l.status === "won" && !l._dismissed)
      .reduce((s, l) => s + l.job_estimate, 0);
    const conversion = totalLeads > 0 ? (won / totalLeads) * 100 : 0;
    return { totalLeads, won, newLeads, hotLeads, pipelineValue, wonRevenue, conversion };
  }, [marked]);

  // Hot-leads list — top 12 of (score ≥ 70 AND not won/lost AND not
  // dismissed), then sorted by the chosen field. 12 instead of 8 so
  // bulk-select feels worth using.
  const overviewLeads = useMemo(() => {
    const base = marked.filter(
      (l) =>
        !l._dismissed &&
        l.lead_score >= 70 &&
        l.status !== "won" &&
        l.status !== "lost",
    );
    return sortLeads(base, sort).slice(0, 12);
  }, [marked, sort]);

  const visibleIds = useMemo(() => overviewLeads.map((l) => l.id), [overviewLeads]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        for (const id of visibleIds) next.delete(id);
        return next;
      }
      const next = new Set(prev);
      for (const id of visibleIds) next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkMark = (status: LeadStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    bulkSetStatus(ids, status);
    clearSelection();
  };
  const handleBulkDismiss = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setDismissedFor(ids, true);
    clearSelection();
  };
  const handleSingleDismiss = (leadId: string) => {
    setDismissedFor([leadId], !dismissed.has(leadId));
  };

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

      {/* Hot leads list — sortable + bulk-markable + single-mark via pill */}
      <section>
        <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
          <div>
            <h3 className="text-lg font-bold">🔥 Hot leads to call today</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Top {overviewLeads.length} · score ≥ 70 · sortable · select to bulk-mark
            </p>
          </div>
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        <BulkLeadToolbar
          selectedIds={selectedIds}
          onClear={clearSelection}
          onMark={handleBulkMark}
          onDismiss={handleBulkDismiss}
        />

        <div className="rounded-xl border border-white/8 overflow-hidden mt-2">
          {/* Header row with select-all */}
          <div className="grid grid-cols-[28px_60px_1fr_120px_140px_90px] gap-3 px-4 py-2.5 border-b border-white/8 bg-white/[0.02] text-[11px] uppercase tracking-wider font-semibold text-slate-500 items-center">
            <LeadSelectCheckbox
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              ariaLabel="Select all visible hot leads"
            />
            <div>Score</div>
            <div>Lead</div>
            <div className="hidden sm:block">Type</div>
            <div>Status</div>
            <div className="text-right">Last</div>
          </div>
          {overviewLeads.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              No hot leads match the current sort. Try Leads tab for the full list.
            </div>
          )}
          {overviewLeads.map((l) => {
            const isSelected = selectedIds.has(l.id);
            return (
              <div
                key={l.id}
                className={`grid grid-cols-[28px_60px_1fr_120px_140px_90px] gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 transition items-center ${
                  isSelected
                    ? "bg-yellow-400/[0.04] border-l-2 border-l-yellow-400"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                <LeadSelectCheckbox
                  checked={isSelected}
                  onChange={() => toggleSelect(l.id)}
                  ariaLabel={`Select ${l.business_name || l.contact_name}`}
                />
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
                  <div className="text-sm font-semibold text-white truncate">
                    {l.business_name || l.contact_name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {l.city}, {l.county}
                    {l.signals.powerwall_eligible && " · ⚡ Powerwall"}
                    {l.signals.generator_eligible && " · 🔌 Generac"}
                    {l.signals.repeat_customer && " · 🔁 Repeat"}
                    {l.signals.urgency === "high" && " · 🚨 Urgent"}
                    {" · "}
                    {fmtMoney(l.job_estimate)} est.
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-slate-400 truncate">
                  {TYPE_LABELS[l.type] ?? l.type.replace(/_/g, " ")}
                </div>
                <div>
                  <StatusPillDropdown
                    status={l.status}
                    leadId={l.id}
                    onMark={setStatusOverride}
                    onDismiss={handleSingleDismiss}
                    isDismissed={l._dismissed}
                  />
                </div>
                <div className="text-[11px] text-slate-500 text-right">
                  {fmtDate(l.last_touched_at)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick links — wired to setTab so live demos actually navigate
          (was a no-op pre-2026-05-18; sales-call credibility leak). */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction emoji="📥" label="View all leads" tab="leads" onClick={onTabChange} />
        <QuickAction emoji="🗺️" label="See heatmap" tab="map" onClick={onTabChange} />
        <QuickAction emoji="🎯" label="Funnel analytics" tab="funnels" onClick={onTabChange} />
        <QuickAction emoji="🤝" label="Partner network" tab="affiliates" onClick={onTabChange} />
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

function QuickAction({
  emoji,
  label,
  tab,
  onClick,
}: {
  emoji: string;
  label: string;
  tab: Tab;
  onClick: (tab: Tab) => void;
}) {
  return (
    <button
      type="button"
      className="rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-yellow-400/30 transition p-4 text-left"
      onClick={() => onClick(tab)}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
      <div className="mt-1 text-[11px] text-slate-500">Open →</div>
    </button>
  );
}

/* ───────────────────────── LEADS TAB ───────────────────────── */

function LeadsTab({
  statusOverrides,
  dismissed,
  setStatusOverride,
  bulkSetStatus,
  setDismissedFor,
}: LeadMarksProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all" | "dismissed">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sort, setSort] = useState<LeadSort>("score");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const marked = useMemo(
    () => applyMarks(MOCK_LEADS, statusOverrides, dismissed),
    [statusOverrides, dismissed],
  );

  const filtered = useMemo(() => {
    const base = marked.filter((l) => {
      // Status filter — "dismissed" is a special view that ONLY shows dismissed leads
      if (statusFilter === "dismissed") {
        if (!l._dismissed) return false;
      } else {
        if (l._dismissed) return false; // hide dismissed by default
        if (statusFilter !== "all" && l.status !== statusFilter) return false;
      }
      if (typeFilter !== "all" && l.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (l.business_name || "").toLowerCase().includes(q) ||
          l.contact_name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.county.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (TYPE_LABELS[l.type] ?? l.type).toLowerCase().includes(q)
        );
      }
      return true;
    });
    return sortLeads(base, sort);
  }, [marked, search, statusFilter, typeFilter, sort]);

  const visibleIds = useMemo(() => filtered.map((l) => l.id), [filtered]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        for (const id of visibleIds) next.delete(id);
        return next;
      }
      const next = new Set(prev);
      for (const id of visibleIds) next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkMark = (status: LeadStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    bulkSetStatus(ids, status);
    clearSelection();
  };
  const handleBulkDismiss = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    // If we're already on the "dismissed" filter, this restores them. Otherwise dismisses.
    setDismissedFor(ids, statusFilter !== "dismissed");
    clearSelection();
  };
  const handleSingleDismiss = (leadId: string) => {
    setDismissedFor([leadId], !dismissed.has(leadId));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Leads
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {filtered.length} of {MOCK_LEADS.length}
            {dismissed.size > 0 && statusFilter !== "dismissed" && (
              <span className="text-rose-400/70">
                {" · "}
                {dismissed.size} dismissed (hidden)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters + sort */}
      <div className="flex gap-2 flex-wrap items-center">
        <input
          type="search"
          placeholder="Search name, city, email, type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] h-10 px-4 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as LeadStatus | "all" | "dismissed")
          }
          className="h-10 px-3 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
        >
          <option value="all">All status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="follow_up">Follow-up</option>
          <option value="quote_sent">Quote sent</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="dismissed">Dismissed (restore)</option>
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
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      {/* Bulk-action toolbar — visible when ≥1 lead selected */}
      <BulkLeadToolbar
        selectedIds={selectedIds}
        onClear={clearSelection}
        onMark={handleBulkMark}
        onDismiss={handleBulkDismiss}
      />

      {/* Lead list */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="grid grid-cols-[28px_60px_1fr_120px_140px_110px] sm:grid-cols-[28px_60px_1.6fr_1fr_120px_140px_120px_110px] gap-3 px-4 py-2.5 border-b border-white/8 bg-white/[0.02] text-[11px] uppercase tracking-wider font-semibold text-slate-500 items-center">
          <LeadSelectCheckbox
            checked={allVisibleSelected}
            onChange={toggleSelectAll}
            ariaLabel="Select all visible leads"
          />
          <div>Score</div>
          <div>Name</div>
          <div className="hidden sm:block">Location</div>
          <div>Type</div>
          <div>Status</div>
          <div className="hidden sm:block text-right">Est.</div>
          <div className="text-right">Last</div>
        </div>
        <div className="max-h-[640px] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              No leads match these filters.
            </div>
          )}
          {filtered.map((l) => {
            const isSelected = selectedIds.has(l.id);
            return (
              <div
                key={l.id}
                className={`grid grid-cols-[28px_60px_1fr_120px_140px_110px] sm:grid-cols-[28px_60px_1.6fr_1fr_120px_140px_120px_110px] gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 transition items-center ${
                  isSelected
                    ? "bg-yellow-400/[0.04] border-l-2 border-l-yellow-400"
                    : l._dismissed
                      ? "opacity-50"
                      : "hover:bg-white/[0.03]"
                }`}
              >
                <LeadSelectCheckbox
                  checked={isSelected}
                  onChange={() => toggleSelect(l.id)}
                  ariaLabel={`Select ${l.business_name || l.contact_name}`}
                />
                <button
                  type="button"
                  onClick={() => setSelected(l)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm hover:brightness-125 transition"
                  style={{
                    background: `${scoreColor(l.lead_score)}15`,
                    color: scoreColor(l.lead_score),
                    border: `1px solid ${scoreColor(l.lead_score)}40`,
                  }}
                  title="Open lead detail"
                >
                  {l.lead_score}
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(l)}
                  className="min-w-0 text-left hover:text-yellow-200 transition"
                >
                  <div className="text-sm font-semibold text-white truncate">
                    {l.business_name || l.contact_name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {l.signals.powerwall_eligible && "⚡ "}
                    {l.signals.generator_eligible && "🔌 "}
                    {l.signals.repeat_customer && "🔁 "}
                    {l.signals.urgency === "high" && "🚨 "}
                    {l.signals.affiliate_source
                      ? `via ${l.signals.affiliate_source}`
                      : (TYPE_LABELS[l.type] ?? l.type.replace(/_/g, " "))}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(l)}
                  className="hidden sm:block text-xs text-slate-400 truncate text-left hover:text-white transition"
                >
                  {l.city}, {l.county}
                </button>
                <div className="text-xs text-slate-300 truncate">
                  {TYPE_LABELS[l.type] ?? l.type.replace(/_/g, " ")}
                </div>
                <div>
                  <StatusPillDropdown
                    status={l.status}
                    leadId={l.id}
                    onMark={setStatusOverride}
                    onDismiss={handleSingleDismiss}
                    isDismissed={l._dismissed}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(l)}
                  className="hidden sm:block text-sm font-semibold text-right tabular-nums hover:text-yellow-200 transition"
                >
                  {fmtMoney(l.job_estimate)}
                </button>
                <div className="text-[11px] text-slate-500 text-right">{fmtDate(l.last_touched_at)}</div>
              </div>
            );
          })}
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

/* ───────────────────────── MAP TAB — OLYMPIC PENINSULA (Leaflet) ─────
   Real Leaflet basemap centered on Sequim HQ (per Ben 2026-05-06 —
   "use the Tekky-style map when we show people how it works"). Same
   data set (PENINSULA_TOWNS — real lat/lng), same focused-town panel
   + town list as before, just rendered on a CartoDB dark tile layer
   instead of the hand-drawn SVG illustration. Service rings (10/25/
   50 mi) become real L.Circle layers with geographic accuracy. */

function PeninsulaZoomController({ bounds, recenter }: { bounds: L.LatLngBounds | null; recenter: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, { padding: [40, 40], duration: 0.8 });
    } else if (recenter) {
      // Default: Sequim at center, peninsula in frame
      map.flyTo([47.8, -123.4], 8, { duration: 0.8 });
    }
  }, [bounds, recenter, map]);
  return null;
}

function MapTab() {
  const [hoveredTown, setHoveredTown] = useState<string | null>(null);
  const [focusedTown, setFocusedTown] = useState<string | null>(null);
  const [zoomBounds, setZoomBounds] = useState<L.LatLngBounds | null>(null);

  // Category dot-layer toggles. Default: leads + customers + dealers
  // all ON so the map opens busy and Ben can toggle off categories
  // to highlight one segment during the sales walkthrough.
  const [showLeads, setShowLeads] = useState(true);
  const [showCustomers, setShowCustomers] = useState(true);
  const [showDealers, setShowDealers] = useState(true);

  const totalActive = useMemo(() => PENINSULA_TOWNS.reduce((s, t) => s + t.active_leads, 0), []);
  const totalClosed = useMemo(() => PENINSULA_TOWNS.reduce((s, t) => s + t.closed_jobs_ytd, 0), []);
  const hotTowns = useMemo(() => PENINSULA_TOWNS.filter((t) => t.score >= 70).length, []);

  // Place each lead/customer/affiliate at its resolved peninsula
  // town with stable per-record jitter. Computed once per mount —
  // datasets are deterministic + already sorted upstream.
  const placedLeads = useMemo(
    () =>
      MOCK_LEADS.flatMap((l) => {
        const town = CITY_TO_TOWN.get(l.city.toLowerCase());
        if (!town) return [];
        const [lat, lng] = jitterLL(town, l.id, 0.85);
        return [{ id: l.id, lat, lng, lead: l, town }];
      }),
    [],
  );

  const placedCustomers = useMemo(
    () =>
      MOCK_REPEAT_CUSTOMERS.flatMap((c) => {
        const cityRaw = (c.location.split(",")[0] || "").trim();
        const town = CITY_TO_TOWN.get(cityRaw.toLowerCase()) || findTownInString(c.location);
        if (!town) return [];
        const [lat, lng] = jitterLL(town, c.id, 0.6);
        return [{ id: c.id, lat, lng, customer: c, town }];
      }),
    [],
  );

  const placedDealers = useMemo(
    () =>
      MOCK_AFFILIATES.flatMap((a) => {
        // Affiliates have no city field — scan their company string
        // for any peninsula town. Off-peninsula partners (Bellevue
        // Tesla, etc.) get placed near Sequim HQ with a wide jitter
        // to represent "reaches into the territory".
        const town = findTownInString(a.company);
        const isOffPeninsula = !town;
        const anchor = town ?? PENINSULA_TOWNS[0];
        const [lat, lng] = jitterLL(anchor, a.id, isOffPeninsula ? 1.6 : 0.7);
        return [{ id: a.id, lat, lng, affiliate: a, town: anchor, offPeninsula: isOffPeninsula }];
      }),
    [],
  );

  // Click takes precedence over hover for the focused detail panel.
  const focused =
    PENINSULA_TOWNS.find((t) => t.name === focusedTown) ||
    PENINSULA_TOWNS.find((t) => t.name === hoveredTown) ||
    PENINSULA_TOWNS[0];

  const sequimHQ = useMemo(
    () => PENINSULA_TOWNS.find((t) => t.is_hq) ?? PENINSULA_TOWNS[0],
    [],
  );
  // Service-ring radii in meters (1 mile = 1609.344 m).
  const RING_10_MI = 10 * 1609.344;
  const RING_25_MI = 25 * 1609.344;
  const RING_50_MI = 50 * 1609.344;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          🗺️ Olympic Peninsula service map
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {PENINSULA_TOWNS.length} towns · Sequim HQ at center · service rings 10 / 25 / 50 mi
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active Leads" value={String(totalActive)} sub="Across the peninsula" tone="yellow" />
        <StatCard label="Closed (YTD)" value={String(totalClosed)} sub="Jobs delivered" tone="emerald" />
        <StatCard label="Hot Towns" value={String(hotTowns)} sub="Score ≥ 70" tone="orange" />
        <StatCard label="Service Radius" value="50 mi" sub="From Sequim HQ" tone="slate" />
      </div>

      {/* Layer toggles — show/hide leads, customers, dealers. Counts in
          parentheses reflect the placed dataset (records that resolved
          to a peninsula town). Towns + service rings always on. */}
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-500 mr-1">
          Map layers
        </span>
        <LayerPill
          on={showLeads}
          onClick={() => setShowLeads((v) => !v)}
          color="#60a5fa"
          label={`Leads · ${placedLeads.length}`}
        />
        <LayerPill
          on={showCustomers}
          onClick={() => setShowCustomers((v) => !v)}
          color={CUSTOMER_COLOR}
          label={`Customers · ${placedCustomers.length}`}
        />
        <LayerPill
          on={showDealers}
          onClick={() => setShowDealers((v) => !v)}
          color={AFFILIATE_COLOR}
          label={`Dealers · ${placedDealers.length}`}
        />
      </div>

      {/* THE MAP — Leaflet basemap (CartoDB dark) centered on Sequim
          HQ. Town markers driven by PENINSULA_TOWNS (real lat/lng).
          Service rings 10/25/50 mi rendered as L.Circle layers (real
          geographic radii in meters). */}
      <div
        className="relative rounded-2xl border border-white/8 bg-slate-950 overflow-hidden"
        style={{ height: 480 }}
      >
        <MapContainer
          center={[sequimHQ.lat, sequimHQ.lng]}
          zoom={9}
          minZoom={7}
          maxZoom={12}
          scrollWheelZoom
          className="h-full w-full"
          style={{ background: "#020617" }}
          worldCopyJump={false}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <PeninsulaZoomController bounds={zoomBounds} recenter={!focusedTown && !zoomBounds} />

          {/* Service rings — 50 / 25 / 10 mi from Sequim HQ */}
          <Circle
            center={[sequimHQ.lat, sequimHQ.lng]}
            radius={RING_50_MI}
            pathOptions={{
              color: "#facc15",
              weight: 0.8,
              fillColor: "#facc15",
              fillOpacity: 0.02,
              dashArray: "4,6",
            }}
          />
          <Circle
            center={[sequimHQ.lat, sequimHQ.lng]}
            radius={RING_25_MI}
            pathOptions={{
              color: "#facc15",
              weight: 1,
              fillColor: "#facc15",
              fillOpacity: 0.04,
              dashArray: "4,6",
            }}
          />
          <Circle
            center={[sequimHQ.lat, sequimHQ.lng]}
            radius={RING_10_MI}
            pathOptions={{
              color: "#facc15",
              weight: 1.2,
              fillColor: "#facc15",
              fillOpacity: 0.06,
              dashArray: "4,6",
            }}
          />

          {/* HQ pulse — outer halo + inner dot */}
          <CircleMarker
            center={[sequimHQ.lat, sequimHQ.lng]}
            radius={14}
            pathOptions={{
              color: "#facc15",
              weight: 0,
              fillColor: "#facc15",
              fillOpacity: 0.12,
            }}
          />
          <CircleMarker
            center={[sequimHQ.lat, sequimHQ.lng]}
            radius={9}
            pathOptions={{
              color: "#fde047",
              weight: 2,
              fillColor: "#facc15",
              fillOpacity: 0.85,
            }}
          >
            <LeafletTooltip direction="top" offset={[0, -8]} opacity={0.95} sticky>
              <div className="text-xs">
                <div className="font-bold text-amber-700">★ Sequim HQ</div>
                <div className="text-slate-700">{sequimHQ.notes}</div>
              </div>
            </LeafletTooltip>
          </CircleMarker>

          {/* Lead dots — colored by type, sized small (3px). Rendered
              BEFORE town markers so towns layer on top + remain clickable. */}
          {showLeads && placedLeads.map(({ id, lat, lng, lead }) => {
            const color = LEAD_TYPE_COLOR[lead.type] || "#94a3b8";
            return (
              <CircleMarker
                key={`lead-${id}`}
                center={[lat, lng]}
                radius={3}
                pathOptions={{
                  color,
                  weight: 0.5,
                  fillColor: color,
                  fillOpacity: 0.7,
                }}
              >
                <LeafletTooltip direction="top" offset={[0, -3]} opacity={0.95}>
                  <div className="text-xs">
                    <div className="font-bold" style={{ color }}>
                      {lead.business_name || lead.contact_name}
                    </div>
                    <div className="text-slate-700">
                      {LEAD_TYPE_LABEL[lead.type] || lead.type}
                      <span className="mx-1.5 text-slate-400">·</span>
                      <span>{lead.city}</span>
                      <span className="mx-1.5 text-slate-400">·</span>
                      <span className="font-bold">Score {lead.lead_score}</span>
                    </div>
                  </div>
                </LeafletTooltip>
              </CircleMarker>
            );
          })}

          {/* Customer dots — emerald, slightly larger (5px) with white
              border, ranks above leads but below towns. */}
          {showCustomers && placedCustomers.map(({ id, lat, lng, customer }) => (
            <CircleMarker
              key={`cust-${id}`}
              center={[lat, lng]}
              radius={5}
              pathOptions={{
                color: "#fff",
                weight: 1.2,
                fillColor: CUSTOMER_COLOR,
                fillOpacity: 0.9,
              }}
            >
              <LeafletTooltip direction="top" offset={[0, -5]} opacity={0.95}>
                <div className="text-xs">
                  <div className="font-bold" style={{ color: CUSTOMER_COLOR }}>
                    💼 {customer.business_name}
                  </div>
                  <div className="text-slate-700">
                    {customer.industry.replace("_", " ")}
                    <span className="mx-1.5 text-slate-400">·</span>
                    <span>{customer.location}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {customer.jobs_completed} jobs · {fmtMoney(customer.lifetime_value)} LTV
                  </div>
                </div>
              </LeafletTooltip>
            </CircleMarker>
          ))}

          {/* Dealer / affiliate dots — pink, square-ish via outlined ring,
              4px. Off-peninsula partners get a dashed outline so the
              eye reads them as "reaches in" rather than "based here". */}
          {showDealers && placedDealers.map(({ id, lat, lng, affiliate, offPeninsula }) => (
            <CircleMarker
              key={`aff-${id}`}
              center={[lat, lng]}
              radius={4}
              pathOptions={{
                color: AFFILIATE_COLOR,
                weight: offPeninsula ? 1 : 1.6,
                fillColor: AFFILIATE_COLOR,
                fillOpacity: offPeninsula ? 0.35 : 0.75,
                dashArray: offPeninsula ? "2,2" : undefined,
              }}
            >
              <LeafletTooltip direction="top" offset={[0, -4]} opacity={0.95}>
                <div className="text-xs">
                  <div className="font-bold" style={{ color: AFFILIATE_COLOR }}>
                    🤝 {affiliate.name}
                  </div>
                  <div className="text-slate-700">
                    {affiliate.company}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {affiliate.category.replace(/_/g, " ")}
                    <span className="mx-1.5 text-slate-400">·</span>
                    <span className="font-bold">{affiliate.referrals_lifetime}</span> referrals
                    {offPeninsula && (
                      <span className="ml-1.5 text-amber-700">· off-peninsula</span>
                    )}
                  </div>
                </div>
              </LeafletTooltip>
            </CircleMarker>
          ))}

          {/* Town markers — sized + colored by lead score */}
          {PENINSULA_TOWNS.filter((t) => !t.is_hq).map((town) => {
            const r = 4 + (town.score / 100) * 9; // 4-13 px radius
            const fill = scoreColor(town.score);
            const isHover = hoveredTown === town.name;
            const isFocus = focusedTown === town.name;
            return (
              <CircleMarker
                key={town.name}
                center={[town.lat, town.lng]}
                radius={isFocus || isHover ? r + 2 : r}
                pathOptions={{
                  color: isFocus || isHover ? "#fff" : fill,
                  weight: isFocus ? 2.5 : isHover ? 1.8 : 1,
                  fillColor: fill,
                  fillOpacity: isFocus ? 0.95 : isHover ? 0.85 : 0.7,
                }}
                eventHandlers={{
                  mouseover: () => setHoveredTown(town.name),
                  mouseout: () => setHoveredTown(null),
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    setFocusedTown((prev) => (prev === town.name ? null : town.name));
                    // Fly to a small bounds around the town
                    const lat = town.lat;
                    const lng = town.lng;
                    setZoomBounds(
                      L.latLngBounds(
                        [lat - 0.12, lng - 0.18],
                        [lat + 0.12, lng + 0.18],
                      ),
                    );
                  },
                }}
              >
                <LeafletTooltip direction="top" offset={[0, -6]} opacity={0.95} sticky>
                  <div className="text-xs">
                    <div className="font-bold" style={{ color: fill }}>
                      {town.name}
                    </div>
                    <div className="text-slate-700">
                      Score{" "}
                      <span className="font-bold tabular-nums">{town.score}</span>
                      <span className="mx-1.5 text-slate-400">·</span>
                      <span className="tabular-nums">{town.active_leads}</span>{" "}
                      active leads
                    </div>
                  </div>
                </LeafletTooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Heatmap legend — bottom-left overlay */}
        <div className="absolute bottom-3 left-3 px-3 py-2 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-white/10 pointer-events-none z-[400]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/75">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: scoreColor(95) }} />
              Hot · 80+
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: scoreColor(70) }} />
              Warm · 60-79
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: scoreColor(50) }} />
              Tepid · 40-59
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: scoreColor(20) }} />
              Cold · &lt;40
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 0 1px ${ACCENT}` }} />
              ★ HQ
            </span>
            <span className="w-px h-3 bg-white/15 mx-0.5" />
            {showLeads && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: "#60a5fa" }} />
                Lead
              </span>
            )}
            {showCustomers && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full ring-1 ring-white" style={{ background: CUSTOMER_COLOR }} />
                Customer
              </span>
            )}
            {showDealers && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: AFFILIATE_COLOR }} />
                Dealer
              </span>
            )}
          </div>
        </div>

        {/* Service-ring caption — top-left overlay */}
        <div className="absolute top-3 left-3 px-3 py-2 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-yellow-500/30 pointer-events-none z-[400]">
          <div className="text-[10px] uppercase tracking-widest text-yellow-400 font-bold">
            Sequim HQ · service rings
          </div>
          <div className="text-[11px] text-white/70">10 / 25 / 50 mi</div>
        </div>

      </div>

      {/* Legend + focused-town detail */}
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4">
        {/* Legend */}
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
          <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-slate-500 mb-3">
            Lead-density legend
          </div>
          <div className="space-y-2">
            <LegendRow color={scoreColor(95)} label="Hot (80-100)" desc="Multi-touch, fast follow-up" />
            <LegendRow color={scoreColor(70)} label="Warm (60-79)" desc="Standard outreach cadence" />
            <LegendRow color={scoreColor(50)} label="Tepid (40-59)" desc="Quarterly drip" />
            <LegendRow color={scoreColor(20)} label="Cold (< 40)" desc="Affiliate-source only" />
          </div>
          <div className="mt-4 pt-4 border-t border-white/8">
            <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-slate-500 mb-3">
              Categories
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full ring-1 ring-white shrink-0" style={{ background: CUSTOMER_COLOR }} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Repeat Customer ({placedCustomers.length})</div>
                  <div className="text-[11px] text-slate-500 truncate">Active commercial accounts · multi-job LTV</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full shrink-0" style={{ background: AFFILIATE_COLOR }} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">Dealer / Referral Partner ({placedDealers.length})</div>
                  <div className="text-[11px] text-slate-500 truncate">Solar, Tesla, HVAC, GC, real-estate sources</div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/8">
              <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-slate-500 mb-2">
                Lead types ({placedLeads.length})
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                {(["residential", "commercial", "property_mgmt", "general_contractor", "industrial"] as const).map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LEAD_TYPE_COLOR[t] }} />
                    <span className="text-slate-300">{LEAD_TYPE_LABEL[t]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/8 space-y-1.5 text-[11px] text-slate-500">
            <div>★ = Sequim HQ (Meyer Electric)</div>
            <div>Dashed circles = 10 / 25 / 50 mile service rings</div>
            <div>Dot size + color = lead density / category</div>
          </div>
        </div>
        {/* Focused town panel */}
        <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/[0.03] p-5">
          <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-yellow-400">
            Focused town {focused.is_hq && "· HQ"}
          </div>
          <h3 className="mt-1 text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {focused.name}
            <span className="ml-2 text-sm font-normal text-slate-500">
              {focused.county} County · {focused.zip}
            </span>
          </h3>
          {/* Focused-town stats — 3 actionable metrics (Coordinates
              tile dropped 2026-05-18 audit: lat/lng is decoration,
              not signal). */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            <StatCard label="Lead Score" value={String(focused.score)} sub="0-100" tone="yellow" />
            <StatCard label="Active Leads" value={String(focused.active_leads)} sub="In pipeline" tone="emerald" />
            <StatCard label="YTD Jobs" value={String(focused.closed_jobs_ytd)} sub="Closed" tone="orange" />
          </div>
          {focused.notes && (
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">{focused.notes}</p>
          )}
        </div>
      </div>

      {/* Town list — scrollable, ranked by score */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_120px_80px_80px] gap-3 px-4 py-2.5 border-b border-white/8 bg-white/[0.02] text-[11px] uppercase tracking-wider font-semibold text-slate-500">
          <div>Score</div>
          <div>Town</div>
          <div className="hidden sm:block">County</div>
          <div className="text-right">Active</div>
          <div className="text-right">YTD</div>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {[...PENINSULA_TOWNS].sort((a, b) => b.score - a.score).map((t) => (
            <div key={t.name} className="grid grid-cols-[60px_1fr_120px_80px_80px] gap-3 px-4 py-2.5 border-b border-white/5 last:border-b-0 items-center hover:bg-white/[0.02] transition" onMouseEnter={() => setHoveredTown(t.name)}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{ background: `${scoreColor(t.score)}15`, color: scoreColor(t.score), border: `1px solid ${scoreColor(t.score)}40` }}
              >
                {t.score}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {t.is_hq && "★ "}
                  {t.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{t.notes}</div>
              </div>
              <div className="hidden sm:block text-xs text-slate-400">{t.county}</div>
              <div className="text-sm font-semibold text-right tabular-nums">{t.active_leads}</div>
              <div className="text-sm text-emerald-400 text-right tabular-nums">{t.closed_jobs_ytd}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LegendRow({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-4 h-4 rounded-full shrink-0" style={{ background: color }} />
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-[11px] text-slate-500 truncate">{desc}</div>
      </div>
    </div>
  );
}

function LayerPill({
  on,
  onClick,
  color,
  label,
}: {
  on: boolean;
  onClick: () => void;
  color: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full border text-[12px] font-semibold transition flex items-center gap-1.5 ${
        on
          ? "bg-white/[0.06] text-white border-white/15"
          : "bg-transparent text-slate-500 border-white/8 line-through"
      }`}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          background: on ? color : "transparent",
          border: `1.5px solid ${color}`,
        }}
      />
      {label}
    </button>
  );
}

/* ───────────────────────── FUNNELS TAB ───────────────────────── */

/* ───────────────────────── FUNNELS TAB (Zenith-style) ─────────────────────
   Rebuilt 2026-05-06 per Ben — match the Zenith portal funnels grid
   pattern. All 4 funnels visible at once in a 2-col card grid; each
   card surfaces the touchpoint sequence inline (D0 / D2 / D5… per
   channel), Total/New/Active/Won counts, and a "View detail" expander
   that slides open in place. Mock data only. */

const CHANNEL_GLYPH: Record<string, string> = {
  email: "✉",
  sms: "💬",
  voicemail: "🎙",
  call: "📞",
  site_visit: "🏠",
};

const FUNNEL_THEMES: Record<
  string,
  { borderClass: string; bgClass: string; accent: string; emoji: string; pitch: string }
> = {
  "funnel-powerwall-homeowner": {
    borderClass: "border-amber-400/30",
    bgClass: "bg-amber-400/[0.04]",
    accent: "text-amber-300",
    emoji: "⚡",
    pitch: "High-bill homeowners curious about Tesla Powerwall ROI.",
  },
  "funnel-generator-storm": {
    borderClass: "border-orange-500/30",
    bgClass: "bg-orange-500/[0.05]",
    accent: "text-orange-300",
    emoji: "🔌",
    pitch: "Storm-trigger SMS to rural homes after a recent outage.",
  },
  "funnel-commercial-maintenance": {
    borderClass: "border-cyan-500/30",
    bgClass: "bg-cyan-500/[0.05]",
    accent: "text-cyan-300",
    emoji: "🏢",
    pitch: "Quarterly check-in for multi-property commercial accounts.",
  },
  "funnel-affiliate-partner": {
    borderClass: "border-violet-500/30",
    bgClass: "bg-violet-500/[0.05]",
    accent: "text-violet-300",
    emoji: "🤝",
    pitch: "30-day onboarding for new solar / GC / HVAC referrers.",
  },
};

function getFunnelTheme(id: string) {
  return (
    FUNNEL_THEMES[id] ?? {
      borderClass: "border-white/10",
      bgClass: "bg-white/[0.02]",
      accent: "text-yellow-300",
      emoji: "🎯",
      pitch: "Outreach sequence.",
    }
  );
}

function FunnelsTab() {
  const [openFunnelId, setOpenFunnelId] = useState<string | null>(null);
  const [openWithNote, setOpenWithNote] = useState(false);

  const totals = useMemo(() => {
    const totalLeads = FUNNELS.reduce((s, f) => s + f.total_leads, 0);
    const totalWon = FUNNELS.reduce((s, f) => s + f.total_won, 0);
    const totalRevenue = FUNNELS.reduce(
      (s, f) => s + f.total_won * f.avg_job_value,
      0,
    );
    const blended = totalLeads > 0 ? (totalWon / totalLeads) * 100 : 0;
    return { totalLeads, totalWon, totalRevenue, blended };
  }, []);

  const openFunnel = FUNNELS.find((x) => x.id === openFunnelId) ?? null;

  // Adapter: Meyer's mock-data Funnel shape -> FunnelDefLite the shared
  // FunnelVisualModal expects. Channel mapping below collapses Meyer's
  // wider channel set (which includes "call" + "site_visit") down to
  // the 4 standard channels we ship in production. The owner can
  // re-classify any step via the channel pills inside the modal.
  function mapChannel(c: string): FunnelStepLite["channel"] {
    if (c === "email" || c === "sms" || c === "voicemail" || c === "postcard") {
      return c;
    }
    if (c === "call") return "voicemail";        // ringless VM is the production equivalent
    if (c === "site_visit") return "voicemail";  // closest standard channel; label preserves intent
    return "email";
  }

  const openFunnelDef: FunnelDefLite | null = openFunnel
    ? {
        segment: openFunnel.id,
        audienceTag: openFunnel.audience.split(" · ")[0] || openFunnel.id,
        emoji: getFunnelTheme(openFunnel.id).emoji,
        title: openFunnel.name,
        pitch: getFunnelTheme(openFunnel.id).pitch,
        accentText: getFunnelTheme(openFunnel.id).accent,
        steps: openFunnel.steps.map((s) => ({
          day: s.day_offset,
          channel: mapChannel(s.channel),
          label: s.label,
          // Mock-data conversion_pct is already cumulative-monotonic
          // (Rule 74). Pass through so the modal renders measured bars
          // instead of the industry-typical baseline curve.
          cumulativeReachPct: s.conversion_pct,
        })),
      }
    : null;

  const openCounts = openFunnel
    ? {
        total: openFunnel.total_leads,
        newCount: Math.max(0, openFunnel.total_leads - openFunnel.total_won * 2),
        enrolledCount: Math.max(
          0,
          openFunnel.total_leads -
            Math.max(0, openFunnel.total_leads - openFunnel.total_won * 2) -
            openFunnel.total_won,
        ),
        wonCount: openFunnel.total_won,
      }
    : { total: 0, newCount: 0, enrolledCount: 0, wonCount: 0 };

  const openLandingUrl = openFunnel
    ? `/clients/meyer-electric#${openFunnel.id}`
    : "";

  return (
    <div className="space-y-6">
      {/* Hero summary card — parity with the Zenith portal "Audience funnels" header */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2
              className="text-2xl font-bold tracking-tight mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              🎯 Audience funnels
            </h2>
            <p className="text-sm text-slate-400 max-w-md">
              Each card is a live multi-channel sequence tuned to one customer
              segment. Click <span className="text-amber-300 font-bold">View funnel</span>{" "}
              to drill in, edit any step inline, or hit <span className="text-amber-300 font-bold">+</span>{" "}
              to send a quick note to BlueJays.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-right">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Leads
              </div>
              <div className="text-2xl font-black text-white tabular-nums">
                {totals.totalLeads.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Won
              </div>
              <div className="text-2xl font-black text-emerald-300 tabular-nums">
                {totals.totalWon}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Blended
              </div>
              <div className="text-2xl font-black text-amber-300 tabular-nums">
                {totals.blended.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-sm">
          <span className="text-slate-400">Closed revenue across all funnels</span>
          <span className="font-bold text-yellow-300 tabular-nums">
            {fmtMoney(totals.totalRevenue)}
          </span>
        </div>
      </div>

      {/* 2-column grid of funnel cards — matches the Zenith portal exactly. */}
      <div className="grid lg:grid-cols-2 gap-3">
        {FUNNELS.map((f) => {
          const t = getFunnelTheme(f.id);
          // Synthesize stage counts from the conversion percentages so the
          // cards have the same visual rhythm as Zenith's Total/New/Active/Won.
          const newCount = Math.max(0, f.total_leads - f.total_won * 2);
          const activeCount = Math.max(0, f.total_leads - newCount - f.total_won);
          const lpUrl = `/clients/meyer-electric#${f.id}`;
          return (
            <div
              key={f.id}
              className={`relative rounded-2xl border p-5 pl-6 overflow-hidden transition-shadow ${t.borderClass} ${t.bgClass}`}
            >
              {/* 4px accent stripe — matches the funnel modal's per-step
                  accent stripe so the card → modal transition feels
                  unified. */}
              <div
                aria-hidden
                className={`absolute left-0 top-0 bottom-0 w-1 ${t.accent}`}
                style={{ background: "currentColor", opacity: 0.55 }}
              />
              {/* + Note pill — top-right corner. Opens the modal with
                  note panel pre-expanded so Ben gets a free-form change
                  request without the owner having to scan all steps. */}
              <button
                type="button"
                onClick={() => {
                  setOpenWithNote(true);
                  setOpenFunnelId(f.id);
                }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full border border-white/15 bg-slate-900/70 hover:border-amber-400/60 hover:bg-amber-500/10 hover:text-amber-200 text-slate-400 text-base font-bold leading-none flex items-center justify-center transition-colors"
                title="Send a note to BlueJays about this funnel"
                aria-label="Send a note to BlueJays about this funnel"
              >
                +
              </button>

              {/* Card header */}
              <div className="flex items-start gap-3 mb-3 pr-10">
                <span className="text-2xl">{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">{f.name}</h3>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    {t.pitch}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${t.accent} whitespace-nowrap`}
                >
                  {f.audience.split(" · ")[0]}
                </span>
              </div>

              {/* Touchpoint sequence — D0 / D2 / D5 with channel glyphs */}
              <div className="mb-3">
                <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500 mb-1.5">
                  Touchpoint sequence
                </div>
                <ol
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(f.steps.length, 6)}, minmax(0, 1fr))`,
                  }}
                >
                  {f.steps.map((s, i) => {
                    const glyph = CHANNEL_GLYPH[s.channel] ?? "•";
                    return (
                      <li
                        key={s.step}
                        className="relative rounded-md bg-black/30 border border-white/[0.04] px-1.5 py-1.5"
                      >
                        {/* Stage number + day — matches the modal's
                            "1/2/3..." anchor for card → modal continuity. */}
                        <div className="flex items-center gap-1 mb-0.5">
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-black/60 border border-white/15 text-[9px] font-black tabular-nums ${t.accent}`}
                            aria-hidden
                          >
                            {i + 1}
                          </span>
                          <span
                            className={`text-[10px] font-black ${t.accent} tabular-nums`}
                          >
                            D{s.day_offset}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-500 mb-0.5 whitespace-nowrap">
                          {glyph} {s.channel === "site_visit" ? "visit" : s.channel}
                        </div>
                        <div
                          className="text-[10px] text-slate-300 leading-tight line-clamp-2"
                          title={s.label}
                        >
                          {s.label}
                        </div>
                        {i < f.steps.length - 1 && (
                          <span
                            aria-hidden
                            className={`absolute top-1/2 -right-[2.5px] -translate-y-1/2 ${t.accent} text-[10px]`}
                          >
                            ▶
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* 4-stat row */}
              <div className="grid grid-cols-4 gap-1.5 mb-3 text-center">
                <div className="rounded-md bg-black/30 px-1.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Total
                  </div>
                  <div className="text-sm font-black text-white tabular-nums">
                    {f.total_leads}
                  </div>
                </div>
                <div className="rounded-md bg-black/30 px-1.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    New
                  </div>
                  <div className="text-sm font-black text-blue-300 tabular-nums">
                    {newCount}
                  </div>
                </div>
                <div className="rounded-md bg-black/30 px-1.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Active
                  </div>
                  <div className="text-sm font-black text-amber-300 tabular-nums">
                    {activeCount}
                  </div>
                </div>
                <div className="rounded-md bg-black/30 px-1.5 py-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Won
                  </div>
                  <div className="text-sm font-black text-emerald-300 tabular-nums">
                    {f.total_won}
                  </div>
                </div>
              </div>

              {/* Action row — matches Zenith */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenWithNote(false);
                    setOpenFunnelId(f.id);
                  }}
                  className="flex-1 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-white/15 bg-slate-900/70 hover:border-amber-400/50 hover:bg-slate-800 text-amber-200 text-center transition-colors"
                >
                  View funnel
                </button>
                <a
                  href={lpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-center"
                >
                  View landing page ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-4 text-xs text-slate-500 italic">
        Edits made here go straight to BlueJays as a structured change
        request — Ben reviews, applies, and replies within one business day.
        Same flow as the Zenith owner portal.
      </div>

      <FunnelVisualModal
        isOpen={openFunnelId !== null}
        onClose={() => {
          setOpenFunnelId(null);
          setOpenWithNote(false);
        }}
        funnel={openFunnelDef}
        counts={openCounts}
        landingUrl={openLandingUrl}
        slug="meyer-electric"
        editable
        initialShowNote={openWithNote}
      />
    </div>
  );
}

/* ───────────────────────── CUSTOMERS TAB ─────────────────────────
   Save / star feature added 2026-05-06 — sessionStorage-backed so saves
   survive page reload within the demo session but reset on tab close.
   Small permissive override of Q8=A "pure mock, reload resets":
   within-session saves OK, across-session still resets clean. See
   MOCK_BACKEND_PLAYBOOK.md "Locked defaults" Q8 override note. */

const SAVED_KEY = "bj_demo_meyer_saved_customers";

function CustomersTab() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "saved" | "expiring">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(SAVED_KEY);
      if (raw) setSaved(new Set(JSON.parse(raw) as string[]));
    } catch { /* ignore corrupt sessionStorage */ }
  }, []);

  const toggleSaved = (id: string) => {
    const next = new Set(saved);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSaved(next);
    try {
      window.sessionStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
    } catch { /* quota / private mode — ignore */ }
  };

  const totalLTV = MOCK_REPEAT_CUSTOMERS.reduce((s, c) => s + c.lifetime_value, 0);
  const savedLTV = MOCK_REPEAT_CUSTOMERS.filter((c) => saved.has(c.id)).reduce((s, c) => s + c.lifetime_value, 0);

  const filtered = MOCK_REPEAT_CUSTOMERS.filter((c) => {
    if (filter === "saved" && !saved.has(c.id)) return false;
    if (filter === "expiring" && c.contract_status !== "expiring_soon") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.business_name.toLowerCase().includes(q) ||
        c.primary_contact.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            💼 Repeat customers
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {MOCK_REPEAT_CUSTOMERS.length} commercial accounts · {fmtMoney(totalLTV)} lifetime value
          </p>
        </div>
        {saved.size > 0 && (
          <div className="rounded-lg border border-yellow-400/30 bg-yellow-400/[0.06] px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-yellow-400">⭐ Saved</div>
            <div className="text-sm font-bold text-white">{saved.size} customers · {fmtMoney(savedLTV)} LTV</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="search"
          placeholder="Search business, contact, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] h-10 px-4 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none"
        />
        <div className="flex gap-1.5 rounded-lg p-1 bg-slate-900 border border-slate-700">
          <FilterChip on={filter === "all"} onClick={() => setFilter("all")} label={`All · ${MOCK_REPEAT_CUSTOMERS.length}`} />
          <FilterChip on={filter === "saved"} onClick={() => setFilter("saved")} label={`⭐ Saved · ${saved.size}`} />
          <FilterChip on={filter === "expiring"} onClick={() => setFilter("expiring")} label="Expiring" />
        </div>
      </div>

      {/* Customer cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c) => {
          const isSaved = saved.has(c.id);
          return (
            <div
              key={c.id}
              className="relative rounded-xl border bg-white/[0.02] p-4 hover:border-yellow-400/30 transition"
              style={{
                borderColor: isSaved ? "rgba(250, 204, 21, 0.3)" : "rgba(255, 255, 255, 0.08)",
                background: isSaved ? "rgba(250, 204, 21, 0.04)" : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => toggleSaved(c.id)}
                aria-label={isSaved ? "Remove from saved" : "Save customer"}
                title={isSaved ? "Saved — click to unsave" : "Save customer"}
                className={`absolute top-3 right-3 w-8 h-8 rounded-md flex items-center justify-center transition ${isSaved ? "bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30" : "bg-white/[0.04] text-slate-500 hover:bg-white/[0.08] hover:text-yellow-400"}`}
              >
                <span className="text-base leading-none">{isSaved ? "★" : "☆"}</span>
              </button>
              <div className="pr-9 mb-3">
                <h3 className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{c.business_name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 capitalize">{c.industry.replace("_", " ")} · {c.location}</p>
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
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-slate-500 truncate flex-1">{c.primary_contact}</p>
                <span
                  className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                  style={{
                    background: c.contract_status === "active" ? "rgba(34,197,94,0.15)" : c.contract_status === "expiring_soon" ? "rgba(250,204,21,0.15)" : "rgba(239,68,68,0.15)",
                    color: c.contract_status === "active" ? "rgb(74,222,128)" : c.contract_status === "expiring_soon" ? "rgb(250,204,21)" : "rgb(248,113,113)",
                  }}
                >
                  {c.contract_status.replace("_", " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-12 text-center">
          <p className="text-slate-400 text-sm">
            {filter === "saved" ? "No saved customers yet — click the ☆ star on any customer to save them." : "No customers match these filters."}
          </p>
        </div>
      )}

      {/* Save-state explainer */}
      <div className="rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3 text-[11px] text-slate-500">
        💡 Saved customers persist within this demo session (close the tab to reset). The real backend syncs across devices via your account.
      </div>
    </div>
  );
}

function FilterChip({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 px-3 rounded-md text-xs font-semibold transition ${on ? "bg-yellow-400 text-black" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}
    >
      {label}
    </button>
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

/* ───────────────────────── AI SKILLS TAB (Zenith-style polish) ──────────
   Rebuilt 2026-05-06 per Ben — match the polish bar of the Zenith
   portal AI tools view. Each skill card now shows:
     - Gradient ACCENT border on the active card
     - Per-skill mock usage stats (this-quarter use count + closes
       attributed) so prospects can read "this thing is moving the
       needle" in 2 seconds
     - Click anywhere on the card to toggle open/closed
   The 3 calculator panels themselves are unchanged.
*/

const SKILLS_META: Array<{
  id: "powerwall" | "generator" | "outage" | "operator";
  emoji: string;
  label: string;
  desc: string;
  used: number;
  closes: number;
  closeRate: number;
  color: string;
  isNew?: boolean;
}> = [
  {
    id: "operator",
    emoji: "🤖",
    label: "AI Operator",
    desc: "Type or voice-command: 'draft a follow-up to the Davis lead about the storm.' Plan-mode preview, send-or-save in your voice. The whole AI Skills shelf in one prompt.",
    used: 23,
    closes: 8,
    closeRate: 34.8,
    color: "#a78bfa",
    isNew: true,
  },
  {
    id: "powerwall",
    emoji: "⚡",
    label: "Powerwall ROI Calculator",
    desc: "Slider tool that shows 7-year payback timeline based on utility rate + monthly bill. Lands in 23% of cold emails.",
    used: 87,
    closes: 19,
    closeRate: 21.8,
    color: "#facc15",
  },
  {
    id: "generator",
    emoji: "🔌",
    label: "Generator Sizing Tool",
    desc: "Sq ft + appliances → recommended kW + matching Generac model. Becomes the kitchen-table close after every storm.",
    used: 142,
    closes: 38,
    closeRate: 26.8,
    color: "#f97316",
  },
  {
    id: "outage",
    emoji: "🌧",
    label: "Outage Recovery Simulator",
    desc: "Animated timeline: grid fails → Powerwall → Generac → home stays powered. Top closing tool for hybrid systems.",
    used: 64,
    closes: 11,
    closeRate: 17.2,
    color: "#60a5fa",
  },
];

function AISkillsTab() {
  const [active, setActive] = useState<
    "powerwall" | "generator" | "outage" | "operator" | null
  >(null);

  const totalUsed = SKILLS_META.reduce((s, x) => s + x.used, 0);
  const totalCloses = SKILLS_META.reduce((s, x) => s + x.closes, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2
              className="text-2xl font-bold tracking-tight mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              🧠 AI Skills
            </h2>
            <p className="text-sm text-slate-400 max-w-md">
              Customer-facing tools that qualify leads + close deals at the
              kitchen table. Click any card to open the live demo — same
              experience your prospects see on the lead-magnet pages.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-right">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Used this Q
              </div>
              <div className="text-2xl font-black text-amber-300 tabular-nums">
                {totalUsed}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Attributed closes
              </div>
              <div className="text-2xl font-black text-emerald-300 tabular-nums">
                {totalCloses}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SKILLS_META.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(isActive ? null : s.id)}
              className="text-left rounded-xl p-4 transition relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
              style={{
                border: `1px solid ${isActive ? `${s.color}80` : "rgba(255,255,255,0.08)"}`,
                background: isActive
                  ? `linear-gradient(135deg, ${s.color}14 0%, transparent 70%), rgba(255,255,255,0.02)`
                  : "rgba(255,255,255,0.02)",
                boxShadow: isActive ? `0 0 24px ${s.color}30` : "none",
              }}
            >
              {isActive && (
                <span
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${s.color} 50%, transparent 100%)`,
                  }}
                />
              )}
              {s.isNew && (
                <span
                  className="absolute top-2 right-2 text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded"
                  style={{
                    background: s.color,
                    color: "#0a0a0a",
                  }}
                >
                  NEW
                </span>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.emoji}</span>
                <span
                  className="text-[9px] uppercase tracking-widest font-bold"
                  style={{
                    color: isActive
                      ? s.color
                      : "rgba(148,163,184,0.6)",
                    marginRight: s.isNew ? 32 : 0,
                  }}
                >
                  {isActive ? "Open ▾" : "Open ▸"}
                </span>
              </div>
              <div className="text-sm font-bold text-white">{s.label}</div>
              <div className="mt-1 text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                {s.desc}
              </div>
              {/* Usage stats row */}
              <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-3 gap-1.5 text-center">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Used
                  </div>
                  <div className="text-sm font-black text-white tabular-nums">
                    {s.used}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Closes
                  </div>
                  <div className="text-sm font-black text-emerald-300 tabular-nums">
                    {s.closes}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Rate
                  </div>
                  <div
                    className="text-sm font-black tabular-nums"
                    style={{ color: s.color }}
                  >
                    {s.closeRate}%
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {active === "operator" && <AIOperatorPanel />}
      {active === "powerwall" && <PowerwallROI />}
      {active === "generator" && <GeneratorSizer />}
      {active === "outage" && <OutageSimulator />}
    </div>
  );
}

/* ───── AI Operator (mock) — Lead Reply Drafter demo
   Pure mock; no API calls. Demonstrates the locked AI Operator spec
   (Service Agreement § 2(q) + AI_PACKAGE_PLAYBOOK Phase 9) to
   prospects on sales calls. Voice button shown as "coming soon"
   per Q3D (text-input only for V1). */

function AIOperatorPanel() {
  const [step, setStep] = useState<"prompt" | "planning" | "plan" | "drafting" | "draft">(
    "prompt",
  );
  const [prompt, setPrompt] = useState(
    "Draft a follow-up to the Davis lead — mention the storm last week, link to scheduling, sign off as Kyle",
  );

  const goPlan = () => {
    setStep("planning");
    setTimeout(() => setStep("plan"), 1200);
  };
  const goDraft = () => {
    setStep("drafting");
    setTimeout(() => setStep("draft"), 1500);
  };
  const reset = () => setStep("prompt");

  return (
    <div className="rounded-2xl border-2 border-violet-400/40 bg-gradient-to-b from-violet-500/[0.06] to-transparent p-5 sm:p-6 relative overflow-hidden">
      {/* Pulsing top edge */}
      <span
        className="absolute top-0 left-0 right-0 h-0.5 animate-pulse"
        style={{
          background: "linear-gradient(90deg, transparent, #a78bfa, transparent)",
        }}
      />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-bold text-violet-200">
              AI Operator
            </h3>
            <span className="text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded bg-violet-400 text-violet-950">
              NEW
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Type a request. Operator drafts in your voice using your customer
            data. Approve before send.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 font-bold uppercase tracking-wider">
            ✓ Plan-mode ON
          </span>
          <button
            type="button"
            disabled
            className="px-2 py-1 rounded bg-slate-800 text-slate-500 font-semibold uppercase tracking-wider opacity-60 cursor-not-allowed"
            title="Voice input ships in V2"
          >
            🎙 Voice (V2)
          </button>
        </div>
      </div>

      {/* Step 1: prompt */}
      {step === "prompt" && (
        <>
          <label className="block text-[10px] uppercase tracking-widest text-violet-300/80 font-bold mb-1.5">
            What should the Operator do?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-slate-950 border border-violet-500/30 p-3 text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none resize-none"
            placeholder="e.g. Draft a follow-up to the Davis lead about the storm…"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goPlan}
              className="h-10 px-5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:brightness-110 text-white text-sm font-bold transition"
            >
              Plan first →
            </button>
            <span className="text-[11px] text-slate-500 self-center">
              · Plan-mode preview before any send
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-1.5 text-center">
            <SkillRecipe label="Lead reply" desc="(this demo)" />
            <SkillRecipe label="Quote drafter" />
            <SkillRecipe label="Weekly digest" />
          </div>
        </>
      )}

      {/* Step 2: planning loader */}
      {step === "planning" && (
        <div className="py-8 text-center">
          <div className="text-violet-300 text-sm font-bold animate-pulse">
            🧠 Reading Davis lead history + your last 6 outbound replies…
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Plan-mode · ~5 sec
          </div>
        </div>
      )}

      {/* Step 3: plan preview */}
      {step === "plan" && (
        <>
          <div className="rounded-lg border border-violet-500/30 bg-violet-500/[0.04] p-4 mb-3">
            <div className="text-[10px] uppercase tracking-widest text-violet-300 font-bold mb-2">
              Operator&apos;s plan
            </div>
            <ul className="space-y-1.5 text-sm text-slate-200">
              <li className="flex gap-2">
                <span className="text-violet-300">1.</span>
                <span>
                  Open with reference to the Nov 14 storm (matched in your
                  outbound voice — friendly, not salesy)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-300">2.</span>
                <span>
                  Lead with Powerwall + Generac fit signal (Davis was 75
                  score, score-90 after the outage)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-300">3.</span>
                <span>
                  Embed scheduling link (Cal.com /15min/kyle) — your default
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-300">4.</span>
                <span>
                  Sign off as Kyle, electrician tag, mobile signature
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-300">5.</span>
                <span>
                  Screenshot the email preview in Gmail-render before send
                  (per Operator Q7=A)
                </span>
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goDraft}
              className="h-10 px-5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:brightness-110 text-white text-sm font-bold transition"
            >
              Draft it →
            </button>
            <button
              type="button"
              onClick={reset}
              className="h-10 px-4 rounded-lg border border-slate-600 text-slate-300 hover:border-violet-400 text-sm font-semibold transition"
            >
              ← Edit prompt
            </button>
          </div>
        </>
      )}

      {/* Step 4: drafting loader */}
      {step === "drafting" && (
        <div className="py-8 text-center">
          <div className="text-violet-300 text-sm font-bold animate-pulse">
            ✍ Writing draft + screenshot self-verifying…
          </div>
          <div className="text-[11px] text-slate-500 mt-2">~7 sec</div>
        </div>
      )}

      {/* Step 5: draft preview */}
      {step === "draft" && (
        <>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.03] p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold">
                Draft · ready to send
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">
                ✓ Screenshot verified · Gmail-render OK
              </span>
            </div>
            <div className="text-xs space-y-2 text-slate-200 font-sans">
              <div className="text-slate-500">
                <strong className="text-slate-400">To:</strong> tom.davis@example.com
                <br />
                <strong className="text-slate-400">Subject:</strong> Hope you
                rode out the storm OK, Tom
              </div>
              <div className="border-t border-white/10 pt-2 leading-relaxed">
                <p className="mb-2">Hey Tom,</p>
                <p className="mb-2">
                  Saw the Nov 14 storm hit Sequim hard — figured I&apos;d circle
                  back. When we walked your panel last month you were on the
                  fence about a Powerwall + Generac combo, and three days
                  without grid would have answered a lot of those questions
                  for you.
                </p>
                <p className="mb-2">
                  No rush, but if you want to chat through what the install
                  would look like for your place, here&apos;s 15 min on my
                  calendar:{" "}
                  <span className="text-violet-300 underline">
                    cal.com/kyle/15min
                  </span>
                </p>
                <p className="mb-0">
                  Glad you and yours are good either way.
                </p>
                <p className="mt-3 mb-0">— Kyle</p>
                <p className="text-[10px] text-slate-500">
                  Meyer Electric · (360) 477-2202 · Sequim WA
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => alert("Mock — would send via SendGrid in prod.")}
              className="h-10 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-sm font-bold transition"
            >
              ✉ Send now
            </button>
            <button
              type="button"
              onClick={() => alert("Mock — would save to drafts folder.")}
              className="h-10 px-5 rounded-lg border border-slate-600 text-slate-200 hover:border-violet-400 text-sm font-semibold transition"
            >
              Save as draft
            </button>
            <button
              type="button"
              onClick={reset}
              className="h-10 px-5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-semibold transition"
            >
              ↻ New request
            </button>
          </div>
        </>
      )}

      {/* Footer hint — what else the Operator can do */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] text-[11px] text-slate-500">
        <span className="text-slate-400 font-semibold">5 skills standard:</span>{" "}
        Lead Reply · Quote Drafter · Weekly Digest · Customer Save · 1 of your
        choosing. Plus natural-language scheduled workflows ("every Monday 7am
        digest"). All bundled in your monthly support.
      </div>
    </div>
  );
}

function SkillRecipe({ label, desc }: { label: string; desc?: string }) {
  return (
    <div className="rounded-md bg-violet-500/[0.04] border border-violet-500/15 px-2 py-1.5">
      <div className="text-[10px] font-bold text-violet-200">{label}</div>
      {desc && (
        <div className="text-[9px] text-violet-400/70">{desc}</div>
      )}
    </div>
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

/* ───────────────────────── SETTINGS TAB (Zenith-style polish) ──────
   Rebuilt 2026-05-06 per Ben — same density / section grouping /
   toggle-switches / integration-status-pills bar that the Zenith
   portal uses. Pure demo (Q8=A): toggles persist in sessionStorage
   and the "Reset demo" button clears every override + status pill +
   saved customer + dismissed lead in one tap. */

type IntegrationStatus = "connected" | "warning" | "off";

const INTEGRATIONS: Array<{
  name: string;
  desc: string;
  status: IntegrationStatus;
  icon: string;
}> = [
  { name: "Stripe", desc: "Deposits + customer-portal billing", status: "connected", icon: "💳" },
  { name: "Twilio", desc: "SMS + missed-call auto-text · A2P approved", status: "connected", icon: "💬" },
  { name: "Google Ads", desc: "Search + Performance Max · auto-optim weekly", status: "connected", icon: "🔍" },
  { name: "Meta Business", desc: "Facebook + Instagram retargeting", status: "connected", icon: "📱" },
  { name: "GA4", desc: "Events firing · 30-day retention", status: "connected", icon: "📊" },
  { name: "Tesla Energy API", desc: "Powerwall ROI live rate lookups", status: "warning", icon: "⚡" },
  { name: "SendGrid", desc: "meyerelectric.com · DKIM + SPF + DMARC pass", status: "connected", icon: "✉" },
  { name: "Lob (postcards)", desc: "Optional · enable to add to funnel", status: "off", icon: "📮" },
];

const TOGGLE_KEYS = {
  missedCallText: "bj_demo_setting_missed_call_text",
  stormCampaign: "bj_demo_setting_storm_campaign",
  aiAutoReply: "bj_demo_setting_ai_auto_reply",
  emergencyLine: "bj_demo_setting_emergency_line",
  weeklyDigest: "bj_demo_setting_weekly_digest",
  partnerProgram: "bj_demo_setting_partner_program",
} as const;

function loadToggle(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.sessionStorage.getItem(key);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch {
    // ignore
  }
  return fallback;
}

function persistToggle(key: string, on: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, on ? "1" : "0");
  } catch {
    // ignore
  }
}

function statusPillFor(s: IntegrationStatus): { label: string; bg: string; text: string } {
  if (s === "connected") {
    return { label: "✓ Connected", bg: "rgba(16,185,129,0.12)", text: "rgb(74,222,128)" };
  }
  if (s === "warning") {
    return { label: "⚠ Needs attention", bg: "rgba(250,204,21,0.12)", text: "rgb(252,211,77)" };
  }
  return { label: "⊘ Off", bg: "rgba(148,163,184,0.10)", text: "rgb(148,163,184)" };
}

function SettingsTab() {
  // Per-toggle state — hydrated lazily so SSR stays clean.
  const [missedCallText, setMissedCallText] = useState(true);
  const [stormCampaign, setStormCampaign] = useState(true);
  const [aiAutoReply, setAiAutoReply] = useState(false);
  const [emergencyLine, setEmergencyLine] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [partnerProgram, setPartnerProgram] = useState(true);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  useEffect(() => {
    setMissedCallText(loadToggle(TOGGLE_KEYS.missedCallText, true));
    setStormCampaign(loadToggle(TOGGLE_KEYS.stormCampaign, true));
    setAiAutoReply(loadToggle(TOGGLE_KEYS.aiAutoReply, false));
    setEmergencyLine(loadToggle(TOGGLE_KEYS.emergencyLine, true));
    setWeeklyDigest(loadToggle(TOGGLE_KEYS.weeklyDigest, true));
    setPartnerProgram(loadToggle(TOGGLE_KEYS.partnerProgram, true));
  }, []);

  const onToggle =
    (key: string, setter: (v: boolean) => void) =>
    (next: boolean) => {
      setter(next);
      persistToggle(key, next);
    };

  const handleResetDemo = () => {
    if (typeof window === "undefined") return;
    // Clear every demo override key — leads, customers, dismissals,
    // toggle states. Keeps the unlock cookie so the user doesn't get
    // bumped back to the password screen.
    const keys = [
      "bj_demo_status_overrides",
      "bj_demo_dismissed",
      SAVED_KEY,
      ...Object.values(TOGGLE_KEYS),
    ];
    for (const k of keys) {
      try {
        window.sessionStorage.removeItem(k);
      } catch {
        // ignore
      }
    }
    setResetMsg("Demo state cleared. Reload to see fresh data.");
    setTimeout(() => setResetMsg(null), 3500);
    // Snap toggles back to defaults
    setMissedCallText(true);
    setStormCampaign(true);
    setAiAutoReply(false);
    setEmergencyLine(true);
    setWeeklyDigest(true);
    setPartnerProgram(true);
  };

  const handleSignOut = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem("bj_demo");
    window.location.reload();
  };

  const integrationsConnected = INTEGRATIONS.filter((i) => i.status === "connected").length;

  return (
    <div className="space-y-6">
      {/* Hero summary card — matches the Funnels + AI Skills hero pattern */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2
              className="text-2xl font-bold tracking-tight mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ⚙️ Settings
            </h2>
            <p className="text-sm text-slate-400 max-w-md">
              Toggle behaviors live. Connect or pause integrations. Demo
              changes save in your session and clear when you sign out.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-right">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Integrations
              </div>
              <div className="text-2xl font-black text-emerald-300 tabular-nums">
                {integrationsConnected}/{INTEGRATIONS.length}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Status
              </div>
              <div className="text-2xl font-black text-amber-300">Live</div>
            </div>
          </div>
        </div>
      </div>

      {/* Business / Hours / Service area — read-only info card */}
      <SettingsSection title="Business" emoji="🏢">
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoRow
            label="Legal name + license"
            value="Meyer Electric LLC · License MEYERE*862P1"
          />
          <InfoRow
            label="Address"
            value="35 Robbins Rd, Sequim WA 98382"
          />
          <InfoRow label="Phone" value="(360) 477-2202" />
          <InfoRow label="Sender domain" value="meyerelectric.com" />
          <InfoRow
            label="Hours"
            value="Mon-Fri 8 AM – 5 PM · Emergency line 24/7"
          />
          <InfoRow
            label="Service area"
            value="Clallam · Jefferson · Kitsap · Mason · Grays Harbor"
          />
        </div>
      </SettingsSection>

      {/* Channels — toggle switches for behavior controls */}
      <SettingsSection title="Channels" emoji="📡">
        <div className="grid sm:grid-cols-2 gap-3">
          <ToggleCard
            label="Missed-call auto-text"
            desc="Caller hangs up → sub-60s SMS with 'we'll call back + book here' link."
            stat="47 saved this month"
            on={missedCallText}
            onChange={onToggle(TOGGLE_KEYS.missedCallText, setMissedCallText)}
          />
          <ToggleCard
            label="Storm-trigger campaign"
            desc="When NWS flags an Olympic Peninsula outage, fires the Generator funnel within 2 hrs."
            stat="68 closes attributed YTD"
            on={stormCampaign}
            onChange={onToggle(TOGGLE_KEYS.stormCampaign, setStormCampaign)}
          />
          <ToggleCard
            label="AI auto-reply (inbound)"
            desc="Drafts replies to inbound emails + texts. OFF by default — drafts queue for review."
            stat="Drafts queue · review-only"
            on={aiAutoReply}
            onChange={onToggle(TOGGLE_KEYS.aiAutoReply, setAiAutoReply)}
            warning={!aiAutoReply}
            warningText="Keep OFF for first 30 days · review prompts before enabling"
          />
          <ToggleCard
            label="Emergency dispatch line"
            desc="After-hours line forwards to on-call electrician. Auto-records + auto-bills."
            stat="On-call: Kyle this week"
            on={emergencyLine}
            onChange={onToggle(TOGGLE_KEYS.emergencyLine, setEmergencyLine)}
          />
          <ToggleCard
            label="Weekly digest email"
            desc="Monday 7am inbox digest: pipeline value, this-week leads, action items."
            stat="Sent every Monday 7am PT"
            on={weeklyDigest}
            onChange={onToggle(TOGGLE_KEYS.weeklyDigest, setWeeklyDigest)}
          />
          <ToggleCard
            label="Partner / referral program"
            desc="Affiliate dashboard active for solar / GC / HVAC referrers. $250/closed-job commission."
            stat="22 active partners"
            on={partnerProgram}
            onChange={onToggle(TOGGLE_KEYS.partnerProgram, setPartnerProgram)}
          />
        </div>
      </SettingsSection>

      {/* Integrations — status pills */}
      <SettingsSection title="Integrations" emoji="🔌">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {INTEGRATIONS.map((i) => {
            const pill = statusPillFor(i.status);
            return (
              <div
                key={i.name}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex items-start gap-3"
              >
                <span className="text-xl shrink-0 leading-none">{i.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-sm font-bold text-white">{i.name}</span>
                    <span
                      className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                      style={{ background: pill.bg, color: pill.text }}
                    >
                      {pill.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug">
                    {i.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SettingsSection>

      {/* Demo controls — reset state + sign out */}
      <SettingsSection title="Demo controls" emoji="🧪">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.04] p-4">
            <div className="text-sm font-bold text-amber-200 mb-1">
              Reset demo state
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Clears every lead status override, dismissal, saved customer,
              and toggle. Keeps you signed in.
            </p>
            <button
              type="button"
              onClick={handleResetDemo}
              className="h-9 px-4 rounded-md text-xs font-semibold border border-amber-400/40 text-amber-200 hover:border-amber-400/80 hover:bg-amber-400/10 transition"
            >
              Reset
            </button>
            {resetMsg && (
              <p className="text-[11px] text-emerald-300 mt-2">{resetMsg}</p>
            )}
          </div>
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.04] p-4">
            <div className="text-sm font-bold text-rose-200 mb-1">Sign out</div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Returns to the password screen. Demo state is preserved until
              you reload.
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="h-9 px-4 rounded-md text-xs font-semibold border border-rose-500/40 text-rose-300 hover:border-rose-500/80 hover:bg-rose-500/10 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </SettingsSection>

      <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/[0.03] p-4 flex items-center gap-3">
        <span className="text-2xl">🧪</span>
        <div>
          <p className="text-xs font-semibold text-yellow-200">
            This is a mock backend
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            All data is simulated. The real backend has live Stripe charges,
            Twilio SMS deliveries, ad-spend pacing, and integration webhooks
            firing in real time.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{emoji}</span>
        <h3
          className="text-base font-bold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-widest text-yellow-400 font-bold">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-200">{value}</div>
    </div>
  );
}

function ToggleCard({
  label,
  desc,
  stat,
  on,
  onChange,
  warning,
  warningText,
}: {
  label: string;
  desc: string;
  stat?: string;
  on: boolean;
  onChange: (next: boolean) => void;
  warning?: boolean;
  warningText?: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        on
          ? "border-emerald-500/30 bg-emerald-500/[0.03]"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-white">{label}</div>
          <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
            {desc}
          </p>
        </div>
        {/* iOS-style toggle */}
        <button
          type="button"
          onClick={() => onChange(!on)}
          role="switch"
          aria-checked={on}
          aria-label={`Toggle ${label}`}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 ${
            on ? "bg-emerald-500" : "bg-slate-700"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              on ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {stat && (
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-2">
          {stat}
        </div>
      )}
      {warning && warningText && (
        <div className="text-[10px] text-amber-300 mt-2 leading-snug">
          ⚠ {warningText}
        </div>
      )}
    </div>
  );
}
