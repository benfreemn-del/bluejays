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

/** PATCH — update warming config (enable/disable, set domains, etc.) */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.enabled === "boolean") updates.enabled = body.enabled;
    if (typeof body.domain === "string") updates.domain = body.domain;
    if (typeof body.backupDomain === "string") updates.backupDomain = body.backupDomain;
    if (typeof body.useBackup === "boolean") updates.useBackup = body.useBackup;
    if (typeof body.maxDailyLimit === "number") updates.maxDailyLimit = body.maxDailyLimit;
    if (typeof body.startDate === "string") updates.startDate = body.startDate;

    const config = await updateWarmingConfig(updates);
    return NextResponse.json({ message: "Warming config updated", config });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

/** POST — start warming (sets enabled=true, startDate=now) */
export async function POST() {
  try {
    const config = await updateWarmingConfig({
      enabled: true,
      startDate: new Date().toISOString(),
      sentToday: 0,
      currentDailyLimit: 10,
      lastResetDate: new Date().toISOString().split("T")[0],
    });
    return NextResponse.json({ message: "Domain warming started", config });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
