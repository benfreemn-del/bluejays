import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import { logTouch } from "@/lib/prospect-touches";

/**
 * POST /api/prospects/[id]/send-audit
 *
 * Emails the prospect their audit results URL (or the audit-submit form
 * if they don't yet have a completed audit). Audit results show
 * "estimated dollars/month you're losing" — Madie's pain-amplification
 * close.
 *
 * Body (optional):
 *   { callerFirstName?: string }   — defaults to "Madie"
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid prospect id" },
      { status: 400 },
    );
  }

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { ok: false, error: "Prospect not found" },
      { status: 404 },
    );
  }
  if (!prospect.email) {
    return NextResponse.json(
      { ok: false, error: "No email on file for this prospect" },
      { status: 400 },
    );
  }

  let body: { callerFirstName?: string } = {};
  try {
    body = await request.json();
  } catch {
    // empty body OK
  }

  const callerFirstName = (body.callerFirstName || "Madie").trim();
  const ownerFirst = prospect.ownerName?.trim().split(/\s+/)[0] || "there";
  const biz = prospect.businessName || "your business";

  // Audit URL: prefer prospect's completed audit results, else the
  // 60-second audit form for them to fill out.
  type ProspectWithAudit = typeof prospect & { auditViewUrl?: string | null };
  const auditViewUrl = (prospect as ProspectWithAudit).auditViewUrl;
  const auditUrl = auditViewUrl || `${SITE_ORIGIN}/audit?ref=${prospect.id}`;
  const hasCompletedAudit = !!auditViewUrl;

  const subject = hasCompletedAudit
    ? `${biz} — your site audit (issues + fixes inside)`
    : `Free 60-second audit of ${biz}`;

  const text = hasCompletedAudit
    ? `Hey ${ownerFirst},

${callerFirstName} with BlueJays — here's the full audit of ${biz}'s current site. The issues we found plus the fixes are all inside:

${auditUrl}

Takes 90 seconds to read. The dollar estimate at the top is what you're leaving on the table per month — usually the part owners want to talk about.

Talk soon,
${callerFirstName}
BlueJays
bluejaycontactme@gmail.com`
    : `Hey ${ownerFirst},

${callerFirstName} with BlueJays — here's the free 60-second audit tool I mentioned. It scans your site, flags the issues that are costing you leads, and gives you a dollar estimate of what those issues are worth per month:

${auditUrl}

No signup, no card — just runs. Send me the result and I'll walk you through it.

Talk soon,
${callerFirstName}
BlueJays
bluejaycontactme@gmail.com`;

  const buttonLabel = hasCompletedAudit
    ? "View your full audit →"
    : "Run the 60-sec audit →";

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;line-height:1.55;color:#111;">
  <p>Hey ${escapeHtml(ownerFirst)},</p>
  <p>${escapeHtml(callerFirstName)} with BlueJays — ${
    hasCompletedAudit
      ? `here's the full audit of <strong>${escapeHtml(biz)}</strong>'s current site. The issues we found plus the fixes are all inside:`
      : `here's the free 60-second audit tool I mentioned. It scans your site, flags the issues costing you leads, and gives you a dollar estimate of what those issues are worth per month:`
  }</p>
  <p style="margin:24px 0;">
    <a href="${auditUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;">${buttonLabel}</a>
  </p>
  <p style="color:#555;font-size:14px;">Or paste into your browser:<br><a href="${auditUrl}">${auditUrl}</a></p>
  <p>${
    hasCompletedAudit
      ? `Takes 90 seconds to read. The dollar estimate at the top is what you're leaving on the table per month — usually the part owners want to talk about.`
      : `No signup, no card — just runs. Send me the result and I'll walk you through it.`
  }</p>
  <p>Talk soon,<br>${escapeHtml(callerFirstName)}<br>BlueJays<br><a href="mailto:bluejaycontactme@gmail.com">bluejaycontactme@gmail.com</a></p>
</div>`;

  try {
    const sent = await sendEmail(
      prospect.id,
      prospect.email,
      subject,
      text,
      999,
      html,
      { transactional: true },
    );

    void logTouch({
      prospectId: prospect.id,
      kind: "email",
      direction: "outbound",
      by_user: "madie",
      notes: `Audit link sent via email (${callerFirstName})${hasCompletedAudit ? " — completed results" : " — invite to fill"}`,
    }).catch((err) =>
      console.error("[send-audit] touch log failed:", err),
    );

    return NextResponse.json({
      ok: true,
      to: prospect.email,
      from: sent.from,
      subject,
      auditUrl,
      hasCompletedAudit,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message || "Email send failed" },
      { status: 500 },
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
