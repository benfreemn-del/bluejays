/**
 * tekky-avatars.ts
 *
 * Avatar resolver for the Build Your Player lead-capture flow.
 *
 * 30 Pixar-style 3D character cards live at public/avatars/tekky/{male,female}/.
 * Per the v2.0.0 handoff: 2 genders × 5 skill tiers × 3 age groups = 30 cards.
 *
 * Conversion psychology: the avatar is the visual carrot. As the parent
 * fills in gender + age + skill, the matched card swaps in. Users who
 * see "their" avatar are dramatically more likely to submit the form.
 */

export type Gender = "male" | "female";
export type TierSlug =
  | "rec"
  | "travel"
  | "club"
  | "ecnl_mls_next"
  | "elite";
export type AgeSlug = "5-15" | "13-25" | "25-35";

const TIER_ORDER: TierSlug[] = [
  "rec",
  "travel",
  "club",
  "ecnl_mls_next",
  "elite",
];
const AGE_ORDER: AgeSlug[] = ["5-15", "13-25", "25-35"];

/** Map a numeric age (5–35 in the BYP slider) to its bracket. */
export function ageToSlug(age: number): AgeSlug {
  if (age < 13) return "5-15";
  if (age < 25) return "13-25";
  return "25-35";
}

/**
 * Map the BYP form's numeric skillLevel (1–5) to a tier slug.
 * Slider mapping per the handoff:
 *   1 = REC          (sky blue, 2 stars, basic kit)
 *   2 = TRAVEL       (crimson red, 4 stars, basic kit)
 *   3 = CLUB         (royal purple, 6 stars, captain armband)
 *   4 = ECNL/MLS     (black + gold, 8 stars, gold armband)
 *   5 = ELITE        (white + gold, 10 stars, gold aura)
 */
export function skillLevelToTier(skillLevel: number): TierSlug {
  const idx = Math.min(Math.max(Math.round(skillLevel) - 1, 0), 4);
  return TIER_ORDER[idx]!;
}

/** String fallback (handoff lookup helper). Used by free-text dropdowns. */
export function skillToTier(skill: string): TierSlug {
  const n = skill.toLowerCase().trim();
  if (n.includes("rec")) return "rec";
  if (n.includes("travel")) return "travel";
  if (n.includes("ecnl") || n.includes("mls")) return "ecnl_mls_next";
  if (n.includes("elite") || n.includes("pro")) return "elite";
  if (n.includes("club")) return "club";
  return "rec";
}

/** Resolve the avatar filename given gender + tier + age. */
export function avatarPath(
  gender: Gender,
  tier: TierSlug,
  age: AgeSlug,
): string {
  const tierIdx = TIER_ORDER.indexOf(tier);
  const ageIdx = AGE_ORDER.indexOf(age);
  // Cards are sequenced 1-15 within a gender folder, in (tier, age) order.
  const seq = String(tierIdx * 3 + ageIdx + 1).padStart(2, "0");
  return `/avatars/tekky/${gender}/${seq}_${tier}_age_${age}.png`;
}

/** One-shot resolver. Returns DEFAULT_AVATAR if any input is missing. */
export function resolveAvatar(input: {
  gender?: Gender | null;
  age?: number | null;
  skillLevel?: number | string | null;
}): string {
  if (
    !input.gender ||
    typeof input.age !== "number" ||
    input.skillLevel === null ||
    input.skillLevel === undefined
  ) {
    return DEFAULT_AVATAR;
  }
  const tier =
    typeof input.skillLevel === "number"
      ? skillLevelToTier(input.skillLevel)
      : skillToTier(input.skillLevel);
  const age = ageToSlug(input.age);
  return avatarPath(input.gender, tier, age);
}

/** Neutral starter avatar — shown before the user has picked everything. */
export const DEFAULT_AVATAR = "/avatars/tekky/male/02_rec_age_13-25.png";

/** Tier display labels for any UI that needs them. */
export const TIER_LABEL: Record<TierSlug, string> = {
  rec: "Rec",
  travel: "Travel",
  club: "Club",
  ecnl_mls_next: "ECNL / MLS NEXT",
  elite: "Elite",
};
