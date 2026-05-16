/**
 * voice-agent — Claude-powered AI receptionist that handles inbound
 * calls via Twilio's built-in speech recognition + TwiML <Say>.
 *
 * Why TwiML-based vs Media Streams: Twilio's <Gather input="speech">
 * has STT built in, no WebSocket / Deepgram / ElevenLabs setup needed.
 * Latency is higher than full bidirectional streaming (1-3s gap
 * between caller speaking + AI responding) but ships in 1 commit
 * and books real appointments. Audio-streaming version is a v2.
 *
 * Conversation flow:
 *   Caller dials → /api/voice/incoming
 *   AI greets + asks "what brings you here today?"
 *   Caller responds → /api/voice/turn (Twilio POSTs the transcript)
 *   Claude interprets + crafts a reply with one of these next actions:
 *     · CONTINUE — ask another clarifying question
 *     · BOOK     — caller wants to book; AI promises to text the
 *                  Calendly link, hangs up, /api/voice/turn fires SMS
 *     · TRANSFER — escalate to Ben's cell (Twilio <Dial>)
 *     · VOICEMAIL — record a message, save url to call_log
 *
 * Anthropic API key required (ANTHROPIC_API_KEY). Soft no-op when
 * missing — caller hears "thanks for calling, please leave a message"
 * voicemail-only flow that still captures the lead.
 */

// Calling the Anthropic Messages API directly via fetch — avoids
// adding @anthropic-ai/sdk as a dep just for one call. Same effect.

export type VoiceTurn = {
  role: "caller" | "ai";
  text: string;
  t: string; // ISO timestamp
};

export type VoiceAction =
  | { type: "continue"; reply: string }
  | { type: "book"; reply: string; reasonForBooking: string }
  | { type: "transfer"; reply: string }
  | { type: "voicemail"; reply: string }
  | { type: "wrong-number"; reply: string };

const SYSTEM_PROMPT = `You are the BlueJays AI receptionist. BlueJays is a marketing agency
that builds custom websites ($997 one-time) and full AI marketing
systems ($10,000 + ~$500-1,000/mo for the AI tools — paid to vendors,
not to BlueJays as a retainer). The owner is Ben Freeman.

Your only jobs on this call:
1. Greet the caller warmly + briefly (2 sentences max).
2. Ask ONE question at a time. Listen.
3. Identify whether they want to: (a) book a 15-minute demo with Ben,
   (b) ask a quick pricing question, (c) get support on an existing
   site, (d) reach Ben directly, or (e) leave a voicemail.
4. If they want to BOOK or get pricing/info, promise to text them the
   booking link + their preferred time, and end the call gracefully.
5. If they need URGENT support (live site is down), transfer to Ben.
6. If unclear, offer to take a voicemail.

Voice rules:
- Keep responses to 1-2 short sentences. Phone audio is unforgiving.
- Casual, friendly, blunt. Do not say "I'd be happy to assist".
- Never quote prices unprompted. Never make promises about timelines.
- If asked something you don't know: "I'll have Ben call you back —
  what's the best number?"
- Never apologize more than once.

When you respond, output ONLY a JSON object with this shape:
{
  "action": "continue" | "book" | "transfer" | "voicemail" | "wrong-number",
  "reply": "the spoken response (1-2 short sentences)",
  "reason": "if action=book, one-line summary of what they want"
}

NO markdown, no explanation outside the JSON. The "reply" field is
read aloud to the caller. Keep it under 30 words.`;

export async function nextTurn(
  transcript: VoiceTurn[],
  callerSaid: string,
): Promise<VoiceAction> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Soft no-op — go straight to voicemail.
    return {
      type: "voicemail",
      reply:
        "Thanks for calling BlueJays. Ben is not available right now — please leave a message after the tone and he'll call you back today.",
    };
  }

  // Build conversation history for the model.
  const history = transcript.map((t) => ({
    role: t.role === "caller" ? "user" : "assistant",
    content: t.text,
  })) as Array<{ role: "user" | "assistant"; content: string }>;
  history.push({ role: "user", content: callerSaid });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: history,
      }),
    });
    if (!res.ok) {
      console.warn("[voice-agent] Anthropic API non-200:", res.status);
      return {
        type: "voicemail",
        reply:
          "Apologies, my system glitched. Please leave a message after the tone and Ben will call you back.",
      };
    }
    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const block = (data.content ?? []).find((b) => b.type === "text");
    const raw = block?.text?.trim() ?? "";

    // Parse the JSON response. Resilient to markdown fences if the
    // model gets fancy.
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { type: "voicemail", reply: "Let me have Ben call you back. Please leave your name and number after the tone." };
    }
    const parsed = JSON.parse(jsonMatch[0]) as {
      action?: string;
      reply?: string;
      reason?: string;
    };

    const reply = (parsed.reply || "").trim().slice(0, 250);
    switch (parsed.action) {
      case "book":
        return { type: "book", reply, reasonForBooking: parsed.reason || "demo" };
      case "transfer":
        return { type: "transfer", reply };
      case "voicemail":
        return { type: "voicemail", reply };
      case "wrong-number":
        return { type: "wrong-number", reply };
      default:
        return { type: "continue", reply };
    }
  } catch (err) {
    console.error("[voice-agent] Claude call failed:", err);
    return {
      type: "voicemail",
      reply:
        "Apologies, my system glitched. Please leave a message after the tone and Ben will call you back.",
    };
  }
}
