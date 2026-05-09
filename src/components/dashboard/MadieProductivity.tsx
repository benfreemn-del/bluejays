"use client";

import { useEffect, useState } from "react";

/**
 * MadieProductivity — the surface that answers "are we on pace for
 * 100 calls / 3 meetings today?"
 *
 * Per the dashboard review (2026-05-08), this was the #1 missing
 * surface in the system. Renders in two modes:
 *
 *   - mode="strip"   — compact horizontal bar for top of /dashboard/script
 *                     (Madie's primary surface — she sees pace as she dials)
 *   - mode="tile"    — vertical card for /dashboard Overview
 *                     (Ben's at-a-glance pulse on the day)
 *
 * Data: GET /api/madie/today — counts partner_calls rows by outcome,
 * computes pace vs. target + pace vs. expected (time-elapsed-into-
 * the-workday).
 *
 * Auto-refreshes every 60s so the numbers move while you're working.
 */

export type MadieStats = {
  callsToday: number;
  meetingsToday: number;
  engagedToday: number;
  callsWeek: number;
  meetingsWeek: number;
  callsTarget: number;
  meetingsTarget: number;
  paceToday: number;
  paceVsExpected: number | null;
  hoursIntoDay: number;
  workdayLength: number;
  outcomesToday: Record<string, number>;
  asOf: string;
};

type Mode = "strip" | "tile";

type Props = {
  mode: Mode;
  /** Optional override — if Ben wants to point this at a specific
   *  partner (when Madie role-auth ships). Defaults to the cross-
   *  partner aggregate that the API returns today. */
  partnerLabel?: string;
};

export default function MadieProductivity({
  mode,
  partnerLabel = "Today",
}: Props) {
  const [stats, setStats] = useState<MadieStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/madie/today", {
          credentials: "include",
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as MadieStats;
        if (!cancelled) {
          setStats(j);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[MadieProductivity] load failed:", err);
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading || !stats) {
    return mode === "strip" ? (
      <div className="text-[11px] text-slate-500 px-3 py-2">Loading…</div>
    ) : (
      <div className="rounded-xl border border-white/[0.06] bg-slate-900/40 p-4 text-[11px] text-slate-500">
        Loading productivity…
      </div>
    );
  }

  if (mode === "strip") {
    return <ProductivityStrip stats={stats} />;
  }
  return <ProductivityTile stats={stats} partnerLabel={partnerLabel} />;
}

/* ──────────────────────────────────────────────────────────────────── */
// Strip mode — horizontal compact bar for /dashboard/script
/* ──────────────────────────────────────────────────────────────────── */

function ProductivityStrip({ stats }: { stats: MadieStats }) {
  const callsTone = paceTone(stats.paceVsExpected);
  const meetingsTone =
    stats.meetingsToday >= stats.meetingsTarget
      ? "text-emerald-300"
      : stats.meetingsToday >= 1
        ? "text-amber-300"
        : "text-rose-300";

  return (
    <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-sm bg-slate-900/60 border border-white/[0.06] rounded-xl px-4 py-2.5">
      {/* Calls */}
      <div className="flex items-center gap-2">
        <span className="text-base">📞</span>
        <span className={`font-bold tabular-nums ${callsTone}`}>
          {stats.callsToday}
        </span>
        <span className="text-slate-500 text-xs">/ {stats.callsTarget}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          calls
        </span>
      </div>

      <span className="text-slate-700">·</span>

      {/* Meetings */}
      <div className="flex items-center gap-2">
        <span className="text-base">📅</span>
        <span className={`font-bold tabular-nums ${meetingsTone}`}>
          {stats.meetingsToday}
        </span>
        <span className="text-slate-500 text-xs">/ {stats.meetingsTarget}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          meetings
        </span>
      </div>

      <span className="text-slate-700">·</span>

      {/* Pace vs expected */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          Pace
        </span>
        {stats.paceVsExpected == null ? (
          <span className="text-slate-500 text-xs italic">—</span>
        ) : (
          <span className={`font-bold tabular-nums ${callsTone}`}>
            {stats.paceVsExpected}%
          </span>
        )}
      </div>

      {/* Week subtotal */}
      <span className="text-slate-700 hidden sm:inline">·</span>
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
        <span>Week:</span>
        <span className="font-bold text-slate-300 tabular-nums">
          {stats.callsWeek}
        </span>
        <span>·</span>
        <span className="font-bold text-slate-300 tabular-nums">
          {stats.meetingsWeek}
        </span>
        <span>m</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
// Tile mode — vertical card for /dashboard Overview
/* ──────────────────────────────────────────────────────────────────── */

function ProductivityTile({
  stats,
  partnerLabel,
}: {
  stats: MadieStats;
  partnerLabel: string;
}) {
  const callsBarPct = Math.min(100, stats.paceToday);
  const meetingsBarPct = Math.min(
    100,
    Math.round((stats.meetingsToday / stats.meetingsTarget) * 100),
  );
  const callsTone = paceTone(stats.paceVsExpected);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-violet-950/30 via-slate-900/60 to-slate-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-violet-300 mb-0.5">
            Sales velocity
          </p>
          <h3 className="text-base font-bold text-white">{partnerLabel}</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold rounded-full border px-2.5 py-0.5 border-violet-500/40 bg-violet-500/10 text-violet-200">
          live
        </span>
      </div>

      {/* Calls */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <span className="text-base">📞</span> Calls today
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black tabular-nums ${callsTone}`}>
              {stats.callsToday}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              / {stats.callsTarget}
            </span>
          </div>
        </div>
        <div className="relative h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500"
            style={{ width: `${callsBarPct}%` }}
          />
        </div>
        {stats.paceVsExpected != null && (
          <p className="text-[10px] text-slate-500 mt-1">
            Expected by now: <span className="font-bold text-slate-400 tabular-nums">
              {Math.round((stats.hoursIntoDay / stats.workdayLength) * stats.callsTarget)}
            </span>
            {" · "}
            Pace: <span className={`font-bold tabular-nums ${callsTone}`}>
              {stats.paceVsExpected}%
            </span>
          </p>
        )}
      </div>

      {/* Meetings */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <span className="text-base">📅</span> Meetings booked
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black tabular-nums ${
                stats.meetingsToday >= stats.meetingsTarget
                  ? "text-emerald-300"
                  : stats.meetingsToday >= 1
                    ? "text-amber-300"
                    : "text-slate-400"
              }`}
            >
              {stats.meetingsToday}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              / {stats.meetingsTarget}
            </span>
          </div>
        </div>
        <div className="relative h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-lime-500"
            style={{ width: `${meetingsBarPct}%` }}
          />
        </div>
      </div>

      {/* Week sub-stats */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
        <Substat label="Engaged" value={stats.engagedToday} accent="sky" />
        <Substat label="Week calls" value={stats.callsWeek} accent="violet" />
        <Substat label="Week meets" value={stats.meetingsWeek} accent="emerald" />
      </div>

      {/* Outcome breakdown — collapsed if no data today */}
      {Object.keys(stats.outcomesToday).length > 0 && (
        <details className="mt-4 group">
          <summary className="text-[10px] uppercase tracking-wider font-bold text-slate-500 cursor-pointer hover:text-white">
            Today&apos;s outcome breakdown ▾
          </summary>
          <div className="mt-2 space-y-1">
            {Object.entries(stats.outcomesToday)
              .sort((a, b) => b[1] - a[1])
              .map(([outcome, count]) => (
                <div
                  key={outcome}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span className="text-slate-400">{prettyOutcome(outcome)}</span>
                  <span className="font-bold text-white tabular-nums">{count}</span>
                </div>
              ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Substat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "sky" | "violet" | "emerald";
}) {
  const cls =
    accent === "sky"
      ? "text-sky-200"
      : accent === "violet"
        ? "text-violet-200"
        : "text-emerald-200";
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500">
        {label}
      </p>
      <p className={`text-lg font-black tabular-nums ${cls}`}>{value}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
// Helpers
/* ──────────────────────────────────────────────────────────────────── */

function paceTone(paceVsExpected: number | null): string {
  if (paceVsExpected == null) return "text-slate-300";
  if (paceVsExpected >= 100) return "text-emerald-300";
  if (paceVsExpected >= 75) return "text-amber-300";
  return "text-rose-300";
}

function prettyOutcome(slug: string): string {
  return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
