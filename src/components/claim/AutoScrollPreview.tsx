"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AutoScrollPreview — one large browser-chrome-style window showcasing the
 * prospect's new site as a long full-page screenshot.
 *
 * Desktop: auto-scrolls top→bottom slowly while idle. Hover pauses the loop
 * and native mouse-wheel scrolling takes over. Leaving the window resumes
 * auto-scroll from wherever they left off.
 *
 * Mobile / touch: auto-scroll is disabled entirely — users expect to swipe
 * to explore. Touching the image pauses any residual animation; lifting
 * the finger lets the browser's native momentum scroll do its job.
 *
 * The scroll area is NOT a link. An explicit "Open full site ↗" button in
 * the browser-chrome header handles navigation, so tap-to-scroll on mobile
 * doesn't accidentally navigate away mid-swipe.
 */
export default function AutoScrollPreview({
  previewUrl,
  currentWebsite,
  businessName,
}: {
  previewUrl?: string;
  currentWebsite?: string;
  businessName: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasHoverCapability, setHasHoverCapability] = useState(false);

  // Only run auto-scroll on devices with a real mouse pointer. Touch devices
  // get a static screenshot they can swipe through naturally.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHasHoverCapability(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Auto-scroll loop — desktop only, idle only.
  useEffect(() => {
    if (!hasHoverCapability || isHovered || !imgLoaded) return;
    const el = scrollRef.current;
    if (!el) return;

    let raf = 0;
    const step = () => {
      if (!el) return;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      if (el.scrollTop >= max - 1) {
        el.scrollTop = 0; // loop back to top
      } else {
        el.scrollTop += 0.6; // ~36px/sec at 60fps
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [hasHoverCapability, isHovered, imgLoaded]);

  // thum.io fullpage option captures the ENTIRE rendered height of the
  // preview page (no crop), so long sites — hero, services, about,
  // testimonials, pricing, contact, footer — are all scrollable inside
  // our window instead of being cut off at 2400px.
  const screenshotUrl = previewUrl
    ? `https://image.thum.io/get/width/1400/fullpage/noanimate/png/https://bluejayportfolio.com${previewUrl}`
    : null;

  const absolutePreviewUrl = previewUrl ? `https://bluejayportfolio.com${previewUrl}` : "#";

  return (
    <div className="w-full">
      {/* Context line + their current site link */}
      <div className="flex items-center justify-between mb-3 px-1 text-sm flex-wrap gap-2">
        <span className="text-white/50">
          Custom website for <span className="text-white/80 font-medium">{businessName}</span>
        </span>
        {currentWebsite ? (
          <a
            href={currentWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 text-xs underline underline-offset-2 transition-colors"
          >
            See your current site ↗
          </a>
        ) : null}
      </div>

      <div className="rounded-2xl border border-sky-500/30 overflow-hidden bg-[#0a0a0a] shadow-[0_0_60px_rgba(14,165,233,0.15)]">
        {/* Browser-chrome header — window dots + URL bar + explicit open button */}
        <div className="bg-black/80 border-b border-white/5 px-3 sm:px-4 py-2.5 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-md px-3 py-1 text-xs text-white/50 font-mono truncate min-w-0">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="truncate">bluejayportfolio.com{previewUrl || ""}</span>
          </div>
          <a
            href={absolutePreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-md bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
          >
            Open full site
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Scroll area — explicitly NOT a link so tap-to-scroll doesn't navigate */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onWheel={(e) => e.stopPropagation()}
          className="relative overflow-y-auto overflow-x-hidden bg-[#050a14]"
          style={{
            height: "700px",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {screenshotUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotUrl}
                alt={`${businessName} website preview`}
                className="w-full h-auto block select-none"
                onLoad={() => setImgLoaded(true)}
                draggable={false}
              />
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#050a14]/95">
                  <div className="text-center px-6">
                    <div className="inline-block w-10 h-10 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin mb-4" />
                    <p className="text-white/70 text-base font-medium">Loading your site preview…</p>
                    <p className="text-white/40 text-xs mt-2">First load takes ~30 seconds. Subsequent loads are instant.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white/30 text-sm">
              Preview not available
            </div>
          )}

          {/* Hover hint — desktop only, fades in on mouse enter */}
          {hasHoverCapability && imgLoaded && (
            <div
              className={`pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/80 backdrop-blur-sm border border-white/15 px-3 py-1.5 text-[11px] text-white/80 transition-opacity ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              Scroll with your mouse
            </div>
          )}

          {/* Touch hint — mobile only, shown briefly */}
          {!hasHoverCapability && imgLoaded && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/80 backdrop-blur-sm border border-white/15 px-3 py-1.5 text-[11px] text-white/80">
              Swipe to explore
            </div>
          )}
        </div>

        {/* Footer disclaimer */}
        <div className="bg-black/60 border-t border-white/5 px-4 py-2 text-center">
          <p className="text-[11px] text-white/40">
            Preview — images and content will be customized with your real business photos after purchase
          </p>
        </div>
      </div>
    </div>
  );
}
