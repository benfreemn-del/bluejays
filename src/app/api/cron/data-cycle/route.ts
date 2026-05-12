import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/cron/data-cycle
 *
 * Daily cron (04:30 UTC — runs after midnight in every US timezone).
 * Rolls today's headline numbers into daily_metrics (one row per
 * UTC date). Upserts on metric_date so re-runs are idempotent.
 *
 * Dashboard widgets read from daily_metrics instead of recomputing
 * across prospects / system_costs / audits on every page load —
 * cheap reads, fast TTFB.
 *
 * Auth: CRON_SECRET header.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthed(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return true;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const sb = getSupabase();
  const today = new Date().toISOString().slice(0, 10);
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    async function countWhere(promise: PromiseLike<{ count: number | null; error: { message: string } | null }>) {
      const { count, error } = await promise;
      if (error) throw new Error(error.message);
      return count ?? 0;
    }
    const head = { count: "exact" as const, head: true };

    const prospectsTotal = await countWhere(sb.from("prospects").select("*", head));
    const prospectsNew = await countWhere(
      sb.from("prospects").select("*", head).gte("created_at", since24h),
    );
    const pipelineActive = await countWhere(
      sb.from("prospects").select("*", head).not("pipeline_stage", "is", null),
    );
    const pipelineStage1 = await countWhere(
      sb.from("prospects").select("*", head).like("pipeline_stage", "1%"),
    );
    const pipelineStage2 = await countWhere(
      sb.from("prospects").select("*", head).like("pipeline_stage", "2%"),
    );
    const pipelineStage3 = await countWhere(
      sb
        .from("prospects")
        .select("*", head)
        .or(
          "pipeline_stage.like.3%,pipeline_stage.like.4%,pipeline_stage.like.5%,pipeline_stage.like.6%",
        ),
    );
    const auditsCompleted = await countWhere(
      sb.from("site_audits").select("*", head).eq("status", "ready"),
    );
    const leadsTotal = await countWhere(sb.from("client_leads").select("*", head));
    const diagnosticsRun = await countWhere(sb.from("hormozi_diagnostics").select("*", head));

    // Costs in last 24h
    const { data: costRows } = await sb
      .from("system_costs")
      .select("cost_usd")
      .gte("created_at", since24h);
    const costs24h = (costRows ?? []).reduce(
      (sum, r) => sum + Number((r as { cost_usd?: string | number }).cost_usd ?? 0),
      0,
    );

    const { error: upsertErr } = await sb
      .from("daily_metrics")
      .upsert(
        {
          metric_date: today,
          prospects_total: prospectsTotal,
          prospects_new_24h: prospectsNew,
          pipeline_active: pipelineActive,
          pipeline_stage_1: pipelineStage1,
          pipeline_stage_2: pipelineStage2,
          pipeline_stage_3_plus: pipelineStage3,
          audits_completed: auditsCompleted,
          leads_total: leadsTotal,
          costs_24h_usd: Number(costs24h.toFixed(2)),
          diagnostics_run: diagnosticsRun,
          computed_at: new Date().toISOString(),
        },
        { onConflict: "metric_date" },
      );
    if (upsertErr) {
      return NextResponse.json({ ok: false, error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      date: today,
      metrics: {
        prospectsTotal,
        prospectsNew,
        pipelineActive,
        auditsCompleted,
        leadsTotal,
        costs24h: Number(costs24h.toFixed(2)),
        diagnosticsRun,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
