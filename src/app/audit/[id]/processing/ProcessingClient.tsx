"use client";

import { useEffect, useRef, useState } from "react";

type AuditStatus = "pending" | "generating" | "ready" | "failed" | "cancelled" | "unknown";

const STAGE_MESSAGES: Record<string, string> = {
  pending: "Audit is queued — kicking it off in a moment…",
  generating: "Our AI is reading your site, comparing to category benchmarks, and finding the conversion leaks. About 3-5 minutes total.",
  ready: "Audit is ready. Redirecting you to your full report…",
  failed: "Something went wrong generating your audit. Email bluejaycontactme@gmail.com and we'll send a real human's review by tomorrow.",
  cancelled: "This audit was cancelled. Email us if this looks wrong.",
  unknown: "Looking up your audit…",
};

export default function ProcessingClient({ auditId }: { auditId: string }) {
  const [status, setStatus] = useState<AuditStatus>("pending");
  const [pollCount, setPollCount] = useState(0);
  const [failedReason, setFailedReason] = useState<string | null>(null);
  const redirectedRef = useRef(false);

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

  // Cycle the "what's happening now" copy every 8 seconds
  const stages = [
    "Fetching your site",
    "Capturing screenshot + extracting key elements",
    "Running hero + positioning analysis (Claude)",
    "Running technical + SEO analysis (GPT-4)",
    "Comparing to your category's gold-standard template",
    "Calculating your money-leak estimate",
    "Synthesizing findings + prioritizing the top 5",
    "Final pass — making sure everything's specific to you",
  ];
  const stageIdx = Math.min(Math.floor(pollCount / 1.5), stages.length - 1);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl">
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
              <p className="mt-6 text-xs text-slate-500">
                Don&apos;t close this tab. We&apos;ll auto-redirect when it&apos;s ready.
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
    </main>
  );
}
