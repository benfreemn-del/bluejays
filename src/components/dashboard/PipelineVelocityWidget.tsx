"use client";

import { useEffect, useState } from "react";

/**
 * PipelineVelocityWidget — answers "are deals MOVING through the
 * pipeline, or just sitting there?" Mounts at the top of
 * /dashboard/sales-pipeline.
 *
 * Per dashboard review #4 — closes the gap where the kanban shows
 * current state but no flow. Reads /api/pipeline/velocity which
 * approximates weekly movement from prospects.updated_at until a
 * proper pipeline_stage transition log lands.
 *
 * Auto-refreshes every 60s.
 */

type Velocity = {
  totalActive: number;
  newThisWeek: number;
  activeThisWeek: number;
  stuck14d: number;
  stuck30d: number;
  totalDealValueCents: number;
  byStage: {
    website: Record<string, number>;
    fullsystem: Record<string, number>;
  };
  conversionRates: {
    website: Record<string, number>;
    fullsystem: Record<string, number>;
  };
};

export default function PipelineVelocityWidget() {
  const [data, setData] = useState<Velocity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/pipeline/velocity", {
          credentials: "include",
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as Velocity;
        if (!cancelled) {
          setData(j);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[PipelineVelocityWidget]", err);
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-slate-900/40 p-4 mb-4 text-[11px] text-slate-500">
        Loading pipeline velocity…
      </div>
    );
  }

  const totalDeal = formatUsd(data.totalDealValueCents);
  const stuckPct =
    data.totalActive === 0
      ? 0
      : Math.round((data.stuck14d / data.totalActive) * 100);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/30 p-4 mb-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span>📊</span> Pipeline velocity
        </h2>
        <p className="text-[10px] text-slate-500">
          Last 7 days · approximate from updated_at · refreshes 60s
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Metric label="Active" value={data.totalActive} accent="slate" />
        <Metric
          label="In pipeline"
          value={totalDeal}
          accent="emerald"
          isMoney
        />
        <Metric label="New (7d)" value={data.newThisWeek} accent="sky" />
        <Metric
          label="Touched (7d)"
          value={data.activeThisWeek}
          accent="violet"
        />
        <Metric
          label="Stuck > 14d"
          value={data.stuck14d}
          accent={stuckPct > 30 ? "rose" : stuckPct > 15 ? "amber" : "slate"}
          subtitle={data.totalActive > 0 ? `${stuckPct}% of active` : undefined}
        />
        <Metric
          label="Stuck > 30d"
          value={data.stuck30d}
          accent={data.stuck30d > 0 ? "rose" : "slate"}
        />
      </div>

      {/* Conversion rates per track — the close-rate predictor.
          Derived from steady-state stage distributions; rough but
          directional. */}
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <ConversionRow
          track="Website · $997"
          tone="sky"
          rates={data.conversionRates.website}
        />
        <ConversionRow
          track="AI System · $10K"
          tone="violet"
          rates={data.conversionRates.fullsystem}
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  subtitle,
  isMoney,
}: {
  label: string;
  value: string | number;
  accent: "slate" | "sky" | "violet" | "emerald" | "amber" | "rose";
  subtitle?: string;
  isMoney?: boolean;
}) {
  const cls =
    accent === "sky"
      ? "border-sky-500/30 bg-sky-500/[0.06] text-sky-200"
      : accent === "violet"
        ? "border-violet-500/30 bg-violet-500/[0.06] text-violet-200"
        : accent === "emerald"
          ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200"
          : accent === "amber"
            ? "border-amber-500/30 bg-amber-500/[0.06] text-amber-200"
            : accent === "rose"
              ? "border-rose-500/30 bg-rose-500/[0.06] text-rose-200"
              : "border-slate-700 bg-slate-800/40 text-slate-300";
  return (
    <div className={`rounded-lg border ${cls} px-3 py-2`}>
      <p className="text-[10px] uppercase tracking-wider font-bold opacity-80 truncate">
        {label}
      </p>
      <p
        className={`tabular-nums font-black mt-0.5 ${isMoney ? "text-xl" : "text-2xl"}`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-[10px] opacity-60 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

function ConversionRow({
  track,
  tone,
  rates,
}: {
  track: string;
  tone: "sky" | "violet";
  rates: Record<string, number>;
}) {
  const accentText = tone === "sky" ? "text-sky-300" : "text-violet-300";
  const items = Object.entries(rates);
  return (
    <div className="rounded-lg border border-white/[0.06] bg-slate-900/30 p-3">
      <p
        className={`text-[10px] uppercase tracking-wider font-bold ${accentText} mb-2`}
      >
        {track} · stage-to-stage
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {items.map(([transition, pct]) => (
          <span
            key={transition}
            className="text-[11px] font-bold px-2 py-0.5 rounded border border-white/[0.06] bg-slate-800/40 text-slate-300 tabular-nums"
            title={`${pct}% of ${transition} cohort moved forward (steady-state approx)`}
          >
            {transition}{" "}
            <span
              className={
                pct >= 30
                  ? "text-emerald-300"
                  : pct >= 15
                    ? "text-amber-300"
                    : "text-rose-300"
              }
            >
              {pct}%
            </span>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-[11px] text-slate-500">
            No data yet — needs at least one prospect at each stage.
          </span>
        )}
      </div>
    </div>
  );
}

function formatUsd(cents: number): string {
  const d = cents / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1000) return `$${(d / 1000).toFixed(0)}k`;
  return `$${Math.round(d)}`;
}
