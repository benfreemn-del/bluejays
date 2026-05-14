import { getSupabase } from "./supabase";
import { logCost } from "./cost-logger";
import {
  loadKBChunks,
  pickRelevantTags,
  buildKBSystemBlock,
  type KBChunk,
} from "./hormozi-kb";

/**
 * Hormozi Diagnostic Agent.
 *
 * Input: free-text business description + optional structured fields
 * (revenue, lead sources, current offer, pricing, top complaint).
 *
 * Output: a Hormozi-style structured diagnosis — what's broken, the
 * single highest-leverage fix, a Grand Slam offer reframe, and the
 * close framing for a sales call.
 *
 * Architecture:
 *   · Cheap tag picker selects ~5 KB chunks relevant to the business
 *   · KB chunks become the cached system prompt (1-time cost per tag
 *     set + 5-min TTL → most calls hit cache)
 *   · Claude returns strict JSON; we validate, store, return
 *   · Every run is logged to `hormozi_diagnostics` with tokens + cost
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
// Diagnostic agent runs on Opus 4.7 by default. The 1M context window
// fits the entire Hormozi KB in a single cached system prompt — caching
// makes the cost-per-diagnosis identical to sonnet within the 5-min TTL.
const MODEL = process.env.HORMOZI_AGENT_MODEL || "claude-opus-4-7";

// Sonnet 4: ~$3/1M input cached at $0.30/1M; $15/1M output. A typical
// diagnosis is ~6k cached input + 500 fresh input + 1500 output ≈ $0.026
// uncached or ~$0.024 cached after the first run. Round up for logging.
const ESTIMATED_COST_USD = 0.03;

export interface DiagnosticInput {
  /** Free-text dump — what the prospect said on the call */
  businessText: string;
  /** Optional structured fields — set whatever Madie captured */
  businessName?: string;
  category?: string;
  monthlyRevenue?: string;
  leadSources?: string;
  currentOffer?: string;
  pricing?: string;
  topComplaint?: string;
  /** Prospect row to attach the run to (optional) */
  prospectId?: string;
  /**
   * Optional attachments — screenshots of their site / GBP, P&L PDFs,
   * ad-account snapshots, etc. Each entry carries the raw base64 bytes
   * so we can forward them to Claude as image or document blocks.
   * Only the metadata (name/type/size) is persisted to the row;
   * the bytes are dropped after the API call.
   */
  files?: AttachedFile[];
}

export interface AttachedFile {
  name: string;
  /** e.g. image/png, image/jpeg, image/webp, image/gif, application/pdf */
  mediaType: string;
  /** Raw base64 (no `data:` prefix) */
  base64: string;
  /** Original byte size for logging — optional */
  sizeBytes?: number;
}

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);
const SUPPORTED_DOC_TYPES = new Set(["application/pdf"]);

export interface Diagnosis {
  one_line_summary: string;
  bottleneck: {
    label: string;
    explanation: string;
    framework_cited: string;
  };
  three_problems: Array<{
    title: string;
    why_it_matters: string;
    framework_cited: string;
  }>;
  grand_slam_offer: {
    headline: string;
    dream_outcome: string;
    proof_or_guarantee: string;
    time_to_first_win: string;
    bonus_stack: string[];
  };
  close_frame: {
    one_sentence_pitch: string;
    objection_handler: string;
    call_to_action: string;
  };
  follow_ups: string[];
}

interface DiagnoseResult {
  diagnosis: Diagnosis;
  runId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  durationMs: number;
  chunksUsed: number;
}

function buildUserPrompt(input: DiagnosticInput): string {
  const lines: string[] = ["PROSPECT CONTEXT:"];
  if (input.businessName) lines.push(`Business: ${input.businessName}`);
  if (input.category) lines.push(`Category: ${input.category}`);
  if (input.monthlyRevenue) lines.push(`Monthly revenue: ${input.monthlyRevenue}`);
  if (input.leadSources) lines.push(`Current lead sources: ${input.leadSources}`);
  if (input.currentOffer) lines.push(`Current offer: ${input.currentOffer}`);
  if (input.pricing) lines.push(`Pricing: ${input.pricing}`);
  if (input.topComplaint) lines.push(`Top complaint: ${input.topComplaint}`);
  if (input.files && input.files.length > 0) {
    lines.push("");
    lines.push(
      `Attachments (already included as image/document blocks above): ${input.files
        .map((f) => `${f.name} [${f.mediaType}]`)
        .join(", ")}.`,
    );
    lines.push(
      "Pull concrete details out of them — pricing, screenshots of their site, ads, P&L numbers, GBP listing — and fold the most relevant ones into the diagnosis. Cite which attachment a number came from.",
    );
  }
  lines.push("");
  lines.push("What they said:");
  lines.push(input.businessText.trim());
  lines.push("");
  lines.push("Run the diagnosis. Respond ONLY with the JSON object specified.");
  return lines.join("\n");
}

const RESPONSE_SCHEMA_INSTRUCTIONS = `
Respond with a single JSON object — no prose before or after, no markdown
code fences. Exact shape:

{
  "one_line_summary": "string — the diagnosis in one sentence",
  "bottleneck": {
    "label": "the single biggest constraint (e.g. 'No lead generation system')",
    "explanation": "2-3 sentences on why this is the bottleneck",
    "framework_cited": "title of the KB chunk that applies (e.g. 'Core Four Lead Generation')"
  },
  "three_problems": [
    { "title": "...", "why_it_matters": "...", "framework_cited": "..." },
    { "title": "...", "why_it_matters": "...", "framework_cited": "..." },
    { "title": "...", "why_it_matters": "...", "framework_cited": "..." }
  ],
  "grand_slam_offer": {
    "headline": "the new headline offer (one sentence, outcome-based)",
    "dream_outcome": "specific measurable result",
    "proof_or_guarantee": "what removes risk",
    "time_to_first_win": "what happens in week 1",
    "bonus_stack": ["bonus 1 with stated value", "bonus 2 ...", "bonus 3 ..."]
  },
  "close_frame": {
    "one_sentence_pitch": "the sentence to say on the call",
    "objection_handler": "how to handle their most likely pushback",
    "call_to_action": "what to ask them to do next"
  },
  "follow_ups": ["next step 1", "next step 2", "next step 3"]
}

Be specific to THIS prospect — no generic platitudes. Use their numbers
when they gave numbers. Cite framework titles verbatim from the KB.`;

const SYSTEM_PREAMBLE = `You are a Hormozi-trained business diagnostician used inside
BlueJays' sales tooling. Madie or Ben briefs you on a prospect; you
return a sharp, opinionated, specific diagnosis they can read live on
the call.

Style: blunt, numbers-first, no jargon dump. You sound like Alex
Hormozi delivering bad news kindly — direct, concrete, with the
specific lever to pull.

Method: identify the single biggest bottleneck (offer / leads /
conversion / churn / pricing), then propose the Grand Slam offer
reframe and the close. Always tie each claim to a framework you cite
by name.`;

/**
 * Run a diagnosis end-to-end. Stores the row in `hormozi_diagnostics`,
 * logs cost, returns the parsed diagnosis + meta.
 */
export async function diagnose(input: DiagnosticInput): Promise<DiagnoseResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const startedAt = Date.now();
  const tags = pickRelevantTags(input.businessText);
  const chunks: KBChunk[] = await loadKBChunks(tags);
  const kbBlock = buildKBSystemBlock(chunks);

  const systemSegments = [
    { type: "text" as const, text: SYSTEM_PREAMBLE },
    {
      type: "text" as const,
      text: `\n\n=== HORMOZI KNOWLEDGE BASE ===\n${kbBlock}\n\n=== OUTPUT FORMAT ===\n${RESPONSE_SCHEMA_INSTRUCTIONS}`,
      cache_control: { type: "ephemeral" as const },
    },
  ];

  const userPrompt = buildUserPrompt(input);
  const fileBlocks = buildFileContentBlocks(input.files);
  const userContent =
    fileBlocks.length === 0
      ? userPrompt
      : [...fileBlocks, { type: "text" as const, text: userPrompt }];

  const resp = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: systemSegments,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Claude API ${resp.status}: ${errText.slice(0, 300)}`);
  }

  const data = await resp.json();
  const text: string = data.content?.[0]?.text ?? "";
  const inputTokens = data.usage?.input_tokens ?? 0;
  const outputTokens = data.usage?.output_tokens ?? 0;
  const durationMs = Date.now() - startedAt;

  const diagnosis = parseDiagnosisJson(text);

  const fileMeta = (input.files ?? []).map((f) => ({
    name: f.name,
    mediaType: f.mediaType,
    sizeBytes: f.sizeBytes ?? null,
  }));
  // Strip base64 bytes from the persisted row so JSONB doesn't bloat;
  // metadata (name/type/size) is enough for the audit trail.
  const { files: _files, ...inputWithoutBytes } = input;
  void _files;

  const sb = getSupabase();
  const { data: row, error: insErr } = await sb
    .from("hormozi_diagnostics")
    .insert({
      prospect_id: input.prospectId ?? null,
      business_input: {
        ...inputWithoutBytes,
        attachments: fileMeta,
        chunks_used: chunks.length,
        tags,
      },
      diagnosis,
      model: MODEL,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: ESTIMATED_COST_USD,
      duration_ms: durationMs,
    })
    .select("id")
    .single();
  if (insErr) {
    console.error("[hormozi-agent] failed to persist diagnosis:", insErr.message);
  }

  await logCost({
    prospectId: input.prospectId,
    service: "claude",
    action: "hormozi_diagnosis",
    costUsd: ESTIMATED_COST_USD,
    metadata: { model: MODEL, chunks: chunks.length, tags },
  });

  return {
    diagnosis,
    runId: row?.id ?? "",
    model: MODEL,
    inputTokens,
    outputTokens,
    costUsd: ESTIMATED_COST_USD,
    durationMs,
    chunksUsed: chunks.length,
  };
}

type AnthropicContentBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: { type: "base64"; media_type: string; data: string };
    }
  | {
      type: "document";
      source: { type: "base64"; media_type: string; data: string };
    };

/**
 * Turn attached files into Anthropic content blocks. Images go in as
 * vision blocks; PDFs as document blocks. Unsupported types are dropped
 * silently — the textarea is still the primary input channel.
 */
function buildFileContentBlocks(files?: AttachedFile[]): AnthropicContentBlock[] {
  if (!files || files.length === 0) return [];
  const blocks: AnthropicContentBlock[] = [];
  for (const f of files) {
    if (!f.base64 || typeof f.base64 !== "string") continue;
    const data = f.base64.replace(/^data:[^;]+;base64,/, "");
    if (SUPPORTED_IMAGE_TYPES.has(f.mediaType)) {
      blocks.push({
        type: "image",
        source: { type: "base64", media_type: f.mediaType, data },
      });
    } else if (SUPPORTED_DOC_TYPES.has(f.mediaType)) {
      blocks.push({
        type: "document",
        source: { type: "base64", media_type: f.mediaType, data },
      });
    }
  }
  return blocks;
}

/**
 * Strip a leading ```json fence if present, then JSON.parse + validate
 * the response shape. Throws with the raw text on malformed output so
 * the caller can show it to Madie rather than swallow.
 */
function parseDiagnosisJson(raw: string): Diagnosis {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  }
  // Some models wrap with a stray sentence — try to extract the outermost {…}
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first > 0 && last > first) text = text.slice(first, last + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error(`Claude returned non-JSON: ${(e as Error).message}\n---\n${raw.slice(0, 500)}`);
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Claude diagnosis response was not an object");
  }
  return parsed as Diagnosis;
}
