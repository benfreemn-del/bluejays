"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * FunnelVisualModal — opens from the portal Funnels tab "View funnel" button.
 *
 * Renders the audience funnel as a vertical, tapering flow so the owner can
 * see at a glance: how many entered, when each touch fires, what the message
 * is, and how the system narrows leads down stage by stage.
 *
 * Editable controls (added 2026-05-06 per Ben's "make individual points
 * editable" directive — this is the AI System standard now):
 *   - Click any step to inline-edit label + day + channel
 *   - Up/down arrows on the day number for ±1 day nudges
 *   - Voicemail steps show a read-only transcript block
 *   - + Note button at the top opens a free-form note panel
 *   - Save Changes / Send Note button POSTs to /api/funnel/feedback
 *     which SMSes + emails Ben so he can implement the change
 *
 * Feedback flow is intentionally human-in-the-loop — the owner's edits
 * don't mutate the live funnel directly. Ben sees the diff, applies the
 * change in code (or pushes back), then redeploys. Mirrors the rest of
 * the portal (every owner-driven mutation goes through Ben for now).
 */

export type FunnelStepLite = {
  day: number;
  channel: "email" | "sms" | "voicemail" | "postcard";
  label: string;
  // Optional voicemail transcript — when not present we synthesize from
  // the label so the read-only transcript block always renders something.
  transcript?: string;
  /** Cumulative reach % for this step — % of the original 100% who
   *  reach here. MUST be monotonically non-increasing across steps
   *  per CLAUDE.md Rule 74. When omitted, the modal falls back to
   *  REACH_BASELINE_BY_INDEX (industry-typical attrition curve, also
   *  monotonic). The reach is rendered as a horizontal bar on every
   *  step row — Ben's locked Funnels-tab requirement (2026-05-06). */
  cumulativeReachPct?: number;
};

export type FunnelDefLite = {
  segment: string;
  audienceTag: string;
  emoji: string;
  title: string;
  pitch: string;
  accentText: string; // tailwind class e.g. "text-amber-300"
  steps: FunnelStepLite[];
};

export type FunnelStageCounts = {
  total: number;
  newCount: number;
  enrolledCount: number;
  wonCount: number;
};

// Industry-typical reach attrition per email/SMS step. These are
// baselines, not invented per-client stats — clearly labeled in the UI.
// MUST be monotonically decreasing per CLAUDE.md Rule 74 (funnels only
// scale down, never back up).
const REACH_BASELINE_BY_INDEX = [1.0, 0.85, 0.65, 0.48, 0.34, 0.24, 0.17, 0.12];

/**
 * Coerce a sequence of reach percentages to be monotonically non-increasing
 * (each value <= previous). Returns a NEW array — input is not mutated.
 *
 * This is the defensive backstop for CLAUDE.md Rule 74. Any surface that
 * renders per-step funnel reach as bars / nodes / heights MUST run the
 * incoming numbers through this helper so a data error upstream can never
 * produce a non-monotonic visualization on screen.
 *
 * Behavior: walks left-to-right. If reach[i] > reach[i-1], clamps it to
 * reach[i-1]. So [100, 38, 81, 64, 51] → [100, 38, 38, 38, 38]. That's
 * intentionally aggressive — it makes the data error VISIBLE (a flat
 * tail) so the agent who introduced the bad data sees something is off,
 * rather than silently averaging the values into a plausible-looking
 * curve. The fix is upstream (correct the data), not in this helper.
 */
export function monotonizeReach(reach: readonly number[]): number[] {
  const out: number[] = [];
  let cap = Number.POSITIVE_INFINITY;
  for (const v of reach) {
    const next = Math.min(v, cap);
    out.push(next);
    cap = next;
  }
  return out;
}

const CHANNEL_OPTIONS: FunnelStepLite["channel"][] = [
  "email",
  "sms",
  "voicemail",
  "postcard",
];

function channelEmoji(c: FunnelStepLite["channel"]): string {
  return c === "email" ? "✉" : c === "sms" ? "💬" : c === "voicemail" ? "🎙" : "📮";
}

function channelLabel(c: FunnelStepLite["channel"]): string {
  return c === "email"
    ? "Email"
    : c === "sms"
      ? "SMS"
      : c === "voicemail"
        ? "Voicemail"
        : "AI Postcard";
}

function deriveTranscript(step: FunnelStepLite): string {
  if (step.transcript && step.transcript.trim()) return step.transcript;
  // Synthesize a plausible AI-voicemail script from the step label so the
  // owner sees what the prospect would actually hear. Real transcripts
  // get persisted via the feedback endpoint when Ben records them.
  return (
    `Hey, this is a quick voicemail from your team — ${step.label.toLowerCase()}. ` +
    `If you'd like to chat, give us a ring back when you get a sec. ` +
    `No pressure either way.`
  );
}

export default function FunnelVisualModal({
  isOpen,
  onClose,
  funnel,
  counts,
  landingUrl,
  slug,
  editable = true,
  initialShowNote = false,
  dataMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  funnel: FunnelDefLite | null;
  counts: FunnelStageCounts;
  landingUrl: string;
  /** Client slug — used as the routing key in the feedback endpoint. */
  slug?: string;
  /** When false, renders read-only (legacy callers). */
  editable?: boolean;
  /** When true, the modal opens with the note panel already expanded
   *  (used by the + Note pill on each funnel card). */
  initialShowNote?: boolean;
  /** Data freshness signal — "demo" renders an amber "DEMO DATA"
   *  banner so client-facing surfaces never accidentally show
   *  industry-baseline numbers as if they were live performance.
   *  Per Status Accuracy Rule (locked 2026-05-09 for Tekky walk):
   *  every funnel surface MUST be honest about whether the
   *  numbers are real or projected. */
  dataMode?: "live" | "demo";
}) {
  // Lock body scroll while open + close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  // Local edit state — per-step proposed overrides + an open-step pointer
  // so click-toggles the inline editor.
  const [edits, setEdits] = useState<Record<number, Partial<FunnelStepLite>>>({});
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [showNotePanel, setShowNotePanel] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  // Reset edit state every time the modal opens with a new funnel — stale
  // edits from a previous segment are confusing.
  useEffect(() => {
    if (!isOpen) return;
    setEdits({});
    setOpenStep(null);
    setShowNotePanel(initialShowNote);
    setNoteText("");
    setSubmitMsg(null);
  }, [isOpen, funnel?.segment, initialShowNote]);

  // Merged step view — original + per-step edits.
  const mergedSteps = useMemo<FunnelStepLite[]>(() => {
    if (!funnel) return [];
    return funnel.steps.map((s, i) => ({ ...s, ...(edits[i] ?? {}) }));
  }, [funnel, edits]);

  if (!isOpen || !funnel) return null;

  const enrolled = counts.total;
  const hasEdits = Object.keys(edits).length > 0;
  const canSubmit = editable && (hasEdits || (showNotePanel && noteText.trim().length > 0));

  const updateStep = (index: number, patch: Partial<FunnelStepLite>) => {
    setEdits((prev) => ({ ...prev, [index]: { ...prev[index], ...patch } }));
  };

  const resetStep = (index: number) => {
    setEdits((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const submitFeedback = async () => {
    if (!editable || !canSubmit || !funnel) return;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const items: unknown[] = [];
      for (const [idxStr, patch] of Object.entries(edits)) {
        const i = Number(idxStr);
        const original = funnel.steps[i];
        if (!original) continue;
        items.push({
          kind: "step_edit",
          funnelSegment: funnel.segment,
          funnelTitle: funnel.title,
          stepIndex: i,
          original: {
            day: original.day,
            channel: original.channel,
            label: original.label,
          },
          proposed: {
            day: patch.day ?? original.day,
            channel: patch.channel ?? original.channel,
            label: patch.label ?? original.label,
          },
        });
      }
      if (showNotePanel && noteText.trim()) {
        items.push({
          kind: "note",
          funnelSegment: funnel.segment,
          funnelTitle: funnel.title,
          note: noteText.trim(),
        });
      }
      const res = await fetch("/api/funnel/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug ?? null, items }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubmitMsg("Sent to BlueJays — Ben will review and reply within one business day.");
      setEdits({});
      setNoteText("");
      setShowNotePanel(false);
    } catch (e) {
      setSubmitMsg(`Couldn't reach BlueJays — try again in a moment. (${(e as Error).message})`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative my-6 mx-4 w-full max-w-3xl rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/5 px-6 py-5">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-3xl shrink-0 leading-none">
              {funnel.emoji}
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">
                {funnel.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                {funnel.pitch}
              </p>
              <p
                className={`text-[10px] uppercase tracking-widest font-bold mt-1.5 ${funnel.accentText}`}
              >
                Audience · {funnel.segment}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editable && (
              <button
                type="button"
                onClick={() => setShowNotePanel((v) => !v)}
                className={`rounded-md border text-xs px-2.5 py-1.5 transition-colors ${
                  showNotePanel
                    ? "border-amber-500/60 bg-amber-500/15 text-amber-200"
                    : "border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
                title="Send a note to BlueJays about this funnel"
              >
                {showNotePanel ? "✕ Cancel note" : "+ Note"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs px-2.5 py-1.5 transition-colors"
              aria-label="Close"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* DEMO DATA banner — render when dataMode === "demo" so the
            owner can never confuse industry-baseline projections with
            live numbers. Locked 2026-05-09 ahead of Tekky walkthrough. */}
        {dataMode === "demo" && (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-6 py-3 flex items-center gap-3">
            <span className="text-2xl leading-none" aria-hidden>📊</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest font-bold text-amber-300">
                Demo data · industry baselines
              </p>
              <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                Reach + drop-off + close-rate numbers below are typical-attrition projections — not your live performance yet. Your real numbers populate once leads enter the funnel and the cron rolls up the first 7 days.
              </p>
            </div>
          </div>
        )}

        {/* Note panel — opens when + Note clicked */}
        {editable && showNotePanel && (
          <div className="px-6 py-4 border-b border-white/5 bg-amber-500/[0.04]">
            <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-amber-300 mb-1.5 block">
              Note to BlueJays about this funnel
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Move D5 SMS to D3 — parents are dropping off too quickly. Or: add a new step at D14 for re-engagement."
              className="w-full h-24 rounded-lg bg-slate-900/80 border border-white/10 focus:border-amber-400 focus:outline-none px-3 py-2 text-sm text-white placeholder-slate-500"
            />
            <p className="text-[10px] text-slate-500 mt-1.5 italic">
              Ben sees the note + the step diff (if any) and replies within one business day.
            </p>
          </div>
        )}

        {/* Top stats row */}
        <div className="grid grid-cols-4 gap-2 px-6 py-4 border-b border-white/5">
          <StatBox label="Enrolled" value={counts.total} tone="white" />
          <StatBox label="New" value={counts.newCount} tone="blue" />
          <StatBox label="Active" value={counts.enrolledCount} tone="amber" />
          <StatBox label="Won" value={counts.wonCount} tone="emerald" />
        </div>

        {/* The visual funnel */}
        <div className="px-6 py-6">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mb-4 text-center">
            Touchpoint sequence · top → bottom
            {editable && <span className="ml-2 text-amber-400/70">· click any step to edit</span>}
          </div>

          {/* Entry node */}
          <div className="flex flex-col items-center">
            <FunnelEntryNode enrolled={enrolled} accentText={funnel.accentText} />

            {(() => {
              // Compute the per-step reach sequence ONCE — prefer real
              // per-step data when funnel.steps carry cumulativeReachPct,
              // otherwise fall back to the industry-typical baseline curve.
              // ALWAYS run through monotonizeReach() per Rule 74.
              const rawReach = mergedSteps.map(
                (s, i) =>
                  s.cumulativeReachPct ??
                  (REACH_BASELINE_BY_INDEX[i] ?? 0.1) * 100,
              );
              const reachSeq = monotonizeReach(rawReach);
              const hasMeasuredData = mergedSteps.some(
                (s) => s.cumulativeReachPct !== undefined,
              );
              // Final-step reach = funnel's overall close rate (the % of
              // the original 100% who become a sale). Per-step CLOSE
              // RATE = finalReach / reachAtStep × 100 — i.e. of the
              // people who reached this step, what % eventually closed.
              // Naturally increases left-to-right because people deeper
              // in the funnel are higher-quality leads. Last step is
              // always 100% (these ARE the closes). Required visual per
              // CLAUDE.md Rule 74. Locked 2026-05-07.
              const finalReach = reachSeq[reachSeq.length - 1] ?? 0;
              return mergedSteps.map((step, i) => {
                const reachPct = Math.round(reachSeq[i] ?? 0);
                const widthPct = 92 - i * 9; // taper visually
                const reachCount = Math.round(enrolled * (reachSeq[i] ?? 0) / 100);
                // Drop-off from previous step (positive number = pp dropped).
                const dropPct =
                  i === 0
                    ? 0
                    : Math.max(0, Math.round((reachSeq[i - 1] ?? 0) - (reachSeq[i] ?? 0)));
                // Close rate for THIS step's audience.
                const closeRatePct =
                  (reachSeq[i] ?? 0) > 0
                    ? Math.round((finalReach / (reachSeq[i] ?? 1)) * 100)
                    : 0;
                const isOpen = openStep === i;
                const isEdited = !!edits[i];
                return (
                  <FunnelStepRow
                    key={i}
                    index={i}
                    step={step}
                    widthPct={widthPct}
                    reachPct={reachPct}
                    reachCount={reachCount}
                    dropPct={dropPct}
                    closeRatePct={closeRatePct}
                    isMeasured={hasMeasuredData}
                    enrolled={enrolled}
                    accentText={funnel.accentText}
                    editable={editable}
                    isOpen={isOpen}
                    isEdited={isEdited}
                    onToggleOpen={() => setOpenStep(isOpen ? null : i)}
                    onUpdate={(patch) => updateStep(i, patch)}
                    onReset={() => resetStep(i)}
                  />
                );
              });
            })()}

            {/* Conversion exit */}
            <div className="mt-2 mb-1 text-slate-600 text-xl">↓</div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-center">
              <div className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold mb-0.5">
                Won · converted
              </div>
              <div className="text-2xl font-black text-emerald-200 tabular-nums">
                {counts.wonCount}
              </div>
            </div>
          </div>
        </div>

        {/* Footnote on reach math — every funnel surface SHIPS the
            per-step bars per Rule 74. When real measurements aren't
            wired yet we render the baseline curve and label it as
            estimate so prospects can tell what's measured. */}
        <div className="px-6 pb-4">
          <p className="text-[11px] text-slate-500 leading-relaxed italic">
            Each step's bar shows cumulative reach — % of the original 100%
            who make it that far. Bars only scale down. The
            <span className="not-italic mx-1 px-1 rounded bg-emerald-500/10 text-emerald-300/90 border border-emerald-500/25">→ X% close</span>
            pill shows what % of the people at THAT step eventually
            became a sale (deeper steps = higher-quality leads). Numbers
            tagged
            <span className="not-italic font-mono mx-1 px-1 rounded bg-slate-800/60 text-slate-400">est. baseline</span>
            use industry-typical attrition; once your funnel has real
            send-by-send data, those flip to measured.
          </p>
        </div>

        {/* Submit message */}
        {submitMsg && (
          <div className="mx-6 mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-200">
            {submitMsg}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-2 border-t border-white/5 px-6 py-4">
          {editable && (
            <button
              type="button"
              onClick={submitFeedback}
              disabled={!canSubmit || submitting}
              className="flex-1 inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Sending…"
                : hasEdits || noteText.trim()
                  ? `Send to BlueJays${hasEdits ? ` (${Object.keys(edits).length} edit${Object.keys(edits).length === 1 ? "" : "s"})` : ""}`
                  : "Send to BlueJays"}
            </button>
          )}
          <Link
            href={landingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-colors"
          >
            View landing page ↗
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="sm:flex-none inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function FunnelEntryNode({
  enrolled,
  accentText,
}: {
  enrolled: number;
  accentText: string;
}) {
  return (
    <div
      className={`w-full max-w-[640px] rounded-xl border border-white/10 bg-black/40 px-5 py-3 text-center`}
    >
      <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">
        Lead capture · landing page
      </div>
      <div className={`text-2xl font-black tabular-nums ${accentText}`}>
        {enrolled}
      </div>
      <div className="text-[10px] text-slate-500 mt-0.5">
        leads enrolled in this funnel
      </div>
    </div>
  );
}

function FunnelStepRow({
  index,
  step,
  widthPct,
  reachPct,
  reachCount,
  dropPct,
  closeRatePct,
  isMeasured,
  accentText,
  editable,
  isOpen,
  isEdited,
  onToggleOpen,
  onUpdate,
  onReset,
}: {
  index: number;
  step: FunnelStepLite;
  widthPct: number;
  reachPct: number;
  reachCount: number;
  /** Percentage-points dropped from previous step (0 for step 1). */
  dropPct: number;
  /** Of the people who REACHED this step, what % eventually closed
   *  as a sale. Derived: finalReach / cumulativeReach[i] × 100.
   *  Naturally monotonically non-decreasing across steps (deeper =
   *  higher-quality lead). Last step always 100%. Required visual
   *  per CLAUDE.md Rule 74 — green pill in the right cluster above
   *  the bar. Locked 2026-05-07. */
  closeRatePct: number;
  /** True when reach data came from real per-step measurements
   *  (cumulativeReachPct on funnel.steps), false when falling back
   *  to the industry-typical baseline curve. Drives the footer label
   *  on the bar so prospects can tell what's measured vs estimated. */
  isMeasured: boolean;
  enrolled: number;
  accentText: string;
  editable: boolean;
  isOpen: boolean;
  isEdited: boolean;
  onToggleOpen: () => void;
  onUpdate: (patch: Partial<FunnelStepLite>) => void;
  onReset: () => void;
}) {
  const emoji = channelEmoji(step.channel);
  const label = channelLabel(step.channel);
  const isVoicemail = step.channel === "voicemail";

  return (
    <div className="w-full flex flex-col items-center">
      {/* connector */}
      <div className="text-slate-700 text-xl my-1">↓</div>

      <div
        className={`rounded-xl border bg-slate-900/70 transition-all ${
          isEdited
            ? "border-amber-500/60"
            : isOpen
              ? "border-amber-400/40"
              : "border-white/10 hover:border-amber-500/30"
        }`}
        style={{ width: `${widthPct}%` }}
      >
        {/* Compact summary row — always visible */}
        <button
          type="button"
          onClick={editable ? onToggleOpen : undefined}
          className={`w-full text-left px-4 py-3 ${editable ? "cursor-pointer" : "cursor-default"}`}
        >
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              {/* Day with up/down arrows when editable */}
              {editable ? (
                <span
                  className="inline-flex items-center gap-0.5 rounded-md bg-black/40 border border-white/10 px-1 py-0.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onUpdate({ day: Math.max(0, step.day - 1) })}
                    className="text-slate-400 hover:text-white px-1 leading-none text-[12px]"
                    aria-label="Decrease day"
                  >
                    ▾
                  </button>
                  <span
                    className={`text-[10px] font-black ${accentText} uppercase tracking-widest tabular-nums px-0.5`}
                  >
                    D{step.day}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdate({ day: step.day + 1 })}
                    className="text-slate-400 hover:text-white px-1 leading-none text-[12px]"
                    aria-label="Increase day"
                  >
                    ▴
                  </button>
                </span>
              ) : (
                <span className={`text-[10px] font-black ${accentText} uppercase tracking-widest shrink-0`}>
                  D{step.day}
                </span>
              )}
              <span className="text-base shrink-0">{emoji}</span>
              <span className="text-xs font-bold text-white shrink-0">
                {label}
              </span>
              {isEdited && (
                <span className="text-[9px] uppercase tracking-wider font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0">
                  edited
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 shrink-0">
              <span className="text-white font-bold tabular-nums">
                ~{reachCount}
              </span>{" "}
              leads
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-snug">{step.label}</p>

          {/* Cumulative-reach bar — REQUIRED on every step row per
              CLAUDE.md Rule 74. Shows what % of the original 100%
              reaches this step, with a yellow→orange gradient fill.
              Bars are guaranteed monotonic (data went through
              monotonizeReach upstream) so they only ever scale down.
              Drop-off pill on the right shows pp lost from previous
              step — the visual answer to "where am I losing people?". */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
                {index === 0 ? "Cumulative reach" : "Reach"}
                {!isMeasured && (
                  <span className="ml-1 normal-case tracking-normal text-slate-600 italic font-normal">
                    · est. baseline
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {dropPct > 0 && (
                  <span className="text-[10px] tabular-nums font-bold text-rose-300/90 bg-rose-500/[0.08] border border-rose-500/20 px-1.5 py-0.5 rounded">
                    −{dropPct} pp
                  </span>
                )}
                {/* Close-rate pill — REQUIRED on every step row per
                    CLAUDE.md Rule 74. Shows what % of people who
                    reached THIS step eventually closed. Naturally
                    monotonically non-decreasing across steps (deeper =
                    higher-quality lead); last step always 100%. */}
                <span className="text-[10px] tabular-nums font-bold text-emerald-300/90 bg-emerald-500/[0.08] border border-emerald-500/25 px-1.5 py-0.5 rounded">
                  → {closeRatePct}% close
                </span>
                <span className="text-xs font-black tabular-nums text-white">
                  {reachPct}%
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${Math.max(0, Math.min(100, reachPct))}%`,
                  background: "linear-gradient(90deg, #facc15 0%, #f97316 100%)",
                }}
              />
            </div>
          </div>
        </button>

        {/* Inline editor — opens on click when editable */}
        {editable && isOpen && (
          <div
            className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Channel selector — pill row */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-500 mb-1.5 block">
                Channel
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CHANNEL_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdate({ channel: c })}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-bold transition-colors ${
                      step.channel === c
                        ? "border-amber-400/60 bg-amber-500/15 text-amber-200"
                        : "border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {channelEmoji(c)} {channelLabel(c)}
                  </button>
                ))}
              </div>
            </div>

            {/* Label / message body */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-500 mb-1.5 block">
                {isVoicemail ? "What this voicemail accomplishes" : "Message label"}
              </label>
              <textarea
                value={step.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                rows={2}
                className="w-full rounded-lg bg-slate-900 border border-white/10 focus:border-amber-400 focus:outline-none px-3 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>

            {/* Voicemail transcript — read-only block, not edited inline.
                Real transcripts live in the Activity tab; this is the
                AI-script preview the prospect hears. */}
            {isVoicemail && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Voicemail transcript</span>
                  <span className="text-slate-600 normal-case font-normal italic tracking-normal">
                    read-only · edit via note
                  </span>
                </div>
                <blockquote className="rounded-lg bg-black/40 border border-white/10 px-3 py-2.5 text-[11px] text-slate-300 leading-relaxed italic">
                  "{deriveTranscript(step)}"
                </blockquote>
              </div>
            )}

            {/* Day input — also fine-grained when arrows aren't enough */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-500">
                  Day
                </label>
                <input
                  type="number"
                  min={0}
                  value={step.day}
                  onChange={(e) => onUpdate({ day: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-16 rounded-md bg-slate-900 border border-white/10 focus:border-amber-400 focus:outline-none px-2 py-1 text-xs text-white tabular-nums"
                />
              </div>
              {isEdited && (
                <button
                  type="button"
                  onClick={onReset}
                  className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-amber-300 underline-offset-2 hover:underline"
                >
                  Revert this step
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "white" | "blue" | "amber" | "emerald";
}) {
  const toneClass: Record<typeof tone, string> = {
    white: "text-white",
    blue: "text-blue-300",
    amber: "text-amber-300",
    emerald: "text-emerald-300",
  };
  return (
    <div className="rounded-md bg-black/30 border border-white/5 px-2 py-1.5 text-center">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div
        className={`text-lg font-black tabular-nums ${toneClass[tone]}`}
      >
        {value}
      </div>
    </div>
  );
}
