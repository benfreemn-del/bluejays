import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * /api/clients/olympic-inspections/bookings
 *
 * POST  → public, no auth — customer claims a slot + submits booking info.
 *          Atomically flips the slot row to status='booked' and inserts
 *          a client_bookings row.
 *
 * GET   → owner-only — list all bookings for the OIT slug.
 *
 * PATCH → owner-only — update booking status (confirm/complete/cancel/no-show).
 *
 * Whitelisted (POST only) in middleware via PUBLIC_API_PATHS.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "olympic-inspections";
// OIT's prospect UUID — bookings double-write to contact_form_submissions
// so they show up in the BlueJays dashboard prospect detail view.
const OIT_PROSPECT_ID = "9de1d213-e0d0-492e-ba34-b0c874056b66";
const OIT_BUSINESS_NAME = "Olympic Inspections & Testing";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

async function requireOwner(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  if (!cookie) return null;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) return null;
  return owner;
}

// ── POST: customer creates booking (public) ─────────────────────────────────
export async function POST(req: NextRequest) {
  let body: {
    slotId?: string | null;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    propertySize?: string;
    addons?: string;
    estimateLow?: number;
    estimateHigh?: number;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400, headers: CORS },
    );
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const phone = (body.phone || "").trim();
  const slotId = body.slotId && UUID_RE.test(body.slotId) ? body.slotId : null;

  if (!name || name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "name_required" },
      { status: 400, headers: CORS },
    );
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid_email" },
      { status: 400, headers: CORS },
    );
  }
  if (!email && !phone) {
    return NextResponse.json(
      { ok: false, error: "email_or_phone_required" },
      { status: 400, headers: CORS },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: true, mock: true },
      { headers: CORS },
    );
  }

  const supa = getSupabase();

  // If a slot was picked, atomically flip it to booked. The .eq('status', 'available')
  // is the lock — if someone else booked it 0.2s before us, the update returns 0 rows
  // and we throw a 409.
  if (slotId) {
    const { data: claimed, error: claimErr } = await supa
      .from("client_booking_slots")
      .update({ status: "booked" })
      .eq("id", slotId)
      .eq("client_slug", SLUG)
      .eq("status", "available")
      .select("id")
      .maybeSingle();

    if (claimErr) {
      console.error("[oit-bookings] slot claim error:", claimErr.message);
      return NextResponse.json(
        { ok: false, error: "slot_claim_failed" },
        { status: 500, headers: CORS },
      );
    }
    if (!claimed) {
      return NextResponse.json(
        { ok: false, error: "slot_unavailable", message: "That slot was just booked by someone else. Please pick another." },
        { status: 409, headers: CORS },
      );
    }
  }

  const { data, error } = await supa
    .from("client_bookings")
    .insert({
      client_slug: SLUG,
      slot_id: slotId,
      customer_name: name,
      customer_phone: phone || null,
      customer_email: email || null,
      customer_address: (body.address || "").trim() || null,
      property_size: (body.propertySize || "").trim() || null,
      addons: (body.addons || "").trim() || null,
      estimate_low_cents: typeof body.estimateLow === "number" ? Math.round(body.estimateLow * 100) : null,
      estimate_high_cents: typeof body.estimateHigh === "number" ? Math.round(body.estimateHigh * 100) : null,
      service_type: "mold-inspection",
      notes: (body.notes || "").trim() || null,
      status: "requested",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[oit-bookings] insert error:", error.message);
    // If the insert failed AFTER claiming the slot, release it
    if (slotId) {
      await supa
        .from("client_booking_slots")
        .update({ status: "available" })
        .eq("id", slotId);
    }
    return NextResponse.json(
      { ok: false, error: "save_failed" },
      { status: 500, headers: CORS },
    );
  }

  // ── Bridge: also write to contact_form_submissions so the BlueJays
  // dashboard prospect detail view shows this booking as lead activity.
  // Wrap in try/catch — bridge failure must NOT block the booking.
  try {
    const messageParts: string[] = [];
    if (body.propertySize) messageParts.push(`Property size: ${body.propertySize}`);
    if (typeof body.estimateLow === "number" && typeof body.estimateHigh === "number") {
      messageParts.push(`Estimate: $${body.estimateLow}–$${body.estimateHigh}`);
    }
    if (body.addons && body.addons !== "none") messageParts.push(`Add-ons: ${body.addons}`);
    if (body.address) messageParts.push(`Property: ${body.address}`);
    if (slotId && claimed) {
      // Resolve slot time for the bridge message
      const { data: slotRow } = await supa
        .from("client_booking_slots")
        .select("start_at, end_at")
        .eq("id", slotId)
        .maybeSingle();
      if (slotRow) {
        messageParts.push(`Slot: ${slotRow.start_at} → ${slotRow.end_at}`);
      }
    }
    if (body.notes) messageParts.push(`\nCustomer notes:\n${body.notes}`);

    await supa.from("contact_form_submissions").insert({
      prospect_id: OIT_PROSPECT_ID,
      business_name: OIT_BUSINESS_NAME,
      customer_name: name,
      customer_phone: phone || null,
      customer_email: email || null,
      message: messageParts.join("\n") || "Mold inspection booking request",
      service_requested: "mold-inspection-booking",
      sms_sent: false,
      email_sent: false,
    });
  } catch (e) {
    console.error("[oit-bookings] bridge to contact_form_submissions failed (non-blocking):", e);
  }

  return NextResponse.json(
    { ok: true, bookingId: data?.id },
    { headers: CORS },
  );
}

// ── GET: owner lists bookings ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, bookings: [] });
  }

  const { data, error } = await getSupabase()
    .from("client_bookings")
    .select("*, slot:client_booking_slots(start_at, end_at, label)")
    .eq("client_slug", SLUG)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, bookings: data ?? [] });
}

// ── PATCH: owner updates booking status ──────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { id?: string; status?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const id = body.id?.trim();
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (body.status) {
    if (!["requested", "confirmed", "completed", "cancelled", "no-show"].includes(body.status)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (typeof body.notes === "string") update.notes = body.notes.trim().slice(0, 500);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const { error } = await getSupabase()
    .from("client_bookings")
    .update(update)
    .eq("id", id)
    .eq("client_slug", SLUG);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
