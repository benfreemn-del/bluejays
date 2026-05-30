import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { updateProspect } from "@/lib/store";
import { touchCountsByProspect } from "@/lib/prospect-touches";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * GET /api/leads/sweep-following-up
 *
 * Daily sweep that honors Madie's "3 touches then get them out of my
 * sight" rule. Any lead she parked in 📌 Following Up that has hit
 * 3+ outreach touches AND gone 14+ days with no new contact auto-moves
 * to status='nurturing' (hidden from her default list). She can still
 * find them via the "Show nurturing" chip.
 *
 * Criteria (ALL must hold):
 *   - status = 'following_up'
 *   - saved_at IS NULL  (📍 Saved leads are exempt — they stay forever)
 *   - outreach touch count >= 3 (call/voicemail/text/email/dm/in_person)
 *   - last_contacted_at <= now() - 14 days  (silence window)
 *
 * Leads in following_up with < 3 touches OR contacted within 14 days
 * STAY put — she's still actively working them.
 *
 * Saved leads (`saved_at IS NOT NULL`) are EXEMPT regardless of touch
 * count or silence — Madie marked them as "keep no matter what" via
 * the 📍Save row pill / drawer toggle. See migration
 * `20260529_prospects_saved_at.sql`.
 *
 * Idempotent: re-running does nothing once a lead has been flipped
 * (it's no longer status='following_up'). Mock-safe: no-ops without
 * Supabase. `?dry=true` previews the eligible set without flipping.
 *
 * Schedule: Vercel cron `0 15 * * *` (15:00 UTC = 7am PT) — before the
 * 16:00 outbound window so Madie starts her day with a clean list.
 */
export const dynamic = "force-dynamic";

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const TOUCH_THRESHOLD = 3;

export async function GET(request: NextRequest) {
  // Vercel cron auth — same pattern as /api/nps/send.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const { searchParams } = new URL(request.url);
  const dry = searchParams.get("dry") === "true";
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
    if (!userAgent.includes("vercel") && !dry) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, swept: 0, note: "Supabase not configured (mock mode)" });
  }

  // Pull the following_up set + their last-contact timestamps + saved flag.
  const { data, error } = await supabase
    .from("prospects")
    .select("id, business_name, last_contacted_at, saved_at")
    .eq("status", "following_up");
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const counts = await touchCountsByProspect();
  const cutoff = Date.now() - FOURTEEN_DAYS_MS;

  let exemptedSaved = 0;
  const eligible = (data || []).filter((row: { id: string; last_contacted_at: string | null; saved_at: string | null }) => {
    if (row.saved_at) {
      // Madie marked this one as 📍Saved — never auto-flip.
      exemptedSaved++;
      return false;
    }
    const touches = counts[row.id] || 0;
    if (touches < TOUCH_THRESHOLD) return false;
    if (!row.last_contacted_at) return false; // never contacted → leave alone
    return new Date(row.last_contacted_at).getTime() <= cutoff;
  }) as { id: string; business_name: string | null }[];

  if (dry) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      followingUpTotal: (data || []).length,
      exemptedSaved,
      eligibleToNurture: eligible.length,
      sample: eligible.slice(0, 10).map((r) => r.business_name),
    });
  }

  let swept = 0;
  for (const row of eligible) {
    try {
      await updateProspect(
        row.id,
        { status: "nurturing" },
        { source: "auto_nurture:3touches_14d_silence" },
      );
      swept++;
    } catch (err) {
      console.error(`[sweep-following-up] flip failed for ${row.id}:`, err);
    }
  }

  await logHeartbeat("sweep-following-up", { swept, eligible: eligible.length, exemptedSaved }).catch(
    () => {},
  );

  return NextResponse.json({
    ok: true,
    followingUpTotal: (data || []).length,
    exemptedSaved,
    swept,
  });
}
