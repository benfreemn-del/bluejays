import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MANUFACTURER_CATEGORIES } from "@/lib/bluejays-funnels";

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

  // ── 2-MIN CALLBACK SLA (Madie's hot-lead response time) ─────────
  // Per 116-Funnels chunk 13c — every audit form submission with a
  // phone should be called within 2 minutes. This metric surfaces
  // operator discipline on the dashboard.
  //
  // Bug fix 2026-05-16: the SLA window is anchored to each AUDIT
  // submission's created_at, NOT the prospect's created_at. For
  // returning prospects (where the audit form maps to an existing
  // prospect by email), `prospects.created_at` is the original
  // creation date — could be weeks/months ago — making the SLA look
  // like a wild miss when it's actually a fresh submission. The
  // correct anchor is the audit row's created_at — that's the
  // moment the prospect re-engaged and Madie's 2-min clock started.
  //
  // last_contacted_at is shared at the prospect level (only the most
  // recent manual call is stamped). For multi-audit prospects, we
  // attribute the contact to the LATEST audit ≤ contact time —
  // imperfect (loses history for serial re-submitters) but accurate
  // for the common case.
  const callbackSla: Array<{
    label: string;
    audits_with_phone: number;
    called_within_2min: number;
    called_within_15min: number;
    called_at_all: number;
    sla_2min_pct: number;
    sla_15min_pct: number;
    overall_reach_pct: number;
  }> = [];

  for (const w of WINDOWS) {
    const cutoff = w.days
      ? new Date(Date.now() - w.days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Pull audit submissions in the window. site_audits is the SLA
    // event surface — one row = one 2-min clock.
    let auditQ = supabase
      .from("site_audits")
      .select("id, prospect_id, created_at");
    if (cutoff) auditQ = auditQ.gte("created_at", cutoff);
    const { data: auditRows } = await auditQ;

    const auditList = (auditRows || []) as Array<{
      id: string;
      prospect_id: string;
      created_at: string;
    }>;
    if (auditList.length === 0) {
      callbackSla.push({
        label: w.label,
        audits_with_phone: 0,
        called_within_2min: 0,
        called_within_15min: 0,
        called_at_all: 0,
        sla_2min_pct: 0,
        sla_15min_pct: 0,
        overall_reach_pct: 0,
      });
      continue;
    }

    // Pull the matching prospects' phone + last_contacted_at in one
    // query, then build a lookup map.
    const prospectIds = Array.from(
      new Set(auditList.map((a) => a.prospect_id).filter(Boolean)),
    );
    const { data: prospectRows } = await supabase
      .from("prospects")
      .select("id, phone, last_contacted_at")
      .in("id", prospectIds);

    type ProspectInfo = { phone: string | null; lastContactedAt: string | null };
    const prospectMap = new Map<string, ProspectInfo>();
    for (const p of (prospectRows || []) as Array<{
      id: string;
      phone: string | null;
      last_contacted_at: string | null;
    }>) {
      prospectMap.set(p.id, {
        phone: p.phone,
        lastContactedAt: p.last_contacted_at,
      });
    }

    // SLA computation per audit: only count audits where the prospect
    // had a phone (denominator). Then check if last_contacted_at falls
    // within 2 / 15 min AFTER audit.created_at.
    let auditWithPhone = 0;
    let within2 = 0;
    let within15 = 0;
    let calledAtAll = 0;

    for (const a of auditList) {
      const info = prospectMap.get(a.prospect_id);
      if (!info || !info.phone || info.phone.trim() === "") continue;
      auditWithPhone += 1;
      if (!info.lastContactedAt) continue;
      const auditAt = new Date(a.created_at).getTime();
      const contactedAt = new Date(info.lastContactedAt).getTime();
      // Only count contacts that happened AT OR AFTER this audit
      // (contacts BEFORE the audit are stale — they don't satisfy
      // this audit's 2-min SLA).
      if (contactedAt < auditAt) continue;
      calledAtAll += 1;
      const deltaMin = (contactedAt - auditAt) / 60000;
      if (deltaMin <= 2) within2 += 1;
      if (deltaMin <= 15) within15 += 1;
    }

    callbackSla.push({
      label: w.label,
      audits_with_phone: auditWithPhone,
      called_within_2min: within2,
      called_within_15min: within15,
      called_at_all: calledAtAll,
      sla_2min_pct:
        auditWithPhone > 0
          ? Math.round((within2 / auditWithPhone) * 1000) / 10
          : 0,
      sla_15min_pct:
        auditWithPhone > 0
          ? Math.round((within15 / auditWithPhone) * 1000) / 10
          : 0,
      overall_reach_pct:
        auditWithPhone > 0
          ? Math.round((calledAtAll / auditWithPhone) * 1000) / 10
          : 0,
    });
  }

  // ── PER-FUNNEL-SEGMENT COUNTS (real Supabase data) ──────────────
  // Wires the `funnelSegment` tag (set on audit submissions 2026-05-16+)
  // and category-based attribution heuristics into the dashboard's 3
  // funnel cards on /dashboard?tab=funnels. Replaces the hardcoded
  // `defaultCounts` baselines in `bluejays-funnels.ts` with live data
  // when present (the component prefers real over hardcoded).
  //
  // Segment attribution rules (refactored 2026-05-16 to use category
  // instead of lookalike_category — system-coherent design per Ben's
  // ask):
  //   - inbound-audit  → source='inbound' (regardless of category —
  //                      acquisition channel was inbound; Madie's
  //                      pipeline handles manufacturer + service)
  //   - mfg-lookalike  → source != 'inbound' AND category IN
  //                      MANUFACTURER_CATEGORIES (Ben's Dream-100
  //                      hand-curated bucket; covers scouted manufacturers
  //                      + manually-added entries; high-ticket Ben pipeline)
  //   - cold-scouted   → source='scouted' AND (category NOT IN
  //                      MANUFACTURER_CATEGORIES OR category IS NULL)
  //                      (Apollo/Google Places service-business
  //                      auto-scout; excludes manufacturers to prevent
  //                      double-count)
  //
  // No double-count: inbound prospects go to inbound-audit regardless
  // of category. Scouted+manual manufacturers go to mfg-lookalike.
  // Scouted non-manufacturers go to cold-scouted. Manual non-manufacturers
  // (rare — 1 prospect today) fall outside all 3 funnels — that's OK,
  // they're operator-managed individually.
  //
  // Counts (match defaultCounts shape):
  //   - total           → all prospects in segment
  //   - newCount        → created in last 7 days
  //   - wonCount        → status IN (paid, live)
  //   - enrolledCount   → status NOT IN terminal states (paid/live/
  //                       dismissed/unsubscribed/bounced/qc_failed)
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const TERMINAL_STATUSES = "(paid,live,dismissed,unsubscribed,bounced,qc_failed)";
  const WON_STATUSES = ["paid", "live"];

  type SegmentCounts = {
    total: number;
    newCount: number;
    enrolledCount: number;
    wonCount: number;
  };

  // Helper: build the head-count select for a given segment filter.
  // We can't use a higher-order filter function cleanly because the
  // PostgrestFilterBuilder is created BY .select(), so each of the 4
  // counts has to start its own filter chain.
  function baseSelect() {
    return supabase
      .from("prospects")
      .select("id", { count: "exact", head: true });
  }

  // Category-list as PostgREST-formatted parens-list for .in() and
  // .not("category", "in", ...). Used by both mfg-lookalike (positive
  // match) and cold-scouted (negation, with NULL passthrough via .or()).
  const MFG_CATEGORY_LIST = `(${MANUFACTURER_CATEGORIES.join(",")})`;

  // Inbound-audit: source='inbound' (regardless of category)
  const [iaTot, iaNew, iaWon, iaEnr] = await Promise.all([
    baseSelect().eq("source", "inbound"),
    baseSelect().eq("source", "inbound").gte("created_at", sevenDaysAgo),
    baseSelect().eq("source", "inbound").in("status", WON_STATUSES),
    baseSelect().eq("source", "inbound").not("status", "in", TERMINAL_STATUSES),
  ]);

  // Cold-scouted: source='scouted' AND (category NOT IN mfg OR category IS NULL)
  // PostgREST: `category NOT IN (...)` filters OUT NULLs (SQL three-valued
  // logic), so we OR with `category.is.null` to keep null-category rows.
  const csCategoryFilter = `category.is.null,category.not.in.${MFG_CATEGORY_LIST}`;
  const [csTot, csNew, csWon, csEnr] = await Promise.all([
    baseSelect().eq("source", "scouted").or(csCategoryFilter),
    baseSelect()
      .eq("source", "scouted")
      .or(csCategoryFilter)
      .gte("created_at", sevenDaysAgo),
    baseSelect()
      .eq("source", "scouted")
      .or(csCategoryFilter)
      .in("status", WON_STATUSES),
    baseSelect()
      .eq("source", "scouted")
      .or(csCategoryFilter)
      .not("status", "in", TERMINAL_STATUSES),
  ]);

  // Mfg-lookalike: source != 'inbound' AND category IN MANUFACTURER_CATEGORIES
  // (covers scouted manufacturers + manually-added Dream-100 entries +
  // null-source manufacturers — anything in the manufacturer pipeline
  // that isn't a self-service /audit inbound)
  const [mlTot, mlNew, mlWon, mlEnr] = await Promise.all([
    baseSelect().neq("source", "inbound").in("category", MANUFACTURER_CATEGORIES),
    baseSelect()
      .neq("source", "inbound")
      .in("category", MANUFACTURER_CATEGORIES)
      .gte("created_at", sevenDaysAgo),
    baseSelect()
      .neq("source", "inbound")
      .in("category", MANUFACTURER_CATEGORIES)
      .in("status", WON_STATUSES),
    baseSelect()
      .neq("source", "inbound")
      .in("category", MANUFACTURER_CATEGORIES)
      .not("status", "in", TERMINAL_STATUSES),
  ]);

  const bySegment: Array<{ segment: string } & SegmentCounts> = [
    {
      segment: "inbound-audit",
      total: iaTot.count ?? 0,
      newCount: iaNew.count ?? 0,
      wonCount: iaWon.count ?? 0,
      enrolledCount: iaEnr.count ?? 0,
    },
    {
      segment: "cold-scouted",
      total: csTot.count ?? 0,
      newCount: csNew.count ?? 0,
      wonCount: csWon.count ?? 0,
      enrolledCount: csEnr.count ?? 0,
    },
    {
      segment: "mfg-lookalike",
      total: mlTot.count ?? 0,
      newCount: mlNew.count ?? 0,
      wonCount: mlWon.count ?? 0,
      enrolledCount: mlEnr.count ?? 0,
    },
  ];

  return NextResponse.json({
    windows,
    byFork,
    callbackSla,
    bySegment,
    generatedAt: new Date().toISOString(),
  });
}
