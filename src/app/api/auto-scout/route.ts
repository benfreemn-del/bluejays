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

/** GET — current status + progress, OR triggers a run when called by Vercel cron.
 *
 * NOTE — Vercel cron jobs invoke endpoints with a GET request, NOT POST.
 * When Authorization: Bearer <CRON_SECRET> is present, we treat the call
 * as a cron invocation and trigger a run via runAutoScout(). The run is
 * gated internally by config.enabled, so it's safe to leave on a cron
 * always — disabled config makes it a no-op.
 *
 * Without the bearer (dashboard fetch / manual GET), it stays read-only
 * and just returns status + progress.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isCronInvocation = cronSecret && authHeader === `Bearer ${cronSecret}`;

  // Cron path: trigger the run. runAutoScout() respects config.enabled internally.
  if (isCronInvocation) {
    try {
      console.log("[auto-scout] Cron invocation — running runAutoScout()");
      const result = await runAutoScout();
      return NextResponse.json({
        message: `Auto-scout cron completed: ${result.leadsFound} leads found (stopped: ${result.stoppedReason})`,
        result,
      });
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 },
      );
    }
  }

  // Read-only status path (dashboard fetch)
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
