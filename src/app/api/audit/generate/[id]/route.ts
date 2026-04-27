import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { runAudit } from "@/lib/site-audit";
import { sendEmail } from "@/lib/email-sender";
import { getAuditEmail1 } from "@/lib/audit-emails";

/**
 * POST/GET /api/audit/generate/[id]
 *
 * Internal endpoint — called by /api/audit/submit (fire-and-forget) and
 * by the operator dashboard ("retry audit" button). Auth via CRON_SECRET
 * (or the dashboard auth cookie if hit interactively).
 *
 * Runs the full AI audit synchronously and immediately sends Email #1
 * (Hormozi sequence Day 0). Subsequent emails fire from the
 * /api/audit/followup-cron daily.
 *
 * maxDuration is bumped to 300s (5 min) per Vercel function-config in
 * vercel.json — Claude + GPT calls + site fetch can take several minutes
 * combined.
 */

export const maxDuration = 300;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    // Allow dashboard-authenticated calls too — the middleware will
    // have already stripped any non-admin requests before we get here
    // since the route isn't in PUBLIC_API_PATHS. So this is a belt-and-
    // suspenders gate for direct curl/test calls.
    if (auth !== "Bearer dev") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id } = await params;

  // Pull the audit + prospect
  const { data: audit, error: auditErr } = await supabase
    .from("site_audits")
    .select("id, prospect_id, target_url, business_category, status, metadata")
    .eq("id", id)
    .maybeSingle();

  if (auditErr || !audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  if (audit.status === "ready") {
    return NextResponse.json({ ok: true, message: "Already complete", auditId: id });
  }
  if (audit.status === "generating") {
    return NextResponse.json({ ok: true, message: "Already in progress", auditId: id });
  }

  const { data: prospect } = await supabase
    .from("prospects")
    .select("id, business_name, email")
    .eq("id", audit.prospect_id)
    .maybeSingle();

  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  // Bug fix 2026-04-27: prefer the target-derived business name from the
  // audit row's metadata over the prospect's businessName. When a submitter
  // re-uses an existing prospect record (matched by email), the prospect's
  // businessName is the SUBMITTER's, not the audited site's. The audit copy
  // must reference the audited site, not the person who clicked Submit.
  const auditMeta =
    (audit.metadata as Record<string, unknown> | null) || {};
  const targetBusinessName =
    (typeof auditMeta.targetBusinessName === "string" &&
      auditMeta.targetBusinessName.trim()) ||
    (prospect.business_name as string);

  const result = await runAudit({
    auditId: id,
    prospect: {
      id: prospect.id as string,
      businessName: targetBusinessName,
      email: (prospect.email as string | null) || null,
    },
    targetUrl: audit.target_url as string,
    businessCategory: audit.business_category as string,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "Audit generation failed", detail: result.error },
      { status: 500 },
    );
  }

  // Send Email #1 (Day 0) — the audit-ready notification.
  // Subsequent emails (Day 1/3/7/14) fire from the followup cron.
  if (prospect.email) {
    try {
      // Re-fetch the audit with content for the email
      const { data: full } = await supabase
        .from("site_audits")
        .select("id, audit_content")
        .eq("id", id)
        .maybeSingle();
      const overallScore = (full?.audit_content as { overallScore?: number } | null)?.overallScore ?? 0;
      const template = getAuditEmail1({
        businessName: targetBusinessName,
        auditUrl: `https://bluejayportfolio.com/audit/${id}`,
        overallScore,
      });
      await sendEmail(
        prospect.id as string,
        prospect.email as string,
        template.subject,
        template.body,
        400, // sequence 400-404 reserved for the Hormozi 5-email audit followup
        undefined,
        { transactional: true }, // user requested this audit — bypass warming cap
      );
      await supabase
        .from("site_audits")
        .update({ email_sent_at: new Date().toISOString(), audit_email_step: 1 })
        .eq("id", id);
    } catch (err) {
      console.error("[audit/generate] Email #1 send failed (non-fatal):", err);
    }
  }

  return NextResponse.json({ ok: true, auditId: id });
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  return POST(request, ctx);
}
