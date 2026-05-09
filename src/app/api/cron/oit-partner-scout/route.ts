import { NextRequest, NextResponse } from "next/server";
import { runOitPartnerScout } from "@/lib/oit-partner-scout";

/**
 * GET /api/cron/oit-partner-scout
 *
 * Weekly Monday-morning Google Places sweep that finds new affiliate-
 * target candidates (realtors / property mgmt / mold remediation /
 * water damage) across the Olympic Peninsula and inserts them into
 * client_affiliates for OIT.
 *
 * The library handles heartbeat + agent_signal emission internally, so
 * any caller (cron, manual trigger, smoke test) emits identically.
 *
 * Idempotent. Cost ~$3/run. Schedule lives in vercel.json.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(_req: NextRequest) {
  try {
    const result = await runOitPartnerScout();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[oit-partner-scout] failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
