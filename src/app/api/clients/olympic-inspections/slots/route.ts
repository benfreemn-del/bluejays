import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Owner-authed slot CRUD for Olympic Inspections & Testing.
 *
 * GET    → list ALL slots for OIT (any status, any date)
 * POST   → create new slot      body: { startAt, endAt, label?, notes?, status? }
 * PATCH  → update existing slot body: { id, startAt?, endAt?, label?, notes?, status? }
 * DELETE → remove slot          body: { id }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "olympic-inspections";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_STATUS = new Set(["available", "booked", "blocked"]);

async function requireOwner(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  if (!cookie) return null;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) return null;
  return owner;
}

function validIso(s: unknown): s is string {
  if (typeof s !== "string") return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, slots: [] });
  }

  const { data, error } = await getSupabase()
    .from("client_booking_slots")
    .select("*")
    .eq("client_slug", SLUG)
    .order("start_at", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, slots: data ?? [] });
}

export async function POST(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { startAt?: string; endAt?: string; label?: string; notes?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!validIso(body.startAt) || !validIso(body.endAt)) {
    return NextResponse.json({ ok: false, error: "invalid_dates" }, { status: 400 });
  }
  const startAt = new Date(body.startAt);
  const endAt = new Date(body.endAt);
  if (endAt <= startAt) {
    return NextResponse.json({ ok: false, error: "end_before_start" }, { status: 400 });
  }
  const status = body.status && VALID_STATUS.has(body.status) ? body.status : "available";

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const { data, error } = await getSupabase()
    .from("client_booking_slots")
    .insert({
      client_slug: SLUG,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      label: (body.label || "").trim().slice(0, 80) || null,
      notes: (body.notes || "").trim().slice(0, 200) || null,
      status,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, slot: data });
}

export async function PATCH(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { id?: string; startAt?: string; endAt?: string; label?: string; notes?: string; status?: string };
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
  if (body.startAt !== undefined) {
    if (!validIso(body.startAt)) return NextResponse.json({ ok: false, error: "invalid_start" }, { status: 400 });
    update.start_at = new Date(body.startAt).toISOString();
  }
  if (body.endAt !== undefined) {
    if (!validIso(body.endAt)) return NextResponse.json({ ok: false, error: "invalid_end" }, { status: 400 });
    update.end_at = new Date(body.endAt).toISOString();
  }
  if (typeof body.label === "string") update.label = body.label.trim().slice(0, 80);
  if (typeof body.notes === "string") update.notes = body.notes.trim().slice(0, 200);
  if (body.status) {
    if (!VALID_STATUS.has(body.status)) return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
    update.status = body.status;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const { error } = await getSupabase()
    .from("client_booking_slots")
    .update(update)
    .eq("id", id)
    .eq("client_slug", SLUG);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const id = body.id?.trim();
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const { error } = await getSupabase()
    .from("client_booking_slots")
    .delete()
    .eq("id", id)
    .eq("client_slug", SLUG);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
