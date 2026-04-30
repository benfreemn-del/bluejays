import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOwnerAlert, sendOwnerEmail } from "@/lib/alerts";

/**
 * POST /api/webhooks/calendly
 *
 * Receives Calendly webhook events when prospects book a 15-min
 * walkthrough with Ben. Two jobs:
 *   1. Alert Ben via SMS with partner-attribution context
 *   2. Auto-mark the corresponding partner_calls row outcome as
 *      'answered_call_scheduled' so the partner gets credit
 *      without Ben having to manually update anything.
 *
 * Why this matters: Ben's Calendly already pings him by email when
 * a booking lands. But it doesn't say "this came from sister Sarah's
 * call to Hector Landscaping at 2:14 PM today" — that context is
 * what tells Ben (a) which partner is hot and (b) what the prospect
 * was just told 15 minutes ago.
 *
 * Setup (Ben):
 *   1. Connect Calendly to your Google Calendar (one-time)
 *   2. In Calendly settings → Integrations → Webhooks, register:
 *      https://bluejayportfolio.com/api/webhooks/calendly
 *      Subscribe to: invitee.created, invitee.canceled
 *   3. Set CALENDLY_WEBHOOK_SIGNING_KEY env var on Vercel to the
 *      signing key Calendly gives you (Production scope is fine).
 *      Without the key set, the webhook accepts ALL requests but
 *      logs a warning — set it before going public.
 *
 * Calendly's signing scheme (HMAC SHA-256, hex digest in
 * Calendly-Webhook-Signature header) is verified per their docs:
 * https://developer.calendly.com/api-docs/webhook-signatures
 */

const SIGNING_KEY = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

type CalendlyInvitee = {
  email?: string;
  name?: string;
  text_reminder_number?: string | null;
  tracking?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    salesforce_uuid?: string;
  };
};

type CalendlyEvent = {
  start_time?: string;
  end_time?: string;
  name?: string;
  uri?: string;
};

type CalendlyPayload = {
  event?: "invitee.created" | "invitee.canceled" | string;
  payload?: {
    invitee?: CalendlyInvitee;
    event?: CalendlyEvent;
    scheduled_event?: CalendlyEvent;
  };
};

function verifySignature(rawBody: string, header: string | null): boolean {
  if (!SIGNING_KEY) {
    console.warn(
      "[calendly-webhook] CALENDLY_WEBHOOK_SIGNING_KEY not set — accepting unsigned request. SET THIS BEFORE GOING PUBLIC.",
    );
    return true;
  }
  if (!header) return false;
  // Calendly signature header format: "t=TIMESTAMP,v1=SIGNATURE"
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), (v || "").trim()];
    }),
  ) as { t?: string; v1?: string };
  if (!parts.t || !parts.v1) return false;
  const signedPayload = `${parts.t}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", SIGNING_KEY)
    .update(signedPayload)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(parts.v1, "hex"),
    );
  } catch {
    return false;
  }
}

function formatBookingTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Los_Angeles",
    });
  } catch {
    return iso;
  }
}

export async function POST(request: NextRequest) {
  // Read raw body for signature verification (must happen BEFORE
  // calling .json() — once parsed, the raw bytes are gone).
  const rawBody = await request.text();
  const sigHeader = request.headers.get("calendly-webhook-signature");

  if (!verifySignature(rawBody, sigHeader)) {
    console.warn("[calendly-webhook] signature verification failed");
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  let payload: CalendlyPayload;
  try {
    payload = JSON.parse(rawBody) as CalendlyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.event;
  const invitee = payload.payload?.invitee;
  const scheduledEvent =
    payload.payload?.scheduled_event || payload.payload?.event;

  // Only process invitee.created for now. invitee.canceled could
  // unmark the partner_call outcome later — defer until needed.
  if (eventType !== "invitee.created") {
    return NextResponse.json({ ok: true, skipped: eventType });
  }

  const inviteeName = invitee?.name || "Unknown";
  const inviteeEmail = invitee?.email || "";
  const inviteePhone = invitee?.text_reminder_number || "";
  const startIso = scheduledEvent?.start_time || "";
  const startDisplay = startIso ? formatBookingTime(startIso) : "TBD";

  // Pull partner-attribution data from the UTM params we packed onto
  // the booking link in src/lib/booking.ts.
  const utm = invitee?.tracking || {};
  const partnerCode = (utm.utm_source || "").toLowerCase().trim();
  const prospectId = (utm.utm_campaign || "").trim();
  const medium = (utm.utm_medium || "").trim();

  // Defaults — used if no attribution found (direct booking, organic,
  // someone shared the calendar link manually). Still alerts Ben, just
  // without the partner-credit flow.
  let partnerName: string | null = null;
  let prospectBusinessName: string | null = null;

  if (isSupabaseConfigured()) {
    // Look up the partner if we have a code
    if (partnerCode) {
      try {
        const { data: partnerRow } = await supabase
          .from("partners")
          .select("id, name")
          .eq("code", partnerCode)
          .maybeSingle();
        if (partnerRow) {
          const p = partnerRow as { id: string; name: string };
          partnerName = p.name;

          // Auto-mark the most recent partner_call for this prospect
          // by this partner as 'answered_call_scheduled'. This is the
          // partner-credit flow — they earn the win without Ben
          // having to update outcomes manually.
          if (prospectId) {
            try {
              const { data: recentCall } = await supabase
                .from("partner_calls")
                .select("id, outcome")
                .eq("partner_id", p.id)
                .eq("prospect_id", prospectId)
                .order("called_at", { ascending: false })
                .limit(1)
                .maybeSingle();

              if (recentCall) {
                const r = recentCall as { id: string; outcome: string };
                // Don't downgrade if they already marked closed or DNC.
                const protectedOutcomes = new Set([
                  "answered_call_scheduled",
                  "do_not_call",
                  "answered_audit_sent",
                ]);
                if (!protectedOutcomes.has(r.outcome)) {
                  await supabase
                    .from("partner_calls")
                    .update({ outcome: "answered_call_scheduled" })
                    .eq("id", r.id);
                  console.log(
                    `[calendly-webhook] auto-marked partner_call ${r.id} as answered_call_scheduled (partner=${partnerCode}, prospect=${prospectId})`,
                  );
                }
              } else {
                // No prior call logged — partner may have sent the
                // booking link via DM/email outside the workspace.
                // Insert a synthetic call record so the credit is tracked.
                await supabase.from("partner_calls").insert({
                  partner_id: p.id,
                  prospect_id: prospectId,
                  outcome: "answered_call_scheduled",
                  notes: `Auto-recorded from Calendly booking. Invitee: ${inviteeName} (${inviteeEmail})`,
                });
              }
            } catch (err) {
              console.error("[calendly-webhook] partner_calls update failed:", err);
            }
          }
        }
      } catch (err) {
        console.error("[calendly-webhook] partner lookup failed:", err);
      }
    }

    // Look up the prospect if we have an ID — for SMS context only
    if (prospectId) {
      try {
        const { data: prospectRow } = await supabase
          .from("prospects")
          .select("business_name")
          .eq("id", prospectId)
          .maybeSingle();
        if (prospectRow) {
          prospectBusinessName =
            (prospectRow as { business_name?: string }).business_name || null;
        }
      } catch (err) {
        console.error("[calendly-webhook] prospect lookup failed:", err);
      }
    }
  }

  // Build the alert message — used for both SMS + email
  const lines = [
    "🎯 New booking on your calendar!",
    "",
    `📅 ${startDisplay}`,
    `👤 ${inviteeName}${inviteeEmail ? ` <${inviteeEmail}>` : ""}`,
    inviteePhone ? `📞 ${inviteePhone}` : "",
    prospectBusinessName ? `🏢 ${prospectBusinessName}` : "",
    "",
    partnerName
      ? `💸 Partner credit: ${partnerName}${partnerCode ? ` (${partnerCode})` : ""}`
      : medium === "partner-call"
        ? `(Partner attribution: code "${partnerCode}" not found in DB)`
        : "(No partner attribution — direct/organic booking)",
  ].filter(Boolean);
  const fullMessage = lines.join("\n");

  // Subject for the email — preview line shows the most useful info
  // (business name + partner) so Ben can triage from his inbox
  // notification badge without opening.
  const emailSubject = partnerName
    ? `🎯 ${prospectBusinessName || inviteeName} booked Ben — via ${partnerName}`
    : prospectBusinessName
      ? `🎯 ${prospectBusinessName} booked a 15-min walkthrough`
      : `🎯 New booking — ${inviteeName}`;

  // Fire SMS + Email in parallel. Either path independently delivers
  // the attribution context to Ben — if one is misconfigured (Twilio
  // not wired or SendGrid not wired) the other still lands.
  await Promise.allSettled([
    sendOwnerAlert(fullMessage).catch((err) =>
      console.error("[calendly-webhook] sendOwnerAlert failed:", err),
    ),
    sendOwnerEmail({ subject: emailSubject, body: fullMessage }).catch((err) =>
      console.error("[calendly-webhook] sendOwnerEmail failed:", err),
    ),
  ]);

  return NextResponse.json({
    ok: true,
    eventType,
    matchedPartner: !!partnerName,
    matchedProspect: !!prospectBusinessName,
  });
}
