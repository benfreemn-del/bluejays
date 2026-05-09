import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/ai-activity
 *
 * Cross-client AI activity feed. Reads system_costs (per cost-logger
 * pattern) for the last 7 days, filters to AI-providing services
 * (Claude / OpenAI / Perplexity), aggregates by service · action ·
 * client_slug, and returns the data the AI Activity Feed UI needs.
 *
 * Per dashboard review #5 — repurposes /dashboard/ai-bots from a
 * static flowchart visualizer into a live activity feed that proves
 * "the AI is doing real work" to existing AI System clients and
 * functions as a sales asset for new Pro-tier pitches.
 *
 * Honest framing: per-client AI Operator skills (Drill Drafter,
 * Lead Reply Drafter, etc.) are still mostly mocked / training. The
 * activity here is BlueJays-side infrastructure (sales response
 * generation, lead research, proposal drafting, QC). When per-client
 * Operator skills go live, they log to the same table with a
 * client_slug — the feed picks them up automatically.
 */

const AI_SERVICE_PREFIXES = ["claude_", "openai_", "perplexity_", "anthropic_"];
const AI_SERVICE_LABEL: Record<string, string> = {
  claude_sales_response: "Sales Response (Claude)",
  openai_sales_response: "Sales Response (GPT)",
  openai_proposal_generation: "Proposal Drafter",
  perplexity_research: "Lead Research",
  perplexity_pitch: "Pitch Research",
};

interface CostRow {
  id: string;
  client_slug: string | null;
  service: string;
  action: string;
  cost_usd: number;
  status: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

export async function GET(_request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(emptyResponse());
  }

  try {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
      .from("system_costs")
      .select(
        "id, client_slug, service, action, cost_usd, status, created_at, metadata",
      )
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) {
      console.error("[ai-activity] supabase select failed:", error);
      return NextResponse.json(emptyResponse());
    }

    const rows = ((data ?? []) as CostRow[]).filter((r) =>
      AI_SERVICE_PREFIXES.some((p) => r.service?.startsWith(p)),
    );

    let totalCostUsd = 0;
    let totalRuns = 0;
    let failedRuns = 0;
    const byService: Record<string, { runs: number; costUsd: number }> = {};
    const byClient: Record<string, { runs: number; costUsd: number }> = {};
    const byDay: Record<string, { runs: number; costUsd: number }> = {};
    const recent: Array<{
      id: string;
      service: string;
      serviceLabel: string;
      action: string;
      costUsd: number;
      clientSlug: string | null;
      status: string;
      createdAt: string;
    }> = [];

    for (const r of rows) {
      const cost = Number(r.cost_usd) || 0;
      totalCostUsd += cost;
      totalRuns += 1;
      if (r.status === "failed") failedRuns += 1;

      byService[r.service] = byService[r.service] ?? { runs: 0, costUsd: 0 };
      byService[r.service].runs += 1;
      byService[r.service].costUsd += cost;

      const clientKey = r.client_slug || "_shared";
      byClient[clientKey] = byClient[clientKey] ?? { runs: 0, costUsd: 0 };
      byClient[clientKey].runs += 1;
      byClient[clientKey].costUsd += cost;

      const dayKey = r.created_at?.slice(0, 10) || "unknown";
      byDay[dayKey] = byDay[dayKey] ?? { runs: 0, costUsd: 0 };
      byDay[dayKey].runs += 1;
      byDay[dayKey].costUsd += cost;

      if (recent.length < 50) {
        recent.push({
          id: r.id,
          service: r.service,
          serviceLabel:
            AI_SERVICE_LABEL[r.service] ?? prettyServiceFallback(r.service),
          action: r.action ?? "—",
          costUsd: cost,
          clientSlug: r.client_slug,
          status: r.status ?? "success",
          createdAt: r.created_at,
        });
      }
    }

    return NextResponse.json({
      totalCostUsd,
      totalRuns,
      failedRuns,
      byService,
      byClient,
      byDay,
      recent,
      asOf: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[ai-activity] failed:", err);
    return NextResponse.json(emptyResponse());
  }
}

function prettyServiceFallback(service: string): string {
  const parts = service.split("_");
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function emptyResponse() {
  return {
    totalCostUsd: 0,
    totalRuns: 0,
    failedRuns: 0,
    byService: {} as Record<string, { runs: number; costUsd: number }>,
    byClient: {} as Record<string, { runs: number; costUsd: number }>,
    byDay: {} as Record<string, { runs: number; costUsd: number }>,
    recent: [] as Array<{
      id: string;
      service: string;
      serviceLabel: string;
      action: string;
      costUsd: number;
      clientSlug: string | null;
      status: string;
      createdAt: string;
    }>,
    asOf: new Date().toISOString(),
  };
}
