"use client";

import Image from "next/image";

/**
 * Pixar-style 3D avatar swap for the Build Your Player tool.
 *
 * Renders one of 15 hand-rendered avatar PNGs (5 skill tiers × 3 age
 * groups) keyed off the user's slider inputs. Avatars live in
 * /public/avatars/tekky/ and were produced as 2K 3:4 portraits with
 * baked-in star halo, jersey number, tier label, and navy gradient
 * background — see /src/data/tekky-avatars.json for the full design
 * spec.
 *
 * What's still live-wired around the static image:
 *   - Height slider → scales the avatar up/down (3'0" to 7'0")
 *   - Weekly hours → fills the 10,000-hr-rule bar overlay
 *   - Live "Age · Height" stat chips at bottom
 *
 * What's baked into the avatar (was dynamic in the old SVG):
 *   - Star count (2 / 4 / 6 / 8 / 10 stars per tier)
 *   - Jersey number (#7 REC, #10 TRAVEL, #9 CLUB, #23 ECNL, #1 ELITE)
 *   - Per-tier kit colors + equipment (armband, gold trim, etc.)
 *   - Body build + facial hair (scales with age + tier on adult cards)
 *   - Tier name + age label (printed at bottom of card)
 */

type TierSlug = "rec" | "travel" | "club" | "ecnl_mls_next" | "elite";
type AgeSlug = "5-15" | "13-25" | "25-35";

type Props = {
  age: number;
  heightInches: number;
  skillLevel: number; // 1-5
  currentWeeklyHours: number; // 0-30
};

const TIERS: { slug: TierSlug; name: string; subtitle: string; color: string }[] = [
  { slug: "rec", name: "Rec", subtitle: "Just getting started", color: "#38BDF8" },
  { slug: "travel", name: "Travel", subtitle: "Comp soccer", color: "#DC2626" },
  { slug: "club", name: "Club", subtitle: "Premier / Travel-elite", color: "#7C3AED" },
  { slug: "ecnl_mls_next", name: "ECNL / MLS Next", subtitle: "National-tier", color: "#FBBF24" },
  { slug: "elite", name: "Elite", subtitle: "Pro / academy pathway", color: "#FBBF24" },
];

const AGE_SLUGS: AgeSlug[] = ["5-15", "13-25", "25-35"];

/** Map a numeric age to one of the 3 age-bracket slugs the avatars
    are keyed by. Boundaries (13, 25) round UP per spec — a 13yo gets
    teen, a 25yo gets adult. */
function ageToSlug(age: number): AgeSlug {
  if (age < 13) return "5-15";
  if (age < 25) return "13-25";
  return "25-35";
}

/** Build the canonical filename for a (tier, age) pair. Sequence
    numbers run 1-15 in tier-then-age order. */
function avatarFilename(tier: TierSlug, age: AgeSlug): string {
  const tierIdx = TIERS.findIndex((t) => t.slug === tier);
  const ageIdx = AGE_SLUGS.indexOf(age);
  const seq = String(tierIdx * 3 + ageIdx + 1).padStart(2, "0");
  return `${seq}_${tier}_age_${age}.png`;
}

export default function CharacterBuilder({
  age,
  heightInches,
  skillLevel,
  currentWeeklyHours,
}: Props) {
  const tier = TIERS[Math.min(Math.max(skillLevel - 1, 0), 4)];
  const ageSlug = ageToSlug(age);
  const filename = avatarFilename(tier.slug, ageSlug);

  // Height drives a subtle scale on the avatar so taller players read
  // visually larger. Range deliberately gentle (0.85x → 1.05x) so the
  // baked-in proportions still read correctly — a 7'0" rendered at
  // 1.5x would crop or distort. The card's own framing is the
  // canonical look.
  const scale = 0.85 + ((heightInches - 36) / (84 - 36)) * 0.2;

  // 10,000-hour-rule bar
  const annualHours = currentWeeklyHours * 52;
  const yearsToMastery = currentWeeklyHours > 0 ? 10000 / annualHours : null;
  const barFillPct = Math.min((annualHours / 5000) * 100, 100);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Avatar — top zone (flex-1). object-contain preserves the 3:4
          card. The card's own navy gradient extends to the edges so
          there's no border seam. Height-driven scale stays gentle so
          the baked-in proportions still read correctly. */}
      <div className="relative flex-1 min-h-0">
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
          style={{ transform: `scale(${scale})` }}
        >
          <Image
            src={`/avatars/tekky/${filename}`}
            alt={`${tier.name} player, age ${ageSlug}`}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 520px"
          />
        </div>
      </div>

      {/* Bottom strip — 10K bar + Height stat chip live HERE (not
          overlaid on the card) so they never cover the baked-in tier
          label or "Ages X-Y" text on the card itself. Tier + Age are
          already in the card so we drop those chips. */}
      <div
        className="shrink-0 px-3 pt-3 pb-3 space-y-2 border-t"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,24,50,0) 0%, rgba(10,24,50,0.85) 30%, rgba(10,24,50,0.95) 100%)",
          borderColor: `${tier.color}33`,
        }}
      >
        {/* 10,000-hour rule bar */}
        <div
          className="rounded-md p-2.5 border"
          style={{
            background: "rgba(5,13,31,0.7)",
            borderColor: `${tier.color}55`,
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div
              className="text-[8px] tracking-[0.32em] uppercase font-extrabold"
              style={{ color: `${tier.color}cc` }}
            >
              ⏱ 10,000-hr rule
            </div>
            <div className="text-[10px] font-bold tabular-nums">
              {yearsToMastery === null ? (
                <span className="text-white/40">— add hours →</span>
              ) : yearsToMastery > 50 ? (
                <span className="text-white/55">
                  <span className="text-white">{yearsToMastery.toFixed(0)}</span>{" "}
                  yrs to mastery
                </span>
              ) : (
                <span className="text-white/55">
                  <span className="text-white">{yearsToMastery.toFixed(1)}</span>{" "}
                  yrs to mastery
                </span>
              )}
            </div>
          </div>
          <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${barFillPct}%`,
                background: `linear-gradient(90deg, ${tier.color} 0%, white 100%)`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[8px] tracking-[0.18em] uppercase text-white/45 tabular-nums">
            <span>
              <span className="text-white/70 font-bold">{currentWeeklyHours}</span> hrs / wk
            </span>
            <span>
              <span className="text-white/70 font-bold">
                {annualHours.toLocaleString()}
              </span>{" "}
              hrs / yr
            </span>
          </div>
        </div>

        {/* Height stat chip — only one we keep, since age + tier are
            already printed on the avatar card itself. Height is the
            only live-wired info not visible in the image. */}
        <div className="grid grid-cols-1">
          <StatChip
            label="Height"
            value={`${Math.floor(heightInches / 12)}'${heightInches % 12}"`}
            color={tier.color}
          />
        </div>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="border rounded p-1.5 text-center backdrop-blur"
      style={{
        background: "rgba(10, 24, 50, 0.7)",
        borderColor: `${color}55`,
      }}
    >
      <div
        className="text-[8px] tracking-[0.18em] uppercase font-bold"
        style={{ color: `${color}aa` }}
      >
        {label}
      </div>
      <div className="text-[14px] font-black tracking-tight text-white tabular-nums">
        {value}
      </div>
    </div>
  );
}
