"use client";

/**
 * ExitIntentModal — triggers when a claim-page visitor's cursor moves
 * toward the top of the viewport (heading to the close button/tab).
 * Offers to send a reminder email in 3 days so lapsed visitors aren't
 * lost forever.
 *
 * Trigger logic (desktop only — mobile doesn't have cursor exit intent):
 *   - Once per session (localStorage flag per prospect)
 *   - Only after the visitor has been on the page > 10s
 *   - Mouse leaves the viewport top edge (clientY <= 0)
 *
 * Hidden in ?embed=1 and on mobile (touch devices have no exit-intent
 * equivalent — a back-button press is a harder signal to catch).
 */

import { useEffect, useRef, useState } from "react";

export default function ExitIntentModal({ prospectId }: { prospectId: string }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const shownRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Bail on touch / small screens — no cursor exit-intent.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    // Bail in embed mode (screenshots, iframes).
    if (new URLSearchParams(window.location.search).get("embed") === "1") return;

    // One-shot per session per prospect.
    const key = `exit_modal_shown_${prospectId}`;
    if (localStorage.getItem(key) === "1") return;

    const start = Date.now();

    const handleMouseLeave = (e: MouseEvent) => {
      if (shownRef.current) return;
      if (Date.now() - start < 10_000) return;  // let them read first
      if (e.clientY > 0) return;                // only top-edge exits
      shownRef.current = true;
      setOpen(true);
      try {
        localStorage.setItem(key, "1");
      } catch {}
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [prospectId]);

  const scheduleReminder = async () => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/leads/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, reminderDays: 3 }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("ok");
        setTimeout(() => setOpen(false), 2200);
      } else {
        setState("err");
        setErrorMessage(data.error || "Something went wrong.");
      }
    } catch {
      setState("err");
      setErrorMessage("Network error. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 text-white/50 hover:text-white"
        >
          ×
        </button>

        {state === "ok" ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
              <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-white text-lg font-semibold">Got it.</p>
            <p className="mt-1 text-sm text-white/60">
              I&apos;ll send a reminder in 3 days.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-400 font-semibold">
              Before you go —
            </p>
            <h2 className="mt-3 text-2xl font-bold text-white leading-tight">
              Want a reminder in 3 days?
            </h2>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              Your preview stays live for 30 days. If you&apos;re not ready
              now, I&apos;ll email you once in 3 days so you don&apos;t lose
              track. One email, no follow-up spam.
            </p>

            {errorMessage && (
              <p className="mt-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                {errorMessage}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={scheduleReminder}
                disabled={submitting}
                className="flex-1 h-11 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-sm font-semibold text-white transition-colors"
              >
                {submitting ? "Scheduling..." : "Yes, send a reminder"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                No thanks
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] uppercase tracking-wider text-white/30">
              Reply STOP to any email anytime
            </p>
          </>
        )}
      </div>
    </div>
  );
}
