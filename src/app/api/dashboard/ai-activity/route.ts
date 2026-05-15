import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/dashboard/ai-activity
 *
 * Hormozi backend review B2 (2026-05-16) — "AI gets smarter weekly"
 * needs to be measurable. Aggregates the last 7 days of `system_costs`
 * rows tagged with AI services (openai, anthropic, claude, perplexity)
 * + the `client_lead_messages` rows tagged as AI-drafted/auto-sent.
 *
 * Returns a single object meant to be screen-shareable live on a
 * sales call:
 *   { totals: { calls, costUsd, replies, postcards },
 *     topActions: [{ action, count }, ...],
 *     dailySpark: [{ day: '2026-05-10', costUsd, calls }, ...] }
 *
 * Auth: covered by /api middleware (admin-password cookie).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AI_SERVICES = new Set(["openai", "anthropic", "claude", "perplexity", "gpt", "google_ai"]);
const POSTCARD_ACTIONS = new Set(["postcard_send", "lob_postcard", "ai_postcard"]);

type CostRow = {
  service: string;
  action: string;
  cost_usd: number | string;
  created_at: string;
};

type LeadMessageRow = {
  provider: string | null;
  template_id: string | null;
  created_at: string;
};

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      totals: { calls: 0, costUsd: 0, replies: 0, postcards: 0 },
      topActions: [],
      dailySpark: [],
      configured: false,
    });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // 1) System cost rows tagged AI.
  const { data: costsRaw, error: costsErr } = await supabase
    .from("system_costs")
    .select("service, action, cost_usd, created_at")
    .gte("created_at", sevenDaysAgo)
    .limit(20000);

  if (costsErr) {
    return NextResponse.json({ ok: false, error: costsErr.message }, { status: 500 });
  }

  const aiRows = ((costsRaw || []) as CostRow[]).filter((r) =>
    AI_SERVICES.has((r.service || "").toLowerCase()),
  );
  const calls = aiRows.length;
  const costUsd = aiRows.reduce((sum, r) => {
    const v = typeof r.cost_usd === "string" ? parseFloat(r.cost_usd) : r.cost_usd;
    return sum + (Number.isFinite(v) ? v : 0);
  }, 0);

  // Top actions — bucket then sort.
  const actionCounts = new Map<string, number>();
  for (const r of aiRows) {
    const a = r.action || "unknown";
    actionCounts.set(a, (actionCounts.get(a) || 0) + 1);
  }
  const topActions = Array.from(actionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([action, count]) => ({ action, count }));

  // Postcard count — separate from AI-call count, sourced from cost rows
  // tagged with a postcard action (Lob / AI-postcard).
  const postcards = ((costsRaw || []) as CostRow[]).filter((r) =>
    POSTCARD_ACTIONS.has((r.action || "").toLowerCase()),
  ).length;

  // 2) AI-drafted client lead messages (auto-replies). Best-effort — the
  // table may not exist in older deploys; we try and degrade to 0.
  let replies = 0;
  try {
    const { data: msgRows } = await supabase
      .from("client_lead_messages")
      .select("provider, template_id, created_at")
      .gte("created_at", sevenDaysAgo)
      .limit(20000);
    replies = ((msgRows || []) as LeadMessageRow[]).filter((m) => {
      const p = (m.provider || "").toLowerCase();
      const t = (m.template_id || "").toLowerCase();
      return p === "ai" || p === "openai" || p === "anthropic" || t.includes("ai") || t.includes("auto");
    }).length;
  } catch {
    replies = 0;
  }

  // 3) Daily sparkline — 7 buckets, oldest to newest.
  const days: Array<{ day: string; costUsd: number; calls: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    days.push({ day: ymd(d), costUsd: 0, calls: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.day, i] as const));
  for (const r of aiRows) {
    const k = (r.created_at || "").slice(0, 10);
    const i = dayIndex.get(k);
    if (i === undefined) continue;
    const v = typeof r.cost_usd === "string" ? parseFloat(r.cost_usd) : r.cost_usd;
    days[i].costUsd += Number.isFinite(v) ? v : 0;
    days[i].calls += 1;
  }

  return NextResponse.json({
    ok: true,
    totals: { calls, costUsd, replies, postcards },
    topActions,
    dailySpark: days,
    configured: true,
  });
}
