import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/automation-digest
 *
 * Powers the AutomationDailyDigest card on /dashboard overview.
 * Rolls up cron_heartbeats + agent_signals from the last 24 hours so
 * Ben's overview shows what the system actually did today (not just
 * what he hopes is running).
 *
 * Owner-only — gated by middleware on /api/* routes via the bluejays
 * admin cookie. No client-portal owners hit this.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Optional per-tenant filter. When set, restricts cron heartbeats
  // to slug-suffixed names (e.g. partner_scout_olympic_inspections)
  // and agent_signals to rows tagged with that client_slug. Used by
  // the per-client portal Overview tab so owners see their own AI's
  // activity, not Ben's whole BlueJays system.
  const slugRaw =
    request.nextUrl.searchParams.get("clientSlug")?.trim() || "";
  const slug = slugRaw.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const slugUnderscored = slug.replace(/-/g, "_");

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      crons: [],
      signals: [],
      fetchedAt: new Date().toISOString(),
    });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Pull every heartbeat in the last 24h, then group by cron_name in
  // memory (cheaper than a SQL window function for ~50 rows). When
  // filtering by slug, match crons whose name contains the slug or
  // whose metadata.client_slug matches.
  let heartbeatQuery = supabase
    .from("cron_heartbeats")
    .select("cron_name, ran_at, status, metadata")
    .gte("ran_at", since)
    .order("ran_at", { ascending: false })
    .limit(500);
  if (slug) {
    // partner_scout_olympic_inspections, client_reports_olympic_inspections, etc.
    heartbeatQuery = heartbeatQuery.ilike("cron_name", `%${slugUnderscored}%`);
  }
  const { data: rawHeartbeats } = await heartbeatQuery;

  const cronMap = new Map<
    string,
    {
      cron_name: string;
      last_run: string;
      count_24h: number;
      status: string;
      metadata: Record<string, unknown> | null;
    }
  >();
  for (const h of rawHeartbeats ?? []) {
    const existing = cronMap.get(h.cron_name);
    if (!existing) {
      cronMap.set(h.cron_name, {
        cron_name: h.cron_name,
        last_run: h.ran_at,
        count_24h: 1,
        status: h.status ?? "completed",
        metadata: h.metadata ?? null,
      });
    } else {
      existing.count_24h += 1;
      // last_run already correct since we ordered desc
    }
  }
  // Also surface crons that haven't run in 24h but have run in the last
  // 7 days — so Ben sees the "stalled >48h" red row instead of the cron
  // disappearing entirely. Pull last-known per cron from the broader
  // window.
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  let olderQuery = supabase
    .from("cron_heartbeats")
    .select("cron_name, ran_at, status")
    .gte("ran_at", since7)
    .order("ran_at", { ascending: false })
    .limit(2000);
  if (slug) olderQuery = olderQuery.ilike("cron_name", `%${slugUnderscored}%`);
  const { data: olderHeartbeats } = await olderQuery;
  for (const h of olderHeartbeats ?? []) {
    if (!cronMap.has(h.cron_name)) {
      cronMap.set(h.cron_name, {
        cron_name: h.cron_name,
        last_run: h.ran_at,
        count_24h: 0,
        status: h.status ?? "completed",
        metadata: null,
      });
    }
  }

  const crons = Array.from(cronMap.values()).sort(
    (a, b) => Date.parse(b.last_run) - Date.parse(a.last_run),
  );

  // Roll up agent_signals by (source, kind, severity). A bot that
  // emits 12 signals in a day collapses to one row with count=12.
  // Filter by client_slug when slug is set (per-tenant portal view).
  let signalsQuery = supabase
    .from("agent_signals")
    .select("source, kind, severity")
    .gte("created_at", since)
    .limit(1000);
  if (slug) signalsQuery = signalsQuery.eq("client_slug", slug);
  const { data: rawSignals } = await signalsQuery;

  const signalMap = new Map<
    string,
    {
      source: string;
      kind: string;
      severity: string;
      total_24h: number;
    }
  >();
  for (const s of rawSignals ?? []) {
    const key = `${s.source}::${s.kind}::${s.severity}`;
    const existing = signalMap.get(key);
    if (existing) {
      existing.total_24h += 1;
    } else {
      signalMap.set(key, {
        source: s.source,
        kind: s.kind,
        severity: s.severity,
        total_24h: 1,
      });
    }
  }
  const signals = Array.from(signalMap.values()).sort(
    (a, b) => b.total_24h - a.total_24h,
  );

  return NextResponse.json({
    ok: true,
    crons,
    signals,
    fetchedAt: new Date().toISOString(),
  });
}
