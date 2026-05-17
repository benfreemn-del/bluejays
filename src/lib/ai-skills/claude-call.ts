/**
 * Anthropic Messages API wrapper — fetch direct, no SDK dep.
 *
 * Matches the codebase pattern (the rest of bluejays calls OpenAI /
 * SendGrid / Stripe / Twilio with raw fetch). Keeps the dep
 * footprint flat — one less thing to upgrade.
 *
 * Returns the structured payload the runner needs: text + token
 * counts. Cost computation is the runner's job (cost-guard.ts owns
 * the pricing table).
 */

import type { SkillModel } from "./types";

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

export type ClaudeCallArgs = {
  model: SkillModel;
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
  /** When true, the response_format param requests JSON-only output.
   *  Claude doesn't have a hard JSON mode like OpenAI, so we lean on
   *  the prompt to enforce shape AND the runner validates against
   *  the skill's JSON Schema. */
  jsonMode?: boolean;
};

export type ClaudeCallResult = {
  text: string;
  tokensIn: number;
  tokensOut: number;
  stopReason: string;
};

export async function callClaude(args: ClaudeCallArgs): Promise<ClaudeCallResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set");
  }

  // For JSON mode, append a hard instruction. Claude responds well
  // to explicit "return ONLY JSON" framing; the runner double-checks
  // by parsing + schema-validating after.
  const sys = args.jsonMode
    ? `${args.systemPrompt}\n\nReturn ONLY valid JSON matching the requested schema. No prose, no markdown fences, no explanation. Start with { and end with }.`
    : args.systemPrompt;

  const body = {
    model: mapModelToApiId(args.model),
    max_tokens: args.maxTokens,
    system: sys,
    messages: [{ role: "user", content: args.userMessage }],
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": API_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`anthropic ${res.status}: ${errText.slice(0, 400)}`);
  }

  type ContentBlock = { type?: string; text?: string };
  type ApiResponse = {
    content?: ContentBlock[];
    usage?: { input_tokens?: number; output_tokens?: number };
    stop_reason?: string;
  };
  const data = (await res.json()) as ApiResponse;
  const textBlocks = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text || "")
    .join("");

  return {
    text: textBlocks,
    tokensIn: data.usage?.input_tokens ?? 0,
    tokensOut: data.usage?.output_tokens ?? 0,
    stopReason: data.stop_reason || "unknown",
  };
}

/** Map our internal model IDs to the Anthropic API IDs.
 *  Internal IDs are short + version-stable; API IDs are dated. */
function mapModelToApiId(model: SkillModel): string {
  switch (model) {
    case "claude-haiku-4-5":
      return "claude-haiku-4-5-20251001";
    case "claude-sonnet-4-6":
      return "claude-sonnet-4-6";
    case "claude-opus-4-7":
      return "claude-opus-4-7";
  }
}
