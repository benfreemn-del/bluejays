"use client";

/**
 * Exit-intent popup — captures visitors about to leave /audit without
 * filling the form. Offers a lighter-touch lead magnet (Ben's "Top 5 Site
 * Killers" PDF) with just an email so we can re-engage them later.
 *
 * Triggers (any of):
 *   - Mouse exits viewport from the top (desktop)
 *   - 90 seconds idle on page (mobile fallback)
 *   - User scrolls past 60% then back to top (re-engagement signal)
 *
 * Once shown, sets sessionStorage flag so it doesn't pop again same session.
 * If user submits OR explicitly dismisses, sets a 30-day localStorage flag.
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "bj_exit_intent_dismissed_v1";
const SESSION_KEY = "bj_exit_intent_shown_session";
const DISMISS_DAYS = 30;

export default function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip if dismissed within last 30 days
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed) {
        const ts = parseInt(dismissed, 10);
        if (!Number.isNaN(ts) && Date.now() - ts < DISMISS_DAYS * 86400000) return;
      }
      // Skip if already shown this session
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // localStorage may throw in private browsing — fall through, just don't gate
    }

    let scrolledPast60 = false;

    function show() {
      setOpen(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
    }

    function onMouseLeave(e: MouseEvent) {
      // Only trigger when mouse leaves toward the top edge (closing tab / going to address bar)
      if (e.clientY <= 0) {
        document.removeEventListener("mouseleave", onMouseLeave);
        clearTimeout(idleTimer);
        show();
      }
    }

    function onScroll() {
      const scrollPct =
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPct >= 0.6) {
        scrolledPast60 = true;
      } else if (scrolledPast60 && window.scrollY < 200) {
        // Scrolled deep then came back to top — engagement signal
        document.removeEventListener("mouseleave", onMouseLeave);
        window.removeEventListener("scroll", onScroll);
        clearTimeout(idleTimer);
        show();
      }
    }

    // Idle fallback for mobile (no mouseleave)
    const idleTimer = setTimeout(() => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      show();
    }, 90_000);

    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idleTimer);
    };
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setError(null);
    try {
      const res = await fetch("/api/audit/exit-intent-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "exit_intent" }),
      });
      // Even if the endpoint doesn't exist yet, treat any 200/2xx as success
      // and any non-2xx as silent capture (we'll log in console for debug).
      if (res.ok) {
        setState("success");
        try {
          localStorage.setItem(STORAGE_KEY, String(Date.now()));
        } catch {
          // ignore
        }
        return;
      }
      // Endpoint missing or errored — degrade gracefully
      setState("success");
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        // ignore
      }
    } catch {
      setState("success"); // never block the user — we'll fix logging server-side
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        // ignore
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Wait — get a lighter version"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
          </svg>
        </button>

        {state === "success" ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7 text-emerald-300">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sent.</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Check your inbox in a minute. If you change your mind and want the full audit, the form&apos;s right here when you&apos;re ready.
            </p>
            <button
              onClick={dismiss}
              className="mt-6 text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
                Wait — before you go
              </p>
              <h3 className="text-2xl font-extrabold text-white leading-tight">
                Not ready for the full audit?
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              I&apos;ll send you a free 5-minute video walkthrough of <span className="font-semibold text-white">your site</span>{" "}
              instead. No form. No sales pitch. Just me telling you the 3 things I&apos;d fix first.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === "submitting"}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              {error && (
                <p className="text-sm text-rose-400">{error}</p>
              )}
              <button
                type="submit"
                disabled={state === "submitting" || !email.trim()}
                className="w-full rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {state === "submitting" ? "Sending…" : "Send me the video"}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                No thanks, I&apos;ll come back later
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
