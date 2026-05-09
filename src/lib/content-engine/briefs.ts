/**
 * content-engine/briefs.ts — daily brief generator. Picks today's
 * bucket, generates 3 hook variants, drafts a 4-beat script in Ben's
 * tone, attaches the matching CTA.
 *
 * Canonical reference: .claude/skills/content-engine/SKILL.md
 *
 * v1: deterministic templates for hooks/scripts (no LLM call yet).
 *     Each hook is a structure-locked transformation of the bucket
 *     candidate. Ben can rewrite freehand in the UI; the system logs
 *     which hook he picks (or the rejection) so phase 2 can learn.
 */

import {
  BUCKET_ROTATION,
  fetchAllBucketCandidates,
  type BucketCandidate,
  type ContentBucket,
} from "./buckets";
import {
  HOOK_STRUCTURES,
  type HookStructure,
  type HookVariant,
} from "./hooks";
import { CTA_BY_BUCKET, fillCtaKeyword, type CtaTemplate } from "./ctas";

export interface ContentBrief {
  date: string; // YYYY-MM-DD
  bucket: ContentBucket;
  candidate: BucketCandidate;
  hooks: HookVariant[];
  scriptDraft: ScriptDraft;
  cta: CtaTemplate;
  ctaKeyword: string;
  /** Tone-guard rules the operator should keep in mind while recording */
  toneGuards: string[];
}

export interface ScriptDraft {
  hookSeconds: string; // 0-3s
  promiseSeconds: string; // 3-8s
  proofSeconds: string; // 8-22s
  ctaSeconds: string; // 22-30s
  /** B-roll cues — fixed 3-position template until asset library lands */
  bRollCues: Array<{ atSecond: number; assetTag: string; note: string }>;
  /** Total estimated duration */
  estimatedSeconds: number;
}

const TONE_GUARDS = [
  "lowercase, casual — like a slack message",
  "no 'in this video' / 'today we'll talk about'",
  'no "leverage" / "synergy" / "scale" / "ecosystem"',
  "use natural pauses + 'yeah so' / 'here's the thing'",
  "specific number > vague number always",
  "name the stake — what they lose if they don't act",
];

/**
 * Pick today's bucket. Walks the day's rotation and picks the first
 * bucket with at least one candidate. Falls back to ship_log (always
 * available unless git is broken) and finally hot_takes.
 */
function pickBucketForToday(
  candidates: BucketCandidate[],
  date: Date = new Date(),
): { bucket: ContentBucket; candidate: BucketCandidate } | null {
  const dayOfWeek = date.getDay();
  const order = BUCKET_ROTATION[dayOfWeek] ?? BUCKET_ROTATION[0];
  for (const bucket of order) {
    const match = candidates.find((c) => c.bucket === bucket);
    if (match) return { bucket, candidate: match };
  }
  // Last-resort: any candidate at all
  return candidates[0]
    ? { bucket: candidates[0].bucket, candidate: candidates[0] }
    : null;
}

/**
 * Generate 3 hook variants for the picked candidate. Each one uses a
 * different hook structure so Ben can pick by feel.
 *
 * Structure picks per bucket are heuristic — best-fit pairings from
 * SKILL.md. We always offer 3 options across different structures so
 * the brief never ships a single hook with no comparison.
 */
function pickHookStructures(bucket: ContentBucket): HookStructure[] {
  const map: Record<ContentBucket, HookStructure[]> = {
    prospect_questions: [
      "question_curiosity",
      "expose_insider",
      "contrarian_authority",
    ],
    client_outcomes: ["outcome_specific", "number_promise", "shock_stakes"],
    build_in_public: ["outcome_specific", "shock_stakes", "number_promise"],
    hot_takes: [
      "contrarian_authority",
      "expose_insider",
      "question_curiosity",
    ],
    ship_log: ["number_promise", "outcome_specific", "expose_insider"],
  };
  return map[bucket];
}

/**
 * Build a hook variant for a given structure + candidate. v1 uses
 * deterministic string construction — the result is "draft enough"
 * for Ben to rewrite, never "ship as-is". Phase 2: route through an
 * LLM with the SKILL.md tone guard.
 */
function buildHookVariant(
  structure: HookStructure,
  candidate: BucketCandidate,
): HookVariant {
  const meta = HOOK_STRUCTURES[structure];
  const seed = candidate.seed;

  // v1 hook strings — purposely raw + slightly broken so Ben rewrites
  // them. The structure is the value, not the exact wording.
  const text = (() => {
    switch (structure) {
      case "shock_stakes":
        if (candidate.bucket === "client_outcomes") {
          const $ = candidate.specifics.amount_usd;
          return `we just closed $${$} for ${candidate.specifics.business} — here's what almost killed it`;
        }
        if (candidate.bucket === "build_in_public") {
          return `${seed} — here's what broke + the 4-min fix`;
        }
        return `${seed} — and here's what it cost us`;
      case "contrarian_authority":
        if (candidate.bucket === "hot_takes") return seed;
        return `everyone's wrong about ${seed.split(" ").slice(0, 4).join(" ")}. here's why.`;
      case "number_promise":
        if (candidate.bucket === "ship_log") {
          return `i shipped ${seed.toLowerCase()} in under a day. here's what it does.`;
        }
        if (candidate.bucket === "client_outcomes") {
          const $ = candidate.specifics.amount_usd;
          return `client closed $${$} this week. here's the 3-step play.`;
        }
        return `${seed} — in 30 seconds.`;
      case "question_curiosity":
        if (candidate.bucket === "prospect_questions") {
          return seed.endsWith("?") ? seed : `${seed}?`;
        }
        return `what's the real reason ${seed.toLowerCase().replace(/\.$/, "")}?`;
      case "outcome_specific":
        if (candidate.bucket === "ship_log") {
          return `i just shipped ${seed.toLowerCase()} — here's the receipts`;
        }
        if (candidate.bucket === "client_outcomes") {
          return `${seed} this week. here's the EXACT play.`;
        }
        return `${seed} — here's what it actually does`;
      case "expose_insider":
        return `here's the trick agencies hide: ${seed.toLowerCase().replace(/\.$/, "")}`;
    }
  })();

  return {
    structure,
    text,
    rationale: meta.description,
  };
}

/**
 * Pick a memorable comment-trigger keyword from the candidate. v1:
 * first all-caps-able noun in the seed, fallback "DROP".
 */
function pickCtaKeyword(candidate: BucketCandidate): string {
  const words = candidate.seed.split(/\W+/).filter((w) => w.length >= 4);
  const word = words.find((w) => /^[A-Z]/.test(w)) ?? words[0] ?? "DROP";
  return word.toUpperCase().slice(0, 10);
}

/**
 * Build the script draft for the chosen hook + bucket. Fixed 3-cue
 * b-roll template until the asset library lands.
 */
function buildScriptDraft(
  hookText: string,
  candidate: BucketCandidate,
  cta: CtaTemplate,
): ScriptDraft {
  const promise = (() => {
    switch (candidate.bucket) {
      case "prospect_questions":
        return "in the next 22 seconds i'll answer it the way i'd tell a friend.";
      case "client_outcomes":
        return "i'll show you the actual play that worked — no theory.";
      case "build_in_public":
        return "here's what we caught + the 4-minute fix that closed the gap.";
      case "hot_takes":
        return "stay with me 22 more seconds and i'll show you the receipts.";
      case "ship_log":
        return "here's what it does + why it pays for itself.";
    }
  })();

  const proofPlaceholder = `(show: ${candidate.sourceLabel}) ${candidate.seed}`;

  return {
    hookSeconds: hookText,
    promiseSeconds: promise,
    proofSeconds: proofPlaceholder,
    ctaSeconds: cta.videoLine,
    bRollCues: [
      {
        atSecond: 8,
        assetTag: bucketToAssetTag(candidate.bucket),
        note: "first b-roll — establish the surface you're talking about",
      },
      {
        atSecond: 15,
        assetTag: "specific",
        note: `pull a screen recording showing the specific thing: ${candidate.seed.slice(0, 60)}`,
      },
      {
        atSecond: 22,
        assetTag: "cta-target",
        note: "show the destination of the CTA — landing page, dashboard, etc",
      },
    ],
    estimatedSeconds: 30,
  };
}

function bucketToAssetTag(bucket: ContentBucket): string {
  switch (bucket) {
    case "prospect_questions":
      return "inbox";
    case "client_outcomes":
      return "portal";
    case "build_in_public":
      return "git-or-signals";
    case "hot_takes":
      return "headline";
    case "ship_log":
      return "diff-or-dashboard";
  }
}

/**
 * Public entry: build today's brief end-to-end.
 */
export async function generateBrief(
  date: Date = new Date(),
): Promise<ContentBrief | null> {
  const candidates = await fetchAllBucketCandidates();
  const pick = pickBucketForToday(candidates, date);
  if (!pick) return null;

  const structures = pickHookStructures(pick.bucket);
  const hooks = structures.map((s) => buildHookVariant(s, pick.candidate));

  const ctaKeyword = pickCtaKeyword(pick.candidate);
  const cta = fillCtaKeyword(CTA_BY_BUCKET[pick.bucket], ctaKeyword);

  const scriptDraft = buildScriptDraft(hooks[0].text, pick.candidate, cta);

  return {
    date: date.toISOString().slice(0, 10),
    bucket: pick.bucket,
    candidate: pick.candidate,
    hooks,
    scriptDraft,
    cta,
    ctaKeyword,
    toneGuards: TONE_GUARDS,
  };
}
