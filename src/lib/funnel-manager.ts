import fs from "fs";
import path from "path";
import type { Prospect } from "./types";
import { getProspect, updateProspect } from "./store";
import { sendEmail, getEmailHistory } from "./email-sender";
import { sendSms, getSmsHistory, getInitialSms, getFollowUpSms1, getFollowUpSms2, getPostVoicemailSms } from "./sms";
import { getPitchEmail, getFollowUp1, getFollowUp2 } from "./email-templates";
import { generateSmartFollowUp } from "./smart-followup";
import { alertOwner } from "./alerts";
import { dropVoicemail } from "./voicemail";
import { supabase, isSupabaseConfigured } from "./supabase";
import { generatePersonalizedProposal } from "./proposal-generator";

const FUNNEL_FILE = path.join(process.cwd(), "data", "funnel-enrollments.json");
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export interface FunnelEnrollment {
  prospectId: string;
  enrolledAt: string;
  currentStep: number;
  lastSentAt: string | null;
  paused: boolean;
  pauseReason?: string;
  completedAt?: string;
}

export interface FunnelStep {
  day: number;
  channels: ("email" | "sms" | "voicemail")[];
  label: string;
}

/**
 * 7-step funnel matching CLAUDE.md and agent-personality.ts:
 * Days 0, 2, 5, 12, 18, 21, 30 — with voicemail drops on Days 2 and 18.
 */
export const FUNNEL_STEPS: FunnelStep[] = [
  { day: 0, channels: ["email", "sms"], label: "Initial Pitch" },
  { day: 2, channels: ["voicemail"], label: "Voicemail Drop" },
  { day: 5, channels: ["email"], label: "Gentle Follow-Up" },
  { day: 12, channels: ["email", "sms"], label: "Value Reframe" },
  { day: 18, channels: ["voicemail"], label: "Follow-Up VM" },
  { day: 21, channels: ["email"], label: "Social Proof" },
  { day: 30, channels: ["email"], label: "Final Check-In" },
];

/**
 * Statuses that should stop the funnel immediately.
 * When a prospect reaches any of these states, all automated outreach stops.
 */
const FUNNEL_STOP_STATUSES = [
  "responded",
  "interested",
  "claimed",
  "paid",
  "dismissed",
  "unsubscribed",
];

function ensureDir() {
  const dir = path.dirname(FUNNEL_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadEnrollments(): FunnelEnrollment[] {
  // On Vercel, use Supabase for enrollment persistence
  // Local file is only for dev; loadEnrollmentsAsync handles Supabase
  if (process.env.VERCEL) {
    // Synchronous fallback — return empty; callers should use async version
    console.log("[Funnel] Skipping local file read on Vercel — use async loader");
    return [];
  }
  ensureDir();
  if (!fs.existsSync(FUNNEL_FILE)) return [];
  return JSON.parse(fs.readFileSync(FUNNEL_FILE, "utf-8"));
}

async function loadEnrollmentsAsync(): Promise<FunnelEnrollment[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("funnel_enrollments")
        .select("*");
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => ({
          prospectId: row.prospect_id as string,
          enrolledAt: row.enrolled_at as string,
          currentStep: row.current_step as number,
          lastSentAt: row.last_sent_at as string | null,
          paused: row.paused as boolean,
          pauseReason: row.pause_reason as string | undefined,
          completedAt: row.completed_at as string | undefined,
        }));
      }
    } catch {
      // Table might not exist yet — fall through to local
    }
  }
  return loadEnrollments();
}

function saveEnrollments(enrollments: FunnelEnrollment[]) {
  // Skip file writes on Vercel (read-only filesystem)
  if (process.env.VERCEL) {
    console.log("[Funnel] Skipping local file write on Vercel — using Supabase");
    return;
  }
  ensureDir();
  fs.writeFileSync(FUNNEL_FILE, JSON.stringify(enrollments, null, 2));
}

async function saveEnrollmentsAsync(enrollments: FunnelEnrollment[]) {
  if (isSupabaseConfigured()) {
    try {
      for (const e of enrollments) {
        await supabase.from("funnel_enrollments").upsert({
          prospect_id: e.prospectId,
          enrolled_at: e.enrolledAt,
          current_step: e.currentStep,
          last_sent_at: e.lastSentAt,
          paused: e.paused,
          pause_reason: e.pauseReason || null,
          completed_at: e.completedAt || null,
        }, { onConflict: "prospect_id" });
      }
    } catch {
      // Table might not exist yet
    }
  }
  saveEnrollments(enrollments);
}

export function getEnrollment(prospectId: string): FunnelEnrollment | undefined {
  return loadEnrollments().find((e) => e.prospectId === prospectId);
}

export function getAllEnrollments(): FunnelEnrollment[] {
  return loadEnrollments();
}

/**
 * Enroll a prospect in the auto-funnel.
 * Immediately sends Day 0 (initial pitch email + text).
 */
export async function enrollInFunnel(prospectId: string): Promise<{ success: boolean; message: string }> {
  const prospect = await getProspect(prospectId);
  if (!prospect) return { success: false, message: "Prospect not found" };
  if (!prospect.generatedSiteUrl) return { success: false, message: "No preview site — generate one first" };

  // Don't enroll if prospect is in a stop state
  if (FUNNEL_STOP_STATUSES.includes(prospect.status)) {
    return { success: false, message: `Prospect status is '${prospect.status}' — cannot enroll in funnel` };
  }

  // Don't enroll if funnel is paused on the prospect record
  if (prospect.funnelPaused) {
    return { success: false, message: "Prospect funnel is paused (they replied or unsubscribed)" };
  }

  // Check if already enrolled
  const enrollments = await loadEnrollmentsAsync();
  const existing = enrollments.find((e) => e.prospectId === prospectId);
  if (existing && !existing.completedAt && !existing.paused) {
    return { success: false, message: "Already in funnel" };
  }

  // Personalized proposals must exist before a prospect enters the funnel.
  await generatePersonalizedProposal(prospectId);

  // Send Day 0 immediately
  const results = await sendFunnelStep(prospect, 0);

  // Save enrollment
  const enrollment: FunnelEnrollment = {
    prospectId,
    enrolledAt: new Date().toISOString(),
    currentStep: 0,
    lastSentAt: new Date().toISOString(),
    paused: false,
  };

  // Remove old enrollment if re-enrolling
  const filtered = enrollments.filter((e) => e.prospectId !== prospectId);
  filtered.push(enrollment);
  await saveEnrollmentsAsync(filtered);

  // Update prospect status
  await updateProspect(prospectId, { status: "contacted" });

  return {
    success: true,
    message: `Funnel started for ${prospect.businessName}. ${results.emailSent ? "Email sent. " : ""}${results.smsSent ? "Text sent." : ""}`,
  };
}

/**
 * Run the daily funnel check — sends next step to all prospects who are due.
 * Call this from a cron job (POST /api/funnel/run).
 *
 * Respects both the enrollment-level paused flag AND the prospect-level
 * funnelPaused flag (set when a prospect replies via inbound email/SMS).
 */
export async function runDailyFunnel(): Promise<{
  processed: number;
  sent: { name: string; step: string; email: boolean; sms: boolean; voicemail: boolean }[];
  paused: { name: string; reason: string }[];
}> {
  const enrollments = await loadEnrollmentsAsync();
  const sent: { name: string; step: string; email: boolean; sms: boolean; voicemail: boolean }[] = [];
  const paused: { name: string; reason: string }[] = [];

  for (const enrollment of enrollments) {
    if (enrollment.paused || enrollment.completedAt) continue;

    const prospect = await getProspect(enrollment.prospectId);
    if (!prospect) continue;

    // Check if prospect-level funnel is paused (set by inbound reply handler)
    if (prospect.funnelPaused) {
      enrollment.paused = true;
      enrollment.pauseReason = "Prospect replied — funnel paused by AI responder";
      paused.push({ name: prospect.businessName, reason: "replied" });
      continue;
    }

    // Check if prospect has reached a stop status
    if (FUNNEL_STOP_STATUSES.includes(prospect.status)) {
      enrollment.paused = true;
      enrollment.pauseReason = `Prospect status: ${prospect.status}`;
      paused.push({ name: prospect.businessName, reason: prospect.status });

      // Alert owner for notable status changes
      if (["responded", "interested", "claimed", "paid"].includes(prospect.status)) {
        await alertOwner({
          type: "prospect-responded",
          message: `${prospect.businessName} is now '${prospect.status}'! Funnel auto-paused.`,
          prospect,
          timestamp: new Date().toISOString(),
        });
      }
      continue;
    }

    // Check if dismissed or unsubscribed
    if (prospect.status === "unsubscribed") {
      enrollment.paused = true;
      enrollment.pauseReason = "Unsubscribed — all outreach stopped";
      continue;
    }

    // Calculate next step
    const nextStep = enrollment.currentStep + 1;
    if (nextStep >= FUNNEL_STEPS.length) {
      enrollment.completedAt = new Date().toISOString();
      continue;
    }

    // Check if enough days have passed
    const daysSinceEnrolled = Math.floor(
      (Date.now() - new Date(enrollment.enrolledAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const stepConfig = FUNNEL_STEPS[nextStep];

    if (daysSinceEnrolled >= stepConfig.day) {
      // Time to send next step
      const results = await sendFunnelStep(prospect, nextStep);
      enrollment.currentStep = nextStep;
      enrollment.lastSentAt = new Date().toISOString();

      sent.push({
        name: prospect.businessName,
        step: stepConfig.label,
        email: results.emailSent,
        sms: results.smsSent,
        voicemail: results.voicemailSent,
      });
    }
  }

  await saveEnrollmentsAsync(enrollments);
  return { processed: enrollments.length, sent, paused };
}

/**
 * Send a specific funnel step to a prospect.
 * Handles email, SMS, and voicemail channels per the step config.
 */
async function sendFunnelStep(
  prospect: Prospect,
  stepIndex: number
): Promise<{ emailSent: boolean; smsSent: boolean; voicemailSent: boolean }> {
  const step = FUNNEL_STEPS[stepIndex];
  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl}`;
  let emailSent = false;
  let smsSent = false;
  let voicemailSent = false;

  // Send email
  if (step.channels.includes("email") && prospect.email) {
    try {
      let template;
      if (stepIndex === 0) {
        template = getPitchEmail(prospect, previewUrl);
      } else if (stepIndex === 2) {
        // Step 2 = Day 5 Gentle Follow-Up
        template = getFollowUp1(prospect, previewUrl);
      } else if (stepIndex === 3) {
        // Step 3 = Day 12 Value Reframe
        template = getFollowUp2(prospect, previewUrl);
      } else {
        // Steps 5-6 (Day 21, Day 30): use smart follow-up
        const smart = generateSmartFollowUp(prospect);
        template = { subject: smart.email.subject, body: smart.email.body, sequence: stepIndex + 1 };
      }

      await sendEmail(prospect.id, prospect.email, template.subject, template.body, template.sequence);
      emailSent = true;
      console.log(`  Funnel step ${stepIndex} (Day ${step.day}) email sent to ${prospect.businessName}`);
    } catch (err) {
      console.log(`  Funnel email failed for ${prospect.businessName}: ${(err as Error).message}`);
    }
  }

  // Send SMS
  if (step.channels.includes("sms") && prospect.phone) {
    try {
      const smsHistory = await getSmsHistory(prospect.id);
      const lastSeq = smsHistory.length > 0 ? Math.max(...smsHistory.map((s) => s.sequence)) : 0;

      if (lastSeq < 3) {
        let body: string;
        if (lastSeq === 0) body = getInitialSms(prospect, previewUrl);
        else if (lastSeq === 1) body = getFollowUpSms1(prospect, previewUrl);
        else body = getFollowUpSms2(prospect, previewUrl);

        await sendSms(prospect.id, prospect.phone, body, lastSeq + 1);
        smsSent = true;
        console.log(`  Funnel step ${stepIndex} (Day ${step.day}) text sent to ${prospect.businessName}`);
      }
    } catch (err) {
      console.log(`  Funnel text failed for ${prospect.businessName}: ${(err as Error).message}`);
    }
  }

  // Drop voicemail (Days 2 and 18 per CLAUDE.md)
  if (step.channels.includes("voicemail") && prospect.phone) {
    try {
      const drop = await dropVoicemail(prospect.id, prospect.phone, prospect.businessName);
      voicemailSent = drop.status === "sent";
      console.log(`  📞 Funnel step ${stepIndex} (Day ${step.day}) voicemail ${drop.status} for ${prospect.businessName}`);

      // Per CLAUDE.md: "Always follow up a voicemail with a text"
      // Send a follow-up SMS shortly after the voicemail drop
      if (voicemailSent) {
        try {
          const vmFollowUpText = getPostVoicemailSms(prospect, previewUrl);
          const smsHistory = await getSmsHistory(prospect.id);
          const nextSeq = smsHistory.length > 0 ? Math.max(...smsHistory.map((s) => s.sequence)) + 1 : 1;
          if (nextSeq <= 3) {
            await sendSms(prospect.id, prospect.phone, vmFollowUpText, nextSeq);
            smsSent = true;
            console.log(`  📱 Post-voicemail follow-up text sent to ${prospect.businessName}`);
          }
        } catch (err) {
          console.log(`  ⚠️ Post-voicemail text failed for ${prospect.businessName}: ${(err as Error).message}`);
        }
      }
    } catch (err) {
      console.log(`  ⚠️ Voicemail drop failed for ${prospect.businessName}: ${(err as Error).message}`);
    }
  }

  return { emailSent, smsSent, voicemailSent };
}

/**
 * Pause a prospect's funnel.
 */
export function pauseFunnel(prospectId: string, reason: string): boolean {
  const enrollments = loadEnrollments();
  const enrollment = enrollments.find((e) => e.prospectId === prospectId);
  if (!enrollment) return false;
  enrollment.paused = true;
  enrollment.pauseReason = reason;
  saveEnrollments(enrollments);
  return true;
}

/**
 * Resume a paused funnel.
 * Also clears the prospect-level funnelPaused flag.
 */
export async function resumeFunnel(prospectId: string): Promise<boolean> {
  const enrollments = loadEnrollments();
  const enrollment = enrollments.find((e) => e.prospectId === prospectId);
  if (!enrollment) return false;
  enrollment.paused = false;
  enrollment.pauseReason = undefined;
  saveEnrollments(enrollments);

  // Also clear the prospect-level pause flag
  await updateProspect(prospectId, { funnelPaused: false });
  return true;
}
