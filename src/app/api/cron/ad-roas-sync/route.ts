import { NextRequest, NextResponse } from "next/server";
import { syncAllAdRoas } from "@/lib/ad-roas-sync";
import { logHeartbeat } from "@/lib/cron-heartbeat";
import { emitSignal } from "@/lib/agent-signals";

/**
 * GET /api/cron/ad-roas-sync
 *
 * Nightly hydration of real ROAS data from Meta Marketing API + Google
 * Ads Reporting API into client_ad_creatives. Runs at 04:00 UTC (8pm
 * Pacific previous day) — late enough that yesterday's spend has
 * settled on both platforms.
 *
 * No-ops gracefully when:
 *   · No accounts have status='active' yet (pre-OAuth-provisioning)
 *   · OAuth env vars are missing (refresh fails per-account, marks
 *     expired, continues)
 *
 * Emits a `daily-digest` signal when 3+ accounts are sitting in
 * 'expired' status so Ben sees it in the morning brief instead of
 * silently drifting.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(_req: NextRequest) {
  try {
    const results = await syncAllAdRoas();
    const touched = results.reduce((s, r) => s + r.rowsTouched, 0);
    const unmatched = results.reduce((s, r) => s + r.unmatchedRows, 0);
    const failed = results.filter((r) => !r.ok);
    const expired = failed.filter((r) =>
      /UNAUTHORIZED|expired|refresh|no access_token/i.test(r.error || ""),
    );

    if (expired.length >= 3) {
      await emitSignal({
        source: "ad-roas-sync",
        kind: "auth-drift",
        severity: "urgent",
        title: `${expired.length} ad accounts need re-authorization`,
        detail: expired
          .map((r) => `${r.clientSlug}/${r.platform}: ${r.error}`)
          .join("; ")
          .slice(0, 500),
        target: "daily-digest",
        metadata: {
          expired: expired.length,
          total: results.length,
        },
      });
    }

    await logHeartbeat("ad_roas_sync", {
      accounts: results.length,
      touched,
      unmatched,
      failed: failed.length,
      expired: expired.length,
    });

    return NextResponse.json({
      ok: true,
      accounts: results.length,
      touched,
      unmatched,
      failed: failed.length,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ad-roas-sync] failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
