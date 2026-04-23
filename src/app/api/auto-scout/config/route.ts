import { NextRequest, NextResponse } from "next/server";
import {
  getAutoScoutConfig,
  updateAutoScoutConfig,
} from "@/lib/auto-scout";

/** GET — return current config */
export async function GET() {
  try {
    const config = await getAutoScoutConfig();
    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

/** PATCH — update config fields */
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
