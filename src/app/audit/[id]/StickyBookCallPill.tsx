"use client";

import { useEffect, useState } from "react";

/**
 * Floating "Book my call" pill on /audit/[id].
 *
 * The audit results page currently makes the prospect scroll past the
 * score → VSL #2 → FAQ → Top 5 → full ranked list → AuditCTAHub
 * before reaching a calendar CTA. That's 5+ "decisions" between peak
 * emotion (just saw their 0-100 score) and the booking action.
 *
 * Hormozi BAM-FAM rule: at the moment of peak interest, the next click
 * is the calendar. This pill makes that click always one tap away.
 *
 * Behavior:
 *   - Hidden above the fold (first viewport) so it doesn't compete with
 *     the in-flow ProductAuditVideoBlock CTA.
 *   - Fades in when the prospect scrolls past ~80% of the first viewport
 *     and stays pinned until they click it OR dismiss it.
 *   - Auto-hides when AuditCTAHub is visible (avoid stacking two CTAs
 *     for the same offer). Detection: data-cta-hub attribute on the hub.
 *   - Mobile: full-width bottom strip with safe-area inset.
 *   - Desktop: rounded pill bottom-right.
 */

export default function StickyBookCallPill({
  scheduleUrl,
}: {
  /** Full /schedule/[prospectId]?type=fullsystem&source=audit URL */
  scheduleUrl: string;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const viewport = window.innerHeight;
        const threshold = viewport * 0.6;

        // Hide if AuditCTAHub is visible in the viewport — don't double-
        // surface the same offer at the bottom of the page.
        const hub = document.getElementById("pick-your-move");
        let hubInView = false;
        if (hub) {
          const rect = hub.getBoundingClientRect();
          hubInView = rect.top < viewport && rect.bottom > 0;
        }

        setVisible(scrolled > threshold && !hubInView);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <div
      aria-hidden={!visible}
      className={`fixed z-40 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      } bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6`}
    >
      <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 p-1 shadow-2xl shadow-emerald-500/40 sm:gap-2">
        <a
          href={scheduleUrl}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-full bg-slate-950/0 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-950/10 transition-colors"
        >
          <span>📞</span>
          <span>Book my 15-min call</span>
          <span className="hidden sm:inline">→</span>
        </a>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-slate-950/15 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
