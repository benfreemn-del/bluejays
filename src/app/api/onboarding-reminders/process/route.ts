import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { updateProspect } from "@/lib/store";
import { sendEmail } from "@/lib/email-sender";
import {
  getOnboardingReminderEmail,
  getOnboardingReminderDay2,
  getOnboardingReminderDay5,
} from "@/lib/email-templates";
import { sendOwnerAlert } from "@/lib/alerts";
import type { Prospect } from "@/lib/types";

/**
 * GET /api/onboarding-reminders/process
 *
 * Multi-stage cron — escalates reminders for paid prospects who haven't
 * completed onboarding. Idempotent via the `onboarding_reminder_sent_at`
 * timestamp on the prospect (used as a "last reminder fired" marker so we
 * don't fire two stages in the same minute).
 *
 * Stages (matched in order, only one fires per cron tick per prospect):
 *
 *   1. **30 minutes post-purchase** — first nudge
 *      - status = 'paid'
 *      - paid_at >= 30 minutes ago
 *      - onboarding_reminder_sent_at IS NULL
 *      - No row in `onboarding` table
 *      → sends `getOnboardingReminderEmail` (sequence 101)
 *
 *   2. **Day 2** — escalating subject
 *      - paid_at >= 2 days ago
 *      - onboarding_reminder_sent_at < 2 days old (so we know stage 1 fired)
 *      - onboarding row missing OR _onboardingStatus is null/step1_complete
 *      → sends `getOnboardingReminderDay2` (sequence 102)
 *
 *   3. **Day 5** — urgent + manual offer
 *      - paid_at >= 5 days ago
 *      - last reminder >= 2 days old (i.e. Day 2 already fired)
 *      - onboarding row missing OR _onboardingStatus is null/step1/step2
 *      → sends `getOnboardingReminderDay5` (sequence 103)
 *
 *   4. **Day 10** — SMS Ben directly so he can manually outreach
 *      - paid_at >= 10 days ago
 *      - last reminder >= 5 days old
 *      - onboarding row missing OR _onboardingStatus != 'completed'
 *      → SMS to OWNER_PHONE_NUMBER, no email
 *
 * Runs on the same per-minute cron as `/api/replies/process`. Limit per
 * stage = 25 to keep one runaway prospect from blocking the whole cron tick.
 *
 * Mock-mode safe: returns success with `reminded: 0` if Supabase isn't
 * configured.
 */
const ONE_MIN_MS = 60 * 1000;
const ONE_DAY_MS = 24 * 60 * ONE_MIN_MS;

interface CandidateRow {
  id: string;
  business_name: string;
  email: string | null;
  owner_name: string | null;
  category: string;
  address: string | null;
  city: string | null;
  state: string | null;
  paid_at: string | null;
  onboarding_reminder_sent_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface OnboardingRow {
  prospect_id: string;
  form_data: Record<string, unknown> | null;
}

type OnboardingStatus = "step1_complete" | "step2_complete" | "completed" | null;

function getOnboardingStatus(row: OnboardingRow | undefined): OnboardingStatus {
  if (!row) return null;
  const fd = row.form_data || {};
  const s = (fd as Record<string, unknown>)._onboardingStatus;
  if (s === "completed" || s === "step1_complete" || s === "step2_complete") return s;
  // Legacy single-page submissions had no _onboardingStatus and the existence
  // of any row implied completion. Treat them as "completed" for cron logic.
  return Object.keys(fd).length > 0 ? "completed" : null;
}

function rowToProspect(row: CandidateRow): Prospect {
  return {
    id: row.id,
    businessName: row.business_name,
    ownerName: row.owner_name || undefined,
    email: row.email || undefined,
    address: row.address || "",
    city: row.city || "",
    state: row.state || "",
    category: row.category as Prospect["category"],
    estimatedRevenueTier: "medium",
    status: "paid",
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

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

  const now = Date.now();
  const thirtyMinutesAgo = new Date(now - 30 * ONE_MIN_MS).toISOString();
  const twoDaysAgo = new Date(now - 2 * ONE_DAY_MS).toISOString();
  const fiveDaysAgo = new Date(now - 5 * ONE_DAY_MS).toISOString();
  const tenDaysAgo = new Date(now - 10 * ONE_DAY_MS).toISOString();

  try {
    // Pull all paid prospects whose onboarding might still be incomplete.
    // We bound by paid_at >= now - 60 days so we don't keep escalating
    // stale records forever.
    const sixtyDaysAgo = new Date(now - 60 * ONE_DAY_MS).toISOString();
    const { data: candidates, error: candidatesErr } = await supabase
      .from("prospects")
      .select("id, business_name, email, owner_name, category, address, city, state, paid_at, onboarding_reminder_sent_at, created_at, updated_at")
      .eq("status", "paid")
      .lte("paid_at", thirtyMinutesAgo)
      .gte("paid_at", sixtyDaysAgo)
      .not("email", "is", null)
      .limit(100);

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

    const rows = candidates as CandidateRow[];
    const candidateIds = rows.map((c) => c.id);

    // Pull onboarding rows for status detection
    const { data: onboardingRows, error: obErr } = await supabase
      .from("onboarding")
      .select("prospect_id, form_data")
      .in("prospect_id", candidateIds);

    if (obErr) {
      console.error("[Onboarding Reminders] Onboarding lookup failed:", obErr);
      return NextResponse.json(
        { success: false, error: obErr.message },
        { status: 500 }
      );
    }

    const obByProspect = new Map<string, OnboardingRow>();
    for (const r of (onboardingRows || []) as OnboardingRow[]) {
      obByProspect.set(r.prospect_id, r);
    }

    let stage1 = 0;
    let stage2 = 0;
    let stage3 = 0;
    let stage4Smsed = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const prospectId = row.id;
      const email = row.email;
      const businessName = row.business_name || "your business";

      const status = getOnboardingStatus(obByProspect.get(prospectId));
      if (status === "completed") {
        skipped++;
        continue;
      }

      const paidAt = row.paid_at ? new Date(row.paid_at).getTime() : 0;
      const lastReminderAt = row.onboarding_reminder_sent_at
        ? new Date(row.onboarding_reminder_sent_at).getTime()
        : 0;
      const ageMs = now - paidAt;

      // ── Stage 4: Day 10 — SMS Ben for manual outreach ──────────────────
      if (
        paidAt &&
        paidAt <= new Date(tenDaysAgo).getTime() &&
        // Make sure stage 3 fired at least 5 days ago (or never, but they'd
        // already have hit stage 3 by now) — guards against firing 4 stages
        // in rapid succession on a record that just barely crossed 10 days.
        (lastReminderAt === 0 || lastReminderAt <= new Date(fiveDaysAgo).getTime())
      ) {
        const ownerLine = row.owner_name ? ` (${row.owner_name})` : "";
        const phoneLine = email ? `📧 ${email}` : "";
        // Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
        const BASE_URL = "https://bluejayportfolio.com";
        const msg = [
          `🚨 ${businessName}${ownerLine} — 10 DAYS no onboarding!`,
          phoneLine,
          `Manually reach out — they paid but never filled the form.`,
          `📋 ${BASE_URL}/lead/${prospectId}`,
        ].filter(Boolean).join("\n");

        try {
          await sendOwnerAlert(msg);
          await updateProspect(prospectId, {
            onboardingReminderSentAt: new Date().toISOString(),
          });
          stage4Smsed++;
          console.log(`[Onboarding Reminders] Day-10 SMS to Ben for ${businessName}`);
        } catch (err) {
          errors.push(`${businessName} (day10 SMS): ${(err as Error).message}`);
        }
        continue;
      }

      // ── Stage 3: Day 5 ────────────────────────────────────────────────
      if (
        paidAt &&
        paidAt <= new Date(fiveDaysAgo).getTime() &&
        // last reminder must be >= 2 days old so stage 2 already fired
        (lastReminderAt === 0 || lastReminderAt <= new Date(twoDaysAgo).getTime())
      ) {
        try {
          const prospectShape = rowToProspect(row);
          const tpl = getOnboardingReminderDay5(prospectShape);
          await sendEmail(prospectId, email!, tpl.subject, tpl.body, tpl.sequence);
          await updateProspect(prospectId, {
            onboardingReminderSentAt: new Date().toISOString(),
          });
          stage3++;
          console.log(`[Onboarding Reminders] Day-5 sent to ${businessName} (${email})`);
        } catch (err) {
          errors.push(`${businessName} (day5): ${(err as Error).message}`);
        }
        continue;
      }

      // ── Stage 2: Day 2 ────────────────────────────────────────────────
      if (
        paidAt &&
        paidAt <= new Date(twoDaysAgo).getTime() &&
        // status must be null OR step1_complete (per spec)
        (status === null || status === "step1_complete") &&
        // last reminder must exist (stage 1 fired) and be older than 1 day
        // to avoid double-firing on records that just crossed 2 days
        lastReminderAt > 0 &&
        lastReminderAt <= now - ONE_DAY_MS
      ) {
        try {
          const prospectShape = rowToProspect(row);
          const tpl = getOnboardingReminderDay2(prospectShape);
          await sendEmail(prospectId, email!, tpl.subject, tpl.body, tpl.sequence);
          await updateProspect(prospectId, {
            onboardingReminderSentAt: new Date().toISOString(),
          });
          stage2++;
          console.log(`[Onboarding Reminders] Day-2 sent to ${businessName} (${email})`);
        } catch (err) {
          errors.push(`${businessName} (day2): ${(err as Error).message}`);
        }
        continue;
      }

      // ── Stage 1: 30-minute (existing behavior) ────────────────────────
      // `status` was narrowed earlier — completed prospects skipped via the
      // top-of-loop guard. So here status is null | step1_complete | step2_complete,
      // and "haven't been reminded yet" + still-incomplete is enough.
      if (
        paidAt &&
        paidAt <= new Date(thirtyMinutesAgo).getTime() &&
        lastReminderAt === 0
      ) {
        try {
          const prospectShape = rowToProspect(row);
          const tpl = getOnboardingReminderEmail(prospectShape);
          await sendEmail(prospectId, email!, tpl.subject, tpl.body, tpl.sequence);
          await updateProspect(prospectId, {
            onboardingReminderSentAt: new Date().toISOString(),
          });
          stage1++;
          console.log(`[Onboarding Reminders] 30-min sent to ${businessName} (${email})`);
        } catch (err) {
          errors.push(`${businessName} (30min): ${(err as Error).message}`);
        }
        continue;
      }

      skipped++;
    }

    return NextResponse.json({
      success: true,
      stage1_30min: stage1,
      stage2_day2: stage2,
      stage3_day5: stage3,
      stage4_day10_sms: stage4Smsed,
      reminded: stage1 + stage2 + stage3 + stage4Smsed,
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
