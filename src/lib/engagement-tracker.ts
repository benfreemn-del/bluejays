/**
 * Engagement Tracker — Smart trigger system for conditional modules.
 *
 * Tracks and evaluates prospect engagement signals to determine when
 * to deploy social proof, urgency, and competitor comparison modules.
 *
 * Engagement is scored on a 0–100 scale based on:
 * - Email opens (from SendGrid webhooks stored in email_events)
 * - Link clicks (from email_events + preview visit tracking)
 * - Preview page visits (from preview_visits / track API)
 * - SMS replies
 * - Time spent on preview (duration from track API)
 *
 * Modules are only deployed when engagement crosses defined thresholds,
 * preventing cold prospects from seeing aggressive conversion tactics.
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import type { Prospect } from "./types";

export interface EngagementSignals {
  emailOpens: number;
  emailClicks: number;
  previewVisits: number;
  totalPreviewDuration: number; // seconds
  smsReplies: number;
  lastActivityAt: string | null;
  daysSinceFirstContact: number;
}

export interface EngagementScore {
  score: number; // 0–100
  level: "cold" | "warm" | "hot" | "on-fire";
  signals: EngagementSignals;
  triggers: {
    showSocialProof: boolean;
    showUrgency: boolean;
    showCompetitorComparison: boolean;
    showCountdown: boolean;
  };
}

/**
 * Thresholds for triggering conditional modules.
 * These are deliberately conservative — we only show conversion
 * elements to prospects who have demonstrated real interest.
 */
const TRIGGER_THRESHOLDS = {
  /** Social proof appears after 3+ email opens OR 1+ preview visits */
  socialProof: { minOpens: 3, minVisits: 1, minScore: 25 },
  /** Urgency countdown appears after click + visit but no claim */
  urgency: { minClicks: 1, minVisits: 2, minScore: 40 },
  /** Competitor comparison deploys after 2+ visits or "already have website" objection */
  competitorComparison: { minVisits: 2, minScore: 35 },
  /** Limited-time countdown only for hot prospects */
  countdown: { minScore: 50 },
};

/**
 * Calculate engagement score for a prospect.
 * Pulls data from email_events, preview_visits, and sms_messages tables.
 */
export async function getEngagementScore(prospect: Prospect): Promise<EngagementScore> {
  const signals = await getEngagementSignals(prospect);
  const score = calculateScore(signals);
  const level = scoreToLevel(score);
  const triggers = evaluateTriggers(score, signals);

  return { score, level, signals, triggers };
}

/**
 * Gather raw engagement signals from all tracking sources.
 */
async function getEngagementSignals(prospect: Prospect): Promise<EngagementSignals> {
  const defaults: EngagementSignals = {
    emailOpens: 0,
    emailClicks: 0,
    previewVisits: 0,
    totalPreviewDuration: 0,
    smsReplies: 0,
    lastActivityAt: null,
    daysSinceFirstContact: 0,
  };

  if (!isSupabaseConfigured()) {
    // In dev mode, derive signals from prospect status as a heuristic
    return deriveSignalsFromStatus(prospect);
  }

  try {
    // 1. Email engagement from email_events table
    const { data: emailEvents } = await supabase
      .from("email_events")
      .select("event, timestamp")
      .eq("email", prospect.email || "");

    if (emailEvents) {
      const uniqueOpens = new Set(
        emailEvents.filter((e: { event: string }) => e.event === "open").map((e: { timestamp: string }) => e.timestamp.slice(0, 13))
      );
      defaults.emailOpens = uniqueOpens.size;
      defaults.emailClicks = emailEvents.filter((e: { event: string }) => e.event === "click").length;
    }

    // 2. Preview visits from preview_visits table
    const { data: visits } = await supabase
      .from("preview_visits")
      .select("visited_at, duration")
      .eq("prospect_id", prospect.id);

    if (visits) {
      defaults.previewVisits = visits.length;
      defaults.totalPreviewDuration = visits.reduce(
        (sum: number, v: { duration?: number }) => sum + (v.duration || 0), 0
      );
    }

    // 3. SMS replies (inbound messages)
    const { data: smsMessages } = await supabase
      .from("sms_messages")
      .select("direction")
      .eq("prospect_id", prospect.id)
      .eq("direction", "inbound");

    if (smsMessages) {
      defaults.smsReplies = smsMessages.length;
    }

    // 4. Calculate days since first contact
    const createdDate = new Date(prospect.createdAt);
    defaults.daysSinceFirstContact = Math.floor(
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 5. Last activity timestamp
    const allTimestamps = [
      ...(emailEvents || []).map((e: { timestamp: string }) => e.timestamp),
      ...(visits || []).map((v: { visited_at: string }) => v.visited_at),
    ].filter(Boolean).sort().reverse();
    defaults.lastActivityAt = allTimestamps[0] || null;

  } catch (err) {
    console.log(`[Engagement] Error fetching signals for ${prospect.id}: ${(err as Error).message}`);
  }

  return defaults;
}

/**
 * Derive engagement signals from prospect status when Supabase is unavailable.
 * This is a heuristic for local development.
 */
function deriveSignalsFromStatus(prospect: Prospect): EngagementSignals {
  const statusSignals: Record<string, Partial<EngagementSignals>> = {
    scouted: { emailOpens: 0, emailClicks: 0, previewVisits: 0 },
    scraped: { emailOpens: 0, emailClicks: 0, previewVisits: 0 },
    generated: { emailOpens: 0, emailClicks: 0, previewVisits: 0 },
    contacted: { emailOpens: 1, emailClicks: 0, previewVisits: 0 },
    engaged: { emailOpens: 3, emailClicks: 1, previewVisits: 1 },
    link_clicked: { emailOpens: 4, emailClicks: 2, previewVisits: 2 },
    responded: { emailOpens: 5, emailClicks: 2, previewVisits: 3, smsReplies: 1 },
    interested: { emailOpens: 6, emailClicks: 3, previewVisits: 4, smsReplies: 1 },
    claimed: { emailOpens: 7, emailClicks: 4, previewVisits: 5, smsReplies: 2 },
    paid: { emailOpens: 8, emailClicks: 5, previewVisits: 6, smsReplies: 2 },
  };

  const signals = statusSignals[prospect.status] || {};
  const createdDate = new Date(prospect.createdAt);

  return {
    emailOpens: signals.emailOpens || 0,
    emailClicks: signals.emailClicks || 0,
    previewVisits: signals.previewVisits || 0,
    totalPreviewDuration: (signals.previewVisits || 0) * 45,
    smsReplies: signals.smsReplies || 0,
    lastActivityAt: prospect.updatedAt || null,
    daysSinceFirstContact: Math.floor(
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    ),
  };
}

/**
 * Calculate a 0–100 engagement score from raw signals.
 *
 * Scoring weights:
 * - Email opens: 5 pts each (max 25)
 * - Email clicks: 10 pts each (max 30)
 * - Preview visits: 8 pts each (max 24)
 * - Preview duration: 1 pt per 30 seconds (max 10)
 * - SMS replies: 15 pts each (max 15)
 *
 * Recency bonus: +5 if active in last 24 hours
 * Recency penalty: -10 if no activity in 7+ days
 */
function calculateScore(signals: EngagementSignals): number {
  let score = 0;

  // Email opens: 5 pts each, max 25
  score += Math.min(signals.emailOpens * 5, 25);

  // Email clicks: 10 pts each, max 30
  score += Math.min(signals.emailClicks * 10, 30);

  // Preview visits: 8 pts each, max 24
  score += Math.min(signals.previewVisits * 8, 24);

  // Preview duration: 1 pt per 30 seconds, max 10
  score += Math.min(Math.floor(signals.totalPreviewDuration / 30), 10);

  // SMS replies: 15 pts each, max 15
  score += Math.min(signals.smsReplies * 15, 15);

  // Recency bonus/penalty
  if (signals.lastActivityAt) {
    const hoursSinceActivity = (Date.now() - new Date(signals.lastActivityAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceActivity < 24) score += 5;
    else if (hoursSinceActivity > 168) score -= 10; // 7 days
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Convert numeric score to engagement level.
 */
function scoreToLevel(score: number): EngagementScore["level"] {
  if (score >= 60) return "on-fire";
  if (score >= 40) return "hot";
  if (score >= 20) return "warm";
  return "cold";
}

/**
 * Evaluate which conditional modules should be triggered.
 */
function evaluateTriggers(
  score: number,
  signals: EngagementSignals
): EngagementScore["triggers"] {
  return {
    showSocialProof:
      score >= TRIGGER_THRESHOLDS.socialProof.minScore &&
      (signals.emailOpens >= TRIGGER_THRESHOLDS.socialProof.minOpens ||
       signals.previewVisits >= TRIGGER_THRESHOLDS.socialProof.minVisits),

    showUrgency:
      score >= TRIGGER_THRESHOLDS.urgency.minScore &&
      signals.emailClicks >= TRIGGER_THRESHOLDS.urgency.minClicks &&
      signals.previewVisits >= TRIGGER_THRESHOLDS.urgency.minVisits,

    showCompetitorComparison:
      score >= TRIGGER_THRESHOLDS.competitorComparison.minScore &&
      signals.previewVisits >= TRIGGER_THRESHOLDS.competitorComparison.minVisits,

    showCountdown:
      score >= TRIGGER_THRESHOLDS.countdown.minScore,
  };
}

/**
 * Get a human-readable summary of engagement for dashboard/logging.
 */
export function formatEngagementSummary(engagement: EngagementScore): string {
  const { score, level, signals } = engagement;
  const parts = [];

  if (signals.emailOpens > 0) parts.push(`${signals.emailOpens} email opens`);
  if (signals.emailClicks > 0) parts.push(`${signals.emailClicks} clicks`);
  if (signals.previewVisits > 0) parts.push(`${signals.previewVisits} preview visits`);
  if (signals.smsReplies > 0) parts.push(`${signals.smsReplies} SMS replies`);

  const summary = parts.length > 0 ? parts.join(", ") : "no engagement yet";
  return `Score: ${score}/100 (${level}) — ${summary}`;
}
