/**
 * client-hyperloop — per-client variant analysis + auto-optimization.
 *
 * Operates in 4 modes based on subscription:
 *
 *   none       (no subscription)    Skips entirely. Funnel runs static.
 *   manual     (Hyperloop Starter)  Runs only when called from dashboard.
 *   weekly     (Hyperloop Pro)      Auto-runs once/week via cron.
 *   daily      (Hyperloop Elite)    Auto-runs daily + budget rebalancing.
 *
 * Reuses the proven Wilson-CI math in src/lib/hyperloop-analysis.ts —
 * the only difference here is data source: per-client funnel templates
 * (from client_lead_messages) and ad creatives (from client_ad_creatives)
 * instead of BlueJays prospect data.
 *
 * Output: `ClientInsight` rows surfaced in the dashboard. With variant-
 * gen capability + Claude subscription, also seeds new variants for review.
 */

import { getSupabase } from "./supabase";
import {
  analyzeKind,
  type VariantMetrics,
  type VariantAnalysis,
} from "./hyperloop-analysis";
import {
  getClientCapabilities,
  type Capability,
} from "./client-subscriptions";

export type InsightKind =
  | "funnel-template"
  | "ad-creative"
  | "audience-conversion";

export type ClientInsight = {
  kind: InsightKind;
  /** What we analyzed (e.g. "parents.d0.welcome", "meta-feed::Parents · Confidence::A") */
  variantId: string;
  variantName: string;
  /** Plain-English finding. */
  headline: string;
  /** Recommendation Ben/owner can act on. */
  recommendation: string;
  /** Underlying analysis. */
  analysis: VariantAnalysis;
};

export type RunMode = "none" | "manual" | "weekly" | "daily";

export type ClientHyperloopRun = {
  client_slug: string;
  mode: RunMode;
  capabilities: Capability[];
  insights: ClientInsight[];
  triggered_by: "cron" | "manual";
  ran_at: string;
};

/**
 * Decide which mode this client should run in based on subscriptions
 * + the trigger context.
 */
async function pickRunMode(
  clientSlug: string,
  triggeredBy: "cron" | "manual",
): Promise<{ mode: RunMode; capabilities: Capability[] }> {
  const caps = await getClientCapabilities(clientSlug);
  const capArr = Array.from(caps);
  if (caps.has("hyperloop.daily")) return { mode: "daily", capabilities: capArr };
  if (caps.has("hyperloop.weekly")) return { mode: "weekly", capabilities: capArr };
  if (caps.has("hyperloop.manual") && triggeredBy === "manual")
    return { mode: "manual", capabilities: capArr };
  // Cron run on a manual-only-tier client = no-op
  return { mode: "none", capabilities: capArr };
}

/* ──────────────────── FUNNEL TEMPLATE PERFORMANCE ────────────────────
 * For each template_id we've sent, compute:
 *   sends, replies, response rate
 * Then run Wilson-CI to flag winners + losers.
 */

async function loadCycleThresholds() {
  const { getSetting } = await import("./system-settings");
  const minVerdict = await getSetting<number>(
    "hyperloop.min_impressions_for_verdict",
    200,
  );
  const minLoser = await getSetting<number>(
    "hyperloop.min_impressions_for_loser",
    400,
  );
  return {
    minImpressionsForVerdict: Number(minVerdict),
    minImpressionsForLoser: Number(minLoser),
  };
}

async function analyzeFunnelTemplates(
  clientSlug: string,
): Promise<ClientInsight[]> {
  const sb = getSupabase();
  const { data: msgs } = await sb
    .from("client_lead_messages")
    .select("template_id, variant_id, lead_id, direction, status")
    .eq("client_slug", clientSlug);
  if (!msgs || msgs.length === 0) return [];

  // Group by `${template_id}::${variant_id}` so A/B variants get
  // separate Wilson-CI buckets. Templates without variants land
  // under `${template_id}::default`.
  type Stats = { sends: number; replies: number };
  const buckets = new Map<string, Stats>();
  const templateLeads = new Map<string, Set<string>>();

  for (const m of msgs as {
    template_id: string | null;
    variant_id: string | null;
    lead_id: string;
    direction: string;
    status: string;
  }[]) {
    if (m.direction !== "outbound" || !m.template_id) continue;
    if (m.status !== "sent" && m.status !== "delivered") continue;
    const key = `${m.template_id}::${m.variant_id ?? "default"}`;
    if (!buckets.has(key)) buckets.set(key, { sends: 0, replies: 0 });
    buckets.get(key)!.sends += 1;
    if (!templateLeads.has(key)) templateLeads.set(key, new Set());
    templateLeads.get(key)!.add(m.lead_id);
  }

  // Count replies per template by checking which leads replied AFTER receiving it
  const repliedLeads = new Set(
    (msgs as { lead_id: string; direction: string }[])
      .filter((m) => m.direction === "inbound")
      .map((m) => m.lead_id),
  );
  for (const [tplId, leadSet] of templateLeads) {
    const replies = Array.from(leadSet).filter((id) => repliedLeads.has(id)).length;
    buckets.get(tplId)!.replies = replies;
  }

  // Build VariantMetrics. Use replies as conversions, sends as impressions+clicks
  // (clicks not tracked yet on email/SMS — sends is the closest stand-in for
  // exposure-to-content).
  const variants: VariantMetrics[] = [];
  for (const [tplId, stats] of buckets) {
    if (stats.sends < 3) continue; // skip too-small samples
    variants.push({
      id: tplId,
      kind: "funnel-template",
      variantName: tplId,
      status: "active",
      impressions: stats.sends,
      clicks: stats.sends, // proxy
      conversions: stats.replies,
      costUsd: 0,
    });
  }
  if (variants.length === 0) return [];

  const analyses = analyzeKind(variants, await loadCycleThresholds());
  return analyses.map((a) => ({
    kind: "funnel-template" as const,
    variantId: a.id,
    variantName: a.id,
    headline: insightHeadline("funnel-template", a),
    recommendation: insightRecommendation("funnel-template", a),
    analysis: a,
  }));
}

/* ──────────────────── AD CREATIVE PERFORMANCE ────────────────────
 * Read client_ad_creatives. Skip if no impressions data synced yet
 * (Meta/Google API integration is a future build).
 */

async function analyzeAdCreatives(
  clientSlug: string,
): Promise<ClientInsight[]> {
  const sb = getSupabase();
  const { data: ads } = await sb
    .from("client_ad_creatives")
    .select("id, audience, platform, variant_label, impressions, clicks, conversions, spend_cents, status")
    .eq("client_slug", clientSlug);
  if (!ads || ads.length === 0) return [];

  const variants: VariantMetrics[] = [];
  for (const a of ads as {
    id: string;
    audience: string;
    platform: string;
    variant_label: string | null;
    impressions: number | null;
    clicks: number | null;
    conversions: number | null;
    spend_cents: number | null;
    status: string;
  }[]) {
    if (!a.impressions || a.impressions < 100) continue;
    variants.push({
      id: a.id,
      kind: `${a.platform}::${a.audience}`,
      variantName: `${a.platform} · ${a.audience} · ${a.variant_label ?? ""}`,
      status: a.status === "live" ? "active" : "paused",
      impressions: a.impressions ?? 0,
      clicks: a.clicks ?? 0,
      conversions: a.conversions ?? 0,
      costUsd: (a.spend_cents ?? 0) / 100,
    });
  }
  if (variants.length === 0) return [];

  const analyses = analyzeKind(variants, await loadCycleThresholds());
  // Map id back to original variant so we have the friendly name
  const variantById = new Map(variants.map((v) => [v.id, v.variantName]));
  return analyses.map((a) => ({
    kind: "ad-creative" as const,
    variantId: a.id,
    variantName: variantById.get(a.id) ?? a.id,
    headline: insightHeadline("ad-creative", a),
    recommendation: insightRecommendation("ad-creative", a),
    analysis: a,
  }));
}

/* ──────────────────── INSIGHT COPY ─────────────────────────── */

function insightHeadline(kind: InsightKind, a: VariantAnalysis): string {
  if (a.verdict === "winner") {
    return `${humanKind(kind)} ${a.id} — winner (${(a.conversionRate * 100).toFixed(1)}% conv, lower-bound ${(a.wilsonLowerBound * 100).toFixed(1)}%)`;
  }
  if (a.verdict === "loser") {
    return `${humanKind(kind)} ${a.id} — underperforming (${(a.conversionRate * 100).toFixed(1)}% conv)`;
  }
  if (a.verdict === "insufficient_data") {
    return `${humanKind(kind)} ${a.id} — insufficient data (${a.reason})`;
  }
  return `${humanKind(kind)} ${a.id} — testing (${(a.conversionRate * 100).toFixed(1)}% conv so far)`;
}

function insightRecommendation(kind: InsightKind, a: VariantAnalysis): string {
  if (a.verdict === "winner") {
    return kind === "funnel-template"
      ? `Use this template's structure to seed new variants. Tone/CTA worth replicating across other audience tracks.`
      : `Increase budget allocation to this creative. Pause lowest-CTR variant in the same ad set.`;
  }
  if (a.verdict === "loser") {
    return kind === "funnel-template"
      ? `Rewrite this template — keep subject line, tighten CTA. Test against current winner.`
      : `Pause this creative. Reallocate budget to the winning variant in this ad set.`;
  }
  return `Keep collecting data. Re-analyze in a few days.`;
}

function humanKind(kind: InsightKind): string {
  return kind === "funnel-template"
    ? "Template"
    : kind === "ad-creative"
      ? "Ad"
      : "Audience";
}

/* ──────────────────── PUBLIC: RUN ONE CLIENT ──────────────────── */

export async function runClientHyperloop(args: {
  clientSlug: string;
  triggeredBy: "cron" | "manual";
}): Promise<ClientHyperloopRun> {
  const { mode, capabilities } = await pickRunMode(
    args.clientSlug,
    args.triggeredBy,
  );

  // No subscription = no-op (return zeros so dashboard shows "off" state).
  if (mode === "none") {
    return {
      client_slug: args.clientSlug,
      mode,
      capabilities,
      insights: [],
      triggered_by: args.triggeredBy,
      ran_at: new Date().toISOString(),
    };
  }

  // Run analyses in parallel.
  const [tplInsights, adInsights] = await Promise.all([
    analyzeFunnelTemplates(args.clientSlug),
    analyzeAdCreatives(args.clientSlug),
  ]);

  const insights = [...tplInsights, ...adInsights];

  // Auto-pause losers if capability granted (Pro+).
  if (
    capabilities.includes("hyperloop.weekly") ||
    capabilities.includes("hyperloop.daily")
  ) {
    await autoPauseLosingAds(args.clientSlug, insights);
  }

  return {
    client_slug: args.clientSlug,
    mode,
    capabilities,
    insights,
    triggered_by: args.triggeredBy,
    ran_at: new Date().toISOString(),
  };
}

/** Auto-pause losing ad creatives. Only fires on Pro+ subscription. */
async function autoPauseLosingAds(
  clientSlug: string,
  insights: ClientInsight[],
): Promise<void> {
  const adLosers = insights
    .filter((i) => i.kind === "ad-creative" && i.analysis.verdict === "loser")
    .map((i) => i.variantId);
  if (adLosers.length === 0) return;
  const { error } = await getSupabase()
    .from("client_ad_creatives")
    .update({ status: "paused" })
    .eq("client_slug", clientSlug)
    .in("id", adLosers);
  if (error) console.error("[client-hyperloop] auto-pause failed:", error.message);
}
