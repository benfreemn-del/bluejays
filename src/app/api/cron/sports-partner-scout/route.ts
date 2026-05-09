import { NextRequest, NextResponse } from "next/server";
import { runPartnerScout } from "@/lib/oit-partner-scout";
import { emitSignal } from "@/lib/agent-signals";

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
 * tenant. Different cron schedules so the rate limits + cost tracking
 * stay readable per tenant.
 *
 * Currently scoped to `zenith-sports`. New sports tenants register
 * their config in service-clients.ts and either share this cron or
 * fork their own.
 *
 * Cost ~$5/run (24 cities × 5 queries × ~$0.04). Idempotent.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(_req: NextRequest) {
  try {
    const result = await runPartnerScout("zenith-sports");

    if (result.inserted > 0) {
      await emitSignal({
        source: "sports-partner-scout",
        kind: "new-affiliates",
        severity: "notice",
        clientSlug: "zenith-sports",
        title: `${result.inserted} new soccer-program partner candidate${result.inserted === 1 ? "" : "s"}`,
        detail: `Scanned ${result.scanned}, ${result.duplicates} dupes. New clubs / academies / leagues across MLS metros.`,
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
    console.error("[sports-partner-scout] failed:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
