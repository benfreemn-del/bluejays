import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendEmail } from "@/lib/email-sender";
import { getWinLossSurveyEmail } from "@/lib/win-loss-emails";
import { logHeartbeat } from "@/lib/cron-heartbeat";
import { SUPPRESSED_PROSPECT_STATUSES } from "@/lib/email-guard";

/**
 * /api/cron/win-loss-survey
 *
 * Daily cron — fires the one-shot win-loss survey to AI Package
 * prospects who walked without buying.
 *
 * Trigger criteria:
 *   pricing_tier in ('fullsystem')
 *   AND status = 'dismissed'
 *   AND win_loss_survey_sent_at IS NULL
 *   AND created_at > now() - 90 days  (don't survey ancient leads)
 *
 * NOT 'unsubscribed' (fixed 2026-07-31). This cron used to include
 * `status='unsubscribed'` in the filter, so it emailed people who had
 * explicitly opted out. Nothing downstream caught it: `sendEmail()`
 * checks the hard-bounce list but not unsubscribe state, and the send
 * is flagged `transactional: true`, which also skips the domain-warming
 * cap. "They opted out" and "we want to know why they left" are not the
 * same question — an opt-out is an answer.
 *
 * The eligible-status list is filtered through SUPPRESSED_PROSPECT_STATUSES
 * (src/lib/email-guard.ts) so any future edit that re-adds an opt-out
 * status to this query is a no-op rather than a regression.
 *
 * Each survey is sent ONCE per prospect (idempotent via the sent_at
 * stamp). Replies flow back through the AI Inbound Responder (already
 * built) which classifies them; an operator can then update
 * win_loss_outcome on the prospect row from the dashboard later.
 *
 * Schedule: 19:37 UTC daily — late in the cron window so all the
 * status updates from the day have settled before we sample.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

interface ProspectRow {
  id: string;
  business_name: string | null;
  owner_name: string | null;
  email: string | null;
  status: string;
  created_at: string;
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Statuses this survey is willing to contact, minus anything on the
 * global suppression list. Computed rather than hardcoded so a future
 * edit can't quietly re-introduce an opt-out status here.
 */
const SURVEYABLE_STATUSES = ["dismissed", "not_interested"].filter(
  (s) => !SUPPRESSED_PROSPECT_STATUSES.includes(s),
);

export async function POST(request?: NextRequest) {
  if (request) {
    const auth = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    await logHeartbeat(
      "win_loss_survey",
      { reason: "supabase_not_configured" },
      "skipped",
    );
    return NextResponse.json({ message: "Supabase not configured", sent: 0 });
  }

  const cutoffIso = new Date(Date.now() - NINETY_DAYS_MS).toISOString();

  const { data, error } = await supabase
    .from("prospects")
    .select("id, business_name, owner_name, email, status, created_at")
    .eq("pricing_tier", "fullsystem")
    .in("status", SURVEYABLE_STATUSES)
    .is("win_loss_survey_sent_at", null)
    .gte("created_at", cutoffIso)
    .limit(50);

  if (error) {
    console.error("[win-loss-survey] query failed:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as ProspectRow[];

  if (rows.length === 0) {
    await logHeartbeat("win_loss_survey", { sent: 0, inspected: 0 });
    return NextResponse.json({ message: "No prospects to survey", sent: 0 });
  }

  let sent = 0;
  let failed = 0;
  const log: Array<{ id: string; result: string }> = [];

  for (const p of rows) {
    if (!p.email) {
      log.push({ id: p.id, result: "skipped_no_email" });
      continue;
    }

    const businessName = p.business_name || "your business";
    const ownerFirstName =
      (p.owner_name || "").trim().split(/\s+/)[0] || undefined;

    const template = getWinLossSurveyEmail({ businessName, ownerFirstName });

    try {
      await sendEmail(
        p.id,
        p.email,
        template.subject,
        template.body,
        template.sequence,
        undefined,
        { transactional: true }, // win-loss is operational ask, not marketing
      );
      await supabase
        .from("prospects")
        .update({ win_loss_survey_sent_at: new Date().toISOString() })
        .eq("id", p.id);
      sent++;
      log.push({ id: p.id, result: "sent" });
    } catch (err) {
      failed++;
      log.push({
        id: p.id,
        result: `failed:${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  await logHeartbeat("win_loss_survey", {
    sent,
    failed,
    inspected: rows.length,
  });

  return NextResponse.json({
    message: `Win-loss survey: ${sent} sent, ${failed} failed`,
    sent,
    failed,
    inspected: rows.length,
    log,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
