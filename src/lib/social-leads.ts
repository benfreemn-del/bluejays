/**
 * social-leads.ts — capture & classify social posts, draft a personal
 * opener in Ben's voice.
 *
 * Flow (SMS-first):
 *   1. Ben sees a relevant FB/X/LI post on his phone
 *   2. Texts the URL (or pastes the post text) to his Twilio number
 *   3. /api/inbound/sms detects the marker + routes to captureSocialLead()
 *   4. We classify the intent, scrape the post if possible, draft a
 *      2-line opener Ben can copy-paste into FB Messenger / Twitter DM
 *   5. SMS the draft back to Ben within ~10s
 *
 * The drafted message is always plain text Ben can fire as-is. Tone
 * matches Ben's voice (lowercase, direct, value-first). No "Hi, I came
 * across your post" corporate-speak.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { emitSignal } from "@/lib/agent-signals";

export type SocialLead = {
  id: string;
  platform: string;
  post_url: string | null;
  raw_text: string;
  author_name: string | null;
  author_handle: string | null;
  author_business: string | null;
  author_role: string | null;
  intent: string | null;
  intent_confidence: number | null;
  classification_summary: string | null;
  drafted_message: string | null;
  drafted_at: string | null;
  status: string;
  sent_at: string | null;
  replied_at: string | null;
  closed_at: string | null;
  prospect_id: string | null;
  captured_via: string;
  created_at: string;
  updated_at: string;
};

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Detect platform from a URL. Returns null if we can't tell.
 */
export function detectPlatform(url: string): string | null {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, "");
    if (h.includes("facebook.com") || h.includes("fb.com")) return "facebook";
    if (h.includes("twitter.com") || h === "x.com") return "twitter";
    if (h.includes("linkedin.com")) return "linkedin";
    if (h.includes("reddit.com")) return "reddit";
    if (h.includes("instagram.com")) return "instagram";
    if (h.includes("threads.net")) return "threads";
    return "other";
  } catch {
    return null;
  }
}

/**
 * Heuristic: does this SMS body look like a social-lead capture?
 * Triggers if it contains a known social URL OR starts with "fb:" /
 * "social:" / "x:" prefix.
 */
export function looksLikeSocialCapture(body: string): boolean {
  const trimmed = body.trim();
  if (/^(fb|social|x|li|reddit):\s/i.test(trimmed)) return true;
  if (/(facebook\.com|fb\.com|twitter\.com|x\.com|linkedin\.com|reddit\.com|threads\.net|instagram\.com)/i.test(trimmed)) {
    return true;
  }
  return false;
}

/**
 * Pull the URL (if any) and the surrounding text from a captured SMS
 * body. Strips known prefixes like "fb: " before returning the body.
 */
function parseCaptureBody(body: string): { url: string | null; text: string } {
  let cleaned = body.trim().replace(/^(fb|social|x|li|reddit):\s*/i, "");
  const urlMatch = cleaned.match(/https?:\/\/[^\s]+/i);
  const url = urlMatch ? urlMatch[0] : null;
  if (url) cleaned = cleaned.replace(url, "").trim();
  return { url, text: cleaned || (url ? `(post at ${url})` : "(no text provided)") };
}

/**
 * Classify the post + draft an opener via Claude. Returns null if no
 * API key configured (caller falls back to a generic "thanks for the
 * post, want to chat?" template).
 */
async function classifyAndDraft(
  rawText: string,
  url: string | null,
): Promise<{
  intent: string;
  confidence: number;
  summary: string;
  authorRole: string | null;
  draft: string;
} | null> {
  if (!ANTHROPIC_API_KEY) return null;

  const system = `You are Ben Freeman's outbound DM drafter. Ben runs BlueJays — an AI marketing system for service businesses (electricians, contractors, real-estate agents, manufacturers). He charges $10,000 for the AI Package.

Your job: read a social post (Facebook, X, LinkedIn, Reddit) and:
1. Classify the author's intent (one of):
   - "integrate-claude": they want to use Claude/AI in their business
   - "learn-about-ai": they're asking how AI works, exploring
   - "hire-builder": they want to hire someone to build with AI
   - "showcase": they're showing off something they built
   - "complain": they're frustrated with AI / a tool
   - "other"
2. Identify the author's likely role (realtor, consultant, agency owner, dev, manufacturer, other) — be specific.
3. Draft a 2-line DM in Ben's voice. Rules:
   - lowercase, casual, direct
   - reference SOMETHING SPECIFIC from their post
   - one sentence of substance, one sentence of soft CTA
   - never use "I came across your post" / "I noticed" / corporate openers
   - never pitch the $10,000 package directly in the first message
   - tone: helpful peer, not vendor

Output JSON only:
{
  "intent": "...",
  "confidence": 0.0-1.0,
  "summary": "one-line: who this is + what they want",
  "authorRole": "realtor" | "consultant" | etc,
  "draft": "the 2-line message"
}`;

  const user = `Platform: ${url ? detectPlatform(url) : "unknown"}
URL: ${url || "(no url)"}
Post text:
"""
${rawText.slice(0, 2000)}
"""

Classify and draft.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251015",
        max_tokens: 600,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!r.ok) {
      console.warn("[social-leads] classify failed:", await r.text());
      return null;
    }
    const j = await r.json();
    const text = j.content?.[0]?.text || "";
    // Strip code fences if Claude wrapped JSON in ```json...```
    const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      intent: String(parsed.intent || "other"),
      confidence: Number(parsed.confidence || 0.5),
      summary: String(parsed.summary || ""),
      authorRole: parsed.authorRole ? String(parsed.authorRole) : null,
      draft: String(parsed.draft || "").trim(),
    };
  } catch (err) {
    console.warn("[social-leads] classify error:", err);
    return null;
  }
}

/**
 * Capture a social lead end-to-end. Returns the inserted row id +
 * the drafted message (so the caller can SMS it back to Ben).
 */
export async function captureSocialLead(input: {
  rawBody: string;
  capturedVia: "sms" | "dashboard" | "cli";
}): Promise<{
  id: string | null;
  drafted: string;
  summary: string;
  intent: string;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const { url, text } = parseCaptureBody(input.rawBody);
  const platform = url ? detectPlatform(url) || "other" : "other";

  const ai = await classifyAndDraft(text, url);

  const drafted = ai?.draft ||
    `saw your post — happy to share what's actually working with claude in production right now if it helps. no pitch, just trade notes.`;

  const summary =
    ai?.summary ||
    `${platform} post · ${text.slice(0, 80)}${text.length > 80 ? "…" : ""}`;

  const intent = ai?.intent || "other";

  const { data, error } = await supabase
    .from("social_leads")
    .insert({
      platform,
      post_url: url,
      raw_text: text,
      author_role: ai?.authorRole ?? null,
      intent,
      intent_confidence: ai?.confidence ?? null,
      classification_summary: summary,
      drafted_message: drafted,
      drafted_at: new Date().toISOString(),
      captured_via: input.capturedVia,
    })
    .select("id")
    .single();

  if (error) {
    console.warn("[social-leads] insert failed:", error.message);
    return null;
  }

  // Ping the agent_signals bus so the daily digest can surface
  // outstanding social-lead drafts that Ben hasn't sent yet.
  await emitSignal({
    source: "social-leads",
    kind: "captured",
    severity: "notice",
    title: `Social lead captured (${platform}, ${intent})`,
    detail: summary,
    target: "daily-digest",
    metadata: { lead_id: data?.id, url, intent },
  });

  return {
    id: data?.id ?? null,
    drafted,
    summary,
    intent,
  };
}

/**
 * Mark a social lead as sent / replied / closed. Used by both the
 * dashboard "I sent it" button and an inbound SMS update.
 */
export async function updateSocialLeadStatus(
  id: string,
  status: SocialLead["status"],
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const patch: Record<string, unknown> = { status };
  if (status === "sent") patch.sent_at = new Date().toISOString();
  if (status === "replied") patch.replied_at = new Date().toISOString();
  if (status.startsWith("closed")) patch.closed_at = new Date().toISOString();
  const { error } = await supabase
    .from("social_leads")
    .update(patch)
    .eq("id", id);
  return !error;
}
