"use client";

/**
 * 10,000-hour rule meter — visual countdown to mastery based on the
 * "currentWeeklyHours" slider value. Refactored out of the old
 * character.tsx so it can mount in two places now:
 *
 *   1. Compact strip at the top of the Build Your Player page
 *      (visible across every builder substep so the parent watches it
 *      change as they adjust hours)
 *   2. Big hero version on the "hours / week" sub-step, where it's
 *      the focal point of the question
 *
 * Math:
 *   annualHours = currentWeeklyHours * 52
 *   yearsToMastery = currentWeeklyHours > 0 ? 10000 / annualHours : null
 *   barFillPct = min((annualHours / 5000) * 100, 100)
 *
 * 5000 hrs/yr is full-bar (~95 hrs/wk — pro athlete ceiling). Most
 * youth players land at 5-15 hrs/wk → 50-150 yrs to 10K (i.e. way too
 * slow without a TEKKY-style accelerator). Hence the up-sell hook.
 */

const LIME = "#a3e635";

function tierForSkill(level: number): { name: string; color: string } {
  // Same 5-tier mapping the avatar lookup uses, kept inline so this
  // component can render standalone without importing tekky-avatars.ts.
  if (level <= 1) return { name: "Rec", color: "#7dd3fc" };
  if (level <= 2) return { name: "Travel", color: "#f87171" };
  if (level <= 3) return { name: "Club", color: "#a78bfa" };
  if (level <= 4) return { name: "ECNL / MLS Next", color: "#fbbf24" };
  return { name: "Elite", color: LIME };
}

export function TenKHourMeter({
  currentWeeklyHours,
  skillLevel,
  size = "compact",
}: {
  currentWeeklyHours: number;
  skillLevel: number;
  /** "compact" = top-strip width-constrained band.
   *  "hero"    = big focal version for the hours sub-step. */
  size?: "compact" | "hero";
}) {
  const tier = tierForSkill(skillLevel);
  const annualHours = currentWeeklyHours * 52;
  const yearsToMastery =
    currentWeeklyHours > 0 ? 10000 / annualHours : null;
  const barFillPct = Math.min((annualHours / 5000) * 100, 100);

  if (size === "hero") {
    // Big, dominates the screen. Used on the final builder substep so
    // the parent SEES "29 years to mastery at 7 hrs/wk → 7 years at
    // 27 hrs/wk" while they drag the slider.
    return (
      <div
        className="rounded-2xl border-2 p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(10,24,50,0.85) 0%, rgba(5,13,31,0.95) 100%)",
          borderColor: `${tier.color}66`,
        }}
      >
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div
            className="text-[11px] sm:text-[13px] tracking-[0.32em] uppercase font-extrabold"
            style={{ color: tier.color }}
          >
            ⏱ The 10,000-hour rule
          </div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/45">
            Malcolm Gladwell · "Outliers"
          </div>
        </div>

        {/* Headline number — yearsToMastery, big as we can go */}
        <div className="flex items-baseline gap-3 mb-4 flex-wrap">
          {yearsToMastery === null ? (
            <span className="text-3xl sm:text-5xl font-black text-white/40 tracking-tighter">
              — add hours →
            </span>
          ) : yearsToMastery > 50 ? (
            <>
              <span
                className="text-5xl sm:text-7xl font-black tracking-tighter tabular-nums"
                style={{ color: tier.color }}
              >
                {yearsToMastery.toFixed(0)}
              </span>
              <span className="text-base sm:text-xl font-bold text-white/70">
                years to 10,000 hrs of practice
              </span>
            </>
          ) : (
            <>
              <span
                className="text-5xl sm:text-7xl font-black tracking-tighter tabular-nums"
                style={{ color: tier.color }}
              >
                {yearsToMastery.toFixed(1)}
              </span>
              <span className="text-base sm:text-xl font-bold text-white/70">
                years to 10,000 hrs of practice
              </span>
            </>
          )}
        </div>

        {/* Progress bar (big) */}
        <div className="h-3 sm:h-4 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${barFillPct}%`,
              background: `linear-gradient(90deg, ${tier.color} 0%, white 100%)`,
            }}
          />
        </div>

        {/* Footer stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-white/45">
              Right now
            </div>
            <div className="text-2xl font-black tabular-nums text-white">
              {currentWeeklyHours}
              <span className="text-base text-white/50 font-normal ml-1">
                hrs / week
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-white/45">
              That's about
            </div>
            <div className="text-2xl font-black tabular-nums text-white">
              {annualHours.toLocaleString()}
              <span className="text-base text-white/50 font-normal ml-1">
                hrs / year
              </span>
            </div>
          </div>
        </div>

        <p className="mt-5 pt-4 border-t border-white/10 text-[12px] sm:text-sm text-white/65 leading-relaxed italic">
          The TEKKY shortcut: smaller surface = more touches per minute.
          One TEKKY hour = roughly{" "}
          <strong className="text-white">2.4 regulation-ball hours</strong> of
          technical reps. Drag the slider — watch the curve.
        </p>
      </div>
    );
  }

  // Compact — top-of-page strip. Always visible, narrow, monospaced.
  return (
    <div
      className="rounded-md border px-3 py-2 flex items-center gap-3"
      style={{
        background: "rgba(5,13,31,0.6)",
        borderColor: `${tier.color}55`,
      }}
    >
      <div
        className="text-[9px] tracking-[0.32em] uppercase font-extrabold shrink-0"
        style={{ color: tier.color }}
      >
        ⏱ 10K-hr rule
      </div>
      <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${barFillPct}%`,
            background: `linear-gradient(90deg, ${tier.color} 0%, white 100%)`,
          }}
        />
      </div>
      <div className="text-[11px] font-bold tabular-nums shrink-0 text-right">
        {yearsToMastery === null ? (
          <span className="text-white/40">add hours →</span>
        ) : yearsToMastery > 50 ? (
          <span className="text-white/55">
            <span className="text-white">{yearsToMastery.toFixed(0)}</span> yrs
            to mastery
          </span>
        ) : (
          <span className="text-white/55">
            <span className="text-white">{yearsToMastery.toFixed(1)}</span> yrs
            to mastery
          </span>
        )}
      </div>
    </div>
  );
}

export default TenKHourMeter;
