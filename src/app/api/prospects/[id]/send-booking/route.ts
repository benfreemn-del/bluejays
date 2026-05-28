import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import { buildBookingUrlForCall } from "@/lib/booking";
import { logTouch } from "@/lib/prospect-touches";

/**
 * POST /api/prospects/[id]/send-booking
 *
 * Emails the prospect Ben's Calendly link. SMS is handled client-side
 * via an sms: deeplink (Madie's phone fires the text from her caller-id,
 * not Twilio — preserves consistency with the call she just placed).
 *
 * Body (optional):
 *   { callerFirstName?: string }   — defaults to "Madie"
 *
 * Sets transactional=true so it bypasses warming caps (mid-call send).
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  const bookingUrl = buildBookingUrlForCall({ prospectId: prospect.id });
  const ownerFirst = prospect.ownerName?.trim().split(/\s+/)[0] || "there";
  const biz = prospect.businessName || "your business";

  const subject = `Quick 15-min walkthrough — ${biz}`;

  const text = `Hey ${ownerFirst},

${callerFirstName} with BlueJays — as promised on the phone, here's Ben's calendar to grab a 15-min walkthrough of the site we built for ${biz}:

${bookingUrl}

He'll show you everything live, answer your questions, and we'll plan your launch.

Talk soon,
${callerFirstName}
BlueJays
madie@bluejayportfolio.com`;

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;line-height:1.55;color:#111;">
  <p>Hey ${escapeHtml(ownerFirst)},</p>
  <p>${escapeHtml(callerFirstName)} with BlueJays — as promised on the phone, here's Ben's calendar to grab a 15-min walkthrough of the site we built for <strong>${escapeHtml(biz)}</strong>:</p>
  <p style="margin:24px 0;">
    <a href="${bookingUrl}" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;">Pick a 15-min slot →</a>
  </p>
  <p style="color:#555;font-size:14px;">Or paste this link into your browser:<br><a href="${bookingUrl}">${bookingUrl}</a></p>
  <p>He'll show you everything live, answer your questions, and we'll plan your launch.</p>
  <p>Talk soon,<br>${escapeHtml(callerFirstName)}<br>BlueJays<br><a href="mailto:madie@bluejayportfolio.com">madie@bluejayportfolio.com</a></p>
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
      notes: `Booking link sent via email (${callerFirstName})`,
    }).catch((err) =>
      console.error("[send-booking] touch log failed:", err),
    );

    return NextResponse.json({
      ok: true,
      to: prospect.email,
      from: sent.from,
      subject,
      bookingUrl,
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
