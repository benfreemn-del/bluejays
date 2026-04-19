import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { updateProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import { getOnboardingReminderEmail } from "@/lib/email-templates";
import type { Prospect } from "@/lib/types";

/**
 * GET /api/onboarding-reminders/process
 *
 * Cron-triggered endpoint that sends the 30-minute "you haven't filled out
 * the onboarding form yet" reminder to paid prospects.
 *
 * Criteria for sending:
 *   - status = 'paid'
 *   - paid_at >= 30 minutes ago (enough time for them to realistically submit)
 *   - onboarding_reminder_sent_at IS NULL (haven't already reminded)
 *   - No row in the `onboarding` table for this prospect (still haven't submitted)
 *   - They have an email on file
 *
 * This runs on the same per-minute cron as `/api/replies/process` (piggybacks
 * on Vercel's existing cron schedule — no new cron slot required).
 *
 * Idempotent: flips `prospects.onboarding_reminder_sent_at` on success so
 * future cron fires skip this prospect.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      message: "Supabase not configured — skipping onboarding reminder check",
      reminded: 0,
    });
  }

  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // Find paid prospects who crossed the 30-minute threshold and haven't
    // been reminded yet. Limit to a small batch so a large backlog can't
    // blow past SendGrid's warmup cap in one cron tick.
    const { data: candidates, error: candidatesErr } = await supabase
      .from("prospects")
      .select("*")
      .eq("status", "paid")
      .lte("paid_at", thirtyMinutesAgo)
      .is("onboarding_reminder_sent_at", null)
      .not("email", "is", null)
      .limit(25);

    if (candidatesErr) {
      console.error("[Onboarding Reminders] Query failed:", candidatesErr);
      return NextResponse.json(
        { success: false, error: candidatesErr.message },
        { status: 500 }
      );
    }

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ success: true, reminded: 0, skipped: 0 });
    }

    // Pull the list of prospects who've already submitted onboarding so we
    // can exclude them. One IN-query is cheaper than N single-row lookups.
    const candidateIds = candidates.map((c) => c.id as string);
    const { data: submitted, error: submittedErr } = await supabase
      .from("onboarding")
      .select("prospect_id")
      .in("prospect_id", candidateIds);

    if (submittedErr) {
      console.error("[Onboarding Reminders] Onboarding lookup failed:", submittedErr);
      // Fail-safe: don't send reminders if we can't verify who already submitted
      return NextResponse.json(
        { success: false, error: submittedErr.message },
        { status: 500 }
      );
    }

    const submittedIds = new Set((submitted || []).map((r) => r.prospect_id as string));

    let reminded = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of candidates) {
      const prospectId = row.id as string;
      const email = row.email as string | null;
      const businessName = (row.business_name as string) || "your business";

      if (submittedIds.has(prospectId)) {
        skipped++;
        continue;
      }
      if (!email) {
        skipped++;
        continue;
      }

      // Build a minimal Prospect-shaped object for the template. We only
      // need businessName, ownerName, id — keeps this resilient to new
      // columns without a full dbToProspect import.
      const prospectShape: Prospect = {
        id: prospectId,
        businessName,
        ownerName: (row.owner_name as string | null) || undefined,
        email: email,
        address: (row.address as string) || "",
        city: (row.city as string) || "",
        state: (row.state as string) || "",
        category: row.category as Prospect["category"],
        estimatedRevenueTier: "medium",
        status: "paid",
        createdAt: (row.created_at as string) || new Date().toISOString(),
        updatedAt: (row.updated_at as string) || new Date().toISOString(),
      };

      try {
        const template = getOnboardingReminderEmail(prospectShape);
        await sendEmail(prospectId, email, template.subject, template.body, template.sequence);
        await updateProspect(prospectId, {
          onboardingReminderSentAt: new Date().toISOString(),
        });
        console.log(`[Onboarding Reminders] Sent reminder to ${businessName} (${email})`);
        reminded++;
      } catch (err) {
        const msg = (err as Error).message;
        errors.push(`${businessName}: ${msg}`);
        console.error(`[Onboarding Reminders] Failed to remind ${prospectId}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      reminded,
      skipped,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    console.error("[Onboarding Reminders] Error:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
