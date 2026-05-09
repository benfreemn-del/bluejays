"use client";

import { useEffect, useState } from "react";

/**
 * WinLossSalesBanner — surfaces "this week's top objection" + a
 * suggested script tweak at the top of the Sales Portal.
 *
 * Per dashboard review #4 — closes the Win-Loss feedback loop. Today
 * loss reasons are CAPTURED (Rule 45 + LossReasonsPanel) but the
 * sales-script consumer never sees them. Now Madie/Ben see the
 * top objection of the week the moment they open the Sales Portal,
 * with a prescriptive tweak suggestion mapped to that objection.
 *
 * Reads /api/loss-reasons/stats (existing endpoint, 30-day window)
 * and filters client-side to the last 7 days. Auto-refreshes every
 * 5 minutes (objection trends move slowly).
 */

type LossReasonStats = {
  totalLast30Days: number;
  byCategory: Record<string, number>;
  topVerbatims: Array<{
    id: string;
    prospectName: string;
    category: string;
    response: string;
    surfacedAt: string;
    actedOnAt: string | null;
    confidence: number;
  }>;
};

const SUGGESTED_TWEAKS: Record<
  string,
  { label: string; tweak: string; tone: "rose" | "amber" | "sky" | "violet" }
> = {
  price: {
    label: "Price",
    tweak:
      "Add ROI framing on first touch — '$10k pays back in 60 days at our typical 200% ROAS, here's the math'. Lead with payback period, not the sticker.",
    tone: "rose",
  },
  timing: {
    label: "Timing",
    tweak:
      "Acknowledge the timeline — 'totally fair, when do you typically rebuild?' — then book a date. Don't pitch around timing; pin it.",
    tone: "amber",
  },
  design: {
    label: "Design",
    tweak:
      "Lead with proof, not promise — show 3 before/after testimonials in the first 2 minutes. Per Hormozi Rule 4: your promise isn't unique, your proof is.",
    tone: "violet",
  },
  have_one: {
    label: "Already have one",
    tweak:
      "Reframe as upgrade — 'most clients had something. Send me what you have, I'll tell you in 60 sec what's working and what's leaking money.'",
    tone: "sky",
  },
  no_response: {
    label: "Ghosted",
    tweak:
      "Ghosting = wrong-channel signal. Try voicemail-drop next, or send a 30-sec Loom of their site instead of email.",
    tone: "amber",
  },
  other: {
    label: "Other",
    tweak:
      "Open the verbatims panel on /dashboard — patterns hide in the long tail. If 3+ say something similar this week, lock it as a new category.",
    tone: "sky",
  },
};

export default function WinLossSalesBanner() {
  const [stats, setStats] = useState<LossReasonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/loss-reasons/stats", {
          credentials: "include",
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as LossReasonStats;
        if (!cancelled) {
          setStats(j);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[WinLossSalesBanner]", err);
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 5 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (loading || !stats || dismissed) return null;

  // Filter to the last 7 days using the topVerbatims surfaced_at
  // timestamps. The byCategory aggregate is 30-day; we recompute
  // the 7-day shape from the verbatims (the endpoint returns up to
  // 10 most-recent which is enough for "this week" granularity in
  // practice).
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekly: Record<string, number> = {};
  for (const v of stats.topVerbatims) {
    const ts = Date.parse(v.surfacedAt);
    if (!ts || ts < sevenDaysAgo) continue;
    weekly[v.category] = (weekly[v.category] ?? 0) + 1;
  }

  const total = Object.values(weekly).reduce((sum, n) => sum + n, 0);
  if (total === 0) return null; // No losses logged this week — clean week, hide banner.

  const topCategory = Object.entries(weekly).sort((a, b) => b[1] - a[1])[0];
  const [category, count] = topCategory;
  const pct = Math.round((count / total) * 100);
  const tweak = SUGGESTED_TWEAKS[category] ?? SUGGESTED_TWEAKS.other;

  const cls =
    tweak.tone === "rose"
      ? "border-rose-500/40 bg-rose-500/[0.06]"
      : tweak.tone === "amber"
        ? "border-amber-500/40 bg-amber-500/[0.06]"
        : tweak.tone === "violet"
          ? "border-violet-500/40 bg-violet-500/[0.06]"
          : "border-sky-500/40 bg-sky-500/[0.06]";

  const accentText =
    tweak.tone === "rose"
      ? "text-rose-300"
      : tweak.tone === "amber"
        ? "text-amber-300"
        : tweak.tone === "violet"
          ? "text-violet-300"
          : "text-sky-300";

  return (
    <div className={`rounded-xl border ${cls} p-4 mb-4 relative`}>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-slate-400 hover:text-white text-sm leading-none"
      >
        ×
      </button>
      <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-slate-400 mb-2">
        This week&apos;s top objection · script tweak
      </p>
      <div className="flex items-baseline gap-3 flex-wrap mb-2">
        <h3 className={`text-lg font-black ${accentText}`}>{tweak.label}</h3>
        <span className="text-sm text-slate-300">
          <span className="font-bold tabular-nums">{count}</span> dismissals ·{" "}
          <span className="font-bold tabular-nums">{pct}%</span> of last 7 days
        </span>
      </div>
      <p className="text-sm text-slate-200 leading-relaxed">{tweak.tweak}</p>
    </div>
  );
}
