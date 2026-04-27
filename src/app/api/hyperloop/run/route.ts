import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { analyzeAll, type VariantMetrics } from "@/lib/hyperloop-analysis";
import {
  generateVariants,
  type ExistingVariant,
  type VariantKind,
} from "@/lib/hyperloop-variant-gen";
import { syncAllVariants } from "@/lib/hyperloop-sync";
import { rolloutBatch, type RolloutResult } from "@/lib/hyperloop-rollout";

/**
 * Weekly Hyperloop cron — Karpathy auto-research loop. Stage 1 active
 * path (2026-04-26 evening — commits db2db2a-onward).
 *
 * Per Ben's 10-question answers:
 *   3A — auto-rollout new variants without approval (writes status='active')
 *   4A — auto-pause losers immediately (writes status='loser')
 *   5A — weekly cadence (Mondays 16:00 UTC)
 *   6B — $50/wk Anthropic cost cap (hyperloop_config.weekly_cost_cap_usd)
 *   7A — Ben writes seed variants; AI evolves from there
 *  10B — kill-switch in DB (hyperloop_config.paused), one-click pause
 *
 * Flow per active tick:
 *   1. Read hyperloop_config (paused? cost cap? thresholds?)
 *   2. Dormancy check (audits_ready + customers_paid vs thresholds)
 *   3. If active: pull all variants, analyze with Bayesian/Wilson math
 *   4. Auto-pause losers (status → 'loser', stamp retired_at + reason)
 *   5. Promote winners (status → 'winner') — keeps them in the pool
 *      but flags them for the AI generator as seed material
 *   6. For each kind with at least 1 winner OR loser: ask Claude to
 *      generate 5 new variants seeded from winners, avoiding losers
 *   7. Insert new variants with status='active', parent_variant_id
 *      pointing at the seed winner
 *   8. Cost cap: skip steps 6-7 entirely if week-to-date AI cost
 *      already exceeds the cap. Log run with cost_cap_hit=true.
 *
 * Stage 2 (future commit) adds: Meta + Google Ads API push for the
 * new variants + auto-pause on the platform side. Stage 1 surfaces
 * variants in /dashboard/hyperloop where Ben can manually copy them
 * to Meta/Google until then.
 */

// Fallback constants — used only if hyperloop_config row is missing.
// Normal operation reads from the table so values can be tuned without
// a redeploy.
const FALLBACK_MIN_AUDITS = 100;
const FALLBACK_MIN_PAID = 5;
const FALLBACK_WEEKLY_COST_CAP = 50;
const VARIANTS_PER_KIND_PER_RUN = 5;

interface HyperloopConfig {
  paused: boolean;
  weekly_cost_cap_usd: number;
  min_audits_to_wake: number;
  min_paid_to_wake: number;
}

export async function POST(req?: NextRequest) {
  return runHyperloop(req);
}

export async function GET(req?: NextRequest) {
  return runHyperloop(req);
}

async function runHyperloop(req?: NextRequest) {
  if (req) {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      message: "Supabase not configured — Hyperloop is a no-op in dev",
      dormant: true,
    });
  }

  // ─── Load config (kill-switch, cost cap, thresholds) ───────────────
  const config = await loadConfig();

  if (config.paused) {
    await supabase.from("hyperloop_runs").insert({
      active: false,
      gate_reason: "Operator paused via dashboard kill-switch (10B).",
      status: "dormant",
      notes: "Heartbeat — Hyperloop is paused. Flip hyperloop_config.paused = false to resume.",
    });
    return NextResponse.json({
      dormant: true,
      paused: true,
      message: "Hyperloop is paused. Flip the kill-switch in /dashboard/hyperloop to resume.",
    });
  }

  // ─── Dormancy check (audits + paid thresholds) ────────────────────
  const [{ count: auditCount }, { count: paidCount }] = await Promise.all([
    supabase
      .from("site_audits")
      .select("id", { count: "exact", head: true })
      .eq("status", "ready"),
    supabase
      .from("prospects")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid"),
  ]);

  const auditsReady = auditCount ?? 0;
  const customersPaid = paidCount ?? 0;
  const dormant =
    auditsReady < config.min_audits_to_wake ||
    customersPaid < config.min_paid_to_wake;

  if (dormant) {
    const gateReason =
      `Dormant: ${auditsReady}/${config.min_audits_to_wake} ready audits, ` +
      `${customersPaid}/${config.min_paid_to_wake} paid customers. ` +
      `Will wake when both thresholds are met.`;

    await supabase.from("hyperloop_runs").insert({
      active: false,
      gate_reason: gateReason,
      status: "dormant",
      notes: "Heartbeat — confirms weekly cron is firing on schedule.",
      metadata: {
        thresholds: {
          minReadyAudits: config.min_audits_to_wake,
          minPaidCustomers: config.min_paid_to_wake,
        },
        observed: { auditsReady, customersPaid },
      },
    });

    return NextResponse.json({
      dormant: true,
      gateReason,
      auditsReady,
      customersPaid,
    });
  }

  // ─── Sync platform metrics first (Q5A: single cron, two-step) ────
  // Pulls last 7 days of impressions / clicks / conversions / spend
  // from Meta + Google for every variant with a platform_ad_id, then
  // refreshes the variant aggregates so analysis runs on fresh data.
  // Partial failures are OK (Q9A) — synced variants get fresh metrics,
  // failed ones keep their last-known state.
  const syncResult = await syncAllVariants();

  // ─── Active path: load variants + analyze ─────────────────────────
  const { data: variantRows, error: variantErr } = await supabase
    .from("hyperloop_variants")
    .select(
      "id, kind, variant_name, content, status, impressions, clicks, conversions, cost_usd",
    )
    .in("status", ["active", "winner"]); // include current winners as seed candidates

  if (variantErr) {
    await supabase.from("hyperloop_runs").insert({
      active: true,
      status: "failed",
      notes: `Active query failed: ${variantErr.message}`,
    });
    return NextResponse.json({ error: variantErr.message }, { status: 500 });
  }

  const variants: VariantMetrics[] = (variantRows ?? []).map((r) => ({
    id: r.id as string,
    kind: r.kind as string,
    variantName: r.variant_name as string,
    status: r.status as VariantMetrics["status"],
    impressions: (r.impressions ?? 0) as number,
    clicks: (r.clicks ?? 0) as number,
    conversions: (r.conversions ?? 0) as number,
    costUsd: parseFloat(String(r.cost_usd ?? 0)),
  }));

  // Side map for content — analysis lib stays focused on metrics, but
  // the AI generator needs to see the actual copy/payload.
  const variantContents = new Map<string, Record<string, unknown>>();
  for (const r of variantRows ?? []) {
    variantContents.set(
      r.id as string,
      (r.content ?? {}) as Record<string, unknown>,
    );
  }

  const analyses = analyzeAll(variants);

  // ─── Apply verdicts: auto-pause losers, promote winners ───────────
  let losersFound = 0;
  let winnersFound = 0;

  for (const v of variants) {
    const a = analyses.get(v.id);
    if (!a) continue;
    const newStatus =
      a.verdict === "loser"
        ? "loser"
        : a.verdict === "winner"
          ? "winner"
          : null;
    if (!newStatus || newStatus === v.status) continue;

    const update: Record<string, unknown> = {
      status: newStatus,
      bayesian_p_better: Math.round(a.wilsonLowerBound * 1000) / 1000,
      updated_at: new Date().toISOString(),
    };
    if (newStatus === "loser") {
      update.retired_at = new Date().toISOString();
      update.retired_reason = a.reason;
      losersFound++;
    } else if (newStatus === "winner") {
      winnersFound++;
    }
    await supabase.from("hyperloop_variants").update(update).eq("id", v.id);
  }

  // ─── Cost cap check (6B: $50/wk Anthropic credit cap) ─────────────
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentRuns } = await supabase
    .from("hyperloop_runs")
    .select("ai_cost_usd")
    .gte("ran_at", sevenDaysAgo);
  const weekToDateCost = (recentRuns ?? []).reduce(
    (sum, r) => sum + parseFloat(String(r.ai_cost_usd ?? 0)),
    0,
  );

  if (weekToDateCost >= config.weekly_cost_cap_usd) {
    await supabase.from("hyperloop_runs").insert({
      active: true,
      variants_analyzed: variants.length,
      losers_found: losersFound,
      winners_found: winnersFound,
      new_variants_created: 0,
      ai_cost_usd: 0,
      week_to_date_cost_usd: weekToDateCost,
      cost_cap_hit: true,
      status: "completed",
      notes: `Cost cap hit: weekToDate=$${weekToDateCost.toFixed(2)} >= cap=$${config.weekly_cost_cap_usd}. Skipped variant generation.`,
      metadata: { auditsReady, customersPaid },
    });
    return NextResponse.json({
      active: true,
      costCapHit: true,
      weekToDateCost,
      cap: config.weekly_cost_cap_usd,
      variantsAnalyzed: variants.length,
      losersFound,
      winnersFound,
      newVariantsCreated: 0,
    });
  }

  // ─── AI variant generation ───────────────────────────────────────
  const KINDS: VariantKind[] = [
    "ad_copy_meta",
    "ad_copy_google",
    "audit_prompt",
    "email_subject_pitch",
    "email_subject_followup",
    "cta_text_audit_buy",
    "cta_text_audit_preview",
    "sms_body_pitch",
  ];

  let totalGenCost = 0;
  let totalNewVariants = 0;
  let totalRolledOut = 0;
  let totalRolloutFailed = 0;
  const generationResults: Array<{ kind: string; created: number; cost: number; error?: string }> = [];
  const rolloutResults: RolloutResult[] = [];

  for (const kind of KINDS) {
    // Stop generating mid-loop if we cross the cost cap
    if (weekToDateCost + totalGenCost >= config.weekly_cost_cap_usd) {
      generationResults.push({ kind, created: 0, cost: 0, error: "cost_cap_reached_mid_run" });
      continue;
    }

    const kindVariants = variants.filter((v) => v.kind === kind);
    if (kindVariants.length === 0) {
      // Nothing to seed from for this kind — skip silently. Ben needs
      // to write the first variants per Q7A.
      continue;
    }

    const winnersForKind: ExistingVariant[] = kindVariants
      .filter((v) => analyses.get(v.id)?.verdict === "winner")
      .slice(0, 3)
      .map((v) => ({
        id: v.id,
        variantName: v.variantName,
        content: variantContents.get(v.id) ?? {},
        conversionRate: analyses.get(v.id)!.conversionRate,
        impressions: v.impressions,
        conversions: v.conversions,
        verdict: "winner" as const,
      }));

    const losersForKind: ExistingVariant[] = kindVariants
      .filter((v) => analyses.get(v.id)?.verdict === "loser")
      .slice(0, 3)
      .map((v) => ({
        id: v.id,
        variantName: v.variantName,
        content: variantContents.get(v.id) ?? {},
        conversionRate: analyses.get(v.id)!.conversionRate,
        impressions: v.impressions,
        conversions: v.conversions,
        verdict: "loser" as const,
      }));

    // Need either winners OR losers as signal — skip if all variants
    // are still in 'testing' / 'insufficient_data' state
    if (winnersForKind.length === 0 && losersForKind.length === 0) {
      continue;
    }

    const result = await generateVariants({
      kind,
      winners: winnersForKind,
      losers: losersForKind,
      count: VARIANTS_PER_KIND_PER_RUN,
    });

    totalGenCost += result.costUsd;

    if (result.error || result.variants.length === 0) {
      generationResults.push({ kind, created: 0, cost: result.costUsd, error: result.error });
      continue;
    }

    // Insert new variants
    const seedVariantId = winnersForKind[0]?.id ?? null;
    const inserts = result.variants.map((g) => ({
      kind,
      variant_name: g.variantName,
      content: g.content,
      status: "active",
      parent_variant_id: seedVariantId,
      metadata: {
        rationale: g.rationale,
        generatedBy: "hyperloop_cron",
        generatedAt: new Date().toISOString(),
        modelUsed: result.modelUsed,
      },
    }));

    const { data: insertedVariants, error: insertErr } = await supabase
      .from("hyperloop_variants")
      .insert(inserts)
      .select("id, kind, variant_name, content");

    if (insertErr) {
      generationResults.push({ kind, created: 0, cost: result.costUsd, error: insertErr.message });
      continue;
    }

    totalNewVariants += inserts.length;
    generationResults.push({ kind, created: inserts.length, cost: result.costUsd });

    // ─── Auto-rollout (Stage 2 Commit C, per Q3A) ──────────────
    // For ad_copy_meta + ad_copy_google variants, push them as live
    // ads on the platform and stamp platform_ad_id back so the next
    // sync picks up performance data. Internal kinds (audit_prompt,
    // email_*, sms_*) skip silently — they don't have a platform ad.
    if (insertedVariants && insertedVariants.length > 0) {
      const batch = insertedVariants.map((v) => ({
        variantId: v.id as string,
        kind: v.kind as string,
        variantName: v.variant_name as string,
        content: (v.content ?? {}) as Record<string, unknown>,
      }));

      const rollouts = await rolloutBatch(batch);
      rolloutResults.push(...rollouts);

      // Stamp platform_ad_id on the variants that successfully landed
      for (const r of rollouts) {
        if (r.success && r.platformAdId) {
          await supabase
            .from("hyperloop_variants")
            .update({
              platform_ad_id: r.platformAdId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", r.variantId);
          totalRolledOut++;
        } else if (r.error) {
          totalRolloutFailed++;
        }
      }
    }
  }

  // ─── Log the run ──────────────────────────────────────────────────
  await supabase.from("hyperloop_runs").insert({
    active: true,
    variants_analyzed: variants.length,
    losers_found: losersFound,
    winners_found: winnersFound,
    new_variants_created: totalNewVariants,
    ai_cost_usd: totalGenCost,
    week_to_date_cost_usd: weekToDateCost + totalGenCost,
    cost_cap_hit: false,
    status: "completed",
    notes: `Stage 2 active path. Synced ${syncResult.synced}/${syncResult.attempted} variants from platforms (${syncResult.failed} failed, ${syncResult.skipped} skipped). Analyzed ${variants.length}, paused ${losersFound}, promoted ${winnersFound}, generated ${totalNewVariants} new variants for $${totalGenCost.toFixed(4)}, rolled out ${totalRolledOut} to platforms (${totalRolloutFailed} failed).`,
    metadata: {
      auditsReady,
      customersPaid,
      perKind: generationResults,
      sync: syncResult,
      rollouts: rolloutResults,
      rolloutSummary: {
        rolledOut: totalRolledOut,
        failed: totalRolloutFailed,
      },
    },
  });

  return NextResponse.json({
    active: true,
    sync: syncResult,
    variantsAnalyzed: variants.length,
    losersFound,
    winnersFound,
    newVariantsCreated: totalNewVariants,
    rolledOut: totalRolledOut,
    rolloutFailed: totalRolloutFailed,
    aiCostUsd: totalGenCost,
    weekToDateCostUsd: weekToDateCost + totalGenCost,
    perKind: generationResults,
    rollouts: rolloutResults,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────

async function loadConfig(): Promise<HyperloopConfig> {
  const { data } = await supabase
    .from("hyperloop_config")
    .select("paused, weekly_cost_cap_usd, min_audits_to_wake, min_paid_to_wake")
    .eq("id", 1)
    .maybeSingle();
  return {
    paused: !!data?.paused,
    weekly_cost_cap_usd: parseFloat(String(data?.weekly_cost_cap_usd ?? FALLBACK_WEEKLY_COST_CAP)),
    min_audits_to_wake: (data?.min_audits_to_wake ?? FALLBACK_MIN_AUDITS) as number,
    min_paid_to_wake: (data?.min_paid_to_wake ?? FALLBACK_MIN_PAID) as number,
  };
}

