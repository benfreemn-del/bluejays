import { NextRequest, NextResponse } from "next/server";
import {
  getSmartQueries,
  checkDuplicate,
  checkWebsiteQuality,
  calculateScoutingScore,
  getScoutingStats,
  SMART_QUERIES,
} from "@/lib/scout-optimizer";
import type { Category } from "@/lib/types";

/**
 * GET /api/scout-optimizer
 *
 * Returns scouting optimization stats and available smart queries.
 */
export async function GET() {
  try {
    const stats = await getScoutingStats();
    return NextResponse.json({
      ...stats,
      smartQueries: Object.fromEntries(
        Object.entries(SMART_QUERIES).map(([k, v]) => [k, v.length])
      ),
    });
  } catch (error) {
    console.error("[Scout Optimizer] Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

/**
 * POST /api/scout-optimizer
 *
 * Actions:
 * - { action: "smart-queries", category }  — Get smart search queries for a category
 * - { action: "check-duplicate", businessName, phone?, address? } — Check if business exists
 * - { action: "check-website", url } — Check website quality
 * - { action: "score-prospect", prospect } — Calculate scouting quality score
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "smart-queries": {
        const { category, maxQueries } = body;
        if (!category) {
          return NextResponse.json({ error: "category is required" }, { status: 400 });
        }
        const queries = getSmartQueries(category as Category, maxQueries || 3);
        return NextResponse.json({ category, queries });
      }

      case "check-duplicate": {
        const { businessName, phone, address } = body;
        if (!businessName) {
          return NextResponse.json({ error: "businessName is required" }, { status: 400 });
        }
        const result = await checkDuplicate(businessName, phone, address);
        return NextResponse.json(result);
      }

      case "check-website": {
        const { url } = body;
        if (!url) {
          return NextResponse.json({ error: "url is required" }, { status: 400 });
        }
        const quality = await checkWebsiteQuality(url);
        return NextResponse.json(quality);
      }

      case "score-prospect": {
        const { prospect } = body;
        if (!prospect) {
          return NextResponse.json({ error: "prospect is required" }, { status: 400 });
        }
        let websiteQuality;
        if (prospect.currentWebsite) {
          websiteQuality = await checkWebsiteQuality(prospect.currentWebsite);
        }
        const score = calculateScoutingScore(prospect, websiteQuality);
        return NextResponse.json({ score, websiteQuality });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Scout Optimizer] Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
