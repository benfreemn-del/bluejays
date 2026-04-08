import fs from "fs";
import path from "path";
import type { Prospect } from "./types";
import { getProspect, updateProspect } from "./store";
import { sendEmail, getEmailHistory } from "./email-sender";
import { sendSms, getSmsHistory, getInitialSms, getFollowUpSms1, getFollowUpSms2 } from "./sms";
import { getPitchEmail, getFollowUp1, getFollowUp2 } from "./email-templates";
import { generateSmartFollowUp } from "./smart-followup";
import { alertOwner } from "./alerts";

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
  channels: ("email" | "sms")[];
  label: string;
}

export const FUNNEL_STEPS: FunnelStep[] = [
  { day: 0, channels: ["email", "sms"], label: "Initial Pitch" },
  { day: 3, channels: ["email", "sms"], label: "Follow-Up #1" },
  { day: 7, channels: ["email", "sms"], label: "Follow-Up #2" },
  { day: 14, channels: ["email"], label: "Smart Re-engagement" },
  { day: 21, channels: ["email"], label: "Value Add" },
  { day: 30, channels: ["email"], label: "Final Attempt" },
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
  ensureDir();
  if (!fs.existsSync(FUNNEL_FILE)) return [];
  return JSON.parse(fs.readFileSync(FUNNEL_FILE, "utf-8"));
}

function saveEnrollments(enrollments: FunnelEnrollment[]) {
  ensureDir();
  fs.writeFileSync(FUNNEL_FILE, JSON.stringify(enrollments, null, 2));
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
  const enrollments = loadEnrollments();
  const existing = enrollments.find((e) => e.prospectId === prospectId);
  if (existing && !existing.completedAt && !existing.paused) {
    return { success: false, message: "Already in funnel" };
  }

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
  saveEnrollments(filtered);

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
  sent: { name: string; step: string; email: boolean; sms: boolean }[];
  paused: { name: string; reason: string }[];
}> {
  const enrollments = loadEnrollments();
  const sent: { name: string; step: string; email: boolean; sms: boolean }[] = [];
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
      });
    }
  }

  saveEnrollments(enrollments);
  return { processed: enrollments.length, sent, paused };
}

/**
 * Send a specific funnel step to a prospect.
 */
async function sendFunnelStep(
  prospect: Prospect,
  stepIndex: number
): Promise<{ emailSent: boolean; smsSent: boolean }> {
  const step = FUNNEL_STEPS[stepIndex];
  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl}`;
  let emailSent = false;
  let smsSent = false;

  // Send email
  if (step.channels.includes("email") && prospect.email) {
    try {
      let template;
      if (stepIndex === 0) {
        template = getPitchEmail(prospect, previewUrl);
      } else if (stepIndex === 1) {
        template = getFollowUp1(prospect, previewUrl);
      } else if (stepIndex === 2) {
        template = getFollowUp2(prospect, previewUrl);
      } else {
        // Steps 3-5: use smart follow-up
        const smart = generateSmartFollowUp(prospect);
        template = { subject: smart.email.subject, body: smart.email.body, sequence: stepIndex + 1 };
      }

      await sendEmail(prospect.id, prospect.email, template.subject, template.body, template.sequence);
      emailSent = true;
      console.log(`  Funnel step ${stepIndex} email sent to ${prospect.businessName}`);
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
        console.log(`  Funnel step ${stepIndex} text sent to ${prospect.businessName}`);
      }
    } catch (err) {
      console.log(`  Funnel text failed for ${prospect.businessName}: ${(err as Error).message}`);
    }
  }

  return { emailSent, smsSent };
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
