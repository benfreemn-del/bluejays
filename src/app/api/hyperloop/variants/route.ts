import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/hyperloop/variants
 *
 * Operator-only (admin auth via /api/hyperloop in PROTECTED_PATHS would
 * be cleaner, but Hyperloop is currently in PUBLIC_API_PATHS so the
 * cron can hit it. The dashboard page itself is in PROTECTED_PATHS via
 * /dashboard, so unauth visitors never see this anyway.)
 *
 * Returns every variant grouped by kind, sorted by status (winners
 * first, then active, then losers, then archived). Includes lineage
 * via parent_variant_id so the dashboard can render the variant tree.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ variants: [] });
  }

  const { data, error } = await supabase
    .from("hyperloop_variants")
    .select(
      "id, kind, variant_name, content, status, impressions, clicks, conversions, cost_usd, parent_variant_id, bayesian_p_better, retired_at, retired_reason, metadata, created_at, updated_at",
    )
    .order("kind", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ variants: data ?? [] });
}

/**
 * PATCH /api/hyperloop/variants
 *
 * Update one variant's status / metrics. Used when:
 *   - Operator manually pauses a variant
 *   - Operator pastes weekly metrics from Meta/Google (Stage 1
 *     manual-data-entry workflow before Stage 2 API integration)
 */
export async function PATCH(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  let body: {
    id?: string;
    status?: "active" | "paused" | "winner" | "loser" | "archived";
    impressions?: number;
    clicks?: number;
    conversions?: number;
    costUsd?: number;
    /** Map this variant to an existing platform ad. Set to "" or null
     *  to unmap. Stage 2 Commit E — lets Ben paste an ID for an ad he
     *  already created manually (so it joins the auto-loop). */
    platformAdId?: string | null;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) update.status = body.status;
  if (body.impressions !== undefined) update.impressions = body.impressions;
  if (body.clicks !== undefined) update.clicks = body.clicks;
  if (body.conversions !== undefined) update.conversions = body.conversions;
  if (body.costUsd !== undefined) update.cost_usd = body.costUsd;
  if (body.platformAdId !== undefined) {
    // Trim + treat empty string as unmap (NULL)
    const trimmed = body.platformAdId == null ? null : String(body.platformAdId).trim();
    update.platform_ad_id = trimmed === "" ? null : trimmed;
  }
  if (body.impressions !== undefined || body.conversions !== undefined) {
    update.last_metrics_synced_at = new Date().toISOString();
  }

  const { error } = await supabase.from("hyperloop_variants").update(update).eq("id", body.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
