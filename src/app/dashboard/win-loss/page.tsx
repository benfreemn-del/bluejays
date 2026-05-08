"use client";

/**
 * /dashboard/win-loss
 *
 * Operator-facing review of every AI Package prospect that got the
 * win-loss survey email (Batch 9) so Ben can categorize their reply
 * into one of 6 outcomes:
 *
 *   price       — too expensive for where they're at
 *   timing      — bad month, might revisit later
 *   fit         — wasn't right for their business
 *   competitor  — went with another agency / DIY
 *   no-reply    — silent (most common)
 *   other       — free-form note
 *
 * Why this matters: the win-loss survey cron sends the email; the
 * AI Inbound Responder classifies the reply; this UI lets Ben
 * confirm + commit the outcome to prospect.win_loss_outcome so
 * funnel optimization has clean data over 30+ deals.
 *
 * Reads /api/prospects (already exists), filters to fullsystem +
 * survey-sent + outcome-not-yet-set, lets the operator pick a
 * category per row + save via PATCH /api/prospects/[id].
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Prospect } from "@/lib/types";

const OUTCOMES = [
  { id: "price", label: "Price", emoji: "💰", desc: "Too expensive" },
  { id: "timing", label: "Timing", emoji: "⏳", desc: "Bad month / wait" },
  { id: "fit", label: "Fit", emoji: "🎯", desc: "Not right for them" },
  { id: "competitor", label: "Competitor", emoji: "🏃", desc: "Went elsewhere" },
  { id: "no-reply", label: "No reply", emoji: "🔕", desc: "Silent" },
  { id: "other", label: "Other", emoji: "📝", desc: "Free-form note" },
] as const;

type OutcomeId = (typeof OUTCOMES)[number]["id"];

const OUTCOME_BY_ID: Record<string, (typeof OUTCOMES)[number]> = Object.fromEntries(
  OUTCOMES.map((o) => [o.id, o]),
);

export default function WinLossPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, OutcomeId | null>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchProspects = async () => {
    try {
      const res = await fetch("/api/prospects", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { prospects?: Prospect[] };
      // Filter to fullsystem-tier prospects who got the win-loss
      // survey. Anything without a survey timestamp isn't on this
      // board yet.
      setProspects(
        (data.prospects ?? []).filter(
          (p) =>
            p.pricingTier === "fullsystem" &&
            // Survey was sent — this is a candidate for review.
            // (We use any cast since these fields are new + not on
            // every prospect type definition path yet.)
            (p as Prospect & { winLossSurveySentAt?: string | null })
              .winLossSurveySentAt,
        ),
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  // Split into pending vs completed based on whether the operator
  // has stamped win_loss_outcome yet.
  const { pendingList, completedList } = useMemo(() => {
    const pendingArr: Prospect[] = [];
    const completedArr: Prospect[] = [];
    for (const p of prospects) {
      const outcome = (p as Prospect & { winLossOutcome?: string | null })
        .winLossOutcome;
      if (outcome) completedArr.push(p);
      else pendingArr.push(p);
    }
    return { pendingList: pendingArr, completedList: completedArr };
  }, [prospects]);

  const setOutcome = (id: string, outcome: OutcomeId | null) => {
    setPending((prev) => ({ ...prev, [id]: outcome }));
  };

  const save = async (id: string) => {
    if (savingId) return;
    const outcome = pending[id];
    if (outcome === undefined) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/prospects/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winLossOutcome: outcome }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProspects((prev) =>
        prev.map((p) =>
          p.id === id
            ? ({ ...p, winLossOutcome: outcome } as Prospect & {
                winLossOutcome?: string | null;
              })
            : p,
        ),
      );
      setPending((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (e) {
      console.error("[win-loss] save failed:", e);
    } finally {
      setSavingId(null);
    }
  };

  const visibleList = showCompleted ? completedList : pendingList;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Dash
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex-1">
            Win-loss review
          </h1>
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="text-[11px] tracking-wider uppercase font-bold text-slate-300 hover:text-white border border-slate-700 px-2.5 py-1 rounded"
          >
            {showCompleted
              ? `Pending (${pendingList.length})`
              : `Completed (${completedList.length})`}
          </button>
        </div>
        <p className="mx-auto max-w-5xl px-4 sm:px-6 pb-3 text-xs text-slate-500">
          AI Package prospects who got the win-loss survey. Pick the
          outcome category (price / timing / fit / competitor / no-reply /
          other) — drives funnel-optimization data over 30+ closes.
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 pb-32">
        {loading && (
          <div className="text-center text-slate-500 py-10">Loading…</div>
        )}
        {err && (
          <div className="rounded-lg border border-rose-700/50 bg-rose-950/30 text-rose-200 px-4 py-3 mb-4 text-sm">
            {err}
          </div>
        )}

        {!loading && visibleList.length === 0 && (
          <div className="text-center text-slate-500 py-16">
            <div className="text-4xl mb-3">{showCompleted ? "📊" : "🎉"}</div>
            <p className="text-sm">
              {showCompleted
                ? "No completed reviews yet."
                : "No pending reviews. Inbox zero on win-loss."}
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {visibleList.map((p) => {
            const persisted =
              ((p as Prospect & { winLossOutcome?: string | null })
                .winLossOutcome as OutcomeId | null) ?? null;
            const local = pending[p.id];
            const display = local !== undefined ? local : persisted;
            const dirty = local !== undefined && local !== persisted;

            return (
              <li
                key={p.id}
                className={`rounded-xl border p-4 transition-colors ${
                  dirty
                    ? "border-amber-500/60 bg-amber-950/20"
                    : showCompleted
                      ? "border-slate-800 bg-slate-900/30"
                      : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {p.businessName || "(unnamed)"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {[p.ownerName, p.email, p.phone]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      Survey sent:{" "}
                      {(() => {
                        const sentAt = (
                          p as Prospect & {
                            winLossSurveySentAt?: string | null;
                          }
                        ).winLossSurveySentAt;
                        return sentAt
                          ? new Date(sentAt).toLocaleDateString()
                          : "—";
                      })()}
                    </p>
                  </div>

                  {persisted && !dirty && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded px-2 py-1 shrink-0">
                      {OUTCOME_BY_ID[persisted]?.emoji ?? "✓"}{" "}
                      {OUTCOME_BY_ID[persisted]?.label ?? persisted}
                    </span>
                  )}
                </div>

                {/* Outcome buttons — chip row */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {OUTCOMES.map((o) => {
                    const selected = display === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setOutcome(p.id, selected ? null : o.id)}
                        title={o.desc}
                        className={`text-[11px] font-bold uppercase tracking-wider rounded px-2.5 py-1 border transition-colors ${
                          selected
                            ? "border-amber-500 bg-amber-500/15 text-amber-200"
                            : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-white"
                        }`}
                      >
                        {o.emoji} {o.label}
                      </button>
                    );
                  })}
                </div>

                {dirty && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300">
                      Unsaved · {persisted || "—"} →{" "}
                      {local ? OUTCOME_BY_ID[local]?.label ?? local : "(cleared)"}
                    </span>
                    <button
                      type="button"
                      disabled={savingId === p.id}
                      onClick={() => save(p.id)}
                      className="text-[11px] font-bold uppercase tracking-wider rounded px-3 py-1 bg-amber-500 hover:bg-amber-400 text-amber-950 disabled:opacity-50"
                    >
                      {savingId === p.id ? "Saving…" : "Save"}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
