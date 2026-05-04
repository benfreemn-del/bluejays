import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/client-leads/[id]/messages — full timeline for a lead.
 *
 * Returns inbound + outbound messages newest-first. The dashboard lead
 * detail drawer renders this as the funnel timeline.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { data, error } = await getSupabase()
      .from("client_lead_messages")
      .select("*")
      .eq("lead_id", id)
      .order("sent_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, messages: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
