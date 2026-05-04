import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/client-funnels/runs?client=zenith-sports[&limit=50]
 *
 * Last N cron-or-manual runs for a client. Powers the run-history
 * widget in the leads dashboard so Ben can confirm "yes the cron
 * fired, no nothing failed."
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "client param required" },
      { status: 400 },
    );
  }
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30", 10), 200);
  try {
    const { data, error } = await getSupabase()
      .from("client_funnel_runs")
      .select("*")
      .eq("client_slug", client)
      .order("ran_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, runs: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
