/**
 * AI Responder — Handles inbound prospect replies with intelligent classification.
 *
 * Uses the agent-personality.ts voice and objection handling playbook to:
 * 1. Classify the prospect's intent (interested, objection, unsubscribe, question, etc.)
 * 2. Generate a reply using the BlueJays agent voice
 * 3. Trigger CRM status transitions based on the classification
 * 4. Pause the automated funnel when a prospect replies
 * 5. Escalate to Ben when needed (hot leads, angry responses, custom requests)
 */

import type { Prospect, ProspectStatus } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { updateProspect } from "./store";
import {
  AGENT_VOICE,
  PRICING_FRAMEWORK,
  OBJECTION_RESPONSES,
  CONTACT_RULES,
} from "./agent-personality";
import { logCost, COST_RATES } from "./cost-logger";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

export type IntentType =
  | "interested"
  | "question"
  | "objection"
  | "not_interested"
  | "unsubscribe"
  | "angry"
  | "neutral"
  | "custom_request";

interface IncomingMessage {
  from: string;
  subject?: string;
  body: string;
  channel: "email" | "sms";
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

function getSalesLinks(prospect: Prospect) {
  return {
    previewUrl: `${getBaseUrl()}${prospect.generatedSiteUrl || `/preview/${prospect.id}`}`,
    proposalUrl: `${getBaseUrl()}/proposal/${prospect.id}`,
    bookingUrl: `${getBaseUrl()}/book/${prospect.id}`,
    claimUrl: `${getBaseUrl()}/claim/${prospect.id}`,
  };
}

function ensureInterestedReplyLinks(reply: string | undefined, prospect: Prospect): string {
  const links = getSalesLinks(prospect);
  const baseReply = (reply || `Thanks for the interest in ${prospect.businessName}.`).trim();

  const hasBooking = baseReply.includes(links.bookingUrl) || /calendar|book a call|hop on a quick call/i.test(baseReply);
  const hasProposal = baseReply.includes(links.proposalUrl) || /proposal/i.test(baseReply);

  let nextReply = baseReply;
  if (!hasProposal) {
    nextReply += `\n\nI also put together a personalized proposal for ${prospect.businessName} here: ${links.proposalUrl}`;
  }
  if (!hasBooking) {
    nextReply += `\n\nWant to hop on a quick call so I can walk you through everything? Here's my calendar: ${links.bookingUrl}`;
  }

  return nextReply;
}

export interface AiResponse {
  shouldReply: boolean;
  reply?: string;
  escalate: boolean;
  escalateReason?: string;
  sentiment: "positive" | "neutral" | "negative" | "angry";
  intent: IntentType;
  newStatus?: ProspectStatus;
  pauseFunnel: boolean;
}

/**
 * Call the AI model to generate a response.
 * Uses Claude API if configured, otherwise falls back to OpenAI-compatible API.
 */
async function getAiResponse(prompt: string, prospectId?: string): Promise<string> {
  if (!CLAUDE_API_KEY && !process.env.OPENAI_API_KEY) {
    return getMockResponse(prompt);
  }

  // Try Claude first, then fall back to OpenAI-compatible
  if (CLAUDE_API_KEY) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    // Log AI cost
    await logCost({
      prospectId,
      service: "ai_response",
      action: "classify_and_respond",
      costUsd: COST_RATES.site_generation, // ~$0.003 per response
      metadata: { model: "claude-sonnet-4-20250514" },
    });

    const data = await response.json();
    return data.content[0].text;
  }

  // OpenAI-compatible fallback
  const { OpenAI } = await import("openai");
  const client = new OpenAI();
  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024,
  });

  await logCost({
    prospectId,
    service: "ai_response",
    action: "classify_and_respond",
    costUsd: COST_RATES.site_generation,
    metadata: { model: "gpt-4.1-mini" },
  });

  return completion.choices[0]?.message?.content || "";
}

/**
 * Mock response for development without API keys.
 */
function getMockResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("stop") || lower.includes("unsubscribe") || lower.includes("remove")) {
    return JSON.stringify({
      shouldReply: true,
      reply: "Absolutely — I've removed you from all future messages. Sorry for the bother, and I wish you and your business all the best!",
      escalate: false,
      sentiment: "neutral",
      intent: "unsubscribe",
      newStatus: "unsubscribed",
      pauseFunnel: true,
    });
  }

  if (lower.includes("angry") || lower.includes("spam") || lower.includes("lawsuit")) {
    return JSON.stringify({
      shouldReply: false,
      escalate: true,
      escalateReason: "Negative/angry response detected — needs manual review",
      sentiment: "angry",
      intent: "angry",
      newStatus: "unsubscribed",
      pauseFunnel: true,
    });
  }

  if (lower.includes("interested") || lower.includes("how much") || lower.includes("pricing") || lower.includes("love")) {
    return JSON.stringify({
      shouldReply: true,
      reply: "That's great to hear! I'd love to walk you through the details. I also put together a personalized proposal you can review, and if you'd like, we can hop on a quick call so I can walk you through everything.",
      escalate: true,
      escalateReason: "Prospect is interested — ready to close",
      sentiment: "positive",
      intent: "interested",
      newStatus: "interested",
      pauseFunnel: true,
    });
  }

  if (lower.includes("not interested") || lower.includes("no thanks")) {
    return JSON.stringify({
      shouldReply: true,
      reply: "No worries at all! I appreciate you letting me know. The preview site will stay up if you ever change your mind. Wishing you all the best!",
      escalate: false,
      sentiment: "neutral",
      intent: "not_interested",
      newStatus: "dismissed",
      pauseFunnel: true,
    });
  }

  return JSON.stringify({
    shouldReply: true,
    reply: "Thanks for getting back to me! I completely understand you might have questions. The website I built for you is fully custom — no cookie-cutter templates. It's mobile-friendly, fast-loading, and designed to bring in new customers. Would you like me to make any changes to the preview?",
    escalate: false,
    sentiment: "neutral",
    intent: "question",
    newStatus: "responded",
    pauseFunnel: true,
  });
}

/**
 * Build the AI prompt with full context from agent personality and objection playbook.
 */
function buildPrompt(prospect: Prospect, message: IncomingMessage): string {
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;
  const links = getSalesLinks(prospect);
  const previewUrl = links.previewUrl;
  const name = prospect.ownerName?.split(" ")[0] || "there";

  // Build objection handling reference
  const objectionRef = Object.entries(OBJECTION_RESPONSES)
    .map(([key, val]) => `  "${key}": "${val.response.substring(0, 150)}..."`)
    .join("\n");

  return `You are an AI sales assistant for BlueJays, a web design agency. A prospect has replied to your outreach.

AGENT VOICE:
- Tone: ${AGENT_VOICE.tone}
- Personality: ${AGENT_VOICE.personality}
- Core principle: ${AGENT_VOICE.corePrinciple}
- Key distinction: ${AGENT_VOICE.keyDistinction}
- NEVER say: ${AGENT_VOICE.neverSay.join(", ")}

PRICING:
- One-time: $${PRICING_FRAMEWORK.price}
- Annual management: $${PRICING_FRAMEWORK.yearlyManagement}/year
- Positioning: ${PRICING_FRAMEWORK.positioning}
- NEVER negotiate on price

OBJECTION PLAYBOOK:
${objectionRef}

STOP RULES (immediately stop all outreach if):
${CONTACT_RULES.stopImmediatelyIf.map((r) => `- ${r}`).join("\n")}

PROSPECT CONTEXT:
- Business: ${prospect.businessName} (${categoryLabel})
- Owner: ${name}
- Preview site: ${previewUrl}
- Personalized proposal: ${links.proposalUrl}
- Booking link: ${links.bookingUrl}
- Claim link: ${links.claimUrl}
- Current status: ${prospect.status}
- Channel: ${message.channel}

THEIR MESSAGE:
${message.subject ? `Subject: ${message.subject}\n` : ""}Body: ${message.body}

INSTRUCTIONS:
Analyze their message and respond as JSON with these exact fields:
1. "shouldReply" (boolean): Should the AI auto-reply? (false if angry/threatening or if escalating to human)
2. "reply" (string): The reply message body. Use the agent voice. Reference their business by name. Keep it short and genuine. Do NOT mention price unless they specifically ask. If intent is "interested", include the personalized proposal link and optionally suggest booking a call using the booking link.
3. "escalate" (boolean): Should this be escalated to Ben (the human owner)?
4. "escalateReason" (string): Why escalate? (empty string if not escalating)
5. "sentiment" (string): "positive", "neutral", "negative", or "angry"
6. "intent" (string): One of: "interested", "question", "objection", "not_interested", "unsubscribe", "angry", "neutral", "custom_request"
7. "newStatus" (string): The CRM status to transition to. One of: "responded", "interested", "claimed", "dismissed", "unsubscribed"
8. "pauseFunnel" (boolean): Should the automated funnel sequence be paused? (true for any reply)

ESCALATE to Ben if:
- They want to buy / ask about pricing (intent: "interested")
- They ask about custom features (intent: "custom_request")
- They're angry or threatening (intent: "angry")
- The AI isn't confident in its answer

STATUS TRANSITION RULES:
- If they reply at all (any intent): at minimum "responded"
- If they express interest or ask about pricing: "interested"
- If they say "not interested" / "pass" / "no thanks": "dismissed"
- If they say "stop" / "unsubscribe" / "remove me": "unsubscribed"

Respond ONLY with valid JSON. No markdown, no code fences.`;
}

/**
 * Process an incoming message (email or SMS) from a prospect.
 * Classifies intent, generates a reply, and updates CRM status.
 */
export async function processIncomingMessage(
  prospect: Prospect,
  message: IncomingMessage
): Promise<AiResponse> {
  console.log(
    `  Processing ${message.channel} reply from ${prospect.businessName}: "${(message.subject || message.body).substring(0, 60)}"`
  );

  // First: always pause the funnel when a prospect replies
  await updateProspect(prospect.id, { funnelPaused: true });

  // Check for immediate unsubscribe keywords (don't even need AI for these)
  const lowerBody = message.body.toLowerCase();
  const unsubKeywords = ["stop", "unsubscribe", "remove me", "opt out", "don't contact", "do not contact", "take me off"];
  if (unsubKeywords.some((kw) => lowerBody.includes(kw))) {
    console.log(`  Unsubscribe detected for ${prospect.businessName} — stopping all outreach`);
    await updateProspect(prospect.id, {
      status: "unsubscribed",
      funnelPaused: true,
    });
    return {
      shouldReply: true,
      reply: `Absolutely — I've removed you from all future messages. Sorry for the bother, and I wish you and ${prospect.businessName} all the best!`,
      escalate: false,
      sentiment: "neutral",
      intent: "unsubscribe",
      newStatus: "unsubscribed",
      pauseFunnel: true,
    };
  }

  // Build prompt and get AI response
  const prompt = buildPrompt(prospect, message);
  const responseText = await getAiResponse(prompt, prospect.id);

  try {
    // Parse AI response — handle potential markdown code fences
    const cleanText = responseText.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed: AiResponse = JSON.parse(cleanText);

    // Ensure pauseFunnel is always true when a prospect replies
    parsed.pauseFunnel = true;

    if (parsed.intent === "interested") {
      parsed.reply = ensureInterestedReplyLinks(parsed.reply, prospect);
    }

    // Apply CRM status transition
    if (parsed.newStatus) {
      await updateProspect(prospect.id, {
        status: parsed.newStatus,
        funnelPaused: true,
      });
    } else {
      // Default: at least mark as responded
      await updateProspect(prospect.id, {
        status: "responded",
        funnelPaused: true,
      });
    }

    return parsed;
  } catch {
    // If AI doesn't return valid JSON, escalate to Ben
    console.error(`  Failed to parse AI response for ${prospect.businessName}`);
    await updateProspect(prospect.id, {
      status: "responded",
      funnelPaused: true,
    });
      return {
        shouldReply: false,
        escalate: true,
        escalateReason: "Could not parse AI response — needs manual review",
        sentiment: "neutral",
        intent: "neutral",
        pauseFunnel: true,
      };

  }
}

/**
 * Legacy compatibility wrapper — maps old processIncomingEmail to new processIncomingMessage.
 */
export async function processIncomingEmail(
  prospect: Prospect,
  email: { from: string; subject: string; body: string }
): Promise<AiResponse> {
  return processIncomingMessage(prospect, {
    from: email.from,
    subject: email.subject,
    body: email.body,
    channel: "email",
  });
}

export function isAiResponderConfigured(): boolean {
  return !!(CLAUDE_API_KEY || process.env.OPENAI_API_KEY);
}
