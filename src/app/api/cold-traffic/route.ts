import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/cold-traffic
 *
 * Cold-paid-traffic validation dashboard data. Per the May 2026
 * cold-traffic experiment locked 2026-05-08: $200-500 Meta ad spend
 * → /audit page → audit completion → claim page → Stripe checkout.
 * This endpoint slices prospects by UTM tag + audit_variant cookie
 * so Ben can see CAC + funnel conversion per hook.
 *
 * Reads `prospects` table, filters to rows whose
 * scraped_data.cutMyAgencyCalculator.utm or scraped_data.attribution
 * carry the cold-validation UTM campaign tag, groups by audit_variant
 * (A / B / C) and computes funnel-step counts.
 *
 * For Meta ad spend itself we don't pull live (Meta Marketing API
 * not yet wired). Ben enters daily spend manually in Meta Ads Manager;
 * dashboard shows lead counts + downstream conversions and computes
 * CAC math when spend is provided via query string `?spend_usd=210`.
 */

const COLD_CAMPAIGN_TAG = "cold-validation-2026-05";

interface ProspectRow {
  id: string;
  business_name: string | null;
  email: string | null;
  status: string | null;
  pricing_tier: string | null;
  pipeline_stage: string | null;
  paid_at: string | null;
  created_at: string | null;
  scraped_data: Record<string, unknown> | null;
}

type AttributionFields = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  audit_variant?: string;
};

function readAttribution(
  scrapedData: Record<string, unknown> | null,
): AttributionFields {
  if (!scrapedData) return {};
  // First check the audit form's attribution bag
  const audit = scrapedData.attribution as AttributionFields | undefined;
  if (audit?.utm_campaign === COLD_CAMPAIGN_TAG) return audit;
  // Then the cut-my-agency calculator gate
  const cma = scrapedData.cutMyAgencyCalculator as
    | { utm?: AttributionFields }
    | undefined;
  if (cma?.utm?.utm_campaign === COLD_CAMPAIGN_TAG) return cma.utm;
  // Generic top-level utm if neither is set (older capture path)
  const flat = scrapedData.utm as AttributionFields | undefined;
  if (flat?.utm_campaign === COLD_CAMPAIGN_TAG) return flat;
  return {};
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const spendParam = url.searchParams.get("spend_usd");
  const adSpendUsd = spendParam ? parseFloat(spendParam) : 0;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(emptyResponse(adSpendUsd));
  }

  try {
    const sevenDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
      .from("prospects")
      .select(
        "id, business_name, email, status, pricing_tier, pipeline_stage, paid_at, created_at, scraped_data",
      )
      .gte("created_at", sevenDaysAgo)
      .limit(1000);

    if (error) {
      console.error("[cold-traffic] supabase select failed:", error);
      return NextResponse.json(emptyResponse(adSpendUsd));
    }

    const rows = (data ?? []) as ProspectRow[];

    // Filter to cold-validation campaign rows only
    const coldRows = rows
      .map((r) => ({ row: r, attr: readAttribution(r.scraped_data) }))
      .filter((entry) => entry.attr.utm_campaign === COLD_CAMPAIGN_TAG);

    // Per-variant funnel counts
    const byVariant: Record<
      string,
      {
        leads: number;
        audit_complete: number;
        claim_clicked: number;
        purchased: number;
        revenueCents: number;
      }
    > = { A: blank(), B: blank(), C: blank(), Unknown: blank() };

    for (const { row, attr } of coldRows) {
      const variant = (attr.audit_variant || "Unknown").toUpperCase();
      const bucket =
        variant === "A" || variant === "B" || variant === "C"
          ? variant
          : "Unknown";

      byVariant[bucket].leads += 1;

      // Funnel-step inference (no log table yet — derive from prospect state):
      // - audit_complete: status NOT IN ('audit_lead', 'invalid')
      // - claim_clicked: pipeline_stage set OR status = 'pitched'
      // - purchased: status = 'paid' OR paid_at set
      const status = (row.status ?? "").toString();
      if (
        status &&
        status !== "audit_lead" &&
        status !== "invalid" &&
        status !== "duplicate"
      ) {
        byVariant[bucket].audit_complete += 1;
      }
      if (row.pipeline_stage || status === "pitched" || status === "paid") {
        byVariant[bucket].claim_clicked += 1;
      }
      if (status === "paid" || row.paid_at) {
        byVariant[bucket].purchased += 1;
        byVariant[bucket].revenueCents += revenueFor(row.pricing_tier);
      }
    }

    const totals = Object.values(byVariant).reduce(
      (acc, v) => ({
        leads: acc.leads + v.leads,
        audit_complete: acc.audit_complete + v.audit_complete,
        claim_clicked: acc.claim_clicked + v.claim_clicked,
        purchased: acc.purchased + v.purchased,
        revenueCents: acc.revenueCents + v.revenueCents,
      }),
      blank(),
    );

    const cac = totals.purchased > 0 ? adSpendUsd / totals.purchased : null;
    const costPerLead = totals.leads > 0 ? adSpendUsd / totals.leads : null;
    const roas =
      adSpendUsd > 0 ? totals.revenueCents / 100 / adSpendUsd : null;

    // Recent leads timeline (most recent 30)
    const recent = coldRows
      .slice(0, 30)
      .map(({ row, attr }) => ({
        id: row.id,
        businessName: row.business_name ?? "—",
        email: row.email ?? "—",
        status: row.status ?? "—",
        variant: attr.audit_variant ?? "—",
        utmContent: attr.utm_content ?? "—",
        createdAt: row.created_at ?? "",
      }));

    return NextResponse.json({
      campaignTag: COLD_CAMPAIGN_TAG,
      windowDays: 30,
      adSpendUsd,
      totals,
      byVariant,
      cac,
      costPerLead,
      roas,
      recent,
      asOf: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cold-traffic] failed:", err);
    return NextResponse.json(emptyResponse(adSpendUsd));
  }
}

function blank() {
  return {
    leads: 0,
    audit_complete: 0,
    claim_clicked: 0,
    purchased: 0,
    revenueCents: 0,
  };
}

function revenueFor(pricingTier: string | null): number {
  switch (pricingTier) {
    case "fullsystem":
      return 1000000;
    case "custom":
      return 10000;
    case "free":
      return 3000;
    case "standard":
    default:
      return 99700;
  }
}

function emptyResponse(adSpendUsd: number) {
  return {
    campaignTag: COLD_CAMPAIGN_TAG,
    windowDays: 30,
    adSpendUsd,
    totals: blank(),
    byVariant: { A: blank(), B: blank(), C: blank(), Unknown: blank() },
    cac: null as number | null,
    costPerLead: null as number | null,
    roas: null as number | null,
    recent: [] as Array<{
      id: string;
      businessName: string;
      email: string;
      status: string;
      variant: string;
      utmContent: string;
      createdAt: string;
    }>,
    asOf: new Date().toISOString(),
  };
}
