import type { Prospect } from "./types";
import { getEmailHistory } from "./email-sender";
import { getSmsHistory } from "./sms";

/**
 * Auto-Retargeting Funnel
 *
 * Once a prospect is approved for outreach, they enter the funnel.
 * The system automatically sends follow-ups based on industry best practices:
 *
 * Day 0: Initial email + text
 * Day 3: Follow-up #1 email + text (if no response)
 * Day 7: Follow-up #2 email + text (if no response)
 * Day 14: Re-engagement email (different angle)
 * Day 21: Final attempt email
 * Day 30: Move to "cold" list — can be retargeted in 90 days
 *
 * Instagram: Only auto-follow-up if the prospect has ALREADY responded
 * (since Ben does IG manually to avoid bans)
 */

export interface FunnelStep {
  day: number;
  channels: ("email" | "sms")[];
  label: string;
  description: string;
}

export const FUNNEL_STEPS: FunnelStep[] = [
  { day: 0, channels: ["email", "sms"], label: "Initial Outreach", description: "First pitch email + text with preview link" },
  { day: 3, channels: ["email", "sms"], label: "Follow-Up #1", description: "\"Did you see your site?\" — friendly nudge" },
  { day: 7, channels: ["email", "sms"], label: "Follow-Up #2", description: "Last direct follow-up — urgency angle" },
  { day: 14, channels: ["email"], label: "Re-Engagement", description: "Different angle — industry stats, competitor mention" },
  { day: 21, channels: ["email"], label: "Value Add", description: "Share a tip or insight relevant to their industry" },
  { day: 30, channels: ["email"], label: "Final Attempt", description: "\"We're moving on\" — last chance scarcity" },
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
  const totalSent = emails.length + sms.length;
  let currentStep = 0;
  if (totalSent >= 10) currentStep = 5; // past final
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
