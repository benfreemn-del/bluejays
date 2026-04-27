"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AuditStatus = "pending" | "generating" | "ready" | "failed" | "cancelled" | "unknown";

/**
 * Convert a share URL into an embed URL. Supports:
 *   - Loom: https://www.loom.com/share/XXXX  →  https://www.loom.com/embed/XXXX
 *   - YouTube watch: youtube.com/watch?v=XXXX  →  youtube.com/embed/XXXX
 *   - YouTube short: youtu.be/XXXX  →  youtube.com/embed/XXXX
 *   - Already-embed URLs pass through.
 *
 * Returns null when the URL doesn't match a supported pattern (so we
 * hide the video slot rather than show a broken iframe).
 */
function toEmbedUrl(raw: string | null): string | null {
  if (!raw) return null;
  const url = raw.trim();
  // Loom share → embed
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-z0-9]+)/i);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
  // YouTube watch
  const ytWatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?rel=0&modestbranding=1`;
  // Direct mp4/webm — render via <video> instead, signal via prefix
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return `direct:${url}`;
  return null;
}

const STAGE_MESSAGES: Record<string, string> = {
  pending: "Audit is queued — kicking it off in a moment…",
  generating: "Reading your site, scoring every section, and finding the conversion leaks. Usually done in 60–90 seconds.",
  ready: "Audit is ready. Redirecting you to your full report…",
  failed: "Something went wrong generating your audit. Email bluejaycontactme@gmail.com and we'll send a real human's review by tomorrow.",
  cancelled: "This audit was cancelled. Email us if this looks wrong.",
  unknown: "Looking up your audit…",
};

// 7-stage Domino's-style tracker. Each stage maps to a percentage of
// the typical ~4-min audit timeline. Stage 0 is "submitted" (immediate),
// stage 6 is "ready" (only set when status flips to 'ready').
//
// Stages match the actual backend pipeline order: fetch → hero (Claude)
// → technical (GPT) → benchmark → synthesis → ready. Hormozi value-eq:
// minimize Time Delay × Effort by anchoring the prospect's expectation
// to a visible, monotonic progress bar.
const TRACKER_STAGES = [
  { key: "submitted",  label: "Submitted",  shortLabel: "Done",    icon: "✓", percentTrigger: 0 },
  { key: "fetch",      label: "Fetching",   shortLabel: "Fetch",   icon: "↓", percentTrigger: 5 },
  { key: "hero",       label: "Hero",       shortLabel: "Hero",    icon: "★", percentTrigger: 25 },
  { key: "technical",  label: "SEO",        shortLabel: "SEO",     icon: "⚙", percentTrigger: 50 },
  { key: "benchmark",  label: "Comparing",  shortLabel: "Compare", icon: "⊕", percentTrigger: 70 },
  { key: "synthesis",  label: "Writing",    shortLabel: "Write",   icon: "✎", percentTrigger: 88 },
  { key: "ready",      label: "Ready",      shortLabel: "Ready",   icon: "🎉", percentTrigger: 100 },
];

const ESTIMATED_TOTAL_SECONDS = 90; // ~60-90s — actual observed audit duration

export default function ProcessingClient({
  auditId,
  videoUrl,
}: {
  auditId: string;
  videoUrl: string | null;
}) {
  const [status, setStatus] = useState<AuditStatus>("pending");
  const [pollCount, setPollCount] = useState(0);
  const [failedReason, setFailedReason] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startedAtRef = useRef<number>(Date.now());
  const redirectedRef = useRef(false);
  const embedUrl = useMemo(() => toEmbedUrl(videoUrl), [videoUrl]);

  // Tick every 1s for smooth progress-bar animation. Cap at 95% until
  // status flips to 'ready' so we never falsely claim done.
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setElapsedSec(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute percentage. When status='ready' it snaps to 100; otherwise
  // it moves linearly toward 95 over ESTIMATED_TOTAL_SECONDS (4 min).
  const pct =
    status === "ready"
      ? 100
      : status === "failed" || status === "cancelled"
        ? 0
        : Math.min(95, Math.round((elapsedSec / ESTIMATED_TOTAL_SECONDS) * 95));

  // Map % to current stage (which dot is "active")
  const currentStageIdx = (() => {
    for (let i = TRACKER_STAGES.length - 1; i >= 0; i--) {
      if (pct >= TRACKER_STAGES[i].percentTrigger) return i;
    }
    return 0;
  })();

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(`/api/audit/${auditId}/status`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        const s = (data.status || "unknown") as AuditStatus;
        setStatus(s);
        setFailedReason(data.failedReason || null);
        setPollCount((c) => c + 1);

        if (s === "ready" && !redirectedRef.current) {
          redirectedRef.current = true;
          // Brief pause so user sees the "ready" state, then redirect
          setTimeout(() => {
            window.location.href = `/audit/${auditId}`;
          }, 1200);
          return;
        }
        if (s === "failed" || s === "cancelled") return;
      } catch {
        if (cancelled) return;
        setStatus("unknown");
      }
      // Re-poll every 5 seconds
      timeout = setTimeout(poll, 5000);
    }

    poll();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [auditId]);

  // Cycle the "what's happening now" copy every 8 seconds.
  // Tone: 3rd-grade, no model names — visitors shouldn't see "Claude" or
  // "GPT" in the loading copy (per Ben — keep the eval engine invisible).
  const stages = [
    "Pulling up your site",
    "Taking a screenshot of your homepage",
    "Reading your headlines + buttons + words",
    "Checking how your site looks on phones",
    "Comparing your site to the best in your industry",
    "Doing the money-leak math",
    "Picking the top 5 fixes that move the needle",
    "Last pass — making sure it's all about you",
  ];
  const stageIdx = Math.min(Math.floor(pollCount / 1.5), stages.length - 1);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-10 pb-40">
      <div className="w-full max-w-2xl">
        {/* Hormozi-mod: pre-frame video on the wait page.
            Renders only when NEXT_PUBLIC_AUDIT_PROCESSING_VIDEO_URL is set
            (Loom share / YouTube / direct mp4). Hidden cleanly otherwise. */}
        {embedUrl && (
          <div className="mb-6">
            <p className="text-center text-xs uppercase tracking-wider text-sky-400 mb-3">
              Watch this while your audit generates
            </p>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden shadow-2xl">
              {embedUrl.startsWith("direct:") ? (
                <video
                  src={embedUrl.replace(/^direct:/, "")}
                  controls
                  preload="metadata"
                  className="w-full aspect-video bg-black"
                />
              ) : (
                <iframe
                  src={embedUrl}
                  title="Audit walkthrough"
                  className="w-full aspect-video"
                  frameBorder={0}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-center">
          {(status === "pending" || status === "generating" || status === "unknown") && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="relative h-20 w-20">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-3">Generating your audit</h1>
              <p className="text-slate-300 mb-6 leading-relaxed">{STAGE_MESSAGES[status]}</p>
              <div className="rounded-md bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm text-sky-300 font-mono">
                {stages[stageIdx]}…
              </div>

              {/* Inline mini progress bar — instant visual feedback even if
                  the user doesn't scroll to see the sticky bottom tracker */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-mono">
                  <span>{TRACKER_STAGES[currentStageIdx].label}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <p className="mt-6 text-xs text-slate-500">
                Your full report opens here the moment it&apos;s done — usually 60–90 seconds. We&apos;ll also email you a copy.
              </p>
            </>
          )}

          {status === "ready" && (
            <>
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-10 w-10">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-3 text-emerald-300">Your audit is ready</h1>
              <p className="text-slate-300">Redirecting you now…</p>
            </>
          )}

          {(status === "failed" || status === "cancelled") && (
            <>
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-10 w-10">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
              <p className="text-slate-300 mb-2">{STAGE_MESSAGES[status]}</p>
              {failedReason && (
                <p className="text-xs text-slate-500 font-mono mt-3">{failedReason}</p>
              )}
              <a
                href="mailto:bluejaycontactme@gmail.com?subject=Audit%20generation%20failed"
                className="mt-6 inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold hover:bg-sky-400 transition-colors"
              >
                Email us
              </a>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Audit ID: <code className="font-mono">{auditId.slice(0, 8)}</code>
        </p>
      </div>

      {/* Sticky bottom 7-stage Domino's-style tracker. Fixed to viewport
          bottom, full-width, always visible while audit generates.
          Hidden on failed/cancelled (page already shows error state). */}
      {(status === "pending" || status === "generating" || status === "unknown" || status === "ready") && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/95 backdrop-blur-md shadow-2xl">
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold">
                Audit progress
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {status === "ready"
                  ? "Done"
                  : elapsedSec < ESTIMATED_TOTAL_SECONDS
                    ? `~${Math.max(5, ESTIMATED_TOTAL_SECONDS - elapsedSec)}s remaining`
                    : "Almost there…"}
              </span>
            </div>

            {/* The track */}
            <div className="relative">
              {/* Connecting line bg */}
              <div className="absolute top-4 left-3 right-3 h-1 bg-slate-800 rounded-full" />
              {/* Connecting line filled */}
              <div
                className="absolute top-4 left-3 h-1 bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `calc(${(currentStageIdx / (TRACKER_STAGES.length - 1)) * 100}% - 6px)`,
                  maxWidth: "calc(100% - 24px)",
                }}
              />
              {/* Dots */}
              <div className="relative flex items-start justify-between">
                {TRACKER_STAGES.map((stage, i) => {
                  const isActive = i === currentStageIdx && status !== "ready";
                  const isComplete = i < currentStageIdx || status === "ready";
                  return (
                    <div key={stage.key} className="flex flex-col items-center">
                      <div
                        className={`relative h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                          isComplete
                            ? "bg-gradient-to-br from-sky-500 to-emerald-400 text-white shadow-lg shadow-sky-500/30"
                            : isActive
                              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/40"
                              : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {isActive && (
                          <span className="absolute inset-0 rounded-full bg-sky-500 animate-ping opacity-30" />
                        )}
                        <span className="relative text-xs">{isComplete ? "✓" : stage.icon}</span>
                      </div>
                      {/* Labels: hidden on mobile, shown on sm+ */}
                      <span
                        className={`hidden sm:block mt-2 text-xs font-medium text-center leading-tight transition-colors duration-300 ${
                          isActive ? "text-sky-300" : isComplete ? "text-emerald-300" : "text-slate-500"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile-only: single active step label centered below track */}
              <div className="sm:hidden mt-3 text-center">
                <span className="text-xs font-semibold text-sky-300">
                  {status === "ready"
                    ? "✓ Ready"
                    : TRACKER_STAGES[currentStageIdx]?.label ?? ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
