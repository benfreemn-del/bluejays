import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/hyperloop/runs
 *
 * Returns the most recent hyperloop_runs rows for the dashboard's
 * "recent runs" panel. Includes both dormant heartbeats and active
 * runs. Limited to last 30 to keep payload small.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ runs: [] });
  }

  const { data, error } = await supabase
    .from("hyperloop_runs")
    .select(
      "id, ran_at, active, gate_reason, variants_analyzed, winners_found, losers_found, new_variants_created, ai_cost_usd, week_to_date_cost_usd, cost_cap_hit, status, notes",
    )
    .order("ran_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ runs: data ?? [] });
}
