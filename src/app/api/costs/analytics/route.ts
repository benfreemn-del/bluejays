import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getAllProspects } from "@/lib/store";

/**
 * GET /api/costs/analytics
 *
 * Returns enhanced cost analytics data:
 * - Daily cost chart (last 30 days)
 * - All-time total spend
 * - Cost by service breakdown
 * - Per-lead cost breakdown
 * - ROI projections based on current conversion rates
 */
export async function GET() {
  try {
    const prospects = await getAllProspects();
    const paidCount = prospects.filter((p) => p.status === "paid").length;
    const totalLeads = prospects.length;
    const conversionRate = totalLeads > 0 ? (paidCount / totalLeads) * 100 : 0;

    // Default response for when Supabase is not configured
    const defaultResponse = {
      dailyCosts: [] as { date: string; total: number; byService: Record<string, number> }[],
      allTime: { total: 0, byService: {} as Record<string, number>, count: 0 },
      today: { total: 0, byService: {} as Record<string, number> },
      thisWeek: { total: 0, byService: {} as Record<string, number> },
      thisMonth: { total: 0, byService: {} as Record<string, number> },
      perLeadCost: {
        average: 0,
        median: 0,
        breakdown: {
          googlePlaces: 0,
          sendgrid: 0,
          twilio: 0,
          siteGeneration: 0,
          aiProcessing: 0,
        },
      },
      roi: {
        totalRevenue: paidCount * 997,
        totalSpend: 0,
        netProfit: paidCount * 997,
        roiMultiple: 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        costPerAcquisition: 0,
        projectedMonthlyRevenue: 0,
        projectedMonthlyProfit: 0,
        breakEvenLeads: 0,
      },
    };

    if (!isSupabaseConfigured()) {
      // Generate mock daily data for last 30 days
      const dailyCosts = generateEmptyDailyData();
      return NextResponse.json({ ...defaultResponse, dailyCosts });
    }

    // Fetch all cost records
    const { data: allCosts, error } = await supabase
      .from("system_costs")
      .select("service, action, cost_usd, created_at, prospect_id, status")
      .eq("status", "success")
      .order("created_at", { ascending: true });

    if (error || !allCosts || allCosts.length === 0) {
      const dailyCosts = generateEmptyDailyData();
      return NextResponse.json({ ...defaultResponse, dailyCosts });
    }

    // ── Build daily cost chart ──
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const dailyMap = new Map<string, { total: number; byService: Record<string, number> }>();
    const allTimeByService: Record<string, number> = {};
    let allTimeTotal = 0;
    const todayByService: Record<string, number> = {};
    let todayTotal = 0;
    const weekByService: Record<string, number> = {};
    let weekTotal = 0;
    const monthByService: Record<string, number> = {};
    let monthTotal = 0;

    // Per-service category mapping
    const serviceCategories: Record<string, string> = {
      google_places: "googlePlaces",
      sendgrid_email: "sendgrid",
      twilio_sms: "twilio",
      twilio_voice: "twilio",
      site_generation: "siteGeneration",
      ai_response: "aiProcessing",
      pipeline: "siteGeneration",
    };

    // Per-prospect cost accumulation
    const prospectCosts = new Map<string, number>();

    for (const row of allCosts) {
      const cost = Number(row.cost_usd);
      const createdAt = row.created_at as string;
      const dateStr = createdAt.split("T")[0];
      const service = row.service as string;

      // All-time
      allTimeTotal += cost;
      allTimeByService[service] = (allTimeByService[service] || 0) + cost;

      // Daily chart
      if (new Date(createdAt) >= thirtyDaysAgo) {
        const existing = dailyMap.get(dateStr) || { total: 0, byService: {} };
        existing.total += cost;
        existing.byService[service] = (existing.byService[service] || 0) + cost;
        dailyMap.set(dateStr, existing);
      }

      // Today
      if (createdAt >= todayStart) {
        todayTotal += cost;
        todayByService[service] = (todayByService[service] || 0) + cost;
      }

      // This week
      if (createdAt >= weekStart) {
        weekTotal += cost;
        weekByService[service] = (weekByService[service] || 0) + cost;
      }

      // This month
      if (createdAt >= monthStart) {
        monthTotal += cost;
        monthByService[service] = (monthByService[service] || 0) + cost;
      }

      // Per-prospect
      if (row.prospect_id) {
        const existing = prospectCosts.get(row.prospect_id) || 0;
        prospectCosts.set(row.prospect_id, existing + cost);
      }
    }

    // Build daily chart array (last 30 days)
    const dailyCosts: { date: string; total: number; byService: Record<string, number> }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const data = dailyMap.get(dateStr) || { total: 0, byService: {} };
      dailyCosts.push({
        date: dateStr,
        total: Math.round(data.total * 10000) / 10000,
        byService: data.byService,
      });
    }

    // ── Per-lead cost breakdown ──
    const perLeadBreakdown = {
      googlePlaces: 0,
      sendgrid: 0,
      twilio: 0,
      siteGeneration: 0,
      aiProcessing: 0,
    };

    for (const [service, cost] of Object.entries(allTimeByService)) {
      const category = serviceCategories[service] || "aiProcessing";
      if (category in perLeadBreakdown) {
        perLeadBreakdown[category as keyof typeof perLeadBreakdown] += cost;
      }
    }

    // Divide by total leads to get per-lead averages
    const uniqueProspects = prospectCosts.size || 1;
    const perLeadAvg = allTimeTotal / uniqueProspects;

    // Calculate median per-lead cost
    const sortedCosts = Array.from(prospectCosts.values()).sort((a, b) => a - b);
    const median = sortedCosts.length > 0
      ? sortedCosts.length % 2 === 0
        ? (sortedCosts[sortedCosts.length / 2 - 1] + sortedCosts[sortedCosts.length / 2]) / 2
        : sortedCosts[Math.floor(sortedCosts.length / 2)]
      : 0;

    // ── ROI projections ──
    const totalRevenue = paidCount * 997;
    const netProfit = totalRevenue - allTimeTotal;
    const roiMultiple = allTimeTotal > 0 ? totalRevenue / allTimeTotal : 0;
    const costPerAcquisition = paidCount > 0 ? allTimeTotal / paidCount : allTimeTotal;

    // Project monthly based on current month's pace
    const daysElapsed = Math.max(1, now.getDate());
    const dailyAvgCost = monthTotal / daysElapsed;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedMonthlyCost = dailyAvgCost * daysInMonth;

    // Project monthly revenue based on conversion rate
    const monthlyLeadRate = totalLeads > 0
      ? totalLeads / Math.max(1, Math.ceil((now.getTime() - new Date(allCosts[0].created_at as string).getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 0;
    const projectedMonthlyRevenue = monthlyLeadRate * (conversionRate / 100) * 997;
    const projectedMonthlyProfit = projectedMonthlyRevenue - projectedMonthlyCost;

    const breakEvenLeads = perLeadAvg > 0 ? Math.ceil(997 / (997 * (conversionRate / 100) - perLeadAvg)) : 0;

    return NextResponse.json({
      dailyCosts,
      allTime: {
        total: Math.round(allTimeTotal * 100) / 100,
        byService: allTimeByService,
        count: allCosts.length,
      },
      today: { total: Math.round(todayTotal * 100) / 100, byService: todayByService },
      thisWeek: { total: Math.round(weekTotal * 100) / 100, byService: weekByService },
      thisMonth: { total: Math.round(monthTotal * 100) / 100, byService: monthByService },
      perLeadCost: {
        average: Math.round(perLeadAvg * 1000) / 1000,
        median: Math.round(median * 1000) / 1000,
        breakdown: {
          googlePlaces: Math.round((perLeadBreakdown.googlePlaces / uniqueProspects) * 1000) / 1000,
          sendgrid: Math.round((perLeadBreakdown.sendgrid / uniqueProspects) * 1000) / 1000,
          twilio: Math.round((perLeadBreakdown.twilio / uniqueProspects) * 1000) / 1000,
          siteGeneration: Math.round((perLeadBreakdown.siteGeneration / uniqueProspects) * 1000) / 1000,
          aiProcessing: Math.round((perLeadBreakdown.aiProcessing / uniqueProspects) * 1000) / 1000,
        },
      },
      roi: {
        totalRevenue,
        totalSpend: Math.round(allTimeTotal * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        roiMultiple: Math.round(roiMultiple * 10) / 10,
        conversionRate: Math.round(conversionRate * 100) / 100,
        costPerAcquisition: Math.round(costPerAcquisition * 100) / 100,
        projectedMonthlyRevenue: Math.round(projectedMonthlyRevenue),
        projectedMonthlyProfit: Math.round(projectedMonthlyProfit),
        breakEvenLeads: Math.max(0, breakEvenLeads),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

function generateEmptyDailyData() {
  const dailyCosts: { date: string; total: number; byService: Record<string, number> }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dailyCosts.push({
      date: date.toISOString().split("T")[0],
      total: 0,
      byService: {},
    });
  }
  return dailyCosts;
}
