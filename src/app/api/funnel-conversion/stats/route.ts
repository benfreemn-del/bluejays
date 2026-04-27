import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/funnel-conversion/stats
 *
 * The single most important number for ad-spend ROI math: of every
 * prospect who submitted an audit, what fraction became paid customers?
 * Currently buried in raw data — this endpoint surfaces it directly.
 *
 * Returns conversion stats over rolling windows + per-fork CTA breakdown
 * so we can see whether buy / schedule / preview is the dominant
 * intent path that actually closes.
 *
 * Operator-only — protected via /api/funnel-conversion/ NOT being in
 * PUBLIC_API_PATHS, falls into the default-protected bucket.
 */

const WINDOWS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "all", days: null },
] as const;

interface WindowStats {
  label: string;
  audits_submitted: number;
  prospects_with_audit: number;
  paid_conversions: number;
  conversion_rate_pct: number;
  avg_days_to_paid: number | null;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ windows: [], byFork: [], mock: true });
  }

  const windows: WindowStats[] = [];

  for (const w of WINDOWS) {
    const cutoff = w.days ? new Date(Date.now() - w.days * 24 * 60 * 60 * 1000).toISOString() : null;

    // Audits submitted in window
    let auditQuery = supabase.from("site_audits").select("id, prospect_id, created_at", {
      count: "exact",
    });
    if (cutoff) auditQuery = auditQuery.gte("created_at", cutoff);
    const { data: audits, count: auditsSubmitted } = await auditQuery;

    const prospectIds = Array.from(new Set((audits || []).map((a) => a.prospect_id as string)));

    // Of those prospects, how many ended up paid?
    let paidConversions = 0;
    let avgDaysToPaid: number | null = null;
    if (prospectIds.length > 0) {
      const { data: paid } = await supabase
        .from("prospects")
        .select("id, paid_at")
        .in("id", prospectIds)
        .eq("status", "paid");

      paidConversions = paid?.length ?? 0;

      // Compute time-to-paid by joining audits → prospects on prospect_id
      if (paid && paid.length > 0 && audits) {
        const prospectAuditMap = new Map<string, string>();
        for (const a of audits) {
          // Keep the earliest audit per prospect for time-to-paid math
          const existing = prospectAuditMap.get(a.prospect_id as string);
          if (!existing || (a.created_at as string) < existing) {
            prospectAuditMap.set(a.prospect_id as string, a.created_at as string);
          }
        }
        const days: number[] = [];
        for (const p of paid) {
          if (!p.paid_at) continue;
          const auditDate = prospectAuditMap.get(p.id as string);
          if (!auditDate) continue;
          const diff =
            (new Date(p.paid_at as string).getTime() - new Date(auditDate).getTime()) /
            (1000 * 60 * 60 * 24);
          if (diff >= 0) days.push(diff);
        }
        if (days.length > 0) {
          avgDaysToPaid = Math.round((days.reduce((a, b) => a + b, 0) / days.length) * 10) / 10;
        }
      }
    }

    const conversionRate =
      prospectIds.length > 0
        ? Math.round((paidConversions / prospectIds.length) * 1000) / 10
        : 0;

    windows.push({
      label: w.label,
      audits_submitted: auditsSubmitted ?? 0,
      prospects_with_audit: prospectIds.length,
      paid_conversions: paidConversions,
      conversion_rate_pct: conversionRate,
      avg_days_to_paid: avgDaysToPaid,
    });
  }

  // Per-fork CTA breakdown over last 30d
  const cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: clicks } = await supabase
    .from("cta_clicks")
    .select("fork, prospect_id")
    .gte("clicked_at", cutoff30);

  const byForkRaw = new Map<string, Set<string>>(); // fork → unique prospects
  for (const c of clicks || []) {
    const fork = c.fork as string;
    const set = byForkRaw.get(fork) ?? new Set();
    set.add(c.prospect_id as string);
    byForkRaw.set(fork, set);
  }

  const byFork: Array<{ fork: string; clicks: number; unique_prospects: number; paid_conversions: number; conversion_rate_pct: number }> = [];

  for (const fork of ["buy", "schedule", "preview"]) {
    const prospectsForFork = byForkRaw.get(fork) ?? new Set();
    const totalClicks = (clicks || []).filter((c) => c.fork === fork).length;
    let paidForFork = 0;
    if (prospectsForFork.size > 0) {
      const { data } = await supabase
        .from("prospects")
        .select("id")
        .in("id", Array.from(prospectsForFork))
        .eq("status", "paid");
      paidForFork = data?.length ?? 0;
    }
    const cr =
      prospectsForFork.size > 0
        ? Math.round((paidForFork / prospectsForFork.size) * 1000) / 10
        : 0;
    byFork.push({
      fork,
      clicks: totalClicks,
      unique_prospects: prospectsForFork.size,
      paid_conversions: paidForFork,
      conversion_rate_pct: cr,
    });
  }

  return NextResponse.json({
    windows,
    byFork,
    generatedAt: new Date().toISOString(),
  });
}
