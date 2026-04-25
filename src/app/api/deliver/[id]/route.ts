import { NextRequest, NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import { getHandoffEmail } from "@/lib/email-templates";
import { sendOwnerAlert } from "@/lib/alerts";

/**
 * POST /api/deliver/[id]
 *
 * Marks a prospect's site as delivered and sends the formal handoff email.
 * Ben calls this from the dashboard when the live site is ready.
 *
 * Body (optional):
 *   { liveUrl: string }  — override the live URL (defaults to generatedSiteUrl or preview)
 *
 * The handoff email covers:
 *   - Live URL
 *   - What's included in the $100/year plan (domain, hosting, support, maintenance)
 *   - How to request changes (email with "CHANGE REQUEST")
 *   - How to send new materials (logo, photos, bio)
 *   - Contact info
 *
 * Only sends once — subsequent calls return 409 if already delivered.
 */

// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  if (!["paid", "claimed"].includes(prospect.status)) {
    return NextResponse.json(
      { error: "Prospect must be paid or claimed to deliver handoff" },
      { status: 400 }
    );
  }

  // Idempotent — don't send twice
  if (prospect.handoffSentAt) {
    return NextResponse.json(
      {
        message: "Handoff already sent",
        sentAt: prospect.handoffSentAt,
        skipped: true,
      },
      { status: 409 }
    );
  }

  const email = prospect.email;
  if (!email) {
    return NextResponse.json(
      { error: "No email address on file for this prospect" },
      { status: 400 }
    );
  }

  let body: { liveUrl?: string } = {};
  try {
    body = await request.json();
  } catch {
    // body is optional
  }

  const liveUrl =
    body.liveUrl ||
    prospect.generatedSiteUrl ||
    `${BASE_URL}/preview/${id}`;

  const template = getHandoffEmail(prospect, liveUrl);

  try {
    await sendEmail(id, email, template.subject, template.body, 0);
  } catch (err) {
    console.error(`[Deliver] Handoff email failed for ${id}:`, err);
    return NextResponse.json(
      { error: "Failed to send handoff email", details: String(err) },
      { status: 500 }
    );
  }

  await updateProspect(id, {
    handoffSentAt: new Date().toISOString(),
  });

  // Alert Ben so he knows it went out
  const ownerMsg = [
    `📬 Handoff email sent to ${prospect.businessName}!`,
    `📧 ${email}`,
    `🌐 ${liveUrl}`,
    `📋 ${BASE_URL}/dashboard`,
  ].join("\n");
  await sendOwnerAlert(ownerMsg).catch(() => {});

  console.log(`[Deliver] Handoff sent to ${prospect.businessName} (${email})`);

  return NextResponse.json({
    success: true,
    sentTo: email,
    business: prospect.businessName,
    liveUrl,
    handoffSentAt: new Date().toISOString(),
  });
}

/**
 * GET /api/deliver/[id]
 * Check if handoff has been sent for this prospect.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  return NextResponse.json({
    business: prospect.businessName,
    handoffSent: !!prospect.handoffSentAt,
    handoffSentAt: prospect.handoffSentAt || null,
    email: prospect.email || null,
  });
}
