import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/dashboard/backend-audit
 *
 * One-shot status of every backend integration. Each subsystem returns
 * { state: "green"|"yellow"|"red", detail }. The page renders green/
 * yellow/red pills + headline metrics. No drill-downs here — those
 * live in the dedicated dashboard pages.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubsystemStatus {
  key: string;
  label: string;
  state: "green" | "yellow" | "red";
  detail: string;
  drilldown_href?: string;
}

export async function GET() {
  const sb = getSupabase();
  const subsystems: SubsystemStatus[] = [];

  // ─── 1. daily_metrics rollup ───
  const { data: metricRow } = await sb
    .from("daily_metrics")
    .select("metric_date, prospects_total, pipeline_active, audits_completed, costs_24h_usd, diagnostics_run, computed_at")
    .order("metric_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (metricRow) {
    const ageH =
      (Date.now() - new Date((metricRow as { computed_at: string }).computed_at).getTime()) /
      3_600_000;
    subsystems.push({
      key: "data_cycle",
      label: "Daily metrics rollup",
      state: ageH < 30 ? "green" : ageH < 48 ? "yellow" : "red",
      detail: `${(metricRow as { prospects_total: number }).prospects_total} prospects · ${(metricRow as { pipeline_active: number }).pipeline_active} active · ${(metricRow as { audits_completed: number }).audits_completed} audits · last run ${ageH.toFixed(1)}h ago`,
      drilldown_href: "/dashboard",
    });
  } else {
    subsystems.push({
      key: "data_cycle",
      label: "Daily metrics rollup",
      state: "red",
      detail: "No daily_metrics rows yet — cron hasn't run",
    });
  }

  // ─── 2. Hormozi diagnostic ───
  const { count: kbChunks } = await sb
    .from("hormozi_kb_chunks")
    .select("*", { count: "exact", head: true });
  const { count: diagnoses } = await sb
    .from("hormozi_diagnostics")
    .select("*", { count: "exact", head: true });
  subsystems.push({
    key: "hormozi_diagnostic",
    label: "Hormozi diagnostic agent",
    state: (kbChunks ?? 0) >= 5 ? "green" : "yellow",
    detail: `${kbChunks ?? 0} KB chunks · ${diagnoses ?? 0} diagnoses run`,
    drilldown_href: "/dashboard/diagnostic",
  });

  // ─── 3. Ad-account OAuth ───
  const { data: adAccounts } = await sb
    .from("client_ad_accounts")
    .select("platform, status, last_error, consecutive_failures, client_slug");
  const accounts = (adAccounts ?? []) as Array<{
    platform: string;
    status: string;
    consecutive_failures: number;
    last_error: string | null;
    client_slug: string;
  }>;
  const failing = accounts.filter((a) => a.status === "failed" || a.consecutive_failures >= 3).length;
  const total = accounts.length;
  subsystems.push({
    key: "ad_accounts",
    label: "Ad-account OAuth (Meta / Google / Lob)",
    state: total === 0 ? "yellow" : failing > 0 ? "red" : "green",
    detail:
      total === 0
        ? "No tenants have connected an ad account yet"
        : `${total} accounts across tenants · ${failing} failing`,
  });

  // ─── 4. Onboarding wizard ───
  const { count: onboardingTotal } = await sb
    .from("client_onboarding")
    .select("*", { count: "exact", head: true });
  const { count: onboardingLaunched } = await sb
    .from("client_onboarding")
    .select("*", { count: "exact", head: true })
    .eq("status", "launched");
  subsystems.push({
    key: "onboarding",
    label: "Client onboarding wizard",
    state: (onboardingTotal ?? 0) > 0 ? "green" : "yellow",
    detail: `${onboardingTotal ?? 0} clients started · ${onboardingLaunched ?? 0} launched`,
    drilldown_href: "/dashboard/onboarding",
  });

  // ─── 5. Daily blog cron ───
  const { count: blogTotal } = await sb
    .from("blog_posts")
    .select("*", { count: "exact", head: true });
  const { count: blogPublished } = await sb
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  subsystems.push({
    key: "blog",
    label: "SEO blog cron",
    state: (blogTotal ?? 0) > 0 ? "green" : "yellow",
    detail: `${blogTotal ?? 0} drafts · ${blogPublished ?? 0} published`,
    drilldown_href: "/dashboard/blog",
  });

  // ─── 6. Hormozi YT scanner ───
  const { count: ytScans } = await sb
    .from("hormozi_yt_scans")
    .select("*", { count: "exact", head: true });
  subsystems.push({
    key: "yt_scanner",
    label: "Hormozi YouTube scanner",
    state: process.env.YOUTUBE_API_KEY ? "green" : "yellow",
    detail: process.env.YOUTUBE_API_KEY
      ? `${ytScans ?? 0} videos logged`
      : "YOUTUBE_API_KEY not set — scanner skips on each cron tick",
  });

  // ─── 7. Stripe ───
  subsystems.push({
    key: "stripe",
    label: "Stripe (card capture + checkout)",
    state: process.env.STRIPE_SECRET_KEY ? "green" : "yellow",
    detail: process.env.STRIPE_SECRET_KEY
      ? "API key configured"
      : "STRIPE_SECRET_KEY not set — mock mode (wizard works but no real cards captured)",
  });

  // ─── 8. Anthropic / Claude ───
  subsystems.push({
    key: "claude",
    label: "Anthropic Claude API",
    state: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY ? "green" : "red",
    detail:
      process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
        ? "API key configured — diagnostic + blog cron live"
        : "ANTHROPIC_API_KEY not set — diagnostic + blog cron will return placeholders",
  });

  return NextResponse.json({ ok: true, subsystems });
}
