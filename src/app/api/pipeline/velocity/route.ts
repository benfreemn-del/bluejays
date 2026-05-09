import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/pipeline/velocity
 *
 * Returns the velocity numbers the sales-pipeline dashboard needs to
 * surface "are deals moving?" Per dashboard review #4 — closes the
 * pipeline gap where the kanban shows current state but not flow.
 *
 * Without a pipeline_stage transition log (deferred — schema add),
 * we approximate weekly velocity from prospects.updated_at as a
 * staleness/movement proxy. Honest about the approximation: numbers
 * are "Recently Active" not "Stage-Changed." When the
 * pipeline_stage_changes log lands later, swap the data source
 * without changing the widget.
 *
 * Response shape:
 *   {
 *     totalActive: <count of prospects with pipeline_stage set>,
 *     newThisWeek: <pipeline_stage set + created_at within 7d>,
 *     activeThisWeek: <pipeline_stage set + updated_at within 7d>,
 *     stuck14d: <pipeline_stage set + updated_at older than 14d>,
 *     stuck30d: <pipeline_stage set + updated_at older than 30d>,
 *     totalDealValue: <total $ in pipeline at current stage>,
 *     byStage: {
 *       website: { 1: count, 2: count, 3: count, 4: count },
 *       fullsystem: { 1: count, ..., 6: count }
 *     },
 *     conversionRates: {
 *       website: { "1→2": pct, "2→3": pct, "3→4": pct },
 *       fullsystem: { "1→2": pct, ..., "5→6": pct }
 *     }
 *   }
 */

interface ProspectRow {
  id: string;
  pipeline_stage: string | null;
  pricing_tier: string | null;
  created_at: string | null;
  updated_at: string | null;
  status: string | null;
}

const ARCHIVED_STATUSES = new Set([
  "bounced",
  "dismissed",
  "unsubscribed",
  "wont-do",
]);

function parseStageNum(raw: string | null): number {
  if (!raw) return 0;
  const m = raw.match(/^([1-6])/);
  return m ? parseInt(m[1], 10) : 0;
}

function trackOf(pricingTier: string | null): "website" | "fullsystem" {
  return pricingTier === "fullsystem" ? "fullsystem" : "website";
}

function dealValueCents(pricingTier: string | null): number {
  switch (pricingTier) {
    case "fullsystem":
      return 970000;
    case "custom":
      return 10000;
    case "free":
      return 3000;
    case "standard":
    default:
      return 99700;
  }
}

export async function GET(_request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(emptyResponse());
  }

  try {
    const { data, error } = await supabase
      .from("prospects")
      .select("id, pipeline_stage, pricing_tier, created_at, updated_at, status")
      .not("pipeline_stage", "is", null)
      .limit(2000);

    if (error) {
      console.error("[pipeline/velocity] supabase select failed:", error);
      return NextResponse.json(emptyResponse());
    }

    const rows = (data ?? []) as ProspectRow[];
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Filter out archived statuses (matches the pipeline page's
    // default Active view per the accuracy filter).
    const active = rows.filter(
      (r) => !ARCHIVED_STATUSES.has((r.status ?? "").toString()),
    );

    let totalActive = 0;
    let newThisWeek = 0;
    let activeThisWeek = 0;
    let stuck14d = 0;
    let stuck30d = 0;
    let totalDealValueCents = 0;

    const byStage = {
      website: { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>,
      fullsystem: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Record<
        number,
        number
      >,
    };

    for (const r of active) {
      const stageNum = parseStageNum(r.pipeline_stage);
      if (stageNum < 1) continue;
      totalActive += 1;
      totalDealValueCents += dealValueCents(r.pricing_tier);

      const track = trackOf(r.pricing_tier);
      byStage[track][stageNum] = (byStage[track][stageNum] ?? 0) + 1;

      const createdTs = r.created_at ? Date.parse(r.created_at) : 0;
      const updatedTs = r.updated_at ? Date.parse(r.updated_at) : 0;

      if (createdTs && createdTs >= sevenDaysAgo) newThisWeek += 1;
      if (updatedTs && updatedTs >= sevenDaysAgo) activeThisWeek += 1;
      if (updatedTs && updatedTs < fourteenDaysAgo) stuck14d += 1;
      if (updatedTs && updatedTs < thirtyDaysAgo) stuck30d += 1;
    }

    // Conversion-rate approximation: if there are N at stage X and M
    // at stage X+1+ (downstream), then the cohort that started at X
    // and reached X+1 is roughly M/(N+M). It's a steady-state proxy,
    // not a true cohort, but useful directional signal.
    const conversionRates = {
      website: computeConversion(byStage.website, [1, 2, 3, 4]),
      fullsystem: computeConversion(byStage.fullsystem, [1, 2, 3, 4, 5, 6]),
    };

    return NextResponse.json({
      totalActive,
      newThisWeek,
      activeThisWeek,
      stuck14d,
      stuck30d,
      totalDealValueCents,
      byStage,
      conversionRates,
      asOf: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[pipeline/velocity] failed:", err);
    return NextResponse.json(emptyResponse());
  }
}

function computeConversion(
  byStage: Record<number, number>,
  stages: number[],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (let i = 0; i < stages.length - 1; i++) {
    const fromStage = stages[i];
    const fromCount = byStage[fromStage] ?? 0;
    const downstream = stages
      .slice(i + 1)
      .reduce((sum, s) => sum + (byStage[s] ?? 0), 0);
    const total = fromCount + downstream;
    result[`${fromStage}→${stages[i + 1]}`] =
      total === 0 ? 0 : Math.round((downstream / total) * 100);
  }
  return result;
}

function emptyResponse() {
  return {
    totalActive: 0,
    newThisWeek: 0,
    activeThisWeek: 0,
    stuck14d: 0,
    stuck30d: 0,
    totalDealValueCents: 0,
    byStage: {
      website: { 1: 0, 2: 0, 3: 0, 4: 0 },
      fullsystem: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    },
    conversionRates: {
      website: { "1→2": 0, "2→3": 0, "3→4": 0 },
      fullsystem: { "1→2": 0, "2→3": 0, "3→4": 0, "4→5": 0, "5→6": 0 },
    },
    asOf: new Date().toISOString(),
  };
}
