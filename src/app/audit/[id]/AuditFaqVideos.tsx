"use client";

import { useState } from "react";
import {
  AUDIT_FAQ_ENTRIES,
  countRecordedFaqVideos,
  type AuditFaqEntry,
} from "@/lib/audit-faq-data";

/**
 * AuditFaqVideos — top-5-objection FAQ video strip on the audit
 * results page. Mounted between ProductAuditVideoBlock (the main
 * 2-min pitch) and the Top-5 fixes section.
 *
 * Per 116-Funnels chunk 13a — pre-call FAQ videos handle objections
 * BEFORE the prospect hits Calendly. Quoted "up to 40% show-rate lift."
 *
 * Behavior:
 *  - Each entry renders as an expandable card with the objection as
 *    the headline (Brunson HSO hook altitude)
 *  - When `videoUrl` is null → renders the script transcript inline
 *    (still useful as belief-rewrite copy; SEO + a11y wins)
 *  - When `videoUrl` is set → renders a Loom / MP4 embed above the
 *    transcript (transcript collapses to "Read aloud transcript ▾")
 *  - Mobile-first, accordion pattern (one expanded at a time, soft
 *    swap on click)
 *
 * To wire a video: edit `src/lib/audit-faq-data.ts`. No changes
 * needed here.
 */

function FaqCard({
  entry,
  isOpen,
  onToggle,
}: {
  entry: AuditFaqEntry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasVideo = entry.videoUrl !== null;
  // Detect Loom URL — embed pattern is /embed/<id> instead of /share/<id>
  const isLoom =
    typeof entry.videoUrl === "string" && entry.videoUrl.includes("loom.com");
  const loomEmbedSrc = isLoom
    ? (entry.videoUrl as string).replace("/share/", "/embed/")
    : null;

  return (
    <div
      className={`rounded-2xl border transition-colors ${
        isOpen
          ? "border-amber-500/40 bg-amber-500/[0.04]"
          : "border-white/[0.08] bg-slate-900/40 hover:border-white/15"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start gap-3"
        aria-expanded={isOpen}
        aria-controls={`faq-${entry.id}-body`}
      >
        <span
          className={`mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
            hasVideo
              ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
              : "bg-slate-800/80 text-slate-400 border border-white/10"
          }`}
          aria-hidden
        >
          {hasVideo ? "▶" : "?"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm md:text-base leading-snug">
            {entry.shortLabel ?? entry.question}
          </div>
          <div className="text-[12px] text-slate-400 mt-0.5 leading-snug">
            {entry.beliefRewrite}
          </div>
        </div>
        <span
          className={`mt-1 text-slate-400 text-lg transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          id={`faq-${entry.id}-body`}
          className="px-5 pb-5 pt-1 border-t border-white/[0.06]"
        >
          {/* Video embed when URL is set — falls through to script-
              only otherwise. Loom URLs auto-rewrite to /embed/ form. */}
          {hasVideo && (
            <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-black aspect-video">
              {loomEmbedSrc ? (
                <iframe
                  src={loomEmbedSrc}
                  title={entry.question}
                  allow="fullscreen"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <video
                  src={entry.videoUrl as string}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full"
                />
              )}
            </div>
          )}

          {/* Transcript — always rendered. When video exists, it's
              "read-aloud transcript". When video missing, it IS the
              belief-rewrite layer until Ben records. */}
          <div className="mt-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2 font-semibold">
              {hasVideo ? "📜 Read-aloud transcript" : "📜 Script (video coming soon)"}
            </div>
            <p className="text-[13px] md:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {entry.transcript}
            </p>
          </div>

          {/* Single CTA per card — points at the Calendly handoff
              on the main pitch video block (same Calendly URL,
              consistent destination across the page). */}
          <div className="mt-4">
            <a
              href="#pick-your-move"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
            >
              Schedule a 15-min call →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditFaqVideos() {
  // Accordion state — one expanded at a time. Default to the first
  // (highest-impact "is $10k just a website" objection).
  const [openId, setOpenId] = useState<string | null>(AUDIT_FAQ_ENTRIES[0]?.id ?? null);

  const recordedCount = countRecordedFaqVideos();
  const totalCount = AUDIT_FAQ_ENTRIES.length;

  return (
    <section
      id="faq-objections"
      className="border-b border-white/5 bg-slate-950/40"
    >
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        {/* Section header */}
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300 font-bold mb-2">
            Before you book a call
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
            5 questions every business owner asks me first
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Got an objection in mind? It&apos;s probably one of these. Tap to read
            (or watch — videos rolling out as I record them).
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-2.5">
          {AUDIT_FAQ_ENTRIES.map((entry) => (
            <FaqCard
              key={entry.id}
              entry={entry}
              isOpen={openId === entry.id}
              onToggle={() => setOpenId((prev) => (prev === entry.id ? null : entry.id))}
            />
          ))}
        </div>

        {/* Recording-progress footer — visible to Ben + a transparency
            signal to prospects (we tell them the videos are rolling
            out as recorded; honesty reads as competence per 116-Funnels
            chunk 5 proof-over-guarantees). When all 5 are recorded
            this banner switches to a "watch them all" CTA instead. */}
        {recordedCount < totalCount ? (
          <p className="mt-6 text-center text-[11px] text-slate-500 italic">
            {recordedCount} of {totalCount} videos recorded so far ·
            transcripts available for the rest
          </p>
        ) : (
          <p className="mt-6 text-center text-[11px] text-amber-300/80 font-semibold">
            ✓ All {totalCount} objection-handling videos available
          </p>
        )}
      </div>
    </section>
  );
}
