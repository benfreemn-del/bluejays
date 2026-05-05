"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * FunnelVisualModal — opens from the portal Funnels tab "View funnel" button.
 *
 * Renders the audience funnel as a vertical, tapering flow so the owner can
 * see at a glance: how many entered, when each touch fires, what the message
 * is, and how the system narrows leads down stage by stage.
 *
 * Receives a slim FunnelDef-shape prop so this stays decoupled from the
 * giant portal page file. Reach percentages are industry-estimate
 * baselines (clearly labeled), not invented stats.
 */

export type FunnelStepLite = {
  day: number;
  channel: "email" | "sms" | "voicemail" | "postcard";
  label: string;
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
const REACH_BASELINE_BY_INDEX = [1.0, 0.85, 0.65, 0.48, 0.34, 0.24, 0.17, 0.12];

export default function FunnelVisualModal({
  isOpen,
  onClose,
  funnel,
  counts,
  landingUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  funnel: FunnelDefLite | null;
  counts: FunnelStageCounts;
  landingUrl: string;
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

  if (!isOpen || !funnel) return null;

  const enrolled = counts.total;

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
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs px-2.5 py-1.5 transition-colors"
            aria-label="Close"
          >
            ✕ Close
          </button>
        </div>

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
          </div>

          {/* Entry node */}
          <div className="flex flex-col items-center">
            <FunnelEntryNode enrolled={enrolled} accentText={funnel.accentText} />

            {funnel.steps.map((step, i) => {
              const reachPct = Math.round(
                (REACH_BASELINE_BY_INDEX[i] ?? 0.1) * 100,
              );
              const widthPct = 92 - i * 9; // taper visually
              const reachCount = Math.round(
                enrolled * (REACH_BASELINE_BY_INDEX[i] ?? 0.1),
              );
              return (
                <FunnelStepRow
                  key={i}
                  index={i}
                  step={step}
                  widthPct={widthPct}
                  reachPct={reachPct}
                  reachCount={reachCount}
                  enrolled={enrolled}
                  accentText={funnel.accentText}
                />
              );
            })}

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

        {/* Footnote on reach math */}
        <div className="px-6 pb-4">
          <p className="text-[11px] text-slate-500 leading-relaxed italic">
            Reach percentages at each step are industry-typical baselines
            (email open + SMS read curves), not measured per-client numbers.
            Real send-by-send reach lands in the Activity tab once the funnel
            is running.
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-2 border-t border-white/5 px-6 py-4">
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
  accentText,
}: {
  index: number;
  step: FunnelStepLite;
  widthPct: number;
  reachPct: number;
  reachCount: number;
  enrolled: number;
  accentText: string;
}) {
  const channelEmoji =
    step.channel === "email"
      ? "✉"
      : step.channel === "sms"
        ? "💬"
        : step.channel === "voicemail"
          ? "🎙"
          : "📮";
  const channelLabel =
    step.channel === "email"
      ? "Email"
      : step.channel === "sms"
        ? "SMS"
        : step.channel === "voicemail"
          ? "Voicemail"
          : "AI Postcard";

  return (
    <div className="w-full flex flex-col items-center">
      {/* connector */}
      <div className="text-slate-700 text-xl my-1">↓</div>

      <div
        className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 transition-all hover:border-amber-500/30"
        style={{ width: `${widthPct}%` }}
      >
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-[10px] font-black ${accentText} uppercase tracking-widest shrink-0`}
            >
              D{step.day}
            </span>
            <span className="text-base shrink-0">{channelEmoji}</span>
            <span className="text-xs font-bold text-white shrink-0">
              {channelLabel}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 shrink-0">
            <span className="text-white font-bold tabular-nums">
              ~{reachCount}
            </span>{" "}
            reach · {reachPct}%
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-snug">{step.label}</p>
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
