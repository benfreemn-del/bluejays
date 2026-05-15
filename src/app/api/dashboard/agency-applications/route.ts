import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET  /api/dashboard/agency-applications
 *   ?status=new|qualified|called|won|lost|dnq|all (default: all)
 *   ?limit=N (default: 200)
 *
 * PATCH /api/dashboard/agency-applications
 *   body: { id: string, status?: string, notes?: string, reviewed_by?: string }
 *   Marks the application as reviewed (sets reviewed_at = now()).
 *
 * Auth: covered by middleware /dashboard /api gates (admin-password
 * cookie). No additional check here.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_STATUSES = new Set([
  "new",
  "qualified",
  "called",
  "won",
  "lost",
  "dnq",
]);

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") || "all").toLowerCase();
  const limit = Math.min(parseInt(searchParams.get("limit") || "200", 10) || 200, 500);

  let query = supabase
    .from("agency_applications")
    .select("*")
    .order("applied_at", { ascending: false })
    .limit(limit);

  if (status !== "all" && VALID_STATUSES.has(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[agency-applications] list failed:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Counts by status — for the filter chips. Single COUNT(*) per
  // status is cheaper than streaming all rows then bucketing in
  // memory once volume grows.
  const counts: Record<string, number> = { all: 0 };
  for (const s of VALID_STATUSES) {
    const { count } = await supabase
      .from("agency_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", s);
    counts[s] = count || 0;
    counts.all += count || 0;
  }

  return NextResponse.json({ ok: true, applications: data || [], counts });
}

const VALID_MEETING_OUTCOMES = new Set(["no_show", "declined", "interested", "closed"]);

export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 503 });
  }

  let body: {
    id?: string;
    status?: string;
    notes?: string;
    reviewed_by?: string;
    // BAM-FAM outcome tracking (Hormozi backend review A3, 2026-05-16).
    // All optional. Pass an ISO string to set / "null" string to clear.
    calendly_sent_at?: string | null;
    meeting_booked_at?: string | null;
    meeting_completed_at?: string | null;
    meeting_outcome?: string | null;
    bamfam_notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
  }

  const update: Record<string, unknown> = { reviewed_at: new Date().toISOString() };
  if (body.status) {
    const s = body.status.toLowerCase();
    if (!VALID_STATUSES.has(s)) {
      return NextResponse.json(
        { ok: false, error: `Invalid status. Must be one of: ${Array.from(VALID_STATUSES).join(", ")}` },
        { status: 400 },
      );
    }
    update.status = s;
  }
  if (body.notes !== undefined) update.notes = body.notes;
  if (body.reviewed_by) update.reviewed_by = body.reviewed_by;

  // BAM-FAM fields — pass `null` to clear, ISO string to set, omit to leave alone.
  if ("calendly_sent_at" in body) update.calendly_sent_at = body.calendly_sent_at;
  if ("meeting_booked_at" in body) update.meeting_booked_at = body.meeting_booked_at;
  if ("meeting_completed_at" in body) update.meeting_completed_at = body.meeting_completed_at;
  if ("meeting_outcome" in body) {
    if (body.meeting_outcome === null) {
      update.meeting_outcome = null;
    } else if (typeof body.meeting_outcome === "string" && VALID_MEETING_OUTCOMES.has(body.meeting_outcome)) {
      update.meeting_outcome = body.meeting_outcome;
    } else {
      return NextResponse.json(
        { ok: false, error: `Invalid meeting_outcome. Must be one of: ${Array.from(VALID_MEETING_OUTCOMES).join(", ")}` },
        { status: 400 },
      );
    }
  }
  if (body.bamfam_notes !== undefined) update.bamfam_notes = body.bamfam_notes;

  const { data, error } = await supabase
    .from("agency_applications")
    .update(update)
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) {
    console.error("[agency-applications] update failed:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, application: data });
}
