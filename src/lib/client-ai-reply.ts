/**
 * client-ai-reply — drafts a contextual reply to an inbound lead using
 * Claude. Uses the brand voice doc + the lead's audience + intent +
 * raw_payload to produce a copy-paste-ready draft.
 *
 * Subscription gate: requires the client to have at least Claude
 * Starter ($49/mo, capability "claude.reply-draft"). See
 * client-subscriptions.ts.
 *
 * Cost model: passes through Anthropic API calls. Sonnet 4 at $3/MTok
 * input, $15/MTok output. A typical reply draft is ~500 input tokens
 * + ~250 output = $0.005/draft. Negligible.
 *
 * Voice: per-client. For Zenith we anchor on the TEKKY brand voice
 * doc — "coach-credible, not influencer-first" — and the founder
 * persona (Philip Lund). Other clients get their own voice config
 * (TODO: extract to per-client/{slug}-voice.ts when we onboard #2).
 */

import type { ClientLead } from "./client-leads";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export type ReplyDraft = {
  /** The drafted reply body, ready to copy/paste. */
  body: string;
  /** Suggested subject line (for email replies). */
  subject: string | null;
  /** Channel best-fit for this lead. */
  channel: "email" | "sms" | "either";
  /** Why this draft is what it is — shown to the owner under the draft. */
  rationale: string;
  /** Token usage stats so we can show "this cost ~$X" in the dashboard. */
  usage?: { input_tokens: number; output_tokens: number };
};

const ZENITH_SYSTEM_PROMPT = `You are Philip Lund, co-founder of Zenith Sports / TEKKY®.

VOICE:
  • Coach-credible. Not influencer-first.
  • Clear, not clever. Ambitious, not arrogant.
  • Real, not hype-driven. Coach to coach (or coach to parent).
  • Lead with substance. Skip the throat-clearing.

FORMAT:
  • 3-5 short paragraphs. SMS = 1 paragraph max.
  • One concrete next step. Never two CTAs in the same reply.
  • Sign with "— Philip" (no signature block, no titles).
  • Use TEKKY® on first mention. Plain "TEKKY" after.

REPLY RULES:
  • Match the lead's tone. If they wrote one line, write 2-3.
    If they asked questions, answer them in order.
  • Reference what they specifically asked for or said.
  • Concrete next step matched to their audience:
    - Parent → "Grab the TEKKY" or "Train the routine first"
    - Coach → "Free club demo" or "Free coaching guide PDF"
    - Player → "Try the V-Cut drill today" or "Tag your touches"
  • Never make up testimonials or claims.

Output JSON: { "body": "...", "subject": "...", "channel": "email|sms|either", "rationale": "..." }`;

/**
 * Draft a reply to a lead. Returns null if no Anthropic key is
 * configured (graceful degradation — UI shows "AI reply requires
 * Claude subscription").
 */
export async function draftLeadReply(args: {
  lead: ClientLead;
  /** Owner-supplied extra context, e.g. "they called me yesterday and said..." */
  ownerContext?: string;
}): Promise<ReplyDraft | null> {
  if (!ANTHROPIC_API_KEY) {
    return null; // gracefully degrade
  }

  // Only Zenith voice for now. Add per-slug system prompts here as we
  // onboard more clients.
  const systemPrompt =
    args.lead.client_slug === "zenith-sports"
      ? ZENITH_SYSTEM_PROMPT
      : DEFAULT_SYSTEM_PROMPT;

  const userPrompt = buildUserPrompt(args.lead, args.ownerContext);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("[ai-reply] Anthropic error:", res.status, txt.slice(0, 200));
      return null;
    }
    const data = (await res.json()) as {
      content: { type: string; text: string }[];
      usage?: { input_tokens: number; output_tokens: number };
    };
    const text = data.content?.[0]?.text ?? "";
    return parseDraft(text, data.usage);
  } catch (err) {
    console.error("[ai-reply] failed:", err);
    return null;
  }
}

const DEFAULT_SYSTEM_PROMPT = `Draft a warm, professional reply to this inbound lead. Match their tone. Single CTA. Sign as "— [Name]". Output JSON: { "body": "...", "subject": "...", "channel": "email|sms|either", "rationale": "..." }`;

function buildUserPrompt(lead: ClientLead, ownerContext?: string): string {
  const lines: string[] = [
    `Lead inbound from /clients/${lead.client_slug}.`,
    "",
    `Audience: ${lead.audience_segment ?? "(unclassified)"}`,
    `Intent: ${lead.intent ?? "(none stated)"}`,
    `Source: ${lead.source ?? "(unknown)"}`,
    `Name: ${lead.name ?? "(no name)"}`,
    `Email: ${lead.email ?? "(no email)"}`,
    `Phone: ${lead.phone ?? "(no phone)"}`,
    "",
    "Full submission payload:",
    "```json",
    JSON.stringify(lead.raw_payload, null, 2),
    "```",
  ];
  if (ownerContext) {
    lines.push("", "Owner-added context (act on this):", ownerContext);
  }
  lines.push(
    "",
    "Draft the reply. Output ONLY the JSON object — no markdown, no explanation outside the JSON.",
  );
  return lines.join("\n");
}

function parseDraft(
  text: string,
  usage?: { input_tokens: number; output_tokens: number },
): ReplyDraft | null {
  // Claude sometimes wraps JSON in code fences despite being told not to.
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<ReplyDraft>;
    if (!parsed.body) return null;
    return {
      body: parsed.body,
      subject: parsed.subject ?? null,
      channel: parsed.channel ?? "email",
      rationale: parsed.rationale ?? "",
      usage,
    };
  } catch {
    // Fallback — wrap the raw text as the body.
    return {
      body: cleaned || text,
      subject: null,
      channel: "either",
      rationale: "(could not parse structured output — raw draft above)",
      usage,
    };
  }
}
