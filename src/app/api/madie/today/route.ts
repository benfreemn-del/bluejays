import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/madie/today
 *
 * Returns Madie's (and any cross-client BlueJays-side caller's) daily
 * productivity numbers — the exact stats the dashboard surfaces need
 * to answer "are we on pace for 100 calls / 3 meetings today" without
 * tab-hopping. Per the dashboard review (2026-05-08): the #1 missing
 * surface in the system, ranked above the per-client refactor.
 *
 * Source: `partner_calls` table — populated by /api/partners/work/log-call
 * every time a Hormozi-script call ends with an outcome button click.
 *
 * Goals as guard rails:
 *   - 100 calls/day target (Madie's locked daily target)
 *   - 3 meetings/day target (the close-rate predictor)
 *
 * Outcomes that count as "meetings booked":
 *   - answered_call_scheduled  → primary "meeting set" outcome
 *
 * Outcomes that count as "calls completed":
 *   - all of them (every dial logged is a call, regardless of outcome)
 *
 * When Madie role-auth ships (Q4=A), this endpoint filters by
 * `partner_id = madie.id`. Until then it includes EVERY partner_calls
 * row (which is fine — Ben + Madie are the only two operators
 * dialing today).
 */

const MEETING_OUTCOMES = new Set(["answered_call_scheduled"]);
const ENGAGED_OUTCOMES = new Set([
  "answered_call_scheduled",
  "answered_preview_sent",
  "answered_audit_sent",
  "answered_callback",
]);

export async function GET(_request: NextRequest) {
  if (!isSupabaseConfigured()) {
    // Mock-mode fallback so the dashboard never crashes on a missing
    // Supabase config. Numbers stay at zero.
    return NextResponse.json(emptyResponse());
  }

  // Today's window in UTC. Good enough for now — Ben's in PT but the
  // pacing reads correctly to within a few hours for a 100-calls-a-day
  // operator. Convert to a per-user timezone in v2 once Madie's
  // physical location matters for "is the day done."
  const now = new Date();
  const startOfTodayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const startOf7dWindow = new Date(
    startOfTodayUtc.getTime() - 6 * 24 * 60 * 60 * 1000,
  );

  // 90-day window for streak calculation. partner_calls is small
  // enough that this is fine; saves a separate query.
  const startOf90dWindow = new Date(
    startOfTodayUtc.getTime() - 90 * 24 * 60 * 60 * 1000,
  );

  try {
    // Pull partner_calls from the last 90 days. Light-weight enough
    // — typical row count is a few thousand max — and gives us streak
    // calculation in the same query as today/week stats. Aggregated
    // in memory.
    const { data, error } = await supabase
      .from("partner_calls")
      .select("id, outcome, created_at, partner_id")
      .gte("created_at", startOf90dWindow.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      console.error("[madie/today] supabase select failed:", error);
      return NextResponse.json(emptyResponse());
    }

    const rows = data ?? [];

    let callsToday = 0;
    let meetingsToday = 0;
    let engagedToday = 0;
    let callsWeek = 0;
    let meetingsWeek = 0;
    const outcomesToday: Record<string, number> = {};
    // For streak calc: track which days had ≥1 call in the last 90d
    const daysWithCalls = new Set<string>();

    for (const r of rows) {
      const ts = r.created_at ? Date.parse(r.created_at) : 0;
      if (!ts) continue;
      const isToday = ts >= startOfTodayUtc.getTime();
      const isThisWeek = ts >= startOf7dWindow.getTime();
      const outcome = (r.outcome || "unknown").toString();

      // Day key for streak set
      const dayKey = new Date(ts).toISOString().slice(0, 10);
      daysWithCalls.add(dayKey);

      // Week-window stats only count calls within the 7-day window.
      // (Without this guard the 90-day pull would inflate the "week"
      // numbers — bug from the original 7-day query that didn't need
      // the check.)
      if (isThisWeek) {
        callsWeek += 1;
        if (MEETING_OUTCOMES.has(outcome)) meetingsWeek += 1;
      }

      if (isToday) {
        callsToday += 1;
        outcomesToday[outcome] = (outcomesToday[outcome] ?? 0) + 1;
        if (MEETING_OUTCOMES.has(outcome)) meetingsToday += 1;
        if (ENGAGED_OUTCOMES.has(outcome)) engagedToday += 1;
      }
    }

    // Streak — consecutive calendar days ending TODAY (or yesterday if
    // today has 0 calls but yesterday did) with ≥1 call. Walk
    // backwards from today; first day with 0 breaks it.
    const todayKey = startOfTodayUtc.toISOString().slice(0, 10);
    const streakIncludesToday = daysWithCalls.has(todayKey);
    let streakDays = 0;
    // Start at today (if has calls) or yesterday (if not — streak
    // continues until today is over without calls).
    let cursor = streakIncludesToday
      ? new Date(startOfTodayUtc)
      : new Date(startOfTodayUtc.getTime() - 24 * 60 * 60 * 1000);
    // Walk back up to 90 days
    for (let i = 0; i < 90; i++) {
      const key = cursor.toISOString().slice(0, 10);
      if (!daysWithCalls.has(key)) break;
      streakDays += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    const callsTarget = 100;
    const meetingsTarget = 3;
    const paceToday = Math.round((callsToday / callsTarget) * 100);

    // Hours elapsed in the working day (8a–6p PT ≈ 16:00–02:00 UTC),
    // used to compute "expected pace" — what a 100/day operator
    // SHOULD have done by now if pacing evenly. If callsToday is at
    // expected pace, paceVsExpected = 100. Below = behind, above = ahead.
    const workdayLength = 10; // 10-hour working day target
    const utcHour = now.getUTCHours();
    // Convert UTC hour to PT (subtract 7 for PDT, 8 for PST — use 7
    // since we're in May = PDT). Negative wraps to "haven't started."
    const ptHour = (utcHour - 7 + 24) % 24;
    const hoursIntoDay = Math.max(0, Math.min(workdayLength, ptHour - 8));
    const expectedByNow = Math.round(
      (hoursIntoDay / workdayLength) * callsTarget,
    );
    const paceVsExpected =
      expectedByNow === 0
        ? null
        : Math.round((callsToday / expectedByNow) * 100);

    return NextResponse.json({
      callsToday,
      meetingsToday,
      engagedToday,
      callsWeek,
      meetingsWeek,
      callsTarget,
      meetingsTarget,
      paceToday,
      paceVsExpected,
      hoursIntoDay,
      workdayLength,
      outcomesToday,
      streakDays,
      streakIncludesToday,
      asOf: now.toISOString(),
    });
  } catch (err) {
    console.error("[madie/today] failed:", err);
    return NextResponse.json(emptyResponse());
  }
}

function emptyResponse() {
  return {
    callsToday: 0,
    meetingsToday: 0,
    engagedToday: 0,
    callsWeek: 0,
    meetingsWeek: 0,
    callsTarget: 100,
    meetingsTarget: 3,
    paceToday: 0,
    paceVsExpected: null as number | null,
    hoursIntoDay: 0,
    workdayLength: 10,
    outcomesToday: {} as Record<string, number>,
    streakDays: 0,
    streakIncludesToday: false,
    asOf: new Date().toISOString(),
  };
}
