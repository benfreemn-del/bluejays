/**
 * Hyperloop — AI variant generation (the secret sauce).
 *
 * Per Ben's design (1C 7A): given current winners + losers per kind,
 * Claude generates 3-5 NEW variants that explore different angles
 * while staying in the winner's neighborhood. The new variants seed
 * the next round of testing.
 *
 * Cost model: Claude Sonnet 4.6 at $3/$15 per MTok. Each generation
 * call is ~1k input + 1k output tokens ≈ $0.018. At 5 calls per kind
 * × 8 kinds × 1 cron/wk = ~$0.72/wk. Well under the $50/wk hard cap
 * (Q6B), but the cap is enforced anyway as a circuit breaker.
 *
 * Mock-mode safe: when ANTHROPIC_API_KEY is absent, returns 3
 * deterministic stub variants per call so dev/CI flow without
 * burning credits.
 *
 * Rule 61: 3rd-grade tone enforced in every prompt.
 */

import { logCost } from "./cost-logger";

const CLAUDE_MODEL = "claude-sonnet-4-6";
const CLAUDE_INPUT_RATE = 3.0 / 1_000_000;
const CLAUDE_OUTPUT_RATE = 15.0 / 1_000_000;

export type VariantKind =
  | "ad_copy_meta"
  | "ad_copy_google"
  | "audit_prompt"
  | "email_subject_pitch"
  | "email_subject_followup"
  | "cta_text_audit_buy"
  | "cta_text_audit_preview"
  | "sms_body_pitch";

export interface ExistingVariant {
  id: string;
  variantName: string;
  content: Record<string, unknown>;
  conversionRate: number;
  impressions: number;
  conversions: number;
  verdict: "winner" | "loser" | "testing" | "insufficient_data";
}

export interface GeneratedVariant {
  variantName: string;
  content: Record<string, unknown>;
  rationale: string; // why Claude thinks this might beat the winner
}

export interface VariantGenResult {
  variants: GeneratedVariant[];
  costUsd: number;
  modelUsed: string;
  error?: string;
}

/**
 * Per-kind output schemas. The AI gets the schema + examples per kind
 * so the JSON it returns drops cleanly into hyperloop_variants.content.
 */
const KIND_SCHEMAS: Record<VariantKind, { description: string; schema: string; example: string }> = {
  ad_copy_meta: {
    description:
      "Meta (Facebook/Instagram) ad copy. Targets US small business owners. Drives to free website audit landing page.",
    schema: `{ "headline": "<= 30 chars", "primaryText": "<= 90 chars", "cta": "Learn More" | "Get Quote" | "Sign Up" }`,
    example: `{ "headline": "Why aren't customers calling?", "primaryText": "60-sec audit shows the leak. Free. No card.", "cta": "Learn More" }`,
  },
  ad_copy_google: {
    description: "Google Search ads. Keyword-driven, intent-heavy.",
    schema: `{ "headlines": ["<= 30 chars", ...3 total], "descriptions": ["<= 90 chars", ...2 total] }`,
    example: `{ "headlines": ["Free Website Audit", "60-Second Score", "See What's Costing You"], "descriptions": ["Find out why your site isn't booking jobs.", "Free. 60 seconds. No signup needed."] }`,
  },
  audit_prompt: {
    description: "Internal audit-generation prompt fed to the AI. Drives the tone/quality of the audit report.",
    schema: `{ "systemPrompt": "<full prompt text>" }`,
    example: `{ "systemPrompt": "You are auditing a small-business website..." }`,
  },
  email_subject_pitch: {
    description: "Cold email pitch subject line. Sent from bluejaycontactme@gmail.com.",
    schema: `{ "subject": "<= 50 chars" }`,
    example: `{ "subject": "Made something for {Business}" }`,
  },
  email_subject_followup: {
    description: "Follow-up email subject (Re: thread). Lower commitment, soft re-prompt.",
    schema: `{ "subject": "<= 50 chars" }`,
    example: `{ "subject": "Re: {Business}" }`,
  },
  cta_text_audit_buy: {
    description: "Primary buy CTA on the audit-report page. Currently 'Start with 3 × $349' / 'Or $997 once'.",
    schema: `{ "primary": "<= 24 chars", "secondary": "<= 24 chars" }`,
    example: `{ "primary": "Start with 3 × $349", "secondary": "Or $997 once" }`,
  },
  cta_text_audit_preview: {
    description: "'Get my preview' CTA in the 3-CTA hub. Slow-yes lead-capture path.",
    schema: `{ "label": "<= 24 chars", "subline": "<= 32 chars" }`,
    example: `{ "label": "Build mine →", "subline": "We'll build it in 48 hours" }`,
  },
  sms_body_pitch: {
    description: "Initial pitch SMS to opted-in prospects. Must end with 'Reply STOP to opt out'.",
    schema: `{ "body": "<= 160 chars including STOP boilerplate" }`,
    example: `{ "body": "Hey {Name}, Ben from BlueJays — built a site for {Business}: {url} Take a look. Reply STOP to opt out" }`,
  },
};

/**
 * Build the Claude prompt for a single kind. Includes:
 *   - Tone rules (3rd grade, banned words, yes words)
 *   - Schema + example for the output JSON
 *   - Top 3 winners (with their content + metrics) — to seed direction
 *   - Top 3 losers (with their content + metrics) — to avoid repeating
 *   - Number of variants requested
 */
function buildPrompt(args: {
  kind: VariantKind;
  winners: ExistingVariant[];
  losers: ExistingVariant[];
  count: number;
}): string {
  const schema = KIND_SCHEMAS[args.kind];
  const winnersStr = args.winners.length
    ? args.winners
        .map(
          (w, i) =>
            `WINNER ${i + 1}: ${JSON.stringify(w.content)}\n  (${w.conversions}/${w.impressions} = ${(w.conversionRate * 100).toFixed(2)}% CR)`,
        )
        .join("\n")
    : "(no winners yet — use the example as the seed)";

  const losersStr = args.losers.length
    ? args.losers
        .map(
          (l, i) =>
            `LOSER ${i + 1}: ${JSON.stringify(l.content)}\n  (${l.conversions}/${l.impressions} = ${(l.conversionRate * 100).toFixed(2)}% CR)`,
        )
        .join("\n")
    : "(no losers identified yet)";

  return `You are improving ad/copy variants for BlueJays — an agency selling $997 custom websites + $100/yr to local small businesses (dental, electrician, plumber, etc.).

KIND: ${args.kind}
WHAT THIS IS: ${schema.description}

OUTPUT JSON SCHEMA (each variant must conform):
${schema.schema}

EXAMPLE:
${schema.example}

CURRENT TOP PERFORMERS (build on these patterns):
${winnersStr}

CURRENT UNDERPERFORMERS (avoid these patterns):
${losersStr}

TONE — non-negotiable:
- 3rd-grade reading level. Write like you're texting a friend.
- Short words (most under 6 letters). Short sentences (under 12 words).
- BANNED words: optimize, leverage, enhance, streamline, maximize, utilize, facilitate, sub-optimal, prioritize, conversion, methodology, premium, professional, world-class, innovative, cutting-edge.
- YES words: fix, swap, drop, slow, fast, big, small, lose, win, miss, beat, grab, lift, sink, leak, broken.
- Address the owner as "you". Lead with cost (lost customers, missed jobs, wasted money).
- If a 9-year-old can't read it, rewrite it.

GENERATE ${args.count} new variants. Each variant must:
1. Conform to the schema above (drop-in JSON for hyperloop_variants.content)
2. Stay close to the winner pattern but explore a different angle (different pain anchor, different number, different verb)
3. Be measurably DIFFERENT from existing variants — no near-duplicates
4. Include a one-line "rationale" explaining why this variant might beat the winner

Return STRICT JSON ONLY:
{
  "variants": [
    {
      "variantName": "<short slug, kebab-case, e.g. 'angle-money-leak'>",
      "content": <object matching schema>,
      "rationale": "<one sentence>"
    }
  ]
}

JSON only. No prose before/after.`;
}

/**
 * Pull from Anthropic. Returns generated variants + actual cost.
 */
export async function generateVariants(args: {
  kind: VariantKind;
  winners: ExistingVariant[];
  losers: ExistingVariant[];
  count?: number;
  prospectId?: string; // for cost-logger attribution; optional for Hyperloop runs
}): Promise<VariantGenResult> {
  const count = args.count ?? 5;

  if (!process.env.ANTHROPIC_API_KEY) {
    return mockGenerate(args.kind, count);
  }

  const prompt = buildPrompt({ ...args, count });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        variants: [],
        costUsd: 0,
        modelUsed: CLAUDE_MODEL,
        error: `Anthropic API ${res.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = await res.json();
    const text: string = data.content?.[0]?.text || "";
    const tokensIn = data.usage?.input_tokens || 0;
    const tokensOut = data.usage?.output_tokens || 0;
    const costUsd = tokensIn * CLAUDE_INPUT_RATE + tokensOut * CLAUDE_OUTPUT_RATE;

    // Log cost (Rule: every AI call MUST log cost)
    await logCost({
      prospectId: args.prospectId,
      service: "anthropic",
      action: `hyperloop.gen.${args.kind}`,
      costUsd,
      metadata: { tokensIn, tokensOut, kind: args.kind, count },
    }).catch(() => {});

    const parsed = parseVariants(text);
    return {
      variants: parsed,
      costUsd,
      modelUsed: CLAUDE_MODEL,
    };
  } catch (err) {
    return {
      variants: [],
      costUsd: 0,
      modelUsed: CLAUDE_MODEL,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Best-effort JSON parser — Claude usually returns clean JSON but
 * sometimes wraps in code fences or adds a sentence of preamble.
 */
function parseVariants(text: string): GeneratedVariant[] {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    const blockMatch = candidate.match(/\{[\s\S]*\}/);
    if (!blockMatch) return [];
    try {
      parsed = JSON.parse(blockMatch[0]);
    } catch {
      return [];
    }
  }

  if (!parsed || typeof parsed !== "object") return [];
  const obj = parsed as { variants?: unknown };
  if (!Array.isArray(obj.variants)) return [];

  return obj.variants
    .map((v): GeneratedVariant | null => {
      if (!v || typeof v !== "object") return null;
      const r = v as Record<string, unknown>;
      const variantName = typeof r.variantName === "string" ? r.variantName.trim() : null;
      const content = r.content && typeof r.content === "object" ? (r.content as Record<string, unknown>) : null;
      const rationale = typeof r.rationale === "string" ? r.rationale.trim() : "";
      if (!variantName || !content) return null;
      return { variantName, content, rationale };
    })
    .filter((v): v is GeneratedVariant => v !== null);
}

/**
 * Mock generator — used when ANTHROPIC_API_KEY is absent. Returns
 * deterministic stub variants so the cron logic exercises end-to-end
 * in dev without burning credits.
 */
function mockGenerate(kind: VariantKind, count: number): VariantGenResult {
  const example = JSON.parse(KIND_SCHEMAS[kind].example) as Record<string, unknown>;
  const variants: GeneratedVariant[] = [];
  for (let i = 0; i < count; i++) {
    variants.push({
      variantName: `mock-${kind}-${i + 1}`,
      content: { ...example, _mock: true, _index: i },
      rationale: `(mock) Stub variant #${i + 1} — set ANTHROPIC_API_KEY for real generation.`,
    });
  }
  return { variants, costUsd: 0, modelUsed: "mock_claude" };
}
