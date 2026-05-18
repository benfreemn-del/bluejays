"use client";

import { useEffect, useState, useCallback } from "react";
import type { ProspectTouch } from "@/lib/prospect-touches";

/**
 * <TouchTimeline /> — vertical scroll of every touch for one prospect.
 *
 * Newest-first. Each row: emoji · who · when · outcome chip · note ·
 * (if next_touch_at set) the scheduled next-touch reminder.
 *
 * Refresh by calling the imperative-style `bump` prop (or via the
 * useRefresh trigger from a parent — see TouchButtons.onLogged).
 *
 * Per CLAUDE.md Lead Interaction System Phase 1.
 */

const KIND_EMOJI: Record<string, string> = {
  call: "📞",
  voicemail: "🎙️",
  text: "💬",
  email: "✉️",
  dm: "📱",
  in_person: "🤝",
  note: "📝",
};

const KIND_LABEL: Record<string, string> = {
  call: "Called",
  voicemail: "Voicemail",
  text: "Texted",
  email: "Emailed",
  dm: "DMed",
  in_person: "Met",
  note: "Note",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Props {
  prospectId: string;
  /** Auto-refresh poll interval ms. 0 = no polling. Default 30s. */
  pollMs?: number;
  /** Bumping this number triggers an immediate refetch (used by parent
   *  to refresh after TouchButtons submits). */
  refreshKey?: number;
  /** Max rows to fetch. Default 50. */
  limit?: number;
}

export default function TouchTimeline({
  prospectId,
  pollMs = 30000,
  refreshKey = 0,
  limit = 50,
}: Props) {
  const [rows, setRows] = useState<ProspectTouch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/prospects/${prospectId}/touches?limit=${limit}`,
        { cache: "no-store" },
      );
      const j = (await r.json()) as { ok?: boolean; touches?: ProspectTouch[]; error?: string };
      if (j.ok && Array.isArray(j.touches)) {
        setRows(j.touches);
        setError(null);
      } else {
        setError(j.error || "Failed to load timeline");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [prospectId, limit]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    if (!pollMs || pollMs <= 0) return;
    const id = setInterval(() => void load(), pollMs);
    return () => clearInterval(id);
  }, [load, pollMs]);

  if (loading) {
    return (
      <div className="text-xs text-slate-400 italic px-3 py-2">
        Loading timeline…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded px-3 py-2">
        {error}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-xs text-slate-400 italic px-3 py-2">
        No touches logged yet. Use the buttons above to start the history.
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {rows.map((t) => {
        const isInbound = t.direction === "inbound";
        const emoji = KIND_EMOJI[t.kind] || "•";
        const label = KIND_LABEL[t.kind] || t.kind;
        return (
          <li
            key={t.id}
            className={`relative rounded-lg border px-3 py-2 ${
              isInbound
                ? "bg-emerald-500/[0.04] border-emerald-500/30"
                : "bg-sky-500/[0.04] border-sky-500/20"
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="text-lg leading-none mt-0.5" aria-hidden>
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-white">{label}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-300">
                    {isInbound ? "from" : "by"}{" "}
                    <span className="font-semibold text-white">{t.by_user}</span>
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-400">{relativeTime(t.occurred_at)}</span>
                  {t.outcome && (
                    <>
                      <span className="text-slate-400">·</span>
                      <span className="text-[10px] uppercase tracking-wide bg-slate-800 text-slate-200 rounded px-1.5 py-0.5">
                        {t.outcome.replace(/_/g, " ")}
                      </span>
                    </>
                  )}
                </div>
                {t.notes && (
                  <div className="text-sm text-slate-200 mt-1 whitespace-pre-wrap break-words">
                    {t.notes}
                  </div>
                )}
                {t.next_touch_at && (
                  <div className="mt-1 text-[11px] text-amber-300 flex items-center gap-1">
                    <span>⏰</span>
                    <span>
                      Next touch{t.next_touch_kind ? ` (${t.next_touch_kind})` : ""}:{" "}
                      {new Date(t.next_touch_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
