import { NextRequest, NextResponse } from "next/server";
import { getWarmingStatus, getWarmingConfig, updateWarmingConfig } from "@/lib/domain-warming";

/** GET — current warming status */
export async function GET() {
  try {
    const status = await getWarmingStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

/**
 * PATCH — update warming config for a specific domain.
 * Body: { domain?: string, enabled?, maxDailyLimit?, startDate?, backupDomain?, useBackup? }
 * If `domain` is omitted, updates the primary (bluejayportfolio.com).
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const target = typeof body.domain === "string" && body.domain ? body.domain : undefined;
    const updates: Record<string, unknown> = {};

    if (typeof body.enabled === "boolean") updates.enabled = body.enabled;
    if (typeof body.backupDomain === "string") updates.backupDomain = body.backupDomain;
    if (typeof body.useBackup === "boolean") updates.useBackup = body.useBackup;
    if (typeof body.maxDailyLimit === "number") updates.maxDailyLimit = body.maxDailyLimit;
    if (typeof body.startDate === "string") updates.startDate = body.startDate;

    const config = await updateWarmingConfig(updates, target);
    return NextResponse.json({ message: "Warming config updated", config });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

/**
 * POST — start warming for a domain.
 * Body: { domain?: string }  (defaults to primary)
 * Sets enabled=true, startDate=now, sentToday=0, currentDailyLimit=10.
 */
export async function POST(request: NextRequest) {
  try {
    let domain: string | undefined;
    try {
      const body = await request.json();
      domain = typeof body?.domain === "string" ? body.domain : undefined;
    } catch {
      // Empty body is fine — defaults to primary
    }

    const config = await updateWarmingConfig({
      enabled: true,
      startDate: new Date().toISOString(),
      sentToday: 0,
      currentDailyLimit: 10,
      lastResetDate: new Date().toISOString().split("T")[0],
    }, domain);
    return NextResponse.json({
      message: `Domain warming started for ${config.domain}`,
      config,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
