/**
 * The runner — orchestrates a single skill invocation end-to-end.
 *
 *   1. Look up the skill in SKILL_REGISTRY (statically imported)
 *   2. Call skill.gather(args)
 *   3. If gatherer returns {noWork: true} → persist + return early
 *   4. Compose the Claude prompt (system + JSON-stringified context)
 *   5. Run cost guards (kill switch + per-run cap + daily cap)
 *   6. Call Claude
 *   7. Parse + JSON-schema-validate the output
 *   8. Persist the ai_skill_runs row + recordSpend
 *   9. Emit agent_signals row if manifest configured it
 *  10. Return the structured result
 *
 * All steps are idempotent at the persistence boundary — re-running
 * the same skill with the same args creates a new run row (we never
 * UPDATE). This keeps the audit trail durable.
 */

import { createHash } from "node:crypto";
import { supabase } from "@/lib/supabase";
import { logCost } from "@/lib/cost-logger";
import { getSkill } from "./skills";
import {
  checkGuards,
  estimateTokens,
  actualCostUsd,
  recordSpend,
} from "./cost-guard";
import { callClaude } from "./claude-call";
import type { Skill, SkillResult } from "./types";

export type RunArgs = {
  skill: string;
  triggeredBy: "cron" | "manual" | "signal";
  args?: Record<string, unknown>;
};

export async function runSkill<T = unknown>(
  runArgs: RunArgs,
): Promise<SkillResult<T>> {
  const startedAt = Date.now();
  const skill = getSkill(runArgs.skill);
  if (!skill) {
    return persistAndReturn<T>({
      skill: runArgs.skill,
      triggeredBy: runArgs.triggeredBy,
      args: runArgs.args || {},
      summary: `unknown skill: ${runArgs.skill}`,
      ok: false,
      error: `skill not in registry`,
      latencyMs: Date.now() - startedAt,
    });
  }

  // ── Gather context ──
  let ctx;
  try {
    ctx = await skill.gather(runArgs.args || {});
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return persistAndReturn<T>({
      skill: skill.manifest.name,
      triggeredBy: runArgs.triggeredBy,
      args: runArgs.args || {},
      summary: `gather failed: ${msg}`,
      ok: false,
      error: msg,
      latencyMs: Date.now() - startedAt,
    });
  }

  // ── Early-exit: no work to do ──
  if (ctx.noWork) {
    return persistAndReturn<T>({
      skill: skill.manifest.name,
      triggeredBy: runArgs.triggeredBy,
      args: runArgs.args || {},
      summary: `no work: ${ctx.reason}`,
      ok: true,
      noWork: true,
      latencyMs: Date.now() - startedAt,
    });
  }

  // ── Compose prompt + check cost guards ──
  const contextBlock = JSON.stringify(ctx.context, null, 2);
  const userMessage = `<context>\n${contextBlock}\n</context>\n\nProduce the JSON output per the system instructions.`;
  const inputHash = createHash("sha256")
    .update(skill.promptBody + "::" + contextBlock)
    .digest("hex");

  const estTokensIn = estimateTokens(skill.promptBody + userMessage);
  const guard = await checkGuards({
    skill: skill.manifest.name,
    model: skill.manifest.model,
    estTokensIn,
    maxTokensOut: skill.manifest.maxTokensOut,
    costCapPerRunUsd: skill.manifest.costCapPerRunUsd,
  });
  if (!guard.allow) {
    return persistAndReturn<T>({
      skill: skill.manifest.name,
      triggeredBy: runArgs.triggeredBy,
      args: runArgs.args || {},
      summary: `guard ${guard.code}: ${guard.reason}`,
      ok: false,
      error: guard.reason,
      inputHash,
      latencyMs: Date.now() - startedAt,
    });
  }

  // ── Call Claude ──
  let claudeRes;
  try {
    claudeRes = await callClaude({
      model: skill.manifest.model,
      systemPrompt: skill.promptBody,
      userMessage,
      maxTokens: skill.manifest.maxTokensOut,
      jsonMode: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return persistAndReturn<T>({
      skill: skill.manifest.name,
      triggeredBy: runArgs.triggeredBy,
      args: runArgs.args || {},
      summary: `claude call failed: ${msg}`,
      ok: false,
      error: msg,
      inputHash,
      latencyMs: Date.now() - startedAt,
    });
  }

  // ── Parse output + validate against skill's JSON Schema ──
  let parsed: T;
  try {
    parsed = parseJsonOutput<T>(claudeRes.text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const cost = actualCostUsd(
      skill.manifest.model,
      claudeRes.tokensIn,
      claudeRes.tokensOut,
    );
    await recordSpend({ skill: skill.manifest.name, costUsd: cost });
    return persistAndReturn<T>({
      skill: skill.manifest.name,
      triggeredBy: runArgs.triggeredBy,
      args: runArgs.args || {},
      summary: `output parse failed: ${msg}`,
      ok: false,
      error: msg,
      inputHash,
      tokensIn: claudeRes.tokensIn,
      tokensOut: claudeRes.tokensOut,
      costUsd: cost,
      latencyMs: Date.now() - startedAt,
    });
  }

  try {
    validateOutputShape(parsed, skill);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const cost = actualCostUsd(
      skill.manifest.model,
      claudeRes.tokensIn,
      claudeRes.tokensOut,
    );
    await recordSpend({ skill: skill.manifest.name, costUsd: cost });
    return persistAndReturn<T>({
      skill: skill.manifest.name,
      triggeredBy: runArgs.triggeredBy,
      args: runArgs.args || {},
      summary: `schema validation failed: ${msg}`,
      ok: false,
      error: msg,
      output: parsed,
      inputHash,
      tokensIn: claudeRes.tokensIn,
      tokensOut: claudeRes.tokensOut,
      costUsd: cost,
      latencyMs: Date.now() - startedAt,
    });
  }

  // ── Success path: record spend, emit signal, persist ──
  const cost = actualCostUsd(
    skill.manifest.model,
    claudeRes.tokensIn,
    claudeRes.tokensOut,
  );
  await recordSpend({ skill: skill.manifest.name, costUsd: cost });
  try {
    await logCost({
      service: `ai_skill:${skill.manifest.name}`,
      action: `${claudeRes.tokensIn}+${claudeRes.tokensOut}tok`,
      costUsd: cost,
    });
  } catch {
    // Cost-logging failure shouldn't fail the skill run.
  }

  // The summary is whichever string field the skill declared in its
  // output as the "human-readable line." Convention: top-level
  // `summary` field, or fall back to a sensible default.
  const parsedObj = parsed as Record<string, unknown>;
  const summary =
    typeof parsedObj.summary === "string"
      ? parsedObj.summary
      : `${skill.manifest.name} ran ok (${claudeRes.tokensOut}tok, $${cost.toFixed(4)})`;

  // Optional signal emit
  if (skill.manifest.emitSignal) {
    try {
      await supabase.from("agent_signals").insert({
        source: `ai_skill:${skill.manifest.name}`,
        kind: "skill_result",
        title: summary.slice(0, 200),
        severity: skill.manifest.emitSignal.severity,
        target: skill.manifest.emitSignal.target,
      });
    } catch {
      // Signal-emit failure shouldn't fail the skill run.
    }
  }

  return persistAndReturn<T>({
    skill: skill.manifest.name,
    triggeredBy: runArgs.triggeredBy,
    args: runArgs.args || {},
    summary,
    ok: true,
    output: parsed,
    inputHash,
    tokensIn: claudeRes.tokensIn,
    tokensOut: claudeRes.tokensOut,
    costUsd: cost,
    latencyMs: Date.now() - startedAt,
  });
}

// ── Helpers ──────────────────────────────────────────────────────

function parseJsonOutput<T>(raw: string): T {
  const trimmed = raw.trim();
  // Strip possible markdown fences (defense-in-depth: jsonMode prompt
  // tells Claude not to fence, but some prompt variants slip through).
  const stripped = trimmed
    .replace(/^```(?:json)?\n?/i, "")
    .replace(/\n?```$/i, "");
  // Find the first { and last } to handle any prose Claude added
  // around the JSON (rare with jsonMode, but cheap insurance).
  const first = stripped.indexOf("{");
  const last = stripped.lastIndexOf("}");
  if (first === -1 || last === -1 || last < first) {
    throw new Error(`no JSON object found in output (got: ${stripped.slice(0, 100)}…)`);
  }
  return JSON.parse(stripped.slice(first, last + 1));
}

function validateOutputShape(out: unknown, skill: Skill): void {
  if (!out || typeof out !== "object") {
    throw new Error(`output must be an object`);
  }
  const required = (skill.outputSchema.required as string[]) || [];
  const missing = required.filter((k) => !(k in (out as object)));
  if (missing.length > 0) {
    throw new Error(`missing required fields: ${missing.join(", ")}`);
  }
}

async function persistAndReturn<T>(args: {
  skill: string;
  triggeredBy: "cron" | "manual" | "signal";
  args: Record<string, unknown>;
  summary: string;
  ok: boolean;
  noWork?: boolean;
  output?: T;
  error?: string;
  inputHash?: string;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
  latencyMs: number;
}): Promise<SkillResult<T>> {
  const row = {
    skill: args.skill,
    triggered_by: args.triggeredBy,
    args: args.args,
    input_hash: args.inputHash || null,
    output: args.output || null,
    summary: args.summary,
    cost_usd: args.costUsd || 0,
    latency_ms: args.latencyMs,
    tokens_in: args.tokensIn || 0,
    tokens_out: args.tokensOut || 0,
    ok: args.ok,
    no_work: args.noWork || false,
    error: args.error || null,
  };
  let runId = "";
  try {
    const { data } = await supabase
      .from("ai_skill_runs")
      .insert(row)
      .select("id")
      .single();
    runId = (data?.id as string) || "";
  } catch {
    // Persistence failure — don't crash the caller; just return without id.
  }
  return {
    ok: args.ok,
    runId,
    output: args.output,
    summary: args.summary,
    costUsd: args.costUsd || 0,
    latencyMs: args.latencyMs,
    tokensIn: args.tokensIn || 0,
    tokensOut: args.tokensOut || 0,
    noWork: args.noWork || false,
    error: args.error,
  };
}
