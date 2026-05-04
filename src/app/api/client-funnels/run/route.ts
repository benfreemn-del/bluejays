import { NextRequest, NextResponse } from "next/server";
import { runAllClientFunnels, runClientFunnel } from "@/lib/client-funnels/runner";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

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

  // Identify the trigger so we can attribute manual vs cron runs in
  // the observability log.
  const triggeredBy = req.headers
    .get("authorization")
    ?.startsWith("Bearer ")
    ? "cron"
    : req.cookies.get("bluejays-session")
      ? "manual"
      : "api";

  try {
    const startedAt = Date.now();
    const summaries = client
      ? [await runClientFunnel(client)]
      : await runAllClientFunnels();
    const duration = Date.now() - startedAt;

    // Persist run results — best-effort; never fail the response if
    // logging fails. Lets the dashboard show "last cron at HH:MM,
    // sent N steps, no errors" without log diving.
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabase();
        const rows = summaries.map((s) => ({
          client_slug: s.client_slug,
          enrolled: s.enrolled,
          steps_sent: s.steps_sent,
          steps_skipped: s.steps_skipped,
          errors_count: s.errors.length,
          errors: s.errors,
          triggered_by: triggeredBy,
          duration_ms: Math.round(duration / Math.max(summaries.length, 1)),
        }));
        await sb.from("client_funnel_runs").insert(rows);
      } catch (err) {
        console.error("[client-funnels/run] log insert failed:", err);
      }
    }

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
