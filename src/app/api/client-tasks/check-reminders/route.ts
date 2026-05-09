import { NextRequest, NextResponse } from "next/server";
import {
  listDueSnoozeReminders,
  markSnoozeNotified,
} from "@/lib/client-tasks";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * GET /api/client-tasks/check-reminders
 *
 * Daily cron — finds every client_jobs_meta row where snoozed=true
 * AND snooze_until <= now AND snooze_notified_at IS NULL, then
 * fires SMS+email reminders to Ben for each one and marks notified.
 *
 * Idempotent: marking `snooze_notified_at` after the first send
 * stops the next cron tick from re-firing the same reminder. Re-
 * snoozing the same client clears `snooze_notified_at` so the
 * next deadline produces a fresh reminder.
 *
 * Triggered by Vercel cron (see vercel.json). Also safe to call
 * manually for testing — the idempotency guard means a hand-fired
 * call won't double-send unless multiple due rows exist.
 *
 * Auth: middleware allows /api/client-tasks/* through the dashboard
 * cookie. The Vercel cron uses CRON_SECRET. We accept either:
 *   1. valid dashboard cookie (manual operator call)
 *   2. ?secret=<CRON_SECRET> matching env (Vercel cron).
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  // Allow either: dashboard auth (already enforced by middleware on
  // /api/* paths) OR explicit cron secret. Both produce the same
  // behavior — the secret check is defense-in-depth in case the
  // route somehow bypasses middleware in a future config change.
  if (cronSecret && secret && secret !== cronSecret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const due = await listDueSnoozeReminders();
    const fired: string[] = [];
    const failed: { client_slug: string; error: string }[] = [];

    for (const row of due) {
      const reasonLabel =
        row.snooze_reason === "interested_10k"
          ? "interested in $10k AI System — check back"
          : row.snooze_reason ?? "follow-up";

      const message =
        `🔔 Follow-up due: ${row.client_slug}\n` +
        `Reason: ${reasonLabel}` +
        (row.snooze_notes ? `\nNotes: ${row.snooze_notes}` : "") +
        `\n→ /dashboard/clients/${row.client_slug}`;

      try {
        // sendOwnerAlert fires both SMS (via Twilio) and email
        // (via SendGrid), with cost-logging. Mock-safe — no-ops
        // when Twilio/SendGrid envs are missing.
        await sendOwnerAlert(message, { clientSlug: row.client_slug });
        await markSnoozeNotified(row.client_slug);
        fired.push(row.client_slug);
      } catch (err) {
        failed.push({
          client_slug: row.client_slug,
          error: err instanceof Error ? err.message : "unknown",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      due: due.length,
      fired: fired.length,
      failed: failed.length,
      detail: { fired, failed },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
