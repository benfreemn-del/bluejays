/**
 * POST /api/meta/launch
 *
 * Triggers a `bj meta launch` run. Body: { wave: string, phase?: "skeleton" | "ads" }
 *
 * Phase 1 ("skeleton") — implemented tonight. Creates the campaign +
 * 3 ad sets in PAUSED state. Idempotent — re-running reads
 * meta_launches and skips already-created resources.
 *
 * Phase 2 ("ads") — placeholder. Lands after HyperAgent images are
 * dropped in /public/ad-assets/wave-1/.
 *
 * Auth: same shared isValidBearer helper as the other agent-facing
 * routes (CRON_SECRET / ADMIN_PASSWORD_BEN / ADMIN_PASSWORD).
 * Listed under /api/meta/ in PUBLIC_API_PATHS already.
 *
 * Returns 200 on success OR partial-success (some ad sets created,
 * others failed); the body's `ok` + `errors` carry the detail.
 * Returns 4xx only for auth / input-shape failures.
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidBearer, describeBearerEnv } from "@/lib/admin-auth";
import { launchSkeleton, getLaunchStatus } from "@/lib/meta-ads-launch";
import { WAVES } from "@/lib/ads-spec/wave-1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120; // Meta API + Supabase round-trips for 3 ad sets

export async function POST(request: NextRequest) {
  if (!isValidBearer(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing or invalid bearer token",
        env_check: describeBearerEnv(),
      },
      { status: 401 },
    );
  }

  let body: { wave?: string; phase?: "skeleton" | "ads" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid JSON body" },
      { status: 400 },
    );
  }

  const waveName = (body.wave || "").trim();
  if (!waveName) {
    return NextResponse.json(
      {
        ok: false,
        error: "missing required field: wave",
        available_waves: Object.keys(WAVES),
      },
      { status: 400 },
    );
  }
  const spec = WAVES[waveName];
  if (!spec) {
    return NextResponse.json(
      {
        ok: false,
        error: `unknown wave: ${waveName}`,
        available_waves: Object.keys(WAVES),
      },
      { status: 400 },
    );
  }

  const phase = body.phase || "skeleton";

  if (phase === "skeleton") {
    try {
      const result = await launchSkeleton(spec);
      return NextResponse.json({ phase: "skeleton", ...result });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { ok: false, phase: "skeleton", error: msg },
        { status: 200 },
      );
    }
  }

  if (phase === "ads") {
    return NextResponse.json({
      ok: false,
      phase: "ads",
      error:
        "Phase 2 (ads + creatives + image upload) not implemented yet. Lands after HyperAgent images are in /public/ad-assets/wave-1/.",
    });
  }

  return NextResponse.json(
    { ok: false, error: `unknown phase: ${phase}` },
    { status: 400 },
  );
}

/**
 * GET /api/meta/launch?wave=wave-1 — read the current meta_launches
 * row for a wave. Used by the CLI's `bj meta launch <wave> --status`.
 */
export async function GET(request: NextRequest) {
  if (!isValidBearer(request)) {
    return NextResponse.json(
      { ok: false, error: "missing or invalid bearer token" },
      { status: 401 },
    );
  }
  const wave = request.nextUrl.searchParams.get("wave");
  if (!wave) {
    return NextResponse.json(
      { ok: false, error: "missing ?wave param" },
      { status: 400 },
    );
  }
  const row = await getLaunchStatus(wave);
  return NextResponse.json({ ok: true, wave, row });
}
