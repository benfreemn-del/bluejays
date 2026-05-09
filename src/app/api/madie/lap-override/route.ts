import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/madie/lap-override
 * PUT /api/madie/lap-override · body { lap: 1-6 }
 *
 * Persistent override for Madie's current lap on the race track.
 * Stored in app_settings keyed `madie_current_lap`. The race-track
 * UI reads this on every render — when set, it OVERRIDES the
 * heuristic auto-detection from call volume.
 *
 * Use case: Laps 3-5 require Madie to demonstrate a skill (mock site
 * shipped, mock backend demo'd, customization done) that we don't
 * have an explicit log for. Ben hits "Graduate to Lap N" from the
 * admin view; this writes the override; Madie's view sees the new
 * lap on next refresh.
 *
 * Owner-only — protected by middleware (anything starting with
 * /api/madie is in PROTECTED_PATHS).
 */

const SETTING_KEY = "madie_current_lap";

export async function GET(_request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ lap: null });
  }

  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", SETTING_KEY)
      .maybeSingle();

    if (error) {
      console.error("[madie/lap-override GET] failed:", error);
      return NextResponse.json({ lap: null });
    }

    const lap =
      data?.value && typeof data.value === "object" && "lap" in data.value
        ? Number((data.value as { lap: number }).lap)
        : null;

    return NextResponse.json({
      lap: Number.isFinite(lap) && lap !== null ? lap : null,
    });
  } catch (err) {
    console.error("[madie/lap-override GET] failed:", err);
    return NextResponse.json({ lap: null });
  }
}

export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  let body: { lap?: number } = {};
  try {
    body = (await request.json()) as { lap?: number };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const lap = Number(body.lap);
  if (!Number.isInteger(lap) || lap < 1 || lap > 6) {
    return NextResponse.json(
      { error: "lap must be an integer 1-6" },
      { status: 400 },
    );
  }

  try {
    const { error } = await supabase.from("app_settings").upsert(
      {
        key: SETTING_KEY,
        value: { lap },
        updated_at: new Date().toISOString(),
        updated_by: "owner",
      },
      { onConflict: "key" },
    );

    if (error) {
      console.error("[madie/lap-override PUT] upsert failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, lap });
  } catch (err) {
    console.error("[madie/lap-override PUT] failed:", err);
    return NextResponse.json(
      { error: "Failed to update lap override" },
      { status: 500 },
    );
  }
}
