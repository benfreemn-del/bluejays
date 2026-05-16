import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/dashboard/closer-breakdown
 *
 * H6 (Hormozi "No Data Daddy" fix) Tier 1 — Pipeline 1 closer split.
 *
 * Returns paid-this-30d / cash-this-30d / active-pipeline counts
 * bucketed by closer_name (Ben / Madie / Unassigned) PLUS a global
 * average time-to-onboarding (TTO) — days from paid_at to site live.
 *
 * Without this endpoint the Day-19 FB ad spend lands with no visible
 * "which closer is moving faster" signal — closer-split is the
 * single H6 metric `project_bluejays_six_horsemen_applications.md`
 * flagged as schema-blocked. The closer_name column was added by
 * migration `20260516_prospects_closer_tracking.sql`.
 *
 * Cheap query: full prospects table is ~hundreds of rows; bucketing
 * in memory is fine.
 *
 * Auth: covered by /api middleware (admin-password cookie).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Prospect = {
  closer_name: string | null;
  status: string | null;
  paid_at: string | null;
  pricing_tier: string | null;
};

type CloserStat = {
  name: string;
  closedLifetime: number;
  paidLast30d: number;
  activePipeline: number;
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      closers: [],
      avgTtoDays: null,
      configured: false,
    });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  // Pull prospects with closer attribution OR an active funnel position
  // (so Unassigned rows still show up in the pipeline column).
  // revenue_cents removed 2026-05-16 — Stripe is the source of truth for
  // cash. The Lifetime + 30d-paid counts answer the operator question
  // "who's moving the pipeline" without needing a cash join.
  const { data: prospects, error: pErr } = await supabase
    .from("prospects")
    .select("closer_name, status, paid_at, pricing_tier")
    .order("paid_at", { ascending: false, nullsFirst: false })
    .limit(2000);

  if (pErr) {
    return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 });
  }

  // Bucket statuses considered "active pipeline" — paid_at is null AND
  // status indicates the prospect is still in motion (not lost / dead).
  // The exact status enum varies historically; this list is a safe
  // superset that excludes obvious-terminal states.
  const TERMINAL = new Set([
    "lost",
    "dead",
    "archived",
    "unqualified",
    "rejected",
    "paid", // safety — paid prospects shouldn't have null paid_at, but defensive
  ]);

  const closerMap = new Map<string, CloserStat>();
  function ensure(name: string): CloserStat {
    let s = closerMap.get(name);
    if (!s) {
      s = { name, closedLifetime: 0, paidLast30d: 0, activePipeline: 0 };
      closerMap.set(name, s);
    }
    return s;
  }

  // A prospect counts as "closed lifetime" when EITHER paid_at is set
  // (standard Stripe-driven close) OR closer_name + pricing_tier are
  // BOTH set (legacy manual close — see Meyer/Hector/Mountain View/
  // Olympic backfill 2026-05-16). closer_name alone isn't enough
  // (could be a forward assignment); pricing_tier alone isn't enough
  // (scout intake sets it on 1700+ leads). The intersection is the
  // operator-authored "this is a real close" signal.
  for (const p of (prospects || []) as Prospect[]) {
    const closer = (p.closer_name && p.closer_name.trim()) || "Unassigned";
    const stat = ensure(closer);

    const tier = p.pricing_tier && p.pricing_tier.trim();
    const isLegacyClose = !p.paid_at && Boolean(p.closer_name) && Boolean(tier);
    const isClosed = Boolean(p.paid_at) || isLegacyClose;

    if (isClosed) {
      stat.closedLifetime += 1;
    }

    if (p.paid_at && p.paid_at >= thirtyDaysAgo) {
      stat.paidLast30d += 1;
    }

    // Active pipeline = prospects with no close signal yet AND a
    // non-terminal status. Closer must be assigned (not "Unassigned")
    // for the pipeline column to be meaningful — random scouted leads
    // without closer attribution don't count as active pipeline.
    if (!isClosed && closer !== "Unassigned") {
      const status = (p.status || "").toLowerCase();
      if (status && !TERMINAL.has(status)) {
        stat.activePipeline += 1;
      }
    }
  }

  // Stable closer order — known closers first, Unassigned last.
  const known = ["Ben", "Madie"];
  const closers: CloserStat[] = [];
  for (const name of known) {
    closers.push(closerMap.get(name) || {
      name,
      closedLifetime: 0,
      paidLast30d: 0,
      activePipeline: 0,
    });
    closerMap.delete(name);
  }
  for (const remaining of closerMap.values()) {
    if (remaining.name === "Unassigned") continue;
    closers.push(remaining);
  }
  const unassigned = closerMap.get("Unassigned");
  if (unassigned && (unassigned.closedLifetime || unassigned.paidLast30d || unassigned.activePipeline)) {
    closers.push(unassigned);
  }

  // TTO global average — paid prospects in the last 90 days where we can
  // pair paid_at with the first client_leads row for the same slug
  // (proxy for "site is live + actually attracting leads"). If the
  // client_leads schema isn't available, return null gracefully.
  let avgTtoDays: number | null = null;
  try {
    const { data: paid, error: paidErr } = await supabase
      .from("prospects")
      .select("id, slug, paid_at")
      .gte("paid_at", ninetyDaysAgo)
      .not("paid_at", "is", null)
      .limit(500);

    if (!paidErr && paid && paid.length > 0) {
      const slugs = paid
        .map((p) => (p as { slug?: string }).slug)
        .filter((s): s is string => typeof s === "string" && s.length > 0);

      if (slugs.length > 0) {
        const { data: leads } = await supabase
          .from("client_leads")
          .select("client_slug, created_at")
          .in("client_slug", slugs)
          .order("created_at", { ascending: true })
          .limit(2000);

        // First lead per slug
        const firstLeadBySlug = new Map<string, string>();
        for (const l of (leads || []) as Array<{ client_slug: string; created_at: string }>) {
          if (!firstLeadBySlug.has(l.client_slug)) {
            firstLeadBySlug.set(l.client_slug, l.created_at);
          }
        }

        // Compute diffs in days
        const diffs: number[] = [];
        for (const p of paid as Array<{ slug?: string; paid_at: string }>) {
          if (!p.slug) continue;
          const firstLead = firstLeadBySlug.get(p.slug);
          if (!firstLead) continue;
          const diffMs = new Date(firstLead).getTime() - new Date(p.paid_at).getTime();
          if (diffMs < 0) continue; // skip leads created before paid_at (legacy data)
          diffs.push(diffMs / (24 * 60 * 60 * 1000));
        }

        if (diffs.length > 0) {
          const sum = diffs.reduce((a, b) => a + b, 0);
          avgTtoDays = Math.round((sum / diffs.length) * 10) / 10;
        }
      }
    }
  } catch {
    // TTO is best-effort; never let it block the closer breakdown.
    avgTtoDays = null;
  }

  return NextResponse.json({
    ok: true,
    closers,
    avgTtoDays,
    configured: true,
  });
}
