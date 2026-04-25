import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { UpsellRecord } from "@/lib/upsells";

/**
 * GET /api/upsells/[id]
 *
 * Operator-only endpoint (gated by middleware auth — `/api/upsells` falls
 * through to the protected default since it's not in PUBLIC_API_PATHS).
 *
 * Returns every upsell row for the prospect, sorted newest-first. Used by
 * the ProspectDetail upsells section to render the purchased SKUs and the
 * "Mark fulfilled" button.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ upsells: [] });
  }

  try {
    const { data, error } = await supabase
      .from("upsells")
      .select("*")
      .eq("prospect_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[upsells/list] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to load upsells", detail: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ upsells: (data || []) as UpsellRecord[] });
  } catch (err) {
    console.error("[upsells/list] Unexpected error:", err);
    return NextResponse.json({ error: "Failed to load upsells" }, { status: 500 });
  }
}
