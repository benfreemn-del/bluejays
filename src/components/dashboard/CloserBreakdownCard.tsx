"use client";

import { useEffect, useState } from "react";

/**
 * CloserBreakdownCard — H6 (Hormozi "No Data Daddy" fix) Tier 1.
 *
 * Ships the Pipeline 1 closer-split metric: paid-this-30d, cash-this-30d,
 * and active-pipeline counts bucketed by Ben vs Madie. Without this card,
 * Day-19 FB ad spend lands without a visible "which closer is moving
 * faster" signal — and the rest of the dashboard reports aggregate
 * numbers that hide closer-level performance.
 *
 * Also surfaces the global avgTtoDays metric (time from paid_at to first
 * inbound lead) so Ben can spot onboarding-speed regressions early.
 *
 * Data source: GET /api/dashboard/closer-breakdown (reads prospects
 * table with the new closer_name column from migration
 * 20260516_prospects_closer_tracking.sql).
 */

type CloserStat = {
  name: string;
  closedLifetime: number;
  paidLast30d: number;
  activePipeline: number;
};

type Response = {
  ok: boolean;
  closers: CloserStat[];
  avgTtoDays: number | null;
  configured?: boolean;
  error?: string;
};

const ACCENT: Record<string, string> = {
  Ben: "sky",
  Madie: "violet",
  Unassigned: "slate",
};

function accentClasses(closerName: string) {
  const accent = ACCENT[closerName] || "amber";
  const map: Record<string, { ring: string; text: string; dot: string }> = {
    sky: {
      ring: "border-sky-500/30 bg-sky-500/[0.05]",
      text: "text-sky-300",
      dot: "bg-sky-400",
    },
    violet: {
      ring: "border-violet-500/30 bg-violet-500/[0.05]",
      text: "text-violet-300",
      dot: "bg-violet-400",
    },
    amber: {
      ring: "border-amber-500/30 bg-amber-500/[0.05]",
      text: "text-amber-300",
      dot: "bg-amber-400",
    },
    slate: {
      ring: "border-white/10 bg-white/[0.03]",
      text: "text-slate-300",
      dot: "bg-slate-400",
    },
  };
  return map[accent];
}

export default function CloserBreakdownCard() {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/dashboard/closer-breakdown", {
          cache: "no-store",
        });
        const json = (await res.json()) as Response;
        if (cancelled) return;
        if (!res.ok || !json.ok) {
          setError(json.error || `HTTP ${res.status}`);
        } else {
          setData(json);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface/40 p-6 animate-pulse">
        <div className="h-4 w-48 bg-white/10 rounded mb-3" />
        <div className="h-20 bg-white/5 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6">
        <p className="text-xs uppercase tracking-widest text-rose-400 font-bold mb-1">
          Closer breakdown unavailable
        </p>
        <p className="text-sm text-rose-300">{error}</p>
      </div>
    );
  }

  if (!data || !data.configured) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-5 md:p-6">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted font-bold mb-1">
            H6 · Pipeline 1 — closer split
          </p>
          <h3 className="text-lg font-bold text-white">Who&apos;s moving the pipeline</h3>
        </div>
        {data.avgTtoDays !== null && (
          <div className="text-right flex-shrink-0">
            <p className="text-[11px] uppercase tracking-widest text-muted font-bold">
              Avg TTO
            </p>
            <p className="text-lg font-bold text-emerald-300">
              {data.avgTtoDays}d
            </p>
            <p className="text-[10px] text-muted">paid → first lead</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.closers.length === 0 && (
          <div className="col-span-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
            <p className="text-sm text-muted">
              No closer-attributed prospects yet. Assign{" "}
              <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">closer_name</code>{" "}
              on paid prospects to see the split.
            </p>
          </div>
        )}
        {data.closers.map((c) => {
          const a = accentClasses(c.name);
          return (
            <div key={c.name} className={`rounded-xl border ${a.ring} p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
                <p className={`text-sm font-bold ${a.text}`}>{c.name}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted">
                    Lifetime closed
                  </span>
                  <span className="text-lg font-bold text-white">
                    {c.closedLifetime}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted">
                    Paid 30d
                  </span>
                  <span className="text-sm font-bold text-emerald-300">
                    {c.paidLast30d}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted">
                    Active pipeline
                  </span>
                  <span className="text-sm font-bold text-white">
                    {c.activePipeline}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted mt-4 pt-4 border-t border-white/5">
        H6 Tier 1 — Pipeline 1 metric. Backfill{" "}
        <code className="text-xs bg-white/5 px-1 rounded">closer_name</code>{" "}
        on paid prospects from May 1+ to populate this view. Day-19 FB launch context.
      </p>
    </div>
  );
}
