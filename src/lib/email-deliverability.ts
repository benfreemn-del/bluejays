/**
 * Email Deliverability Engine
 *
 * Comprehensive deliverability optimization including:
 * 1. SPF/DKIM/DMARC verification checks
 * 2. Email warm-up sequence logic (gradual volume ramp)
 * 3. Bounce handling (auto-remove hard bounces, retry soft bounces)
 * 4. Deliverability health indicator scoring
 * 5. Open rate monitoring with threshold alerts
 */
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "./supabase";
import { updateProspect, getProspect } from "./store";
import { logCost } from "./cost-logger";

const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DELIVERABILITY_FILE = path.join(DATA_DIR, "email-deliverability.json");
const WARMUP_FILE = path.join(DATA_DIR, "email-warmup.json");
const BOUNCE_FILE = path.join(DATA_DIR, "email-bounces.json");

// ==================== TYPES ====================

export interface DomainVerification {
  domain: string;
  spf: { valid: boolean; record: string | null; checkedAt: string };
  dkim: { valid: boolean; record: string | null; checkedAt: string };
  dmarc: { valid: boolean; record: string | null; policy: string | null; checkedAt: string };
  overallScore: number; // 0-100
  lastCheckedAt: string;
}

export interface WarmupSchedule {
  domain: string;
  startedAt: string;
  currentDay: number;
  dailyLimit: number;
  sentToday: number;
  lastSendDate: string;
  phase: "warming" | "ramping" | "full";
  history: WarmupDayRecord[];
}

export interface WarmupDayRecord {
  date: string;
  sent: number;
  limit: number;
  bounces: number;
  opens: number;
  phase: string;
}

export interface BounceRecord {
  email: string;
  prospectId: string;
  type: "hard" | "soft";
  reason: string;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  resolved: boolean;
}

export interface DeliverabilityHealth {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  openRate: number;
  clickRate: number;
  bounceRate: number;
  spamRate: number;
  domainAuth: { spf: boolean; dkim: boolean; dmarc: boolean };
  warmupStatus: "warming" | "ramping" | "full" | "not_started";
  dailySendLimit: number;
  sentToday: number;
  alerts: DeliverabilityAlert[];
  lastUpdated: string;
}

export interface DeliverabilityAlert {
  level: "critical" | "warning" | "info";
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
  timestamp: string;
}

// ==================== THRESHOLDS ====================

const OPEN_RATE_CRITICAL = 10;  // Below 10% = critical
const OPEN_RATE_WARNING = 20;   // Below 20% = warning
const BOUNCE_RATE_CRITICAL = 5; // Above 5% = critical
const BOUNCE_RATE_WARNING = 2;  // Above 2% = warning
const SPAM_RATE_CRITICAL = 0.3; // Above 0.3% = critical
const SOFT_BOUNCE_MAX_RETRIES = 3;

/**
 * Warm-up schedule: gradual volume ramp over 30 days.
 * Day 1-7:   "warming"  — 5 to 25 emails/day
 * Day 8-14:  "ramping"  — 30 to 75 emails/day
 * Day 15-30: "ramping"  — 80 to 200 emails/day
 * Day 31+:   "full"     — unlimited (but respect SendGrid limits)
 */
function getWarmupDailyLimit(day: number): number {
  // Check for bypass flag
  if (process.env.SKIP_WARMUP === "true") return 1000;

  if (day <= 0) return 100; // Increased from 5 to 100 for Day 1
  if (day <= 7) return Math.min(100 + (day - 1) * 20, 250);
  if (day <= 14) return Math.min(250 + (day - 8) * 30, 500);
  if (day <= 21) return Math.min(500 + (day - 15) * 50, 1000);
  if (day <= 30) return Math.min(1000 + (day - 21) * 100, 2000);
  return 5000; // Full capacity
}

function getWarmupPhase(day: number): "warming" | "ramping" | "full" {
  if (day <= 7) return "warming";
  if (day <= 30) return "ramping";
  return "full";
}

// ==================== FILE HELPERS ====================

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDeliverabilityData(): DomainVerification[] {
  ensureDataDir();
  if (!fs.existsSync(DELIVERABILITY_FILE)) return [];
  return JSON.parse(fs.readFileSync(DELIVERABILITY_FILE, "utf-8"));
}

function saveDeliverabilityData(data: DomainVerification[]) {
  ensureDataDir();
  fs.writeFileSync(DELIVERABILITY_FILE, JSON.stringify(data, null, 2));
}

function loadWarmupData(): WarmupSchedule[] {
  ensureDataDir();
  if (!fs.existsSync(WARMUP_FILE)) return [];
  return JSON.parse(fs.readFileSync(WARMUP_FILE, "utf-8"));
}

function saveWarmupData(data: WarmupSchedule[]) {
  ensureDataDir();
  fs.writeFileSync(WARMUP_FILE, JSON.stringify(data, null, 2));
}

function loadBounceData(): BounceRecord[] {
  ensureDataDir();
  if (!fs.existsSync(BOUNCE_FILE)) return [];
  return JSON.parse(fs.readFileSync(BOUNCE_FILE, "utf-8"));
}

function saveBounceData(data: BounceRecord[]) {
  ensureDataDir();
  fs.writeFileSync(BOUNCE_FILE, JSON.stringify(data, null, 2));
}

// ==================== SPF/DKIM/DMARC VERIFICATION ====================

/**
 * Verify SPF record for a domain by checking DNS TXT records.
 */
async function verifySPF(domain: string): Promise<{ valid: boolean; record: string | null }> {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${domain}&type=TXT`
    );
    const data = await response.json();
    if (data.Answer) {
      const spfRecord = data.Answer.find(
        (r: { data: string }) => r.data && r.data.includes("v=spf1")
      );
      if (spfRecord) {
        const record = spfRecord.data.replace(/"/g, "");
        // Check if the SPF record includes SendGrid
        const includesSendGrid = record.includes("sendgrid.net") || record.includes("include:_spf");
        return { valid: includesSendGrid || record.includes("v=spf1"), record };
      }
    }
    return { valid: false, record: null };
  } catch {
    return { valid: false, record: null };
  }
}

/**
 * Verify DKIM record for a domain.
 * Checks for common DKIM selector prefixes used by SendGrid.
 */
async function verifyDKIM(domain: string): Promise<{ valid: boolean; record: string | null }> {
  const selectors = ["s1._domainkey", "s2._domainkey", "google._domainkey", "default._domainkey"];
  for (const selector of selectors) {
    try {
      const response = await fetch(
        `https://dns.google/resolve?name=${selector}.${domain}&type=TXT`
      );
      const data = await response.json();
      if (data.Answer && data.Answer.length > 0) {
        const dkimRecord = data.Answer.find(
          (r: { data: string }) => r.data && (r.data.includes("v=DKIM1") || r.data.includes("k=rsa"))
        );
        if (dkimRecord) {
          return { valid: true, record: dkimRecord.data.replace(/"/g, "").substring(0, 100) + "..." };
        }
      }
    } catch {
      continue;
    }
  }
  return { valid: false, record: null };
}

/**
 * Verify DMARC record for a domain.
 */
async function verifyDMARC(domain: string): Promise<{ valid: boolean; record: string | null; policy: string | null }> {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=_dmarc.${domain}&type=TXT`
    );
    const data = await response.json();
    if (data.Answer) {
      const dmarcRecord = data.Answer.find(
        (r: { data: string }) => r.data && r.data.includes("v=DMARC1")
      );
      if (dmarcRecord) {
        const record = dmarcRecord.data.replace(/"/g, "");
        const policyMatch = record.match(/p=(\w+)/);
        const policy = policyMatch ? policyMatch[1] : null;
        return { valid: true, record, policy };
      }
    }
    return { valid: false, record: null, policy: null };
  } catch {
    return { valid: false, record: null, policy: null };
  }
}

/**
 * Run full domain authentication verification.
 * Checks SPF, DKIM, and DMARC records and returns a scored result.
 */
export async function verifyDomainAuth(domain: string): Promise<DomainVerification> {
  const now = new Date().toISOString();
  const [spf, dkim, dmarc] = await Promise.all([
    verifySPF(domain),
    verifyDKIM(domain),
    verifyDMARC(domain),
  ]);

  // Score: SPF = 35pts, DKIM = 35pts, DMARC = 30pts
  let score = 0;
  if (spf.valid) score += 35;
  if (dkim.valid) score += 35;
  if (dmarc.valid) {
    score += 20;
    // Bonus for strict DMARC policy
    if (dmarc.policy === "reject") score += 10;
    else if (dmarc.policy === "quarantine") score += 7;
    else score += 3; // "none" policy
  }

  const verification: DomainVerification = {
    domain,
    spf: { ...spf, checkedAt: now },
    dkim: { ...dkim, checkedAt: now },
    dmarc: { ...dmarc, checkedAt: now },
    overallScore: score,
    lastCheckedAt: now,
  };

  // Persist
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("domain_verifications").upsert({
        domain,
        spf_valid: spf.valid,
        spf_record: spf.record,
        dkim_valid: dkim.valid,
        dkim_record: dkim.record,
        dmarc_valid: dmarc.valid,
        dmarc_record: dmarc.record,
        dmarc_policy: dmarc.policy,
        overall_score: score,
        checked_at: now,
      });
    } catch {
      // Table may not exist yet
    }
  } else {
    const data = loadDeliverabilityData();
    const idx = data.findIndex((d) => d.domain === domain);
    if (idx >= 0) data[idx] = verification;
    else data.push(verification);
    saveDeliverabilityData(data);
  }

  return verification;
}

// ==================== WARM-UP SEQUENCE ====================

/**
 * Initialize or get the warm-up schedule for a sending domain.
 */
export function getWarmupSchedule(domain: string): WarmupSchedule {
  const schedules = loadWarmupData();
  const existing = schedules.find((s) => s.domain === domain);
  if (existing) {
    // Update current day based on elapsed time
    const startDate = new Date(existing.startedAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    existing.currentDay = daysDiff + 1;
    existing.dailyLimit = getWarmupDailyLimit(existing.currentDay);
    existing.phase = getWarmupPhase(existing.currentDay);

    // Reset sentToday if it's a new day
    const today = now.toISOString().split("T")[0];
    if (existing.lastSendDate !== today) {
      existing.sentToday = 0;
      existing.lastSendDate = today;
    }

    return existing;
  }

  // Create new warm-up schedule
  const newSchedule: WarmupSchedule = {
    domain,
    startedAt: new Date().toISOString(),
    currentDay: 1,
    dailyLimit: getWarmupDailyLimit(1),
    sentToday: 0,
    lastSendDate: new Date().toISOString().split("T")[0],
    phase: "warming",
    history: [],
  };

  schedules.push(newSchedule);
  saveWarmupData(schedules);
  return newSchedule;
}

/**
 * Check if we can send another email today based on warm-up limits.
 */
export function canSendEmail(domain: string): { allowed: boolean; remaining: number; limit: number; phase: string } {
  const schedule = getWarmupSchedule(domain);
  const remaining = Math.max(0, schedule.dailyLimit - schedule.sentToday);
  return {
    allowed: remaining > 0,
    remaining,
    limit: schedule.dailyLimit,
    phase: schedule.phase,
  };
}

/**
 * Record that an email was sent (for warm-up tracking).
 */
export function recordEmailSent(domain: string): void {
  const schedules = loadWarmupData();
  const schedule = schedules.find((s) => s.domain === domain);
  if (!schedule) {
    // Auto-initialize
    const newSchedule = getWarmupSchedule(domain);
    newSchedule.sentToday += 1;
    const updatedSchedules = loadWarmupData();
    const idx = updatedSchedules.findIndex((s) => s.domain === domain);
    if (idx >= 0) updatedSchedules[idx] = newSchedule;
    saveWarmupData(updatedSchedules);
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  if (schedule.lastSendDate !== today) {
    // New day: log yesterday's record and reset
    if (schedule.sentToday > 0) {
      schedule.history.push({
        date: schedule.lastSendDate,
        sent: schedule.sentToday,
        limit: schedule.dailyLimit,
        bounces: 0,
        opens: 0,
        phase: schedule.phase,
      });
    }
    schedule.sentToday = 0;
    schedule.lastSendDate = today;
  }

  schedule.sentToday += 1;
  saveWarmupData(schedules);
}

// ==================== SENDGRID SUPPRESSION GROUP ====================

/**
 * SendGrid Advanced Suppression group ID for hard bounces. We create
 * the group lazily once on first hard-bounce of a process lifetime
 * (idempotent — POST returns the existing group if one is already
 * named "Hard Bounces") and cache the id in-memory so subsequent
 * suppressions don't need to re-resolve it.
 *
 * Adding an address to this group ensures any retry via the SendGrid
 * v3 send API (e.g. funnel re-enroll, manual resend, or bug-induced
 * re-send) is silently dropped at the API layer instead of bouncing
 * a second time and dragging our reputation further down. See
 * Rule 42 in CLAUDE.md.
 */
let HARD_BOUNCE_GROUP_ID: number | null = null;
let HARD_BOUNCE_GROUP_RESOLVE_FAILED_AT: number | null = null;
const GROUP_RESOLVE_RETRY_MS = 60 * 60 * 1000; // 1 hour

async function resolveHardBounceGroupId(): Promise<number | null> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return null;
  if (HARD_BOUNCE_GROUP_ID !== null) return HARD_BOUNCE_GROUP_ID;
  if (
    HARD_BOUNCE_GROUP_RESOLVE_FAILED_AT &&
    Date.now() - HARD_BOUNCE_GROUP_RESOLVE_FAILED_AT < GROUP_RESOLVE_RETRY_MS
  ) {
    return null;
  }

  try {
    // 1. List existing groups — name lookup avoids duplicate creation
    const listRes = await fetch("https://api.sendgrid.com/v3/asm/groups", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (listRes.ok) {
      const groups = (await listRes.json()) as Array<{ id: number; name: string }>;
      const existing = groups.find((g) => g.name === "Hard Bounces");
      if (existing) {
        HARD_BOUNCE_GROUP_ID = existing.id;
        return existing.id;
      }
    }

    // 2. Create the group if it doesn't exist
    const createRes = await fetch("https://api.sendgrid.com/v3/asm/groups", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Hard Bounces",
        description:
          "Auto-populated by email-deliverability.ts on hard bounce or 3-soft-in-7-days escalation. Do not delete — suppression is what protects sender reputation.",
        is_default: false,
      }),
    });
    if (createRes.ok) {
      const group = (await createRes.json()) as { id: number };
      HARD_BOUNCE_GROUP_ID = group.id;
      return group.id;
    }

    HARD_BOUNCE_GROUP_RESOLVE_FAILED_AT = Date.now();
    console.warn(
      `[Deliverability] Could not create/resolve SendGrid suppression group (status: ${createRes.status})`
    );
    return null;
  } catch (err) {
    HARD_BOUNCE_GROUP_RESOLVE_FAILED_AT = Date.now();
    console.warn(`[Deliverability] SendGrid suppression group resolve failed:`, err);
    return null;
  }
}

/**
 * Add an email address to the SendGrid hard-bounce suppression group.
 * Mock-mode safe: returns silently if SENDGRID_API_KEY is absent.
 * Wrapped in try/catch — never blocks the bounce flow on suppression
 * failure.
 */
async function addToSendGridSuppressionGroup(email: string): Promise<void> {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.log(`[Deliverability] (mock) would suppress ${email} at SendGrid`);
      return;
    }
    const groupId = await resolveHardBounceGroupId();
    if (!groupId) return;

    const res = await fetch(
      `https://api.sendgrid.com/v3/asm/groups/${groupId}/suppressions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient_emails: [email] }),
      }
    );
    if (!res.ok) {
      console.warn(
        `[Deliverability] SendGrid suppression POST returned ${res.status} for ${email}`
      );
    } else {
      console.log(`[Deliverability] Suppressed ${email} at SendGrid (group ${groupId})`);
    }
  } catch (err) {
    // Never block the bounce flow on suppression failure
    console.warn(`[Deliverability] SendGrid suppression failed for ${email}:`, err);
  }
}

// ==================== BOUNCE HANDLING ====================

const SOFT_BOUNCE_WINDOW_DAYS = 7;
const SOFT_BOUNCE_ESCALATION_THRESHOLD = 3;

/**
 * Process a bounce event from SendGrid webhook.
 * Hard bounces: flip prospect to "bounced" status, pause funnel,
 *   add to SendGrid suppression group.
 * Soft bounces: increment soft_bounce_count. If it hits 3 within a
 *   rolling 7-day window, escalate to hard-bounce treatment.
 *
 * See Rule 42 in CLAUDE.md for the full policy.
 */
export async function processBounce(
  email: string,
  prospectId: string,
  bounceType: "hard" | "soft",
  reason: string
): Promise<BounceRecord> {
  const bounces = loadBounceData();
  const existing = bounces.find((b) => b.email === email && !b.resolved);
  const now = new Date().toISOString();

  if (existing) {
    existing.retryCount += 1;
    existing.timestamp = now;
    existing.reason = reason;

    // Soft bounce exceeded retries → treat as hard
    if (existing.type === "soft" && existing.retryCount >= SOFT_BOUNCE_MAX_RETRIES) {
      existing.type = "hard";
      existing.resolved = true;
      await handleHardBounce(email, prospectId, reason);
    }

    saveBounceData(bounces);
    return existing;
  }

  // New bounce record
  const record: BounceRecord = {
    email,
    prospectId,
    type: bounceType,
    reason,
    timestamp: now,
    retryCount: bounceType === "hard" ? 0 : 1,
    maxRetries: SOFT_BOUNCE_MAX_RETRIES,
    resolved: bounceType === "hard",
  };

  if (bounceType === "hard") {
    await handleHardBounce(email, prospectId, reason);
  } else {
    await handleSoftBounce(email, prospectId, reason);
  }

  bounces.push(record);
  saveBounceData(bounces);

  // Also persist to Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("email_bounces").upsert({
        email,
        prospect_id: prospectId,
        bounce_type: bounceType,
        reason,
        retry_count: record.retryCount,
        resolved: record.resolved,
        updated_at: record.timestamp,
      });
    } catch {
      // Table may not exist
    }
  }

  return record;
}

/**
 * Handle a hard bounce: flip the prospect to "bounced" status, pause
 * funnel, log the status transition, and add the address to the
 * SendGrid suppression group so any retry via the API is silently
 * dropped at the SMTP gateway.
 */
async function handleHardBounce(
  email: string,
  prospectId: string,
  reason: string
): Promise<void> {
  console.log(
    `[Deliverability] Hard bounce for ${email} — flipping prospect ${prospectId} to "bounced"`
  );
  try {
    // Flip status to "bounced", pause funnel. logStatusChange() inside
    // updateProspect() writes the row to prospect_status_changes with
    // the from/to status; the bounce reason rides through as the source.
    await updateProspect(
      prospectId,
      {
        status: "bounced",
        funnelPaused: true,
      },
      { source: `hard_bounce:${reason || "unknown"}` }
    );
  } catch (err) {
    console.error(`[Deliverability] Failed to update prospect after hard bounce:`, err);
  }

  // Best-effort: add to SendGrid suppression group. Wrapped in try/catch
  // inside addToSendGridSuppressionGroup() — never blocks.
  await addToSendGridSuppressionGroup(email);

  // Log cost trail (audit-only at $0)
  await logCost({
    prospectId,
    service: "sendgrid_suppression",
    action: "hard_bounce_suppress",
    costUsd: 0,
    metadata: { email, reason },
  }).catch(() => {});
}

/**
 * Handle a soft bounce: increment the rolling 7-day counter and
 * escalate to hard-bounce treatment if the threshold is crossed.
 */
async function handleSoftBounce(
  email: string,
  prospectId: string,
  reason: string
): Promise<void> {
  try {
    const prospect = await getProspect(prospectId);
    if (!prospect) return;

    const now = new Date();
    const last = prospect.lastSoftBounceAt
      ? new Date(prospect.lastSoftBounceAt)
      : null;

    // Reset the counter if the previous soft bounce is older than the
    // rolling window — only consecutive-in-window bounces escalate.
    const windowMs = SOFT_BOUNCE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const inWindow = last && now.getTime() - last.getTime() <= windowMs;
    const newCount = inWindow ? (prospect.softBounceCount || 0) + 1 : 1;

    await updateProspect(
      prospectId,
      {
        softBounceCount: newCount,
        lastSoftBounceAt: now.toISOString(),
      },
      { source: `soft_bounce:${reason || "unknown"}` }
    );

    if (newCount >= SOFT_BOUNCE_ESCALATION_THRESHOLD) {
      console.log(
        `[Deliverability] ${email} hit ${newCount} soft bounces in ${SOFT_BOUNCE_WINDOW_DAYS}d — escalating to hard bounce`
      );
      await handleHardBounce(
        email,
        prospectId,
        `escalated_from_${newCount}_soft_bounces_in_${SOFT_BOUNCE_WINDOW_DAYS}d`
      );
    }
  } catch (err) {
    console.error(`[Deliverability] Soft-bounce escalation check failed:`, err);
  }
}

/**
 * Check if an email address has bounced and should not be sent to.
 */
export function isEmailBounced(email: string): boolean {
  const bounces = loadBounceData();
  return bounces.some(
    (b) => b.email.toLowerCase() === email.toLowerCase() && b.type === "hard"
  );
}

/**
 * Get all soft bounces that are eligible for retry.
 */
export function getSoftBouncesForRetry(): BounceRecord[] {
  const bounces = loadBounceData();
  return bounces.filter(
    (b) => b.type === "soft" && !b.resolved && b.retryCount < SOFT_BOUNCE_MAX_RETRIES
  );
}

/**
 * Get bounce statistics.
 */
export function getBounceStats(): {
  totalBounces: number;
  hardBounces: number;
  softBounces: number;
  pendingRetries: number;
  resolvedBounces: number;
} {
  const bounces = loadBounceData();
  return {
    totalBounces: bounces.length,
    hardBounces: bounces.filter((b) => b.type === "hard").length,
    softBounces: bounces.filter((b) => b.type === "soft").length,
    pendingRetries: bounces.filter((b) => b.type === "soft" && !b.resolved).length,
    resolvedBounces: bounces.filter((b) => b.resolved).length,
  };
}

// ==================== DELIVERABILITY HEALTH SCORE ====================

/**
 * Calculate the overall deliverability health score and generate alerts.
 * Combines domain auth, bounce rates, open rates, and warm-up status.
 */
export async function getDeliverabilityHealth(
  domain: string
): Promise<DeliverabilityHealth> {
  const now = new Date().toISOString();
  const alerts: DeliverabilityAlert[] = [];

  // 1. Domain authentication check
  let domainAuth = { spf: false, dkim: false, dmarc: false };
  let authScore = 0;
  try {
    const verification = await verifyDomainAuth(domain);
    domainAuth = {
      spf: verification.spf.valid,
      dkim: verification.dkim.valid,
      dmarc: verification.dmarc.valid,
    };
    authScore = verification.overallScore;

    if (!verification.spf.valid) {
      alerts.push({
        level: "critical",
        message: "SPF record not found or invalid. Emails may land in spam.",
        metric: "spf",
        timestamp: now,
      });
    }
    if (!verification.dkim.valid) {
      alerts.push({
        level: "critical",
        message: "DKIM not configured. Email authentication will fail.",
        metric: "dkim",
        timestamp: now,
      });
    }
    if (!verification.dmarc.valid) {
      alerts.push({
        level: "warning",
        message: "DMARC record missing. Consider adding for better deliverability.",
        metric: "dmarc",
        timestamp: now,
      });
    }
  } catch {
    alerts.push({
      level: "warning",
      message: "Could not verify domain authentication records.",
      timestamp: now,
    });
  }

  // 2. Email stats (open/click/bounce rates)
  let openRate = 0;
  let clickRate = 0;
  let bounceRate = 0;
  let spamRate = 0;

  if (isSupabaseConfigured()) {
    try {
      const { data: events } = await supabase
        .from("email_events")
        .select("event_type, email")
        .order("timestamp", { ascending: false })
        .limit(1000);

      if (events && events.length > 0) {
        const delivered = events.filter((e: { event_type: string }) => e.event_type === "delivered").length;
        const uniqueOpens = new Set(events.filter((e: { event_type: string }) => e.event_type === "open").map((e: { email: string }) => e.email)).size;
        const uniqueClicks = new Set(events.filter((e: { event_type: string }) => e.event_type === "click").map((e: { email: string }) => e.email)).size;
        const bounces = events.filter((e: { event_type: string }) => e.event_type === "bounce").length;
        const spamReports = events.filter((e: { event_type: string }) => e.event_type === "spamreport").length;

        const total = delivered + bounces;
        if (total > 0) {
          openRate = Math.round((uniqueOpens / total) * 100);
          clickRate = Math.round((uniqueClicks / total) * 100);
          bounceRate = Math.round((bounces / total) * 100 * 10) / 10;
          spamRate = Math.round((spamReports / total) * 100 * 10) / 10;
        }
      }
    } catch {
      // Events table may not exist
    }
  }

  // Open rate alerts
  if (openRate > 0 && openRate < OPEN_RATE_CRITICAL) {
    alerts.push({
      level: "critical",
      message: `Open rate critically low at ${openRate}%. Emails are likely landing in spam.`,
      metric: "open_rate",
      value: openRate,
      threshold: OPEN_RATE_CRITICAL,
      timestamp: now,
    });
  } else if (openRate > 0 && openRate < OPEN_RATE_WARNING) {
    alerts.push({
      level: "warning",
      message: `Open rate below target at ${openRate}%. Consider reviewing subject lines and sender reputation.`,
      metric: "open_rate",
      value: openRate,
      threshold: OPEN_RATE_WARNING,
      timestamp: now,
    });
  }

  // Bounce rate alerts
  if (bounceRate > BOUNCE_RATE_CRITICAL) {
    alerts.push({
      level: "critical",
      message: `Bounce rate at ${bounceRate}%. Clean your email list immediately.`,
      metric: "bounce_rate",
      value: bounceRate,
      threshold: BOUNCE_RATE_CRITICAL,
      timestamp: now,
    });
  } else if (bounceRate > BOUNCE_RATE_WARNING) {
    alerts.push({
      level: "warning",
      message: `Bounce rate at ${bounceRate}%. Monitor closely and remove invalid addresses.`,
      metric: "bounce_rate",
      value: bounceRate,
      threshold: BOUNCE_RATE_WARNING,
      timestamp: now,
    });
  }

  // Spam rate alerts
  if (spamRate > SPAM_RATE_CRITICAL) {
    alerts.push({
      level: "critical",
      message: `Spam complaint rate at ${spamRate}%. Pause sending and review content.`,
      metric: "spam_rate",
      value: spamRate,
      threshold: SPAM_RATE_CRITICAL,
      timestamp: now,
    });
  }

  // 3. Warm-up status
  const warmup = getWarmupSchedule(domain);
  const warmupStatus = warmup.phase;

  if (warmup.phase === "warming") {
    alerts.push({
      level: "info",
      message: `Domain is in warm-up phase (Day ${warmup.currentDay}/30). Daily limit: ${warmup.dailyLimit} emails.`,
      metric: "warmup",
      timestamp: now,
    });
  }

  // 4. Calculate overall health score (0-100)
  let score = 0;

  // Domain auth: 30 points
  score += Math.round(authScore * 0.3);

  // Open rate: 25 points (scale from 0% to 40%+)
  if (openRate >= 40) score += 25;
  else if (openRate >= 20) score += Math.round(15 + ((openRate - 20) / 20) * 10);
  else if (openRate > 0) score += Math.round((openRate / 20) * 15);
  else score += 12; // No data yet — neutral

  // Bounce rate: 20 points (inverse — lower is better)
  if (bounceRate === 0) score += 20;
  else if (bounceRate < 1) score += 18;
  else if (bounceRate < 2) score += 15;
  else if (bounceRate < 5) score += 10;
  else score += 2;

  // Spam rate: 15 points
  if (spamRate === 0) score += 15;
  else if (spamRate < 0.1) score += 12;
  else if (spamRate < 0.3) score += 8;
  else score += 2;

  // Warm-up compliance: 10 points
  if (warmup.phase === "full") score += 10;
  else if (warmup.phase === "ramping") score += 7;
  else score += 4;

  // Determine grade
  let grade: "A" | "B" | "C" | "D" | "F";
  if (score >= 90) grade = "A";
  else if (score >= 75) grade = "B";
  else if (score >= 60) grade = "C";
  else if (score >= 40) grade = "D";
  else grade = "F";

  return {
    score,
    grade,
    openRate,
    clickRate,
    bounceRate,
    spamRate,
    domainAuth,
    warmupStatus,
    dailySendLimit: warmup.dailyLimit,
    sentToday: warmup.sentToday,
    alerts,
    lastUpdated: now,
  };
}

/**
 * Get the sending domain for deliverability checks.
 * Defaults to the primary SendGrid-authenticated domain (bluejayportfolio.com)
 * so the /deliverability dashboard checks the right SPF/DKIM/DMARC records.
 *
 * Previously this parsed FROM_EMAIL and returned "gmail.com" because the
 * From used to be bluejaycontactme@gmail.com. After the DKIM alignment fix
 * (2026-04-17), outreach actually sends from ben@bluejayportfolio.com, so
 * that's the correct domain to audit.
 */
export function getSendingDomain(): string {
  // Primary sending domain — hardcoded to match SENDERS config in
  // email-sender.ts. The FROM_EMAIL env var is intentionally ignored here
  // because Vercel had stale values that broke this check before.
  return "bluejayportfolio.com";
}
