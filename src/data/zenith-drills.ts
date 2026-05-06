/**
 * Zenith Sports / TEKKY drill library — single source of truth.
 *
 * Used by:
 *   · /clients/zenith-sports/training-guide  — printable curriculum
 *   · /clients/zenith-sports#training        — public drill grid
 *   · Drill of the Week email campaign       — weekly broadcast picks
 *     one drill from this library by week-number rotation, renders an
 *     email with the drill's name + why + cue + YouTube embed
 *
 * Each drill has:
 *   id   — YouTube video id (full URL = https://youtu.be/<id>)
 *   name — short label for the drill
 *   why  — coach-language reasoning ("what does this train?")
 *   cue  — the one phrase to repeat at the player while they run it
 *   tier — Warm Up | Beginner | Intermediate (curriculum bucket)
 */

export type DrillTier = "Warm Up" | "Beginner" | "Intermediate";

export type Drill = {
  id: string;
  name: string;
  why: string;
  cue: string;
  tier: DrillTier;
};

export type DrillTierGroup = {
  label: DrillTier;
  ageRange: string;
  intro: string;
  drills: Drill[];
};

export const DRILL_TIERS: DrillTierGroup[] = [
  {
    label: "Warm Up",
    ageRange: "All ages · 8–12 min",
    intro:
      "Wake up the ankle, the hip, the eye-on-ball. Every session opens here. The TEKKY's smaller surface means warm-up reps actively re-train the foot — not just heart-rate work.",
    drills: [
      {
        id: "bX-HMzizdxU",
        name: "Instep Touch",
        why: "Re-tunes the laces-to-ball relationship after time off. Smaller surface forces the player to find the sweet spot every rep.",
        cue: "Soft knee. Eyes down then up.",
        tier: "Warm Up",
      },
      {
        id: "Wzlr9RpBNs4",
        name: "Outside-Foot Gather, Instep Pass",
        why: "First-touch redirection. The combo of trap + change-of-direction + pass in one motion is the bedrock of possession soccer.",
        cue: "Outside catches — laces release.",
        tier: "Warm Up",
      },
      {
        id: "g28gQ2aZ-0k",
        name: "1 Touch Instep Pass",
        why: "No second chance. Forces composure under low pressure so high-pressure reps later are familiar.",
        cue: "One-time. Plant foot pointed.",
        tier: "Warm Up",
      },
      {
        id: "mukre9VRGx4",
        name: "1 Touch Outside Foot Pass",
        why: "Develops the under-used outside-of-foot pass. Small surface area amplifies the technique demand.",
        cue: "Toe down, ankle locked.",
        tier: "Warm Up",
      },
      {
        id: "qXGWT_-_yF4",
        name: "Laces Gather and Pass",
        why: "Cushion + redirect with the laces. Builds the soft first-touch parents always say is missing in U.S. youth soccer.",
        cue: "Cushion — don't kill it.",
        tier: "Warm Up",
      },
      {
        id: "nyGSAw-4Xw0",
        name: "1 Touch Laces",
        why: "The hardest of the 1-touch series. Composure on the half-volley. Trains the player to read trajectory before the ball arrives.",
        cue: "See it early. Strike through.",
        tier: "Warm Up",
      },
      {
        id: "68vbXVsSKes",
        name: "Instep Trap, Outside Touch, Instep Pass",
        why: "Sequential change-of-foot reps. Builds the muscle memory of using both surfaces in the same possession.",
        cue: "In, out, in — flow.",
        tier: "Warm Up",
      },
      {
        id: "G8aa_34JpFg",
        name: "Sole Trap, Instep Pass",
        why: "Sole control + redirect. The sole-of-foot is the unsung hero of close control under pressure.",
        cue: "Sole stops, laces sends.",
        tier: "Warm Up",
      },
      {
        id: "rab0LPa33VI",
        name: "Sole Trap, Outside Foot Pass",
        why: "Trains the deceptive outside-foot pass off a stop. Useful in tight wing channels.",
        cue: "Disguise the line.",
        tier: "Warm Up",
      },
      {
        id: "hWQGlKbx0HM",
        name: "Sole Trap, Cross Body Drag, Instep Pass",
        why: "Three-touch combination. Closer to a real game movement. The drag fakes a defender, the pass exits the line they were defending.",
        cue: "Drag late. Pass committed.",
        tier: "Warm Up",
      },
    ],
  },
  {
    label: "Beginner",
    ageRange: "U8–U12 · 15–20 min after warm-up",
    intro:
      "The first shapes of close control. Players get reps on the basic ball-mastery moves used by every European academy in the first 10 years of a player's life. We focus on cleanness here — speed comes later.",
    drills: [
      {
        id: "l40Cq1RJ_QI",
        name: "La Croqueta",
        why: "Iniesta's signature. Shifts the ball laterally between feet under pressure. The smaller surface forces precision on the first touch — no slop.",
        cue: "Inside — inside. Push through.",
        tier: "Beginner",
      },
      {
        id: "074-lKwl9kI",
        name: "La Croqueta + 2-Touch Shift",
        why: "Builds repetition. The player has to chain the croqueta into a shift so it becomes a habit, not a party trick.",
        cue: "Repeat the rhythm.",
        tier: "Beginner",
      },
      {
        id: "n4625BwqiU0",
        name: "Push Pull",
        why: "Sole-of-foot push, sole-of-foot pull. The fundamental rhythm of every elite player's close control.",
        cue: "Sole stays light.",
        tier: "Beginner",
      },
      {
        id: "v4bHgBiPW6I",
        name: "Inside · Outside",
        why: "Two-surface control of the same foot. Trains the ankle to switch instantly.",
        cue: "Inside, outside — same foot.",
        tier: "Beginner",
      },
      {
        id: "Lnny2pLZmiI",
        name: "Sole Drag",
        why: "Decoy + escape. Pulls the ball backward to break a defender's line.",
        cue: "Drag ball INTO body.",
        tier: "Beginner",
      },
      {
        id: "ojviCQ0mrsY",
        name: "V-Cut",
        why: "Change of direction in one touch. The shape of every cut a winger makes.",
        cue: "V — short, sharp, gone.",
        tier: "Beginner",
      },
      {
        id: "nPzYPHHwgGU",
        name: "L-Drag",
        why: "Combines the sole drag with a change of direction. Creates the L shape that breaks parallel-line defending.",
        cue: "Drag, then 90-degrees out.",
        tier: "Beginner",
      },
      {
        id: "2h1hwvVDTXI",
        name: "Inside · Outside Combo",
        why: "Adds a second touch to inside/outside. Builds the rhythm needed for sequencing under pressure.",
        cue: "Two touches, one purpose.",
        tier: "Beginner",
      },
      {
        id: "Kaj6ymLWsB8",
        name: "Scissors · Outside Push",
        why: "Body-feint into outside-foot exit. Trains deception + acceleration in the same rep.",
        cue: "Sell the scissor. Mean the push.",
        tier: "Beginner",
      },
      {
        id: "6mCwL9xHfLk",
        name: "Double Scissors · Outside Push",
        why: "Two scissors before the exit. Players who own this can beat any U10 defender in a 1v1.",
        cue: "Scissor, scissor, GO.",
        tier: "Beginner",
      },
    ],
  },
  {
    label: "Intermediate",
    ageRange: "U12+ · 20–25 min after Beginner reps",
    intro:
      "Layered combinations. Each move stacks on a Beginner-tier pattern. By the time a player can run these clean on the TEKKY, they own the regulation ball.",
    drills: [
      {
        id: "aLWVJfbAn9I",
        name: "Tap Tap Drag · La Croqueta · Drag",
        why: "Six-touch combo. Builds the kind of close-quarter solving that turns U13 academy players into U15 first-team prospects.",
        cue: "Tap tap. Drag. Croquet. Drag.",
        tier: "Intermediate",
      },
      {
        id: "2mqCyIdrlBs",
        name: "Push Pull U-Drag with Cone",
        why: "Adds a real obstacle. The cone forces the player to commit to spacing — no fudging.",
        cue: "Stay tight to the cone.",
        tier: "Intermediate",
      },
      {
        id: "p7k4AF7piT4",
        name: "L-Drag Roll",
        why: "Sole-roll through the L. Develops the rolling-sole control that's the hardest skill to coach.",
        cue: "Roll. Don't kick.",
        tier: "Intermediate",
      },
      {
        id: "9frnJdNJW9o",
        name: "Roll · Stepover [The Jay Jay]",
        why: "Stepover off a roll. Pure deception under tight space.",
        cue: "Roll first, sell the stepover.",
        tier: "Intermediate",
      },
      {
        id: "ldiRz5W-Mjo",
        name: "Single-Leg V-Cut to L-Drag",
        why: "One-foot patterning. Forces both feet to work independently — a hallmark of two-footed pros.",
        cue: "Same foot. Don't switch.",
        tier: "Intermediate",
      },
      {
        id: "fydguVA6Fzw",
        name: "Touch In · Scissors · Touch Out",
        why: "Three-touch deception sequence. Closest move in the library to a real-game 1v1.",
        cue: "In, scissor, OUT.",
        tier: "Intermediate",
      },
    ],
  },
];

/** Flat array of every drill across all tiers, in curriculum order. */
export const ALL_DRILLS: Drill[] = DRILL_TIERS.flatMap((t) => t.drills);

/** Stable rotation index for a given ISO week number. Picks one drill
 *  from ALL_DRILLS per week so a year of weekly emails covers ~26 of
 *  the 26 drills with the rotation cycling — coaches see every drill
 *  in their first 6 months on the list. */
export function pickDrillForWeek(weekNum: number, totalDrills?: number): Drill {
  const n = totalDrills ?? ALL_DRILLS.length;
  const idx = ((weekNum % n) + n) % n;
  return ALL_DRILLS[idx]!;
}

/** Compute ISO-ish week number for a date. Used by the cron picker so
 *  the same drill goes out on the same calendar week regardless of which
 *  exact run-time fires the broadcast. */
export function isoWeekNumber(d: Date = new Date()): number {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

/** Render a YouTube watch URL from a drill id. Centralizes the URL
 *  format so a future move to embedding (or another platform) is a
 *  one-place change. */
export function youtubeUrlFor(drill: Drill): string {
  return `https://www.youtube.com/watch?v=${drill.id}`;
}

/** Build the Drill of the Week email body for a given drill. Plain
 *  text — works in every email client + lets the runner sub variables.
 *  The {{firstName}} placeholder is filled by the existing
 *  client-funnels runner template substitution. */
export function buildDrillOfWeekEmail(drill: Drill): {
  subject: string;
  body: string;
} {
  const url = youtubeUrlFor(drill);
  const subject = `🎯 Drill of the Week — ${drill.name} (${drill.tier})`;
  const body = `Hi {{firstName}},

This week's TEKKY® drill: ${drill.name}.
Tier: ${drill.tier}

WHY IT MATTERS
${drill.why}

THE COACHING CUE
"${drill.cue}"

WATCH IT (60 sec)
${url}

Drop it into your warm-up tomorrow. Two sets, 30 seconds each, both feet. Send me a video — I'll give you a quick coaching note back.

— Philip
Zenith Sports / TEKKY®

—
Want the full curriculum? {{coachGuideUrl}}
Build a personalized plan for a player: {{builderUrl}}`;
  return { subject, body };
}
