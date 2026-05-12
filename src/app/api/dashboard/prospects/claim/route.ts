import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUserFromCookies } from "@/lib/bluejays-auth";

/**
 * POST /api/dashboard/prospects/claim
 *
 * Body: { prospectId: string }
 *
 * Sister to /api/dashboard/prospects/assign (owner-only bulk assign).
 * This one lets a SALES rep self-claim a single unassigned prospect —
 * the dropdown shows it to them as "Claim" on cards where
 * assigned_to_user_id is null.
 *
 * Auth:
 *   - role=sales: must be a real bluejays_users row (bj_user_id
 *     cookie set). Can only claim CURRENTLY-UNASSIGNED prospects.
 *     Can't steal a prospect already assigned to someone else.
 *   - role=owner: same endpoint accepted, owners can claim their own
 *     work too (and can use /assign to reassign others' prospects).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const role = req.cookies.get("bj_role")?.value;
  if (role !== "sales" && role !== "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const user = await currentUserFromCookies(req.cookies);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "no bluejays_users row — log in with email + password" },
      { status: 403 },
    );
  }

  let body: { prospectId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  if (!body.prospectId) {
    return NextResponse.json({ ok: false, error: "prospectId required" }, { status: 400 });
  }

  const sb = getSupabase();
  // Sales role can only claim unassigned prospects. Owner can claim any.
  let q = sb
    .from("prospects")
    .update({ assigned_to_user_id: user.id })
    .eq("id", body.prospectId);
  if (role === "sales") q = q.is("assigned_to_user_id", null);
  const { data, error } = await q.select("id, assigned_to_user_id");
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error:
          role === "sales"
            ? "already claimed by someone else"
            : "prospect not found",
      },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true, prospectId: body.prospectId, claimedBy: user.id });
}
