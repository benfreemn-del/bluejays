import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/madie/commission
 *
 * Madie's commission ledger for the current month. Per Ben's spec
 * locked 2026-05-08 (revised after Q4 quiz answer):
 *
 *   Setter tier (Lap 1-4 — she sets meetings, Ben closes):
 *     - $200 per website close (pricing_tier in standard / custom / free)
 *     - $1,000 per AI System close (pricing_tier = fullsystem)
 *
 *   Closer tier (Lap 5-6 — she's running the close herself):
 *     - $400 per website close
 *     - $2,000 per AI System close
 *
 * Rate at TIME of close = rate at the lap stamped on the prospect when
 * status flipped to 'paid' (prospects.madie_lap_at_close, written by
 * updateProspect()). Falls back to current lap when null (legacy data).
 * Audit B7 — keeps lifetime totals stable across lap promotions.
 *
 * Source: prospects table — every row with status='paid' AND
 * paid_at set during the current calendar month gets credited.
 * Madie's current lap is read from app_settings.madie_current_lap
 * (the same override the race-track UI uses).
 *
 * Milestones (the "next $X away" chip): $1k → $2.5k → $5k → $10k →
 * $20k → $50k → $100k. The hero stat shows current month earnings +
 * the gap to the next milestone.
 */

const SETTER_RATES = {
  website: 200, // Lap 1-4
  ai_system: 1000,
} as const;

const CLOSER_RATES = {
  website: 400, // Lap 5-6
  ai_system: 2000,
} as const;

function ratesForLap(lap: number): { website: number; ai_system: number } {
  return lap >= 5 ? CLOSER_RATES : SETTER_RATES;
}

const MILESTONES = [1000, 2500, 5000, 10000, 20000, 50000, 100000] as const;

interface ProspectRow {
  id: string;
  business_name: string | null;
  pricing_tier: string | null;
  status: string | null;
  paid_at: string | null;
  created_at: string | null;
  madie_lap_at_close: number | null;
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

    // Read Madie's current lap from app_settings — same source the
    // race-track UI uses. Defaults to lap 1 if no override and no
    // table row.
    const { data: lapRow } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "madie_current_lap")
      .maybeSingle();
    const lapValue =
      lapRow?.value && typeof lapRow.value === "object" && "lap" in lapRow.value
        ? Number((lapRow.value as { lap: number }).lap)
        : 1;
    const currentLap = Number.isFinite(lapValue) ? Math.max(1, Math.min(6, lapValue)) : 1;
    const rates = ratesForLap(currentLap);
    const tier: "setter" | "closer" = currentLap >= 5 ? "closer" : "setter";

    // Read commission baseline — only paid_at >= this counts toward
    // Madie's totals. Lets Ben "reset to 0" by stamping a new baseline
    // without destroying historical prospect data. Stored as ISO
    // timestamp string in app_settings.value.at.
    const { data: baselineRow } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "madie_commission_baseline_at")
      .maybeSingle();
    const baselineAt =
      baselineRow?.value &&
      typeof baselineRow.value === "object" &&
      "at" in baselineRow.value
        ? String((baselineRow.value as { at: string }).at)
        : null;
    // Effective lower bound — whichever is LATER between yearStart and
    // baseline. Yearly anchor still defines the "lifetime" window so
    // baseline only ever moves the bar UP (resets going forward).
    const effectiveSince =
      baselineAt && Date.parse(baselineAt) > yearStart.getTime()
        ? baselineAt
        : yearStart.toISOString();

    // Pull recent paid prospects — small dataset, easy to aggregate in
    // memory. The status='paid' filter does the heavy lifting.
    const { data, error } = await supabase
      .from("prospects")
      .select(
        "id, business_name, pricing_tier, status, paid_at, created_at, madie_lap_at_close",
      )
      .eq("status", "paid")
      .gte("paid_at", effectiveSince)
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

      // Use the lap stamped at time of close when present; fall back to
      // current lap for legacy rows. Locks lifetime totals against
      // retroactive lap promotions (B7).
      const closeLap =
        r.madie_lap_at_close && r.madie_lap_at_close >= 1 && r.madie_lap_at_close <= 6
          ? r.madie_lap_at_close
          : currentLap;
      const closeRates = ratesForLap(closeLap);

      let commissionUsd = 0;
      let bucket: "website" | "ai_system" | "other" = "other";
      if (isAiSystemTier(r.pricing_tier)) {
        commissionUsd = closeRates.ai_system;
        bucket = "ai_system";
      } else if (isWebsiteTier(r.pricing_tier)) {
        commissionUsd = closeRates.website;
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
        : Math.ceil(distanceToMilestone / rates.website);
    const closesNeededAiSystem =
      distanceToMilestone == null
        ? null
        : Math.ceil(distanceToMilestone / rates.ai_system);

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
      rates,
      tier,
      currentLap,
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
    closesNeededWebsite: 5 as number | null,
    closesNeededAiSystem: 1 as number | null,
    rates: SETTER_RATES,
    tier: "setter" as "setter" | "closer",
    currentLap: 1,
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
