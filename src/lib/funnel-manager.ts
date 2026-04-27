import fs from "fs";
import path from "path";
import type { Prospect } from "./types";
import { getProspect, updateProspect } from "./store";
import { getInitialSms, getFollowUpSms1, getFollowUpSms2, getPostVoicemailSms, getSmsHistory } from "./sms";
import {
  getPitchEmail,
  getFollowUp1,
  getFollowUp2,
  getFollowUp3,
  getFollowUp4,
  getFollowUp5,
  getFollowUp6,
} from "./email-templates";
import { generateSmartFollowUp } from "./smart-followup";
import { alertOwner } from "./alerts";
import { dropVoicemail } from "./voicemail";
import { supabase, isSupabaseConfigured } from "./supabase";
import { generatePersonalizedProposal } from "./proposal-generator";
import { getShortPreviewUrl } from "./short-urls";
import { addUtm } from "./utm";
import {
  attemptFunnelDelivery,
  cancelFunnelRetry,
  getActiveFunnelRetry,
  getDueFunnelRetries,
  markFunnelRetrySent,
  rescheduleFunnelRetry,
  type DeliveryChannel,
  type EmailDeliveryPayload,
  type FunnelDeliveryPayload,
  type FunnelRetryRecord,
  type SmsDeliveryPayload,
} from "./funnel-delivery";

const FUNNEL_FILE = path.join(process.cwd(), "data", "funnel-enrollments.json");
// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

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
 * 9-step funnel — original 7 (Days 0–30) plus Wave-3 long-tail touches
 * at Day 45 (graceful goodbye) and Day 60 (final seasonal hook).
 *
 * Voicemail drops on Days 2 and 18; everything else is email + (inbound-
 * only) SMS. The Day 45 and Day 60 steps are email-only — by that point
 * SMS would feel intrusive even on opted-in prospects, and the data
 * shows the highest-reply rate at touches 5–8 comes from "graceful out"
 * style emails, not aggressive multi-channel.
 *
 * Industry data behind the extension: 50%+ of B2B replies come on
 * touches 5–8. Capping at Day 30 leaves real conversion on the table.
 */
export const FUNNEL_STEPS: FunnelStep[] = [
  { day: 0, channels: ["email", "sms"], label: "Initial Pitch" },
  { day: 2, channels: ["voicemail"], label: "Voicemail Drop" },
  { day: 5, channels: ["email", "sms"], label: "Gentle Follow-Up" },
  { day: 12, channels: ["email", "sms"], label: "Value Reframe" },
  { day: 18, channels: ["voicemail"], label: "Follow-Up VM" },
  { day: 21, channels: ["email", "sms"], label: "Social Proof" },
  { day: 30, channels: ["email"], label: "Final Check-In" },
  // Wave-3 long-tail touches (added 2026-04-24). Email-only by design —
  // SMS frequency at this distance from a Day-0 cold scrape would feel
  // pushy even on opted-in prospects, and "graceful goodbye" framing
  // historically out-performs urgency-led closes by 2-3x in published
  // reply-rate studies.
  { day: 45, channels: ["email"], label: "graceful_goodbye" },
  { day: 60, channels: ["email"], label: "final_seasonal_hook" },
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
  "qc_failed",
];

function ensureDir() {
  const dir = path.dirname(FUNNEL_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadEnrollments(): FunnelEnrollment[] {
  if (process.env.VERCEL) {
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
          currentStep: Number(row.current_step),
          lastSentAt: row.last_sent_at as string | null,
          paused: Boolean(row.paused),
          pauseReason: row.pause_reason as string | undefined,
          completedAt: row.completed_at as string | undefined,
        }));
      }
    } catch {
      // Table might not exist yet — fall through to local.
    }
  }
  return loadEnrollments();
}

function saveEnrollments(enrollments: FunnelEnrollment[]) {
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
      for (const enrollment of enrollments) {
        await supabase.from("funnel_enrollments").upsert({
          prospect_id: enrollment.prospectId,
          enrolled_at: enrollment.enrolledAt,
          current_step: enrollment.currentStep,
          last_sent_at: enrollment.lastSentAt,
          paused: enrollment.paused,
          pause_reason: enrollment.pauseReason || null,
          completed_at: enrollment.completedAt || null,
        }, { onConflict: "prospect_id" });
      }
    } catch {
      // Table might not exist yet.
    }
  }
  saveEnrollments(enrollments);
}

function findEnrollment(enrollments: FunnelEnrollment[], prospectId: string): FunnelEnrollment | undefined {
  return enrollments.find((enrollment) => enrollment.prospectId === prospectId);
}

function markEnrollmentStepDelivered(enrollment: FunnelEnrollment, stepIndex: number) {
  enrollment.currentStep = Math.max(enrollment.currentStep, stepIndex);
  enrollment.lastSentAt = new Date().toISOString();
  if (enrollment.currentStep >= FUNNEL_STEPS.length - 1) {
    enrollment.completedAt = new Date().toISOString();
  }
}

function isStopStatus(status: string): boolean {
  return FUNNEL_STOP_STATUSES.includes(status);
}

async function getEmailTemplate(prospect: Prospect, stepIndex: number, previewUrl: string) {
  // Fetch the AI-generated TTS walkthrough video URL (if ready) so every
  // email in the funnel can embed it. Failures here should never block outreach.
  let videoUrl: string | undefined;
  try {
    const { getProspectVideoUrl } = await import("./video-generator");
    videoUrl = await getProspectVideoUrl(prospect.id);
  } catch {
    videoUrl = undefined;
  }

  // Step indices map to FUNNEL_STEPS:
  //   0 = Day 0  Initial Pitch              → getPitchEmail
  //   1 = Day 2  Voicemail (no email)
  //   2 = Day 5  Gentle Follow-Up           → getFollowUp1 (campaign=followup_day5_re)
  //   3 = Day 12 Value Reframe              → getFollowUp2 (campaign=followup_day12_value_reframe)
  //   4 = Day 18 Follow-Up VM (no email)
  //   5 = Day 21 Social Proof               → getFollowUp3 (campaign=followup_day21_social_proof)
  //   6 = Day 30 Final Check-In             → getFollowUp4 (campaign=followup_day30_final)
  //   7 = Day 45 Graceful Goodbye           → getFollowUp5 (campaign=followup_day45_graceful_goodbye)
  //   8 = Day 60 Final Seasonal Hook        → getFollowUp6 (campaign=followup_day60_final_seasonal)
  if (stepIndex === 0) {
    // Note: getPitchEmail only takes (prospect, previewUrl, videoUrl) —
    // the proposal URL is referenced from the dashboard, not the email.
    return getPitchEmail(prospect, previewUrl, videoUrl);
  }
  if (stepIndex === 2) {
    return getFollowUp1(prospect, previewUrl, videoUrl);
  }
  if (stepIndex === 3) {
    return getFollowUp2(prospect, previewUrl, videoUrl);
  }
  if (stepIndex === 5) {
    return getFollowUp3(prospect, previewUrl, videoUrl);
  }
  if (stepIndex === 6) {
    return getFollowUp4(prospect, previewUrl, videoUrl);
  }
  if (stepIndex === 7) {
    return getFollowUp5(prospect, previewUrl);
  }
  if (stepIndex === 8) {
    return getFollowUp6(prospect, previewUrl);
  }

  const smart = generateSmartFollowUp(prospect);
  return {
    subject: smart.email.subject,
    body: smart.email.body,
    sequence: stepIndex + 1,
  };
}

function getFallbackSmsBody(prospect: Prospect, stepIndex: number, previewUrl: string): string {
  const firstName = prospect.ownerName?.split(" ")[0] || "there";

  if (stepIndex === 0) return getInitialSms(prospect, previewUrl);
  if (stepIndex === 2) return getFollowUpSms1(prospect, previewUrl);
  if (stepIndex === 3) return getFollowUpSms2(prospect, previewUrl);
  if (stepIndex === 5) {
    return `Hi ${firstName}, just checking on the site we built for ${prospect.businessName}: ${previewUrl} If you want edits or want to claim it, reply here. Reply STOP to opt out.`;
  }
  if (stepIndex === 6) {
    return `Final check-in from BlueJays, ${firstName}. Your ${prospect.businessName} preview is still live here: ${previewUrl} If you want it transferred to you, just reply. Reply STOP to opt out.`;
  }

  return `Hi ${firstName}, your ${prospect.businessName} preview is still ready here: ${previewUrl} Let us know if you want any changes or want to claim it. Reply STOP to opt out.`;
}

function getVoicemailFallbackEmail(prospect: Prospect, previewUrl: string, stepIndex: number): EmailDeliveryPayload | undefined {
  if (!prospect.email) return undefined;

  const subject = stepIndex === 4
    ? `Quick follow-up about your ${prospect.businessName} website preview`
    : `Quick follow-up after our voicemail about ${prospect.businessName}`;

  // Tag the post-voicemail fallback email distinctly so we can measure
  // whether the voicemail-then-email pattern outperforms email-only
  // touches in the conversion funnel.
  const taggedUrl = addUtm(previewUrl, "voicemail_followup_email", "voicemail_followup_email", `voicemail_followup_step${stepIndex}`);

  const firstName = prospect.ownerName?.split(" ")[0] || "there";
  const body = `Hi ${firstName},\n\nI just tried to reach you about the website we built for ${prospect.businessName}. You can see it here: ${taggedUrl}\n\nIf you'd like edits or want to claim it, reply here.\n\n— Ben`;

  return {
    to: prospect.email,
    subject,
    body,
    sequence: stepIndex + 1,
  };
}

async function getNextSmsSequence(prospectId: string): Promise<number> {
  const smsHistory = await getSmsHistory(prospectId);
  const lastSequence = smsHistory.length > 0 ? Math.max(...smsHistory.map((entry) => entry.sequence)) : 0;
  return lastSequence + 1;
}

async function buildStepPayload(prospect: Prospect, stepIndex: number, previewUrl: string): Promise<FunnelDeliveryPayload | undefined> {
  const step = FUNNEL_STEPS[stepIndex];

  // A2P 10DLC COMPLIANCE: only send SMS to prospects who explicitly opted in.
  // `source: "inbound"` means the prospect submitted the /get-started form and
  // ticked the SMS consent checkbox — that's a verifiable CTA per TCR rules.
  // `source: "scouted"` (auto-scout cold outreach) has NOT opted in and must
  // NOT receive SMS, or the campaign can get yanked and the number flagged.
  // Cold-outreach prospects still get email + voicemail (both have their own
  // compliance frameworks that permit contacting publicly-listed business
  // numbers/emails). Lock this in before A2P approval — TCR revokes campaigns
  // that send to scraped numbers post-approval. Undo only with written
  // consent captured through another channel (manual phone confirmation, etc).
  const isInboundOptIn = prospect.source === "inbound";
  const smsAllowedForThisProspect = isInboundOptIn;

  const emailTemplate = step.channels.includes("email") ? await getEmailTemplate(prospect, stepIndex, previewUrl) : undefined;
  const smsBody = step.channels.includes("sms") && smsAllowedForThisProspect
    ? getFallbackSmsBody(prospect, stepIndex, previewUrl)
    : undefined;

  const email: EmailDeliveryPayload | undefined = emailTemplate && prospect.email
    ? {
        to: prospect.email,
        subject: emailTemplate.subject,
        body: emailTemplate.body,
        htmlBody: emailTemplate.htmlBody,  // pitch email includes inline screenshot
        sequence: emailTemplate.sequence,
      }
    : undefined;

  const sms: SmsDeliveryPayload | undefined = smsBody && prospect.phone
    ? {
        to: prospect.phone,
        body: smsBody,
        sequence: await getNextSmsSequence(prospect.id),
      }
    : undefined;

  if (!email && !sms) return undefined;

  const preferredChannel: DeliveryChannel = step.channels.includes("sms") && !step.channels.includes("email")
    ? "sms"
    : "email";

  return {
    prospectId: prospect.id,
    stepIndex,
    stepLabel: step.label,
    preferredChannel,
    email,
    sms,
  };
}

async function buildVoicemailFollowUpPayload(prospect: Prospect, stepIndex: number, previewUrl: string): Promise<FunnelDeliveryPayload | undefined> {
  // Same A2P 10DLC rule as buildStepPayload — only inbound opt-ins receive SMS.
  // Voicemail goes to everyone (carriers treat ringless VM under different
  // compliance framework), but the SMS that would follow the VM is gated to
  // prospects who filled out the /get-started form with consent ticked.
  const smsAllowedForThisProspect = prospect.source === "inbound";

  const sms = prospect.phone && smsAllowedForThisProspect
    ? {
        to: prospect.phone,
        body: getPostVoicemailSms(prospect, previewUrl),
        sequence: await getNextSmsSequence(prospect.id),
      }
    : undefined;

  const email = getVoicemailFallbackEmail(prospect, previewUrl, stepIndex);

  if (!sms && !email) return undefined;

  return {
    prospectId: prospect.id,
    stepIndex,
    stepLabel: `${FUNNEL_STEPS[stepIndex].label} Follow-Up`,
    preferredChannel: "sms",
    email,
    sms,
  };
}

function payloadFromRetryRecord(record: FunnelRetryRecord): FunnelDeliveryPayload {
  return {
    prospectId: record.prospectId,
    stepIndex: record.stepIndex,
    stepLabel: record.stepLabel,
    preferredChannel: record.primaryChannel,
    email: record.emailTo && record.emailSubject && record.emailBody && record.emailSequence !== null
      ? {
          to: record.emailTo,
          subject: record.emailSubject,
          body: record.emailBody,
          sequence: record.emailSequence,
        }
      : undefined,
    sms: record.smsTo && record.smsBody && record.smsSequence !== null
      ? {
          to: record.smsTo,
          body: record.smsBody,
          sequence: record.smsSequence,
        }
      : undefined,
  };
}

async function sendFunnelStep(
  prospect: Prospect,
  stepIndex: number,
  options?: { retryCount?: number; queueOnFailure?: boolean }
): Promise<{ success: boolean; emailSent: boolean; smsSent: boolean; voicemailSent: boolean; queuedForRetry: boolean; deliveredChannel: DeliveryChannel | null; lastError?: string }> {
  const step = FUNNEL_STEPS[stepIndex];
  // Short URL for outreach. MUST go through getShortPreviewUrl() because
  // /p/[code] resolves by prospects.short_code (md5(id).slice(0,8)), NOT
  // the first 8 chars of the UUID. Building the URL from prospect.id
  // directly sends a broken link — /p/[uuid-prefix] hits 404 because
  // the UUID prefix doesn't match the stored short_code.
  const previewUrl = getShortPreviewUrl(prospect);
  let emailSent = false;
  let smsSent = false;
  let voicemailSent = false;
  let queuedForRetry = false;
  let deliveredChannel: DeliveryChannel | null = null;
  let lastError: string | undefined;

  if (step.channels.includes("voicemail") && prospect.phone) {
    try {
      const vmStage: "initial" | "followUp" = step.day === 18 ? "followUp" : "initial";
      const drop = await dropVoicemail(prospect.id, prospect.phone, prospect.businessName, vmStage);
      voicemailSent = drop.status === "sent";
      console.log(`  Funnel step ${stepIndex} (Day ${step.day}) voicemail ${drop.status} for ${prospect.businessName}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown voicemail error";
      lastError = message;
      console.log(`  Funnel voicemail failed for ${prospect.businessName}: ${message}`);
    }
  }

  let payload: FunnelDeliveryPayload | undefined;
  if (step.channels.includes("email") || step.channels.includes("sms")) {
    payload = await buildStepPayload(prospect, stepIndex, previewUrl);
  } else if (step.channels.includes("voicemail")) {
    payload = await buildVoicemailFollowUpPayload(prospect, stepIndex, previewUrl);
  }

  if (payload) {
    const delivery = await attemptFunnelDelivery(payload, {
      retryCount: options?.retryCount ?? 0,
      queueOnFailure: options?.queueOnFailure ?? !voicemailSent,
    });

    emailSent = delivery.emailSent;
    smsSent = delivery.smsSent;
    queuedForRetry = delivery.queuedForRetry;
    deliveredChannel = delivery.deliveredChannel;
    lastError = delivery.lastError || lastError;

    if (!delivery.success && delivery.lastError) {
      console.log(`  Funnel channel delivery failed for ${prospect.businessName}: ${delivery.lastError}`);
    }
  }

  return {
    success: voicemailSent || emailSent || smsSent,
    emailSent,
    smsSent,
    voicemailSent,
    queuedForRetry,
    deliveredChannel,
    lastError,
  };
}

async function processQueuedFunnelRetries(
  enrollments: FunnelEnrollment[]
): Promise<{
  sent: { name: string; step: string; email: boolean; sms: boolean; voicemail: boolean }[];
  queued: { name: string; step: string; retryId: string; reason: string }[];
}> {
  const sent: { name: string; step: string; email: boolean; sms: boolean; voicemail: boolean }[] = [];
  const queued: { name: string; step: string; retryId: string; reason: string }[] = [];
  const dueRetries = await getDueFunnelRetries();

  for (const retry of dueRetries) {
    const enrollment = findEnrollment(enrollments, retry.prospectId);
    if (!enrollment) {
      await cancelFunnelRetry(retry, "Enrollment no longer exists");
      continue;
    }

    const prospect = await getProspect(retry.prospectId);
    if (!prospect) {
      await cancelFunnelRetry(retry, "Prospect no longer exists");
      continue;
    }

    if (enrollment.paused || enrollment.completedAt || prospect.funnelPaused || isStopStatus(prospect.status)) {
      await cancelFunnelRetry(retry, `Retry cancelled because prospect is paused or in status '${prospect.status}'`);
      continue;
    }

    const payload = payloadFromRetryRecord(retry);
    const delivery = await attemptFunnelDelivery(payload, {
      retryCount: retry.attemptCount + 1,
      queueOnFailure: false,
    });

    if (delivery.success && delivery.deliveredChannel) {
      await markFunnelRetrySent(retry, delivery.deliveredChannel);
      markEnrollmentStepDelivered(enrollment, retry.stepIndex);
      sent.push({
        name: prospect.businessName,
        step: `${retry.stepLabel} (retry)`,
        email: delivery.emailSent,
        sms: delivery.smsSent,
        voicemail: false,
      });
      continue;
    }

    const schedule = await rescheduleFunnelRetry(retry, delivery.lastError || "Retry delivery failed");
    queued.push({
      name: prospect.businessName,
      step: `${retry.stepLabel} (retry)`,
      retryId: schedule.record.id,
      reason: schedule.record.lastError || "Retry delivery failed",
    });
  }

  return { sent, queued };
}

export function getEnrollment(prospectId: string): FunnelEnrollment | undefined {
  return loadEnrollments().find((enrollment) => enrollment.prospectId === prospectId);
}

export function getAllEnrollments(): FunnelEnrollment[] {
  return loadEnrollments();
}

/**
 * Enroll a prospect in the auto-funnel.
 * Immediately attempts Day 0 with resilient channel fallback.
 */
export async function enrollInFunnel(prospectId: string): Promise<{ success: boolean; message: string }> {
  const prospect = await getProspect(prospectId);
  if (!prospect) return { success: false, message: "Prospect not found" };
  if (!prospect.generatedSiteUrl) return { success: false, message: "No preview site — generate one first" };

  if (isStopStatus(prospect.status)) {
    return { success: false, message: `Prospect status is '${prospect.status}' — cannot enroll in funnel` };
  }

  const canEnroll = ["approved", "ready_to_review", "generated", "contacted", "audit_lead"].includes(prospect.status);
  if (!canEnroll) {
    return { success: false, message: `Prospect status is '${prospect.status}' — must be approved or ready to review first` };
  }

  if (prospect.funnelPaused) {
    return { success: false, message: "Prospect funnel is paused (they replied or unsubscribed)" };
  }

  const enrollments = await loadEnrollmentsAsync();
  const existing = enrollments.find((enrollment) => enrollment.prospectId === prospectId);
  if (existing && !existing.completedAt && !existing.paused) {
    return { success: false, message: "Already in funnel" };
  }

  await generatePersonalizedProposal(prospectId);

  // Fire off TTS video generation in the background (non-blocking) so the
  // walkthrough video is ready for later follow-up emails. We don't await —
  // if it's not ready by the time step 0 sends, later steps will pick it up
  // via getProspectVideoUrl() in getEmailTemplate().
  try {
    const { getProspectVideoUrl, generateProspectVideo } = await import("./video-generator");
    const existing = await getProspectVideoUrl(prospectId);
    if (!existing) {
      void generateProspectVideo(prospectId).catch((err) => {
        console.error(`[funnel] auto video generation failed for ${prospectId}:`, err);
      });
    }
  } catch (err) {
    console.error(`[funnel] could not queue video generation for ${prospectId}:`, err);
  }

  // Fire off direct-mail postcard (non-blocking). USPS first-class delivery
  // takes 3-5 days, so a postcard fired at enrollment physically arrives
  // between Day 0 email and Day 5 follow-up — a perfect mid-funnel touch.
  // `sendPostcard` gates internally on 4.5★/20-reviews and no-op's when
  // `LOB_API_KEY` isn't configured, so it's safe to unconditionally call.
  try {
    const { sendPostcard } = await import("./postcard-sender");
    void sendPostcard(prospect).then((result) => {
      if (result.sent) {
        console.log(`[funnel] postcard queued at Lob for ${prospectId}: ${result.lobId} (delivery ${result.expectedDeliveryDate})`);
      } else if (result.skipped) {
        console.log(`[funnel] postcard skipped for ${prospectId}: ${result.skipped}`);
      } else if (result.error) {
        console.warn(`[funnel] postcard send failed for ${prospectId}: ${result.error}`);
      }
    }).catch((err) => {
      console.error(`[funnel] postcard send errored for ${prospectId}:`, err);
    });
  } catch (err) {
    console.error(`[funnel] could not queue postcard for ${prospectId}:`, err);
  }

  const results = await sendFunnelStep(prospect, 0);
  if (!results.success && !results.queuedForRetry) {
    return {
      success: false,
      message: `Could not start funnel for ${prospect.businessName} because no reachable channel was available.`,
    };
  }

  const now = new Date().toISOString();
  const enrollment: FunnelEnrollment = {
    prospectId,
    enrolledAt: now,
    currentStep: results.success ? 0 : -1,
    lastSentAt: results.success ? now : null,
    paused: false,
  };

  const filtered = enrollments.filter((item) => item.prospectId !== prospectId);
  filtered.push(enrollment);
  await saveEnrollmentsAsync(filtered);

  // Set contactedAt on first outreach only — used for 30-day preview expiry
  const existingProspect = await getProspect(prospectId);
  const contactedAtPatch = existingProspect?.contactedAt ? {} : { contactedAt: new Date().toISOString() };
  await updateProspect(prospectId, { status: "contacted", ...contactedAtPatch });

  const outcome = results.success
    ? `${results.emailSent ? "Email" : "SMS"}${results.deliveredChannel && results.voicemailSent ? " + voicemail" : ""} delivered.`
    : "Both channels failed, so the step was queued for retry.";

  return {
    success: true,
    message: `Funnel started for ${prospect.businessName}. ${outcome}`,
  };
}

/**
 * Run the funnel processor. This handles due retries first, then sends the next
 * due step for active prospects.
 */
export async function runDailyFunnel(): Promise<{
  processed: number;
  sent: { name: string; step: string; email: boolean; sms: boolean; voicemail: boolean }[];
  paused: { name: string; reason: string }[];
  queued: { name: string; step: string; retryId: string; reason: string }[];
}> {
  const enrollments = await loadEnrollmentsAsync();
  const sent: { name: string; step: string; email: boolean; sms: boolean; voicemail: boolean }[] = [];
  const paused: { name: string; reason: string }[] = [];
  const queued: { name: string; step: string; retryId: string; reason: string }[] = [];

  const retryResults = await processQueuedFunnelRetries(enrollments);
  sent.push(...retryResults.sent);
  queued.push(...retryResults.queued);

  for (const enrollment of enrollments) {
    if (enrollment.paused || enrollment.completedAt) continue;

    const prospect = await getProspect(enrollment.prospectId);
    if (!prospect) continue;

    if (prospect.funnelPaused) {
      enrollment.paused = true;
      enrollment.pauseReason = "Prospect replied — funnel paused by AI responder";
      paused.push({ name: prospect.businessName, reason: "replied" });
      continue;
    }

    if (isStopStatus(prospect.status)) {
      enrollment.paused = true;
      enrollment.pauseReason = `Prospect status: ${prospect.status}`;
      paused.push({ name: prospect.businessName, reason: prospect.status });

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

    const nextStep = enrollment.currentStep + 1;
    if (nextStep >= FUNNEL_STEPS.length) {
      enrollment.completedAt = new Date().toISOString();
      continue;
    }

    const activeRetry = await getActiveFunnelRetry(prospect.id, nextStep);
    if (activeRetry) {
      queued.push({
        name: prospect.businessName,
        step: FUNNEL_STEPS[nextStep].label,
        retryId: activeRetry.id,
        reason: activeRetry.lastError || "Waiting for scheduled retry",
      });
      continue;
    }

    const daysSinceEnrolled = Math.floor(
      (Date.now() - new Date(enrollment.enrolledAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const stepConfig = FUNNEL_STEPS[nextStep];

    if (daysSinceEnrolled >= stepConfig.day) {
      const results = await sendFunnelStep(prospect, nextStep);

      if (results.success) {
        markEnrollmentStepDelivered(enrollment, nextStep);
        sent.push({
          name: prospect.businessName,
          step: stepConfig.label,
          email: results.emailSent,
          sms: results.smsSent,
          voicemail: results.voicemailSent,
        });
      } else if (results.queuedForRetry) {
        const retry = await getActiveFunnelRetry(prospect.id, nextStep);
        if (retry) {
          queued.push({
            name: prospect.businessName,
            step: stepConfig.label,
            retryId: retry.id,
            reason: results.lastError || "Both channels failed; queued for retry",
          });
        }
      }
    }
  }

  await saveEnrollmentsAsync(enrollments);
  return { processed: enrollments.length, sent, paused, queued };
}

/**
 * Pause a prospect's funnel.
 */
export function pauseFunnel(prospectId: string, reason: string): boolean {
  const enrollments = loadEnrollments();
  const enrollment = enrollments.find((item) => item.prospectId === prospectId);
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
  const enrollment = enrollments.find((item) => item.prospectId === prospectId);
  if (!enrollment) return false;
  enrollment.paused = false;
  enrollment.pauseReason = undefined;
  saveEnrollments(enrollments);

  await updateProspect(prospectId, { funnelPaused: false });
  return true;
}
