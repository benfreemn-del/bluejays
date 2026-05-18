"use client";

import { useEffect, useState } from "react";

/**
 * <SLA60SecondChip /> — top-of-dashboard telemetry chip.
 *
 * Annie's reception-funnel rule: every audit-lead intake should be
 * touched within 60 seconds. This chip surfaces the rolling 24-hour
 * hit rate so Ben + Madie see in-real-time whether they're meeting it.
 *
 * Auto-refreshes every 60 seconds.
 *
 * Per CLAUDE.md Lead Interaction System Phase 1 — Hormozi Annie diagnosis.
 */

type SLAData = {
  total: number;
  hits: number;
  rate_pct: number;
};

const POLL_MS = 60_000;

function colorFor(ratePct: number, total: number): {
  bg: string;
  border: string;
  text: string;
  emoji: string;
} {
  if (total === 0) {
    return {
      bg: "bg-slate-500/10",
      border: "border-slate-500/30",
      text: "text-slate-400",
      emoji: "💤",
    };
  }
  if (ratePct >= 80) {
    return {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/40",
      text: "text-emerald-300",
      emoji: "🟢",
    };
  }
  if (ratePct >= 50) {
    return {
      bg: "bg-amber-500/10",
      border: "border-amber-500/40",
      text: "text-amber-300",
      emoji: "🟡",
    };
  }
  return {
    bg: "bg-rose-500/10",
    border: "border-rose-500/40",
    text: "text-rose-300",
    emoji: "🔴",
  };
}

export default function SLA60SecondChip() {
  const [data, setData] = useState<SLAData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const r = await fetch("/api/touches/sla-60s", { cache: "no-store" });
        const j = (await r.json()) as { ok?: boolean } & SLAData;
        if (cancelled) return;
        if (j.ok) {
          setData({ total: j.total, hits: j.hits, rate_pct: j.rate_pct });
        }
      } catch {
        // Silent — chip just stays blank
      }
    }

    void load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!data) return null;

  const c = colorFor(data.rate_pct, data.total);
  const label =
    data.total === 0
      ? "No audit leads in last 24h"
      : `${data.hits}/${data.total} audit leads touched <60s (${data.rate_pct}%)`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide ${c.bg} ${c.border} ${c.text} border rounded-md px-2.5 py-1`}
      title="60-second SLA — Annie's reception-funnel rule. Goal: 80%+ of audit-lead intakes get an outbound touch within 60 seconds of submission."
    >
      <span aria-hidden>{c.emoji}</span>
      <span>{label}</span>
    </span>
  );
}
