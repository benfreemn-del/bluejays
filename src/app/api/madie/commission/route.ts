import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/madie/commission
 *
 * Madie's commission ledger for the current month. Per Ben's spec
 * locked 2026-05-08:
 *   - $400 per website close (pricing_tier in 'standard' | 'custom' | 'free')
 *   - $2,000 per AI System close (pricing_tier = 'fullsystem')
 *
 * Source: prospects table — every row with status='paid' OR paid_at
 * set during the current calendar month gets credited. Until a
 * dedicated multi-rep partner-attribution flow ships, Madie is
 * implicitly the sole salesperson — every close is hers. When a
 * second rep joins, this endpoint adds a partner_id filter.
 *
 * Milestones (the "next $X away" chip): $1k → $5k → $10k → $20k →
 * $50k. The hero stat shows current month earnings + the gap to the
 * next milestone.
 */

const COMMISSION_RATES = {
  website: 400, // $997 / $100/yr / $30 tiers
  ai_system: 2000, // $9,700+ tier
} as const;

const MILESTONES = [1000, 2500, 5000, 10000, 20000, 50000, 100000] as const;

interface ProspectRow {
  id: string;
  business_name: string | null;
  pricing_tier: string | null;
  status: string | null;
  paid_at: string | null;
  created_at: string | null;
}

function isWebsiteTier(tier: string | null): boolean {
  return tier === "standard" || tier === "custom" || tier === "free";
}
function isAiSystemTier(tier: string | null): boolean {
  return tier === "fullsystem";
}

export async function GET(_request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(emptyResponse());
  }

  try {
    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

    // Pull recent paid prospects — small dataset, easy to aggregate in
    // memory. The status='paid' filter does the heavy lifting.
    const { data, error } = await supabase
      .from("prospects")
      .select("id, business_name, pricing_tier, status, paid_at, created_at")
      .eq("status", "paid")
      .gte("paid_at", yearStart.toISOString())
      .order("paid_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[madie/commission] supabase select failed:", error);
      return NextResponse.json(emptyResponse());
    }

    const rows = (data ?? []) as ProspectRow[];

    let monthCommissionUsd = 0;
    let monthWebsiteCloses = 0;
    let monthAiSystemCloses = 0;
    let lifetimeCommissionUsd = 0;
    let lifetimeCloses = 0;
    const recent: Array<{
      id: string;
      businessName: string;
      tier: "website" | "ai_system" | "other";
      commissionUsd: number;
      paidAt: string;
    }> = [];

    for (const r of rows) {
      const paidTs = r.paid_at ? Date.parse(r.paid_at) : 0;
      if (!paidTs) continue;
      const isThisMonth = paidTs >= monthStart.getTime();

      let commissionUsd = 0;
      let bucket: "website" | "ai_system" | "other" = "other";
      if (isAiSystemTier(r.pricing_tier)) {
        commissionUsd = COMMISSION_RATES.ai_system;
        bucket = "ai_system";
      } else if (isWebsiteTier(r.pricing_tier)) {
        commissionUsd = COMMISSION_RATES.website;
        bucket = "website";
      }

      lifetimeCommissionUsd += commissionUsd;
      lifetimeCloses += 1;

      if (isThisMonth) {
        monthCommissionUsd += commissionUsd;
        if (bucket === "website") monthWebsiteCloses += 1;
        if (bucket === "ai_system") monthAiSystemCloses += 1;
      }

      if (recent.length < 20) {
        recent.push({
          id: r.id,
          businessName: r.business_name ?? "—",
          tier: bucket,
          commissionUsd,
          paidAt: r.paid_at ?? "",
        });
      }
    }

    // Next milestone math
    const nextMilestone =
      MILESTONES.find((m) => m > monthCommissionUsd) ?? null;
    const distanceToMilestone =
      nextMilestone == null ? null : nextMilestone - monthCommissionUsd;
    const closesNeededWebsite =
      distanceToMilestone == null
        ? null
        : Math.ceil(distanceToMilestone / COMMISSION_RATES.website);
    const closesNeededAiSystem =
      distanceToMilestone == null
        ? null
        : Math.ceil(distanceToMilestone / COMMISSION_RATES.ai_system);

    // Annualized goal: 10 × $10k closes/month × 12 months = $240k pool
    // → at $2k/close commission, that's $20k/mo for Madie. Surface as
    // "% of $20k month goal" for the hero ticker.
    const monthGoalUsd = 20000;
    const monthGoalPct = Math.min(
      100,
      Math.round((monthCommissionUsd / monthGoalUsd) * 100),
    );

    return NextResponse.json({
      monthCommissionUsd,
      monthWebsiteCloses,
      monthAiSystemCloses,
      monthGoalUsd,
      monthGoalPct,
      lifetimeCommissionUsd,
      lifetimeCloses,
      nextMilestone,
      distanceToMilestone,
      closesNeededWebsite,
      closesNeededAiSystem,
      rates: COMMISSION_RATES,
      recent,
      asOf: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[madie/commission] failed:", err);
    return NextResponse.json(emptyResponse());
  }
}

function emptyResponse() {
  return {
    monthCommissionUsd: 0,
    monthWebsiteCloses: 0,
    monthAiSystemCloses: 0,
    monthGoalUsd: 20000,
    monthGoalPct: 0,
    lifetimeCommissionUsd: 0,
    lifetimeCloses: 0,
    nextMilestone: 1000 as number | null,
    distanceToMilestone: 1000 as number | null,
    closesNeededWebsite: 3 as number | null,
    closesNeededAiSystem: 1 as number | null,
    rates: COMMISSION_RATES,
    recent: [] as Array<{
      id: string;
      businessName: string;
      tier: "website" | "ai_system" | "other";
      commissionUsd: number;
      paidAt: string;
    }>,
    asOf: new Date().toISOString(),
  };
}
