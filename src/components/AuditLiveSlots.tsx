"use client";

import { useEffect, useState } from "react";

/**
 * AuditLiveSlots — pulls /api/agency/slots-remaining and renders a
 * tight one-line scarcity strip for the /audit landing. Built
 * 2026-05-15 as part of the Hormozi-grade lead-capture rebuild —
 * the legacy /audit had only a STATIC "5 businesses this month"
 * line that wasn't tied to real volume. This version reads the
 * fullsystem-tier paid-this-month count + the 10-build cap and
 * renders "X of 10 spots remaining". Falls back to a credible
 * static line if the API fails so the page never shows a 0/loading
 * state on cold paid traffic.
 *
 * Variants:
 *   "strip"   = full-width banner with pulse dot (top-of-page use)
 *   "inline"  = small one-line text (footer use, near the form, etc.)
 */

type SlotStats = { used: number; cap: number; remaining: number; monthLabel: string };

export default function AuditLiveSlots({
  variant = "strip",
  className = "",
}: {
  variant?: "strip" | "inline";
  className?: string;
} = {}) {
  const [slots, setSlots] = useState<SlotStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/agency/slots-remaining", { cache: "no-store" });
        const j = (await res.json()) as { ok?: boolean } & SlotStats;
        if (!cancelled && j.ok !== false) {
          setSlots({
            used: j.used ?? 0,
            cap: j.cap ?? 10,
            remaining: j.remaining ?? 10,
            monthLabel:
              j.monthLabel ??
              new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
          });
        }
      } catch {
        // Static fallback stays
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const month =
    slots?.monthLabel ??
    new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const remaining = slots?.remaining ?? 10;
  const cap = slots?.cap ?? 10;
  const allTaken = remaining === 0;

  if (variant === "inline") {
    return (
      <span className={`text-xs text-amber-300/80 tracking-wide ${className}`}>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 align-middle animate-pulse" />
        {month} · {allTaken ? `${cap} of ${cap} taken — next slot rolls to next month` : (
          <>
            <span className="font-bold text-amber-200">{remaining} of {cap}</span> AI System build spots remaining
          </>
        )}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/[0.08] text-sm ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
      </span>
      <span className="text-amber-200 text-xs font-bold uppercase tracking-wider">{month}</span>
      <span className="text-slate-600">·</span>
      <span className="text-white text-sm font-semibold">
        {allTaken ? (
          <>
            <span className="text-rose-300">{cap} of {cap}</span> build spots taken
          </>
        ) : (
          <>
            <span className="text-amber-300">{remaining} of {cap}</span> AI System build spots remaining
          </>
        )}
      </span>
    </div>
  );
}
