/**
 * Domain Warming System
 *
 * Gradually increases daily email volume to build sender reputation.
 * Tracks daily sends and enforces limits based on warming schedule.
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export interface WarmingConfig {
  enabled: boolean;
  startDate: string; // ISO date when warming started
  currentDailyLimit: number;
  maxDailyLimit: number;
  sentToday: number;
  lastResetDate: string; // YYYY-MM-DD
  domain: string; // primary sending domain
  backupDomain?: string; // fallback domain
  useBackup: boolean; // switch to backup if primary has issues
}

// Warming schedule: day -> max emails
const WARMING_SCHEDULE: Record<number, number> = {
  1: 10, 2: 10,
  3: 20, 4: 20,
  5: 30, 6: 30, 7: 30,
  8: 50, 9: 50, 10: 50,
  11: 75, 12: 75, 13: 75,
  14: 100, // fully warmed
};

const DEFAULT_CONFIG: WarmingConfig = {
  enabled: false,
  startDate: new Date().toISOString(),
  currentDailyLimit: 10,
  maxDailyLimit: 100,
  sentToday: 0,
  lastResetDate: new Date().toISOString().split("T")[0],
  domain: "bluejayportfolio.com",
  backupDomain: undefined,
  useBackup: false,
};

/**
 * Get current warming config
 */
export async function getWarmingConfig(): Promise<WarmingConfig> {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from("domain_warming")
        .select("*")
        .limit(1);

      if (data && data.length > 0) {
        const row = data[0] as Record<string, unknown>;
        return {
          enabled: row.enabled as boolean ?? false,
          startDate: row.start_date as string || DEFAULT_CONFIG.startDate,
          currentDailyLimit: row.current_daily_limit as number ?? 10,
          maxDailyLimit: row.max_daily_limit as number ?? 100,
          sentToday: row.sent_today as number ?? 0,
          lastResetDate: row.last_reset_date as string || DEFAULT_CONFIG.lastResetDate,
          domain: row.domain as string || DEFAULT_CONFIG.domain,
          backupDomain: row.backup_domain as string | undefined,
          useBackup: row.use_backup as boolean ?? false,
        };
      }
    } catch { /* table might not exist */ }
  }
  return { ...DEFAULT_CONFIG };
}

/**
 * Update warming config
 */
export async function updateWarmingConfig(updates: Partial<WarmingConfig>): Promise<WarmingConfig> {
  const current = await getWarmingConfig();
  const merged = { ...current, ...updates };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("domain_warming").upsert({
        id: 1,
        enabled: merged.enabled,
        start_date: merged.startDate,
        current_daily_limit: merged.currentDailyLimit,
        max_daily_limit: merged.maxDailyLimit,
        sent_today: merged.sentToday,
        last_reset_date: merged.lastResetDate,
        domain: merged.domain,
        backup_domain: merged.backupDomain || null,
        use_backup: merged.useBackup,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
    } catch (err) {
      console.error("[domain-warming] Failed to save config:", err);
    }
  }

  return merged;
}

/**
 * Check if we can send another email today based on warming limits.
 * Returns { canSend, remaining, limit, day }
 */
export async function canSendEmail(): Promise<{
  canSend: boolean;
  remaining: number;
  limit: number;
  warmingDay: number;
  domain: string;
}> {
  const config = await getWarmingConfig();

  if (!config.enabled) {
    return { canSend: true, remaining: 999, limit: 999, warmingDay: 0, domain: config.domain };
  }

  // Reset counter if it's a new day
  const today = new Date().toISOString().split("T")[0];
  if (config.lastResetDate !== today) {
    config.sentToday = 0;
    config.lastResetDate = today;

    // Auto-advance warming limit based on schedule
    const startDate = new Date(config.startDate);
    const now = new Date();
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Find the right limit from the schedule
    let limit = 10;
    for (const [day, maxEmails] of Object.entries(WARMING_SCHEDULE)) {
      if (daysSinceStart >= Number(day)) {
        limit = maxEmails;
      }
    }
    config.currentDailyLimit = Math.min(limit, config.maxDailyLimit);

    await updateWarmingConfig(config);
  }

  const remaining = config.currentDailyLimit - config.sentToday;
  const warmingDay = Math.floor(
    (new Date().getTime() - new Date(config.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  const domain = config.useBackup && config.backupDomain ? config.backupDomain : config.domain;

  return {
    canSend: remaining > 0,
    remaining,
    limit: config.currentDailyLimit,
    warmingDay,
    domain,
  };
}

/**
 * Record that an email was sent (increment today's counter)
 */
export async function recordEmailSent(): Promise<void> {
  const config = await getWarmingConfig();
  config.sentToday += 1;
  await updateWarmingConfig({ sentToday: config.sentToday });
}

/**
 * Get warming status for dashboard display
 */
export async function getWarmingStatus(): Promise<{
  enabled: boolean;
  warmingDay: number;
  sentToday: number;
  limitToday: number;
  percentWarmed: number;
  domain: string;
  backupDomain?: string;
  schedule: { day: number; limit: number }[];
}> {
  const config = await getWarmingConfig();
  const warmingDay = config.enabled
    ? Math.floor((new Date().getTime() - new Date(config.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return {
    enabled: config.enabled,
    warmingDay,
    sentToday: config.sentToday,
    limitToday: config.currentDailyLimit,
    percentWarmed: Math.min(100, Math.round((config.currentDailyLimit / config.maxDailyLimit) * 100)),
    domain: config.domain,
    backupDomain: config.backupDomain,
    schedule: Object.entries(WARMING_SCHEDULE).map(([day, limit]) => ({
      day: Number(day),
      limit,
    })),
  };
}
