import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProspect, updateProspect } from "@/lib/store";
import { logTouch } from "@/lib/prospect-touches";
import { currentUserFromCookies } from "@/lib/bluejays-auth";

/**
 * POST /api/prospects/[id]/save
 *
 * Toggles the prospect's `saved_at` flag.
 *   - If currently NULL → set to NOW() (lead is now saved)
 *   - If currently non-NULL → clear back to NULL (unsave)
 *
 * Saved leads are EXEMPT from the 14-day auto-sweep at
 * `/api/leads/sweep-following-up` — they stay in `following_up`
 * regardless of how long since last contact. See migrations
 * `20260529_prospects_saved_at.sql` + `20260529_prospects_saved_by_user_id.sql`.
 *
 * Per-user attribution: `saved_by_user_id` is populated from the
 * `bj_user_id` cookie so each sales rep's saved set is their own.
 * Reps on the legacy env-password flow (no `bj_user_id`) get the save
 * recorded but with `saved_by_user_id = NULL` — visible to owner via
 * the chip in owner role, but not surfaced on any rep's per-user view.
 *
 * Response:
 *   { ok: true, prospectId, savedAt: <ISO or null>, savedByUserId, wasSaved }
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid prospect id" },
      { status: 400 },
    );
  }

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { ok: false, error: "Prospect not found" },
      { status: 404 },
    );
  }

  const cookieStore = await cookies();
  const role = cookieStore.get("bj_role")?.value;
  const user = await currentUserFromCookies(cookieStore);
  // Touch attribution: prefer the real user name when available, fall
  // back to role label for legacy env-password sessions.
  const byUser =
    user?.name?.toLowerCase().split(/\s+/)[0] || (role === "sales" ? "sales" : "ben");

  const wasSaved = !!prospect.savedAt;
  const nextSavedAt = wasSaved ? null : new Date().toISOString();
  // On save: stamp current user (or NULL for env-password sessions).
  // On unsave: clear both fields.
  const nextSavedByUserId = wasSaved ? null : user?.id ?? null;

  try {
    await updateProspect(
      id,
      { savedAt: nextSavedAt, savedByUserId: nextSavedByUserId },
      { source: wasSaved ? "unsaved_by_operator" : "saved_by_operator" },
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message || "Save failed" },
      { status: 500 },
    );
  }

  void logTouch({
    prospectId: id,
    kind: "note",
    direction: "outbound",
    by_user: byUser,
    notes: wasSaved
      ? "Removed from Saved (will resume auto-sweep eligibility)"
      : "Marked as Saved — exempt from 14-day auto-sweep",
  }).catch((err) =>
    console.error("[save] touch log failed:", err),
  );

  return NextResponse.json({
    ok: true,
    prospectId: id,
    savedAt: nextSavedAt,
    savedByUserId: nextSavedByUserId,
    wasSaved,
  });
}
