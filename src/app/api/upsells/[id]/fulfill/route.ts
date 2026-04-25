import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/upsells/[id]/fulfill
 *
 * Operator action — marks an upsell row as fulfilled. The `[id]` param is
 * the upsell row's UUID (NOT the prospect ID). Sets `status='fulfilled'`
 * + `fulfilled_at` to NOW(). Idempotent — calling twice is a no-op.
 *
 * Auth: this route falls under `/api/upsells` which is NOT in
 * PUBLIC_API_PATHS, so middleware enforces operator login.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from("upsells")
      .update({
        status: "fulfilled",
        fulfilled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[upsells/fulfill] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to mark upsell as fulfilled", detail: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ upsell: data });
  } catch (err) {
    console.error("[upsells/fulfill] Unexpected error:", err);
    return NextResponse.json({ error: "Failed to mark upsell as fulfilled" }, { status: 500 });
  }
}
