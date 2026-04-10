/**
 * Automated Follow-Up Scheduler
 *
 * Handles re-engagement timing when a prospect replies and the AI agent pauses the funnel.
 *
 * Flow:
 * 1. Prospect replies → AI responds → funnel paused
 * 2. If prospect doesn't reply within configurable window (default 48h) → auto-resume funnel
 * 3. Dashboard control to configure the delay per-prospect or globally
 *
 * This module manages:
 * - Tracking when AI sent its last response to each prospect
 * - Checking if the no-reply window has elapsed
 * - Auto-resuming funnels for prospects who went silent
 * - Configurable delay settings (global default + per-prospect overrides)
 */
import fs from "fs";
import path from "path";
import { getProspect } from "./store";
import { resumeFunnel } from "./funnel-manager";
import { supabase, isSupabaseConfigured } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const SCHEDULER_FILE = path.join(DATA_DIR, "followup-scheduler.json");
const CONFIG_FILE = path.join(DATA_DIR, "followup-config.json");

// ==================== TYPES ====================

export interface FollowUpTracker {
  prospectId: string;
  businessName: string;
  /** When the AI sent its last response */
  aiRespondedAt: string;
  /** When the prospect last replied (before AI response) */
  prospectRepliedAt: string;
  /** Channel of the conversation */
  channel: "email" | "sms";
  /** Custom delay override for this prospect (hours). null = use global default */
  customDelayHours: number | null;
  /** Whether auto-resume has been triggered */
  autoResumed: boolean;
  /** When auto-resume was triggered */
  autoResumedAt: string | null;
  /** Current status */
  status: "waiting" | "resumed" | "prospect_replied" | "manually_handled";
}

export interface FollowUpConfig {
  /** Global default delay in hours before auto-resuming (default: 48) */
  defaultDelayHours: number;
  /** Whether auto-resume is enabled globally */
  enabled: boolean;
  /** Maximum number of auto-resumes per prospect before giving up */
  maxAutoResumes: number;
  /** Whether to send a re-engagement message before resuming the funnel */
  sendReengagementMessage: boolean;
  /** Custom re-engagement message template (uses {{name}} and {{businessName}} placeholders) */
  reengagementTemplate: string;
}

export interface SchedulerStatus {
  config: FollowUpConfig;
  trackers: FollowUpTracker[];
  stats: {
    totalWaiting: number;
    totalResumed: number;
    totalReplied: number;
    dueForResume: number;
    avgResponseTime: number | null;
  };
}

// ==================== DEFAULT CONFIG ====================

const DEFAULT_CONFIG: FollowUpConfig = {
  defaultDelayHours: 48,
  enabled: true,
  maxAutoResumes: 2,
  sendReengagementMessage: true,
  reengagementTemplate:
    "Hey {{name}}, just circling back — wanted to make sure you saw my last message about the website I built for {{businessName}}. Happy to answer any questions or hop on a quick call if that's easier!",
};

// ==================== FILE HELPERS ====================

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadTrackers(): FollowUpTracker[] {
  if (process.env.VERCEL) return [];
  ensureDataDir();
  if (!fs.existsSync(SCHEDULER_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(SCHEDULER_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveTrackers(trackers: FollowUpTracker[]) {
  if (process.env.VERCEL) return;
  ensureDataDir();
  fs.writeFileSync(SCHEDULER_FILE, JSON.stringify(trackers, null, 2));
}

export function loadConfig(): FollowUpConfig {
  if (process.env.VERCEL) return DEFAULT_CONFIG;
  ensureDataDir();
  if (!fs.existsSync(CONFIG_FILE)) return DEFAULT_CONFIG;
  try {
    const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    return { ...DEFAULT_CONFIG, ...saved };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: Partial<FollowUpConfig>): FollowUpConfig {
  const current = loadConfig();
  const updated = { ...current, ...config };
  if (!process.env.VERCEL) {
    ensureDataDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
  }
  // Also persist to Supabase if available
  if (isSupabaseConfigured()) {
    supabase
      .from("system_config")
      .upsert({ key: "followup_scheduler", value: updated }, { onConflict: "key" })
      .then(() => {})
      .catch(() => {});
  }
  return updated;
}

// ==================== CORE FUNCTIONS ====================

/**
 * Track that the AI has responded to a prospect.
 * Called from the inbound email/SMS handler after AI sends a reply.
 */
export function trackAiResponse(
  prospectId: string,
  businessName: string,
  channel: "email" | "sms"
): void {
  const trackers = loadTrackers();
  const now = new Date().toISOString();

  // Check if there's an existing tracker for this prospect
  const existing = trackers.find(
    (t) => t.prospectId === prospectId && t.status === "waiting"
  );

  if (existing) {
    // Update the existing tracker with new AI response time
    existing.aiRespondedAt = now;
    existing.prospectRepliedAt = now;
    existing.channel = channel;
    existing.autoResumed = false;
    existing.autoResumedAt = null;
    existing.status = "waiting";
  } else {
    // Create new tracker
    trackers.push({
      prospectId,
      businessName,
      aiRespondedAt: now,
      prospectRepliedAt: now,
      channel,
      customDelayHours: null,
      autoResumed: false,
      autoResumedAt: null,
      status: "waiting",
    });
  }

  saveTrackers(trackers);

  // Also persist to Supabase
  if (isSupabaseConfigured()) {
    supabase
      .from("followup_trackers")
      .upsert(
        {
          prospect_id: prospectId,
          business_name: businessName,
          ai_responded_at: now,
          prospect_replied_at: now,
          channel,
          status: "waiting",
          auto_resumed: false,
        },
        { onConflict: "prospect_id" }
      )
      .then(() => {})
      .catch(() => {});
  }
}

/**
 * Mark that a prospect has replied (so we don't auto-resume).
 * Called from inbound email/SMS handler when a new message comes in.
 */
export function markProspectReplied(prospectId: string): void {
  const trackers = loadTrackers();
  const tracker = trackers.find(
    (t) => t.prospectId === prospectId && t.status === "waiting"
  );

  if (tracker) {
    tracker.status = "prospect_replied";
    tracker.prospectRepliedAt = new Date().toISOString();
    saveTrackers(trackers);
  }
}

/**
 * Run the auto-resume check.
 * Finds all prospects where:
 * 1. AI responded but prospect hasn't replied
 * 2. The configured delay window has elapsed
 * 3. Auto-resume hasn't been triggered too many times
 *
 * Returns list of prospects that were auto-resumed.
 */
export async function runAutoResumeCheck(): Promise<{
  checked: number;
  resumed: Array<{ prospectId: string; businessName: string; waitedHours: number }>;
  stillWaiting: number;
  skipped: Array<{ prospectId: string; reason: string }>;
}> {
  const config = loadConfig();
  const trackers = loadTrackers();
  const now = Date.now();

  if (!config.enabled) {
    return { checked: 0, resumed: [], stillWaiting: 0, skipped: [] };
  }

  const waiting = trackers.filter((t) => t.status === "waiting");
  const resumed: Array<{ prospectId: string; businessName: string; waitedHours: number }> = [];
  const skipped: Array<{ prospectId: string; reason: string }> = [];
  let stillWaiting = 0;

  for (const tracker of waiting) {
    const delayHours = tracker.customDelayHours ?? config.defaultDelayHours;
    const aiRespondedTime = new Date(tracker.aiRespondedAt).getTime();
    const elapsedHours = (now - aiRespondedTime) / (1000 * 60 * 60);

    if (elapsedHours < delayHours) {
      stillWaiting++;
      continue;
    }

    // Check if prospect still exists and is in a valid state
    const prospect = await getProspect(tracker.prospectId);
    if (!prospect) {
      tracker.status = "manually_handled";
      skipped.push({ prospectId: tracker.prospectId, reason: "Prospect not found" });
      continue;
    }

    // Don't resume if prospect has unsubscribed, paid, or been dismissed
    if (["unsubscribed", "paid", "dismissed"].includes(prospect.status)) {
      tracker.status = "manually_handled";
      skipped.push({ prospectId: tracker.prospectId, reason: `Status: ${prospect.status}` });
      continue;
    }

    // Count previous auto-resumes for this prospect
    const previousResumes = trackers.filter(
      (t) => t.prospectId === tracker.prospectId && t.autoResumed
    ).length;

    if (previousResumes >= config.maxAutoResumes) {
      tracker.status = "manually_handled";
      skipped.push({
        prospectId: tracker.prospectId,
        reason: `Max auto-resumes reached (${config.maxAutoResumes})`,
      });
      continue;
    }

    // Auto-resume the funnel
    try {
      const success = await resumeFunnel(tracker.prospectId);
      if (success) {
        tracker.autoResumed = true;
        tracker.autoResumedAt = new Date().toISOString();
        tracker.status = "resumed";

        resumed.push({
          prospectId: tracker.prospectId,
          businessName: tracker.businessName,
          waitedHours: Math.round(elapsedHours),
        });

        console.log(
          `[Follow-Up Scheduler] Auto-resumed funnel for ${tracker.businessName} after ${Math.round(elapsedHours)}h of no reply`
        );
      } else {
        skipped.push({
          prospectId: tracker.prospectId,
          reason: "Resume failed — no enrollment found",
        });
      }
    } catch (err) {
      skipped.push({
        prospectId: tracker.prospectId,
        reason: `Resume error: ${(err as Error).message}`,
      });
    }
  }

  saveTrackers(trackers);
  return { checked: waiting.length, resumed, stillWaiting, skipped };
}

/**
 * Get the full scheduler status for the dashboard.
 */
export function getSchedulerStatus(): SchedulerStatus {
  const config = loadConfig();
  const trackers = loadTrackers();

  const waiting = trackers.filter((t) => t.status === "waiting");
  const resumed = trackers.filter((t) => t.status === "resumed");
  const replied = trackers.filter((t) => t.status === "prospect_replied");

  // Calculate how many are due for resume right now
  const now = Date.now();
  let dueForResume = 0;
  for (const t of waiting) {
    const delayHours = t.customDelayHours ?? config.defaultDelayHours;
    const elapsed = (now - new Date(t.aiRespondedAt).getTime()) / (1000 * 60 * 60);
    if (elapsed >= delayHours) dueForResume++;
  }

  // Calculate average response time for prospects who did reply
  let avgResponseTime: number | null = null;
  if (replied.length > 0) {
    const responseTimes = replied.map((t) => {
      const aiTime = new Date(t.aiRespondedAt).getTime();
      const replyTime = new Date(t.prospectRepliedAt).getTime();
      return (replyTime - aiTime) / (1000 * 60 * 60);
    });
    avgResponseTime = Math.round(
      (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 10
    ) / 10;
  }

  return {
    config,
    trackers: trackers.slice(-50), // Last 50 for display
    stats: {
      totalWaiting: waiting.length,
      totalResumed: resumed.length,
      totalReplied: replied.length,
      dueForResume,
      avgResponseTime,
    },
  };
}

/**
 * Set a custom delay for a specific prospect.
 */
export function setProspectDelay(prospectId: string, delayHours: number | null): boolean {
  const trackers = loadTrackers();
  const tracker = trackers.find(
    (t) => t.prospectId === prospectId && t.status === "waiting"
  );
  if (!tracker) return false;
  tracker.customDelayHours = delayHours;
  saveTrackers(trackers);
  return true;
}
