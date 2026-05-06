/**
 * Training plan generator — pure deterministic logic. No AI here.
 * Maps the user's slider answers to a personalized recommendation.
 */

export type BuilderInputs = {
  role: "parent" | "player" | "coach";
  firstName: string;
  email: string;
  phone: string;
  // Player profile
  /** Gender of the player — drives which Pixar-style avatar card renders. */
  gender: "male" | "female";
  age: number; // 5–35 (5–23 = U-bracket, 24+ = Adult/Senior)
  heightInches: number; // 36–72
  /** 1 = beginner, 2 = recreational, 3 = travel, 4 = ECNL/MLS Next, 5 = elite */
  skillLevel: number;
  /** Current weekly hours of training. */
  currentWeeklyHours: number; // 0–10
  /** Selected goal chips. */
  goals: string[];
};

export type TrainingPlan = {
  level: "Foundation" | "Builder" | "Accelerator" | "Elite";
  weeklySessions: number;
  minutesPerSession: number;
  focusTier: "Warm Up" | "Beginner" | "Intermediate";
  recommendedDrills: { id: string; name: string; reason: string }[];
  recommendedKit: {
    items: string[];
    label: string;
    priceUsd: number;
  };
  nextStep: string;
  /** Short paragraph summarizing the plan in plain English. */
  pitch: string;
};

export const GOAL_OPTIONS: { id: string; label: string; emoji: string }[] = [
  { id: "first-touch", label: "Sharper first touch", emoji: "✋" },
  { id: "tryouts", label: "Prepare for tryouts", emoji: "🎯" },
  { id: "confidence", label: "More confidence in 1v1s", emoji: "⚡" },
  { id: "tactics", label: "Move from rec to club", emoji: "🚀" },
  { id: "ecnl", label: "Get noticed by ECNL/MLS Next", emoji: "🏆" },
  { id: "fitness", label: "Build strength + technique", emoji: "💪" },
  { id: "fun", label: "Fall back in love with the ball", emoji: "❤️" },
];

export function generatePlan(inputs: BuilderInputs): TrainingPlan {
  const { age, skillLevel, currentWeeklyHours, goals, role } = inputs;

  // Level + cadence rules
  let level: TrainingPlan["level"];
  let focusTier: TrainingPlan["focusTier"];
  let weeklySessions: number;
  let minutesPerSession: number;

  if (skillLevel <= 2 || age <= 8) {
    level = "Foundation";
    focusTier = "Warm Up";
    weeklySessions = 3;
    minutesPerSession = 10;
  } else if (skillLevel === 3) {
    level = "Builder";
    focusTier = "Beginner";
    weeklySessions = 4;
    minutesPerSession = 15;
  } else if (skillLevel === 4) {
    level = "Accelerator";
    focusTier = "Intermediate";
    weeklySessions = 5;
    minutesPerSession = 20;
  } else {
    level = "Elite";
    focusTier = "Intermediate";
    weeklySessions = 6;
    minutesPerSession = 25;
  }

  // If they're already training a lot, bump intensity slightly
  if (currentWeeklyHours >= 5 && weeklySessions < 6) {
    weeklySessions += 1;
  }

  // Pick 3 drills matched to focus tier
  const recommendedDrills = pickDrillsForTier(focusTier, goals, age);

  // Kit recommendation tiers
  let recommendedKit: TrainingPlan["recommendedKit"];
  if (level === "Foundation") {
    recommendedKit = {
      items: ["The TEKKY® Ball"],
      label: "Starter — just the ball",
      priceUsd: 59.95,
    };
  } else if (level === "Builder") {
    recommendedKit = {
      items: ["The TEKKY® Ball", "TEKKY® Grip Socks"],
      label: "Builder kit — ball + grip socks for stable footwork",
      priceUsd: 74.95,
    };
  } else {
    recommendedKit = {
      items: [
        "The TEKKY® Ball",
        "TEKKY® Grip Socks",
        "High Performance TEKKY® Training Tee",
      ],
      label: "Elite kit — ball + grip socks + training tee",
      priceUsd: 92.45,
    };
  }

  // Next step depends on role
  const nextStep =
    role === "coach"
      ? "Book a free 30-minute club demo — we'll walk you through the curriculum and ship a few balls to your roster on us."
      : role === "parent"
        ? "Get the TEKKY® and start the 14-day Foundation routine. By week 2, the difference will be visible."
        : "Grab the TEKKY® and start the cadence above today. Tag #TEKKYTouch in your training reels — we feature one player a week.";

  // Build the pitch paragraph
  const pitch = buildPitch({
    inputs,
    level,
    weeklySessions,
    minutesPerSession,
  });

  return {
    level,
    weeklySessions,
    minutesPerSession,
    focusTier,
    recommendedDrills,
    recommendedKit,
    nextStep,
    pitch,
  };
}

function pickDrillsForTier(
  tier: TrainingPlan["focusTier"],
  goals: string[],
  age: number,
): TrainingPlan["recommendedDrills"] {
  // Tier 1 — Warm Up
  if (tier === "Warm Up") {
    return [
      {
        id: "bX-HMzizdxU",
        name: "Instep Touch",
        reason:
          age <= 8
            ? "First touch — wakes up the ankle and trains rhythm."
            : "Foundation rep — re-tunes the laces-to-ball relationship.",
      },
      {
        id: "qXGWT_-_yF4",
        name: "Laces Gather and Pass",
        reason: "Soft cushion + redirect. The bedrock first-touch move.",
      },
      {
        id: "G8aa_34JpFg",
        name: "Sole Trap, Instep Pass",
        reason: "Sole control + clean redirect — under-trained at U10 in U.S. soccer.",
      },
    ];
  }
  // Tier 2 — Beginner
  if (tier === "Beginner") {
    const wantsFirstTouch = goals.includes("first-touch");
    const wants1v1 = goals.includes("confidence");
    return [
      {
        id: wantsFirstTouch ? "n4625BwqiU0" : "l40Cq1RJ_QI",
        name: wantsFirstTouch ? "Push Pull" : "La Croqueta",
        reason: wantsFirstTouch
          ? "Sole-of-foot rhythm. The fundamental beat of every pro's close control."
          : "Iniesta's signature lateral shift. Builds the move that breaks tight pressure.",
      },
      {
        id: "ojviCQ0mrsY",
        name: "V-Cut",
        reason: wants1v1
          ? "Change-of-direction in one touch — exact shape every winger uses to beat a defender 1v1."
          : "Single-touch direction change. Foundation for everything tactical that comes next.",
      },
      {
        id: "Kaj6ymLWsB8",
        name: "Scissors · Outside Push",
        reason: "Body-feint into outside-foot exit. Trains deception + acceleration in one rep.",
      },
    ];
  }
  // Tier 3 — Intermediate
  const wantsECNL = goals.includes("ecnl");
  const wantsTactics = goals.includes("tactics");
  return [
    {
      id: "aLWVJfbAn9I",
      name: "Tap Tap Drag · La Croqueta · Drag",
      reason: wantsECNL
        ? "Six-touch combo. The kind of close-quarter solving that turns U13 academy players into U15 first-team prospects."
        : "Stacked combo move — when you own this, you own the regulation ball easily.",
    },
    {
      id: "9frnJdNJW9o",
      name: "Roll · Stepover [The Jay Jay]",
      reason: "Pure deception under tight space. A signature trick that translates to game day.",
    },
    {
      id: "fydguVA6Fzw",
      name: "Touch In · Scissors · Touch Out",
      reason: wantsTactics
        ? "Closest move in the library to a real-game 1v1. Builds the read needed in academy-level pressure."
        : "Three-touch deception sequence. Real-game-pace drilling.",
    },
  ];
}

function buildPitch(args: {
  inputs: BuilderInputs;
  level: TrainingPlan["level"];
  weeklySessions: number;
  minutesPerSession: number;
}): string {
  const { inputs, level, weeklySessions, minutesPerSession } = args;
  const totalWeekly = weeklySessions * minutesPerSession;
  const audienceSpecific =
    inputs.role === "coach"
      ? `For your roster, this means ${weeklySessions} short technical blocks a week — drop them into your existing practice as warm-up replacements.`
      : inputs.role === "parent"
        ? `For ${inputs.firstName || "your player"}, that's ${minutesPerSession} minutes a day — a 10-min driveway routine before homework, ${weeklySessions} times a week.`
        : `That's ${minutesPerSession} minutes ${weeklySessions} times a week. Doable before practice, after school, or during your warm-up.`;
  return `Your ${level} plan: ${weeklySessions} sessions a week × ${minutesPerSession} minutes — ${totalWeekly} total minutes of focused TEKKY® work. ${audienceSpecific} You'll feel the change in your touch within 14 days, and your coach will see it before week 4.`;
}
