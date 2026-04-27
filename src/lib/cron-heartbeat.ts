/**
 * Cron heartbeat logger — Rule 66 systemic-gap fix.
 *
 * Every scheduled task in vercel.json calls `logHeartbeat(name, metadata)`
 * AT THE END of a successful run. The watchdog cron (`/api/watchdog/run`)
 * scans `cron_heartbeats` by `cron_name` to detect silence past each
 * cron's threshold and SMSes Ben.
 *
 * Why call AT THE END:
 *   - Logging at start = false-positive heartbeats for crons that crashed
 *     mid-run.
 *   - Logging at end = the heartbeat means "I successfully completed this
 *     run", which is what the watchdog actually needs to know.
 *
 * Mock-mode safe: when Supabase isn't configured the function silently
 * no-ops so dev/CI flows keep working without env vars. Insert errors
 * are logged but never thrown — heartbeat logging must NEVER block the
 * cron's response.
 *
 * Usage pattern at the END of a cron route:
 *   await logHeartbeat("funnel_run", { sent: emailsSent, errors: errCount });
 *   return NextResponse.json({ ok: true, ... });
 *
 * The metadata object is free-form (JSONB) and useful for after-the-fact
 * analysis — record counts, durations, error counts, anything that would
 * help debug a failed-but-still-heartbeating cron.
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export type HeartbeatStatus = "completed" | "failed" | "skipped";

export async function logHeartbeat(
  cronName: string,
  metadata: Record<string, unknown> = {},
  status: HeartbeatStatus = "completed",
  durationMs?: number,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from("cron_heartbeats").insert({
      cron_name: cronName,
      status,
      duration_ms: durationMs ?? null,
      metadata,
    });
  } catch (err) {
    // Never let heartbeat logging block the cron response.
    console.error(`[heartbeat] Failed to log ${cronName}:`, err);
  }
}
