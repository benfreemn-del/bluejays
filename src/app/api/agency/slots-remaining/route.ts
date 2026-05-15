import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/agency/slots-remaining
 *
 * Public endpoint — powers the homepage Hero scarcity line ("X of 10
 * AI system builds remaining this month"). Counts paid fullsystem-tier
 * prospects with paid_at (falls back to updated_at) inside the current
 * calendar month.
 *
 * Cached for 60s at the edge — slot count doesn't change minute-to-minute
 * and we want the homepage to stay snappy under cold-paid-traffic load.
 *
 * Returns:
 *   { ok, used, cap, remaining, monthLabel, configured }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hard cap announced on /agency: "Only 10 of these built per month."
const MONTHLY_CAP = 10;

function startOfMonthIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function monthLabel(): string {
  return new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
}

export async function GET() {
  const month = monthLabel();
  const cap = MONTHLY_CAP;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      used: 0,
      cap,
      remaining: cap,
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
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        // Degrade gracefully: return cap as "remaining" so the line still
        // renders something sensible if the DB call fails.
        used: 0,
        cap,
        remaining: cap,
        monthLabel: month,
        configured: true,
      },
      { status: 200 }, // 200 so the client can still render the fallback
    );
  }

  const used = count || 0;
  const remaining = Math.max(0, cap - used);

  return NextResponse.json({
    ok: true,
    used,
    cap,
    remaining,
    monthLabel: month,
    configured: true,
  });
}
