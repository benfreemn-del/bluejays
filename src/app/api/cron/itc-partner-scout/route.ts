import { NextRequest, NextResponse } from "next/server";
import { runPartnerScout } from "@/lib/oit-partner-scout";

/**
 * GET /api/cron/itc-partner-scout
 *
 * Weekly Wednesday-morning Google Places sweep for ITC Quick Attach
 * — manufacturer-tier scout pulling tractor dealers / forestry coops /
 * extension offices / hunting suppliers / firearm dealers / implement-
 * fabricator peers across the rural NE + Midwest cities where TYM /
 * Kioti / Mahindra / Branson dealer concentration is highest.
 *
 * Same engine as oit-partner-scout + sports-partner-scout — calls
 * runPartnerScout() which reads cities + queries from service-clients.ts.
 * SCOUT_SIGNAL_COPY in the lib emits a daily-digest signal when new
 * candidates land.
 *
 * Cost ~$3-4/run (10 queries × 12 cities × $0.05). Idempotent — dedupes
 * against existing client_affiliates rows so re-runs only insert new
 * candidates.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(_req: NextRequest) {
  try {
    const result = await runPartnerScout("itc-quick-attach");
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[itc-partner-scout] failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
