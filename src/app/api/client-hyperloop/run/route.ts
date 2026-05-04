import { NextRequest, NextResponse } from "next/server";
import { runClientHyperloop } from "@/lib/client-hyperloop";

/**
 * POST /api/client-hyperloop/run
 *
 * Body: { client: "zenith-sports" }
 *
 * Triggered manually from the Insights dashboard OR by the daily cron.
 * The runner reads the client's Hyperloop subscription tier and self-
 * gates: no subscription = no-op (returns mode="none" + empty insights).
 *
 * GET also runs (convenience for browser-triggered runs + cron services
 * that only support GET).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  if (req.cookies.get("bluejays-session")?.value) return true;
  if (req.cookies.get("bluejays_auth")?.value) return true;
  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const triggeredBy = req.headers.get("authorization")?.startsWith("Bearer ")
    ? "cron"
    : "manual";

  let client: string | null = null;
  try {
    const body = await req.json();
    if (body && typeof body.client === "string") client = body.client;
  } catch {
    // empty body OK
  }
  const { searchParams } = new URL(req.url);
  client = client || searchParams.get("client");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "client param required" },
      { status: 400 },
    );
  }

  try {
    const result = await runClientHyperloop({
      clientSlug: client,
      triggeredBy,
    });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
