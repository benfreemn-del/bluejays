/**
 * content-engine/hooks.ts — the 6 hook structures + variant generator.
 *
 * Canonical reference: .claude/skills/content-engine/SKILL.md
 *
 * Every brief MUST pick a hook from one of these structures. Freestyle
 * hooks are banned — the structure constraint is the discipline that
 * keeps the brief out of vague-vlog territory.
 */

export type HookStructure =
  | "shock_stakes"
  | "contrarian_authority"
  | "number_promise"
  | "question_curiosity"
  | "outcome_specific"
  | "expose_insider";

export const HOOK_STRUCTURES: Record<
  HookStructure,
  {
    label: string;
    description: string;
    template: string;
    examples: string[];
  }
> = {
  shock_stakes: {
    label: "Shock + stakes",
    description:
      "Open with something startling that has a stake — money lost, deal almost killed, mistake caught. Algorithm-friendly because the brain can't ignore loss.",
    template: "i [VERB-LOSS] $[NUMBER] yesterday because of [SPECIFIC THING]",
    examples: [
      "i lost a $10,000 deal yesterday because of one missing email",
      "my client almost shut down their ads — here's what i caught",
      "this $4k/mo leak was hiding in plain sight",
    ],
  },
  contrarian_authority: {
    label: "Contrarian + authority",
    description:
      "Pick the conventional wisdom and call it wrong. Works because most operators are afraid to be specific — being specific = being authoritative.",
    template: "every [GROUP] tells you to [DO X]. it's wrong. here's why.",
    examples: [
      "every agency tells you to A/B test headlines. it's wasted spend.",
      "everyone's automating outbound. that's the trap.",
      "stop measuring CTR. measure this instead.",
    ],
  },
  number_promise: {
    label: "Number + promise",
    description:
      "Specific number + concrete outcome. The number signals you ran the numbers; vague numbers signal you didn't.",
    template: "i [DID THING] with [NUMBER]. here's how.",
    examples: [
      "i automated 7 client funnels with one cron job. here's how.",
      "this 22-line script makes my AI responder convert 2x",
      "we built 6 audience-specific landing pages in one shot",
    ],
  },
  question_curiosity: {
    label: "Question + curiosity",
    description:
      "Ask the question your audience secretly googles. The hook fails if the answer is obvious in the first 5 seconds — make them watch for the payoff.",
    template: "what's the real reason [COMMON FAILURE] happens?",
    examples: [
      "what's the real reason most B2B ad campaigns die at $300/day?",
      "why does the same headline get 10x more leads on tuesday?",
      "what's the one onboarding step every agency skips?",
    ],
  },
  outcome_specific: {
    label: "Outcome + specific",
    description:
      "Lead with the exact outcome + the exact mechanism. Most credible bucket; almost always pulls from real shipped work or client wins.",
    template: "i just [SHIPPED THING] in [TIME]. here's how it [VALUE].",
    examples: [
      "i just shipped per-tenant cost attribution in 4 hours. here's how it saves my clients $200/mo",
      "this client closed $10,000 — here's the EXACT email that got the meeting",
      "we built a Madie sales scoreboard in 3 hours. she booked 5 demos that week.",
    ],
  },
  expose_insider: {
    label: "Expose + insider",
    description:
      "Promise a peek behind the curtain. Best for high-save content (followers screenshot the prompt / playbook / script).",
    template: "[GROUP] doesn't want you to know about [THING]. i'll show you.",
    examples: [
      "agencies don't want you to know about this hyperloop A/B trick",
      "here's the prompt every consultant charges $5k/mo for",
      "the spreadsheet i use to run 9 client funnels at once",
    ],
  },
};

export interface HookVariant {
  structure: HookStructure;
  text: string;
  /** Why this structure was picked for this bucket (for the UI tooltip). */
  rationale: string;
}

/**
 * Hook discipline rules — applied as a checklist in the script
 * generator. Used to flag soft hooks before Ben records.
 */
export const HOOK_DISCIPLINE = {
  maxSecondsBeforePromise: 3,
  maxWordCount: 15,
  bannedSofteners: [
    "kind of",
    "basically just",
    "i think maybe",
    "you guys won't believe",
    "in this video",
    "today we're going to",
    "let's talk about",
  ],
  requireSpecificNumber: true, // when bucket allows it
} as const;

/**
 * Validate a candidate hook against discipline rules. Returns issues
 * for the UI to surface BEFORE Ben records.
 */
export function validateHook(hookText: string): string[] {
  const issues: string[] = [];
  const wordCount = hookText.trim().split(/\s+/).length;
  if (wordCount > HOOK_DISCIPLINE.maxWordCount) {
    issues.push(
      `Hook is ${wordCount} words — over the ${HOOK_DISCIPLINE.maxWordCount}-word ceiling. Cut filler.`,
    );
  }
  for (const softener of HOOK_DISCIPLINE.bannedSofteners) {
    if (hookText.toLowerCase().includes(softener)) {
      issues.push(`Banned softener: "${softener}". Cut and tighten.`);
    }
  }
  if (/\b(amazing|incredible|game[- ]?changing|next[- ]?level)\b/i.test(hookText)) {
    issues.push("Hook contains hype word — be specific instead.");
  }
  return issues;
}
