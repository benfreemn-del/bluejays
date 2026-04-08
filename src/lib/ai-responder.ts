/**
 * AI Responder — Handles inbound prospect replies with intelligent classification.
 *
 * Implements the full Sales Strategy Playbook:
 * 1. Classify the prospect's intent into 6 categories (interested, question,
 *    objection, not_interested, angry, unsubscribe) + custom_request/neutral
 * 2. Generate a reply using the BlueJays agent voice and objection scripts
 * 3. Apply the decision framework: checkout link vs calendar booking
 * 4. Trigger CRM status transitions based on intent-to-status mapping
 * 5. Pause the automated funnel when a prospect replies
 * 6. Escalate to Ben when needed per escalation rules
 */

import type { Prospect, ProspectStatus } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { updateProspect } from "./store";
import {
  AGENT_VOICE,
  PRICING_FRAMEWORK,
  OBJECTION_RESPONSES,
  CONTACT_RULES,
  CLOSE_DECISION_FRAMEWORK,
  ESCALATION_RULES,
  INTENT_STATUS_MAP,
} from "./agent-personality";
import { logCost, COST_RATES } from "./cost-logger";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CALENDAR_LINK = process.env.CALENDAR_LINK || "https://calendly.com/bluejays";
const CHECKOUT_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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

export interface AiResponse {
  shouldReply: boolean;
  reply?: string;
  escalate: boolean;
  escalateReason?: string;
  escalateUrgency?: "immediate" | "next-day";
  sentiment: "positive" | "neutral" | "negative" | "angry";
  intent: IntentType;
  newStatus?: ProspectStatus;
  pauseFunnel: boolean;
  closeAction?: "checkout" | "calendar" | "none";
  objectionType?: string;
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

// ═══════════════════════════════════════════════════════════════
// DECISION FRAMEWORK: Checkout vs Calendar Booking
// Based on Sales Strategy Playbook Part 4
// ═══════════════════════════════════════════════════════════════

/**
 * Determine whether to push checkout link (direct close) or calendar booking.
 * Returns "checkout" for direct close, "calendar" for booking with Ben, or "none".
 */
function determineCloseAction(
  prospect: Prospect,
  intent: IntentType,
  messageBody: string
): "checkout" | "calendar" | "none" {
  // Only relevant for interested prospects
  if (intent !== "interested" && intent !== "question" && intent !== "custom_request") {
    return "none";
  }

  const lowerBody = messageBody.toLowerCase();
  const category = prospect.category;

  // Custom requests always go to calendar
  if (intent === "custom_request") {
    return "calendar";
  }

  // High-value categories lean toward calendar booking for relationship building
  if (CLOSE_DECISION_FRAMEWORK.highValueCategories.includes(category)) {
    // Unless they're explicitly asking to buy right now
    if (lowerBody.includes("how do i get started") || lowerBody.includes("how do i buy") ||
        lowerBody.includes("take my money") || lowerBody.includes("ready to pay") ||
        lowerBody.includes("sign me up") || lowerBody.includes("i want it")) {
      return "checkout";
    }
    return "calendar";
  }

  // Lower-value categories can go direct close
  if (CLOSE_DECISION_FRAMEWORK.directCloseCategories.includes(category)) {
    if (intent === "interested") {
      return "checkout";
    }
  }

  // Prospect explicitly asks about pricing and is interested → direct close
  if (intent === "interested" && (
    lowerBody.includes("how much") || lowerBody.includes("pricing") ||
    lowerBody.includes("get started") || lowerBody.includes("sign up") ||
    lowerBody.includes("love it") || lowerBody.includes("looks great") ||
    lowerBody.includes("i want") || lowerBody.includes("how do i")
  )) {
    return "checkout";
  }

  // Questions about features/customization → calendar
  if (lowerBody.includes("custom") || lowerBody.includes("integration") ||
      lowerBody.includes("specific feature") || lowerBody.includes("can you add")) {
    return "calendar";
  }

  // Default: interested prospects get checkout, questions get calendar
  return intent === "interested" ? "checkout" : "calendar";
}

// ═══════════════════════════════════════════════════════════════
// ESCALATION RULES
// Based on Sales Strategy Playbook Part 5
// ═══════════════════════════════════════════════════════════════

/**
 * Determine if and how urgently to escalate to Ben.
 */
function determineEscalation(
  prospect: Prospect,
  intent: IntentType,
  messageBody: string
): { escalate: boolean; reason: string; urgency: "immediate" | "next-day" } {
  const lowerBody = messageBody.toLowerCase();

  // IMMEDIATE escalation triggers
  if (intent === "angry") {
    return {
      escalate: true,
      reason: "Angry/escalating response — needs immediate human intervention",
      urgency: "immediate",
    };
  }

  if (lowerBody.includes("speak to") || lowerBody.includes("talk to") ||
      lowerBody.includes("call me") || lowerBody.includes("human") ||
      lowerBody.includes("real person") || lowerBody.includes("manager") ||
      lowerBody.includes("owner")) {
    return {
      escalate: true,
      reason: "Prospect requested to speak with a human directly",
      urgency: "immediate",
    };
  }

  if (intent === "interested" && (
    lowerBody.includes("question") || lowerBody.includes("wondering") ||
    lowerBody.includes("can you") || lowerBody.includes("is it possible")
  )) {
    return {
      escalate: true,
      reason: "Purchase intent with questions agent may not fully answer",
      urgency: "immediate",
    };
  }

  // NEXT-DAY escalation triggers
  if (intent === "custom_request") {
    return {
      escalate: true,
      reason: "Prospect asking about custom work or enterprise features",
      urgency: "next-day",
    };
  }

  if (CLOSE_DECISION_FRAMEWORK.highValueCategories.includes(prospect.category) &&
      (intent === "interested" || intent === "question")) {
    return {
      escalate: true,
      reason: `High-value category (${prospect.category}) showing interest — personal follow-up recommended`,
      urgency: "next-day",
    };
  }

  // No escalation needed
  return { escalate: false, reason: "", urgency: "immediate" };
}

// ═══════════════════════════════════════════════════════════════
// OBJECTION DETECTION
// Based on Sales Strategy Playbook Part 3.3
// ═══════════════════════════════════════════════════════════════

/**
 * Detect specific objection type from message body.
 * Returns the objection key matching OBJECTION_RESPONSES or null.
 */
function detectObjectionType(body: string): string | null {
  const lower = body.toLowerCase();

  // "Too expensive" / price objection
  if (lower.includes("too expensive") || lower.includes("too much") ||
      lower.includes("can't afford") || lower.includes("out of my budget") ||
      lower.includes("$997 is a lot") || lower.includes("pricey") ||
      lower.includes("cheaper")) {
    if (lower.includes("cheaper") || lower.includes("discount") || lower.includes("deal")) {
      return "can you do it cheaper";
    }
    return "too expensive";
  }

  // "Already have a website"
  if (lower.includes("already have a website") || lower.includes("already have a site") ||
      lower.includes("have a website") || lower.includes("already got a") ||
      lower.includes("current website") || lower.includes("existing site")) {
    return "already have a website";
  }

  // "Have a developer"
  if (lower.includes("have a developer") || lower.includes("have a web guy") ||
      lower.includes("have a designer") || lower.includes("my developer") ||
      lower.includes("my web guy") || lower.includes("already have someone") ||
      lower.includes("have a dev")) {
    return "have a developer";
  }

  // "Bad timing" / "Not the right time"
  if (lower.includes("bad timing") || lower.includes("not the right time") ||
      lower.includes("not a good time") || lower.includes("need to think") ||
      lower.includes("think about it") || lower.includes("maybe later") ||
      lower.includes("not right now") || lower.includes("busy right now") ||
      lower.includes("come back later")) {
    return "bad timing";
  }

  // "What's included" — this is a question, not really an objection
  if (lower.includes("what's included") || lower.includes("what do i get") ||
      lower.includes("what does it include") || lower.includes("what comes with")) {
    return "what's included";
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// MOCK RESPONSE (for development without API keys)
// Now implements full playbook logic locally
// ═══════════════════════════════════════════════════════════════

function getMockResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  // Extract prospect context from prompt
  const businessNameMatch = prompt.match(/Business: (.+?) \(/);
  const businessName = businessNameMatch ? businessNameMatch[1] : "your business";
  const categoryMatch = prompt.match(/\(([^)]+)\)\n- Owner/);
  const category = categoryMatch ? categoryMatch[1] : "";

  // Unsubscribe / angry detection
  if (lower.includes("stop") || lower.includes("unsubscribe") || lower.includes("remove me") ||
      lower.includes("opt out") || lower.includes("don't contact")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `Absolutely — I've removed you from all future messages right away. I'm sorry for the bother, and I wish you and ${businessName} all the best!`,
      escalate: false,
      sentiment: "neutral",
      intent: "unsubscribe",
      newStatus: "unsubscribed",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  if (lower.includes("spam") || lower.includes("lawsuit") || lower.includes("report") ||
      lower.includes("harassment") || lower.includes("attorney general")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `Absolutely — I've removed you from all future messages right away. I'm sorry for the bother, and I wish you and ${businessName} all the best!`,
      escalate: true,
      escalateReason: "Angry/threatening response — immediate human intervention needed",
      escalateUrgency: "immediate",
      sentiment: "angry",
      intent: "angry",
      newStatus: "unsubscribed",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Not interested
  if (lower.includes("not interested") || lower.includes("no thanks") || lower.includes("pass") ||
      lower.includes("no thank you") || lower.includes("not for me")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `No worries at all! I appreciate you being straight with me. The site I built is yours to look at anytime if you change your mind. I wish you and ${businessName} all the best!`,
      escalate: false,
      sentiment: "neutral",
      intent: "not_interested",
      newStatus: "dismissed",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Objection: too expensive
  if (lower.includes("expensive") || lower.includes("too much") || lower.includes("can't afford") ||
      lower.includes("pricey") || lower.includes("$997")) {
    const objResp = OBJECTION_RESPONSES["too expensive"];
    return JSON.stringify({
      shouldReply: true,
      reply: objResp.response + (objResp.followUp ? "\n\n" + objResp.followUp : ""),
      escalate: false,
      sentiment: "neutral",
      intent: "objection",
      objectionType: "too expensive",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Objection: already have a website
  if (lower.includes("already have a website") || lower.includes("already have a site") ||
      lower.includes("have a website")) {
    const objResp = OBJECTION_RESPONSES["already have a website"];
    return JSON.stringify({
      shouldReply: true,
      reply: objResp.response + (objResp.followUp ? "\n\n" + objResp.followUp : ""),
      escalate: false,
      sentiment: "neutral",
      intent: "objection",
      objectionType: "already have a website",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Objection: have a developer
  if (lower.includes("have a developer") || lower.includes("have a web guy") ||
      lower.includes("my developer")) {
    const objResp = OBJECTION_RESPONSES["have a developer"];
    return JSON.stringify({
      shouldReply: true,
      reply: objResp.response,
      escalate: false,
      sentiment: "neutral",
      intent: "objection",
      objectionType: "have a developer",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Objection: bad timing
  if (lower.includes("bad timing") || lower.includes("not the right time") ||
      lower.includes("think about it") || lower.includes("maybe later") ||
      lower.includes("not right now")) {
    const objResp = OBJECTION_RESPONSES["bad timing"] || OBJECTION_RESPONSES["need to think about it"];
    return JSON.stringify({
      shouldReply: true,
      reply: objResp.response,
      escalate: false,
      sentiment: "neutral",
      intent: "objection",
      objectionType: "bad timing",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Interested / ready to buy
  if (lower.includes("interested") || lower.includes("love it") || lower.includes("looks great") ||
      lower.includes("how do i get started") || lower.includes("sign me up") ||
      lower.includes("i want it") || lower.includes("how much")) {
    // Determine close action based on category
    const isHighValue = CLOSE_DECISION_FRAMEWORK.highValueCategories.some(c => lower.includes(c));
    const closeAction = isHighValue ? "calendar" : "checkout";

    if (closeAction === "checkout") {
      return JSON.stringify({
        shouldReply: true,
        reply: `That's awesome to hear! The next step is simple — just head here to claim your site: ${CHECKOUT_BASE_URL}/claim/{prospectId}. It takes about 5 minutes, and once you're in, we'll customize everything to your exact preferences before it goes live. Any questions, just reply here!`,
        escalate: true,
        escalateReason: "Prospect is interested — ready to close",
        escalateUrgency: "immediate",
        sentiment: "positive",
        intent: "interested",
        newStatus: "interested",
        pauseFunnel: true,
        closeAction: "checkout",
      });
    } else {
      return JSON.stringify({
        shouldReply: true,
        reply: `Great question — there's a lot of flexibility in what we can do. Rather than try to explain it all over text, would it be easier to hop on a quick 10-minute call with Ben? He can walk you through exactly what's possible and answer anything you're wondering about. Here's his calendar: ${CALENDAR_LINK}`,
        escalate: true,
        escalateReason: "High-value prospect interested — calendar booking recommended",
        escalateUrgency: "immediate",
        sentiment: "positive",
        intent: "interested",
        newStatus: "interested",
        pauseFunnel: true,
        closeAction: "calendar",
      });
    }
  }

  // Custom request
  if (lower.includes("custom") || lower.includes("integration") || lower.includes("specific feature") ||
      lower.includes("can you add") || lower.includes("special request")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `Great question — there's a lot of flexibility in what we can do. Rather than try to explain it all over text, would it be easier to hop on a quick 10-minute call with Ben? He can walk you through exactly what's possible and answer anything you're wondering about. Here's his calendar: ${CALENDAR_LINK}`,
      escalate: true,
      escalateReason: "Custom feature request — needs Ben's input",
      escalateUrgency: "next-day",
      sentiment: "positive",
      intent: "custom_request",
      newStatus: "interested",
      pauseFunnel: true,
      closeAction: "calendar",
    });
  }

  // Wants to talk to a human
  if (lower.includes("speak to") || lower.includes("talk to") || lower.includes("call me") ||
      lower.includes("real person") || lower.includes("human")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `Absolutely! I'm going to have Ben reach out to you directly — he's the founder and can answer everything in detail. You'll hear from him within a few hours. In the meantime, your preview is still live!`,
      escalate: true,
      escalateReason: "Prospect requested human contact",
      escalateUrgency: "immediate",
      sentiment: "neutral",
      intent: "question",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "calendar",
    });
  }

  // General question / skepticism
  if (lower.includes("is this real") || lower.includes("scam") || lower.includes("legit")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `Totally fair question — there's a lot of sketchy stuff online. I'm Ben, and I run BlueJays. The site I built for you is 100% real and live right now. No credit card, no obligation to look. If you like it, we can talk about getting it on your domain. If not, no hard feelings at all.`,
      escalate: false,
      sentiment: "neutral",
      intent: "question",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Default: general question
  return JSON.stringify({
    shouldReply: true,
    reply: `Thanks for getting back to me! I completely understand you might have questions. The website I built for you is fully custom — no cookie-cutter templates. It's mobile-friendly, fast-loading, and designed to bring in new customers. Would you like me to make any changes to the preview?`,
    escalate: false,
    sentiment: "neutral",
    intent: "question",
    newStatus: "responded",
    pauseFunnel: true,
    closeAction: "none",
  });
}

/**
 * Build the AI prompt with full context from agent personality, objection playbook,
 * decision framework, and escalation rules.
 */
function buildPrompt(prospect: Prospect, message: IncomingMessage): string {
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;
  const previewUrl = prospect.generatedSiteUrl || "/preview/" + prospect.id;
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const checkoutUrl = `${CHECKOUT_BASE_URL}/claim/${prospect.id}`;
  const compareUrl = `${CHECKOUT_BASE_URL}/compare/${prospect.id}`;

  // Build full objection handling reference with complete scripts
  const objectionRef = Object.entries(OBJECTION_RESPONSES)
    .map(([key, val]) => `  "${key}":\n    Response: "${val.response}"\n    Follow-up: "${val.followUp || 'none'}"`)
    .join("\n\n");

  // Determine close action hint
  const isHighValue = CLOSE_DECISION_FRAMEWORK.highValueCategories.includes(prospect.category);
  const isDirectClose = CLOSE_DECISION_FRAMEWORK.directCloseCategories.includes(prospect.category);
  const closeHint = isHighValue
    ? "This is a HIGH-VALUE category — lean toward calendar booking unless they explicitly ask to buy."
    : isDirectClose
    ? "This is a DIRECT-CLOSE category — send checkout link when they show interest."
    : "Standard category — use checkout for clear interest, calendar for questions/hesitation.";

  return `You are an AI sales assistant for BlueJays, a web design agency. A prospect has replied to your outreach.

AGENT VOICE:
- Tone: ${AGENT_VOICE.tone}
- Personality: ${AGENT_VOICE.personality}
- Core principle: ${AGENT_VOICE.corePrinciple}
- Key distinction: ${AGENT_VOICE.keyDistinction}
- NEVER say: ${AGENT_VOICE.neverSay.join(", ")}
- ALWAYS: ${AGENT_VOICE.alwaysDo.join("; ")}

PRICING:
- One-time: $${PRICING_FRAMEWORK.price}
- Annual management: $${PRICING_FRAMEWORK.yearlyManagement}/year
- Positioning: ${PRICING_FRAMEWORK.positioning}
- Comparison: ${PRICING_FRAMEWORK.comparisonPoints.join("; ")}
- NEVER negotiate on price

OBJECTION PLAYBOOK (use these EXACT scripts when matching):
${objectionRef}

DECISION FRAMEWORK — CHECKOUT vs CALENDAR:
${closeHint}
- Checkout URL: ${checkoutUrl}
- Calendar URL: ${CALENDAR_LINK}
- Compare URL: ${compareUrl}
Direct close conditions: ${CLOSE_DECISION_FRAMEWORK.directClose.join("; ")}
Calendar booking conditions: ${CLOSE_DECISION_FRAMEWORK.calendarBooking.join("; ")}

ESCALATION RULES:
Immediate escalation: ${ESCALATION_RULES.immediate.join("; ")}
Next-day escalation: ${ESCALATION_RULES.nextDay.join("; ")}
Handoff script: "${ESCALATION_RULES.handoffScript}"

STOP RULES (immediately stop all outreach if):
${CONTACT_RULES.stopImmediatelyIf.map((r) => `- ${r}`).join("\n")}

INTENT-TO-STATUS MAPPING:
${Object.entries(INTENT_STATUS_MAP).map(([k, v]) => `- ${k} → ${v}`).join("\n")}

PROSPECT CONTEXT:
- Business: ${prospect.businessName} (${categoryLabel})
- Owner: ${name}
- Preview site: ${previewUrl}
- Current status: ${prospect.status}
- Channel: ${message.channel}
- Revenue tier: ${prospect.estimatedRevenueTier}
- Google rating: ${prospect.googleRating || "N/A"} (${prospect.reviewCount || 0} reviews)
- Has current website: ${prospect.currentWebsite ? "Yes" : "No"}

THEIR MESSAGE:
${message.subject ? `Subject: ${message.subject}\n` : ""}Body: ${message.body}

INSTRUCTIONS:
Analyze their message and respond as JSON with these exact fields:
1. "shouldReply" (boolean): Should the AI auto-reply? (false if angry/threatening or if escalating to human)
2. "reply" (string): The reply message body. Use the agent voice. Reference their business by name. Keep it short and genuine. Use the EXACT objection scripts when an objection matches. Include checkout URL or calendar URL based on the decision framework.
3. "escalate" (boolean): Should this be escalated to Ben (the human owner)?
4. "escalateReason" (string): Why escalate? (empty string if not escalating)
5. "escalateUrgency" (string): "immediate" or "next-day" (empty if not escalating)
6. "sentiment" (string): "positive", "neutral", "negative", or "angry"
7. "intent" (string): One of: "interested", "question", "objection", "not_interested", "unsubscribe", "angry", "neutral", "custom_request"
8. "objectionType" (string): If intent is "objection", which specific objection? (e.g., "too expensive", "already have a website", "have a developer", "bad timing"). Empty string otherwise.
9. "newStatus" (string): The CRM status to transition to based on INTENT-TO-STATUS MAPPING.
10. "pauseFunnel" (boolean): Should the automated funnel sequence be paused? (ALWAYS true for any reply)
11. "closeAction" (string): "checkout", "calendar", or "none" — which close action to take based on the decision framework.

CRITICAL RULES:
- ALWAYS validate before reframing objections ("I totally get that..." / "That makes sense...")
- For objections, use the EXACT scripts from the objection playbook
- For "already have a website", include the compare URL: ${compareUrl}
- For interested prospects in high-value categories, push calendar booking
- For interested prospects in direct-close categories, push checkout link
- ALWAYS pause the funnel when a prospect replies (pauseFunnel: true)
- Map intent to CRM status using the INTENT-TO-STATUS MAPPING above

Respond ONLY with valid JSON. No markdown, no code fences.`;
}

/**
 * Process an incoming message (email or SMS) from a prospect.
 * Implements the full Sales Strategy Playbook:
 * - Classifies intent into 6 categories
 * - Applies objection handling scripts
 * - Uses decision framework for checkout vs calendar
 * - Triggers escalation rules
 * - Updates CRM status per intent mapping
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

  // ═══ FAST-PATH: Check for immediate unsubscribe keywords (don't need AI) ═══
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
      reply: `Absolutely — I've removed you from all future messages right away. I'm sorry for the bother, and I wish you and ${prospect.businessName} all the best!`,
      escalate: false,
      sentiment: "neutral",
      intent: "unsubscribe",
      newStatus: "unsubscribed",
      pauseFunnel: true,
      closeAction: "none",
    };
  }

  // ═══ FAST-PATH: Check for angry keywords (needs immediate escalation) ═══
  const angryKeywords = ["spam", "lawsuit", "attorney", "report you", "harassment", "illegal", "sue"];
  if (angryKeywords.some((kw) => lowerBody.includes(kw))) {
    console.log(`  Angry response detected for ${prospect.businessName} — escalating to Ben`);
    await updateProspect(prospect.id, {
      status: "unsubscribed",
      funnelPaused: true,
    });
    return {
      shouldReply: true,
      reply: `Absolutely — I've removed you from all future messages right away. I'm sorry for the bother, and I wish you and ${prospect.businessName} all the best!`,
      escalate: true,
      escalateReason: "Angry/threatening response — immediate human intervention needed",
      escalateUrgency: "immediate",
      sentiment: "angry",
      intent: "angry",
      newStatus: "unsubscribed",
      pauseFunnel: true,
      closeAction: "none",
    };
  }

  // ═══ FAST-PATH: Check for clear "not interested" ═══
  const notInterestedKeywords = ["not interested", "no thanks", "no thank you", "pass on this", "not for me"];
  if (notInterestedKeywords.some((kw) => lowerBody.includes(kw))) {
    console.log(`  Not interested detected for ${prospect.businessName} — stopping outreach`);
    await updateProspect(prospect.id, {
      status: "dismissed",
      funnelPaused: true,
    });
    return {
      shouldReply: true,
      reply: `No worries at all! I appreciate you being straight with me. The site I built is yours to look at anytime if you change your mind. I wish you and ${prospect.businessName} all the best!`,
      escalate: false,
      sentiment: "neutral",
      intent: "not_interested",
      newStatus: "dismissed",
      pauseFunnel: true,
      closeAction: "none",
    };
  }

  // ═══ FAST-PATH: Check for known objections with playbook scripts ═══
  const objectionType = detectObjectionType(message.body);
  if (objectionType && OBJECTION_RESPONSES[objectionType]) {
    const objResp = OBJECTION_RESPONSES[objectionType];
    console.log(`  Objection detected: "${objectionType}" for ${prospect.businessName}`);

    let reply = objResp.response
      .replace("{businessName}", prospect.businessName)
      .replace("{name}", prospect.ownerName?.split(" ")[0] || "there");

    // Add compare URL for "already have a website" objection
    if (objectionType === "already have a website" && objResp.followUp) {
      const compareUrl = `${CHECKOUT_BASE_URL}/compare/${prospect.id}`;
      reply += "\n\n" + objResp.followUp.replace("{compareUrl}", compareUrl);
    }

    await updateProspect(prospect.id, {
      status: "responded",
      funnelPaused: true,
    });

    return {
      shouldReply: true,
      reply,
      escalate: false,
      sentiment: "neutral",
      intent: "objection",
      objectionType,
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    };
  }

  // ═══ AI CLASSIFICATION: For messages that need deeper analysis ═══
  const prompt = buildPrompt(prospect, message);
  const responseText = await getAiResponse(prompt, prospect.id);

  try {
    // Parse AI response — handle potential markdown code fences
    const cleanText = responseText.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed: AiResponse = JSON.parse(cleanText);

    // Ensure pauseFunnel is always true when a prospect replies
    parsed.pauseFunnel = true;

    // Apply decision framework if AI didn't set closeAction
    if (!parsed.closeAction || parsed.closeAction === "none") {
      parsed.closeAction = determineCloseAction(prospect, parsed.intent, message.body);
    }

    // Apply escalation rules if AI didn't set escalation
    if (!parsed.escalate) {
      const escalation = determineEscalation(prospect, parsed.intent, message.body);
      if (escalation.escalate) {
        parsed.escalate = true;
        parsed.escalateReason = escalation.reason;
        parsed.escalateUrgency = escalation.urgency;
      }
    }

    // Apply CRM status transition from intent mapping
    const mappedStatus = INTENT_STATUS_MAP[parsed.intent];
    if (mappedStatus && !parsed.newStatus) {
      parsed.newStatus = mappedStatus as ProspectStatus;
    }

    // Persist status update
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
      escalateReason: "Could not parse AI response — needs manual review (low-confidence classification)",
      escalateUrgency: "immediate",
      sentiment: "neutral",
      intent: "neutral",
      pauseFunnel: true,
      closeAction: "none",
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
