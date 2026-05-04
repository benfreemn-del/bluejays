import { NextRequest, NextResponse } from "next/server";
import { runAllClientFunnels, runClientFunnel } from "@/lib/client-funnels/runner";

/**
 * POST /api/client-funnels/run
 *
 * Run the funnel engine. Idempotent — safe to fire on a cron OR manually
 * from the dashboard.
 *
 * Body (optional):
 *   { client: "zenith-sports" }   → run only this client
 *   {}                            → run every registered client
 *
 * Response: array of RunSummary { client_slug, enrolled, steps_sent,
 * steps_skipped, errors[] }.
 *
 * Cron config: hit hourly via Vercel Cron or external scheduler. Funnel
 * cadences are day-granular so once-per-hour gives leads room to flow
 * through their day_offsets without piling up at midnight.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Funnel sends can take a while when several leads are due in the same
// pass — bump from the 10s default.
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  // Either a logged-in dashboard session (cookie) OR a CRON_SECRET
  // bearer token. The middleware whitelists this path for cron access,
  // so we re-check auth here.
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  const cookie = req.cookies.get("bluejays-session")?.value;
  if (cookie) return true; // middleware would 401 if cookie was bad
  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let client: string | null = null;
  try {
    const body = await req.json();
    if (body && typeof body === "object" && typeof body.client === "string") {
      client = body.client;
    }
  } catch {
    // empty body is fine
  }

  try {
    const summaries = client
      ? [await runClientFunnel(client)]
      : await runAllClientFunnels();
    return NextResponse.json({ ok: true, summaries });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

// GET also runs the funnel — convenience for browser-triggered runs +
// cron services that only support GET.
export async function GET(req: NextRequest) {
  return POST(req);
}
