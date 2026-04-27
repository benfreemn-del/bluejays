import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Weekly Hyperloop cron — Karpathy auto-research loop.
 *
 * Built DORMANT per Q10A. Schema + cron + auth are wired so flipping
 * to active is a 1-line change in the dormancy gate below.
 *
 * Dormancy gate: requires ≥100 ready audits AND ≥5 paid customers
 * before the loop wakes up. Below that the dataset is too small for
 * Claude's analysis to be meaningful — better to log a "dormant"
 * heartbeat than spend $0.50 of Anthropic credits on noise.
 *
 * When active, the loop will:
 *   1. Pull `hyperloop_variants` rows where status='active'
 *   2. Group by `kind` and compute per-variant conversion + CPA
 *   3. Flag statistically-significant winners/losers
 *   4. (Optional) Call Claude to suggest 2-3 new variants per kind,
 *      seeded from the current winner's content
 *   5. Insert new variants with status='active'
 *   6. Log a `hyperloop_runs` row with the full summary
 *
 * For now: every tick logs a `hyperloop_runs` row with active=false
 * and gate_reason explaining why we're still dormant. Heartbeat
 * confirms the cron is firing on schedule.
 *
 * Schedule: Mondays 16:00 UTC (9am PT) — once per week per Q10A.
 * Auth: Vercel cron passes Bearer CRON_SECRET. Manual triggers same.
 *
 * Public via PUBLIC_API_PATHS (`/api/hyperloop/`) — gated by CRON_SECRET
 * inside the handler, same pattern as /api/funnel/run.
 */

// Dormancy gate — flip these to lower thresholds (or to 0) to wake
// the loop up after Ben confirms enough audit + sale signal exists.
const MIN_READY_AUDITS_TO_WAKE = 100;
const MIN_PAID_CUSTOMERS_TO_WAKE = 5;

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

  // Dormancy check ─────────────────────────────────────────────────
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
    auditsReady < MIN_READY_AUDITS_TO_WAKE ||
    customersPaid < MIN_PAID_CUSTOMERS_TO_WAKE;

  if (dormant) {
    const gateReason =
      `Dormant: ${auditsReady}/${MIN_READY_AUDITS_TO_WAKE} ready audits, ` +
      `${customersPaid}/${MIN_PAID_CUSTOMERS_TO_WAKE} paid customers. ` +
      `Will wake when both thresholds are met.`;

    await supabase.from("hyperloop_runs").insert({
      active: false,
      gate_reason: gateReason,
      status: "dormant",
      notes: "Heartbeat — confirms weekly cron is firing on schedule.",
      metadata: {
        thresholds: {
          minReadyAudits: MIN_READY_AUDITS_TO_WAKE,
          minPaidCustomers: MIN_PAID_CUSTOMERS_TO_WAKE,
        },
        observed: { auditsReady, customersPaid },
      },
    });

    return NextResponse.json({
      dormant: true,
      gateReason,
      auditsReady,
      customersPaid,
      thresholds: {
        minReadyAudits: MIN_READY_AUDITS_TO_WAKE,
        minPaidCustomers: MIN_PAID_CUSTOMERS_TO_WAKE,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // ACTIVE PATH — wired but intentionally minimal until thresholds hit.
  // Day-1 active behavior: pull active variants per kind, log a run
  // summary, flag obvious losers (zero conversions over ≥1k impressions).
  // The Claude-suggested-new-variants step lands in a follow-up commit
  // when there's signal worth feeding it.
  // ─────────────────────────────────────────────────────────────────

  const { data: variants, error: variantErr } = await supabase
    .from("hyperloop_variants")
    .select("id, kind, variant_name, impressions, clicks, conversions, cost_usd")
    .eq("status", "active");

  if (variantErr) {
    await supabase.from("hyperloop_runs").insert({
      active: true,
      status: "failed",
      notes: `Active query failed: ${variantErr.message}`,
    });
    return NextResponse.json(
      { error: variantErr.message },
      { status: 500 },
    );
  }

  const rows = variants || [];
  let losersFound = 0;

  // Crude initial heuristic: ≥1,000 impressions + 0 conversions = obvious
  // loser, retire it. Will be replaced with proper confidence-interval
  // math once we have meaningful data.
  for (const v of rows) {
    if ((v.impressions ?? 0) >= 1000 && (v.conversions ?? 0) === 0) {
      await supabase
        .from("hyperloop_variants")
        .update({ status: "loser", updated_at: new Date().toISOString() })
        .eq("id", v.id);
      losersFound++;
    }
  }

  await supabase.from("hyperloop_runs").insert({
    active: true,
    variants_analyzed: rows.length,
    losers_found: losersFound,
    winners_found: 0,
    new_variants_created: 0,
    status: "completed",
    notes: `Day-1 active path. ${rows.length} variants analyzed, ${losersFound} obvious losers retired. Claude-suggested new variants land in follow-up.`,
    metadata: { auditsReady, customersPaid },
  });

  return NextResponse.json({
    dormant: false,
    variantsAnalyzed: rows.length,
    losersFound,
    winnersFound: 0,
    newVariantsCreated: 0,
    note: "Day-1 active path. Claude-suggested-variants step lands in a follow-up.",
  });
}
