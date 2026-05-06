import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/zenith-drill-of-week
 *
 * Weekly cron — fires the Drill of the Week broadcast to every active
 * coach lead for zenith-sports. Picks the drill by ISO week number
 * from the 26-drill rotation in src/data/zenith-drills.ts.
 *
 * Cadence: Tuesdays 9am Pacific (17:00 UTC) — coaches plan Wednesday
 * sessions on Tuesdays so they get the drill the day before they
 * decide what to run.
 *
 * Auth: gated by CRON_SECRET. Vercel Cron auto-attaches the header.
 *
 * Implementation: just forwards to the same endpoint the admin page
 * uses (POST /api/zenith/drill-of-week with audience=coach), which
 * keeps the picker logic + send logic in one place.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Vercel Cron sends the secret in the Authorization header.
  if (CRON_SECRET) {
    const auth = request.headers.get("authorization") || "";
    const expected = `Bearer ${CRON_SECRET}`;
    if (auth !== expected) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  // Hit our own send endpoint. Same-origin internal call — Vercel
  // resolves localhost during preview / per-deployment URL in prod.
  const origin =
    request.headers.get("x-forwarded-proto") &&
    request.headers.get("x-forwarded-host")
      ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
      : new URL(request.url).origin;

  try {
    const r = await fetch(`${origin}/api/zenith/drill-of-week`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ audience: "coach" }),
    });
    const j = (await r.json()) as {
      ok: boolean;
      sent?: number;
      errors?: number;
      drillName?: string;
      weekNum?: number;
      error?: string;
    };
    return NextResponse.json({
      cron: "zenith-drill-of-week",
      ...j,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        cron: "zenith-drill-of-week",
        error: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}
