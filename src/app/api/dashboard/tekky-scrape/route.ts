import { NextRequest, NextResponse } from "next/server";
import {
  getTekkyMarketSummary,
  listTekkyMarketLeads,
  scrapeTekkyMarket,
  type TekkyAudience,
} from "@/lib/tekky-scrape";

/**
 * /api/dashboard/tekky-scrape
 *
 * GET → market-level summary (counts per city/state/audience)
 *       Optional ?city=&state=&audience= → return raw lead list.
 * POST → run the scrape for one target. Body:
 *        { city, state, audience, perQueryLimit? }
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_AUDIENCES: TekkyAudience[] = ["parent", "coach", "player"];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city");
  const state = url.searchParams.get("state");
  const audience = url.searchParams.get("audience") as
    | TekkyAudience
    | null;

  if (city && state) {
    const aud = audience && VALID_AUDIENCES.includes(audience) ? audience : undefined;
    const leads = await listTekkyMarketLeads({ city, state, audience: aud });
    return NextResponse.json({ ok: true, leads });
  }
  const summary = await getTekkyMarketSummary();
  return NextResponse.json({ ok: true, summary });
}

export async function POST(req: NextRequest) {
  let body: { city?: string; state?: string; audience?: TekkyAudience; perQueryLimit?: number } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { city, state, audience, perQueryLimit } = body;
  if (!city || !state || !audience) {
    return NextResponse.json(
      { ok: false, error: "city, state, audience required" },
      { status: 400 },
    );
  }
  if (!VALID_AUDIENCES.includes(audience)) {
    return NextResponse.json(
      { ok: false, error: `audience must be one of ${VALID_AUDIENCES.join(", ")}` },
      { status: 400 },
    );
  }
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "GOOGLE_PLACES_API_KEY not set on this deploy." },
      { status: 500 },
    );
  }
  try {
    const result = await scrapeTekkyMarket({
      city,
      state,
      audience,
      perQueryLimit: typeof perQueryLimit === "number" ? perQueryLimit : 5,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
