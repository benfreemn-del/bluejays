/**
 * season-calculator.ts
 *
 * Computes whether a soccer lead is "in-season" right now based on:
 *   · state (most states share Fall HS / Winter-Spring club calendar;
 *     WA is the documented exception with boys = Spring HS)
 *   · gender (boys/girls — only matters for HS-overlapping age groups)
 *   · age_group (HS-affected ages overlap with WIAA / state HS calendars;
 *     non-HS-affected = year-round-with-summer-break)
 *   · competition_tier (MLS NEXT runs year-round, no HS overlap allowed.
 *     ECNL / RCL Select / Rec follow state HS rules. College has its own.)
 *
 * Returns { inSeason, reason, confidence } so the UI can show WHY a lead
 * is/isn't in-season + a confidence indicator (clearer when the input
 * data is complete).
 *
 * Manual override always wins — the caller is expected to short-circuit
 * with `in_season_override` from the lead before calling this. This lib
 * only computes the inferred value.
 */

export type Gender = "boys" | "girls" | "men" | "women" | "mixed" | "unknown" | null;
export type CompetitionTier =
  | "rcl-select"
  | "mls-next"
  | "ecnl"
  | "rec-youth"
  | "rec-adult"
  | "high-school"
  | "college"
  | "pro"
  | "unknown"
  | null;
export type AgeGroup =
  | "U8"
  | "U10"
  | "U12"
  | "U14"
  | "U16"
  | "U17"
  | "U19"
  | "high-school"
  | "college"
  | "adult"
  | "unknown"
  | null;

export type SeasonInput = {
  state?: string | null;
  gender?: Gender;
  ageGroup?: AgeGroup;
  competitionTier?: CompetitionTier;
  /** Override "now" — only for testing. Defaults to actual current date. */
  now?: Date;
};

export type SeasonResult = {
  inSeason: boolean;
  reason: string;
  /** "high" = full state+gender+age+tier signal · "medium" = partial ·
   *  "low" = state-and-tier-only fallback */
  confidence: "high" | "medium" | "low";
};

/** Whether the age group overlaps with high-school (and thus is affected
 *  by state HS calendar shifts like WA spring-boys). U16+ in most states
 *  is HS-overlapping. */
function isHSOverlap(age: AgeGroup): boolean {
  if (!age) return false;
  return age === "U16" || age === "U17" || age === "U19" || age === "high-school";
}

/**
 * Standard US club season (most states).
 *  Club ON: Aug 1 → May 31 (with mid-year HS break for Fall HS gender)
 *  Club OFF: Jun 1 → Jul 31 (summer break)
 */
function isStandardClubSeason(now: Date): boolean {
  const month = now.getMonth(); // 0-indexed: 5=Jun, 6=Jul, 7=Aug
  return !(month === 5 || month === 6); // Off Jun + Jul
}

/**
 * Washington-specific HS calendar. Per Philip+Paul:
 *   · Boys: HS season is SPRING (Mar-May) per WIAA
 *   · Girls: HS season is FALL (Aug-Oct) per WIAA
 * Club season = year-round MINUS the gender's HS season for HS-aged players.
 */
function isWaInSeasonForGender(
  gender: Gender,
  ageGroup: AgeGroup,
  now: Date,
  tier: CompetitionTier,
): { inSeason: boolean; reason: string } {
  const month = now.getMonth(); // 0=Jan, 11=Dec

  // MLS NEXT runs year-round-no-HS regardless of state.
  if (tier === "mls-next") {
    if (month === 5 || month === 6) {
      return {
        inSeason: false,
        reason: "MLS NEXT summer break (Jun–Jul)",
      };
    }
    return {
      inSeason: true,
      reason: "MLS NEXT runs year-round (no HS overlap)",
    };
  }

  // College + pro have their own calendars (we don't auto-compute).
  if (tier === "college" || tier === "pro") {
    return {
      inSeason: month >= 7 && month <= 10,
      reason:
        tier === "college"
          ? "NCAA fall season (Aug–Nov)"
          : "Professional season (most leagues run Apr–Oct)",
    };
  }

  // For ECNL / RCL / rec / HS / unknown — apply HS overlap rules.
  // Only matters if the lead is HS-overlapping age.
  if (isHSOverlap(ageGroup) && (gender === "boys" || gender === "men")) {
    // WA boys HS = Spring (Mar-May). Club off in those months.
    if (month >= 2 && month <= 4) {
      return {
        inSeason: false,
        reason:
          "WA boys high-school season is Spring (Mar–May) — club off",
      };
    }
  }
  if (isHSOverlap(ageGroup) && (gender === "girls" || gender === "women")) {
    // WA girls HS = Fall (Aug-Oct). Club off in those months.
    if (month >= 7 && month <= 9) {
      return {
        inSeason: false,
        reason:
          "WA girls high-school season is Fall (Aug–Oct) — club off",
      };
    }
  }

  // Default WA-and-elsewhere: standard club calendar.
  if (!isStandardClubSeason(now)) {
    return {
      inSeason: false,
      reason: "Summer break (Jun–Jul)",
    };
  }
  return {
    inSeason: true,
    reason: "Standard club season",
  };
}

/**
 * Standard (non-WA) calculation. HS season is FALL for both genders in
 * most states, so HS-aged players have club off in Aug-Oct.
 */
function isStandardInSeasonForGender(
  gender: Gender,
  ageGroup: AgeGroup,
  now: Date,
  tier: CompetitionTier,
): { inSeason: boolean; reason: string } {
  const month = now.getMonth();

  // MLS NEXT runs year-round-no-HS.
  if (tier === "mls-next") {
    if (month === 5 || month === 6) {
      return {
        inSeason: false,
        reason: "MLS NEXT summer break (Jun–Jul)",
      };
    }
    return {
      inSeason: true,
      reason: "MLS NEXT runs year-round",
    };
  }

  if (tier === "college" || tier === "pro") {
    return {
      inSeason: month >= 7 && month <= 10,
      reason:
        tier === "college"
          ? "NCAA fall season (Aug–Nov)"
          : "Professional season (Apr–Oct)",
    };
  }

  // HS overlap: most states run HS in fall for both genders.
  if (
    isHSOverlap(ageGroup) &&
    (gender === "boys" ||
      gender === "girls" ||
      gender === "men" ||
      gender === "women")
  ) {
    if (month >= 7 && month <= 9) {
      return {
        inSeason: false,
        reason: "High-school season (Aug–Oct) — club off",
      };
    }
  }

  if (!isStandardClubSeason(now)) {
    return {
      inSeason: false,
      reason: "Summer break (Jun–Jul)",
    };
  }
  return { inSeason: true, reason: "Standard club season" };
}

export function computeSeason(input: SeasonInput): SeasonResult {
  const now = input.now ?? new Date();
  const state = (input.state ?? "").toUpperCase();
  const gender = input.gender ?? null;
  const ageGroup = input.ageGroup ?? null;
  const tier = input.competitionTier ?? null;

  // Confidence: high when we have all 4 inputs.
  let confidence: SeasonResult["confidence"] = "high";
  if (!state || !gender || !ageGroup || !tier) {
    confidence = state && tier ? "medium" : "low";
  }

  // Adult rec — different rules entirely. Most leagues run year-round in
  // covered facilities and outdoor seasonal seasons; treat as in-season
  // unless winter (Dec-Feb) and outdoor.
  if (tier === "rec-adult") {
    return {
      inSeason: true,
      reason: "Adult rec — leagues run year-round, indoor + outdoor cycles",
      confidence,
    };
  }

  // Pacific NW WA-specific calendar.
  if (state === "WA") {
    const r = isWaInSeasonForGender(gender, ageGroup, now, tier);
    return { ...r, confidence };
  }

  // Standard fallback for all other states.
  const r = isStandardInSeasonForGender(gender, ageGroup, now, tier);
  return { ...r, confidence };
}

/**
 * Helper: takes a raw lead row + computes the in-season state, honoring
 * the manual override. This is the function the UI calls.
 */
export type LeadForSeason = {
  state_override?: string | null;
  gender?: string | null;
  age_group?: string | null;
  competition_tier?: string | null;
  in_season_override?: string | null;
  raw_payload?: { state?: string } | null;
};

export function leadInSeason(
  lead: LeadForSeason,
  now: Date = new Date(),
): SeasonResult & { override: boolean } {
  // Manual override always wins.
  if (lead.in_season_override === "in-season") {
    return {
      inSeason: true,
      reason: "Manually set as in-season",
      confidence: "high",
      override: true,
    };
  }
  if (lead.in_season_override === "off-season") {
    return {
      inSeason: false,
      reason: "Manually set as off-season",
      confidence: "high",
      override: true,
    };
  }
  const result = computeSeason({
    state:
      lead.state_override ??
      (lead.raw_payload as { state?: string } | null | undefined)?.state ??
      null,
    gender: lead.gender as Gender,
    ageGroup: lead.age_group as AgeGroup,
    competitionTier: lead.competition_tier as CompetitionTier,
    now,
  });
  return { ...result, override: false };
}
