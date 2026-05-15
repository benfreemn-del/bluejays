"use client";

/**
 * TrustBar — live social-proof counter strip for high-intent landing
 * pages (/agency, /cut-my-agency). Bigger surface than the small
 * SocialProofCounter pill on /audit — renders 4 stat tiles with the
 * lifetime-floor numbers from /api/stats/public.
 *
 * Three tiles + a saved-for-clients dollar tile. Falls back to floor
 * values if the fetch fails so the page never shows a 0/loading
 * state to a cold paid-traffic visitor (single biggest first-three-
 * second trust killer on a $9,700 offer).
 *
 * Per the deep-dive review: cheapest conversion lever sitting unused.
 */

import { useEffect, useState } from "react";

const FLOOR = {
  sitesBuilt: 2000,
  aiPackagesRunning: 20,
  auditsThisWeek: 22,
  savedForClients: 600_000, // matches /api/stats/public floor
};

type Stats = typeof FLOOR;

function fmtUsd(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
  return `$${v}`;
}

/** Render whole-number counts compactly: 2000 -> "2k", 12000 -> "12k". */
function fmtCount(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${Math.round(v / 1000)}k`;
  return `${v}`;
}

export default function TrustBar({
  variant = "default",
}: {
  /** "default" = full 4-tile strip · "compact" = single-line pill row */
  variant?: "default" | "compact";
}) {
  const [stats, setStats] = useState<Stats>(FLOOR);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        setStats({
          sitesBuilt: j.sitesBuilt ?? FLOOR.sitesBuilt,
          aiPackagesRunning: j.aiPackagesRunning ?? FLOOR.aiPackagesRunning,
          auditsThisWeek: j.auditsThisWeek ?? FLOOR.auditsThisWeek,
          savedForClients: j.savedForClients ?? FLOOR.savedForClients,
        });
      })
      .catch(() => {
        // Floor values stay in place — page never renders 0s.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (variant === "compact") {
    return (
      <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
        <span>
          <span className="text-white font-bold tabular-nums">
            {fmtCount(stats.sitesBuilt)}+
          </span>{" "}
          sites built
        </span>
        <span className="text-slate-600">·</span>
        <span>
          <span className="text-white font-bold tabular-nums">
            {stats.aiPackagesRunning}
          </span>{" "}
          AI Packages running
        </span>
        <span className="text-slate-600">·</span>
        <span>
          <span className="text-white font-bold tabular-nums">
            {fmtUsd(stats.savedForClients)}+
          </span>{" "}
          saved for clients
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <Tile
        value={`${fmtCount(stats.sitesBuilt)}+`}
        label="Sites built"
        sub="Real businesses, real owners"
        accent="sky"
      />
      <Tile
        value={`${stats.aiPackagesRunning}`}
        label="AI Packages running"
        sub="$9,700 tier · live today"
        accent="violet"
      />
      <Tile
        value={`${stats.auditsThisWeek}`}
        label="Audits this week"
        sub="Free 60-second analyses"
        accent="emerald"
      />
      <Tile
        value={`${fmtUsd(stats.savedForClients)}+`}
        label="Saved for clients"
        sub="Year-1 vs old agency bills"
        accent="amber"
      />
    </div>
  );
}

function Tile({
  value,
  label,
  sub,
  accent,
}: {
  value: string;
  label: string;
  sub: string;
  accent: "sky" | "violet" | "emerald" | "amber";
}) {
  const ring: Record<string, string> = {
    sky: "border-sky-500/30 bg-sky-950/20",
    violet: "border-violet-500/30 bg-violet-950/20",
    emerald: "border-emerald-500/30 bg-emerald-950/20",
    amber: "border-amber-500/30 bg-amber-950/20",
  };
  const text: Record<string, string> = {
    sky: "text-sky-200",
    violet: "text-violet-200",
    emerald: "text-emerald-200",
    amber: "text-amber-200",
  };
  return (
    <div className={`rounded-xl border ${ring[accent]} p-4`}>
      <div className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none mb-1">
        {value}
      </div>
      <div className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${text[accent]}`}>
        {label}
      </div>
      <div className="text-[10px] text-slate-500 mt-1">{sub}</div>
    </div>
  );
}
