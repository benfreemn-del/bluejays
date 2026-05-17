/**
 * Type contracts for the bj ai agentic skill layer (Day 1, 2026-05-17).
 *
 * Skills are TS modules under src/lib/ai-skills/skills/<name>.ts. Each
 * module exports a `Skill` object: manifest (config) + promptBody +
 * outputSchema (inline) + gather() function. Static import keeps the
 * bundle clean — no runtime fs reads, no dynamic imports.
 *
 * The .claude/skills/ai-<name>/ folder is a documentation mirror so
 * Claude Code's Skill tool can also discover + invoke skills from
 * inside a chat. The TS module is the runtime source of truth.
 *
 * Runner contract: see src/lib/ai-skills/runner.ts.
 */

/** Anthropic model IDs we'll actually use. Keep tight — adding a new
 *  model is a deliberate decision (cost + latency profile shift). */
export type SkillModel =
  | "claude-haiku-4-5"
  | "claude-sonnet-4-6"
  | "claude-opus-4-7";

/** Per-model pricing (USD per 1M tokens). Source of truth — keep
 *  this in lockstep with Anthropic's pricing page. Used for both
 *  pre-call estimation and post-call cost computation. */
export const MODEL_PRICING: Record<
  SkillModel,
  { inputPer1M: number; outputPer1M: number }
> = {
  "claude-haiku-4-5": { inputPer1M: 0.8, outputPer1M: 4.0 },
  "claude-sonnet-4-6": { inputPer1M: 3.0, outputPer1M: 15.0 },
  "claude-opus-4-7": { inputPer1M: 15.0, outputPer1M: 75.0 },
};

/** What the per-skill context-gatherer returns to the runner. */
export type ContextResult =
  | {
      /** Normal path — proceed to Claude call. */
      noWork: false;
      /** Free-form structured context. Runner JSON.stringifies into
       *  a single <context> block prepended to the prompt. */
      context: Record<string, unknown>;
    }
  | {
      /** Early-exit path — runner skips Claude call, persists a
       *  no_work=true row with cost=0. */
      noWork: true;
      reason: string;
    };

/** Skill manifest — declared in code, NOT parsed from a file. */
export type SkillManifest = {
  name: string;
  description: string;
  /** Cron expression. If both schedule and trigger are omitted, the
   *  skill is manual-only (invoked via `bj ai <name>`). */
  schedule?: string;
  /** Optional signal-triggered fire. Runner subscribes to agent_signals
   *  rows where (source, kind) match and fires the skill once per match. */
  trigger?: { source: string; kind: string };
  model: SkillModel;
  /** Max tokens of generated output. Used in the per-run cost
   *  estimate before any API call. */
  maxTokensOut: number;
  /** Per-run cost ceiling. Runner aborts if est cost > this. */
  costCapPerRunUsd: number;
  /** Marker only — actual schema lives in Skill.outputSchema. The
   *  string "embedded" signals "look on the Skill object." Kept on
   *  the manifest for forward-compat with future external schemas. */
  outputSchema: "embedded" | string;
  visibility: "ben-only" | "client-portal" | "both";
  /** Optional: emit an agent_signals row when the skill produces a
   *  result. Used for the brief / triage / weekly-review skills so
   *  they show up in `bj signals tail`. */
  emitSignal?: {
    severity: "info" | "warning" | "alert";
    target: string;
  };
};

/** What's actually stored in the SKILL_REGISTRY at build time. */
export type Skill = {
  manifest: SkillManifest;
  promptBody: string;
  /** JSON Schema (Draft-07) for the structured output. Required-field
   *  validation is the only check the runner performs — full Ajv-
   *  style validation is overkill for our schemas. */
  outputSchema: Record<string, unknown>;
  /** Context-gathering function. Returns either {noWork:true} (skip
   *  the Claude call) or {noWork:false, context:{...}} (proceed). */
  gather: (args: Record<string, unknown>) => Promise<ContextResult>;
};

/** What the runner returns to the caller (CLI / cron / signal handler). */
export type SkillResult<T = unknown> = {
  ok: boolean;
  /** Persisted ai_skill_runs row id, for cross-referencing. */
  runId: string;
  /** Structured output (validated against skill's JSON Schema)
   *  when ok=true and noWork=false. */
  output?: T;
  /** Always present. 1-3 line plain-text — what gets piped to
   *  stdout / SMS / dashboard. */
  summary: string;
  costUsd: number;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  noWork: boolean;
  error?: string;
};
