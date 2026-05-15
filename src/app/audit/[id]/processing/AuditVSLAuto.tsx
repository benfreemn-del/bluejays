"use client";

/**
 * AuditVSLAuto — auto-playing personalized VSL that runs on the audit-
 * processing page WHILE the audit is being generated. Cycles through
 * 6 frames over ~30 seconds, then loops if the audit is still cooking.
 *
 * Acts as the fallback for the video slot when no real Loom / YouTube
 * URL is set in NEXT_PUBLIC_AUDIT_PROCESSING_VIDEO_URL. The Hormozi
 * spec was "30-sec VSL on audit page that plays while they're getting
 * their audit" — this is the always-on, zero-config version. The
 * second Ben records a real Loom intro (or HeyGen-generated per-
 * prospect explainer), the env var takes over and this component
 * just doesn't render.
 *
 * Per-prospect personalization (when available):
 *   - businessName → first frame uses "Hi, {bizName} owner —"
 *   - category     → frame 4 uses category-specific stat
 *   - firstName    → opener uses "Hi {firstName}" if known
 *
 * Pure CSS animation, no Lottie / video / external runtime — keeps
 * the processing page light and works regardless of network latency.
 */

import { useEffect, useState } from "react";

type Frame = {
  emoji: string;
  headline: string;
  body: string;
};

function buildFrames({
  businessName,
  category,
  firstName,
}: {
  businessName?: string;
  category?: string;
  firstName?: string;
}): Frame[] {
  const biz = businessName || "your business";
  const opener = firstName ? `Hi ${firstName}` : `Hi, ${biz} owner`;
  const cat = (category || "local business").replace(/-/g, " ");

  return [
    {
      emoji: "👋",
      headline: `${opener} —`,
      body: `Your audit is generating right now. While you wait, 30 seconds on what we're actually scoring.`,
    },
    {
      emoji: "🔍",
      headline: "We're checking 4 things on your site",
      body: `Page speed · Mobile usability · Local SEO · Conversion design. The four things Google actually weights when ranking ${cat} sites in your area.`,
    },
    {
      emoji: "💰",
      headline: `78% of ${cat} sites we audit`,
      body: `…lose between $2,000 and $5,000 a month to fixable issues. The audit you're about to see calls them out by name with a dollar value attached.`,
    },
    {
      emoji: "⚡",
      headline: `If we score ${biz} below 60`,
      body: `…I rebuild your site for $997. You see the new version BEFORE you pay. Don't love it, you don't pay a cent. Risk on me, not you.`,
    },
    {
      emoji: "🤝",
      headline: "Real human, not an agency",
      body: `I'm Ben — career in law enforcement, started BlueJays because I watched local owners get burned by web designers who ghost. You'll get my direct phone, my direct email, and the audit you're about to read.`,
    },
    {
      emoji: "✅",
      headline: "Almost there",
      body: `Your audit is finalizing. Scroll down the second you see the report — most owners spend 3-5 minutes reading. The CTAs at the top are real.`,
    },
  ];
}

const FRAME_DURATION_MS = 5000; // 5 sec × 6 frames = 30 sec total

export default function AuditVSLAuto({
  businessName,
  category,
  firstName,
}: {
  businessName?: string;
  category?: string;
  firstName?: string;
}) {
  const frames = buildFrames({ businessName, category, firstName });
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % frames.length);
    }, FRAME_DURATION_MS);
    return () => clearInterval(t);
  }, [frames.length]);

  const frame = frames[idx];
  const progressPct = ((idx + 1) / frames.length) * 100;

  return (
    <div className="mb-6">
      <p className="text-center text-xs uppercase tracking-wider text-sky-400 mb-3">
        Watch this while your audit generates
      </p>
      <div className="relative rounded-2xl border border-sky-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-hidden shadow-2xl">
        {/* Subtle ambient glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(14,165,233,0.18), transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.12), transparent 70%)",
          }}
        />

        {/* Frame content — keyed on idx so React remounts and the
            CSS fade-in animation re-fires on every advance. */}
        <div
          key={idx}
          className="relative aspect-video flex flex-col items-center justify-center px-8 py-8 text-center bl-vsl-frame"
        >
          <div className="text-6xl sm:text-7xl mb-4 bl-vsl-emoji">
            {frame.emoji}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-3 max-w-xl">
            {frame.headline}
          </h3>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
            {frame.body}
          </p>
        </div>

        {/* Bottom progress bar — six segmented pills, current one filled */}
        <div className="relative px-4 pb-4 flex items-center gap-1.5">
          {frames.map((_, i) => (
            <span
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                i === idx
                  ? "bg-sky-400"
                  : i < idx
                    ? "bg-sky-700"
                    : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Below the segmented pills, a thin time progress bar that
            fills as we move through frames. Helps the prospect feel
            time passing instead of staring at a static screen. */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <style jsx>{`
        .bl-vsl-frame {
          animation: bl-vsl-fade-in 0.5s ease-out;
        }
        .bl-vsl-emoji {
          animation: bl-vsl-emoji-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes bl-vsl-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bl-vsl-emoji-pop {
          0% {
            opacity: 0;
            transform: scale(0.6);
          }
          60% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-vsl-frame,
          .bl-vsl-emoji {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
