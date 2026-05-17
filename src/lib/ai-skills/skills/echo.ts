/**
 * ai-echo — Day-1 smoke test skill.
 *
 * Takes a `--message <string>` arg, asks Claude (Haiku) to echo +
 * uppercase + count letters. Costs ~$0.0005 per call. Used to
 * validate the whole pipeline (load → gather → guard → call →
 * parse → schema → persist) before any real skill ships.
 *
 * The .claude/skills/ai-echo/ folder mirrors this file's content
 * for Claude Code's Skill tool to discover — but THIS file is the
 * source of truth at runtime. Skill = code + prompt, both bundled.
 */

import type { Skill, ContextResult } from "../types";

const PROMPT = `You are the smoke-test skill for BlueJays' bj ai layer.

You will receive a <context> block containing a single field \`message\`.

Return ONLY valid JSON in this exact shape:

{
  "echo": "<the message verbatim>",
  "uppercase": "<the message uppercased>",
  "letter_count": <number of letters in the message, excluding spaces and punctuation>,
  "summary": "echoed N letters"
}

The \`summary\` field MUST be a single short sentence that names the
letter count. Example: for message="hello world" → summary="echoed 10 letters".

No prose. No markdown fences. No explanation. Just the JSON object.`;

const OUTPUT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "ai-echo output",
  type: "object",
  required: ["echo", "uppercase", "letter_count", "summary"],
  properties: {
    echo: { type: "string" },
    uppercase: { type: "string" },
    letter_count: { type: "integer", minimum: 0 },
    summary: { type: "string" },
  },
  additionalProperties: false,
} as const;

async function gather(args: Record<string, unknown>): Promise<ContextResult> {
  const message = args.message;
  if (!message || typeof message !== "string" || message.trim() === "") {
    return { noWork: true, reason: "no --message arg provided" };
  }
  return { noWork: false, context: { message: message.trim() } };
}

export const echoSkill: Skill = {
  manifest: {
    name: "echo",
    description:
      "Day-1 smoke test for the bj ai skill layer. Echoes a message via Claude and validates the full pipeline.",
    model: "claude-haiku-4-5",
    maxTokensOut: 200,
    costCapPerRunUsd: 0.01,
    outputSchema: "embedded",
    visibility: "ben-only",
  },
  promptBody: PROMPT,
  outputSchema: OUTPUT_SCHEMA,
  gather,
};
