"use client";

/**
 * The Touches Advantage — TEKKY player-development calculator.
 *
 * Rebuilt 2026-06-11 from the "TEKKY — The Touches Advantage" deck
 * (Zenith Sports player-development framework). Replaces the old
 * single-slider 10K-hour meter with the deck's 3-scenario model so the
 * on-site calculator matches the numbers Philip + Paul present in
 * person.
 *
 * The model — annual touches & time-on-ball over a 50-week club season:
 *   A · Traditional Only     2–3 sessions + 1 game/week, 150 touches each
 *   B · + TEKKY Warm-Up      A + 15-min TEKKY before every practice
 *   C · Full TEKKY Protocol  B + 5 extra 15-min TEKKY sessions/week
 *
 * Years-to-mastery uses Gladwell's 10,000-hour rule against each
 * scenario's TOTAL structured training time (not just on-ball time),
 * exactly as the deck's "Mastery Equation" slide does. The start-age
 * control turns "years to mastery" into "reaches mastery at age N."
 *
 * Mounted in two places on /build-your-player:
 *   · size="compact" — top-of-page strip (A/B/C touch bars at a glance)
 *   · size="hero"    — full 3-scenario calculator on the hours sub-step
 *
 * The legacy props (currentWeeklyHours, skillLevel) are accepted but no
 * longer used — the model is scenario-based now, not slider-driven —
 * so existing call sites keep compiling without edits.
 */

import { useState } from "react";

const NEON = "#2DE0C2"; // TEKKY ball neon — primary accent
const SLATE = "#94a3b8";

type Scenario = {
  id: "A" | "B" | "C";
  name: string;
  detail: string;
  /** Annual touches over the 50-week season. */
  touches: number;
  /** Minutes on the ball per year. */
  minutes: number;
  /** Hours on the ball per year. */
  hours: number;
  /** Years to 10,000 hrs of total structured training time. */
  yearsToMastery: number;
  /** Annual-touch multiple vs Scenario A. */
  multiplier: number;
  /** Cumulative touches at the end of a 5-year window. */
  fiveYearTouches: number;
};

const SCENARIOS: Scenario[] = [
  {
    id: "A",
    name: "Traditional Only",
    detail: "2–3 sessions + 1 game / week · 150 touches each",
    touches: 26_250,
    minutes: 765,
    hours: 12.8,
    yearsToMastery: 74,
    multiplier: 1,
    fiveYearTouches: 131_250,
  },
  {
    id: "B",
    name: "+ TEKKY Warm-Up",
    detail: "15-min TEKKY before every practice (375 avg touches)",
    touches: 73_125,
    minutes: 2_130,
    hours: 35.5,
    yearsToMastery: 48,
    multiplier: 2.8,
    fiveYearTouches: 365_625,
  },
  {
    id: "C",
    name: "Full TEKKY Protocol",
    detail: "+ 5 extra 15-min TEKKY sessions / week",
    touches: 166_875,
    minutes: 7_148,
    hours: 119.1,
    yearsToMastery: 19,
    multiplier: 6.4,
    fiveYearTouches: 834_375,
  },
];

const SCEN_A = SCENARIOS[0]!;
const SCEN_C = SCENARIOS[2]!;
const MAX_TOUCHES = SCEN_C.touches;
const FIVE_YEAR_GAP = SCEN_C.fiveYearTouches - SCEN_A.fiveYearTouches; // 703,125

/** Per-scenario accent: C is the neon hero, B a teal-tinted mid, A muted. */
function accentFor(id: Scenario["id"]): string {
  if (id === "C") return NEON;
  if (id === "B") return "#5eddc8";
  return SLATE;
}

export function TenKHourMeter({
  size = "compact",
}: {
  /** @deprecated retained for call-site compatibility — unused. */
  currentWeeklyHours?: number;
  /** @deprecated retained for call-site compatibility — unused. */
  skillLevel?: number;
  size?: "compact" | "hero";
}) {
  const [startAge, setStartAge] = useState(10);

  if (size === "hero") {
    return (
      <div
        className="rounded-2xl border-2 p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(10,24,50,0.85) 0%, rgba(5,13,31,0.95) 100%)",
          borderColor: `${NEON}55`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div
            className="text-[11px] sm:text-[13px] tracking-[0.32em] uppercase font-extrabold"
            style={{ color: NEON }}
          >
            ⏱ The Touches Advantage
          </div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/45">
            50-week club season
          </div>
        </div>

        {/* Start-age control — turns "years to mastery" into "age at mastery" */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/50">
              Player starts at age
            </span>
            <span
              className="text-2xl font-black tabular-nums"
              style={{ color: NEON }}
            >
              {startAge}
            </span>
          </div>
          <input
            type="range"
            min={6}
            max={16}
            step={1}
            value={startAge}
            onChange={(e) => setStartAge(parseInt(e.target.value, 10))}
            aria-label="Player starting age"
            className="w-full cursor-pointer"
            style={{ accentColor: NEON }}
          />
        </div>

        {/* 3 scenario cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          {SCENARIOS.map((s) => {
            const accent = accentFor(s.id);
            const isHero = s.id === "C";
            const masteryAge = startAge + s.yearsToMastery;
            const barPct = Math.min(100, (s.touches / MAX_TOUCHES) * 100);
            return (
              <div
                key={s.id}
                className="rounded-xl p-4 flex flex-col"
                style={{
                  background: isHero
                    ? `linear-gradient(160deg, ${NEON}1f 0%, rgba(5,13,31,0.6) 100%)`
                    : "rgba(255,255,255,0.03)",
                  border: `${isHero ? 2 : 1}px solid ${accent}${isHero ? "" : "33"}`,
                  boxShadow: isHero ? `0 0 28px ${NEON}26` : "none",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black"
                    style={{
                      background: accent,
                      color: "#050d1f",
                    }}
                  >
                    {s.id}
                  </span>
                  <span
                    className="text-[10px] font-extrabold tabular-nums px-2 py-0.5 rounded-full"
                    style={{
                      color: accent,
                      background: `${accent}1f`,
                    }}
                  >
                    {s.multiplier === 1 ? "baseline" : `${s.multiplier}× touches`}
                  </span>
                </div>

                <div className="text-sm font-bold text-white leading-tight">
                  {s.name}
                </div>
                <div className="text-[11px] text-white/45 leading-snug mt-0.5 mb-3">
                  {s.detail}
                </div>

                {/* Annual touches — the headline number */}
                <div
                  className="text-3xl sm:text-[2rem] font-black tracking-tighter tabular-nums leading-none"
                  style={{ color: isHero ? NEON : "#fff" }}
                >
                  {s.touches.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5 mb-2">
                  touches / year
                </div>

                {/* Touch-volume bar */}
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barPct}%`,
                      background: `linear-gradient(90deg, ${accent} 0%, ${accent}99 100%)`,
                    }}
                  />
                </div>

                {/* Secondary stats */}
                <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
                  <div>
                    <div className="text-white/40 uppercase tracking-wide text-[9px]">
                      Hrs on ball
                    </div>
                    <div className="font-bold text-white tabular-nums">
                      {s.hours} hrs
                    </div>
                  </div>
                  <div>
                    <div className="text-white/40 uppercase tracking-wide text-[9px]">
                      Mastery at age
                    </div>
                    <div
                      className="font-bold tabular-nums"
                      style={{ color: accent }}
                    >
                      {masteryAge}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Punchline band */}
        <div
          className="mt-5 pt-4 border-t flex items-center gap-3 flex-wrap"
          style={{ borderColor: `${NEON}33` }}
        >
          <div
            className="text-3xl sm:text-4xl font-black tracking-tighter tabular-nums"
            style={{ color: NEON }}
          >
            6.4×
          </div>
          <div className="text-sm text-white/85 leading-tight flex-1 min-w-[180px]">
            the touches of a traditional player — a{" "}
            <span className="font-bold text-white">
              {FIVE_YEAR_GAP.toLocaleString()}-touch
            </span>{" "}
            gap over 5 years that cannot be closed.
          </div>
        </div>

        <p className="mt-4 text-[11px] text-white/45 leading-relaxed italic">
          Years to mastery use Gladwell&apos;s 10,000-hour rule against each
          scenario&apos;s total structured training time. Drag the slider to
          set your player&apos;s starting age.
        </p>
      </div>
    );
  }

  // Compact — top-of-page strip. Three touch-volume bars (A / B / C) so
  // the gap is visible at a glance from the sticky header.
  return (
    <div
      className="rounded-md border px-3 py-2"
      style={{
        background: "rgba(5,13,31,0.6)",
        borderColor: `${NEON}55`,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div
          className="text-[9px] tracking-[0.32em] uppercase font-extrabold"
          style={{ color: NEON }}
        >
          ⚽ The Touches Advantage · per year
        </div>
        <div
          className="text-[10px] font-extrabold tabular-nums"
          style={{ color: NEON }}
        >
          6.4× C vs A
        </div>
      </div>

      <div className="space-y-1">
        {SCENARIOS.map((s) => {
          const accent = accentFor(s.id);
          const barPct = Math.min(100, (s.touches / MAX_TOUCHES) * 100);
          return (
            <div key={s.id} className="flex items-center gap-2">
              <span
                className="text-[8px] uppercase tracking-wider w-16 shrink-0 font-bold"
                style={{ color: accent }}
              >
                {s.id === "A"
                  ? "Traditional"
                  : s.id === "B"
                    ? "+ Warm-up"
                    : "⚽ Full TEKKY"}
              </span>
              <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barPct}%`,
                    background: `linear-gradient(90deg, ${accent} 0%, ${accent}99 100%)`,
                  }}
                />
              </div>
              <div
                className="text-[10px] font-bold tabular-nums shrink-0 w-24 text-right"
                style={{ color: s.id === "C" ? NEON : "rgba(255,255,255,0.8)" }}
              >
                {s.touches.toLocaleString()}
                <span className="text-white/40"> tch</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TenKHourMeter;
