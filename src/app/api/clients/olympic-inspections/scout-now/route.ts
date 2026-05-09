import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { runPartnerScout } from "@/lib/oit-partner-scout";

/**
 * POST /api/clients/olympic-inspections/scout-now
 *
 * Owner-triggered manual partner scout. Runs the same engine as the
 * weekly cron (runPartnerScout) but on demand — Luke clicks "Scan
 * now" on the affiliates map and gets fresh candidates without
 * waiting for Monday.
 *
 * Auth: client-portal cookie scoped to slug=olympic-inspections.
 * Mirrors the BlueJays-internal /api/auto-scout POST pattern.
 *
 * Cost: ~$3/run (60 queries × $0.05). Idempotent — dedupes against
 * existing client_affiliates rows so re-running just adds NEW
 * candidates that have appeared since last run.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SLUG = "olympic-inspections";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  try {
    const result = await runPartnerScout(SLUG);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[oit/scout-now] failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
