import { NextRequest, NextResponse } from "next/server";
import { runOitPartnerScout } from "@/lib/oit-partner-scout";
import { emitSignal } from "@/lib/agent-signals";

/**
 * GET /api/cron/oit-partner-scout
 *
 * Weekly Monday-morning Google Places sweep that finds new affiliate-
 * target candidates (realtors / property mgmt / mold remediation /
 * water damage) across the Olympic Peninsula and inserts them into
 * client_affiliates for OIT.
 *
 * Idempotent. Cost ~$3/run. Vercel cron schedule in vercel.json.
 *
 * Emits an agent_signals row when new candidates land so the daily
 * digest can surface them in Luke's morning brief.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(_req: NextRequest) {
  try {
    const result = await runOitPartnerScout();

    // Surface new candidates in the daily digest if any landed.
    if (result.inserted > 0) {
      await emitSignal({
        source: "oit-partner-scout",
        kind: "new-affiliates",
        severity: "notice",
        clientSlug: "olympic-inspections",
        title: `${result.inserted} new partner candidate${result.inserted === 1 ? "" : "s"} on the Olympic Peninsula`,
        detail: `Scanned ${result.scanned} businesses, ${result.duplicates} dupes. Open the Affiliates Map.`,
        target: "daily-digest",
        metadata: {
          inserted: result.inserted,
          scanned: result.scanned,
          duplicates: result.duplicates,
        },
      });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[oit-partner-scout] failed:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
