"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AutoScrollPreview — one large window showcasing the prospect's new site.
 *
 * Uses a full-page thum.io screenshot so we don't have to fight with
 * X-Frame-Options on the preview page. The screenshot auto-scrolls top→bottom
 * on a loop when idle. When the cursor enters the window, auto-scroll pauses
 * and native mouse-wheel scrolling takes over, letting the prospect explore at
 * their own pace. On leave, auto-scroll resumes from the current position.
 *
 * The entire window is clickable — opens the live preview in a new tab so
 * prospects can interact with the real (non-screenshot) site.
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

  // Auto-scroll loop — only runs when not hovered AND image has loaded.
  // Uses requestAnimationFrame for smooth 60fps scrolling that respects
  // the browser's refresh rate. Scroll speed: ~0.5px per frame ≈ 30px/sec,
  // which takes ~60 seconds to traverse a 1800px-tall page. Loops back to
  // the top when it reaches the bottom.
  useEffect(() => {
    if (isHovered || !imgLoaded) return;
    const el = scrollRef.current;
    if (!el) return;

    let raf = 0;
    const step = () => {
      if (!el) return;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      // +0.6px per frame → slow, cinematic scroll
      if (el.scrollTop >= max - 1) {
        el.scrollTop = 0; // loop
      } else {
        el.scrollTop += 0.6;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isHovered, imgLoaded]);

  const screenshotUrl = previewUrl
    ? `https://image.thum.io/get/width/1400/crop/2400/noanimate/png/https://bluejayportfolio.com${previewUrl}`
    : null;

  return (
    <div className="w-full">
      {/* Tiny context line + Before link so prospects still know we're
          comparing against their existing site, without the clunky grid. */}
      <div className="flex items-center justify-between mb-3 px-1 text-sm">
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

      {/* The main preview window. Click anywhere → opens the live preview. */}
      <a
        href={previewUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl border border-sky-500/30 overflow-hidden bg-[#0a0a0a] shadow-[0_0_60px_rgba(14,165,233,0.15)] hover:border-sky-500/60 transition-colors"
        onClick={(e) => { if (!previewUrl) e.preventDefault(); }}
      >
        {/* Browser-chrome-style header — gives it the 'this is a website' feel */}
        <div className="bg-black/80 border-b border-white/5 px-4 py-2.5 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-md px-3 py-1 text-xs text-white/50 font-mono truncate">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7H7v6h6V7z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4m-4 3h4M3 3h18v18H3V3z" />
            </svg>
            <span className="truncate">bluejayportfolio.com{previewUrl || ""}</span>
          </div>
          <span className="text-[10px] text-sky-300/70 uppercase tracking-wider font-bold hidden sm:block">
            Your New Site
          </span>
        </div>

        {/* The scrolling window itself. overflow-y-auto lets users scroll
            with their mouse wheel when hovered; our RAF loop drives the
            auto-scroll when not hovered. */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onWheel={(e) => e.stopPropagation()}
          className="relative overflow-y-auto overflow-x-hidden bg-[#050a14] scrollbar-thin"
          style={{ height: "700px", overscrollBehavior: "contain" }}
        >
          {screenshotUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotUrl}
                alt={`${businessName} website preview`}
                className="w-full h-auto block"
                onLoad={() => setImgLoaded(true)}
                draggable={false}
              />
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#050a14]/90">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin mb-3" />
                    <p className="text-white/50 text-sm">Loading your site preview...</p>
                    <p className="text-white/30 text-xs mt-1">First load takes ~30 seconds</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white/30 text-sm">
              Preview not available
            </div>
          )}

          {/* Hover hint — fades in when mouse enters, fades out after */}
          <div
            className={`pointer-events-none fixed-bottom-pill absolute bottom-4 right-4 rounded-full bg-black/80 backdrop-blur-sm border border-white/15 px-3 py-1.5 text-[11px] text-white/80 transition-opacity ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            Scroll with your mouse · Click to open ↗
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="bg-black/60 border-t border-white/5 px-4 py-2 text-center">
          <p className="text-[11px] text-white/40">
            Preview — images and content will be customized with your real business photos after purchase
          </p>
        </div>
      </a>
    </div>
  );
}
