"use client";

import { useEffect, useState } from "react";

/**
 * MadieCelebration — pure-CSS confetti + achievement banner that
 * fires when Madie crosses key thresholds:
 *   - 100 calls today (once per day)
 *   - 3 meetings booked today (once per day)
 *   - First commission of the month (once per month)
 *   - Lap advancement (once per lap)
 *
 * Why pure CSS instead of a library: zero deps, < 5kb, looks fine,
 * Madie's not staring at it long enough to notice it's not Lottie.
 *
 * sessionStorage tracks per-day / per-month / per-lap achievement
 * keys so refreshing the page doesn't re-fire confetti. localStorage
 * persists across sessions so closing the tab + reopening doesn't
 * re-celebrate the same achievement either.
 */

export type CelebrationKind = "calls-100" | "meetings-3" | "commission-first" | "lap-up";

type CelebrationProps = {
  /** Today's calls. Used to detect the 100-cross. */
  callsToday: number;
  /** Today's meetings. Used to detect the 3-cross. */
  meetingsToday: number;
  /** Total commission USD this month. >0 triggers "first commission" once. */
  monthCommissionUsd: number;
  /** Current lap number. Stores prev value, fires confetti on advance. */
  currentLap: number;
};

type CelebrationEvent = {
  kind: CelebrationKind;
  emoji: string;
  headline: string;
  detail: string;
};

const EVENT_LIBRARY: Record<CelebrationKind, Omit<CelebrationEvent, "kind">> = {
  "calls-100": {
    emoji: "📞",
    headline: "100 calls today!",
    detail: "Daily dial goal — hit. Every call past this is bonus territory.",
  },
  "meetings-3": {
    emoji: "📅",
    headline: "3 meetings booked!",
    detail: "Daily meeting goal — done. The pipeline got fed today.",
  },
  "commission-first": {
    emoji: "💰",
    headline: "First commission of the month!",
    detail: "Streak started. The next one tends to come faster — momentum compounds.",
  },
  "lap-up": {
    emoji: "🚀",
    headline: "Lap unlocked!",
    detail: "New skill open · new commission ceiling. Take it at your own pace.",
  },
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function alreadyCelebrated(kind: CelebrationKind, suffix: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(`bj_celebrated_${kind}_${suffix}`) === "1";
  } catch {
    return false;
  }
}
function markCelebrated(kind: CelebrationKind, suffix: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`bj_celebrated_${kind}_${suffix}`, "1");
  } catch {
    /* localStorage disabled; no-op */
  }
}

export default function MadieCelebration({
  callsToday,
  meetingsToday,
  monthCommissionUsd,
  currentLap,
}: CelebrationProps) {
  const [active, setActive] = useState<CelebrationEvent | null>(null);
  const [prevLap, setPrevLap] = useState<number | null>(null);

  // Detect threshold crosses + fire celebration if not already shown.
  useEffect(() => {
    // Calls — 100 today, once per day
    if (callsToday >= 100) {
      const suffix = todayKey();
      if (!alreadyCelebrated("calls-100", suffix)) {
        setActive({ kind: "calls-100", ...EVENT_LIBRARY["calls-100"] });
        markCelebrated("calls-100", suffix);
        return;
      }
    }
    // Meetings — 3 today, once per day
    if (meetingsToday >= 3) {
      const suffix = todayKey();
      if (!alreadyCelebrated("meetings-3", suffix)) {
        setActive({ kind: "meetings-3", ...EVENT_LIBRARY["meetings-3"] });
        markCelebrated("meetings-3", suffix);
        return;
      }
    }
    // First commission of month, once per month
    if (monthCommissionUsd > 0) {
      const suffix = monthKey();
      if (!alreadyCelebrated("commission-first", suffix)) {
        setActive({
          kind: "commission-first",
          ...EVENT_LIBRARY["commission-first"],
        });
        markCelebrated("commission-first", suffix);
        return;
      }
    }
    // Lap advancement — store + compare to detect cross
    if (prevLap == null) {
      setPrevLap(currentLap);
    } else if (currentLap > prevLap) {
      const suffix = `lap${currentLap}`;
      if (!alreadyCelebrated("lap-up", suffix)) {
        setActive({ kind: "lap-up", ...EVENT_LIBRARY["lap-up"] });
        markCelebrated("lap-up", suffix);
      }
      setPrevLap(currentLap);
    }
  }, [callsToday, meetingsToday, monthCommissionUsd, currentLap, prevLap]);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(null), 6000);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none flex justify-center px-4 pt-4">
      {/* Banner (clickable to dismiss) */}
      <div
        className="pointer-events-auto rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-br from-emerald-500/30 via-violet-500/20 to-fuchsia-500/30 backdrop-blur-md shadow-[0_8px_40px_rgba(16,185,129,0.4)] px-6 py-4 max-w-md flex items-center gap-4 cursor-pointer animate-bj-celebrate-in"
        onClick={() => setActive(null)}
        role="alert"
      >
        <div className="text-5xl shrink-0 animate-bj-celebrate-bounce">
          {active.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-black text-white leading-tight">
            🎉 {active.headline}
          </p>
          <p className="text-sm text-emerald-100 leading-snug mt-0.5">
            {active.detail}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActive(null)}
          className="text-emerald-100/60 hover:text-white text-xl leading-none shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Confetti — 32 colored squares falling. Pure CSS. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden"
      >
        {Array.from({ length: 32 }).map((_, i) => {
          const left = (i * 100) / 32 + (i % 7) * 1.3;
          const delay = (i % 11) * 0.18;
          const duration = 2.4 + (i % 5) * 0.4;
          const palette = [
            "#a855f7",
            "#ec4899",
            "#22c55e",
            "#eab308",
            "#3b82f6",
            "#f97316",
            "#06b6d4",
          ];
          const color = palette[i % palette.length];
          const rotate = (i * 47) % 360;
          return (
            <span
              key={i}
              className="bj-confetti"
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                background: color,
                transform: `rotate(${rotate}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes bj-confetti-fall {
          0% {
            transform: translateY(-12vh) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          85% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(112vh) rotate(720deg);
            opacity: 0;
          }
        }
        .bj-confetti {
          position: absolute;
          top: 0;
          width: 8px;
          height: 14px;
          border-radius: 2px;
          animation: bj-confetti-fall linear forwards;
        }
        @keyframes bj-celebrate-in {
          0% {
            transform: translateY(-30px) scale(0.92);
            opacity: 0;
          }
          60% {
            transform: translateY(4px) scale(1.04);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-bj-celebrate-in {
          animation: bj-celebrate-in 450ms cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
        }
        @keyframes bj-celebrate-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-6px) scale(1.08); }
          50% { transform: translateY(0) scale(1); }
          75% { transform: translateY(-4px) scale(1.04); }
        }
        .animate-bj-celebrate-bounce {
          animation: bj-celebrate-bounce 1.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-bj-celebrate-in,
          .animate-bj-celebrate-bounce,
          .bj-confetti {
            animation: none !important;
          }
          .bj-confetti {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
