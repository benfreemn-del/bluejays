import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/dashboard/prospects/assign
 *
 * Body: { prospectIds: string[], userId: string | null }
 *
 * Assigns each prospect to a BlueJays user (or unassigns when
 * userId is null). Owner-only. Used by the sales-pipeline UI to
 * distribute leads to Madie / Raidas / Tyler.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const role = req.cookies.get("bj_role")?.value;
  if (role !== "owner") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: { prospectIds?: string[]; userId?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.prospectIds) || body.prospectIds.length === 0) {
    return NextResponse.json({ ok: false, error: "prospectIds required" }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from("prospects")
    .update({ assigned_to_user_id: body.userId ?? null })
    .in("id", body.prospectIds)
    .select("id");
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, updated: data?.length ?? 0 });
}
