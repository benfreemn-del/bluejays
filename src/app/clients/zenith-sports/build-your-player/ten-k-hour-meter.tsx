"use client";

/**
 * The Touches Advantage — TEKKY player-development calculator.
 *
 * Rebuilt from the "TEKKY — The Touches Advantage" deck (Zenith Sports
 * player-development framework). The deck's 3-scenario model so the
 * on-site calculator matches the numbers Philip + Paul present in person.
 *
 * The model — annual touches & time-on-ball over a 50-week club season:
 *   A · Traditional Only     2–3 sessions + 1 game/week, 150 touches each
 *   B · + TEKKY Warm-Up      A + 15-min TEKKY before every practice
 *   C · Full TEKKY Protocol  B + 5 extra 15-min TEKKY sessions/week
 *
 * Years-to-mastery uses Gladwell's 10,000-hour rule against each
 * scenario's TOTAL structured training time, exactly as the deck's
 * "Mastery Equation" slide does. The start-age control turns "years to
 * mastery" into "reaches mastery at age N."
 *
 * The hero variant pairs the scenario cards with the cumulative-touch
 * line graph from the deck's "5-Year Development Window" slide — drag
 * the years slider and watch the three lines climb + the gap widen.
 *
 * Mounted in two places on /build-your-player:
 *   · size="compact" — top-of-page strip (A/B/C touch bars at a glance)
 *   · size="hero"    — full calculator + line graph on the hours sub-step
 *
 * Legacy props (currentWeeklyHours, skillLevel) are accepted but unused —
 * the model is scenario-based now — so existing call sites keep compiling.
 */

import { useState } from "react";

const TURQ = "#22D3EE"; // TEKKY ball turquoise-blue — primary accent
const TURQ_MID = "#4BC6E8"; // scenario B accent
const SLATE = "#94a3b8"; // scenario A accent

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
  },
];

const SCEN_A = SCENARIOS[0]!;
const SCEN_C = SCENARIOS[2]!;
const MAX_TOUCHES = SCEN_C.touches;

/** Per-scenario accent: C is the turquoise hero, B a mid tint, A muted. */
function accentFor(id: Scenario["id"]): string {
  if (id === "C") return TURQ;
  if (id === "B") return TURQ_MID;
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
  const [years, setYears] = useState(5);

  if (size === "hero") {
    return (
      <div
        className="rounded-2xl border-2 p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(10,24,50,0.85) 0%, rgba(5,13,31,0.95) 100%)",
          borderColor: `${TURQ}55`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div
            className="text-[11px] sm:text-[13px] tracking-[0.32em] uppercase font-extrabold"
            style={{ color: TURQ }}
          >
            ⏱ The Touches Advantage
          </div>
          <div className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/45">
            50-week club season
          </div>
        </div>

        {/* Two columns on lg: scenario calculator (left) + line graph (right) */}
        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(300px,380px)]">
          {/* LEFT — start-age control + scenario cards */}
          <div>
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/50">
                  Player starts at age
                </span>
                <span
                  className="text-2xl font-black tabular-nums"
                  style={{ color: TURQ }}
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
                style={{ accentColor: TURQ }}
              />
            </div>

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
                        ? `linear-gradient(160deg, ${TURQ}1f 0%, rgba(5,13,31,0.6) 100%)`
                        : "rgba(255,255,255,0.03)",
                      border: `${isHero ? 2 : 1}px solid ${accent}${isHero ? "" : "33"}`,
                      boxShadow: isHero ? `0 0 28px ${TURQ}26` : "none",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black"
                        style={{ background: accent, color: "#050d1f" }}
                      >
                        {s.id}
                      </span>
                      <span
                        className="text-[10px] font-extrabold tabular-nums px-2 py-0.5 rounded-full"
                        style={{ color: accent, background: `${accent}1f` }}
                      >
                        {s.multiplier === 1
                          ? "baseline"
                          : `${s.multiplier}× touches`}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white leading-tight">
                      {s.name}
                    </div>
                    <div className="text-[11px] text-white/45 leading-snug mt-0.5 mb-3">
                      {s.detail}
                    </div>

                    <div
                      className="text-3xl sm:text-[2rem] font-black tracking-tighter tabular-nums leading-none"
                      style={{ color: isHero ? TURQ : "#fff" }}
                    >
                      {s.touches.toLocaleString()}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5 mb-2">
                      touches / year
                    </div>

                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barPct}%`,
                          background: `linear-gradient(90deg, ${accent} 0%, ${accent}99 100%)`,
                        }}
                      />
                    </div>

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
          </div>

          {/* RIGHT — cumulative-touch line graph (deck's "5-Year Window") */}
          <TouchGapChart years={years} onYears={setYears} />
        </div>

        <p className="mt-5 text-[11px] text-white/45 leading-relaxed italic">
          Years to mastery use Gladwell&apos;s 10,000-hour rule against each
          scenario&apos;s total structured training time. Drag the sliders to
          set starting age + projection window.
        </p>
      </div>
    );
  }

  // Compact — top-of-page strip. Three touch-volume bars (A / B / C) so
  // the gap is visible at a glance from the sticky header.
  return (
    <div
      className="rounded-md border px-3 py-2"
      style={{ background: "rgba(5,13,31,0.6)", borderColor: `${TURQ}55` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div
          className="text-[9px] tracking-[0.32em] uppercase font-extrabold"
          style={{ color: TURQ }}
        >
          ⚽ The Touches Advantage · per year
        </div>
        <div
          className="text-[10px] font-extrabold tabular-nums"
          style={{ color: TURQ }}
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
                style={{ color: s.id === "C" ? TURQ : "rgba(255,255,255,0.8)" }}
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

// ─────────────────────────────────────────────────────────────────────────────
// Cumulative-touch line graph — the deck's "5-Year Development Window."
// Cumulative touches are linear (annual × years), so each scenario is a
// straight ray from the origin. Axes are FIXED to the 10-year horizon so
// dragging the years slider visibly climbs the lines up-and-right and
// widens the C-vs-A gap — the compounding advantage, made visual.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_YEARS = 10;
const Y_MAX = SCEN_C.touches * MAX_YEARS; // 1,668,750 — top of the y-axis

function TouchGapChart({
  years,
  onYears,
}: {
  years: number;
  onYears: (v: number) => void;
}) {
  // Plot geometry (SVG user units).
  const W = 320;
  const H = 210;
  const padL = 38;
  const padR = 12;
  const padT = 10;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xFor = (yr: number) => padL + (yr / MAX_YEARS) * plotW;
  const yFor = (touches: number) =>
    padT + plotH - (touches / Y_MAX) * plotH;

  const cumGap =
    (SCEN_C.touches - SCEN_A.touches) * years; // C-vs-A gap at `years`

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 flex flex-col lg:sticky lg:top-4 lg:self-start">
      <div className="flex items-center justify-between mb-1 gap-2">
        <div className="text-[10px] tracking-[0.28em] uppercase font-bold text-white/55">
          Cumulative touches
        </div>
        <div
          className="text-[10px] tracking-[0.18em] uppercase font-bold"
          style={{ color: TURQ }}
        >
          {years}-yr window
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Cumulative touches over ${years} years — Full TEKKY protocol pulls away from traditional training.`}
      >
        <defs>
          <linearGradient id="tekkyCFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TURQ} stopOpacity="0.28" />
            <stop offset="100%" stopColor={TURQ} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines + y-axis labels (in thousands) */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const gy = padT + plotH - f * plotH;
          const val = Math.round((f * Y_MAX) / 1000);
          return (
            <g key={f}>
              <line
                x1={padL}
                y1={gy}
                x2={W - padR}
                y2={gy}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <text
                x={padL - 5}
                y={gy + 3}
                textAnchor="end"
                fontSize="8"
                fill="rgba(255,255,255,0.4)"
              >
                {val === 0 ? "0" : `${val}k`}
              </text>
            </g>
          );
        })}

        {/* X-axis year ticks */}
        {Array.from({ length: MAX_YEARS + 1 }, (_, i) => i)
          .filter((i) => i % 2 === 0)
          .map((i) => (
            <text
              key={i}
              x={xFor(i)}
              y={H - padB + 14}
              textAnchor="middle"
              fontSize="8"
              fill="rgba(255,255,255,0.4)"
            >
              {i === 0 ? "0" : `${i}y`}
            </text>
          ))}

        {/* Area fill under the C line */}
        <polygon
          points={`${xFor(0)},${yFor(0)} ${xFor(years)},${yFor(
            SCEN_C.touches * years,
          )} ${xFor(years)},${yFor(0)}`}
          fill="url(#tekkyCFill)"
          style={{ transition: "all 0.35s ease" }}
        />

        {/* Scenario rays from origin to current `years` */}
        {SCENARIOS.map((s) => {
          const accent = accentFor(s.id);
          const ex = xFor(years);
          const ey = yFor(s.touches * years);
          return (
            <g key={s.id}>
              <line
                x1={xFor(0)}
                y1={yFor(0)}
                x2={ex}
                y2={ey}
                stroke={accent}
                strokeWidth={s.id === "C" ? 2.6 : 1.8}
                strokeLinecap="round"
                style={{ transition: "all 0.35s ease" }}
              />
              <circle
                cx={ex}
                cy={ey}
                r={s.id === "C" ? 4 : 3}
                fill={accent}
                stroke="#050d1f"
                strokeWidth="1.5"
                style={{ transition: "all 0.35s ease" }}
              />
              {/* End-point label for A and C (B omitted to avoid overlap) */}
              {s.id !== "B" && (
                <text
                  x={ex - 4}
                  y={ey - 6}
                  textAnchor="end"
                  fontSize="8.5"
                  fontWeight="700"
                  fill={accent}
                  style={{ transition: "all 0.35s ease" }}
                >
                  {(s.touches * years).toLocaleString()}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-between gap-2 mt-1 mb-3 text-[10px]">
        {SCENARIOS.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: accentFor(s.id) }}
            />
            <span className="text-white/55">{s.id}</span>
          </span>
        ))}
      </div>

      {/* Years slider — drag to extend the window */}
      <label className="block">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/50">
            Project
          </span>
          <span
            className="text-lg font-black tabular-nums"
            style={{ color: TURQ }}
          >
            {years} yr{years === 1 ? "" : "s"}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={MAX_YEARS}
          step={1}
          value={years}
          onChange={(e) => onYears(parseInt(e.target.value, 10))}
          aria-label="Years to project"
          className="w-full cursor-pointer"
          style={{ accentColor: TURQ }}
        />
      </label>

      {/* Gap callout */}
      <div
        className="mt-3 rounded-lg px-3 py-2 text-center"
        style={{ background: `${TURQ}14`, border: `1px solid ${TURQ}33` }}
      >
        <div
          className="text-xl font-black tabular-nums tracking-tight"
          style={{ color: TURQ }}
        >
          +{cumGap.toLocaleString()}
        </div>
        <div className="text-[10px] text-white/60 leading-tight mt-0.5">
          touches Full&nbsp;TEKKY is ahead of traditional at year {years}
        </div>
      </div>
    </div>
  );
}

export default TenKHourMeter;
