import type { Prospect } from "./types";
import { getEmailHistory } from "./email-sender";
import { getSmsHistory } from "./sms";

/**
 * Auto-Retargeting Funnel — Status Tracking
 *
 * 7-step conservative funnel matching CLAUDE.md and agent-personality.ts:
 *
 * Day 0:  Initial email + text (pitch with preview link)
 * Day 2:  Voicemail drop (Ben's pre-recorded VM, genuine and personal)
 * Day 5:  Gentle follow-up email ("Did you get a chance to look?")
 * Day 12: Value reframe email + text (industry stats, competitor mention)
 * Day 18: Follow-up voicemail ("just checking if you saw the text")
 * Day 21: Social proof email ("X businesses in your area upgraded")
 * Day 30: Final check-in email — easy out, move to cold list (retarget in 90 days)
 *
 * Instagram: Only auto-follow-up if the prospect has ALREADY responded
 * (since Ben does IG manually to avoid bans)
 */

export interface FunnelStep {
  day: number;
  channels: ("email" | "sms" | "voicemail")[];
  label: string;
  description: string;
}

export const FUNNEL_STEPS: FunnelStep[] = [
  { day: 0, channels: ["email", "sms"], label: "Initial Pitch", description: "Friendly intro with preview link" },
  { day: 2, channels: ["voicemail"], label: "Voicemail Drop", description: "Ben's pre-recorded VM — personal, genuine, mentions their business name" },
  { day: 5, channels: ["email"], label: "Gentle Follow-Up", description: "\"Did you get a chance to look?\" — no pressure" },
  { day: 12, channels: ["email", "sms"], label: "Value Reframe", description: "Share a stat or insight about their industry" },
  { day: 18, channels: ["voicemail"], label: "Follow-Up VM", description: "Second voicemail — \"just checking if you saw the text with your website link\"" },
  { day: 21, channels: ["email"], label: "Social Proof", description: "\"X businesses in your area upgraded this month\"" },
  { day: 30, channels: ["email"], label: "Final Check-In", description: "\"Just wanted to make sure you saw this\" — easy out" },
];

export interface FunnelStatus {
  prospectId: string;
  currentStep: number;
  nextStepDay: number;
  daysSinceFirstContact: number;
  emailsSent: number;
  smsSent: number;
  lastContactDate: string | null;
  isComplete: boolean;
  hasResponded: boolean;
}

export async function getFunnelStatus(prospect: Prospect): Promise<FunnelStatus> {
  const emails = await getEmailHistory(prospect.id);
  const sms = await getSmsHistory(prospect.id);

  const allDates = [
    ...emails.map((e) => e.sentAt),
    ...sms.map((s) => s.sentAt),
  ].sort();

  const firstContact = allDates.length > 0 ? allDates[0] : null;
  const lastContact = allDates.length > 0 ? allDates[allDates.length - 1] : null;

  const daysSince = firstContact
    ? Math.floor((Date.now() - new Date(firstContact).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Determine current step based on what's been sent
  // With 7 steps, thresholds are adjusted for the new cadence
  const totalSent = emails.length + sms.length;
  let currentStep = 0;
  if (totalSent >= 12) currentStep = 6; // past final
  else if (totalSent >= 10) currentStep = 5;
  else if (totalSent >= 8) currentStep = 4;
  else if (totalSent >= 6) currentStep = 3;
  else if (totalSent >= 4) currentStep = 2;
  else if (totalSent >= 2) currentStep = 1;

  const hasResponded = prospect.status === "responded" || prospect.status === "paid";
  const isComplete = currentStep >= FUNNEL_STEPS.length || hasResponded;

  const nextStep = isComplete ? FUNNEL_STEPS.length : currentStep + 1;
  const nextStepDay = nextStep < FUNNEL_STEPS.length ? FUNNEL_STEPS[nextStep].day : 999;

  return {
    prospectId: prospect.id,
    currentStep,
    nextStepDay,
    daysSinceFirstContact: daysSince,
    emailsSent: emails.length,
    smsSent: sms.length,
    lastContactDate: lastContact,
    isComplete,
    hasResponded,
  };
}

export function shouldSendNextStep(status: FunnelStatus): boolean {
  if (status.isComplete) return false;
  if (status.hasResponded) return false;
  return status.daysSinceFirstContact >= status.nextStepDay;
}

/**
 * Get all prospects that are due for their next funnel step
 */
export async function getDueProspects(prospects: Prospect[]): Promise<{
  prospect: Prospect;
  status: FunnelStatus;
  nextStep: FunnelStep;
}[]> {
  const due: { prospect: Prospect; status: FunnelStatus; nextStep: FunnelStep }[] = [];

  for (const p of prospects) {
    // Only process contacted prospects that haven't responded or been dismissed
    if (!["contacted"].includes(p.status)) continue;

    const status = await getFunnelStatus(p);
    if (shouldSendNextStep(status) && status.currentStep + 1 < FUNNEL_STEPS.length) {
      due.push({
        prospect: p,
        status,
        nextStep: FUNNEL_STEPS[status.currentStep + 1],
      });
    }
  }

  return due;
}
