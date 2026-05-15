"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * "Currently building for" card — Hormozi backend review B1 (2026-05-16).
 *
 * Shows the operator (and on a screen-share, the prospect) what's
 * actively getting shipped this week for which clients. Replaces the
 * old "trust me, we're working" story with auto-populated proof.
 *
 * Powered by /api/dashboard/in-flight-builds which buckets last-30d
 * client_tasks rows by slug + surfaces the most-recent done task +
 * the highest-priority in_progress task per client.
 */

type Build = {
  slug: string;
  displayName: string;
  lastShipped: { title: string; completedAt: string } | null;
  inProgress: { title: string; priority: string } | null;
  doneCount30d: number;
  openCount: number;
};

type Response = {
  ok: boolean;
  builds: Build[];
  configured?: boolean;
  error?: string;
};

function fmtRelative(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)}w ago`;
  return d.toLocaleDateString();
}

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "text-rose-300 bg-rose-500/10 border-rose-500/30",
  high: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  medium: "text-sky-300 bg-sky-500/10 border-sky-500/30",
  low: "text-slate-300 bg-white/[0.04] border-white/10",
};

export default function InFlightBuildsCard() {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/in-flight-builds", { cache: "no-store" });
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

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔧</span>
          <h3 className="text-white font-bold text-sm">Currently building for</h3>
          <span className="text-emerald-300/60 text-xs">· last 30 days</span>
        </div>
        <button
          onClick={load}
          className="text-emerald-300/60 hover:text-emerald-200 text-xs underline underline-offset-2"
          title="Refresh"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-white/40 text-sm">Loading…</p>}

      {error && (
        <div className="text-rose-300 text-sm">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && data && data.configured === false && (
        <p className="text-white/40 text-sm italic">Supabase not configured.</p>
      )}

      {!loading && !error && data && data.configured !== false && data.builds.length === 0 && (
        <p className="text-white/40 text-sm italic">
          No client tasks touched in the last 30 days.
        </p>
      )}

      {!loading && !error && data && data.builds.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.builds.map((b) => (
            <a
              key={b.slug}
              href={`/dashboard/clients/${b.slug}`}
              className="block rounded-xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] transition-colors p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="font-bold text-white text-sm leading-tight truncate">
                  {b.displayName}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300/80 flex-shrink-0">
                  <span className="tabular-nums font-bold">{b.doneCount30d}</span>
                  <span className="opacity-60">shipped</span>
                </span>
              </div>

              {b.lastShipped && (
                <div className="mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-400/70 mb-0.5">
                    ✓ Last shipped · {fmtRelative(b.lastShipped.completedAt)}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-snug">
                    {b.lastShipped.title}
                  </p>
                </div>
              )}

              {b.inProgress && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-sky-400/70 mb-0.5 flex items-center gap-1.5">
                    ⏳ Up next
                    <span
                      className={`inline-block text-[9px] font-bold px-1 py-px rounded border ${
                        PRIORITY_COLOR[b.inProgress.priority] || PRIORITY_COLOR.medium
                      }`}
                    >
                      {b.inProgress.priority}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-snug">
                    {b.inProgress.title}
                  </p>
                </div>
              )}

              {!b.lastShipped && b.inProgress && (
                <p className="text-[10px] text-slate-500 italic mt-1">
                  Build just kicked off
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
