import type { Prospect } from "./types";
import { logCost, COST_RATES } from "./cost-logger";
import {
  getOwnerNotificationPref,
  queueOwnerNotification,
} from "./owner-notification-prefs";

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

async function sendOwnerSms(
  message: string,
  ctx?: { clientSlug?: string; prospectId?: string },
): Promise<boolean> {
  // Per-client SMS gating — when Ben has set a non-instant cadence for
  // this client in /dashboard/notifications, queue or drop the message
  // instead of firing Twilio immediately. System-wide alerts (no
  // clientSlug) always fire so cron/system errors aren't suppressed.
  if (ctx?.clientSlug) {
    const pref = await getOwnerNotificationPref(ctx.clientSlug);
    if (pref.smsFrequency === "off") {
      console.log(`  🔕 [SMS suppressed for ${ctx.clientSlug}]: ${message}`);
      return true;
    }
    if (pref.smsFrequency === "daily") {
      await queueOwnerNotification({
        clientSlug: ctx.clientSlug,
        channel: "sms",
        body: message,
        prospectId: ctx.prospectId,
      });
      return true;
    }
  }

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
      clientSlug: ctx?.clientSlug,
      prospectId: ctx?.prospectId,
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

  // Run SMS + email in parallel — email works even when Twilio A2P is pending
  await Promise.all([
    sendOwnerSms(fullMessage),
    sendOwnerEmail({ subject: `${prefix} BlueJays Alert`, body: alert.message }),
  ]);
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

/** Send a raw SMS + email alert to Ben — works even when Twilio A2P is pending.
 *  Pass `clientSlug` when the alert is triggered by a per-client event
 *  (e.g. an inbound lead on /clients/zenith-sports) so the cost row
 *  is attributed to that tenant in the spending dashboard. */
export async function sendOwnerAlert(
  message: string,
  ctx?: { clientSlug?: string; prospectId?: string },
): Promise<void> {
  await Promise.all([
    sendOwnerSms(message, ctx),
    sendOwnerEmail({ subject: "🔔 BlueJays Alert", body: message, ...ctx }),
  ]);
}

/**
 * Send an admin-notification email to Ben (separate from cold-outreach
 * sends — bypasses the warming queue + sender rotation in
 * email-sender.ts since these are personal admin pings, not marketing).
 *
 * Uses SendGrid directly via fetch. Falls back to console.log if
 * SENDGRID_API_KEY isn't set so dev/CI doesn't break.
 *
 * Body can be plain text — newlines are converted to <br/> for HTML.
 * Subject is the email subject + Ben's inbox preview line.
 */
export async function sendOwnerEmail(args: {
  subject: string;
  body: string;
  clientSlug?: string;
  prospectId?: string;
}): Promise<boolean> {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  // Rule 67 (updated 2026-05-19): FROM_EMAIL hardcoded to alerts@bluejayportfolio.com.
  // Why: previous value bluejaycontactme@gmail.com was silently Gmail-spam-filtered.
  // Gmail's strict DMARC policy on @gmail.com From addresses sent through 3rd-party
  // SMTP (SendGrid) = automatic spam quarantine. alerts@bluejayportfolio.com is
  // DMARC-aligned via the authenticated bluejayportfolio.com domain.
  // Reply-To = bluejaycontactme@gmail.com so replies still land in Ben's Gmail.
  const FROM_EMAIL = "alerts@bluejayportfolio.com";
  const REPLY_TO = "bluejaycontactme@gmail.com";
  const OWNER_EMAIL = process.env.OWNER_EMAIL || "ben@bluejayportfolio.com";

  // Per-client email gating — when Ben has set a non-instant cadence for
  // this client in /dashboard/notifications, queue or drop the email
  // instead of firing SendGrid immediately. System-wide alerts (no
  // clientSlug) always fire so cron/system errors aren't suppressed.
  if (args.clientSlug) {
    const pref = await getOwnerNotificationPref(args.clientSlug);
    if (pref.emailFrequency === "off") {
      console.log(
        `  🔕 [email suppressed for ${args.clientSlug}]: ${args.subject}`,
      );
      return true;
    }
    if (pref.emailFrequency === "daily" || pref.emailFrequency === "weekly") {
      await queueOwnerNotification({
        clientSlug: args.clientSlug,
        channel: "email",
        subject: args.subject,
        body: args.body,
        prospectId: args.prospectId,
      });
      return true;
    }
  }

  if (!SENDGRID_API_KEY) {
    console.log(
      `  🔔 [ALERT - would email owner]: ${args.subject}\n${args.body}`,
    );
    return false;
  }

  // Convert plain-text body to a minimal HTML version (newlines → <br/>).
  // Keeps email looking native-mobile-readable without heavy HTML.
  const htmlBody = args.body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: OWNER_EMAIL }] }],
        from: { email: FROM_EMAIL, name: "BlueJays Alerts" },
        reply_to: { email: REPLY_TO, name: "BlueJays" },
        subject: args.subject,
        content: [
          { type: "text/plain", value: args.body },
          {
            type: "text/html",
            value: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.55;color:#1f2937">${htmlBody}</div>`,
          },
        ],
      }),
    });
    if (!response.ok) {
      console.error(
        "[sendOwnerEmail] SendGrid returned",
        response.status,
        await response.text(),
      );
    } else {
      // Tag this send with the originating tenant when one was passed
      // through. Lets the per-client filter on /spending count owner-
      // alert email costs against the right client.
      await logCost({
        service: "sendgrid_email",
        action: "owner_alert",
        costUsd: COST_RATES.sendgrid_email,
        clientSlug: args.clientSlug,
        prospectId: args.prospectId,
        metadata: { to: OWNER_EMAIL, type: "owner_alert" },
      });
    }
    return response.ok;
  } catch (err) {
    console.error("[sendOwnerEmail] failed:", err);
    return false;
  }
}

/**
 * Send an email to an arbitrary recipient (e.g. a client owner getting
 * an instant lead notification). Same delivery path as sendOwnerEmail
 * but the `to` address is not pinned to OWNER_EMAIL.
 *
 * Returns true on send success, false otherwise. Logs (no throw) when
 * SENDGRID_API_KEY isn't configured so local dev / CI doesn't break.
 */
export async function sendEmailTo(args: {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
  clientSlug?: string;
}): Promise<boolean> {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  // Rule 67 (updated 2026-05-19): FROM_EMAIL hardcoded to alerts@bluejayportfolio.com.
  // Why: previous value bluejaycontactme@gmail.com was silently Gmail-spam-filtered.
  // SendGrid Activity Feed showed "Delivered" for 15 OIT booking emails on 2026-05-19
  // morning, but none landed in any inbox or spam folder (Ben confirmed). Gmail's
  // strict DMARC policy on @gmail.com From addresses sent through 3rd-party SMTP =
  // silent spam quarantine OR hard-drop. alerts@bluejayportfolio.com is DMARC-aligned
  // via the authenticated bluejayportfolio.com domain. Reply-To keeps replies coming
  // to Ben's Gmail. THIS is the path the OIT booking-form's customer-facing email
  // fan-out flows through (sendEmailToWithAlert calls sendEmailTo).
  const FROM_EMAIL = "alerts@bluejayportfolio.com";
  const REPLY_TO = "bluejaycontactme@gmail.com";
  if (!SENDGRID_API_KEY) {
    console.log(`  🔔 [ALERT - would email ${args.to}]: ${args.subject}\n${args.body}`);
    return false;
  }
  const htmlBody = args.body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: args.to }] }],
        from: { email: FROM_EMAIL, name: args.fromName || "BlueJays Alerts" },
        reply_to: { email: REPLY_TO, name: "BlueJays" },
        subject: args.subject,
        content: [
          { type: "text/plain", value: args.body },
          {
            type: "text/html",
            value: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.55;color:#1f2937">${htmlBody}</div>`,
          },
        ],
      }),
    });
    if (!response.ok) {
      console.error("[sendEmailTo]", response.status, await response.text());
    } else {
      // Per-client cost attribution — fired from campaign blasts and
      // client-portal owner notifications. Tag with the originating
      // tenant so /spending?client=zenith-sports counts these.
      await logCost({
        service: "sendgrid_email",
        action: "client_send",
        costUsd: COST_RATES.sendgrid_email,
        clientSlug: args.clientSlug,
        metadata: { to: args.to, fromName: args.fromName ?? null },
      });
    }
    return response.ok;
  } catch (err) {
    console.error("[sendEmailTo] failed:", err);
    return false;
  }
}

/**
 * CLAUDE.md Rule 68 wrapper — locked 2026-05-18 after Hector silent-drop bug.
 *
 * EVERY customer-facing send (lead notifications, booking confirmations,
 * inquiry forwards, signup acknowledgments, anything where a customer or
 * client is the recipient) MUST go through THIS function, not raw
 * `sendEmailTo()`.
 *
 * Why: `sendEmailTo()` returns `false` on SendGrid 4xx / suppression /
 * network failure but does NOT throw. Callers that only `.catch()` thrown
 * errors miss the silent-failure case. Hector's contact form lost 4 leads
 * on 2026-05-18 to exactly this — `hectorlandscapingonline@gmail.com` was
 * on SendGrid's hard-bounce suppression list, every send returned false,
 * no error visible to operator, no SMS alert, no email delivery.
 *
 * This wrapper fires `sendOwnerAlert()` SMS to Ben the moment the send
 * fails, so manual forwarding can happen within minutes instead of days.
 *
 * Use raw `sendEmailTo()` ONLY for batch/internal sends with their own
 * retry logic (e.g. campaign blasts where individual failures are
 * expected and aggregated separately).
 */
export async function sendEmailToWithAlert(args: {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
  clientSlug?: string;
  /**
   * Short label describing what this send is for. Appears in the owner
   * SMS so Ben knows what failed and what to manually forward.
   * Examples:
   *   "🌿 Hector Landscaping new-lead forward"
   *   "🛠 Olympic Inspections booking confirmation"
   *   "⚽ Zenith Sports camp signup confirmation"
   */
  alertContext: string;
}): Promise<boolean> {
  const ok = await sendEmailTo({
    to: args.to,
    subject: args.subject,
    body: args.body,
    fromName: args.fromName,
    clientSlug: args.clientSlug,
  });
  if (!ok) {
    // Fire-and-forget owner SMS so caller doesn't have to await.
    // Swallowed errors here are intentional — alerting Ben is best-effort.
    sendOwnerAlert(
      `❌ ${args.alertContext}\n` +
        `Auto-send to ${args.to} FAILED.\n` +
        `Subject: ${args.subject}\n` +
        `Likely: SendGrid suppression — check Bounces/Blocks lists.\n` +
        `Manual-forward needed.`,
      { clientSlug: args.clientSlug },
    ).catch((err) =>
      console.error("[sendEmailToWithAlert] owner SMS failed:", err),
    );
  }
  return ok;
}

export async function alertHighValueLead(prospect: Prospect) {
  // Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
  const BASE_URL = "https://bluejayportfolio.com";
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
  // Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
  const BASE_URL = "https://bluejayportfolio.com";
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
