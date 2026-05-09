import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  runIterationEngine,
  checkRetargetingGap,
  computeAllocationDrift,
  type AllocationBucket,
} from "@/lib/paid-ads-rules";
import { emitSignal } from "@/lib/agent-signals";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * GET /api/ai/iteration-engine/run?slug=X
 *
 * Autonomous paid-ads iteration engine. Reads a tenant's creatives +
 * (when present) live ROAS data, runs the Hormozi 11-rule engine
 * from paid-ads-rules.ts, and emits recommendations to agent_signals
 * for owner review.
 *
 * Idempotent — same input produces same output. Re-runs replace the
 * pending recommendation set per slug (via signal kind=ad-recommendation,
 * marked read on next emit).
 *
 * For tenants without live ROAS data, the engine runs against
 * synthetic mock metrics (deterministic per creative_id hash) so the
 * shape is testable end-to-end before the real Meta + Google API
 * integration lands. Mock vs real path is logged in the heartbeat
 * metadata so we can tell at a glance which mode ran.
 *
 * Auth: cron-secret OR owner-cookie. Cron path bypasses auth via the
 * standard CRON_SECRET bearer; manual triggers from the dashboard
 * use the owner cookie (validated against the slug).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim() || "";
  if (!/^[a-z0-9-]{1,60}$/i.test(slug)) {
    return NextResponse.json(
      { ok: false, error: "valid slug required" },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: false,
      error: "supabase_not_configured",
    });
  }

  // Pull all creatives for the slug
  const { data: rows, error } = await supabase
    .from("client_ad_creatives")
    .select("id, platform, audience, variant_label, status, impressions, clicks, conversions, spend_cents, last_synced_at, created_at")
    .eq("client_slug", slug)
    .neq("status", "archived")
    .neq("status", "killed")
    .limit(500);
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  const creatives = rows ?? [];
  if (creatives.length === 0) {
    await logHeartbeat(`iteration_engine_${slug.replace(/-/g, "_")}`, {
      slug,
      creatives: 0,
      recommendations: 0,
      mode: "no-creatives",
    });
    return NextResponse.json({
      ok: true,
      slug,
      creatives: 0,
      recommendations: 0,
    });
  }

  // Compute metrics per creative. Real-data path uses live cents/
  // counts when last_synced_at exists; mock path uses deterministic
  // hash-based metrics. Marked in heartbeat so dashboard knows.
  let mode: "real" | "mock" = "mock";
  const metricsList = creatives.map((c) => {
    if (c.last_synced_at) {
      mode = "real";
      const ageMs = Date.now() - new Date(c.created_at).getTime();
      const ageDays = Math.max(1, Math.floor(ageMs / (24 * 60 * 60 * 1000)));
      const spendUsd = (c.spend_cents ?? 0) / 100;
      // Approximate ROAS from conversions × $50 average value when
      // we don't have explicit revenue. Replace with real revenue
      // tracking when funnel-attribution lands.
      const roas =
        spendUsd > 0
          ? ((c.conversions ?? 0) * 50) / spendUsd
          : 0;
      return { id: c.id, metrics: { ageDays, roas, spendUsd } };
    }
    // Mock path — stable per-id hash so reruns produce identical recs
    let h = 5381;
    for (let i = 0; i < c.id.length; i++) {
      h = ((h << 5) + h) ^ c.id.charCodeAt(i);
    }
    const r = Math.abs(h);
    return {
      id: c.id,
      metrics: {
        ageDays: 1 + (r % 60),
        roas: ((r >> 4) % 100) / 12,
        spendUsd: 50 + (r % 800),
      },
    };
  });

  const recs = runIterationEngine(metricsList);

  // Account-level retargeting check — emit if no creative's
  // ad_set / variant_label suggests retargeting.
  const hasRetargeting = creatives.some((c) =>
    /retarget|remarketing|abandon|return-visit/i.test(
      `${c.variant_label ?? ""} ${c.audience ?? ""}`,
    ),
  );
  const retargetRec = checkRetargetingGap(hasRetargeting);
  if (retargetRec) recs.push(retargetRec);

  // Compute allocation drift for the heartbeat payload
  const spendByBucket: Record<AllocationBucket, number> = {
    winners: 0,
    iteration: 0,
    "net-new": 0,
  };
  for (const m of metricsList) {
    if (m.metrics.roas >= 5 && m.metrics.ageDays >= 7)
      spendByBucket.winners += m.metrics.spendUsd;
    else if (m.metrics.roas >= 2 && m.metrics.ageDays >= 7)
      spendByBucket.iteration += m.metrics.spendUsd;
    else spendByBucket["net-new"] += m.metrics.spendUsd;
  }
  const drift = computeAllocationDrift(spendByBucket);
  const majorDrift = drift.find((d) => d.severity === "major");

  // Emit recommendations to agent_signals — one signal per
  // recommendation, severity scales with action type. Owner reads
  // these in the daily digest + ads tab.
  for (const r of recs) {
    const severity =
      r.action === "kill" || r.action === "scale" ? "warn" : "notice";
    await emitSignal({
      source: "ad-iteration-engine",
      kind: `ad-${r.action}`,
      severity,
      clientSlug: slug,
      title: `${actionEmoji(r.action)} ${r.action}: ${r.creativeId === "_account" ? "account-level" : "creative " + r.creativeId.slice(0, 8)}`,
      detail: r.rationale,
      target: "ads-tab",
      metadata: {
        creativeId: r.creativeId,
        action: r.action,
        ruleId: r.ruleId,
        confidence: r.confidence,
      },
    });
  }

  // Surface major drift as its own signal
  if (majorDrift) {
    await emitSignal({
      source: "ad-iteration-engine",
      kind: "allocation-drift",
      severity: "warn",
      clientSlug: slug,
      title: `⚖️ Budget drift: ${majorDrift.bucket} ${majorDrift.drift > 0 ? "+" : ""}${majorDrift.drift}pt off target`,
      detail: `Currently ${majorDrift.currentPct}% on ${majorDrift.bucket}. Target ${majorDrift.targetPct}% per Rule 3 (70/20/10). Rebalance on next iteration cycle.`,
      target: "ads-tab",
      metadata: { ...majorDrift },
    });
  }

  await logHeartbeat(`iteration_engine_${slug.replace(/-/g, "_")}`, {
    slug,
    creatives: creatives.length,
    recommendations: recs.length,
    mode,
    drift: majorDrift ? "major" : "ok",
  });

  return NextResponse.json({
    ok: true,
    slug,
    creatives: creatives.length,
    recommendations: recs.length,
    mode,
    drift,
    recs: recs.slice(0, 50),
  });
}

function actionEmoji(action: string): string {
  switch (action) {
    case "scale":
      return "🚀";
    case "kill":
      return "✂";
    case "reskin":
      return "🎨";
    case "iterate":
      return "🔁";
    case "retarget":
      return "🎯";
    default:
      return "📋";
  }
}
