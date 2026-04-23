import { NextRequest, NextResponse } from "next/server";
import {
  getAutoScoutConfig,
  updateAutoScoutConfig,
  getCountiesDone,
  getCountiesForState,
  getTodayLeadCount,
  getTotalLeadCount,
  getLastRunResult,
  runAutoScout,
} from "@/lib/auto-scout";

export const maxDuration = 300; // 5 min for Vercel

/** GET — current status + progress */
export async function GET() {
  try {
    const config = await getAutoScoutConfig();
    const counties = getCountiesForState(config.state);
    const countiesDone = await getCountiesDone(config.state);
    const todayLeads = await getTodayLeadCount();
    const totalLeads = await getTotalLeadCount();
    const lastRunResult = await getLastRunResult();

    return NextResponse.json({
      config,
      progress: {
        countiesDone,
        countiesTotal: counties.length,
        todayLeads,
        totalLeads,
        lastRunResult,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

/** POST — trigger a manual run */
export async function POST() {
  try {
    const config = await getAutoScoutConfig();

    if (!config.enabled) {
      return NextResponse.json(
        {
          error: "Auto-scout is disabled. Enable it first via PATCH.",
          config,
        },
        { status: 400 },
      );
    }

    const result = await runAutoScout();

    return NextResponse.json({
      message: `Auto-scout completed: ${result.leadsFound} leads found`,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

/** PATCH — update config (toggle on/off, change state, change limit) */
export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const updates: Record<string, unknown> = {};
    if (typeof body.enabled === "boolean") updates.enabled = body.enabled;
    if (typeof body.state === "string") updates.state = body.state;
    if (typeof body.dailyLimit === "number") updates.dailyLimit = body.dailyLimit;
    if (typeof body.categoriesPerCounty === "number")
      updates.categoriesPerCounty = body.categoriesPerCounty;
    if (typeof body.prospectsPerCategory === "number")
      updates.prospectsPerCategory = body.prospectsPerCategory;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const config = await updateAutoScoutConfig(updates);

    return NextResponse.json({
      message: "Config updated",
      config,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
