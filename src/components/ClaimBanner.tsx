"use client";
/**
 * ClaimBanner — shared sticky bottom bar shown on all portfolio preview pages.
 *
 * Mobile behaviour (< md):
 *   • Slim single-row bar (≈ 52 px) pinned to the bottom of the viewport.
 *   • Shows business name + "Claim" CTA button.
 *   • A "^" chevron lets the user expand it to see the full detail row.
 *   • An "×" dismiss button collapses it to a tiny pill so it never fully
 *     blocks content.
 *
 * Desktop behaviour (≥ md):
 *   • Two-row layout: status ticker on top, full CTA row below.
 *   • No dismiss — always visible.
 */

import { useState, useEffect } from "react";

interface ClaimBannerProps {
  businessName: string;
  accentColor: string;
  prospectId: string;
  /** Optional dark/light override for the ticker row background. */
  darkBg?: boolean;
}

export default function ClaimBanner({
  businessName,
  accentColor,
  prospectId,
  darkBg = true,
}: ClaimBannerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  /** Whether the mobile banner is minimised to a tiny pill. */
  const [minimised, setMinimised] = useState(false);
  /** Whether the mobile banner is expanded to show the full detail row. */
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    const tick = () => {
      const diff = expiry.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  const claimHref = `/claim/${prospectId}`;
  const tickerBg = darkBg ? "bg-[#111]/90" : "bg-white/90";
  const tickerBorder = darkBg ? "border-white/10" : "border-black/10";
  const tickerText = darkBg ? "text-slate-400" : "text-slate-600";

  /* ─── Minimised pill (mobile only) ─── */
  if (minimised) {
    return (
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setMinimised(false)}
          className="flex items-center gap-2 h-10 px-4 rounded-full text-white text-xs font-bold shadow-xl"
          style={{ background: accentColor }}
          aria-label="Expand claim banner"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-white/80 animate-pulse" />
          Claim Site
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* ── Mobile slim bar ── */}
      <div className="md:hidden">
        {/* Expanded detail row (shown when user taps "^") */}
        {expanded && (
          <div
            className="px-4 py-2.5 flex items-center justify-between gap-3 border-t"
            style={{
              background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}12)`,
              borderColor: `${accentColor}35`,
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Built for {businessName}
              </p>
              {timeLeft && timeLeft !== "EXPIRED" && (
                <p className="text-[10px] font-bold mt-0.5" style={{ color: accentColor }}>
                  Expires in {timeLeft}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Slim primary row */}
        <div
          className={`${tickerBg} backdrop-blur-sm border-t ${tickerBorder} px-3 flex items-center justify-between gap-2 h-[52px]`}
        >
          {/* Left: status dot + business name */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="inline-block shrink-0 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className={`text-xs ${tickerText} truncate`}>
              {businessName}
            </span>
          </div>

          {/* Right: CTA + expand + dismiss */}
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={claimHref}
              className="h-9 px-4 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
              style={{ background: accentColor }}
            >
              Claim
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <button
              onClick={() => setExpanded((v) => !v)}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${tickerText} hover:text-white transition-colors`}
              aria-label={expanded ? "Collapse details" : "Expand details"}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
            <button
              onClick={() => setMinimised(true)}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${tickerText} hover:text-white transition-colors`}
              aria-label="Minimise banner"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop full banner ── */}
      <div className="hidden md:block">
        {/* Status ticker */}
        <div className={`${tickerBg} backdrop-blur-sm border-t ${tickerBorder} px-4 py-2 flex items-center justify-center gap-4`}>
          <p className={`text-xs ${tickerText}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
            Custom-built preview for this business
          </p>
          {timeLeft && timeLeft !== "EXPIRED" && (
            <p className="text-xs font-bold" style={{ color: accentColor }}>
              Preview expires in {timeLeft}
            </p>
          )}
        </div>

        {/* CTA row */}
        <div
          className="px-6 py-4 flex items-center justify-between gap-4"
          style={{
            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
            borderTop: `1px solid ${accentColor}30`,
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              This website was built for {businessName}
            </p>
            <p className={`text-xs ${tickerText}`}>
              Claim it before we offer it to a competitor
            </p>
          </div>
          <a
            href={claimHref}
            className="shrink-0 h-11 px-6 rounded-full text-white text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all duration-300 shadow-md"
            style={{ background: accentColor }}
          >
            Claim Your Website
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
