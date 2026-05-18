"use client";

import { useEffect, useState } from "react";
import type { ProspectTouch } from "@/lib/prospect-touches";

/**
 * <NextTouchBadge prospectId /> — tiny status badge for a lead card.
 *
 * Renders one of:
 *   - "✓ Madie touched 12m ago"  (recent touch by an operator)
 *   - "⏰ Next: text in 3 days"   (next_touch scheduled, not overdue)
 *   - "⚠️ overdue 2h"             (next_touch_at < now)
 *   - "🆕 no touch yet"           (no touches at all — only shown if prospect is audit_lead or contacted status)
 *
 * Self-fetches from /api/prospects/[id]/touches?limit=1 on mount.
 * Cheap enough to mount on every lead row.
 *
 * Per CLAUDE.md Lead Interaction System Phase 1.
 */

function relTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.abs(Math.round(diffMs / 60000));
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
}

interface Props {
  prospectId: string;
  /** When true and no touches exist, renders a "no touch yet" warning.
   *  Default true. Set false to hide entirely when no data. */
  warnIfNone?: boolean;
}

export default function NextTouchBadge({
  prospectId,
  warnIfNone = true,
}: Props) {
  const [latest, setLatest] = useState<ProspectTouch | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/prospects/${prospectId}/touches?limit=1`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; touches?: ProspectTouch[] }) => {
        if (cancelled) return;
        const row = j.ok && j.touches?.[0] ? j.touches[0] : null;
        setLatest(row);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [prospectId]);

  if (!loaded) return null;

  // No touches at all
  if (!latest) {
    if (!warnIfNone) return null;
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide bg-amber-500/15 text-amber-300 border border-amber-500/40 rounded px-1.5 py-0.5"
        title="No touches logged for this prospect"
      >
        🆕 no touch yet
      </span>
    );
  }

  // Next touch is scheduled
  if (latest.next_touch_at) {
    const nextMs = new Date(latest.next_touch_at).getTime();
    const overdueMs = Date.now() - nextMs;
    if (overdueMs > 0) {
      return (
        <span
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide bg-rose-500/15 text-rose-300 border border-rose-500/50 rounded px-1.5 py-0.5"
          title={`Next touch was scheduled for ${new Date(latest.next_touch_at).toLocaleString()}`}
        >
          ⚠️ overdue {relTime(latest.next_touch_at)}
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide bg-sky-500/15 text-sky-300 border border-sky-500/40 rounded px-1.5 py-0.5"
        title={`Next: ${latest.next_touch_kind || "touch"} on ${new Date(latest.next_touch_at).toLocaleString()}`}
      >
        ⏰ next {latest.next_touch_kind || "touch"} in {relTime(latest.next_touch_at)}
      </span>
    );
  }

  // Just show the latest touch info
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 rounded px-1.5 py-0.5"
      title={`${latest.kind} by ${latest.by_user} on ${new Date(latest.occurred_at).toLocaleString()}`}
    >
      ✓ {latest.by_user} {latest.kind === "call" ? "called" : latest.kind === "text" ? "texted" : latest.kind === "email" ? "emailed" : "touched"} {relTime(latest.occurred_at)} ago
    </span>
  );
}
