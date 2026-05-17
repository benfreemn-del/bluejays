/**
 * AI Activity aggregation — pure-data queries that back both the
 * /dashboard/ai-activity page and the `bj ai stats` CLI.
 *
 * All queries hit two tables:
 *   - system_costs    (every AI/infra call, written by logCost())
 *   - ai_skill_runs   (per-invocation telemetry for the bj ai layer)
 *   - ai_skill_caps   (daily budget state for ai skills)
 *
 * Returned shapes are JSON-friendly (no Date objects, no nested
 * functions) so the dashboard/API layer can pass them through
 * unchanged.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getServiceMeta, type ServiceCategory } from "./services";

// ───────────────────────────────────────────────────────────────
// Shared types
// ───────────────────────────────────────────────────────────────

export type ServiceRollup = {
  service: string;
  label: string;
  category: ServiceCategory;
  costUsd: number;
  callCount: number;
};

export type CategoryRollup = {
  category: ServiceCategory;
  costUsd: number;
  callCount: number;
};

export type DailyTotal = {
  date: string; // YYYY-MM-DD
  costUsd: number;
  callCount: number;
};

export type CapStatus = {
  skill: string;
  dailyCapUsd: number;
  spentTodayUsd: number;
  pct: number; // 0-100
  capHitsToday: number;
};

export type SkillRunStats = {
  successful: number;
  failed: number;
  noWork: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
};

export type TopCall = {
  service: string;
  costUsd: number;
  createdAt: string;
  action?: string;
};

export type RecentSkillRun = {
  id: string;
  skill: string;
  triggeredBy: string;
  summary: string;
  ok: boolean;
  noWork: boolean;
  costUsd: number;
  latencyMs: number;
  createdAt: string;
};

export type FullStats = {
  windowHours: number;
  generatedAt: string;
  totals: {
    aiComputeUsd: number;
    infrastructureUsd: number;
    otherUsd: number;
    grandTotalUsd: number;
    callCount: number;
  };
  byService: ServiceRollup[];
  byCategory: CategoryRollup[];
  trend: DailyTotal[];
  caps: CapStatus[];
  skillStats: SkillRunStats;
  topCalls: TopCall[];
  recentSkillRuns: RecentSkillRun[];
};

// ───────────────────────────────────────────────────────────────
// Queries
// ───────────────────────────────────────────────────────────────

/** Date helper — returns ISO timestamp N hours ago. */
function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

/** Fetch every system_costs row in the window, group by service. */
export async function rollupByService(
  windowHours: number,
): Promise<ServiceRollup[]> {
  if (!isSupabaseConfigured()) return [];
  const since = isoHoursAgo(windowHours);
  const { data, error } = await supabase
    .from("system_costs")
    .select("service, cost_usd")
    .gte("created_at", since)
    .order("cost_usd", { ascending: false });
  if (error || !data) return [];

  type Row = { service: string; cost_usd: number | string };
  const grouped = new Map<string, { costUsd: number; callCount: number }>();
  for (const row of data as Row[]) {
    const cost = Number(row.cost_usd) || 0;
    const existing = grouped.get(row.service) || { costUsd: 0, callCount: 0 };
    existing.costUsd += cost;
    existing.callCount += 1;
    grouped.set(row.service, existing);
  }

  const rollups: ServiceRollup[] = [];
  for (const [service, agg] of grouped) {
    const meta = getServiceMeta(service);
    rollups.push({
      service,
      label: meta.label,
      category: meta.category,
      costUsd: agg.costUsd,
      callCount: agg.callCount,
    });
  }
  // Sort by spend descending — most expensive first.
  rollups.sort((a, b) => b.costUsd - a.costUsd);
  return rollups;
}

/** Fold the service rollup into category totals. */
export function rollupByCategory(
  serviceRollups: ServiceRollup[],
): CategoryRollup[] {
  const by: Record<ServiceCategory, CategoryRollup> = {
    ai_compute: { category: "ai_compute", costUsd: 0, callCount: 0 },
    infrastructure: {
      category: "infrastructure",
      costUsd: 0,
      callCount: 0,
    },
    other: { category: "other", costUsd: 0, callCount: 0 },
  };
  for (const r of serviceRollups) {
    by[r.category].costUsd += r.costUsd;
    by[r.category].callCount += r.callCount;
  }
  return [by.ai_compute, by.infrastructure, by.other].filter(
    (c) => c.callCount > 0,
  );
}

/** Daily-burn trend — one row per day going back `days` days. Uses
 *  client-side bucketing because Supabase's date_trunc would require
 *  a SQL function and the dataset is small (<10K rows/day). */
export async function dailyBurnTrend(days: number): Promise<DailyTotal[]> {
  if (!isSupabaseConfigured()) return [];
  const since = isoHoursAgo(days * 24);
  const { data, error } = await supabase
    .from("system_costs")
    .select("created_at, cost_usd")
    .gte("created_at", since);
  if (error || !data) return [];

  type Row = { created_at: string; cost_usd: number | string };
  const buckets = new Map<string, { costUsd: number; callCount: number }>();
  for (const row of data as Row[]) {
    const day = row.created_at.slice(0, 10);
    const cost = Number(row.cost_usd) || 0;
    const existing = buckets.get(day) || { costUsd: 0, callCount: 0 };
    existing.costUsd += cost;
    existing.callCount += 1;
    buckets.set(day, existing);
  }
  // Fill in missing days with zeros so the trend chart is contiguous.
  const result: DailyTotal[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const b = buckets.get(d) || { costUsd: 0, callCount: 0 };
    result.push({ date: d, costUsd: b.costUsd, callCount: b.callCount });
  }
  return result;
}

/** Per-skill daily-cap status. */
export async function capsStatus(): Promise<CapStatus[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("ai_skill_caps")
    .select("skill, daily_cap_usd, spent_today_usd, cap_hits_today");
  if (error || !data) return [];
  type Row = {
    skill: string;
    daily_cap_usd: number | string;
    spent_today_usd: number | string;
    cap_hits_today: number;
  };
  return (data as Row[])
    .map((r) => {
      const dailyCap = Number(r.daily_cap_usd) || 0;
      const spent = Number(r.spent_today_usd) || 0;
      return {
        skill: r.skill,
        dailyCapUsd: dailyCap,
        spentTodayUsd: spent,
        pct: dailyCap > 0 ? (spent / dailyCap) * 100 : 0,
        capHitsToday: r.cap_hits_today || 0,
      };
    })
    .sort((a, b) => b.spentTodayUsd - a.spentTodayUsd);
}

/** Aggregate stats over ai_skill_runs in the window. */
export async function skillRunStats(
  windowHours: number,
): Promise<SkillRunStats> {
  const empty: SkillRunStats = {
    successful: 0,
    failed: 0,
    noWork: 0,
    avgLatencyMs: 0,
    p95LatencyMs: 0,
  };
  if (!isSupabaseConfigured()) return empty;
  const since = isoHoursAgo(windowHours);
  const { data, error } = await supabase
    .from("ai_skill_runs")
    .select("ok, no_work, latency_ms")
    .gte("created_at", since);
  if (error || !data) return empty;

  type Row = { ok: boolean; no_work: boolean; latency_ms: number };
  let successful = 0;
  let failed = 0;
  let noWork = 0;
  const productiveLatencies: number[] = [];
  for (const r of data as Row[]) {
    if (r.no_work) {
      noWork += 1;
      continue;
    }
    if (r.ok) {
      successful += 1;
      productiveLatencies.push(r.latency_ms || 0);
    } else {
      failed += 1;
    }
  }
  productiveLatencies.sort((a, b) => a - b);
  const avg = productiveLatencies.length
    ? productiveLatencies.reduce((s, n) => s + n, 0) /
      productiveLatencies.length
    : 0;
  const p95Index = Math.floor(productiveLatencies.length * 0.95);
  const p95 = productiveLatencies[p95Index] || 0;
  return {
    successful,
    failed,
    noWork,
    avgLatencyMs: Math.round(avg),
    p95LatencyMs: p95,
  };
}

/** Top-N most expensive AI calls in the window. */
export async function topCalls(
  limit: number,
  windowHours: number,
): Promise<TopCall[]> {
  if (!isSupabaseConfigured()) return [];
  const since = isoHoursAgo(windowHours);
  const { data, error } = await supabase
    .from("system_costs")
    .select("service, action, cost_usd, created_at")
    .gte("created_at", since)
    .order("cost_usd", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  type Row = {
    service: string;
    action: string | null;
    cost_usd: number | string;
    created_at: string;
  };
  return (data as Row[]).map((r) => ({
    service: r.service,
    costUsd: Number(r.cost_usd) || 0,
    createdAt: r.created_at,
    action: r.action || undefined,
  }));
}

/** Last N skill runs across all skills — used by the dashboard's
 *  "Recent skill outputs" widget. Reads ai_skill_runs directly so the
 *  summary text is shown verbatim. */
export async function recentSkillRuns(limit: number): Promise<RecentSkillRun[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("ai_skill_runs")
    .select(
      "id, skill, triggered_by, summary, ok, no_work, cost_usd, latency_ms, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  type Row = {
    id: string;
    skill: string;
    triggered_by: string;
    summary: string;
    ok: boolean;
    no_work: boolean;
    cost_usd: number | string;
    latency_ms: number;
    created_at: string;
  };
  return (data as Row[]).map((r) => ({
    id: r.id,
    skill: r.skill,
    triggeredBy: r.triggered_by,
    summary: r.summary,
    ok: r.ok,
    noWork: r.no_work,
    costUsd: Number(r.cost_usd) || 0,
    latencyMs: r.latency_ms || 0,
    createdAt: r.created_at,
  }));
}

/** Compose everything into one payload (used by the API + CLI). */
export async function getFullStats(
  windowHours: number,
  trendDays: number,
): Promise<FullStats> {
  const [byService, trend, caps, skillStats, topCallsRows, recentRuns] =
    await Promise.all([
      rollupByService(windowHours),
      dailyBurnTrend(trendDays),
      capsStatus(),
      skillRunStats(windowHours),
      topCalls(10, windowHours),
      recentSkillRuns(15),
    ]);
  const byCategory = rollupByCategory(byService);

  const aiCompute =
    byCategory.find((c) => c.category === "ai_compute")?.costUsd || 0;
  const infrastructure =
    byCategory.find((c) => c.category === "infrastructure")?.costUsd || 0;
  const other = byCategory.find((c) => c.category === "other")?.costUsd || 0;
  const grandTotal = aiCompute + infrastructure + other;
  const callCount = byService.reduce((s, r) => s + r.callCount, 0);

  return {
    windowHours,
    generatedAt: new Date().toISOString(),
    totals: {
      aiComputeUsd: aiCompute,
      infrastructureUsd: infrastructure,
      otherUsd: other,
      grandTotalUsd: grandTotal,
      callCount,
    },
    byService,
    byCategory,
    trend,
    caps,
    skillStats,
    topCalls: topCallsRows,
    recentSkillRuns: recentRuns,
  };
}
