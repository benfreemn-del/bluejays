import { NextRequest, NextResponse } from "next/server";
import { getClientLead } from "@/lib/client-leads";
import { logCost } from "@/lib/cost-logger";

/**
 * POST /api/client-leads/[id]/classify
 *
 * Sends the lead's raw_payload + intent + source to Claude and asks
 * it to suggest an audience tag. Used by the dashboard's lead detail
 * drawer when detectAudience() couldn't auto-classify a lead — gives
 * Ben a one-click "🤖 Suggest" button instead of having to read the
 * raw payload himself.
 *
 * Returns JSON:
 *   { ok: true,
 *     suggestion: { audience: "parent" | "coach" | ..., confidence: 0-1, reasoning: "..." },
 *     leadId }
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ANTHROPIC_API_KEY =
  process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

// Per-client audience option lists. Mirror the ClientLeadAudience union
// so the model only suggests valid tags. If you add a new audience to
// detectAudience(), mirror it here.
const AUDIENCES_BY_CLIENT: Record<string, string[]> = {
  "zenith-sports": ["parent", "coach", "player", "club", "unknown"],
  "itc-quick-attach": [
    "hobbyist",
    "forester",
    "tym",
    "hunter",
    "dealer",
    "community",
    "unknown",
  ],
};

const FALLBACK_AUDIENCES = ["parent", "coach", "player", "club", "unknown"];

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Claude API key not configured" },
      { status: 500 },
    );
  }

  const lead = await getClientLead(id);
  if (!lead) {
    return NextResponse.json(
      { ok: false, error: "Lead not found" },
      { status: 404 },
    );
  }

  const audiences =
    AUDIENCES_BY_CLIENT[lead.client_slug] ?? FALLBACK_AUDIENCES;

  // Strip noisy fields from the payload before sending to the model so
  // we don't leak unrelated tracking data + keep the prompt small.
  const trimmed: Record<string, unknown> = {};
  const KEEP = [
    "role",
    "intent",
    "source",
    "ageGroup",
    "ageGroups",
    "skillLevel",
    "skillLevels",
    "formats",
    "timing",
    "timings",
    "state",
    "county",
    "lp",
    "tractor_model",
    "tractor",
    "quiz_use_case",
    "quiz_size",
    "quiz_brand",
    "message",
    "partner_role",
    "organization",
    "why_zenith",
    "playerName",
    "gender",
    "currentWeeklyHours",
  ];
  for (const k of KEEP) {
    if (k in lead.raw_payload && lead.raw_payload[k] !== "" && lead.raw_payload[k] !== null) {
      trimmed[k] = lead.raw_payload[k];
    }
  }

  const prompt = `You're classifying a lead for ${lead.client_slug}. Given the form-submission data below, pick the SINGLE best audience tag from this allowed list:

${audiences.join(", ")}

Lead data:
- Name: ${lead.name ?? "(unknown)"}
- Email: ${lead.email ?? "(unknown)"}
- Source: ${lead.source ?? "(unknown)"}
- Intent: ${lead.intent ?? "(unknown)"}
- Form fields: ${JSON.stringify(trimmed, null, 2)}

Respond ONLY with valid JSON in this exact shape (no preamble, no markdown):
{"audience": "<one of the allowed tags>", "confidence": 0.0-1.0, "reasoning": "<one sentence why>"}`;

  const start = Date.now();
  let suggestion: {
    audience: string;
    confidence: number;
    reasoning: string;
  };
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 200, // tight — we want a JSON blob, nothing more
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Claude API ${response.status}: ${txt.slice(0, 200)}`);
    }
    const data = (await response.json()) as {
      content: { type: string; text: string }[];
    };
    const raw = data.content[0]?.text ?? "";
    // Defensive — strip ```json fences if the model wrapped despite
    // the instruction to skip preamble.
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
    const parsed = JSON.parse(cleaned) as {
      audience: string;
      confidence: number;
      reasoning: string;
    };
    if (!audiences.includes(parsed.audience)) {
      // Model picked something outside the allowed set — coerce to
      // unknown so we don't write garbage to the DB if the user clicks
      // "Apply" without reading the suggestion.
      parsed.audience = "unknown";
      parsed.confidence = Math.min(parsed.confidence, 0.3);
    }
    suggestion = parsed;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error ? err.message : "Classification failed",
      },
      { status: 500 },
    );
  }

  // Best-effort cost log so the per-client spending dashboard counts
  // these against the right tenant. Haiku is cheap (~$0.001 per call).
  try {
    await logCost({
      service: "claude",
      action: "lead_classifier",
      costUsd: 0.001,
      metadata: { model: "claude-haiku-4-5", lead_id: id, slug: lead.client_slug },
    });
  } catch {
    /* non-fatal */
  }

  return NextResponse.json({
    ok: true,
    leadId: id,
    suggestion,
    elapsed_ms: Date.now() - start,
  });
}
