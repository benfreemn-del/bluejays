import type { Prospect } from "./types";
import { logCost, COST_RATES } from "./cost-logger";

const OWNER_PHONE = process.env.OWNER_PHONE_NUMBER;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export type AlertType =
  | "high-value-lead"
  | "prospect-responded"
  | "prospect-paid"
  | "angry-response"
  | "custom-request"
  | "scrape-failed"
  | "county-complete";

interface Alert {
  type: AlertType;
  message: string;
  prospect?: Prospect;
  timestamp: string;
}

async function sendOwnerSms(message: string): Promise<boolean> {
  if (!OWNER_PHONE || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log(`  🔔 [ALERT - would text owner]: ${message}`);
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: OWNER_PHONE,
      From: TWILIO_PHONE_NUMBER,
      Body: message,
    }),
  });

  if (response.ok) {
    await logCost({
      service: "twilio_sms",
      action: "owner_alert",
      costUsd: COST_RATES.twilio_sms,
      metadata: { to: OWNER_PHONE, type: "alert" },
    });
  }

  return response.ok;
}

export async function alertOwner(alert: Alert): Promise<void> {
  const prefix = getAlertEmoji(alert.type);
  const fullMessage = `${prefix} BlueJays Alert:\n${alert.message}`;

  console.log(`\n${"=".repeat(50)}`);
  console.log(fullMessage);
  console.log(`${"=".repeat(50)}\n`);

  await sendOwnerSms(fullMessage);
}

function getAlertEmoji(type: AlertType): string {
  const emojis: Record<AlertType, string> = {
    "high-value-lead": "🔥",
    "prospect-responded": "💬",
    "prospect-paid": "💰",
    "angry-response": "⚠️",
    "custom-request": "📋",
    "scrape-failed": "❌",
    "county-complete": "✅",
  };
  return emojis[type];
}

// Trigger functions for common alert scenarios

/** Send a raw SMS alert to Ben — use for custom messages with action links. */
export async function sendOwnerAlert(message: string): Promise<void> {
  await sendOwnerSms(message);
}

export async function alertHighValueLead(prospect: Prospect) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl || `/preview/${prospect.id}`}`;
  const phone = prospect.phone || "N/A";
  const callLine = prospect.phone ? `📞 Call: ${phone}` : `📞 Phone: N/A`;
  await alertOwner({
    type: "high-value-lead",
    message: [
      `High-value lead: ${prospect.businessName} (${prospect.category})`,
      `⭐ ${prospect.googleRating || "?"} stars · ${prospect.reviewCount || 0} reviews`,
      callLine,
      `🌐 ${previewUrl}`,
      `📋 ${BASE_URL}/dashboard`,
    ].join("\n"),
    prospect,
    timestamp: new Date().toISOString(),
  });
}

export async function alertProspectResponded(prospect: Prospect, response: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
  const previewUrl = `${BASE_URL}${prospect.generatedSiteUrl || `/preview/${prospect.id}`}`;
  await alertOwner({
    type: "prospect-responded",
    message: [
      `💬 ${prospect.businessName} replied!`,
      `"${response.substring(0, 120)}"`,
      prospect.phone ? `📞 Call: ${prospect.phone}` : "",
      `🌐 Preview: ${previewUrl}`,
      `📋 Dashboard: ${BASE_URL}/dashboard`,
    ].filter(Boolean).join("\n"),
    prospect,
    timestamp: new Date().toISOString(),
  });
}

export async function alertProspectPaid(prospect: Prospect) {
  await alertOwner({
    type: "prospect-paid",
    message: `${prospect.businessName} just PAID! 🎉\n$997 received. Check the dashboard for onboarding details.`,
    prospect,
    timestamp: new Date().toISOString(),
  });
}

export async function alertAngryResponse(prospect: Prospect, response: string) {
  await alertOwner({
    type: "angry-response",
    message: `Negative response from ${prospect.businessName}.\n"${response.substring(0, 100)}..."\nAI has paused. Manual intervention needed.`,
    prospect,
    timestamp: new Date().toISOString(),
  });
}

export async function alertCustomRequest(prospect: Prospect, request: string) {
  await alertOwner({
    type: "custom-request",
    message: `${prospect.businessName} asked about custom features:\n"${request.substring(0, 100)}..."\nReady to close — reach out personally.`,
    prospect,
    timestamp: new Date().toISOString(),
  });
}

export function isAlertsConfigured(): boolean {
  return !!(OWNER_PHONE && TWILIO_ACCOUNT_SID);
}

/**
 * Alert for objection responses — notify Ben when a prospect raises an objection
 * so he can follow up personally if needed.
 */
export async function alertObjectionResponse(prospect: Prospect, objectionType: string, response: string) {
  await alertOwner({
    type: "prospect-responded",
    message: `${prospect.businessName} raised an objection: "${objectionType}"\n"${response.substring(0, 100)}..."\nAI handled with playbook script. May need follow-up.`,
    prospect,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Alert for escalation to Ben — immediate human handoff needed.
 */
export async function alertEscalation(prospect: Prospect, reason: string, urgency: "immediate" | "next-day") {
  await alertOwner({
    type: urgency === "immediate" ? "angry-response" : "prospect-responded",
    message: `ESCALATION (${urgency}): ${prospect.businessName}\nReason: ${reason}\nPhone: ${prospect.phone || "N/A"}\nEmail: ${prospect.email || "N/A"}`,
    prospect,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Daily digest — fires after the daily funnel cron completes.
 * Gives Ben a quick plan-status SMS: warmup day, sends today, funnel state,
 * pipeline counts, and countdown to the May 1, 2026 full launch.
 */
export interface DigestDomainStatus {
  domain: string;
  enabled: boolean;
  warmingDay: number;
  limitToday: number;
  sentToday: number;
}

export interface DigestStats {
  sentToday: number;
  queuedToday: number;
  pausedToday: number;
  repliesToday: number;
  warmingDay?: number;
  warmingLimit?: number;
  warmingEnabled?: boolean;
  /** Per-domain status for parallel warming (primary + backup). */
  domains?: DigestDomainStatus[];
  activeEnrollments?: number;
  approvedNotEnrolled?: number;
  pipelineProcessing?: number;
  prospectsPaid?: number;
  errorSummary?: string;
}

const LAUNCH_DATE_ISO = "2026-05-01T00:00:00Z";

function daysUntilLaunch(): number {
  const launch = new Date(LAUNCH_DATE_ISO).getTime();
  const diffMs = launch - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export async function sendDailyDigest(stats: DigestStats): Promise<void> {
  const days = daysUntilLaunch();
  const launchLine =
    days === 0
      ? "🚀 LAUNCH DAY — full send (email + SMS + voicemail) is live."
      : `📅 ${days} day${days === 1 ? "" : "s"} until May 1 full launch (email + SMS + voicemail).`;

  let warmupLine: string;
  if (stats.domains && stats.domains.length > 0) {
    // Parallel warming view — show both sender domains and combined daily cap
    const parts = stats.domains.map((d) => {
      if (!d.enabled) return `${d.domain} off`;
      return `${d.domain} D${d.warmingDay}/14 ${d.sentToday}/${d.limitToday}`;
    });
    const combinedCap = stats.domains
      .filter((d) => d.enabled)
      .reduce((sum, d) => sum + d.limitToday, 0);
    warmupLine = `🌡️ ${parts.join(" · ")} → ${combinedCap}/day combined`;
  } else if (stats.warmingEnabled && stats.warmingDay && stats.warmingLimit) {
    warmupLine = `🌡️ Warmup: Day ${stats.warmingDay}/14 — cap ${stats.warmingLimit}/day`;
  } else {
    warmupLine = "🌡️ Warmup: not active";
  }

  const funnelLine = `📬 Today: ${stats.sentToday} sent · ${stats.queuedToday} queued · ${stats.pausedToday} paused${
    stats.repliesToday ? ` · ${stats.repliesToday} replies 💬` : ""
  }`;

  const pipelineParts: string[] = [];
  if (stats.activeEnrollments !== undefined) pipelineParts.push(`${stats.activeEnrollments} active`);
  if (stats.approvedNotEnrolled !== undefined) pipelineParts.push(`${stats.approvedNotEnrolled} ready to enroll`);
  if (stats.pipelineProcessing !== undefined) pipelineParts.push(`${stats.pipelineProcessing} generating`);
  const pipelineLine = pipelineParts.length ? `🏗️ Pipeline: ${pipelineParts.join(" · ")}` : "";

  const paidLine = stats.prospectsPaid ? `💰 ${stats.prospectsPaid} paid today!` : "";
  const errorLine = stats.errorSummary ? `⚠️ ${stats.errorSummary}` : "";

  const body = [
    `🌅 BlueJays Daily — ${new Date().toISOString().slice(0, 10)}`,
    warmupLine,
    funnelLine,
    pipelineLine,
    paidLine,
    launchLine,
    errorLine,
  ]
    .filter(Boolean)
    .join("\n");

  console.log(`\n${"=".repeat(50)}\n${body}\n${"=".repeat(50)}\n`);
  await sendOwnerSms(body);
}
