"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Calculator stats tile — surfaces /cut-my-agency funnel activity on
 * the dashboard Overview. Backed by /api/dashboard/calculator-stats,
 * which reads from the `calculator_runs` table created 2026-05-16
 * (Hormozi backend review item A1).
 *
 * Hormozi: the highest-intent $10K funnel was previously running in a
 * black hole. This tile makes the funnel measurable end-to-end — runs,
 * conversions, average savings estimate, top industries.
 */

type Stats = {
  ok: boolean;
  runsThisWeek: number;
  conversionsThisWeek: number;
  conversionRate: number;
  avgSavingsCents: number;
  topIndustries: Array<{ industry: string; count: number }>;
  configured?: boolean;
};

function fmtMoney(cents: number): string {
  if (!cents || cents <= 0) return "—";
  const dollars = Math.round(cents / 100);
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(dollars >= 10000 ? 0 : 1)}K`;
  return `$${dollars.toLocaleString()}`;
}

export default function CalculatorStatsCard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/calculator-stats", { cache: "no-store" });
      const j = (await res.json()) as Stats & { error?: string };
      if (!j.ok) {
        setError(j.error || "Failed to load");
        return;
      }
      setStats(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <h3 className="text-white font-bold text-sm">Cut-My-Agency Calculator</h3>
        </div>
        <a
          href="/cut-my-agency"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300/70 hover:text-amber-200 text-xs underline underline-offset-2"
        >
          Open ↗
        </a>
      </div>

      {loading && <p className="text-white/40 text-sm">Loading…</p>}

      {error && (
        <div className="text-rose-300 text-sm">
          <p>{error}</p>
          <button
            onClick={load}
            className="mt-2 text-xs text-rose-200 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && stats && stats.configured !== false && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <p className="text-amber-300 text-2xl font-bold tabular-nums">{stats.runsThisWeek}</p>
              <p className="text-white/50 text-[11px] uppercase tracking-wider mt-1">Runs / 7d</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <p className="text-emerald-300 text-2xl font-bold tabular-nums">{stats.conversionsThisWeek}</p>
              <p className="text-white/50 text-[11px] uppercase tracking-wider mt-1">
                Leads ({Math.round(stats.conversionRate * 100)}%)
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <p className="text-sky-300 text-2xl font-bold tabular-nums">{fmtMoney(stats.avgSavingsCents)}</p>
              <p className="text-white/50 text-[11px] uppercase tracking-wider mt-1">Avg savings est</p>
            </div>
          </div>

          {stats.topIndustries.length > 0 && (
            <div className="border-t border-white/[0.06] pt-3">
              <p className="text-white/40 text-[11px] uppercase tracking-wider mb-2">Top industries</p>
              <div className="flex flex-wrap gap-2">
                {stats.topIndustries.map((i) => (
                  <span
                    key={i.industry}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70 text-xs"
                  >
                    <span className="capitalize">{i.industry.replace(/_/g, " ")}</span>
                    <span className="text-white/40">·</span>
                    <span className="tabular-nums">{i.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats.runsThisWeek === 0 && (
            <p className="text-white/40 text-xs italic mt-2">
              No calculator runs in the last 7 days. Drive traffic to /cut-my-agency.
            </p>
          )}
        </>
      )}

      {!loading && !error && stats && stats.configured === false && (
        <p className="text-white/40 text-sm italic">Supabase not configured — telemetry disabled.</p>
      )}
    </div>
  );
}
