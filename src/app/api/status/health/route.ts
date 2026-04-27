import { NextRequest, NextResponse } from "next/server";
import { runAllHealthChecks } from "@/lib/health-checks";

/**
 * GET /api/status/health
 *
 * Aggregate vendor health check (Hormozi review item #4). Pings every
 * external dependency we rely on (Stripe, SendGrid, Anthropic, OpenAI,
 * Twilio, Lob, Namecheap, Meta Ads, Google Ads, Supabase) and returns
 * per-vendor status.
 *
 * Used by:
 *   - Watchdog cron (daily) — fires SMS to Ben when any vendor is failing
 *   - Operator dashboard — quick at-a-glance "is anything broken?" view
 *   - Manual debugging — `curl /api/status/health` from anywhere
 *
 * Auth: Bearer CRON_SECRET when called from cron, OR same-origin
 * admin cookie when called from the dashboard. Public to GET because
 * status pages are conventionally public — but no PII or secrets in
 * the response (just vendor names + ok/fail/skipped + latency).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 10 vendors × 5s timeout = 50s worst case

export async function GET(_req: NextRequest) {
  const result = await runAllHealthChecks();
  return NextResponse.json(result);
}
