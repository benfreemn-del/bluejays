import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "./email-sender";
import { sendSms } from "./sms";
import { supabase, isSupabaseConfigured } from "./supabase";

export type DeliveryChannel = "email" | "sms";
export type ChannelStatus = "healthy" | "degraded";
export type RetryStatus = "pending" | "retrying" | "sent" | "exhausted" | "cancelled";

export interface EmailDeliveryPayload {
  to: string;
  subject: string;
  body: string;
  sequence: number;
}

export interface SmsDeliveryPayload {
  to: string;
  body: string;
  sequence: number;
}

export interface FunnelDeliveryPayload {
  prospectId: string;
  stepIndex: number;
  stepLabel: string;
  preferredChannel: DeliveryChannel;
  email?: EmailDeliveryPayload;
  sms?: SmsDeliveryPayload;
}

export interface DeliveryAttemptLog {
  id: string;
  prospectId: string;
  stepIndex: number;
  stepLabel: string;
  attemptedChannel: DeliveryChannel;
  primaryChannel: DeliveryChannel;
  fallbackUsed: boolean;
  success: boolean;
  errorMessage: string | null;
  target: string;
  retryCount: number;
  attemptedAt: string;
}

export interface ChannelHealth {
  channel: DeliveryChannel;
  status: ChannelStatus;
  consecutiveFailures: number;
  failureThreshold: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastError: string | null;
  updatedAt: string;
}

export interface FunnelRetryRecord {
  id: string;
  prospectId: string;
  stepIndex: number;
  stepLabel: string;
  primaryChannel: DeliveryChannel;
  fallbackChannel: DeliveryChannel | null;
  emailTo: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  emailSequence: number | null;
  smsTo: string | null;
  smsBody: string | null;
  smsSequence: number | null;
  attemptCount: number;
  nextRetryAt: string;
  lastAttemptAt: string | null;
  lastError: string | null;
  status: RetryStatus;
  deliveredChannel: DeliveryChannel | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface FunnelDeliveryResult {
  success: boolean;
  emailSent: boolean;
  smsSent: boolean;
  deliveredChannel: DeliveryChannel | null;
  fallbackUsed: boolean;
  queuedForRetry: boolean;
  retryId?: string;
  attempts: DeliveryAttemptLog[];
  lastError?: string;
}

const FAILURE_THRESHOLD = 3;
const RETRY_DELAYS_HOURS = [1, 4, 24] as const;
const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_DELIVERY_LOG_FILE = path.join(DATA_DIR, "funnel-delivery-attempts.json");
const LOCAL_CHANNEL_HEALTH_FILE = path.join(DATA_DIR, "funnel-channel-health.json");
const LOCAL_RETRY_QUEUE_FILE = path.join(DATA_DIR, "funnel-retry-queue.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  if (process.env.VERCEL) return fallback;
  ensureDataDir();
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function writeJsonFile<T>(filePath: string, data: T) {
  if (process.env.VERCEL) return;
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getEmptyHealth(channel: DeliveryChannel): ChannelHealth {
  const now = new Date().toISOString();
  return {
    channel,
    status: "healthy",
    consecutiveFailures: 0,
    failureThreshold: FAILURE_THRESHOLD,
    lastSuccessAt: null,
    lastFailureAt: null,
    lastError: null,
    updatedAt: now,
  };
}

function mapHealthRow(row: Record<string, unknown>): ChannelHealth {
  return {
    channel: row.channel as DeliveryChannel,
    status: (row.status as ChannelStatus) || "healthy",
    consecutiveFailures: Number(row.consecutive_failures || 0),
    failureThreshold: Number(row.failure_threshold || FAILURE_THRESHOLD),
    lastSuccessAt: (row.last_success_at as string | null) || null,
    lastFailureAt: (row.last_failure_at as string | null) || null,
    lastError: (row.last_error as string | null) || null,
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  };
}

function mapRetryRow(row: Record<string, unknown>): FunnelRetryRecord {
  return {
    id: row.id as string,
    prospectId: row.prospect_id as string,
    stepIndex: Number(row.step_index),
    stepLabel: row.step_label as string,
    primaryChannel: row.primary_channel as DeliveryChannel,
    fallbackChannel: (row.fallback_channel as DeliveryChannel | null) || null,
    emailTo: (row.email_to as string | null) || null,
    emailSubject: (row.email_subject as string | null) || null,
    emailBody: (row.email_body as string | null) || null,
    emailSequence: row.email_sequence === null || row.email_sequence === undefined ? null : Number(row.email_sequence),
    smsTo: (row.sms_to as string | null) || null,
    smsBody: (row.sms_body as string | null) || null,
    smsSequence: row.sms_sequence === null || row.sms_sequence === undefined ? null : Number(row.sms_sequence),
    attemptCount: Number(row.attempt_count || 0),
    nextRetryAt: row.next_retry_at as string,
    lastAttemptAt: (row.last_attempt_at as string | null) || null,
    lastError: (row.last_error as string | null) || null,
    status: row.status as RetryStatus,
    deliveredChannel: (row.delivered_channel as DeliveryChannel | null) || null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    completedAt: (row.completed_at as string | null) || null,
  };
}

function mapAttemptRow(row: Record<string, unknown>): DeliveryAttemptLog {
  return {
    id: row.id as string,
    prospectId: row.prospect_id as string,
    stepIndex: Number(row.step_index),
    stepLabel: row.step_label as string,
    attemptedChannel: row.attempted_channel as DeliveryChannel,
    primaryChannel: row.primary_channel as DeliveryChannel,
    fallbackUsed: Boolean(row.fallback_used),
    success: Boolean(row.success),
    errorMessage: (row.error_message as string | null) || null,
    target: row.target as string,
    retryCount: Number(row.retry_count || 0),
    attemptedAt: row.attempted_at as string,
  };
}

export async function getChannelHealth(channel: DeliveryChannel): Promise<ChannelHealth> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("channel_health")
        .select("*")
        .eq("channel", channel)
        .single();
      if (!error && data) {
        return mapHealthRow(data as Record<string, unknown>);
      }
    } catch {
      // Fall back to local storage.
    }
  }

  const healthRecords = readJsonFile<ChannelHealth[]>(LOCAL_CHANNEL_HEALTH_FILE, []);
  return healthRecords.find((record) => record.channel === channel) || getEmptyHealth(channel);
}

async function saveChannelHealth(health: ChannelHealth) {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("channel_health").upsert({
        channel: health.channel,
        status: health.status,
        consecutive_failures: health.consecutiveFailures,
        failure_threshold: health.failureThreshold,
        last_success_at: health.lastSuccessAt,
        last_failure_at: health.lastFailureAt,
        last_error: health.lastError,
        updated_at: health.updatedAt,
      }, { onConflict: "channel" });
      return;
    } catch {
      // Fall back to local storage.
    }
  }

  const records = readJsonFile<ChannelHealth[]>(LOCAL_CHANNEL_HEALTH_FILE, []);
  const filtered = records.filter((record) => record.channel !== health.channel);
  filtered.push(health);
  writeJsonFile(LOCAL_CHANNEL_HEALTH_FILE, filtered);
}

function shouldAffectChannelHealth(channel: DeliveryChannel, errorMessage: string | null): boolean {
  if (!errorMessage) return false;
  const normalized = errorMessage.toLowerCase();

  if (channel === "email") {
    if (normalized.includes("hard-bounced") || normalized.includes("removed")) {
      return false;
    }
  }

  return true;
}

async function recordChannelOutcome(channel: DeliveryChannel, success: boolean, errorMessage: string | null) {
  if (!success && !shouldAffectChannelHealth(channel, errorMessage)) {
    return;
  }

  const current = await getChannelHealth(channel);
  const now = new Date().toISOString();

  const updated: ChannelHealth = success
    ? {
        ...current,
        status: "healthy",
        consecutiveFailures: 0,
        lastSuccessAt: now,
        lastError: null,
        updatedAt: now,
      }
    : {
        ...current,
        consecutiveFailures: current.consecutiveFailures + 1,
        status: current.consecutiveFailures + 1 >= FAILURE_THRESHOLD ? "degraded" : "healthy",
        lastFailureAt: now,
        lastError: errorMessage,
        updatedAt: now,
      };

  await saveChannelHealth(updated);
}

async function logDeliveryAttempt(attempt: DeliveryAttemptLog) {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("delivery_attempts").insert({
        id: attempt.id,
        prospect_id: attempt.prospectId,
        step_index: attempt.stepIndex,
        step_label: attempt.stepLabel,
        attempted_channel: attempt.attemptedChannel,
        primary_channel: attempt.primaryChannel,
        fallback_used: attempt.fallbackUsed,
        success: attempt.success,
        error_message: attempt.errorMessage,
        target: attempt.target,
        retry_count: attempt.retryCount,
        attempted_at: attempt.attemptedAt,
      });
      return;
    } catch {
      // Fall back to local storage.
    }
  }

  const attempts = readJsonFile<DeliveryAttemptLog[]>(LOCAL_DELIVERY_LOG_FILE, []);
  attempts.push(attempt);
  writeJsonFile(LOCAL_DELIVERY_LOG_FILE, attempts);
}

/**
 * Global SMS kill-switch. Flip via Vercel env var:
 *   SMS_FUNNEL_DISABLED=true  → funnel skips all SMS sends (email-only)
 * Unset or "false"            → funnel sends SMS normally
 *
 * Added 2026-04-18 because A2P 10DLC campaign is still pending carrier
 * review. Sending uncompliant SMS risks Twilio number suspension. Keep
 * this flag ON until the A2P campaign shows Approved in Twilio console.
 */
function isSmsGloballyDisabled(): boolean {
  const flag = (process.env.SMS_FUNNEL_DISABLED || "").toLowerCase();
  return flag === "true" || flag === "1" || flag === "yes";
}

function buildAvailableChannels(payload: FunnelDeliveryPayload): DeliveryChannel[] {
  const channels: DeliveryChannel[] = [];
  if (payload.email?.to && payload.email.subject && payload.email.body) channels.push("email");
  if (payload.sms?.to && payload.sms.body && !isSmsGloballyDisabled()) channels.push("sms");
  return channels;
}

function getFallbackChannel(channel: DeliveryChannel): DeliveryChannel {
  return channel === "email" ? "sms" : "email";
}

export async function getChannelOrder(
  preferredChannel: DeliveryChannel,
  availableChannels: DeliveryChannel[]
): Promise<DeliveryChannel[]> {
  if (availableChannels.length <= 1) {
    return availableChannels;
  }

  const fallbackChannel = getFallbackChannel(preferredChannel);
  if (!availableChannels.includes(preferredChannel)) {
    return availableChannels;
  }
  if (!availableChannels.includes(fallbackChannel)) {
    return [preferredChannel];
  }

  const preferredHealth = await getChannelHealth(preferredChannel);
  const fallbackHealth = await getChannelHealth(fallbackChannel);

  if (preferredHealth.status === "degraded" && fallbackHealth.status === "healthy") {
    return [fallbackChannel, preferredChannel];
  }

  return [preferredChannel, fallbackChannel];
}

async function executeSend(channel: DeliveryChannel, payload: FunnelDeliveryPayload) {
  if (channel === "email") {
    if (!payload.email) throw new Error("Email payload missing");
    await sendEmail(
      payload.prospectId,
      payload.email.to,
      payload.email.subject,
      payload.email.body,
      payload.email.sequence
    );
    return;
  }

  if (!payload.sms) throw new Error("SMS payload missing");
  const sms = await sendSms(
    payload.prospectId,
    payload.sms.to,
    payload.sms.body,
    payload.sms.sequence
  );
  console.log(`[Funnel Delivery] SMS sent via ${sms.method} to ${payload.sms.to}`);
}

export async function getActiveFunnelRetry(
  prospectId: string,
  stepIndex: number
): Promise<FunnelRetryRecord | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("funnel_retry_queue")
        .select("*")
        .eq("prospect_id", prospectId)
        .eq("step_index", stepIndex)
        .in("status", ["pending", "retrying"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        return mapRetryRow(data[0] as Record<string, unknown>);
      }
    } catch {
      // Fall back to local storage.
    }
  }

  const records = readJsonFile<FunnelRetryRecord[]>(LOCAL_RETRY_QUEUE_FILE, []);
  return records.find((record) => record.prospectId === prospectId && record.stepIndex === stepIndex && ["pending", "retrying"].includes(record.status));
}

export async function queueFunnelRetry(
  payload: FunnelDeliveryPayload,
  lastError: string | null,
  initialDelayIndex = 0
): Promise<FunnelRetryRecord | undefined> {
  const existing = await getActiveFunnelRetry(payload.prospectId, payload.stepIndex);
  if (existing) {
    return existing;
  }

  const delayHours = RETRY_DELAYS_HOURS[Math.min(initialDelayIndex, RETRY_DELAYS_HOURS.length - 1)];
  const nextRetry = new Date();
  nextRetry.setHours(nextRetry.getHours() + delayHours);
  const now = new Date().toISOString();

  const record: FunnelRetryRecord = {
    id: uuidv4(),
    prospectId: payload.prospectId,
    stepIndex: payload.stepIndex,
    stepLabel: payload.stepLabel,
    primaryChannel: payload.preferredChannel,
    fallbackChannel: buildAvailableChannels(payload).length > 1 ? getFallbackChannel(payload.preferredChannel) : null,
    emailTo: payload.email?.to || null,
    emailSubject: payload.email?.subject || null,
    emailBody: payload.email?.body || null,
    emailSequence: payload.email?.sequence ?? null,
    smsTo: payload.sms?.to || null,
    smsBody: payload.sms?.body || null,
    smsSequence: payload.sms?.sequence ?? null,
    attemptCount: 0,
    nextRetryAt: nextRetry.toISOString(),
    lastAttemptAt: now,
    lastError,
    status: "pending",
    deliveredChannel: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("funnel_retry_queue").insert({
        id: record.id,
        prospect_id: record.prospectId,
        step_index: record.stepIndex,
        step_label: record.stepLabel,
        primary_channel: record.primaryChannel,
        fallback_channel: record.fallbackChannel,
        email_to: record.emailTo,
        email_subject: record.emailSubject,
        email_body: record.emailBody,
        email_sequence: record.emailSequence,
        sms_to: record.smsTo,
        sms_body: record.smsBody,
        sms_sequence: record.smsSequence,
        attempt_count: record.attemptCount,
        next_retry_at: record.nextRetryAt,
        last_attempt_at: record.lastAttemptAt,
        last_error: record.lastError,
        status: record.status,
        delivered_channel: record.deliveredChannel,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        completed_at: record.completedAt,
      });
      return record;
    } catch {
      // Fall back to local storage.
    }
  }

  const records = readJsonFile<FunnelRetryRecord[]>(LOCAL_RETRY_QUEUE_FILE, []);
  records.push(record);
  writeJsonFile(LOCAL_RETRY_QUEUE_FILE, records);
  return record;
}

export async function getDueFunnelRetries(): Promise<FunnelRetryRecord[]> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("funnel_retry_queue")
        .select("*")
        .in("status", ["pending", "retrying"])
        .lte("next_retry_at", now)
        .order("next_retry_at", { ascending: true });

      if (!error && data) {
        return data.map((row: Record<string, unknown>) => mapRetryRow(row));
      }
    } catch {
      // Fall back to local storage.
    }
  }

  const records = readJsonFile<FunnelRetryRecord[]>(LOCAL_RETRY_QUEUE_FILE, []);
  return records
    .filter((record) => ["pending", "retrying"].includes(record.status) && record.nextRetryAt <= now)
    .sort((a, b) => a.nextRetryAt.localeCompare(b.nextRetryAt));
}

async function updateRetryRecord(record: FunnelRetryRecord) {
  record.updatedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("funnel_retry_queue").update({
        attempt_count: record.attemptCount,
        next_retry_at: record.nextRetryAt,
        last_attempt_at: record.lastAttemptAt,
        last_error: record.lastError,
        status: record.status,
        delivered_channel: record.deliveredChannel,
        updated_at: record.updatedAt,
        completed_at: record.completedAt,
      }).eq("id", record.id);
      return;
    } catch {
      // Fall back to local storage.
    }
  }

  const records = readJsonFile<FunnelRetryRecord[]>(LOCAL_RETRY_QUEUE_FILE, []);
  const updated = records.map((item) => item.id === record.id ? record : item);
  writeJsonFile(LOCAL_RETRY_QUEUE_FILE, updated);
}

export async function markFunnelRetrySent(record: FunnelRetryRecord, deliveredChannel: DeliveryChannel) {
  record.status = "sent";
  record.deliveredChannel = deliveredChannel;
  record.completedAt = new Date().toISOString();
  record.lastAttemptAt = record.completedAt;
  record.nextRetryAt = record.completedAt;
  await updateRetryRecord(record);
}

export async function rescheduleFunnelRetry(record: FunnelRetryRecord, errorMessage: string | null): Promise<{ exhausted: boolean; record: FunnelRetryRecord }> {
  const nextAttemptCount = record.attemptCount + 1;
  record.lastAttemptAt = new Date().toISOString();
  record.lastError = errorMessage;

  const delayHours = RETRY_DELAYS_HOURS[Math.min(nextAttemptCount, RETRY_DELAYS_HOURS.length - 1)];
  const nextRetry = new Date();
  nextRetry.setHours(nextRetry.getHours() + delayHours);
  record.attemptCount = nextAttemptCount;
  record.status = "retrying";
  record.nextRetryAt = nextRetry.toISOString();
  record.completedAt = null;
  await updateRetryRecord(record);
  return { exhausted: false, record };
}

export async function cancelFunnelRetry(record: FunnelRetryRecord, reason: string) {
  record.status = "cancelled";
  record.lastError = reason;
  record.completedAt = new Date().toISOString();
  record.lastAttemptAt = record.completedAt;
  record.nextRetryAt = record.completedAt;
  await updateRetryRecord(record);
}

export async function attemptFunnelDelivery(
  payload: FunnelDeliveryPayload,
  options?: { retryCount?: number; queueOnFailure?: boolean }
): Promise<FunnelDeliveryResult> {
  const retryCount = options?.retryCount ?? 0;
  const queueOnFailure = options?.queueOnFailure ?? true;
  const availableChannels = buildAvailableChannels(payload);

  if (availableChannels.length === 0) {
    return {
      success: false,
      emailSent: false,
      smsSent: false,
      deliveredChannel: null,
      fallbackUsed: false,
      queuedForRetry: false,
      attempts: [],
      lastError: "No email address or phone number available for this funnel step.",
    };
  }

  const orderedChannels = await getChannelOrder(payload.preferredChannel, availableChannels);
  const attempts: DeliveryAttemptLog[] = [];
  let lastError: string | undefined;

  for (const channel of orderedChannels) {
    const target = channel === "email" ? payload.email?.to || "" : payload.sms?.to || "";
    const attempt: DeliveryAttemptLog = {
      id: uuidv4(),
      prospectId: payload.prospectId,
      stepIndex: payload.stepIndex,
      stepLabel: payload.stepLabel,
      attemptedChannel: channel,
      primaryChannel: payload.preferredChannel,
      fallbackUsed: channel !== payload.preferredChannel,
      success: false,
      errorMessage: null,
      target,
      retryCount,
      attemptedAt: new Date().toISOString(),
    };

    try {
      await executeSend(channel, payload);
      attempt.success = true;
      await logDeliveryAttempt(attempt);
      await recordChannelOutcome(channel, true, null);
      attempts.push(attempt);

      return {
        success: true,
        emailSent: channel === "email",
        smsSent: channel === "sms",
        deliveredChannel: channel,
        fallbackUsed: attempt.fallbackUsed,
        queuedForRetry: false,
        attempts,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown delivery error";
      attempt.errorMessage = message;
      await logDeliveryAttempt(attempt);
      await recordChannelOutcome(channel, false, message);
      attempts.push(attempt);
      lastError = message;
    }
  }

  let retryRecord: FunnelRetryRecord | undefined;
  if (queueOnFailure) {
    retryRecord = await queueFunnelRetry(payload, lastError || null);
  }

  return {
    success: false,
    emailSent: false,
    smsSent: false,
    deliveredChannel: null,
    fallbackUsed: orderedChannels.length > 1,
    queuedForRetry: Boolean(retryRecord),
    retryId: retryRecord?.id,
    attempts,
    lastError,
  };
}

export function getRetryBackoffHours(): number[] {
  return [...RETRY_DELAYS_HOURS];
}
