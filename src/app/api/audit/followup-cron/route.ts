import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendEmail } from "@/lib/email-sender";
import { getAuditEmail2, getAuditEmail3, getAuditEmail4, getAuditEmail5 } from "@/lib/audit-emails";
import { logHeartbeat } from "@/lib/cron-heartbeat";

/**
 * Daily cron — Hormozi 5-email audit follow-up sequence.
 *
 * Cadence per research deliverable Section D:
 *  - Email 1 (Day 0): fired by /api/audit/generate immediately on ready
 *  - Email 2 (Day 1): "The fix most {industry} owners get wrong"
 *  - Email 3 (Day 3): Real client case study
 *  - Email 4 (Day 7): Objection handling
 *  - Email 5 (Day 14): Last call + scarcity
 *
 * Tracks via columns added to site_audits:
 *  - audit_email_step (0-5) — which email was last sent
 *  - last_audit_email_at — when we last sent any audit follow-up
 *
 * If those columns don't exist yet (pre-migration), the cron is a
 * silent no-op so the deploy doesn't break.
 *
 * Schedule: 17:45 UTC daily (after the funnel + postcard + review-blast
 * crons; in the US-business-hours window per Rule 30).
 */

export const maxDuration = 120;

interface DueAudit {
  id: string;
  prospect_id: string;
  business_category: string;
  audit_email_step: number;
  email_sent_at: string | null;
  last_audit_email_at: string | null;
}

export async function POST(request?: NextRequest) {
  if (request) {
    const auth = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    await logHeartbeat("audit_followup", { reason: "supabase_not_configured" }, "skipped");
    return NextResponse.json({ message: "Supabase not configured", sent: 0 });
  }

  // Pull all 'ready' audits with at least the Day-0 email sent
  const { data: rows, error } = await supabase
    .from("site_audits")
    .select("id, prospect_id, business_category, audit_email_step, email_sent_at, last_audit_email_at")
    .eq("status", "ready")
    .not("email_sent_at", "is", null)
    .order("email_sent_at", { ascending: true })
    .limit(200);

  if (error) {
    // If `audit_email_step` column doesn't exist yet, silent no-op
    if (/column.*audit_email_step.*does not exist/i.test(error.message || "")) {
      return NextResponse.json({
        message: "Migration 20260426_audit_email_tracking.sql not yet applied — silent no-op",
        sent: 0,
      });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const audits = (rows || []) as unknown as DueAudit[];
  if (audits.length === 0) {
    return NextResponse.json({ message: "No audits in cooldown — nothing to send", sent: 0 });
  }

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  let sent = 0;
  let failed = 0;
  const log: Array<{ auditId: string; step: number; result: string }> = [];

  for (const audit of audits) {
    const step = audit.audit_email_step ?? 1; // Step 1 is the Day-0 email already sent
    if (step >= 5) continue; // Sequence complete

    // Compute days since last touch
    const lastTouchAt = audit.last_audit_email_at
      ? new Date(audit.last_audit_email_at).getTime()
      : audit.email_sent_at
        ? new Date(audit.email_sent_at).getTime()
        : 0;
    const daysSinceLast = (now - lastTouchAt) / DAY_MS;

    // Day-N gates per cadence
    let nextStep: number | null = null;
    if (step === 1 && daysSinceLast >= 1) nextStep = 2; // Day 1
    else if (step === 2 && daysSinceLast >= 2) nextStep = 3; // Day 3 (1 + 2)
    else if (step === 3 && daysSinceLast >= 4) nextStep = 4; // Day 7 (3 + 4)
    else if (step === 4 && daysSinceLast >= 7) nextStep = 5; // Day 14 (7 + 7)

    if (!nextStep) continue;

    // Pull the prospect for personalization
    const { data: prospect } = await supabase
      .from("prospects")
      .select("id, business_name, email, status")
      .eq("id", audit.prospect_id)
      .maybeSingle();

    if (!prospect || !prospect.email) {
      log.push({ auditId: audit.id, step: nextStep, result: "skipped_no_email" });
      continue;
    }

    // Don't email if the prospect has already paid / unsubscribed / bounced
    const stopStatuses = ["paid", "unsubscribed", "bounced", "dismissed"];
    if (stopStatuses.includes(prospect.status as string)) {
      log.push({ auditId: audit.id, step: nextStep, result: `skipped_status_${prospect.status}` });
      continue;
    }

    const auditUrl = `https://bluejayportfolio.com/audit/${audit.id}`;
    const bookUrl = `https://bluejayportfolio.com/book/${prospect.id}`;
    const businessName = prospect.business_name as string;
    let template;

    switch (nextStep) {
      case 2:
        template = getAuditEmail2({ businessName, category: audit.business_category, auditUrl });
        break;
      case 3:
        template = getAuditEmail3({ businessName, category: audit.business_category, auditUrl, bookUrl });
        break;
      case 4:
        template = getAuditEmail4({ businessName, auditUrl, bookUrl });
        break;
      case 5:
        template = getAuditEmail5({ businessName, auditUrl, bookUrl });
        break;
      default:
        continue;
    }

    try {
      await sendEmail(
        prospect.id as string,
        prospect.email as string,
        template.subject,
        template.body,
        template.sequence,
        undefined,
        { transactional: true }, // prospect opted in via audit form
      );
      await supabase
        .from("site_audits")
        .update({
          audit_email_step: nextStep,
          last_audit_email_at: new Date().toISOString(),
        })
        .eq("id", audit.id);
      sent++;
      log.push({ auditId: audit.id, step: nextStep, result: "sent" });
    } catch (err) {
      failed++;
      log.push({
        auditId: audit.id,
        step: nextStep,
        result: `failed:${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  await logHeartbeat("audit_followup", {
    sent,
    failed,
    inspected: audits.length,
  });

  return NextResponse.json({
    message: `Audit follow-up cron: ${sent} sent, ${failed} failed`,
    sent,
    failed,
    inspected: audits.length,
    log,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
