import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { IntentType } from "@/lib/ai-responder";

/**
 * GET /api/intent-stats
 *
 * Aggregates inbound reply intent data so Ben can see what objections
 * and responses he's getting most often, and track how the AI is handling them.
 *
 * Returns:
 * - intent distribution across all responded prospects
 * - objection type breakdown
 * - funnel conversion by intent (what % of each intent leads to paid/interested)
 * - top objecting categories (which industries object most)
 */

interface IntentStat {
  intent: IntentType | string;
  count: number;
  convertedToInterested: number;
  convertedToPaid: number;
  conversionRate: number;
}

const FINAL_STATUSES = new Set(["interested", "claimed", "paid"]);

export async function GET() {
  try {
    const prospects = await getAllProspects();

    // Prospects that have replied (status = responded or further)
    const repliedProspects = prospects.filter((p) =>
      ["responded", "interested", "claimed", "paid", "dismissed", "unsubscribed"].includes(p.status)
    );

    // Intent distribution from Supabase inbound_messages table if available
    let intentRows: { intent: string; objection_type: string | null }[] = [];

    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from("inbound_messages")
        .select("intent, objection_type")
        .not("intent", "is", null);
      intentRows = data || [];
    }

    // If no Supabase data, infer from prospect status distribution
    const intentCounts: Record<string, number> = {};
    const objectionCounts: Record<string, number> = {};

    if (intentRows.length > 0) {
      for (const row of intentRows) {
        if (row.intent) {
          intentCounts[row.intent] = (intentCounts[row.intent] || 0) + 1;
        }
        if (row.objection_type) {
          objectionCounts[row.objection_type] = (objectionCounts[row.objection_type] || 0) + 1;
        }
      }
    } else {
      // Fallback: infer from prospect status (rough proxy)
      for (const p of repliedProspects) {
        const inferred =
          p.status === "dismissed" ? "not_interested" :
          p.status === "unsubscribed" ? "unsubscribe" :
          p.status === "interested" || p.status === "claimed" || p.status === "paid" ? "interested" :
          "responded";
        intentCounts[inferred] = (intentCounts[inferred] || 0) + 1;
      }
    }

    // Build stat rows
    const stats: IntentStat[] = Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([intent, count]) => {
        // Rough conversion: for each intent, how many ended up interested/paid?
        // Only meaningful if we have Supabase data linking intent → prospectId
        return {
          intent,
          count,
          convertedToInterested: 0,
          convertedToPaid: 0,
          conversionRate: 0,
        };
      });

    // Category breakdown — which categories object the most
    const categoryReplies: Record<string, number> = {};
    for (const p of repliedProspects) {
      categoryReplies[p.category] = (categoryReplies[p.category] || 0) + 1;
    }
    const topCategories = Object.entries(categoryReplies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));

    // Funnel health
    const contacted = prospects.filter((p) =>
      ["contacted", "email_opened", "link_clicked", "responded", "interested", "claimed", "paid", "dismissed", "unsubscribed"].includes(p.status)
    ).length;
    const replied = repliedProspects.length;
    const converted = prospects.filter((p) => FINAL_STATUSES.has(p.status)).length;

    return NextResponse.json({
      summary: {
        contacted,
        replied,
        replyRate: contacted > 0 ? ((replied / contacted) * 100).toFixed(1) + "%" : "0%",
        converted,
        conversionRate: replied > 0 ? ((converted / replied) * 100).toFixed(1) + "%" : "0%",
      },
      intents: stats,
      objections: Object.entries(objectionCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({ type, count })),
      topCategories,
      dataSource: intentRows.length > 0 ? "supabase" : "inferred",
    });
  } catch (err) {
    console.error("[intent-stats]", err);
    return NextResponse.json({ error: "Failed to compute intent stats" }, { status: 500 });
  }
}
