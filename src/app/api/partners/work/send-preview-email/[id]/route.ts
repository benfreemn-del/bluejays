import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";

/**
 * POST /api/partners/work/send-preview-email/[id]
 *
 * Sends the prospect their preview-site link from
 * ben@bluejayportfolio.com via the existing SendGrid pipeline.
 *
 * Why a dedicated route vs. reusing sendPitchEmail:
 *   - The cold-outreach pitch templates are 5-step warmups designed
 *     for inbox-zero strangers. Mid-call we want a SHORT, personal,
 *     "as promised" follow-up that mirrors the SMS — not a pitch.
 *   - Marked transactional=true so it bypasses the warming-cap
 *     daily limit. The rep is on a live call; they can't be told
 *     "try again tomorrow."
 *
 * Body:
 *   { previewUrl?: string, callerFirstName?: string }
 *   — both optional; sane fallbacks pulled from prospect record.
 *
 * Used by: CallWorkspace "📧 Email preview link" button.
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }
  if (!prospect.email) {
    return NextResponse.json(
      { error: "No email on file for this prospect" },
      { status: 400 },
    );
  }

  let body: { previewUrl?: string; callerFirstName?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body is fine — fall back to defaults below.
  }

  const callerFirstName = (body.callerFirstName || "Ben").trim();
  const SITE_ORIGIN =
    process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";
  const previewUrl =
    body.previewUrl ||
    (prospect.pricingTier === "custom" && prospect.customSiteUrl) ||
    `${SITE_ORIGIN}/preview/${prospect.id}`;

  const ownerFirst =
    prospect.ownerName?.trim().split(/\s+/)[0] || "there";

  const subject = `${prospect.businessName} — your new website preview`;

  const text = `Hey ${ownerFirst},

${callerFirstName} with BlueJays — as promised on the phone, here's the new website I built for ${prospect.businessName}:

${previewUrl}

Take 60 seconds to scroll through. Anything you want changed (colors, copy, photos) just reply to this email and I'll update it on my end — no charge for tweaks.

If you want to walk through it together, my calendar's open here: ${SITE_ORIGIN}/schedule

Talk soon,
${callerFirstName}
BlueJays
ben@bluejayportfolio.com`;

  const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; line-height: 1.55; color: #111;">
  <p>Hey ${escapeHtml(ownerFirst)},</p>
  <p>${escapeHtml(callerFirstName)} with BlueJays — as promised on the phone, here's the new website I built for <strong>${escapeHtml(prospect.businessName)}</strong>:</p>
  <p style="margin: 24px 0;">
    <a href="${previewUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;">View your preview →</a>
  </p>
  <p style="color:#555;font-size:14px;">Or paste this link into your browser:<br><a href="${previewUrl}">${previewUrl}</a></p>
  <p>Take 60 seconds to scroll through. Anything you want changed (colors, copy, photos) just reply and I'll update it on my end — no charge for tweaks.</p>
  <p>If you want to walk through it together, <a href="${SITE_ORIGIN}/schedule">grab a slot on my calendar</a>.</p>
  <p>Talk soon,<br>${escapeHtml(callerFirstName)}<br>BlueJays<br><a href="mailto:ben@bluejayportfolio.com">ben@bluejayportfolio.com</a></p>
</div>`;

  try {
    const sent = await sendEmail(
      prospect.id,
      prospect.email,
      subject,
      text,
      999, // sequence 999 = transactional/manual mid-call send (not part of cold-outreach cadence)
      html,
      { transactional: true },
    );
    return NextResponse.json({
      ok: true,
      to: prospect.email,
      from: sent.from,
      subject,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Email send failed" },
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
