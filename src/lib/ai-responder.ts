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
 *
 * CONVERSATIONAL AI TUNING (v2):
 * - Responses are warmer, more human, and less template-y
 * - Better hooks for re-engaging cold/stalled prospects
 * - Personality-driven: genuine curiosity, empathy, light humor
 * - Context-aware: references specific business data when available
 * - Varied openers: never starts two messages the same way
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
import { getShortPreviewUrl } from "./short-urls";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CALENDAR_LINK = process.env.CALENDAR_LINK || "https://calendly.com/bluejaycontactme/website-walkthrough";
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

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

function getSalesLinks(prospect: Prospect) {
  // previewUrl must be the short /p/[code] version — see CLAUDE.md
  // "Short URL Rules". AI responses go to prospects so the link shown
  // must match what gets sent in outreach.
  return {
    previewUrl: getShortPreviewUrl(prospect),
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
    // Split prompt into system (cacheable) and user (dynamic) parts
    // The system prompt (agent personality, objection scripts, rules) is identical
    // across all prospects — caching saves ~90% on input tokens
    const systemPromptEnd = prompt.indexOf("PROSPECT CONTEXT:");
    const systemPart = systemPromptEnd > 0 ? prompt.substring(0, systemPromptEnd).trim() : "";
    const userPart = systemPromptEnd > 0 ? prompt.substring(systemPromptEnd).trim() : prompt;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512, // Sales responses should be short — 2-3 sentences
        system: systemPart ? [{ type: "text", text: systemPart, cache_control: { type: "ephemeral" } }] : undefined,
        messages: [{ role: "user", content: userPart }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    // Log AI cost — Claude Sonnet: ~$3/1M input + $15/1M output, ~$0.003 per short response
    await logCost({
      prospectId,
      service: "claude",
      action: "sales_agent_response",
      costUsd: COST_RATES.site_generation, // ~$0.003 per response
      metadata: { model: "claude-sonnet-4-20250514", channel: "inbound" },
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
    max_tokens: 512,
  });

  // Log AI cost — GPT-4.1-mini: ~$0.40/1M input + $1.60/1M output, ~$0.003 per short response
  await logCost({
    prospectId,
    service: "openai",
    action: "sales_agent_response",
    costUsd: COST_RATES.site_generation,
    metadata: { model: "gpt-4.1-mini", channel: "inbound" },
  });

  return completion.choices[0]?.message?.content || "";
}

// ═══════════════════════════════════════════════════════════════
// CONVERSATIONAL WARMTH HELPERS
// Make responses feel human, not robotic
// ═══════════════════════════════════════════════════════════════

/**
 * Varied conversational openers — never start two messages the same way.
 * Picks based on a hash of the prospect name for consistency.
 */
function getWarmOpener(name: string, intent: "positive" | "neutral" | "empathetic" | "re-engage"): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  const openers: Record<string, string[]> = {
    positive: [
      `That's awesome to hear, ${name}!`,
      `Love that, ${name}!`,
      `Really glad you reached out, ${name}!`,
      `This made my day, ${name}!`,
      `${name}, that's exactly what I was hoping to hear!`,
    ],
    neutral: [
      `Hey ${name}, thanks for getting back to me!`,
      `${name}! Good to hear from you.`,
      `Appreciate you taking the time to reply, ${name}.`,
      `Hey ${name} — glad you reached out.`,
      `Thanks for the message, ${name}!`,
    ],
    empathetic: [
      `I totally hear you, ${name}.`,
      `That makes complete sense, ${name}.`,
      `${name}, I really appreciate your honesty.`,
      `Completely understand where you're coming from, ${name}.`,
      `Fair enough, ${name} — I respect that.`,
    ],
    "re-engage": [
      `Hey ${name}, just wanted to circle back on something.`,
      `${name}! Been thinking about your business and had an idea.`,
      `Hey ${name} — quick thought I wanted to share with you.`,
      `${name}, something came up that made me think of your business.`,
      `Hey ${name}, hope business is going well! Quick question for you.`,
    ],
  };

  const options = openers[intent] || openers.neutral;
  return options[hash % options.length];
}

/**
 * Add personality-driven sign-offs that feel genuine.
 */
function getWarmSignoff(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const signoffs = [
    `Rooting for ${name}'s business either way!`,
    `Here if you need anything.`,
    `Talk soon!`,
    `Cheering you on!`,
    `Here whenever you're ready.`,
  ];
  return signoffs[hash % signoffs.length];
}

/**
 * Generate a personalized context hook based on prospect data.
 * Makes the response feel researched and specific, not generic.
 */
function getPersonalHook(prospect: Prospect): string {
  if (prospect.googleRating && prospect.reviewCount && prospect.reviewCount > 10) {
    return `By the way, I noticed ${prospect.businessName} has ${prospect.googleRating} stars across ${prospect.reviewCount} reviews — that's really impressive. The site I built actually features those reviews prominently.`;
  }
  if (prospect.scrapedData?.services && prospect.scrapedData.services.length > 0) {
    const topService = prospect.scrapedData.services[0].name;
    return `I made sure to highlight ${topService} on the site since that seems like a key service for ${prospect.businessName}.`;
  }
  if (prospect.city) {
    return `I designed it specifically for ${CATEGORY_CONFIG[prospect.category]?.label || prospect.category} businesses in the ${prospect.city} area.`;
  }
  return `I built the site around what makes ${prospect.businessName} unique — it's not a cookie-cutter template.`;
}

/**
 * Generate re-engagement hooks for cold/stalled prospects.
 * These are conversation starters that create curiosity without being pushy.
 */
function getReEngagementHook(prospect: Prospect): string {
  const category = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;
  const hooks = [
    `I was just working with another ${category.toLowerCase()} business in the area and it reminded me — your preview site is still live if you ever want to take another look.`,
    `Quick question: have you noticed more people searching for ${category.toLowerCase()} services online lately? I've been seeing a big uptick, and your site is ready to capture that traffic.`,
    `I updated a few things on the site I built for ${prospect.businessName} — it's looking even better now. Just thought you'd want to know it's still there for you.`,
    `I was curious — what's the #1 way new customers find ${prospect.businessName} right now? Because the website I built is designed to add a whole new channel of leads.`,
    `No pitch here — I just wanted to share that a ${category.toLowerCase()} business similar to yours claimed their site last week and already got their first online lead. Thought that might be interesting to you.`,
  ];

  const hash = prospect.businessName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return hooks[hash % hooks.length];
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
// Implements full playbook logic locally with conversational warmth
// ═══════════════════════════════════════════════════════════════

function getMockResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  // Extract prospect context from prompt
  const businessNameMatch = prompt.match(/Business: (.+?) \(/);
  const businessName = businessNameMatch ? businessNameMatch[1] : "your business";
  const ownerMatch = prompt.match(/Owner: (\w+)/);
  const name = ownerMatch ? ownerMatch[1] : "there";
  const categoryMatch = prompt.match(/\(([^)]+)\)\n- Owner/);
  const category = categoryMatch ? categoryMatch[1] : "";
  const ratingMatch = prompt.match(/Google rating: ([\d.]+)/);
  const rating = ratingMatch ? ratingMatch[1] : null;
  const reviewMatch = prompt.match(/\((\d+) reviews\)/);
  const reviewCount = reviewMatch ? reviewMatch[1] : null;

  // Build personalized context snippet
  let personalTouch = "";
  if (rating && reviewCount && parseInt(reviewCount) > 5) {
    personalTouch = ` I noticed you've got ${rating} stars across ${reviewCount} reviews — that's the kind of reputation that deserves a website to match.`;
  }

  // Unsubscribe / angry detection
  if (lower.includes("stop") || lower.includes("unsubscribe") || lower.includes("remove me") ||
      lower.includes("opt out") || lower.includes("don't contact")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `Done — I've taken you off our list right away. Genuinely sorry if I overstepped. I was just excited about what I built for ${businessName}, but I completely respect your space. Wishing you all the best!`,
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
      reply: `I hear you, and I'm sorry — that was never my intention. I've removed you from everything immediately. I genuinely just wanted to help ${businessName}, but I understand this wasn't welcome. You won't hear from me again.`,
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
      reply: `Totally respect that, ${name}. No hard feelings at all — I appreciate you being upfront with me. The site I built is yours to look at anytime if you ever get curious. Wishing you and ${businessName} nothing but good things!`,
      escalate: false,
      sentiment: "neutral",
      intent: "not_interested",
      newStatus: "dismissed",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Objection: too expensive — warm, empathetic reframe
  if (lower.includes("expensive") || lower.includes("too much") || lower.includes("can't afford") ||
      lower.includes("pricey") || lower.includes("$997")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `I hear you, ${name} — $997 is real money, and I'd never want you to feel pressured into something that doesn't make sense for you.\n\nHere's how I think about it though: that one-time fee includes the custom website design, domain registration, and hosting setup, so you're not piecing together a bunch of extras. Most ${category || "local"} businesses tell me they get their first new customer from their website within the first month, which usually covers it.\n\nWe also offer a payment plan — 3 payments of $349 if that's easier.\n\nAfter year one, maintenance is just $100/year for domain renewal, hosting, ongoing maintenance, and support.${personalTouch}\n\nThe preview is still live whenever you want to take another look. Zero pressure from me.`,
      escalate: false,
      sentiment: "neutral",
      intent: "objection",
      objectionType: "too expensive",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Objection: already have a website — curious, not dismissive
  if (lower.includes("already have a website") || lower.includes("already have a site") ||
      lower.includes("have a website")) {
    const compareUrl = `${CHECKOUT_BASE_URL}/compare/{prospectId}`;
    return JSON.stringify({
      shouldReply: true,
      reply: `Oh nice — yeah, I actually found your current site, that's how I discovered ${businessName} in the first place! We actually designed yours as an upgrade to your current site. We kept your branding and made the experience more modern and mobile-friendly.\n\nYou can compare them side by side on the claim page: ${compareUrl}\n\nHonestly, even if you stick with your current site, the comparison might give you some ideas for improvements. Would you be open to taking a quick look at the two side by side?`,
      escalate: false,
      sentiment: "neutral",
      intent: "objection",
      objectionType: "already have a website",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Objection: have a developer — respectful, non-competitive
  if (lower.includes("have a developer") || lower.includes("have a web guy") ||
      lower.includes("my developer")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `That's great that you have someone! Having a trusted developer is valuable. I'm definitely not trying to step on anyone's toes here.\n\nHonestly? Maybe show them the preview I built — it might spark some ideas for your next update. Think of it as a free mood board. The site is yours to look at regardless: ${CHECKOUT_BASE_URL}/preview/{prospectId}\n\nEither way, sounds like ${businessName} is in good hands.`,
      escalate: false,
      sentiment: "neutral",
      intent: "objection",
      objectionType: "have a developer",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Objection: bad timing / need to think — patient, door-open
  if (lower.includes("bad timing") || lower.includes("not the right time") ||
      lower.includes("think about it") || lower.includes("maybe later") ||
      lower.includes("not right now")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `Completely get it, ${name} — running a business means a million things competing for your attention. There's no expiration date on this.\n\nOne thing worth knowing: what you saw in the preview is just version one. Once you're ready, we customize everything — colors, photos, layout, content — to match exactly what you want. So don't judge the final product by the preview alone.\n\nI'll leave the link here for whenever the timing feels right: ${CHECKOUT_BASE_URL}/preview/{prospectId}\n\nNo follow-up from me unless you reach out. Take care, ${name}!`,
      escalate: false,
      sentiment: "neutral",
      intent: "objection",
      objectionType: "bad timing",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Interested / ready to buy — enthusiastic but not over-the-top
  if (lower.includes("interested") || lower.includes("love it") || lower.includes("looks great") ||
      lower.includes("how do i get started") || lower.includes("sign me up") ||
      lower.includes("i want it") || lower.includes("how much")) {
    // Determine close action based on category
    const isHighValue = CLOSE_DECISION_FRAMEWORK.highValueCategories.some(c => lower.includes(c));
    const closeAction = isHighValue ? "calendar" : "checkout";

    if (closeAction === "checkout") {
      return JSON.stringify({
        shouldReply: true,
        reply: `${name}, that's awesome! Really glad you like what I put together for ${businessName}.${personalTouch}\n\nBy the way, you can see more examples of sites we've built for ${category || "local"} businesses here: https://bluejayportfolio.com/v2/${category || "portfolio"}\n\nHere's the next step — it's super simple: ${CHECKOUT_BASE_URL}/claim/{prospectId}\n\nTakes about 2 minutes. Once you're in, I'll send you a quick form where you can tell me any changes you want — colors, photos, content, layout — and I'll make it happen before we go live.\n\nAny questions at all, just reply here. I'm around!`,
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
        reply: `Really appreciate the interest, ${name}! There's actually a lot we can do beyond what's in the preview — it's just the starting point.\n\nBy the way, you can see more examples of sites we've built for ${category || "local"} businesses here: https://bluejayportfolio.com/v2/${category || "portfolio"}\n\nRather than try to explain everything over text, would you be up for a quick 10-minute call with Ben? He's the founder and can walk you through the whole process, answer any questions, and talk about what's possible for ${businessName}.\n\nHere's his calendar — pick whatever time works: ${CALENDAR_LINK}\n\nNo pressure at all. Just thought it'd be easier than going back and forth here.`,
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

  // Custom request — helpful, forward to Ben
  if (lower.includes("custom") || lower.includes("integration") || lower.includes("specific feature") ||
      lower.includes("can you add") || lower.includes("special request")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `Oh interesting — I love when business owners have specific ideas for their site. That tells me you're thinking about this the right way.\n\nCustom work is definitely something we can do. Rather than me guessing at what's possible, let me connect you with Ben (our founder) — he's the one who can really dig into the specifics with you.\n\nHere's his calendar: ${CALENDAR_LINK}\n\nOr if you'd rather, just tell me what you're thinking and I'll make sure he sees it before your call.`,
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

  // Wants to talk to a human — warm handoff
  if (lower.includes("speak to") || lower.includes("talk to") || lower.includes("call me") ||
      lower.includes("real person") || lower.includes("human")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `Of course! I'm going to loop in Ben — he's the founder and the person behind everything we build. He's great to talk to and can answer anything way better than I can over text.\n\nYou'll hear from him within a few hours. In the meantime, your preview site is still live if you want to poke around.\n\nThanks for your patience, ${name}!`,
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

  // Skepticism — is this real? — transparent and disarming
  if (lower.includes("is this real") || lower.includes("scam") || lower.includes("legit") ||
      lower.includes("is this a") || lower.includes("too good to be true")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `Ha — I get that question more than you'd think, and honestly? I'd be skeptical too. There's so much junk out there.\n\nBlueJays is a web design studio that builds premium websites for local businesses. You can see our full portfolio at bluejayportfolio.com — we've built sites for over 30 different industries. Your site was custom-designed specifically for ${businessName}.\n\nWhy do we build it first? Because I've found that the best way to earn someone's trust is to do the work first. If you like it, great. If not, you got a free website preview and I got the practice. Win-win.\n\nThe site is real. I'm real. And there's zero obligation to do anything with it.`,
      escalate: false,
      sentiment: "neutral",
      intent: "question",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // "Who are you?" / "How did you find me?" — transparent
  if (lower.includes("who are you") || lower.includes("how did you find") ||
      lower.includes("how did you get my") || lower.includes("where did you")) {
    return JSON.stringify({
      shouldReply: true,
      reply: `Great question! BlueJays is a web design studio that builds premium websites for local businesses. You can see our full portfolio at bluejayportfolio.com — we've built sites for over 30 different industries. Your site was custom-designed specifically for ${businessName}.\n\nI found ${businessName} through a Google search for ${category || "local businesses"} in your area. Your contact info is publicly listed on Google Business, which is how I reached out.\n\nIf you'd prefer I didn't contact you again, just say the word and I'll remove you immediately. No hard feelings.`,
      escalate: false,
      sentiment: "neutral",
      intent: "question",
      newStatus: "responded",
      pauseFunnel: true,
      closeAction: "none",
    });
  }

  // Generic question with warmth and personality
  return JSON.stringify({
    shouldReply: true,
    reply: `Hey ${name}, thanks for getting back to me! I've been following what ${businessName} is doing and I'm genuinely impressed with how you've built the business.\n\nThe website I put together for ${businessName} is fully custom — mobile-friendly, loads fast, and designed to actually bring in new customers from Google searches.${personalTouch}\n\nBy the way, you can see more examples of sites we've built for ${category || "local"} businesses here: https://bluejayportfolio.com/v2/${category || "portfolio"}\n\nWhat's the biggest challenge you're running into right now when it comes to getting new customers online?`,
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
 *
 * TUNED for conversational warmth — the prompt now emphasizes:
 * - Genuine personality over scripted responses
 * - Varied openers (never start two messages the same way)
 * - Empathy-first objection handling
 * - Personal hooks from prospect data
 * - Re-engagement strategies for cold prospects
 */
function buildPrompt(prospect: Prospect, message: IncomingMessage): string {
  const categoryLabel = CATEGORY_CONFIG[prospect.category]?.label || prospect.category;
  const links = getSalesLinks(prospect);
  const previewUrl = links.previewUrl;
  const name = prospect.ownerName?.split(" ")[0] || "there";
  const checkoutUrl = `${CHECKOUT_BASE_URL}/claim/${prospect.id}`;
  const compareUrl = `${CHECKOUT_BASE_URL}/compare/${prospect.id}`;

  // Build full objection handling reference with complete scripts
  const objectionRef = Object.entries(OBJECTION_RESPONSES)
    .map(([key, val]) => `  "${key}":\n    Response: "${val.response}"\n    Follow-up: "${val.followUp || 'none'}"`)
    .join("\n\n");

  // Close action: ALWAYS push for a call/Zoom with Ben
  const closeHint = `ULTIMATE GOAL: Schedule a Zoom/phone call with Ben. The agent's job is to WARM THEM UP and get them on the calendar — NOT to close the sale via text/email. Frame the call as: "Quick 15-minute walkthrough — I'll show you the site live, walk through customization, and answer any questions. No pressure." Only send checkout link if they literally say "I want to buy right now." Booking link: ${CLOSE_DECISION_FRAMEWORK.bookingUrl}`;

  // Personal context for richer responses
  const personalContext: string[] = [];
  if (prospect.googleRating) personalContext.push(`They have ${prospect.googleRating} stars on Google`);
  if (prospect.reviewCount && prospect.reviewCount > 5) personalContext.push(`${prospect.reviewCount} reviews`);
  if (prospect.scrapedData?.services?.length) {
    personalContext.push(`Key services: ${prospect.scrapedData.services.slice(0, 3).map(s => s.name).join(", ")}`);
  }
  if (prospect.city) personalContext.push(`Located in ${prospect.city}`);

  return `You are an AI sales assistant for BlueJays, a web design agency. A prospect has replied to your outreach.

AGENT VOICE:
- Tone: ${AGENT_VOICE.tone}
- Personality: ${AGENT_VOICE.personality}
- Core principle: ${AGENT_VOICE.corePrinciple}
- Key distinction: ${AGENT_VOICE.keyDistinction}
- NEVER say: ${AGENT_VOICE.neverSay.join(", ")}
- ALWAYS: ${AGENT_VOICE.alwaysDo.join("; ")}

CONVERSATIONAL STYLE RULES (CRITICAL):
- Write like a real person texting a friend who owns a business, not like a sales bot
- VARY your openers — never start with "Thanks for reaching out" or "Great question" twice
- Use the prospect's first name naturally, not in every sentence
- Show genuine curiosity about their business — ask follow-up questions
- EMOTIONAL VALIDATION FIRST — Before answering ANY objection, validate their concern in 1 sentence. Then reframe. Example: "That's a completely fair concern, and I hear you." THEN give your response.
- Use contractions (I'm, you're, don't, won't) — formal language kills trust
- Keep paragraphs short — 2-3 sentences max. This is a conversation, not an essay
- Add a personal touch: reference their Google rating, services, or location when relevant
- ALWAYS END WITH A QUESTION — End every response with a genuine question that moves the conversation forward. Not "let me know what you think" but something specific like "What's the #1 way new customers find you right now?" or "Is there a specific feature you'd want on your site?"
- If they seem cold or stalled, use a curiosity hook to re-engage rather than repeating the pitch
- URGENCY SIGNALS — When appropriate, mention: the preview stays live for 30 days, other businesses in their area have already claimed theirs, and a payment plan of 3x$349 is available
- NEVER SAY these phrases: "just following up", "no strings attached", "take a look and let me know what you think", "I put a lot of thought into it". These are generic and kill trust.
- DATA-AWARE RESPONSES — If the prospect has a high Google rating (4.5+), mention it as a compliment. If they have 100+ reviews, call it out. Use their actual scraped data to make the response feel researched.
- PAYMENT PLAN IN EVERY PRICE DISCUSSION — Always mention 3 payments of $349 when price comes up. Don't wait for them to ask about it.
- CLOSING SIGNALS — If prospect says "how do I get started", "what's next", "I'm interested", "let's do it", "sign me up", "ready to go" — send the checkout link IMMEDIATELY. Do not ask more questions. They are ready to buy.

PERSONAL CONTEXT TO REFERENCE:
${personalContext.length > 0 ? personalContext.map(c => `- ${c}`).join("\n") : "- No specific data available — keep it general but genuine"}

PRICING:
- One-time: $${PRICING_FRAMEWORK.price}
- Annual management: $${PRICING_FRAMEWORK.yearlyManagement}/year
- Positioning: ${PRICING_FRAMEWORK.positioning}
- Comparison: ${PRICING_FRAMEWORK.comparisonPoints.join("; ")}
- Payment plan available: 3 payments of $349
- NEVER negotiate on price

OBJECTION PLAYBOOK (use these as INSPIRATION, not word-for-word scripts — make them conversational):
${objectionRef}

DECISION FRAMEWORK — ALWAYS PUSH FOR A CALL:
${closeHint}

YOUR #1 GOAL: Get them on a Zoom/phone call with Ben. NOT to close via text.
- Booking URL: ${CLOSE_DECISION_FRAMEWORK.bookingUrl}
- Checkout URL (ONLY if they literally say "I want to buy now"): ${checkoutUrl}
- Compare URL: ${compareUrl}
- Portfolio URL: https://bluejayportfolio.com/v2/${prospect.category}

HOW TO PUSH THE CALL:
- After answering any question: "Want to hop on a quick 15-min call so I can show you everything live?"
- After addressing an objection: "Might be easier to walk through this on a call — here's my calendar: ${CLOSE_DECISION_FRAMEWORK.bookingUrl}"
- When they show interest: "Let's set up a quick Zoom — I'll walk you through the site and we can customize it together"
- NEVER push checkout link unless they explicitly ask to pay

ESCALATION RULES:
Immediate escalation: ${ESCALATION_RULES.immediate.join("; ")}
Next-day escalation: ${ESCALATION_RULES.nextDay.join("; ")}
Handoff script: "${ESCALATION_RULES.handoffScript}"

RE-ENGAGEMENT STRATEGIES (for cold/stalled prospects):
- Ask a genuine question about their business instead of repeating the pitch
- Share a relevant insight about their industry
- Mention that you updated or improved their preview
- Reference a success story from a similar business (anonymized)
- Lead with curiosity: "I was wondering..." or "Quick question..."

PSYCHOLOGICAL HOOKS (weave these naturally into responses — never all at once):
- IDENTITY: "Your work is clearly premium — shouldn't your website reflect that?"
- LOSS AVERSION: "How many customers are finding your competitors first because their website is better — even though your service is better?"
- SOCIAL PROOF: "Other [category] businesses in your area have already upgraded their online presence this month."
- FUTURE SELF: "Imagine a customer searching for [category] tonight — what do they find when they Google you?"
- GAP: "There's a gap between the quality of your work and what your website shows. We close that gap."
- EFFORT JUSTIFICATION: "You've put years into building this business. A 15-minute call could change how the world sees it."
- SCARCITY: "Your preview stays live for 30 days — after that, I move on to the next business."
- RECIPROCITY: "I already built this for you at no cost — I just want you to see it."

STOP RULES (immediately stop all outreach if):
${CONTACT_RULES.stopImmediatelyIf.map((r) => `- ${r}`).join("\n")}

INTENT-TO-STATUS MAPPING:
${Object.entries(INTENT_STATUS_MAP).map(([k, v]) => `- ${k} → ${v}`).join("\n")}

PROSPECT CONTEXT:
- Business: ${prospect.businessName} (${categoryLabel})
- Owner: ${name}
- Preview site: ${previewUrl}
- Personalized proposal: ${links.proposalUrl}
- Booking link: ${links.bookingUrl}
- Claim link: ${links.claimUrl}
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
2. "reply" (string): The reply message body. Use the conversational agent voice. Reference their business by name. Keep it short, warm, and genuine. Use the objection playbook as INSPIRATION (not word-for-word). Include checkout URL or calendar URL based on the decision framework. If intent is "interested", include the personalized proposal link and optionally suggest booking a call.
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
- ALWAYS validate emotionally before reframing objections ("I totally get that..." / "That makes sense..." / "That's a fair concern..."). One sentence of empathy, THEN your response.
- For objections, use the playbook as inspiration but make it CONVERSATIONAL — don't copy-paste
- For "already have a website", emphasize that we designed theirs as a direct upgrade to their current site, kept their branding, and made it more modern and mobile-friendly. Include the compare URL: ${compareUrl}
- For price objections, ALWAYS mention the payment plan: 3 payments of $349. Lead with ROI ("how much is one new customer worth?"), then offer the plan.
- For "who are you" or "is this legit" questions, mention that BlueJays is a web design studio that builds premium websites for local businesses, link to bluejayportfolio.com, mention we've built sites for 30+ industries, and that their site was custom-designed specifically for their business
- For interested prospects and question intents, include the portfolio link to show more examples: https://bluejayportfolio.com/v2/${prospect.category}
- For interested prospects in high-value categories, push calendar booking
- For interested prospects in direct-close categories, push checkout link
- CLOSING SIGNALS: If the prospect says "how do I get started", "what's next", "I'm interested", "let's do it", "sign me up", "ready to go", "take my money" — send the checkout link IMMEDIATELY at ${checkoutUrl}. Do NOT ask more questions. They are ready.
- ALWAYS end every response with a genuine question that moves the conversation forward
- If the prospect has a Google rating of 4.5+ or 100+ reviews, compliment it specifically — "Your ${prospect.googleRating} stars across ${prospect.reviewCount || 0} reviews says a lot about how you run your business"
- NEVER say: "just following up", "no strings attached", "take a look and let me know what you think", "I put a lot of thought into it"
- When appropriate, mention urgency: "Your preview stays live for 30 days" or "A few other ${categoryLabel} businesses in your area have already claimed theirs"
- ALWAYS pause the funnel when a prospect replies (pauseFunnel: true)
- Map intent to CRM status using the INTENT-TO-STATUS MAPPING above
- VARY your language — if this were a real text conversation, you wouldn't use the same phrases twice

Respond ONLY with valid JSON. No markdown, no code fences.`;
}

/**
 * Process an incoming message (email or SMS) from a prospect.
 * Implements the full Sales Strategy Playbook with conversational warmth:
 * - Classifies intent into 6 categories
 * - Applies objection handling scripts (conversationally)
 * - Uses decision framework for checkout vs calendar
 * - Triggers escalation rules
 * - Updates CRM status per intent mapping
 * - Adds personal hooks and warm tone
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

  const name = prospect.ownerName?.split(" ")[0] || "there";

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
      reply: `Done — I've taken you off our list right away. Genuinely sorry if I overstepped, ${name}. Wishing you and ${prospect.businessName} all the best!`,
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
      reply: `I hear you, and I'm sorry — that was never my intention. I've removed you from everything immediately. You won't hear from me again. Wishing you and ${prospect.businessName} the best.`,
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
      reply: `Totally respect that, ${name}. No hard feelings at all — I appreciate you being upfront with me. The site I built is yours to look at anytime if you ever get curious. Wishing you and ${prospect.businessName} nothing but good things!`,
      escalate: false,
      sentiment: "neutral",
      intent: "not_interested",
      newStatus: "dismissed",
      pauseFunnel: true,
      closeAction: "none",
    };
  }

  // ═══ FAST-PATH: Check for known objections with conversational scripts ═══
  const objectionType = detectObjectionType(message.body);
  if (objectionType && OBJECTION_RESPONSES[objectionType]) {
    console.log(`  Objection detected: "${objectionType}" for ${prospect.businessName}`);

    // Generate a warm, conversational response based on the objection type
    let reply = "";
    const personalHook = getPersonalHook(prospect);

    switch (objectionType) {
      case "too expensive":
        reply = `${getWarmOpener(name, "empathetic")} $997 is real money, and I'd never want you to feel pressured.\n\nThat one-time fee includes the custom website design, domain registration, and hosting setup. Most ${CATEGORY_CONFIG[prospect.category]?.label || ""} businesses tell me they get their first new customer from their website within the first month, and that usually more than covers it.\n\nWe also offer a payment plan — 3 payments of $349 if that's easier.\n\nAfter year one, maintenance is just $100/year for domain renewal, hosting, ongoing maintenance, and support.\n\n${personalHook}\n\nThe preview is still live whenever you want to take another look. Zero pressure from me. ${getWarmSignoff(name)}`;
        break;

      case "already have a website": {
        const compareUrl = `${CHECKOUT_BASE_URL}/compare/${prospect.id}`;
        reply = `Oh nice — yeah, I actually found your current site, that's how I discovered ${prospect.businessName}! We actually designed yours as an upgrade to your current site. We kept your branding and made the experience more modern and mobile-friendly.\n\nYou can compare them side by side on the claim page: ${compareUrl}\n\nEven if you stick with your current site, the comparison might give you some ideas. What's one thing you wish your current site did better?`;
        break;
      }

      case "have a developer":
        reply = `That's great that you have someone! Having a trusted developer is valuable, and I'm definitely not trying to step on anyone's toes.\n\nHonestly? Maybe show them the preview I built — it might spark some ideas for your next update. Think of it as a free mood board.\n\nEither way, sounds like ${prospect.businessName} is in good hands. ${getWarmSignoff(name)}`;
        break;

      case "bad timing":
        reply = `${getWarmOpener(name, "empathetic")} Running a business means a million things competing for your attention. There's no expiration date on this.\n\nOne thing worth knowing: what you saw is just version one. Once you're ready, we customize everything — colors, photos, layout, content — to match exactly what you want.\n\nI'll leave the link here for whenever the timing feels right. No follow-up from me unless you reach out. Take care, ${name}!`;
        break;

      case "can you do it cheaper":
        reply = `I wish I could, ${name} — but $997 is our standard rate and we keep it firm because we don't cut corners. That one-time fee includes the custom website design, domain registration, and hosting setup. After year one, maintenance is just $100/year for domain renewal, hosting, ongoing maintenance, and support.\n\nThat said, we do offer a payment plan — 3 payments of $349 if that's easier on the budget.\n\nFor context, most agencies charge $3K-$10K for this level of work. We just found a way to do it efficiently without sacrificing quality.\n\n${personalHook}`;
        break;

      case "what's included":
        reply = `Great question! Here's the full breakdown:\n\nWhat you see in the preview is just the starting point. After you sign on, we customize the site to your preferences — colors, photos, layout, and content.\n\nThe $997 one-time fee includes:\n- Custom website design\n- Domain registration\n- Hosting setup\n\nThen after year one, the $100/year maintenance plan covers:\n- Domain renewal\n- Hosting\n- Ongoing maintenance\n- Support\n\nNo hidden fees, and no monthly subscription. ${personalHook}\n\nWant me to go deeper on any of those?`;
        break;

      default: {
        const objResp = OBJECTION_RESPONSES[objectionType];
        reply = objResp.response
          .replace("{businessName}", prospect.businessName)
          .replace("{name}", name);
        if (objResp.followUp) {
          reply += "\n\n" + objResp.followUp
            .replace("{compareUrl}", `${CHECKOUT_BASE_URL}/compare/${prospect.id}`)
            .replace("{name}", name);
        }
      }
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

    if (parsed.intent === "interested") {
      parsed.reply = ensureInterestedReplyLinks(parsed.reply, prospect);
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

// Export helpers for use in other modules (e.g., retargeting, winback)
export { getWarmOpener, getWarmSignoff, getPersonalHook, getReEngagementHook };
