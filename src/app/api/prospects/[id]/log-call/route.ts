import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { logTouch } from "@/lib/prospect-touches";

/**
 * POST /api/prospects/[id]/log-call
 *
 * Stamps `prospects.last_contacted_at = NOW()` when Madie (or Ben)
 * manually calls a prospect. Powers the 2-min callback SLA telemetry
 * chip on BluejaysFunnelsTab.
 *
 * Per 116-Funnels chunk 13c — every audit form submission should be
 * called within 2 minutes. This endpoint records WHEN the call
 * happened so the chip can compute "% of audit submitters reached
 * within 2 min" over 24h / 7d windows.
 *
 * Idempotent: if `last_contacted_at` is already set, this UPDATES it
 * to NOW (the most recent manual call wins). The SLA computation uses
 * the FIRST contact time relative to prospect creation, so a re-stamp
 * doesn't change the historical SLA — but the operator needs an
 * always-fresh "last touch" timestamp for triage.
 *
 * Operator-only — protected by middleware (not in PUBLIC_API_PATHS).
 *
 * Body (optional): `{ note?: string }` — appended to prospect notes
 * for context (e.g., "left voicemail, no answer"). Soft optional.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Per Owner Portal Rule 4a — validate UUID before any DB read
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid prospect id" },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Database not configured" },
      { status: 503 },
    );
  }

  // Optional note appended to existing notes
  let note: string | null = null;
  try {
    const body = await request.json();
    if (body && typeof body.note === "string" && body.note.trim()) {
      note = body.note.trim().slice(0, 500);
    }
  } catch {
    // No body / invalid JSON is fine — note stays null
  }

  // Pre-fetch the prospect to confirm it exists + read current notes
  // for append. Use a tight column list so we don't pull PII the
  // operator doesn't need.
  const { data: prospect, error: fetchErr } = await supabase
    .from("prospects")
    .select("id, business_name, last_contacted_at, admin_notes")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json(
      { ok: false, error: fetchErr.message },
      { status: 500 },
    );
  }
  if (!prospect) {
    return NextResponse.json(
      { ok: false, error: "Prospect not found" },
      { status: 404 },
    );
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = { last_contacted_at: now };

  // Append optional note to admin_notes with timestamp prefix
  if (note) {
    const prefix = `[${new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} call] `;
    const existing = (prospect as { admin_notes?: string }).admin_notes || "";
    update.admin_notes = existing ? `${existing}\n${prefix}${note}` : `${prefix}${note}`;
  }

  const { error: updateErr } = await supabase
    .from("prospects")
    .update(update)
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json(
      { ok: false, error: updateErr.message },
      { status: 500 },
    );
  }

  // Phase 1 Lead Interaction System bridge — also record this call as a
  // structured prospect_touches row so the new TouchTimeline + 60-sec SLA
  // chip see it. Fire-and-forget; if it fails we still succeed because
  // the legacy column updates are what existing surfaces depend on.
  void logTouch({
    prospectId: id,
    kind: "call",
    direction: "outbound",
    by_user: "ben",
    notes: note || undefined,
    occurred_at: now,
  }).catch((err) =>
    console.error("[log-call] bridge to prospect_touches failed:", err),
  );

  return NextResponse.json({
    ok: true,
    prospectId: id,
    businessName: (prospect as { business_name?: string }).business_name || "",
    lastContactedAt: now,
    isFirstContact: !(prospect as { last_contacted_at?: string }).last_contacted_at,
    noteAppended: !!note,
  });
}
