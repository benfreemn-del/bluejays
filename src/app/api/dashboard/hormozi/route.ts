import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/dashboard/hormozi
 *
 * Operator-facing 6-Horseman scoreboard. Re-runs the 2026-05-13
 * strategic-review diagnostic against live Supabase data so Ben can
 * see in one glance whether the same horsemen are still red.
 *
 * Per the Hormozi back-end fix recipe: "if you had to track one,
 * track close→resell." This route surfaces the close→resell signals
 * (NPS, paid clients by tier, ascension counts) alongside the
 * click→close pipeline so all 6 horsemen are visible together.
 *
 * Owner-only — middleware gates /dashboard/* already; no extra check
 * needed here. Returns NPS + paid prospects + cold-outbound category
 * spread. Anything we can't auto-compute (VSL shipped? pixel set?
 * Madie comp structure confirmed?) returns as "manual" state so the
 * scoreboard renders a toggle Ben can flip.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HorsemanState = "green" | "yellow" | "red" | "manual";

interface Horseman {
  id: "H1" | "H2" | "H3" | "H4" | "H5" | "H6";
  label: string;
  state: HorsemanState;
  metric: string;
  detail: string;
  next_action: string;
}

interface CriticalItem {
  id: string;
  label: string;
  state: HorsemanState;
  due: string;
  /** Manual toggle key — if defined, the UI lets the operator flip it. */
  manual_key?: string;
}

interface BackendFixItem {
  id: string;
  label: string;
  state: "shipped" | "partial" | "missing";
  detail: string;
}

interface ScoreboardResponse {
  ok: boolean;
  generated_at: string;
  days_since_review: number;
  horsemen: Horseman[];
  critical_this_week: CriticalItem[];
  backend_fix_progress: BackendFixItem[];
  totals: {
    nps_responses_30d: number;
    nps_avg_score: number | null;
    nps_promoters: number;
    nps_detractors: number;
    paid_prospects_30d: number;
    paid_fullsystem_30d: number;
    paid_standard_30d: number;
    cold_categories_30d: number;
  };
}

const REVIEW_DATE = new Date("2026-05-13");

export async function GET() {
  const sb = getSupabase();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const daysSinceReview = Math.floor((now.getTime() - REVIEW_DATE.getTime()) / (24 * 60 * 60 * 1000));

  // ─── NPS aggregate (last 30 days) ─────────────────────────────────
  const { data: npsRows } = await sb
    .from("nps_responses")
    .select("score, category, responded_at")
    .gte("responded_at", thirtyDaysAgo);
  const nps = (npsRows ?? []) as Array<{ score: number; category: string; responded_at: string }>;
  const npsCount = nps.length;
  const npsAvg = npsCount === 0 ? null : nps.reduce((s, r) => s + r.score, 0) / npsCount;
  const promoters = nps.filter((r) => r.category === "promoter").length;
  const detractors = nps.filter((r) => r.category === "detractor").length;

  // ─── Paid prospects by tier (last 30 days) ────────────────────────
  // Use lead_stage>='3' on prospects.pricingTier='standard' for paid $997,
  // lead_stage>='4' on 'fullsystem' for paid $10k. The codebase uses
  // these stage encodings per src/lib/types.ts.
  const { data: paidRows } = await sb
    .from("prospects")
    .select("pricing_tier, lead_stage, status_updated_at, created_at")
    .gte("status_updated_at", thirtyDaysAgo);
  const paid = (paidRows ?? []) as Array<{
    pricing_tier: string | null;
    lead_stage: string | null;
    status_updated_at: string;
  }>;
  const isPaidStandard = (p: { pricing_tier: string | null; lead_stage: string | null }) =>
    (p.pricing_tier === "standard" || p.pricing_tier === "free" || p.pricing_tier === "custom") &&
    p.lead_stage !== null &&
    parseInt(p.lead_stage[0] ?? "0", 10) >= 3;
  const isPaidFullsystem = (p: { pricing_tier: string | null; lead_stage: string | null }) =>
    p.pricing_tier === "fullsystem" &&
    p.lead_stage !== null &&
    parseInt(p.lead_stage[0] ?? "0", 10) >= 4;
  const paidStandard30d = paid.filter(isPaidStandard).length;
  const paidFullsystem30d = paid.filter(isPaidFullsystem).length;
  const paidTotal30d = paidStandard30d + paidFullsystem30d;

  // ─── Active-pipeline avatar spread (distinct categories where the
  //     lead is actually being worked, not just scraped). Filters by
  //     lead_stage NOT NULL so we measure what Madie/Ben are touching,
  //     not the scout's broad funnel. Raw scout pulls would surface
  //     50+ categories which isn't what H1 is asking about.
  const { data: outboundRows } = await sb
    .from("prospects")
    .select("category")
    .gte("status_updated_at", thirtyDaysAgo)
    .not("category", "is", null)
    .not("lead_stage", "is", null);
  const categories = new Set(
    (outboundRows ?? []).map((r: { category: string | null }) => r.category).filter(Boolean) as string[],
  );
  const coldCategories = categories.size;

  // ─── HORSEMAN VERDICTS ────────────────────────────────────────────

  const horsemen: Horseman[] = [
    {
      id: "H1",
      label: "Avatars",
      state: coldCategories > 3 ? "red" : coldCategories > 2 ? "yellow" : "green",
      metric: `${coldCategories} distinct categories in cold outbound (last 30d)`,
      detail:
        coldCategories > 3
          ? "Avatar sprawl. Manufacturer ICP is the validated motion; service / author / appraisal categories are leaking outbound budget."
          : coldCategories === 0
            ? "No cold outbound activity recorded — verify Madie's pipeline is firing into Supabase."
            : "Outbound is narrowed to validated avatar.",
      next_action:
        "H1.1: Narrow Madie's outbound to manufacturer-only for 30 days. Service clients stay as paying customers, just stop being acquisition targets.",
    },
    {
      id: "H2",
      label: "Pricing",
      state:
        paidFullsystem30d >= 3 ? "green" : paidFullsystem30d >= 1 ? "yellow" : "red",
      metric: `${paidFullsystem30d} $10K closes · ${paidStandard30d} Standard closes (last 30d)`,
      detail:
        paidFullsystem30d >= 3
          ? "n=3 cold $10K validation hit per Rule 67. Safe to test $10K→$12K next."
          : `n=${paidFullsystem30d}/3 cold $10K closes. Pricing not yet stress-tested cold.`,
      next_action:
        "H2.1: schedule $997→$1,097 test on next 30 inbound /audit flips. H2.2: test $10K→$12K on next 3 cold discovery calls.",
    },
    {
      id: "H3",
      label: "Compensation",
      state: "manual",
      metric: "Madie comp structure (per memory: $200/site + $1,000/AI System setter)",
      detail:
        "Manual confirmation needed. Hormozi red flag: rev share on top-line revenue with non-overhead-accountable hire. Bottom-line commission + base is the safer structure.",
      next_action: "H3.1: confirm Madie's comp in writing. Flag if rev-share on top-line.",
    },
    {
      id: "H4",
      label: "Red Dress (focus drift)",
      state: "manual",
      metric: "AIOS productization is the standing risk",
      detail:
        "Locked rule: AIOS captures seeds, doesn't build inline. Re-verify weekly that AIOS dev hours aren't displacing VSL / FB ads / cold-volume hours.",
      next_action:
        "H4.1: 5-friction audit on $997 → $10K ascension. Delay / Effort / Sacrifice / Risk / Inconsistency.",
    },
    {
      id: "H5",
      label: "Overextension",
      state: paidFullsystem30d < 3 ? "yellow" : "green",
      metric: "5 offer lines (custom, $997, $10K, $500/mo unadvertised, Pro tier deferred)",
      detail:
        paidFullsystem30d < 3
          ? "No new offer lines until $10K AI System hits 3 cold closes (per Rule 67 + H5.1 gate)."
          : "n=3 hit. Net-new offer-line gate is clear.",
      next_action: "H5.2: 6-month-no-Ben litmus on BlueJays itself. H5.3: identify the WHO for $997 onboarding at FB-scale volume.",
    },
    {
      id: "H6",
      label: "Data (no Data Daddy)",
      state: npsCount >= 3 ? "yellow" : "red",
      metric: `${npsCount} NPS responses (30d) · avg ${npsAvg === null ? "—" : npsAvg.toFixed(1)} · ${promoters} promoters · ${detractors} detractors`,
      detail:
        npsCount === 0
          ? "NPS infra is shipped (Day-14 cron) but no responses yet. Will populate as Day-14 windows roll in for recent paid prospects."
          : `NPS pulse running. ${promoters >= detractors ? "Net promoter positive." : "Detractors outpace promoters — call them personally."} Activation point + close→resell still unbuilt.`,
      next_action:
        "H6.2: build close→resell pipeline tracking ($997→$10K ascension rate, $500/mo attach rate). H6.4: discover BlueJays activation point from existing renewers (LCAC, Meyer, etc.).",
    },
  ];

  // ─── CRITICAL THIS WEEK (from 5/13 review) ────────────────────────
  // States here are "manual" since we can't auto-detect them from
  // Supabase alone. UI provides toggles so Ben can flip them as he
  // ships each one.
  const criticalThisWeek: CriticalItem[] = [
    {
      id: "vsl",
      label: "Record + ship VSL on /audit (30-sec hook + 60-90 sec post-audit reveal)",
      state: "manual",
      due: "Day 15 — overdue",
      manual_key: "vsl_shipped",
    },
    {
      id: "pixel",
      label: "Set NEXT_PUBLIC_META_PIXEL_ID in Vercel + redeploy",
      state: "manual",
      due: "Pre-FB launch",
      manual_key: "pixel_set",
    },
    {
      id: "fb_ads",
      label: "Launch FB ads on /audit funnel ($210 cap over 7 days)",
      state: "manual",
      due: "Day 19 — 2026-05-16",
      manual_key: "fb_ads_live",
    },
    {
      id: "tekky_migration",
      label: "Verify 20260510_zenith_owners_and_subscriptions.sql ran in prod",
      state: "manual",
      due: "Pre-walkthrough",
      manual_key: "tekky_migration_verified",
    },
    {
      id: "madie_ramp",
      label: "Confirm Madie is actually booking calls (or surface the blocker)",
      state: "manual",
      due: "Day 19",
      manual_key: "madie_ramp_confirmed",
    },
  ];

  // ─── BACK-END FIX RECIPE PROGRESS (H6 sub-items + CS items) ───────
  const backendFix: BackendFixItem[] = [
    {
      id: "H6.1",
      label: "Click→close pipeline tracking",
      state: "partial",
      detail:
        "Closer Breakdown card + /dashboard/heatmap shipped today. Still missing: ad CTR per creative, schedule rate vs show rate, offer rate (% of shows that get pitched).",
    },
    {
      id: "H6.2",
      label: "Close→resell pipeline tracking",
      state: "missing",
      detail: "Ascension rate $997→$10K not tracked. $500/mo attach rate not tracked. TTV / TTO per $997 site not tracked.",
    },
    {
      id: "H6.3",
      label: "NPS instrumentation",
      state: "shipped",
      detail: "Day-14 cron + /r/[code]/[score] capture + promoter/passive/detractor split + auto-referral on promoters. Scoreboard tile above now surfaces the data.",
    },
    {
      id: "H6.4",
      label: "Activation point discovery",
      state: "missing",
      detail:
        "site_live_at + first_inbound_lead_at columns not yet on prospects. Need to backfill from existing renewers (LCAC, Meyer, Hector, KR) to find the correlation.",
    },
    {
      id: "CS1",
      label: "$997 + $10K onboarding playbook",
      state: "partial",
      detail:
        "Welcome emails exist + portal onboarding flow exists. Missing: scripted Day-14 goal-reset call + Day-30 NPS pulse + Day-60 ascension trigger.",
    },
    {
      id: "CS2",
      label: "Removal Value Test on existing $997 clients",
      state: "missing",
      detail:
        '"If you could only keep ONE thing about your BlueJays site, what would it be?" Survey not built or sent to Hector / Meyer / LCAC / KR / Masters / Pine / MtView / Olympic.',
    },
    {
      id: "CS3",
      label: "5 ascension trigger points on $997→$10K",
      state: "partial",
      detail:
        "Halfway / big-win / last-chance triggers exist via the 3-call ladder. Missing: Immediate (24hr post-$997) trigger + TTV (first inbound lead) trigger.",
    },
  ];

  const body: ScoreboardResponse = {
    ok: true,
    generated_at: now.toISOString(),
    days_since_review: daysSinceReview,
    horsemen,
    critical_this_week: criticalThisWeek,
    backend_fix_progress: backendFix,
    totals: {
      nps_responses_30d: npsCount,
      nps_avg_score: npsAvg,
      nps_promoters: promoters,
      nps_detractors: detractors,
      paid_prospects_30d: paidTotal30d,
      paid_fullsystem_30d: paidFullsystem30d,
      paid_standard_30d: paidStandard30d,
      cold_categories_30d: coldCategories,
    },
  };

  return NextResponse.json(body);
}
