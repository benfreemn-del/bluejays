// US youth-soccer camp count baselines (annualized).
//
// Methodology / sources (all figures are best-effort estimates, not authoritative counts):
//   - US Youth Soccer reports ~3M registered youth players across 55 state assocs
//     (https://www.usyouthsoccer.org/about/).
//   - ActivityHero & MySummerCamps each list 8k-12k US "soccer camp" sessions in
//     peak summer; many are repeat weekly sessions of the same program.
//   - Treating distinct programs (not session-weeks): SuperKick / Challenger /
//     UK International / British Soccer / Beestera / TetonSports / NSR / D1 /
//     NCAA-affiliated ID camps + ~1 club-run camp per ~6,500 registered players.
//   - Combined club, private-academy, college ID, and national-brand programs:
//     ~22,000 distinct annualized US youth soccer camps. We round to 22000.
//
// Per-state distribution: 2023 US Census state population shares, lightly tilted
// toward sunbelt + soccer-strong states (CA, TX, FL, NY, NJ, MA, NC, GA, VA, WA,
// CO, IL, PA, OH). Sum approximates TOTAL_US_CAMPS_ESTIMATE.

export const TOTAL_US_CAMPS_ESTIMATE = 22000;

// Approx camp counts per state. Sum ~= 22,000 (rounded; small drift from rounding).
export const CAMPS_BY_STATE: Record<string, number> = {
  CA: 2640, // ~12.0%
  TX: 1980, // ~9.0%
  FL: 1540, // ~7.0%
  NY: 1320, // ~6.0%
  PA: 880,  // ~4.0%
  IL: 836,  // ~3.8%
  OH: 770,  // ~3.5%
  GA: 770,  // ~3.5%
  NC: 770,  // ~3.5%
  NJ: 660,  // ~3.0%
  VA: 616,  // ~2.8%
  MI: 594,  // ~2.7%
  WA: 594,  // ~2.7%
  AZ: 528,  // ~2.4%
  MA: 528,  // ~2.4%
  TN: 484,  // ~2.2%
  IN: 440,  // ~2.0%
  MD: 440,  // ~2.0%
  MO: 396,  // ~1.8%
  WI: 374,  // ~1.7%
  CO: 374,  // ~1.7%
  MN: 374,  // ~1.7%
  SC: 352,  // ~1.6%
  AL: 308,  // ~1.4%
  LA: 286,  // ~1.3%
  KY: 286,  // ~1.3%
  OR: 286,  // ~1.3%
  OK: 242,  // ~1.1%
  CT: 242,  // ~1.1%
  UT: 242,  // ~1.1%
  IA: 198,  // ~0.9%
  NV: 198,  // ~0.9%
  AR: 176,  // ~0.8%
  KS: 176,  // ~0.8%
  MS: 154,  // ~0.7%
  NM: 132,  // ~0.6%
  NE: 132,  // ~0.6%
  ID: 110,  // ~0.5%
  WV: 88,   // ~0.4%
  HI: 88,   // ~0.4%
  NH: 88,   // ~0.4%
  ME: 88,   // ~0.4%
  MT: 66,   // ~0.3%
  RI: 66,   // ~0.3%
  DE: 66,   // ~0.3%
  SD: 44,   // ~0.2%
  ND: 44,   // ~0.2%
  AK: 44,   // ~0.2%
  VT: 44,   // ~0.2%
  WY: 22,   // ~0.1%
  DC: 44,   // ~0.2%
};

// Age-band multipliers. Sum ~= 1.0. Reflects typical participation skew toward
// U10-U14 (peak rec/select years).
export const AGE_MULTIPLIER: Record<string, number> = {
  'U6-U8': 0.18,
  'U9-U10': 0.22,
  'U11-U12': 0.24,
  'U13-U14': 0.18,
  'U15-U16': 0.11,
  'U17-U19': 0.07,
};

// Skill-level multipliers. Sum ~= 1.0.
export const SKILL_MULTIPLIER: Record<string, number> = {
  beginner: 0.35,
  rec: 0.40,
  select: 0.18,
  elite: 0.07,
};

// Format multipliers. These OVERLAP — a single camp may be both a "day-camp"
// and a "clinic". When the user multi-selects formats, sum the selected values
// and cap the result at 1.0.
export const FORMAT_MULTIPLIER: Record<string, number> = {
  'day-camp': 0.65,
  residential: 0.18,
  clinic: 0.12,
  demo: 0.05,
};

// Timing / season multipliers. Sum ~= 1.0.
export const TIMING_MULTIPLIER: Record<string, number> = {
  'summer-2026': 0.55,
  'spring-break-2026': 0.10,
  'winter-break-2025': 0.08,
  'fall-2025': 0.12,
  'school-year-clinics': 0.15,
};
