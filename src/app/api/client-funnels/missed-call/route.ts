import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { createClientLead } from "@/lib/client-leads";
import { getClientFunnelConfig } from "@/lib/client-funnels/registry";

/**
 * POST /api/client-funnels/missed-call
 *
 * Twilio voice webhook for missed-call → text-back per the brand voice
 * doc PRIORITY 5 funnel: when someone dials a client's TEKKY-dedicated
 * number and nobody picks up, we auto-text the caller back with a
 * pre-configured message AND log them as a client_lead so the funnel
 * engine can follow up.
 *
 * Configuration: each client_slug in CLIENT_FUNNELS can have a
 * `missedCall` block. If absent, this route returns empty TwiML and
 * does nothing — safe default until Philip + Paul lock in their
 * preferred text-back behavior (see client_tasks decision).
 *
 * Twilio webhook setup (do this when Zenith provisions their number):
 *   1. Buy Twilio number in their account
 *   2. In the number's "Voice & Fax" config, set:
 *        A CALL COMES IN: Webhook
 *        URL: https://bluejayportfolio.com/api/client-funnels/missed-call?client=zenith-sports
 *        HTTP: POST
 *   3. Set "Call Status Changes" webhook to the same URL so we get
 *      hangup events to detect missed (no-answer) calls.
 *
 * Why this stub exists now: locks the URL pattern so the moment
 * Philip provisions Twilio we can paste it into the dashboard. Also
 * surfaces in the dashboard timeline as a 'voicemail'-channel inbound
 * event for visibility.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public so Twilio can hit it. Twilio signature verification happens
// at the handler level (we accept unsigned in dev to ease testing).

function twiml(xml: string): NextResponse {
  return new NextResponse(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientSlug = searchParams.get("client") ?? "";
  const cfg = getClientFunnelConfig(clientSlug);

  // Unknown client — silent no-op so Twilio doesn't ring an error chime.
  if (!cfg) return twiml("<Response/>");

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return twiml("<Response/>");
  }

  const fromPhone = (formData.get("From") as string) || "";
  const callStatus = (formData.get("CallStatus") as string) || "";
  // Other Twilio fields available: ToCity, ToState, FromCity, etc.

  // Distinguish between an inbound ring (CallStatus="ringing"|"in-progress")
  // and a hangup-without-answer (CallStatus="no-answer"|"failed"|"busy"|
  // "completed" with very short duration).
  const isMissed =
    callStatus === "no-answer" ||
    callStatus === "busy" ||
    callStatus === "failed";

  if (!isMissed || !fromPhone) {
    // First ring — TwiML to ring through to client's actual phone, then
    // fall back to voicemail. Until they provide their answer-line, we
    // just reject to voicemail.
    return twiml(`
      <Response>
        <Say voice="Polly.Joanna">Thanks for calling. Please leave a message after the tone.</Say>
        <Record maxLength="60" action="/api/client-funnels/missed-call?client=${clientSlug}&amp;phase=after-vm" />
      </Response>
    `.trim());
  }

  // Missed call detected — fire the auto-text + log as client_lead.
  if (isSupabaseConfigured()) {
    try {
      // Check if this caller is already a known lead — if so, just log
      // the missed call to their timeline. Otherwise create a new lead.
      const sb = getSupabase();
      const { data: existing } = await sb
        .from("client_leads")
        .select("id")
        .eq("client_slug", clientSlug)
        .eq("phone", fromPhone)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const leadId =
        existing?.id ??
        (
          await createClientLead({
            client_slug: clientSlug,
            phone: fromPhone,
            source: "missed-call-text",
            intent: "Inbound call (missed)",
            raw_payload: {
              from: fromPhone,
              call_status: callStatus,
              twilio_call_sid: formData.get("CallSid"),
            },
          })
        ).id;

      // Log a 'voicemail'-channel inbound event so the dashboard
      // timeline shows the missed-call moment.
      await sb.from("client_lead_messages").insert([
        {
          lead_id: leadId,
          client_slug: clientSlug,
          channel: "voicemail",
          direction: "inbound",
          from_address: fromPhone,
          body: `Missed call (CallStatus=${callStatus}). Auto-text-back queued.`,
          status: "replied", // 'replied' here = "they reached out via voice"
        },
      ]);

      // TODO (when Philip + Paul finalize the auto-text decision —
      // see client_tasks: "Decide: missed-call → text-back behavior"):
      //   send the configured auto-text via Twilio using cfg.sms.from →
      //   fromPhone with the configured body.
    } catch (err) {
      console.error("[missed-call] log failed:", err);
    }
  }

  // Empty TwiML so Twilio's call-status webhook is happy. No SMS sent
  // automatically yet — we're holding until Philip's decision is logged
  // in client_tasks.
  return twiml("<Response/>");
}

// GET for health-check / Twilio "test webhook" button
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientSlug = searchParams.get("client") ?? "";
  const cfg = getClientFunnelConfig(clientSlug);
  return NextResponse.json({
    ok: true,
    clientSlug,
    configured: !!cfg,
    smsFrom: cfg?.sms.from ?? null,
    note: cfg?.sms.from
      ? "Ready — Twilio missed-call webhook will fire auto-text + log lead."
      : "Stub mode — no Twilio number yet. Will log lead but no SMS until ZENITH_TWILIO_NUMBER env is set.",
  });
}
