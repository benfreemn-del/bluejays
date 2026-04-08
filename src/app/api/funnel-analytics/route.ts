import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Prospect, Category } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";

/**
 * GET /api/funnel-analytics
 *
 * Real-time funnel analytics showing:
 * - Open rates, click rates, claim rates, conversion rates
 * - Breakdown by category, by funnel step, and by day
 * - Drop-off analysis between funnel stages
 */

interface FunnelStageData {
  stage: string;
  count: number;
  rate: number;
  dropOff: number;
  dropOffRate: number;
}

interface CategoryBreakdown {
  category: string;
  label: string;
  total: number;
  contacted: number;
  opened: number;
  clicked: number;
  responded: number;
  claimed: number;
  paid: number;
  openRate: number;
  clickRate: number;
  responseRate: number;
  claimRate: number;
  conversionRate: number;
}

interface DailyMetric {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  responded: number;
  claimed: number;
  paid: number;
  openRate: number;
  clickRate: number;
}

interface FunnelAnalytics {
  overview: {
    totalProspects: number;
    totalContacted: number;
    totalOpened: number;
    totalClicked: number;
    totalResponded: number;
    totalClaimed: number;
    totalPaid: number;
    overallOpenRate: number;
    overallClickRate: number;
    overallResponseRate: number;
    overallClaimRate: number;
    overallConversionRate: number;
    revenue: number;
  };
  funnel: FunnelStageData[];
  byCategory: CategoryBreakdown[];
  byDay: DailyMetric[];
  topPerformingCategories: Array<{ category: string; label: string; conversionRate: number; count: number }>;
  bottlenecks: Array<{ from: string; to: string; dropOffRate: number; suggestion: string }>;
}

// Map prospect statuses to funnel stages
const STATUS_TO_STAGE: Record<string, number> = {
  scouted: 0,
  scraped: 0,
  generated: 0,
  "pending-review": 0,
  ready_to_review: 0,
  qc_failed: 0,
  approved: 0,
  deployed: 1,
  contacted: 2,
  engaged: 3,
  link_clicked: 4,
  responded: 5,
  interested: 6,
  claimed: 7,
  paid: 8,
};

const FUNNEL_STAGES = [
  "Scouted",
  "Deployed",
  "Contacted",
  "Engaged",
  "Link Clicked",
  "Responded",
  "Interested",
  "Claimed",
  "Paid",
];

export async function GET() {
  try {
    const prospects = await getAllProspects();

    // Get email events if available
    let emailEvents: Array<{ event_type: string; email: string; timestamp: string }> = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from("email_events")
          .select("event_type, email, timestamp")
          .order("timestamp", { ascending: false })
          .limit(5000);
        if (data) emailEvents = data;
      } catch {
        // Table may not exist
      }
    }

    // Build email event lookup
    const openedEmails = new Set(
      emailEvents.filter((e) => e.event_type === "open").map((e) => e.email.toLowerCase())
    );
    const clickedEmails = new Set(
      emailEvents.filter((e) => e.event_type === "click").map((e) => e.email.toLowerCase())
    );

    // ==================== OVERVIEW ====================
    const totalProspects = prospects.length;
    const contactedStatuses = ["contacted", "engaged", "link_clicked", "responded", "interested", "claimed", "paid"];
    const totalContacted = prospects.filter((p) => contactedStatuses.includes(p.status)).length;

    // Count opened/clicked from email events or from status progression
    let totalOpened = 0;
    let totalClicked = 0;
    for (const p of prospects) {
      if (p.email && openedEmails.has(p.email.toLowerCase())) totalOpened++;
      else if (["engaged", "link_clicked", "responded", "interested", "claimed", "paid"].includes(p.status)) totalOpened++;

      if (p.email && clickedEmails.has(p.email.toLowerCase())) totalClicked++;
      else if (["link_clicked", "responded", "interested", "claimed", "paid"].includes(p.status)) totalClicked++;
    }

    const totalResponded = prospects.filter((p) =>
      ["responded", "interested", "claimed", "paid"].includes(p.status)
    ).length;
    const totalClaimed = prospects.filter((p) => ["claimed", "paid"].includes(p.status)).length;
    const totalPaid = prospects.filter((p) => p.status === "paid").length;

    const overallOpenRate = totalContacted > 0 ? Math.round((totalOpened / totalContacted) * 100) : 0;
    const overallClickRate = totalContacted > 0 ? Math.round((totalClicked / totalContacted) * 100) : 0;
    const overallResponseRate = totalContacted > 0 ? Math.round((totalResponded / totalContacted) * 100) : 0;
    const overallClaimRate = totalContacted > 0 ? Math.round((totalClaimed / totalContacted) * 100) : 0;
    const overallConversionRate = totalContacted > 0 ? Math.round((totalPaid / totalContacted) * 100) : 0;

    // ==================== FUNNEL STAGES ====================
    const stageCounts = new Array(FUNNEL_STAGES.length).fill(0);
    for (const p of prospects) {
      if (p.status === "dismissed" || p.status === "unsubscribed" || p.status === "pro-bono") continue;
      const stageIdx = STATUS_TO_STAGE[p.status] ?? 0;
      // Count prospect in their current stage AND all previous stages
      for (let i = 0; i <= stageIdx; i++) {
        stageCounts[i]++;
      }
    }

    const funnel: FunnelStageData[] = FUNNEL_STAGES.map((stage, i) => {
      const count = stageCounts[i];
      const prevCount = i > 0 ? stageCounts[i - 1] : count;
      const rate = totalProspects > 0 ? Math.round((count / totalProspects) * 100) : 0;
      const dropOff = prevCount - count;
      const dropOffRate = prevCount > 0 ? Math.round((dropOff / prevCount) * 100) : 0;
      return { stage, count, rate, dropOff, dropOffRate };
    });

    // ==================== BY CATEGORY ====================
    const categoryMap = new Map<string, Prospect[]>();
    for (const p of prospects) {
      const cat = p.category;
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(p);
    }

    const byCategory: CategoryBreakdown[] = Array.from(categoryMap.entries())
      .map(([category, catProspects]) => {
        const total = catProspects.length;
        const contacted = catProspects.filter((p) => contactedStatuses.includes(p.status)).length;
        const opened = catProspects.filter((p) => {
          if (p.email && openedEmails.has(p.email.toLowerCase())) return true;
          return ["engaged", "link_clicked", "responded", "interested", "claimed", "paid"].includes(p.status);
        }).length;
        const clicked = catProspects.filter((p) => {
          if (p.email && clickedEmails.has(p.email.toLowerCase())) return true;
          return ["link_clicked", "responded", "interested", "claimed", "paid"].includes(p.status);
        }).length;
        const responded = catProspects.filter((p) =>
          ["responded", "interested", "claimed", "paid"].includes(p.status)
        ).length;
        const claimed = catProspects.filter((p) => ["claimed", "paid"].includes(p.status)).length;
        const paid = catProspects.filter((p) => p.status === "paid").length;

        return {
          category,
          label: CATEGORY_CONFIG[category as Category]?.label || category,
          total,
          contacted,
          opened,
          clicked,
          responded,
          claimed,
          paid,
          openRate: contacted > 0 ? Math.round((opened / contacted) * 100) : 0,
          clickRate: contacted > 0 ? Math.round((clicked / contacted) * 100) : 0,
          responseRate: contacted > 0 ? Math.round((responded / contacted) * 100) : 0,
          claimRate: contacted > 0 ? Math.round((claimed / contacted) * 100) : 0,
          conversionRate: contacted > 0 ? Math.round((paid / contacted) * 100) : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    // ==================== BY DAY ====================
    // Group email events by day
    const dayMap = new Map<string, { sent: number; opened: number; clicked: number; responded: number; claimed: number; paid: number }>();

    // Use prospect creation dates for sent tracking
    for (const p of prospects) {
      if (!contactedStatuses.includes(p.status)) continue;
      const day = p.createdAt?.split("T")[0];
      if (!day) continue;
      if (!dayMap.has(day)) dayMap.set(day, { sent: 0, opened: 0, clicked: 0, responded: 0, claimed: 0, paid: 0 });
      dayMap.get(day)!.sent++;
    }

    // Overlay email events
    for (const event of emailEvents) {
      const day = event.timestamp?.split("T")[0];
      if (!day) continue;
      if (!dayMap.has(day)) dayMap.set(day, { sent: 0, opened: 0, clicked: 0, responded: 0, claimed: 0, paid: 0 });
      const d = dayMap.get(day)!;
      if (event.event_type === "delivered") d.sent++;
      else if (event.event_type === "open") d.opened++;
      else if (event.event_type === "click") d.clicked++;
    }

    // Add status-based events by updatedAt date
    for (const p of prospects) {
      const day = p.updatedAt?.split("T")[0];
      if (!day || !dayMap.has(day)) continue;
      const d = dayMap.get(day)!;
      if (["responded", "interested", "claimed", "paid"].includes(p.status)) d.responded++;
      if (["claimed", "paid"].includes(p.status)) d.claimed++;
      if (p.status === "paid") d.paid++;
    }

    const byDay: DailyMetric[] = Array.from(dayMap.entries())
      .map(([date, d]) => ({
        date,
        ...d,
        openRate: d.sent > 0 ? Math.round((d.opened / d.sent) * 100) : 0,
        clickRate: d.sent > 0 ? Math.round((d.clicked / d.sent) * 100) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    // ==================== TOP PERFORMING ====================
    const topPerformingCategories = byCategory
      .filter((c) => c.contacted >= 3) // Minimum sample size
      .sort((a, b) => b.conversionRate - a.conversionRate || b.responseRate - a.responseRate)
      .slice(0, 5)
      .map((c) => ({
        category: c.category,
        label: c.label,
        conversionRate: c.conversionRate,
        count: c.total,
      }));

    // ==================== BOTTLENECK ANALYSIS ====================
    const bottlenecks: Array<{ from: string; to: string; dropOffRate: number; suggestion: string }> = [];
    for (let i = 1; i < funnel.length; i++) {
      if (funnel[i].dropOffRate > 50 && funnel[i - 1].count > 5) {
        let suggestion = "";
        if (funnel[i].stage === "Engaged") {
          suggestion = "Low open rates. Try improving subject lines or send times.";
        } else if (funnel[i].stage === "Link Clicked") {
          suggestion = "People open but don't click. Make the CTA more compelling.";
        } else if (funnel[i].stage === "Responded") {
          suggestion = "Prospects click but don't respond. Consider adding a direct question or incentive.";
        } else if (funnel[i].stage === "Claimed") {
          suggestion = "Interested prospects aren't claiming. Simplify the claim process.";
        } else if (funnel[i].stage === "Paid") {
          suggestion = "Claims aren't converting to payment. Review pricing or add urgency.";
        } else {
          suggestion = "Significant drop-off detected. Review this stage of the funnel.";
        }

        bottlenecks.push({
          from: funnel[i - 1].stage,
          to: funnel[i].stage,
          dropOffRate: funnel[i].dropOffRate,
          suggestion,
        });
      }
    }

    const analytics: FunnelAnalytics = {
      overview: {
        totalProspects,
        totalContacted,
        totalOpened,
        totalClicked,
        totalResponded,
        totalClaimed,
        totalPaid,
        overallOpenRate,
        overallClickRate,
        overallResponseRate,
        overallClaimRate,
        overallConversionRate,
        revenue: totalPaid * 997,
      },
      funnel,
      byCategory,
      byDay,
      topPerformingCategories,
      bottlenecks,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("[Funnel Analytics] Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
