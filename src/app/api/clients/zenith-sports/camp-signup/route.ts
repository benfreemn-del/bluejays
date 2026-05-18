import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { detectAudience, createClientLead } from "@/lib/client-leads";
import { sendEmailToWithAlert, sendOwnerAlert } from "@/lib/alerts";
import { listOwnersWithPrefsForClient } from "@/lib/client-owner-preferences";
import {
  getServiceClient,
  renderBookingConfirmationEmail,
} from "@/lib/service-clients";

/**
 * /api/clients/zenith-sports/camp-signup
 *
 * Public POST — parent reserves a spot at a TEKKY camp. Mirrors the
 * OIT bookings shape (client_bookings table), but the "slot" is a
 * row in client_camps (camp catalog) instead of client_booking_slots.
 *
 * Flow:
 *   1. Validate camp exists + is active
 *   2. Insert client_bookings row (status='requested', service_type='camp-signup',
 *      camp_id stamped in metadata via notes for v1)
 *   3. Insert client_leads row tagged audience='parent' so the funnel
 *      runner picks it up
 *   4. Fan-out owner alerts (Philip gets email, Ben gets SMS)
 *
 * No slot ledger like OIT — camps have unlimited soft-capacity for
 * v1 (Philip filters by date manually). Tightening to per-camp
 * capacity is a Phase 2 add when registrations exceed coach throughput.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "zenith-sports";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

type SignupBody = {
  campId?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  playerName?: string;
  playerAge?: string;
  notes?: string;
};

export async function POST(req: NextRequest) {
  let body: SignupBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400, headers: CORS },
    );
  }

  const campId = (body.campId || "").trim();
  const name = (body.parentName || "").trim();
  const phone = (body.parentPhone || "").trim();
  const email = (body.parentEmail || "").trim().toLowerCase();
  if (!name || (!email && !phone)) {
    return NextResponse.json(
      { ok: false, error: "missing_required_fields" },
      { status: 400, headers: CORS },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "db_not_configured" },
      { status: 500, headers: CORS },
    );
  }
  const supa = getSupabase();

  // Validate camp exists
  let campRow: { id: string; name: string; city: string | null; state: string | null; start_date: string | null } | null = null;
  if (campId) {
    const { data } = await supa
      .from("client_camps")
      .select("id, name, city, state, start_date, is_active")
      .eq("id", campId)
      .eq("client_slug", SLUG)
      .maybeSingle();
    if (!data || !data.is_active) {
      return NextResponse.json(
        { ok: false, error: "camp_not_found_or_inactive" },
        { status: 404, headers: CORS },
      );
    }
    campRow = data;
  }

  // Insert booking
  const messageParts: string[] = [];
  if (campRow) messageParts.push(`Camp: ${campRow.name}`);
  if (body.playerName) messageParts.push(`Player: ${body.playerName}`);
  if (body.playerAge) messageParts.push(`Age: ${body.playerAge}`);
  if (body.notes) messageParts.push(`Notes: ${body.notes}`);

  const { data: booking, error: bErr } = await supa
    .from("client_bookings")
    .insert({
      client_slug: SLUG,
      slot_id: null, // camps don't use slot ledger in v1
      customer_name: name,
      customer_phone: phone || null,
      customer_email: email || null,
      customer_address: null,
      property_size: campRow ? `camp:${campRow.id}` : null,
      addons: null,
      service_type: "camp-signup",
      notes: messageParts.join(" · ") || null,
      status: "requested",
    })
    .select("id")
    .single();

  if (bErr) {
    console.error("[zenith-camp-signup] insert failed:", bErr.message);
    return NextResponse.json(
      { ok: false, error: "save_failed" },
      { status: 500, headers: CORS },
    );
  }

  // Bridge to client_leads so funnel runner picks them up. Audience
  // = parent (the form is parent-facing — players don't sign up on
  // their own).
  try {
    const audiencePayload: Record<string, unknown> = {
      role: "parent",
      source: "camp-signup",
      message: messageParts.join(" "),
      camp_id: campId,
      player_name: body.playerName,
      player_age: body.playerAge,
    };
    const audience = detectAudience(SLUG, audiencePayload);
    await createClientLead({
      client_slug: SLUG,
      audience_segment: audience,
      name,
      email: email || null,
      phone: phone || null,
      intent: "camp-signup",
      source: "camp-signup",
      raw_payload: audiencePayload,
    });
  } catch (e) {
    console.error(
      "[zenith-camp-signup] client_leads enrollment failed (non-blocking):",
      e,
    );
  }

  // Owner alerts
  try {
    const config = getServiceClient(SLUG);
    const summary = [
      `⚽ Camp signup — ${name}`,
      campRow ? `Camp: ${campRow.name}${campRow.city ? ` · ${campRow.city}, ${campRow.state}` : ""}` : "",
      body.playerName ? `Player: ${body.playerName}${body.playerAge ? ` (age ${body.playerAge})` : ""}` : "",
      phone ? `📞 ${phone}` : "",
      email ? `✉️ ${email}` : "",
      body.notes ? `\nNotes: ${body.notes}` : "",
      ``,
      `Open admin: https://bluejayportfolio.com/dashboard/clients/${SLUG}`,
    ]
      .filter(Boolean)
      .join("\n");
    const sms = `⚽ Zenith camp signup: ${name}${campRow ? ` for ${campRow.name}` : ""}`;

    const owners = await listOwnersWithPrefsForClient(SLUG);
    for (const o of owners) {
      if (o.prefs.new_lead_email === "instant") {
        await sendEmailToWithAlert({
          to: o.email,
          subject: `⚽ Camp signup — ${name}`,
          body: summary,
          fromName: `${config?.businessShortName ?? "Zenith Sports"} — Camp Signup`,
          clientSlug: SLUG,
          alertContext: `⚽ Zenith camp-signup alert to owner ${o.email}`,
        }).catch((err) =>
          console.error("[zenith-camp-signup] owner email failed:", err),
        );
      }
    }
    await sendOwnerAlert(sms, { clientSlug: SLUG }).catch((err) =>
      console.error("[zenith-camp-signup] SMS failed:", err),
    );

    // Send confirmation email to the parent so they're not waiting
    // wondering if it landed.
    if (email && config) {
      const { subject, body: confirmBody } = renderBookingConfirmationEmail({
        config,
        customerFirstName: name.split(" ")[0] || "there",
        slotIso: campRow?.start_date ?? null,
        customerAddress:
          campRow?.city && campRow?.state
            ? `${campRow.city}, ${campRow.state}`
            : null,
      });
      await sendEmailToWithAlert({
        to: email,
        subject,
        body: confirmBody,
        fromName: `${config.ownerFirstName} · ${config.businessShortName}`,
        clientSlug: SLUG,
        alertContext: `⚽ Zenith camp-signup confirmation to customer ${email}`,
      }).catch((err) =>
        console.error("[zenith-camp-signup] confirmation email failed:", err),
      );
    }
  } catch (e) {
    console.error("[zenith-camp-signup] alert fan-out failed (non-blocking):", e);
  }

  return NextResponse.json(
    { ok: true, bookingId: booking?.id },
    { headers: CORS },
  );
}
