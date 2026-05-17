/**
 * Cost guardrails for the bj ai skill layer (Day 1, 2026-05-17).
 *
 * Three layers, in order of precedence:
 *
 *   1. Global kill switch — env AI_SKILLS_DISABLED=1 short-circuits
 *      every call. Use during incidents or when iterating on prompts
 *      to avoid runaway spend.
 *
 *   2. Per-run estimate cap — runner computes
 *      (estTokensIn + maxTokensOut) × model_rate before any API call.
 *      If > skill's `costCapPerRunUsd`, abort.
 *
 *   3. Per-skill daily cap — ai_skill_caps.spent_today_usd is checked
 *      before every call AND incremented after every successful call.
 *      Lazy reset at UTC midnight (no cron needed; checked on read).
 *
 * Per Ben's 2026-05-17 question: the cap ONLY counts actual Claude
 * API spend. Skills that early-exit with noWork=true persist a run
 * row with cost=0 — the cap is untouched. The point is "spend
 * happens only when work happens."
 */

import { supabase } from "@/lib/supabase";
import { MODEL_PRICING, type SkillModel } from "./types";

export type GuardDecision =
  | { allow: true }
  | { allow: false; reason: string; code: "kill_switch" | "per_run_cap" | "daily_cap" };

const DEFAULT_DAILY_CAP_USD = parseFloat(
  process.env.AI_SKILLS_DAILY_CAP_USD || "5.00",
);

/** Layer 1 — env kill switch. Checked first by every entry point. */
export function killSwitchEngaged(): boolean {
  return process.env.AI_SKILLS_DISABLED === "1";
}

/** Cheap-and-dirty token estimate. Anthropic's tokenizer is ~3.5
 *  chars per token for English; we use 4 to err on the conservative
 *  side (overestimate input cost → never undershoot a cap). */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Pre-call estimate. Used by Layer 2 + Layer 3 gates. */
export function estimateCostUsd(
  model: SkillModel,
  estTokensIn: number,
  maxTokensOut: number,
): number {
  const rate = MODEL_PRICING[model];
  const inputCost = (estTokensIn / 1_000_000) * rate.inputPer1M;
  const outputCost = (maxTokensOut / 1_000_000) * rate.outputPer1M;
  return inputCost + outputCost;
}

/** Post-call actual cost from real token counts (returned in the
 *  Anthropic response). Used to update spent_today_usd. */
export function actualCostUsd(
  model: SkillModel,
  tokensIn: number,
  tokensOut: number,
): number {
  const rate = MODEL_PRICING[model];
  return (
    (tokensIn / 1_000_000) * rate.inputPer1M +
    (tokensOut / 1_000_000) * rate.outputPer1M
  );
}

/** Reset the per-skill daily counter if we've crossed UTC midnight
 *  since the last update. Returns the freshly-read row. */
async function getOrInitCapRow(skill: string): Promise<{
  daily_cap_usd: number;
  spent_today_usd: number;
}> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("ai_skill_caps")
    .select("daily_cap_usd, spent_today_usd, cap_reset_at")
    .eq("skill", skill)
    .maybeSingle();

  if (!existing) {
    // First time we've seen this skill — insert at default cap.
    await supabase
      .from("ai_skill_caps")
      .insert({
        skill,
        daily_cap_usd: DEFAULT_DAILY_CAP_USD,
        spent_today_usd: 0,
        cap_reset_at: today,
      });
    return { daily_cap_usd: DEFAULT_DAILY_CAP_USD, spent_today_usd: 0 };
  }

  // Lazy reset if crossed midnight UTC.
  if (existing.cap_reset_at !== today) {
    await supabase
      .from("ai_skill_caps")
      .update({
        spent_today_usd: 0,
        cap_reset_at: today,
        cap_hits_today: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("skill", skill);
    return {
      daily_cap_usd: parseFloat(existing.daily_cap_usd as unknown as string),
      spent_today_usd: 0,
    };
  }

  return {
    daily_cap_usd: parseFloat(existing.daily_cap_usd as unknown as string),
    spent_today_usd: parseFloat(existing.spent_today_usd as unknown as string),
  };
}

/** Full gate check — call from the runner BEFORE making the
 *  Claude API call. Returns {allow: true} or a typed decline. */
export async function checkGuards(args: {
  skill: string;
  model: SkillModel;
  estTokensIn: number;
  maxTokensOut: number;
  costCapPerRunUsd: number;
}): Promise<GuardDecision> {
  // Layer 1
  if (killSwitchEngaged()) {
    return {
      allow: false,
      code: "kill_switch",
      reason: "AI_SKILLS_DISABLED=1 — global kill switch engaged",
    };
  }

  // Layer 2
  const est = estimateCostUsd(args.model, args.estTokensIn, args.maxTokensOut);
  if (est > args.costCapPerRunUsd) {
    return {
      allow: false,
      code: "per_run_cap",
      reason: `est $${est.toFixed(4)} exceeds skill cap $${args.costCapPerRunUsd.toFixed(4)}`,
    };
  }

  // Layer 3
  const cap = await getOrInitCapRow(args.skill);
  if (cap.spent_today_usd + est > cap.daily_cap_usd) {
    // Bump the cap-hit counter for telemetry. Best-effort — never
    // block the gate decision on this.
    const { data: existing } = await supabase
      .from("ai_skill_caps")
      .select("cap_hits_today")
      .eq("skill", args.skill)
      .maybeSingle();
    const current = (existing?.cap_hits_today as number) ?? 0;
    try {
      await supabase
        .from("ai_skill_caps")
        .update({
          cap_hits_today: current + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("skill", args.skill);
    } catch {
      // Telemetry-only update — never block the gate decision on it.
    }
    return {
      allow: false,
      code: "daily_cap",
      reason: `daily cap $${cap.daily_cap_usd.toFixed(2)} would be exceeded (spent $${cap.spent_today_usd.toFixed(4)}, est $${est.toFixed(4)} more)`,
    };
  }

  return { allow: true };
}

/** Record actual spend after a successful Claude call. Increments
 *  ai_skill_caps.spent_today_usd. The runner ALSO logs via logCost()
 *  so the bj costs ledger picks it up. */
export async function recordSpend(args: {
  skill: string;
  costUsd: number;
}): Promise<void> {
  if (args.costUsd <= 0) return; // no-op for noWork runs
  const current = await getOrInitCapRow(args.skill);
  await supabase
    .from("ai_skill_caps")
    .update({
      spent_today_usd: current.spent_today_usd + args.costUsd,
      updated_at: new Date().toISOString(),
    })
    .eq("skill", args.skill);
}
