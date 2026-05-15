"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * AI Activity widget — Hormozi backend review B2 (2026-05-16).
 *
 * Proves "the AI gets smarter weekly" promise with real numbers. Pulls
 * 7-day totals from /api/dashboard/ai-activity (system_costs + client
 * _lead_messages) and renders a screen-shareable card: total calls,
 * total cost, replies drafted, postcards mailed, top actions, and a
 * tiny 7-day sparkline.
 */

type Totals = { calls: number; costUsd: number; replies: number; postcards: number };
type TopAction = { action: string; count: number };
type SparkPoint = { day: string; costUsd: number; calls: number };
type Response = {
  ok: boolean;
  totals: Totals;
  topActions: TopAction[];
  dailySpark: SparkPoint[];
  configured?: boolean;
  error?: string;
};

function fmtUsd(n: number): string {
  if (!n) return "$0";
  if (n < 1) return `$${n.toFixed(2)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${Math.round(n).toLocaleString()}`;
}

function humanizeAction(a: string): string {
  return a
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AIActivityCard() {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/ai-activity", { cache: "no-store" });
      const j = (await res.json()) as Response;
      if (!j.ok) {
        setError(j.error || "Failed to load");
        return;
      }
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const maxSparkCost =
    data?.dailySpark.reduce((max, d) => Math.max(max, d.costUsd), 0) ?? 0;

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <h3 className="text-white font-bold text-sm">AI activity</h3>
          <span className="text-violet-300/60 text-xs">· last 7 days</span>
        </div>
      </div>

      {loading && <p className="text-white/40 text-sm">Loading…</p>}
      {error && <p className="text-rose-300 text-sm">{error}</p>}

      {!loading && !error && data && data.configured === false && (
        <p className="text-white/40 text-sm italic">Supabase not configured.</p>
      )}

      {!loading && !error && data && data.configured !== false && (
        <>
          {/* 4-stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <p className="text-violet-300 text-2xl font-bold tabular-nums">
                {data.totals.calls.toLocaleString()}
              </p>
              <p className="text-white/50 text-[11px] uppercase tracking-wider mt-1">AI calls</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <p className="text-emerald-300 text-2xl font-bold tabular-nums">
                {data.totals.replies.toLocaleString()}
              </p>
              <p className="text-white/50 text-[11px] uppercase tracking-wider mt-1">Replies drafted</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <p className="text-amber-300 text-2xl font-bold tabular-nums">
                {data.totals.postcards.toLocaleString()}
              </p>
              <p className="text-white/50 text-[11px] uppercase tracking-wider mt-1">Postcards</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <p className="text-sky-300 text-2xl font-bold tabular-nums">
                {fmtUsd(data.totals.costUsd)}
              </p>
              <p className="text-white/50 text-[11px] uppercase tracking-wider mt-1">AI cost</p>
            </div>
          </div>

          {/* Sparkline — 7 bars showing daily AI calls */}
          {data.dailySpark.length > 0 && data.totals.calls > 0 && (
            <div className="mb-4">
              <p className="text-white/40 text-[11px] uppercase tracking-wider mb-2">Daily cost</p>
              <div className="flex items-end gap-1 h-12">
                {data.dailySpark.map((d) => {
                  const pct = maxSparkCost > 0 ? (d.costUsd / maxSparkCost) * 100 : 0;
                  const dayLabel = new Date(d.day + "T00:00:00Z").toLocaleDateString("en-US", {
                    weekday: "short",
                  });
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full bg-violet-500/10 rounded-sm flex-1 flex items-end relative">
                        <div
                          className="w-full bg-violet-400 rounded-sm transition-all"
                          style={{ height: `${Math.max(pct, d.calls > 0 ? 4 : 0)}%` }}
                          title={`${d.day}: ${d.calls} calls · ${fmtUsd(d.costUsd)}`}
                        />
                      </div>
                      <span className="text-[9px] text-white/40 tabular-nums">{dayLabel[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top actions */}
          {data.topActions.length > 0 && (
            <div>
              <p className="text-white/40 text-[11px] uppercase tracking-wider mb-2">Top actions</p>
              <div className="flex flex-wrap gap-2">
                {data.topActions.map((a) => (
                  <span
                    key={a.action}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70 text-xs"
                  >
                    <span>{humanizeAction(a.action)}</span>
                    <span className="text-white/40">·</span>
                    <span className="tabular-nums">{a.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.totals.calls === 0 && (
            <p className="text-white/40 text-xs italic mt-2">
              No AI activity logged in the last 7 days.
            </p>
          )}
        </>
      )}
    </div>
  );
}
