import { NextRequest, NextResponse } from "next/server";
import { logCost } from "@/lib/cost-logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * /api/spending/ad-spend
 *
 * GET  → list logged ad-spend rows (last 90 days). Used by the
 *        manual logger UI to show recent entries.
 * POST → log a single ad-spend row to system_costs. Body:
 *        { service, date, amountUsd, notes?, platformAccountId? }
 *
 * The reason this exists separately from the cost-logger pipeline
 * is that ad-spend is a different *kind* of cost from API-call cost:
 *   - logCost() rows are per-API-call ($0.017 google_places, etc.)
 *   - ad-spend rows are aggregated daily totals from ad platforms
 *     ($220 spent on Google Ads on 2026-05-04)
 *
 * Both go into system_costs so the daily chart sums them naturally.
 * `service` discriminator: google_ads_spend, meta_ads_spend, other_ads.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_SERVICES = [
  "google_ads_spend",
  "meta_ads_spend",
  "other_ads",
] as const;

type AdSpendService = (typeof VALID_SERVICES)[number];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, rows: [] });
  }
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const { data, error } = await supabase
    .from("system_costs")
    .select("id, service, action, cost_usd, created_at, metadata")
    .in("service", VALID_SERVICES as unknown as string[])
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, rows: data ?? [] });
}

export async function POST(req: NextRequest) {
  let body: {
    service?: string;
    date?: string;
    amountUsd?: number;
    notes?: string;
    platformAccountId?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }
  const { service, date, amountUsd, notes, platformAccountId } = body;
  if (!service || !VALID_SERVICES.includes(service as AdSpendService)) {
    return NextResponse.json(
      {
        ok: false,
        error: `service must be one of ${VALID_SERVICES.join(", ")}`,
      },
      { status: 400 },
    );
  }
  if (!date || !DATE_RE.test(date)) {
    return NextResponse.json(
      { ok: false, error: "date required as YYYY-MM-DD" },
      { status: 400 },
    );
  }
  if (typeof amountUsd !== "number" || !isFinite(amountUsd) || amountUsd < 0) {
    return NextResponse.json(
      { ok: false, error: "amountUsd must be a non-negative number" },
      { status: 400 },
    );
  }
  if (amountUsd > 1_000_000) {
    return NextResponse.json(
      { ok: false, error: "amountUsd looks unreasonable (>$1M)" },
      { status: 400 },
    );
  }
  // Backdate the row so it appears on the daily chart for `date`.
  // logCost() doesn't support backdating, so insert directly.
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured on this deploy" },
      { status: 500 },
    );
  }
  const createdAt = new Date(`${date}T12:00:00.000Z`).toISOString();
  const { data, error } = await supabase
    .from("system_costs")
    .insert({
      service,
      action: "manual_log",
      cost_usd: amountUsd,
      status: "success",
      created_at: createdAt,
      metadata: {
        source: "manual_ui",
        notes: notes ?? null,
        platformAccountId: platformAccountId ?? null,
        loggedAt: new Date().toISOString(),
      },
    })
    .select("*")
    .single();
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  // Also call logCost so the cost-logger telemetry stays consistent
  // (no-op cost since the row was already inserted).
  await logCost({
    service: `${service}_logged`,
    action: "manual_log_meta",
    costUsd: 0,
    metadata: { date, amountUsd },
  }).catch(() => {});
  return NextResponse.json({ ok: true, row: data });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "id query param required" },
      { status: 400 },
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 500 },
    );
  }
  const { error } = await supabase
    .from("system_costs")
    .delete()
    .eq("id", id)
    .in("service", VALID_SERVICES as unknown as string[]);
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
