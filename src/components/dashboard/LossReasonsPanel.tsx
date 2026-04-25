"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * LossReasonsPanel — operator dashboard tile for the Win/Loss feedback loop.
 *
 * Shows:
 *   - Top loss reasons by category (last 30 days) with counts
 *   - The 10 most recent verbatim probe responses with business name +
 *     a "Mark reviewed" button per row
 *
 * Powered by:
 *   - GET /api/loss-reasons/stats
 *   - POST /api/loss-reasons/[id]/review
 *
 * Polls every 60s. Optimistic UI on mark-reviewed (revert on failure).
 * See Rule 45 in CLAUDE.md and migration `20260424_loss_reasons.sql`.
 */

const POLL_MS = 60_000;
const VERBATIM_EXCERPT_MAX = 180;

interface Verbatim {
  id: string;
  prospectId: string;
  prospectName: string;
  category: string;
  response: string;
  surfacedAt: string;
  actedOnAt: string | null;
  confidence: number | null;
}

interface StatsResponse {
  totalLast30Days: number;
  byCategory: Record<string, number>;
  topVerbatims: Verbatim[];
}

const CATEGORY_LABELS: Record<string, string> = {
  price: "Price",
  timing: "Timing",
  design: "Design",
  have_one: "Already have one",
  no_response: "No response",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  price: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  timing: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  design: "bg-violet-500/15 text-violet-300 border-violet-500/40",
  have_one: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  no_response: "bg-slate-500/15 text-slate-300 border-slate-500/40",
  other: "bg-zinc-500/15 text-zinc-300 border-zinc-500/40",
};

function categoryClass(cat: string): string {
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other;
}

function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function truncate(text: string, max: number): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export default function LossReasonsPanel() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/loss-reasons/stats", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as StatsResponse;
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    pollTimer.current = setInterval(load, POLL_MS);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [load]);

  const handleMarkReviewed = useCallback(
    async (id: string) => {
      if (!data) return;
      const previous = data;
      // Optimistic update
      setData({
        ...data,
        topVerbatims: data.topVerbatims.map((v) =>
          v.id === id ? { ...v, actedOnAt: new Date().toISOString() } : v
        ),
      });
      try {
        const res = await fetch(`/api/loss-reasons/${id}/review`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        setData(previous);
        setError(e instanceof Error ? e.message : "Mark reviewed failed");
      }
    },
    [data]
  );

  if (loading && !data) {
    return (
      <div
        className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted"
        aria-busy="true"
      >
        Loading loss reasons…
      </div>
    );
  }

  const total = data?.totalLast30Days ?? 0;
  const byCategory = data?.byCategory ?? {};
  const verbatims = data?.topVerbatims ?? [];

  // Top 5 categories by count (descending), only those with > 0
  const topCategories = Object.entries(byCategory)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Empty state — no data yet
  if (total === 0) {
    return (
      <div
        id="loss-reasons"
        className="rounded-xl border border-border bg-surface scroll-mt-20"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-500" />
            <h2 className="text-sm font-semibold text-foreground">
              Loss Reasons
            </h2>
            <span className="text-xs text-muted">last 30 days</span>
          </div>
        </div>
        <div className="px-4 py-6 text-center text-sm text-muted">
          No loss data yet — probes will start landing as the AI fires more
          not_interested farewells.
        </div>
        {error && (
          <div className="border-t border-rose-500/30 bg-rose-500/5 px-4 py-2 text-xs text-rose-300">
            {error}
          </div>
        )}
      </div>
    );
  }

  const unreviewedCount = verbatims.filter((v) => !v.actedOnAt).length;

  return (
    <div
      id="loss-reasons"
      className="rounded-xl border border-border bg-surface scroll-mt-20"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-violet-400" />
          <h2 className="text-sm font-semibold text-foreground">
            Loss Reasons
          </h2>
          <span className="text-xs text-muted">last 30 days</span>
          <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-mono font-semibold text-violet-300">
            {total}
          </span>
          {unreviewedCount > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300">
              {unreviewedCount} new
            </span>
          )}
        </div>
        <p className="hidden text-xs text-muted sm:block">
          Why prospects pass — informs pitch + template changes.
        </p>
      </div>

      {/* Top categories row */}
      {topCategories.length > 0 && (
        <div className="border-b border-border/60 px-4 py-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-muted">
            Top reasons
          </p>
          <div className="flex flex-wrap gap-2">
            {topCategories.map(([cat, count]) => (
              <span
                key={cat}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${categoryClass(cat)}`}
              >
                {categoryLabel(cat)}
                <span className="font-mono text-[11px] opacity-80">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent verbatims list */}
      <div>
        <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-muted">
          Recent verbatims
        </p>
        <ul className="divide-y divide-border/60">
          {verbatims.map((v) => (
            <li
              key={v.id}
              className={`px-4 py-3 transition-colors hover:bg-background/30 ${
                v.actedOnAt ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-foreground">
                  {v.prospectName}
                </span>
                <span
                  className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${categoryClass(v.category)}`}
                >
                  {categoryLabel(v.category)}
                </span>
                {v.confidence != null && (
                  <span
                    className="font-mono text-[10px] text-muted"
                    title="AI classification confidence"
                  >
                    {(v.confidence * 100).toFixed(0)}%
                  </span>
                )}
                <span
                  className="ml-auto text-[11px] text-muted"
                  title={new Date(v.surfacedAt).toLocaleString()}
                >
                  {relativeTime(v.surfacedAt)}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-foreground/85">
                &ldquo;{truncate(v.response, VERBATIM_EXCERPT_MAX)}&rdquo;
              </p>
              <div className="mt-2 flex items-center gap-2">
                {v.actedOnAt ? (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-300/80"
                    title={`Reviewed ${new Date(v.actedOnAt).toLocaleString()}`}
                  >
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Reviewed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMarkReviewed(v.id)}
                    className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
                  >
                    Mark reviewed
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="border-t border-rose-500/30 bg-rose-500/5 px-4 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}
    </div>
  );
}
