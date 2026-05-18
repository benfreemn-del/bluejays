"use client";

/**
 * MOCK BACKEND — Peninsula Paving demo
 * ──────────────────────────────────────
 * Password-gated (1212) demo of what a Peninsula Paving AI System
 * backend would look like. Pure mock data, zero real APIs. Built for
 * live demos to wow the prospect on the sales call.
 *
 * Pattern carried over from meyer-electric/portal-demo. Differences:
 *   - Lean version (4 tabs instead of 8) — no Leaflet dependency to
 *     keep this demo fast + reliable on phone screens
 *   - Copper accents (#ea580c) instead of Meyer yellow
 *   - Paving-specific mock data + AI skills
 */

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  MOCK_LEADS,
  AI_SKILLS,
  KPIS,
  STATUS_ORDER,
  STATUS_LABEL,
  STATUS_COLOR,
  type Lead,
  type LeadStatus,
} from "./mock-data";

const ACCENT = "#ea580c";
const ACCENT_HOT = "#fb923c";
const ACCENT_DEEP = "#c2410c";
const ACCENT_DIM = "rgba(234, 88, 12, 0.18)";
const BG = "#0a0a0a";
const BG_PANEL = "#161412";
const PASSWORD = "1212";

type Tab = "overview" | "leads" | "ai-skills" | "settings";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "overview", label: "Overview", emoji: "🏠" },
  { id: "leads", label: "Leads", emoji: "📥" },
  { id: "ai-skills", label: "AI Skills", emoji: "🧠" },
  { id: "settings", label: "Settings", emoji: "⚙️" },
];

export default function PeninsulaPortalDemo() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");

  // Re-hydrate unlock state from sessionStorage so a refresh doesn't
  // boot Ben out of the demo mid-pitch.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("pp_demo_unlocked") === "1") {
      setUnlocked(true);
    }
  }, []);

  function tryUnlock() {
    if (pwInput.trim() === PASSWORD) {
      setUnlocked(true);
      setPwError("");
      try {
        window.sessionStorage.setItem("pp_demo_unlocked", "1");
      } catch {}
    } else {
      setPwError("Incorrect password. Hint: today's date in digit pairs (MM/DD/YY won't work — try a four-digit code).");
    }
  }

  function logout() {
    setUnlocked(false);
    setPwInput("");
    try {
      window.sessionStorage.removeItem("pp_demo_unlocked");
    } catch {}
  }

  const filteredLeads = useMemo(() => {
    if (filterStatus === "all") return MOCK_LEADS;
    return MOCK_LEADS.filter((l) => l.status === filterStatus);
  }, [filterStatus]);

  const statusCounts = useMemo(() => {
    const counts: Record<LeadStatus, number> = {
      new: 0,
      contacted: 0,
      estimating: 0,
      scheduled: 0,
      won: 0,
      lost: 0,
      ghosted: 0,
    };
    MOCK_LEADS.forEach((l) => {
      counts[l.status] += 1;
    });
    return counts;
  }, []);

  /* ─────────────────────── PASSWORD GATE ─────────────────────── */
  if (!unlocked) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-5"
        style={{
          background: BG,
          fontFamily: "'Inter', sans-serif",
          color: "#f8fafc",
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl border p-8 sm:p-10"
          style={{
            background: BG_PANEL,
            borderColor: "rgba(255, 255, 255, 0.08)",
            boxShadow: "0 24px 70px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div
            className="text-[11px] font-bold uppercase tracking-[0.22em] mb-4"
            style={{ color: ACCENT, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Peninsula Paving · Owner Portal
          </div>
          <h1
            className="text-[32px] sm:text-[38px] font-bold leading-tight tracking-tight text-white mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Locked Demo.
          </h1>
          <p
            className="text-[14px] leading-relaxed mb-7"
            style={{ color: "rgba(255, 255, 255, 0.75)" }}
          >
            This is a live tour of what the BlueJays AI System backend would
            look like for your business. Enter the demo password to walk
            through it.
          </p>

          <label className="block mb-5">
            <span
              className="block text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
              style={{ color: ACCENT, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Demo Password
            </span>
            <input
              type="password"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") tryUnlock();
              }}
              autoFocus
              placeholder="4 digits"
              className="w-full bg-transparent border-b outline-none py-3 text-[18px] tracking-[0.3em] text-center text-white focus:border-white"
              style={{ borderColor: "rgba(234, 88, 12, 0.4)" }}
            />
          </label>

          {pwError && (
            <div
              className="text-[12px] mb-5 px-3 py-2 rounded"
              style={{
                color: "#fca5a5",
                background: "rgba(127, 29, 29, 0.25)",
                border: "1px solid rgba(248, 113, 113, 0.3)",
              }}
            >
              {pwError}
            </div>
          )}

          <button
            type="button"
            onClick={tryUnlock}
            className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-md font-bold uppercase tracking-wide text-[13px] text-black transition-all hover:brightness-110 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${ACCENT_HOT} 0%, ${ACCENT} 50%, ${ACCENT_DEEP} 100%)`,
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow: "0 4px 14px rgba(234, 88, 12, 0.4)",
            }}
          >
            Unlock Demo
          </button>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              href="/clients/peninsula-paving"
              className="text-[12px] hover:text-white transition-colors"
              style={{ color: "rgba(255, 255, 255, 0.55)" }}
            >
              ← Back to peninsulapaving.com
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ─────────────────────── DASHBOARD ─────────────────────── */
  return (
    <main
      className="min-h-screen"
      style={{
        background: BG,
        fontFamily: "'Inter', sans-serif",
        color: "#f8fafc",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          background: "rgba(10, 10, 10, 0.92)",
          borderColor: "rgba(255, 255, 255, 0.06)",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-md"
              style={{ background: ACCENT_DIM, color: ACCENT }}
            >
              🛣️
            </div>
            <div className="leading-tight">
              <div
                className="text-[14px] font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Peninsula Paving · Owner Portal
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.18em]"
                style={{
                  color: "rgba(255, 255, 255, 0.55)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                BlueJays AI System · Live Demo
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-[12px] font-semibold uppercase tracking-wide text-white/60 hover:text-white transition-colors"
          >
            Log out
          </button>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-7xl px-5 sm:px-8 flex items-center gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative shrink-0 px-4 h-12 text-[13px] font-semibold transition-colors ${
                tab === t.id
                  ? "text-white"
                  : "text-white/55 hover:text-white/80"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="mr-2">{t.emoji}</span>
              {t.label}
              {tab === t.id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: ACCENT }}
                />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-8 sm:py-10">
        {/* ─────────── OVERVIEW ─────────── */}
        {tab === "overview" && (
          <div>
            <div className="mb-8">
              <h2
                className="text-[28px] sm:text-[34px] font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Last 30 Days
              </h2>
              <p
                className="mt-2 text-[14px]"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                Everything the AI System pulled in, recovered, replied to, or
                won for Peninsula Paving this month.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard
                label="New Leads"
                value={KPIS.newLeadsLast30}
                delta="+8 vs last 30d"
                accent
              />
              <KpiCard
                label="Pipeline Value"
                value={`$${(KPIS.estValueLast30 / 1000).toFixed(0)}k`}
                delta={`${KPIS.conversionPct}% conv. rate`}
              />
              <KpiCard
                label="Missed Calls Recovered"
                value={KPIS.callsRecoveredLast30}
                delta="Auto-SMS within 8 sec"
              />
              <KpiCard
                label="New 5-Star Reviews"
                value={KPIS.reviewsLast30}
                delta="Funnel filtered 2 <5-star"
              />
            </div>

            {/* Pipeline by status */}
            <div
              className="rounded-xl border p-6 sm:p-7 mb-8"
              style={{
                background: BG_PANEL,
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3
                  className="text-[18px] font-bold text-white tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Pipeline
                </h3>
                <button
                  type="button"
                  onClick={() => setTab("leads")}
                  className="text-[12px] font-semibold uppercase tracking-wide hover:brightness-110 transition-colors"
                  style={{ color: ACCENT }}
                >
                  See all leads →
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                {STATUS_ORDER.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      setFilterStatus(s);
                      setTab("leads");
                    }}
                    className="rounded-md border px-3 py-3 text-left transition-colors hover:bg-white/[0.04]"
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.08)",
                      background: "rgba(255, 255, 255, 0.02)",
                    }}
                  >
                    <div
                      className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5"
                      style={{
                        color: STATUS_COLOR[s],
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {STATUS_LABEL[s]}
                    </div>
                    <div
                      className="text-[24px] font-bold text-white tracking-tight"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {statusCounts[s]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div
              className="rounded-xl border p-6 sm:p-7"
              style={{
                background: BG_PANEL,
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              <h3
                className="text-[18px] font-bold text-white tracking-tight mb-5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Recent Activity
              </h3>
              <ul className="space-y-3">
                {MOCK_LEADS.slice(0, 6).map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0"
                    style={{ borderColor: "rgba(255, 255, 255, 0.04)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="shrink-0 w-2 h-2 rounded-full"
                        style={{ background: STATUS_COLOR[l.status] }}
                      />
                      <div className="min-w-0">
                        <div
                          className="text-[14px] font-semibold text-white truncate"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {l.name}
                        </div>
                        <div
                          className="text-[12px] truncate"
                          style={{
                            color: "rgba(255, 255, 255, 0.55)",
                          }}
                        >
                          {l.service} · {l.city} · {l.source}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className="text-[14px] font-bold text-white"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        ${l.estValue.toLocaleString()}
                      </div>
                      <div
                        className="text-[10px] uppercase tracking-[0.16em]"
                        style={{
                          color: STATUS_COLOR[l.status],
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {STATUS_LABEL[l.status]}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ─────────── LEADS ─────────── */}
        {tab === "leads" && (
          <div>
            <div className="mb-6">
              <h2
                className="text-[28px] sm:text-[34px] font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Leads
              </h2>
              <p
                className="mt-2 text-[14px]"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                Every inbound — Google, Facebook, word of mouth, missed
                calls, contact form. Auto-scored by AI by likelihood to
                close.
              </p>
            </div>

            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <FilterChip
                label="All"
                count={MOCK_LEADS.length}
                active={filterStatus === "all"}
                onClick={() => setFilterStatus("all")}
              />
              {STATUS_ORDER.map((s) => (
                <FilterChip
                  key={s}
                  label={STATUS_LABEL[s]}
                  count={statusCounts[s]}
                  color={STATUS_COLOR[s]}
                  active={filterStatus === s}
                  onClick={() => setFilterStatus(s)}
                />
              ))}
            </div>

            <div className="space-y-3">
              {filteredLeads.map((l) => (
                <LeadRow key={l.id} lead={l} />
              ))}
              {filteredLeads.length === 0 && (
                <div
                  className="rounded-xl border p-8 text-center"
                  style={{
                    background: BG_PANEL,
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    color: "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  No leads in this status.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────── AI SKILLS ─────────── */}
        {tab === "ai-skills" && (
          <div>
            <div className="mb-6">
              <h2
                className="text-[28px] sm:text-[34px] font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                AI Skills
              </h2>
              <p
                className="mt-2 text-[14px]"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                The automation layer that runs in the background. Each
                skill is a small program that watches for one thing and
                acts on it — so leads don&apos;t fall through.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {AI_SKILLS.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border p-6"
                  style={{
                    background: BG_PANEL,
                    borderColor: s.on
                      ? "rgba(234, 88, 12, 0.25)"
                      : "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="text-[17px] font-bold text-white tracking-tight"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {s.name}
                    </h3>
                    {s.on ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: ACCENT,
                          background: ACCENT_DIM,
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: ACCENT }}
                        />
                        Active
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: "rgba(255, 255, 255, 0.5)",
                          background: "rgba(255, 255, 255, 0.05)",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        🔒 Pro Tier
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[14px] leading-relaxed mb-3"
                    style={{ color: "rgba(255, 255, 255, 0.75)" }}
                  >
                    {s.body}
                  </p>
                  {s.on && s.monthRecovered > 0 && (
                    <div
                      className="text-[12px] font-semibold uppercase tracking-wide"
                      style={{
                        color: ACCENT_HOT,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {s.monthRecovered} recovered last 30 days
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────── SETTINGS ─────────── */}
        {tab === "settings" && (
          <div>
            <div className="mb-6">
              <h2
                className="text-[28px] sm:text-[34px] font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Settings
              </h2>
              <p
                className="mt-2 text-[14px]"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                What the system knows about Peninsula Paving and how it
                replies on your behalf.
              </p>
            </div>

            <div className="space-y-4">
              <SettingsRow
                label="Business Phone"
                value="(360) 477-7015"
              />
              <SettingsRow label="Service Area" value="Olympic Peninsula" />
              <SettingsRow
                label="Service Hours"
                value="Mon–Fri 7am–5pm"
              />
              <SettingsRow
                label="Voice / Tone"
                value="Plain, honest, no jargon. Family-owned warmth."
              />
              <SettingsRow
                label="Average Job Size"
                value="$1,400 (repair) — $48,000 (HOA road)"
              />
              <SettingsRow
                label="Lead Routing"
                value="All inbound → AI first response (90 sec) → owner approval → send"
              />
              <SettingsRow
                label="Review Funnel"
                value="5-star → Google. <5-star → private inbox only."
              />
              <SettingsRow
                label="Missed-Call SMS"
                value="Auto-text within 8 seconds with booking link"
              />
            </div>

            <div
              className="mt-8 rounded-xl border p-6"
              style={{
                background: BG_PANEL,
                borderColor: "rgba(234, 88, 12, 0.25)",
              }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-[0.22em] mb-2"
                style={{
                  color: ACCENT,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Heads up
              </div>
              <p
                className="text-[14px] leading-relaxed"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                This is a tour, not your live system yet. Once you say yes,
                we wire it to YOUR phone number, YOUR Google account, YOUR
                actual lead inbox — and turn it loose. Onboarding takes
                about 30 days. After that, it runs in the background while
                you pave.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ─────────────────────── REUSABLE ─────────────────────── */

function KpiCard({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: string | number;
  delta?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{
        background: BG_PANEL,
        borderColor: accent ? "rgba(234, 88, 12, 0.25)" : "rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
        style={{
          color: accent ? ACCENT : "rgba(255, 255, 255, 0.55)",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {label}
      </div>
      <div
        className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight leading-none mb-1.5"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {value}
      </div>
      {delta && (
        <div
          className="text-[11px]"
          style={{ color: "rgba(255, 255, 255, 0.55)" }}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 h-9 rounded-md border text-[12px] font-bold uppercase tracking-wider transition-colors ${
        active ? "text-white" : "text-white/65 hover:text-white"
      }`}
      style={{
        background: active ? ACCENT_DIM : "rgba(255, 255, 255, 0.02)",
        borderColor: active ? ACCENT : "rgba(255, 255, 255, 0.08)",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {color && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color }}
        />
      )}
      {label}
      <span
        className="opacity-60"
        style={{ color: active ? ACCENT_HOT : undefined }}
      >
        {count}
      </span>
    </button>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl border transition-colors hover:bg-white/[0.02]"
      style={{
        background: BG_PANEL,
        borderColor: open ? ACCENT_DIM : "rgba(255, 255, 255, 0.08)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-5 sm:px-6 py-4 text-left grid grid-cols-[1fr_auto] gap-4 items-center"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span
              className="shrink-0 w-2 h-2 rounded-full"
              style={{ background: STATUS_COLOR[lead.status] }}
            />
            <span
              className="text-[15px] font-bold text-white truncate"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {lead.name}
            </span>
            <span
              className="hidden sm:inline text-[10px] uppercase tracking-[0.16em] font-bold"
              style={{
                color: STATUS_COLOR[lead.status],
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {STATUS_LABEL[lead.status]}
            </span>
          </div>
          <div
            className="text-[13px] truncate"
            style={{ color: "rgba(255, 255, 255, 0.6)" }}
          >
            {lead.service} · {lead.city} · {lead.source} ·{" "}
            {lead.daysAgo === 0 ? "today" : `${lead.daysAgo}d ago`}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="text-[16px] font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ${lead.estValue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 justify-end">
            <span
              className="text-[10px] uppercase tracking-[0.16em] font-bold"
              style={{ color: ACCENT, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Score
            </span>
            <span
              className="text-[12px] font-bold"
              style={{
                color: lead.score >= 85 ? ACCENT : "rgba(255, 255, 255, 0.7)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {lead.score}
            </span>
          </div>
        </div>
      </button>

      {open && (
        <div
          className="px-5 sm:px-6 pb-5 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-4"
          style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
        >
          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1"
              style={{ color: ACCENT, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Contact
            </div>
            <a
              href={`tel:${lead.phone.replace(/\D/g, "")}`}
              className="block text-[14px] text-white hover:text-orange-400 transition-colors"
            >
              {lead.phone}
            </a>
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="block text-[13px] mt-0.5 hover:text-white transition-colors"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                {lead.email}
              </a>
            )}
          </div>
          {lead.notes && (
            <div>
              <div
                className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1"
                style={{ color: ACCENT, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                AI Note
              </div>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "rgba(255, 255, 255, 0.75)" }}
              >
                {lead.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl border px-5 py-4 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-center"
      style={{
        background: BG_PANEL,
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        className="text-[11px] font-bold uppercase tracking-[0.18em]"
        style={{ color: ACCENT, fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {label}
      </div>
      <div
        className="text-[14px] text-white"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {value}
      </div>
    </div>
  );
}
