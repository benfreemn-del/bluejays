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
 * Auth + cost-leak defense: response is cached in-memory for
 * CACHE_TTL_MS (60 sec) so spam-hitting the public endpoint at 100K
 * req/day doesn't trigger 100K Anthropic + Stripe + everything-else
 * pings (each costs ~$0.00003 + rate-limit-quota). A bearer
 * `CRON_SECRET` bypass lets the watchdog force-refresh on demand.
 *
 * Response body has no PII or secrets — just vendor names + ok/fail/
 * skipped + latency.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 10 vendors × 5s timeout = 50s worst case

const CACHE_TTL_MS = 60 * 1000;

let cachedAt = 0;
let cachedResult: Awaited<ReturnType<typeof runAllHealthChecks>> | null = null;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const forceFresh = cronSecret && auth === `Bearer ${cronSecret}`;

  const now = Date.now();
  if (!forceFresh && cachedResult && now - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      ...cachedResult,
      cached: true,
      cachedAgeMs: now - cachedAt,
    });
  }

  const result = await runAllHealthChecks();
  cachedResult = result;
  cachedAt = now;
  return NextResponse.json({ ...result, cached: false });
}
