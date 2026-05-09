import { NextRequest, NextResponse } from "next/server";
import { runPartnerScout } from "@/lib/oit-partner-scout";

/**
 * GET /api/cron/sports-partner-scout
 *
 * Weekly Tuesday-morning Google Places sweep that finds new partner-
 * target candidates for sports tenants — youth soccer clubs, training
 * academies, TopSoccer chapters, coaching certification orgs across
 * MLS / NWSL host metros.
 *
 * Same engine as oit-partner-scout — both call into runPartnerScout()
 * which reads cities + queries from the service-clients registry per
 * tenant. The library emits the daily-digest signal internally.
 *
 * Cost ~$5/run (24 cities × 5 queries × ~$0.04). Idempotent.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(_req: NextRequest) {
  try {
    const result = await runPartnerScout("zenith-sports");
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sports-partner-scout] failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
