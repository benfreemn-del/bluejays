import { NextRequest, NextResponse } from "next/server";
import {
  adsToCsv,
  getCreativeSeeds,
  listClientAdCreatives,
  seedClientAdCreatives,
} from "@/lib/client-ads";

/**
 * GET  /api/client-ads?client=zenith-sports[&csv=meta|google]
 *      List creatives, optionally render as a CSV upload to Meta/Google.
 *
 * POST /api/client-ads?client=zenith-sports&action=seed
 *      Sync the in-code seed library to client_ad_creatives. Idempotent —
 *      existing variants update, new ones insert. Returns counts.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "client param required" },
      { status: 400 },
    );
  }
  try {
    const rows = await listClientAdCreatives(client);
    const csv = searchParams.get("csv");
    if (csv === "meta" || csv === "google") {
      const body = adsToCsv(rows, csv);
      return new NextResponse(body, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${client}-${csv}-ads.csv"`,
        },
      });
    }
    return NextResponse.json({ ok: true, creatives: rows });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  const action = searchParams.get("action");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "client param required" },
      { status: 400 },
    );
  }
  if (action !== "seed") {
    return NextResponse.json(
      { ok: false, error: "unknown action" },
      { status: 400 },
    );
  }
  try {
    const seeds = getCreativeSeeds(client);
    if (seeds.length === 0) {
      return NextResponse.json(
        { ok: false, error: `No seed library for client_slug=${client}` },
        { status: 400 },
      );
    }
    const result = await seedClientAdCreatives(client, seeds);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
