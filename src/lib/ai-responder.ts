import type { Prospect } from "./types";
import { CATEGORY_CONFIG } from "./types";
import { updateProspect } from "./store";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

interface IncomingEmail {
  from: string;
  subject: string;
  body: string;
}

interface AiResponse {
  shouldReply: boolean;
  reply?: string;
  escalate: boolean;
  escalateReason?: string;
  sentiment: "positive" | "neutral" | "negative" | "angry";
}

async function getClaudeResponse(
  prompt: string
): Promise<string> {
  if (!CLAUDE_API_KEY) {
    return getMockResponse(prompt);
  }

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

  const data = await response.json();
  return data.content[0].text;
}

function getMockResponse(prompt: string): string {
  // Simple mock for testing without API key
  if (prompt.includes("NEGATIVE") || prompt.includes("angry")) {
    return JSON.stringify({
      shouldReply: false,
      escalate: true,
      escalateReason: "Negative/angry response detected",
      sentiment: "angry",
    });
  }
  if (prompt.includes("interested") || prompt.includes("how much")) {
    return JSON.stringify({
      shouldReply: true,
      reply:
        "That's great to hear! I'd love to walk you through the details. The website is completely custom-built for your business. Would you have 15 minutes this week for a quick call? I can answer all your questions and show you some additional features we can add.",
      escalate: true,
      escalateReason: "Prospect is interested — ready to close",
      sentiment: "positive",
    });
  }
  return JSON.stringify({
    shouldReply: true,
    reply:
      "Thanks for getting back to me! I completely understand you might have questions. The website I built for you is fully custom — no cookie-cutter templates. It's mobile-friendly, fast-loading, and designed to bring in new customers. Would you like me to make any changes to the preview?",
    escalate: false,
    sentiment: "neutral",
  });
}

export async function processIncomingEmail(
  prospect: Prospect,
  email: IncomingEmail
): Promise<AiResponse> {
  console.log(
    `  🤖 Processing reply from ${prospect.businessName}: "${email.subject}"`
  );

  const categoryLabel = CATEGORY_CONFIG[prospect.category].label;
  const previewUrl = prospect.generatedSiteUrl || "/preview/" + prospect.id;

  const prompt = `You are an AI sales assistant for BlueJays, a web design agency. A prospect has replied to your pitch email.

CONTEXT:
- Business: ${prospect.businessName} (${categoryLabel})
- Owner: ${prospect.ownerName || "Unknown"}
- Their preview site: ${previewUrl}
- We built them a free custom website and sent it to them

THEIR REPLY:
Subject: ${email.subject}
Body: ${email.body}

INSTRUCTIONS:
Analyze their reply and respond as JSON with these fields:
1. "shouldReply" (boolean): Should the AI auto-reply?
2. "reply" (string): The reply email body (friendly, professional, casual). Do NOT mention price unless they ask.
3. "escalate" (boolean): Should this be escalated to the human owner?
4. "escalateReason" (string): Why escalate?
5. "sentiment" (string): "positive", "neutral", "negative", or "angry"

ESCALATE if:
- They want to buy / ask about pricing
- They ask about custom features beyond the template
- They're angry or threatening
- The AI isn't confident in its answer

Respond ONLY with valid JSON.`;

  const responseText = await getClaudeResponse(prompt);

  try {
    const parsed: AiResponse = JSON.parse(responseText);

    // Update prospect status
    if (parsed.sentiment === "positive") {
      await updateProspect(prospect.id, { status: "responded" });
    }

    return parsed;
  } catch {
    // If Claude doesn't return valid JSON, escalate
    return {
      shouldReply: false,
      escalate: true,
      escalateReason: "Could not parse AI response",
      sentiment: "neutral",
    };
  }
}

export function isAiResponderConfigured(): boolean {
  return !!CLAUDE_API_KEY;
}
