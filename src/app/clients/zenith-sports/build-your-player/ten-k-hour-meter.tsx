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

/** Multiplier applied to non-TEKKY training hours when computing the
 *  "with TEKKY" track. Smaller surface = more touches per minute, so
 *  every hour produces ~2.4× the technical reps of a regulation ball.
 *  Tunable here in one place. */
const TEKKY_MULTIPLIER = 2.4;

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

  // "With TEKKY" track — applies the touches-per-minute multiplier.
  // Same hours of practice produce more technical reps because the
  // smaller surface forces precision. yearsToMastery shrinks
  // proportionally; bar fills faster.
  const tekkyAnnualHours = annualHours * TEKKY_MULTIPLIER;
  const tekkyYearsToMastery =
    currentWeeklyHours > 0 ? 10000 / tekkyAnnualHours : null;
  const tekkyBarFillPct = Math.min((tekkyAnnualHours / 5000) * 100, 100);
  // Years saved if the parent switches. Used in the headline copy
  // so the difference is concrete, not abstract.
  const yearsSaved =
    yearsToMastery !== null && tekkyYearsToMastery !== null
      ? yearsToMastery - tekkyYearsToMastery
      : null;

  if (size === "hero") {
    // Big, dominates the screen. Used on the final builder substep.
    // Now shows TWO tracks side-by-side so the parent visualizes the
    // gap between practicing on a regulation ball vs the TEKKY:
    //   · Without TEKKY (slate bar) — straight hours × 52
    //   · With TEKKY (lime bar)     — × 2.4 multiplier
    return (
      <div
        className="rounded-2xl border-2 p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(10,24,50,0.85) 0%, rgba(5,13,31,0.95) 100%)",
          borderColor: `${tier.color}66`,
        }}
      >
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
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

        {/* WITHOUT TEKKY track */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-400">
              ⚪ Without TEKKY · regulation ball
            </div>
            {yearsToMastery !== null && (
              <div className="text-[10px] uppercase tracking-wider text-slate-400 tabular-nums">
                {annualHours.toLocaleString()} hrs / yr
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            {yearsToMastery === null ? (
              <span className="text-2xl sm:text-3xl font-black text-white/40 tracking-tighter">
                — add hours →
              </span>
            ) : (
              <>
                <span className="text-4xl sm:text-6xl font-black tracking-tighter tabular-nums text-slate-300">
                  {yearsToMastery > 50
                    ? yearsToMastery.toFixed(0)
                    : yearsToMastery.toFixed(1)}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-400">
                  yrs to 10,000 hrs
                </span>
              </>
            )}
          </div>
          <div className="h-3 sm:h-4 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${barFillPct}%`,
                background: "linear-gradient(90deg, #475569 0%, #94a3b8 100%)",
              }}
            />
          </div>
        </div>

        {/* WITH TEKKY track — taller + lime so the eye lands here */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <div
              className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-extrabold"
              style={{ color: tier.color }}
            >
              ⚽ With TEKKY · same hours, more reps
            </div>
            {tekkyYearsToMastery !== null && (
              <div
                className="text-[10px] uppercase tracking-wider tabular-nums"
                style={{ color: tier.color }}
              >
                {tekkyAnnualHours.toLocaleString()} effective hrs / yr
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            {tekkyYearsToMastery === null ? (
              <span className="text-2xl sm:text-3xl font-black text-white/40 tracking-tighter">
                — add hours →
              </span>
            ) : (
              <>
                <span
                  className="text-5xl sm:text-7xl font-black tracking-tighter tabular-nums"
                  style={{ color: tier.color }}
                >
                  {tekkyYearsToMastery > 50
                    ? tekkyYearsToMastery.toFixed(0)
                    : tekkyYearsToMastery.toFixed(1)}
                </span>
                <span className="text-base sm:text-xl font-bold text-white/85">
                  yrs to 10,000 hrs
                </span>
              </>
            )}
          </div>
          <div className="h-4 sm:h-5 bg-white/[0.06] rounded-full overflow-hidden ring-1 ring-white/5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${tekkyBarFillPct}%`,
                background: `linear-gradient(90deg, ${tier.color} 0%, white 100%)`,
              }}
            />
          </div>
        </div>

        {/* Years-saved hero stat — pulls the punchline out of the math */}
        {yearsSaved !== null && yearsSaved > 0 && (
          <div
            className="mt-5 pt-4 border-t flex items-center gap-3"
            style={{ borderColor: `${tier.color}33` }}
          >
            <div
              className="text-3xl sm:text-4xl font-black tracking-tighter tabular-nums"
              style={{ color: tier.color }}
            >
              −{yearsSaved > 50 ? yearsSaved.toFixed(0) : yearsSaved.toFixed(1)}
            </div>
            <div className="text-sm text-white/85 leading-tight">
              years off the path to mastery —{" "}
              <span className="font-bold text-white">
                same {currentWeeklyHours} hrs / week
              </span>
              , just on the right ball.
            </div>
          </div>
        )}

        {/* Footer hours stat */}
        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-white/45">
              You set
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
              TEKKY multiplier
            </div>
            <div className="text-2xl font-black tabular-nums text-white">
              ×{TEKKY_MULTIPLIER.toFixed(1)}
              <span className="text-base text-white/50 font-normal ml-1">
                touches / min
              </span>
            </div>
          </div>
        </div>

        <p className="mt-5 pt-4 border-t border-white/10 text-[12px] sm:text-sm text-white/65 leading-relaxed italic">
          The TEKKY shortcut: smaller surface forces a touch every step.
          One TEKKY hour = roughly{" "}
          <strong className="text-white">
            {TEKKY_MULTIPLIER.toFixed(1)} regulation-ball hours
          </strong>{" "}
          of technical reps. Drag the slider — watch both bars move.
        </p>
      </div>
    );
  }

  // Compact — top-of-page strip. Two stacked bars (without / with
  // TEKKY) so the comparison is visible at a glance even from the
  // sticky header.
  return (
    <div
      className="rounded-md border px-3 py-2"
      style={{
        background: "rgba(5,13,31,0.6)",
        borderColor: `${tier.color}55`,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div
          className="text-[9px] tracking-[0.32em] uppercase font-extrabold"
          style={{ color: tier.color }}
        >
          ⏱ 10K-hr rule · with vs without TEKKY
        </div>
        {yearsSaved !== null && yearsSaved > 0 && (
          <div
            className="text-[10px] font-extrabold tabular-nums"
            style={{ color: tier.color }}
          >
            −{yearsSaved > 50 ? yearsSaved.toFixed(0) : yearsSaved.toFixed(1)}{" "}
            yrs
          </div>
        )}
      </div>

      {/* WITHOUT TEKKY row */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[8px] uppercase tracking-wider text-slate-500 w-14 shrink-0">
          Without
        </span>
        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${barFillPct}%`,
              background: "linear-gradient(90deg, #475569 0%, #94a3b8 100%)",
            }}
          />
        </div>
        <div className="text-[10px] font-bold tabular-nums shrink-0 w-20 text-right">
          {yearsToMastery === null ? (
            <span className="text-white/30">— hrs</span>
          ) : (
            <span className="text-slate-300">
              {yearsToMastery > 50
                ? yearsToMastery.toFixed(0)
                : yearsToMastery.toFixed(1)}{" "}
              <span className="text-white/40">yrs</span>
            </span>
          )}
        </div>
      </div>

      {/* WITH TEKKY row — same height, lime to draw the eye */}
      <div className="flex items-center gap-2">
        <span
          className="text-[8px] uppercase tracking-wider w-14 shrink-0 font-bold"
          style={{ color: tier.color }}
        >
          ⚽ TEKKY
        </span>
        <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${tekkyBarFillPct}%`,
              background: `linear-gradient(90deg, ${tier.color} 0%, white 100%)`,
            }}
          />
        </div>
        <div className="text-[10px] font-bold tabular-nums shrink-0 w-20 text-right">
          {tekkyYearsToMastery === null ? (
            <span className="text-white/30">add hours →</span>
          ) : (
            <span style={{ color: tier.color }}>
              {tekkyYearsToMastery > 50
                ? tekkyYearsToMastery.toFixed(0)
                : tekkyYearsToMastery.toFixed(1)}{" "}
              <span className="text-white/50">yrs</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TenKHourMeter;
