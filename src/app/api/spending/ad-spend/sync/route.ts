import { NextRequest, NextResponse } from "next/server";
import { getGoogleAdsClient } from "@/lib/google-ads-client";
import { getMetaAdsClient } from "@/lib/meta-ads-client";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/spending/ad-spend/sync
 *
 * Pulls actual ad spend from Google Ads + Meta Ads APIs (using the
 * existing GoogleAdsClient.getAccountSpendUsd / MetaAdsClient
 * .getAccountSpendUsd helpers) and writes it to system_costs as
 * synthetic daily rows.
 *
 * Body (optional): { daysBack: number = 30 }
 *
 * Idempotent: deletes any existing google_ads_spend / meta_ads_spend
 * rows in the same window before re-inserting. Each platform's spend
 * lands as ONE row dated `today - 1 day` covering the whole window —
 * we don't have day-level breakdowns from `getAccountSpendUsd`. If
 * you need per-day granularity, log manually via /api/spending/ad-spend.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SyncResult = {
  google: { ok: boolean; spentUsd: number; error?: string };
  meta: { ok: boolean; spentUsd: number; error?: string };
};

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 500 },
    );
  }
  let body: { daysBack?: number } = {};
  try {
    body = await req.json();
  } catch {
    // body is optional
  }
  const daysBack =
    typeof body.daysBack === "number" && body.daysBack > 0 && body.daysBack <= 365
      ? Math.floor(body.daysBack)
      : 30;

  const result: SyncResult = {
    google: { ok: false, spentUsd: 0 },
    meta: { ok: false, spentUsd: 0 },
  };

  // ── Google Ads ───────────────────────────────────────────────
  try {
    const client = getGoogleAdsClient();
    const usd = await client.getAccountSpendUsd(daysBack);
    result.google = { ok: true, spentUsd: usd };
  } catch (err) {
    result.google.error = err instanceof Error ? err.message : "unknown";
  }

  // ── Meta Ads ────────────────────────────────────────────────
  try {
    const client = getMetaAdsClient();
    const usd = await client.getAccountSpendUsd(daysBack);
    result.meta = { ok: true, spentUsd: usd };
  } catch (err) {
    result.meta.error = err instanceof Error ? err.message : "unknown";
  }

  // ── Persist ─────────────────────────────────────────────────
  // Date the synthetic row at "yesterday noon UTC" so it falls inside
  // any 30-day window without colliding with today's manual logs.
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(12, 0, 0, 0);
  const stampIso = yesterday.toISOString();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);

  // Wipe prior api-sync rows (only the ones tagged source=api_sync)
  // so manual rows + previous syncs from a longer window stay intact.
  const { error: delErr } = await supabase
    .from("system_costs")
    .delete()
    .in("service", ["google_ads_spend", "meta_ads_spend"])
    .eq("action", "api_sync")
    .gte("created_at", cutoff.toISOString());
  if (delErr) {
    return NextResponse.json(
      { ok: false, error: `cleanup failed: ${delErr.message}` },
      { status: 500 },
    );
  }

  const inserts: Array<{
    service: string;
    action: string;
    cost_usd: number;
    status: string;
    created_at: string;
    metadata: Record<string, unknown>;
  }> = [];

  if (result.google.ok && result.google.spentUsd > 0) {
    inserts.push({
      service: "google_ads_spend",
      action: "api_sync",
      cost_usd: result.google.spentUsd,
      status: "success",
      created_at: stampIso,
      metadata: {
        source: "api_sync",
        windowDays: daysBack,
        syncedAt: new Date().toISOString(),
      },
    });
  }
  if (result.meta.ok && result.meta.spentUsd > 0) {
    inserts.push({
      service: "meta_ads_spend",
      action: "api_sync",
      cost_usd: result.meta.spentUsd,
      status: "success",
      created_at: stampIso,
      metadata: {
        source: "api_sync",
        windowDays: daysBack,
        syncedAt: new Date().toISOString(),
      },
    });
  }
  if (inserts.length > 0) {
    const { error: insErr } = await supabase.from("system_costs").insert(inserts);
    if (insErr) {
      return NextResponse.json(
        { ok: false, error: `insert failed: ${insErr.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true, daysBack, ...result });
}
