import { NextRequest, NextResponse } from "next/server";
import { drainDueRetries } from "@/lib/email-retry-queue";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Wave-2 LTV protection — failed-email retry drain.
 *
 * Queue is populated by:
 *   - Stripe webhook welcome-email send failures
 *   - Stripe webhook payment-failed dunning email failures
 *   - check-upcoming-renewals cron 30-day / 7-day email failures
 *
 * Drain logic in `src/lib/email-retry-queue.ts`. Retries up to 3 times
 * with exponential backoff (1h → 4h → 24h). After 3 failures, marks
 * the row `failed` and sends Ben an SMS so he can intervene manually.
 *
 * Mock-mode policy: when Supabase isn't configured, the cron returns
 * `{ mockMode: true }` and no-ops — no crash.
 *
 * Schedule: `0 17 * * *` (17:00 UTC = 9am PT, after the renewal-check
 * cron at 16:00 UTC) per CLAUDE.md outbound marketing window.
 */

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const userAgent = request.headers.get("user-agent") || "";
    if (!userAgent.toLowerCase().includes("vercel")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    console.log("[Billing] retry-failed-sends: Supabase not configured — no-op");
    return NextResponse.json({ ok: true, mockMode: true });
  }

  try {
    const summary = await drainDueRetries();
    console.log(
      `[Billing] Retry drain: attempted=${summary.attempted} ` +
        `succeeded=${summary.succeeded} failed=${summary.failed} ` +
        `exhausted=${summary.exhausted}`,
    );
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error("[Billing] retry-failed-sends drain crashed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
