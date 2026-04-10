import { NextRequest, NextResponse } from "next/server";
import { getAllProspects, getProspectByPhone, updateProspect } from "@/lib/store";
import { processIncomingMessage } from "@/lib/ai-responder";
import { alertAngryResponse, alertCustomRequest, alertEscalation, alertObjectionResponse, alertProspectResponded } from "@/lib/alerts";
import { markProspectReplied } from "@/lib/followup-scheduler";
import { queueDelayedReply } from "@/lib/delayed-replies";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const STOP_KEYWORDS = new Set([
  "stop",
  "stopall",
  "unsubscribe",
  "cancel",
  "end",
  "quit",
  "optout",
  "opt-out",
]);

interface ParsedVonageInbound {
  fromPhone: string;
  toPhone: string;
  body: string;
  messageId: string;
  type: string;
  raw: Record<string, unknown>;
}

function normalizeStopKeyword(body: string): string {
  return body.trim().toLowerCase().replace(/[^a-z-]/g, "");
}

async function parseInboundRequest(request: NextRequest): Promise<ParsedVonageInbound> {
  const contentType = request.headers.get("content-type") || "";
  let raw: Record<string, unknown> = {};

  if (request.method === "GET") {
    raw = Object.fromEntries(request.nextUrl.searchParams.entries());
  } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    raw = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, String(value)]));
  } else {
    try {
      raw = await request.json() as Record<string, unknown>;
    } catch {
      raw = Object.fromEntries(request.nextUrl.searchParams.entries());
    }
  }

  return {
    fromPhone: String(raw.msisdn || raw.from || "").trim(),
    toPhone: String(raw.to || raw.toNumber || "").trim(),
    body: String(raw.text || raw.body || "").trim(),
    messageId: String(raw.messageId || raw["message-id"] || "").trim(),
    type: String(raw.type || "text").trim(),
    raw,
  };
}

async function findProspectByPhone(fromPhone: string) {
  let prospect = await getProspectByPhone(fromPhone);

  if (!prospect) {
    const normalized = fromPhone.replace(/\D/g, "");
    const allProspects = await getAllProspects();
    prospect = allProspects.find((p) => {
      if (!p.phone) return false;
      const prospectPhone = p.phone.replace(/\D/g, "");
      return (
        prospectPhone === normalized ||
        prospectPhone.endsWith(normalized.slice(-10)) ||
        normalized.endsWith(prospectPhone.slice(-10))
      );
    });
  }

  return prospect;
}

async function logInboundSms(params: {
  prospectId?: string;
  fromPhone: string;
  toPhone: string;
  body: string;
  messageId: string;
}) {
  if (!isSupabaseConfigured()) {
    return;
  }

  const basePayload = {
    prospect_id: params.prospectId || null,
    to_number: params.toPhone || params.fromPhone,
    from_number: params.fromPhone,
    body: params.body,
    sequence: 0,
    method: "vonage",
    sent_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from("sms_messages").insert({
      ...basePayload,
      message_sid: params.messageId || null,
      direction: "inbound",
    });

    if (!error) {
      return;
    }

    const { error: fallbackError } = await supabase.from("sms_messages").insert(basePayload);
    if (fallbackError) {
      console.error("[Inbound Vonage SMS] Failed to log inbound SMS:", fallbackError.message);
    }
  } catch (error) {
    console.error("[Inbound Vonage SMS] Error logging inbound SMS:", error);
  }
}

async function handleInbound(request: NextRequest) {
  try {
    const inbound = await parseInboundRequest(request);

    if (!inbound.fromPhone || !inbound.body) {
      console.log("[Inbound Vonage SMS] Missing msisdn/from or text/body — ignoring");
      return NextResponse.json({ received: true, ignored: true, reason: "missing_fields" });
    }

    console.log(`[Inbound Vonage SMS] Received from ${inbound.fromPhone}: "${inbound.body.substring(0, 80)}"`);

    const prospect = await findProspectByPhone(inbound.fromPhone);
    await logInboundSms({
      prospectId: prospect?.id,
      fromPhone: inbound.fromPhone,
      toPhone: inbound.toPhone,
      body: inbound.body,
      messageId: inbound.messageId,
    });

    if (!prospect) {
      console.log(`[Inbound Vonage SMS] No matching prospect for ${inbound.fromPhone} — ignoring`);
      return NextResponse.json({ received: true, matched: false });
    }

    if (prospect.status === "unsubscribed") {
      console.log(`[Inbound Vonage SMS] Prospect ${prospect.businessName} is unsubscribed — ignoring`);
      return NextResponse.json({ received: true, matched: true, ignored: true, reason: "already_unsubscribed" });
    }

    markProspectReplied(prospect.id);

    const normalizedKeyword = normalizeStopKeyword(inbound.body);
    if (STOP_KEYWORDS.has(normalizedKeyword)) {
      await updateProspect(prospect.id, {
        status: "unsubscribed",
        funnelPaused: true,
      });

      console.log(`[Inbound Vonage SMS] Prospect ${prospect.businessName} opted out via ${normalizedKeyword}`);
      return NextResponse.json({
        received: true,
        matched: true,
        optedOut: true,
        prospectId: prospect.id,
      });
    }

    const aiResponse = await processIncomingMessage(prospect, {
      from: inbound.fromPhone,
      body: inbound.body,
      channel: "sms",
    });

    if (aiResponse.shouldReply && aiResponse.reply) {
      try {
        await queueDelayedReply(
          prospect.id,
          "sms",
          inbound.fromPhone,
          aiResponse.reply
        );
        console.log(`[Inbound Vonage SMS] AI reply queued for ${inbound.fromPhone}`);
      } catch (error) {
        console.error(`[Inbound Vonage SMS] Failed to queue reply: ${(error as Error).message}`);
      }
    }

    if (aiResponse.intent === "interested" || aiResponse.escalate) {
      await alertProspectResponded(prospect, inbound.body);
    }
    if (aiResponse.intent === "angry") {
      await alertAngryResponse(prospect, inbound.body);
    }
    if (aiResponse.intent === "custom_request") {
      await alertCustomRequest(prospect, inbound.body);
    }
    if (aiResponse.intent === "objection" && aiResponse.objectionType) {
      await alertObjectionResponse(prospect, aiResponse.objectionType, inbound.body);
    }
    if (aiResponse.escalate && aiResponse.escalateUrgency) {
      await alertEscalation(
        prospect,
        aiResponse.escalateReason || "Escalation triggered",
        aiResponse.escalateUrgency
      );
    }

    return NextResponse.json({
      received: true,
      matched: true,
      prospectId: prospect.id,
      intent: aiResponse.intent,
      replied: Boolean(aiResponse.shouldReply && aiResponse.reply),
      optedOut: false,
      messageType: inbound.type,
    });
  } catch (error) {
    console.error("[Inbound Vonage SMS] Error:", error);
    return NextResponse.json({ received: true, error: false });
  }
}

export async function GET(request: NextRequest) {
  return handleInbound(request);
}

export async function POST(request: NextRequest) {
  return handleInbound(request);
}
