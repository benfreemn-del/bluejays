import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { pollVideoStatus } from "@/lib/heygen";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * /api/cron/heygen-poll
 *
 * Every 5 minutes — find every site_audit row that has a HeyGen
 * video_id but no video_url yet, poll HeyGen for status, stamp the
 * URL when ready (status='completed').
 *
 * Runs alongside the audit-followup cron rhythm. Most HeyGen videos
 * complete in 30-90 seconds, so 5-min polling lands typical videos
 * within ~3 minutes of the audit-ready event.
 *
 * Failures (status='failed') stamp heygen_completed_at to take the
 * row out of the polling pool so we don't churn forever. The video
 * just doesn't render on the audit page — graceful degradation.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

interface AuditRow {
  id: string;
  heygen_video_id: string;
  heygen_requested_at: string | null;
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export async function POST(request?: NextRequest) {
  if (request) {
    const auth = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    await logHeartbeat("heygen_poll", { reason: "supabase_not_configured" }, "skipped");
    return NextResponse.json({ message: "Supabase not configured" });
  }

  const { data, error } = await supabase
    .from("site_audits")
    .select("id, heygen_video_id, heygen_requested_at")
    .not("heygen_video_id", "is", null)
    .is("heygen_video_url", null)
    .limit(50);

  if (error) {
    console.error("[heygen-poll] query failed:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as AuditRow[];
  if (rows.length === 0) {
    await logHeartbeat("heygen_poll", { polled: 0 });
    return NextResponse.json({ message: "Nothing in flight", polled: 0 });
  }

  const now = Date.now();
  let completed = 0;
  let failed = 0;
  let stillProcessing = 0;
  let timedOut = 0;

  for (const row of rows) {
    // Hard timeout: if a video has been processing >2 hours, stamp
    // it as completed-with-no-url so we stop polling forever.
    const requestedAtMs = row.heygen_requested_at
      ? new Date(row.heygen_requested_at).getTime()
      : 0;
    if (requestedAtMs && now - requestedAtMs > TWO_HOURS_MS) {
      await supabase
        .from("site_audits")
        .update({ heygen_completed_at: new Date().toISOString() })
        .eq("id", row.id);
      timedOut++;
      continue;
    }

    const result = await pollVideoStatus(row.heygen_video_id);
    if (!result) continue;

    if (result.status === "completed") {
      await supabase
        .from("site_audits")
        .update({
          heygen_video_url: result.videoUrl,
          heygen_completed_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      completed++;
    } else if (result.status === "failed") {
      await supabase
        .from("site_audits")
        .update({ heygen_completed_at: new Date().toISOString() })
        .eq("id", row.id);
      failed++;
    } else {
      stillProcessing++;
    }
  }

  await logHeartbeat("heygen_poll", {
    polled: rows.length,
    completed,
    failed,
    timedOut,
    stillProcessing,
  });

  return NextResponse.json({
    message: `${completed} ready, ${failed} failed, ${timedOut} timed out, ${stillProcessing} still rendering`,
    polled: rows.length,
    completed,
    failed,
    timedOut,
    stillProcessing,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
