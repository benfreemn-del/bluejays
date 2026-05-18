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
import {
  launchSkeleton,
  launchAds,
  getLaunchStatus,
  resetLaunch,
} from "@/lib/meta-ads-launch";
import { WAVES } from "@/lib/ads-spec/wave-1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Phase 2 polls video processing up to 5min per video (4 videos at most
// in wave-1), so 800s is the worst-case ceiling. Vercel Pro caps at 900.
export const maxDuration = 800;

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

  let body: {
    wave?: string;
    phase?: "skeleton" | "ads" | "reset" | "all";
  };
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

  // Default phase = "all" — runs skeleton then auto-flows into ads
  // when skeleton succeeds. Matches the CLI default so a single
  // `bj meta launch wave-1` invocation drives the full pipeline.
  const phase = body.phase || "all";

  if (phase === "skeleton") {
    try {
      const result = await launchSkeleton(spec);
      return NextResponse.json({ phase: "skeleton", ...result });
    } catch (err) {
      const msg =
        err instanceof Error
          ? `${err.message}${err.stack ? `\n  at ${(err.stack.split("\n")[1] || "").trim()}` : ""}`
          : typeof err === "string"
          ? err
          : (() => {
              try {
                return JSON.stringify(err);
              } catch {
                return String(err);
              }
            })();
      console.error("[meta/launch] caught:", err);
      return NextResponse.json(
        { ok: false, phase: "skeleton", error: msg },
        { status: 200 },
      );
    }
  }

  if (phase === "ads") {
    try {
      const result = await launchAds(spec);
      return NextResponse.json({ phase: "ads", ...result });
    } catch (err) {
      const msg =
        err instanceof Error
          ? `${err.message}${err.stack ? `\n  at ${(err.stack.split("\n")[1] || "").trim()}` : ""}`
          : typeof err === "string"
          ? err
          : (() => {
              try {
                return JSON.stringify(err);
              } catch {
                return String(err);
              }
            })();
      console.error("[meta/launch] caught:", err);
      return NextResponse.json(
        { ok: false, phase: "ads", error: msg },
        { status: 200 },
      );
    }
  }

  if (phase === "all") {
    let skeleton: Awaited<ReturnType<typeof launchSkeleton>>;
    try {
      skeleton = await launchSkeleton(spec);
    } catch (err) {
      const msg =
        err instanceof Error
          ? `${err.message}${err.stack ? `\n  at ${(err.stack.split("\n")[1] || "").trim()}` : ""}`
          : typeof err === "string"
          ? err
          : (() => {
              try {
                return JSON.stringify(err);
              } catch {
                return String(err);
              }
            })();
      console.error("[meta/launch] caught:", err);
      return NextResponse.json(
        { ok: false, phase: "all", skeleton_error: msg },
        { status: 200 },
      );
    }
    if (!skeleton.ok) {
      // Don't proceed to Phase 2 if Phase 1 has unresolved errors —
      // ads can't attach to ad sets that weren't created.
      return NextResponse.json({
        phase: "all",
        skeleton,
        ads: null,
        ok: false,
        error: "Phase 1 had errors — skipping Phase 2. Resolve and re-run.",
      });
    }
    let ads: Awaited<ReturnType<typeof launchAds>> | null = null;
    let adsError: string | undefined;
    try {
      ads = await launchAds(spec);
    } catch (err) {
      adsError = err instanceof Error ? err.message : String(err);
    }
    return NextResponse.json({
      phase: "all",
      skeleton,
      ads,
      ok: !!(ads && ads.ok),
      error: adsError,
    });
  }

  // The "reset" pseudo-phase deletes the campaign + clears the row.
  // After running this, the next `bj meta launch <wave>` starts
  // from a clean slate.
  if (phase === "reset") {
    const result = await resetLaunch(waveName);
    return NextResponse.json({ phase: "reset", ...result });
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
