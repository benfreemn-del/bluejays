import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/hyperloop/config
 *
 * Returns the single-row hyperloop_config: kill-switch state, weekly
 * cost cap, and dormancy thresholds. The dashboard reads this to
 * render the toggle + caps; the cron reads it before every run.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      paused: false,
      weekly_cost_cap_usd: 50,
      min_audits_to_wake: 100,
      min_paid_to_wake: 5,
      _mock: true,
    });
  }

  const { data, error } = await supabase
    .from("hyperloop_config")
    .select("paused, weekly_cost_cap_usd, min_audits_to_wake, min_paid_to_wake, updated_at, updated_by")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data ?? {
      paused: false,
      weekly_cost_cap_usd: 50,
      min_audits_to_wake: 100,
      min_paid_to_wake: 5,
    },
  );
}

/**
 * PATCH /api/hyperloop/config
 *
 * Operator updates the kill-switch / cost cap / thresholds without
 * a redeploy. The dashboard's "Pause Hyperloop" button hits this with
 * { paused: true }.
 */
export async function PATCH(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  let body: {
    paused?: boolean;
    weekly_cost_cap_usd?: number;
    min_audits_to_wake?: number;
    min_paid_to_wake?: number;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: "dashboard",
  };
  if (body.paused !== undefined) update.paused = body.paused;
  if (body.weekly_cost_cap_usd !== undefined) update.weekly_cost_cap_usd = body.weekly_cost_cap_usd;
  if (body.min_audits_to_wake !== undefined) update.min_audits_to_wake = body.min_audits_to_wake;
  if (body.min_paid_to_wake !== undefined) update.min_paid_to_wake = body.min_paid_to_wake;

  const { error } = await supabase
    .from("hyperloop_config")
    .update(update)
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
