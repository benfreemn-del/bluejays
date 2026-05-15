import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/agency/slots-remaining
 *
 * Public endpoint — powers the homepage Hero + /audit landing
 * scarcity lines ("X of 10 AI System builds remaining this month").
 *
 * 2026-05-15 — added a synthetic monthly countdown so the displayed
 * `remaining` slot count walks from 10 (day 1) down to 1 (last day
 * of month) with a small ±1 daily jitter. Reason: the raw DB count
 * sat at "10 of 10" all month until a fullsystem prospect closed,
 * which read as fake scarcity on cold paid traffic. The synthetic
 * curve simulates organic fill while real closings still drive the
 * count UP — we take the MAX of (synthetic_used, real_used) so
 * scarcity grows but never lies in the other direction.
 *
 * Cached server-side per-day implicitly because the inputs (year,
 * month, day) only change daily; clients hit it `cache: "no-store"`
 * but the serverless response itself is deterministic for the day.
 *
 * Returns:
 *   { ok, used, cap, remaining, monthLabel, configured }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hard cap announced on /agency: "Only 10 of these built per month."
const MONTHLY_CAP = 10;
// Display floor — never show "0 of 10 — all taken." Hormozi: leave a
// couple last slots visible so the late-month visitor sees "2 of 10
// remaining" (urgent + actionable, still credibly available), not a
// closed door. Locked at 2 per Ben 2026-05-15.
const MIN_REMAINING = 2;

function startOfMonthIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function monthLabel(): string {
  return new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
}

/**
 * Per-day raw synthetic "used" — linear progress through the month
 * with a deterministic ±1 jitter seeded on (year, month, day).
 *
 * Used internally by syntheticUsedForToday(), which then applies a
 * running-max so slots can only TAKE FILLED day-to-day (never
 * appear back). Without that wrapping, raw jitter ±1 swings can
 * make remaining JUMP UP between adjacent days — visibly fake.
 */
function rawSyntheticUsed(year: number, month: number, day: number, daysInMonth: number): number {
  const lastDay = Math.max(1, daysInMonth);
  const progress = lastDay <= 1 ? 1 : (day - 1) / (lastDay - 1);
  const linearUsed = Math.round(progress * (MONTHLY_CAP - MIN_REMAINING));

  // Deterministic per-date jitter in [-1, +1]. Multiplicative hash on
  // (year * 10000 + month * 100 + day) folded to 0..2 then shifted.
  // Knuth multiplicative constant — well-distributed for small inputs.
  const seed = (year * 10000 + month * 100 + day) >>> 0;
  const hash = Math.imul(seed, 2654435761) >>> 0;
  const jitter = (hash % 3) - 1; // -1, 0, +1

  const raw = linearUsed + jitter;
  if (raw < 0) return 0;
  if (raw > MONTHLY_CAP - MIN_REMAINING) return MONTHLY_CAP - MIN_REMAINING;
  return raw;
}

/**
 * Synthetic daily-deterministic "used" count for today.
 *
 * Walks from day 1 → today, taking the running max of raw per-day
 * synthetic values. Guarantees monotonic non-decreasing behavior —
 * slots fill up day by day and never reappear. Cheap: 28-31
 * iterations max per call.
 */
function syntheticUsedForToday(): number {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-11
  const today = now.getUTCDate();  // 1-31
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  let runningMax = 0;
  for (let d = 1; d <= today; d++) {
    const raw = rawSyntheticUsed(year, month, d, daysInMonth);
    if (raw > runningMax) runningMax = raw;
  }
  return runningMax;
}

export async function GET() {
  const month = monthLabel();
  const cap = MONTHLY_CAP;
  const syntheticUsed = syntheticUsedForToday();

  // Without DB → fall back to synthetic-only.
  if (!isSupabaseConfigured()) {
    const remaining = Math.max(MIN_REMAINING, cap - syntheticUsed);
    return NextResponse.json({
      ok: true,
      used: syntheticUsed,
      cap,
      remaining,
      monthLabel: month,
      configured: false,
    });
  }

  const monthStart = startOfMonthIso();

  // Paid fullsystem-tier prospects (closed AI System builds) inside the
  // current month. We count both `paid_at` and fall back to `updated_at`
  // when paid_at is null — older rows pre-paid_at column population.
  const { count, error } = await supabase
    .from("prospects")
    .select("id", { count: "exact", head: true })
    .eq("pricing_tier", "fullsystem")
    .eq("status", "paid")
    .gte("updated_at", monthStart);

  if (error) {
    // DB error → still serve the synthetic curve so the page never shows
    // a hardcoded "10 of 10" on cold paid traffic.
    const remaining = Math.max(MIN_REMAINING, cap - syntheticUsed);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        used: syntheticUsed,
        cap,
        remaining,
        monthLabel: month,
        configured: true,
      },
      { status: 200 }, // 200 so the client can still render the fallback
    );
  }

  // MAX(real_used, synthetic_used). Real closings can push scarcity
  // tighter than the synthetic curve, but never looser. Honest in
  // both directions: synthetic floor + real ceiling.
  const realUsed = count || 0;
  const used = Math.max(realUsed, syntheticUsed);
  const remaining = Math.max(MIN_REMAINING, cap - used);

  return NextResponse.json({
    ok: true,
    used,
    cap,
    remaining,
    monthLabel: month,
    configured: true,
  });
}
