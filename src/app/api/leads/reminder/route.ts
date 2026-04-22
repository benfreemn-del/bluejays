import { NextRequest, NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/leads/reminder
 *
 * Exit-intent capture from /claim/[id]. When a visitor's mouse heads
 * for the close button without purchasing, the exit-intent modal asks
 * "Want me to email you in 3 days as a reminder?". If they say yes,
 * we schedule that reminder here.
 *
 * This is a LIGHT-TOUCH capture — no additional consent checkbox
 * required because (a) we already have the prospect's email from their
 * funnel enrollment, (b) they're explicitly asking for ONE reminder,
 * not opting in to a marketing list. CAN-SPAM compliant because the
 * reminder email respects the same unsubscribe link our other outreach uses.
 *
 * Body: { prospectId: string, reminderDays?: number (default 3) }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const prospectId = String(body.prospectId || "").trim();
    const reminderDays = Math.min(Math.max(Number(body.reminderDays) || 3, 1), 14);

    if (!prospectId) {
      return NextResponse.json({ error: "prospectId required" }, { status: 400 });
    }

    const prospect = await getProspect(prospectId);
    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }
    if (!prospect.email) {
      return NextResponse.json(
        { error: "No email on file — can't schedule reminder." },
        { status: 400 }
      );
    }

    // Store the reminder request in adminNotes + flip status so the
    // funnel-runner picks it up on its next daily cron. The actual
    // email send happens in the funnel path to reuse existing
    // deliverability + domain-warming infrastructure.
    const when = new Date();
    when.setDate(when.getDate() + reminderDays);

    const nowIso = new Date().toISOString();
    const note = [
      `[Exit-intent reminder requested — ${nowIso}]`,
      `Source: /claim/${prospect.short_code || prospect.id}`,
      `Scheduled for: ${when.toISOString()} (${reminderDays} days)`,
    ].join("\n");

    const prevNotes = prospect.adminNotes || "";
    const newNotes = prevNotes ? `${prevNotes}\n\n${note}` : note;

    await updateProspect(prospect.id, {
      adminNotes: newNotes,
      adminNotesUpdatedAt: nowIso,
      // Don't change primary status — they may still be in an active
      // funnel step. adminNotes is the authoritative signal for the
      // reminder cron pickup.
    });

    return NextResponse.json({
      success: true,
      message: `Got it — I'll send a reminder in ${reminderDays} days.`,
      scheduledFor: when.toISOString(),
    });
  } catch (err) {
    console.error("[reminder] error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
