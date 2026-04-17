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

const PRIMARY_DOMAIN = "bluejayportfolio.com";
const BACKUP_DOMAIN = "bluejaywebs.com";

function rowToConfig(row: Record<string, unknown> | undefined | null): WarmingConfig | null {
  if (!row) return null;
  return {
    enabled: (row.enabled as boolean) ?? false,
    startDate: (row.start_date as string) || DEFAULT_CONFIG.startDate,
    currentDailyLimit: (row.current_daily_limit as number) ?? 10,
    maxDailyLimit: (row.max_daily_limit as number) ?? 100,
    sentToday: (row.sent_today as number) ?? 0,
    lastResetDate: (row.last_reset_date as string) || DEFAULT_CONFIG.lastResetDate,
    domain: (row.domain as string) || DEFAULT_CONFIG.domain,
    backupDomain: (row.backup_domain as string | null) || undefined,
    useBackup: (row.use_backup as boolean) ?? false,
  };
}

/**
 * Get warming config for a specific domain. Defaults to primary if no domain given.
 * Returns DEFAULT_CONFIG (disabled) if Supabase isn't configured or row is missing.
 */
export async function getWarmingConfig(domain?: string): Promise<WarmingConfig> {
  const target = domain || PRIMARY_DOMAIN;

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from("domain_warming")
        .select("*")
        .eq("domain", target)
        .limit(1);

      if (data && data.length > 0) {
        const cfg = rowToConfig(data[0] as Record<string, unknown>);
        if (cfg) return cfg;
      }
    } catch { /* table might not exist yet */ }
  }
  return { ...DEFAULT_CONFIG, domain: target };
}

/**
 * Get warming config for BOTH the primary and backup sender domains so the
 * sender picker and daily digest can read them together.
 */
export async function getAllWarmingConfigs(): Promise<WarmingConfig[]> {
  if (!isSupabaseConfigured()) {
    return [
      { ...DEFAULT_CONFIG, domain: PRIMARY_DOMAIN },
      { ...DEFAULT_CONFIG, domain: BACKUP_DOMAIN },
    ];
  }

  try {
    const { data } = await supabase
      .from("domain_warming")
      .select("*")
      .in("domain", [PRIMARY_DOMAIN, BACKUP_DOMAIN]);

    const configs = (data || [])
      .map((row) => rowToConfig(row as Record<string, unknown>))
      .filter((c): c is WarmingConfig => c !== null);

    // Ensure both domains always appear in the returned list
    const byDomain = new Map(configs.map((c) => [c.domain, c]));
    return [PRIMARY_DOMAIN, BACKUP_DOMAIN].map((d) =>
      byDomain.get(d) || { ...DEFAULT_CONFIG, domain: d }
    );
  } catch {
    return [
      { ...DEFAULT_CONFIG, domain: PRIMARY_DOMAIN },
      { ...DEFAULT_CONFIG, domain: BACKUP_DOMAIN },
    ];
  }
}

/**
 * Update warming config for a specific domain (defaults to primary).
 */
export async function updateWarmingConfig(
  updates: Partial<WarmingConfig>,
  domain?: string,
): Promise<WarmingConfig> {
  const target = domain || updates.domain || PRIMARY_DOMAIN;
  const current = await getWarmingConfig(target);
  const merged = { ...current, ...updates, domain: target };

  if (isSupabaseConfigured()) {
    try {
      // Upsert with onConflict:"domain" requires a real UNIQUE CONSTRAINT on
      // the domain column, which some older Supabase projects don't have
      // (just a unique index). Do a safe update-or-insert: try update first,
      // fall back to insert when no row exists for this domain yet.
      const row = {
        domain: merged.domain,
        enabled: merged.enabled,
        start_date: merged.startDate,
        current_daily_limit: merged.currentDailyLimit,
        max_daily_limit: merged.maxDailyLimit,
        sent_today: merged.sentToday,
        last_reset_date: merged.lastResetDate,
        backup_domain: merged.backupDomain || null,
        use_backup: merged.useBackup,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error: updateErr } = await supabase
        .from("domain_warming")
        .update(row)
        .eq("domain", merged.domain)
        .select();

      if (updateErr) throw updateErr;

      if (!updated || updated.length === 0) {
        // No existing row for this domain — insert a new one.
        const { error: insertErr } = await supabase
          .from("domain_warming")
          .insert(row);
        if (insertErr) throw insertErr;
      }
    } catch (err) {
      console.error(`[domain-warming] Failed to save ${target} config:`, err);
    }
  }

  return merged;
}

/**
 * Auto-advance daily limit + reset counter if we've rolled over to a new day.
 * Mutates + persists the config in place. Returns the same (now-refreshed) config.
 */
async function rolloverIfNewDay(config: WarmingConfig): Promise<WarmingConfig> {
  const today = new Date().toISOString().split("T")[0];
  if (config.lastResetDate === today) return config;

  config.sentToday = 0;
  config.lastResetDate = today;

  const startDate = new Date(config.startDate);
  const daysSinceStart = Math.floor(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  let limit = 10;
  for (const [day, maxEmails] of Object.entries(WARMING_SCHEDULE)) {
    if (daysSinceStart >= Number(day)) limit = maxEmails;
  }
  config.currentDailyLimit = Math.min(limit, config.maxDailyLimit);

  await updateWarmingConfig(config, config.domain);
  return config;
}

export interface CapacityCheck {
  canSend: boolean;
  remaining: number;
  limit: number;
  warmingDay: number;
  domain: string;
}

/**
 * Per-domain capacity check. If no domain given, checks the primary sender.
 */
export async function canSendEmail(domain?: string): Promise<CapacityCheck> {
  const target = domain || PRIMARY_DOMAIN;
  let config = await getWarmingConfig(target);

  if (!config.enabled) {
    return { canSend: true, remaining: 999, limit: 999, warmingDay: 0, domain: target };
  }

  config = await rolloverIfNewDay(config);

  const remaining = config.currentDailyLimit - config.sentToday;
  const warmingDay = Math.floor(
    (Date.now() - new Date(config.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return {
    canSend: remaining > 0,
    remaining,
    limit: config.currentDailyLimit,
    warmingDay,
    domain: target,
  };
}

/**
 * Round-robin sender picker for PARALLEL warming. Returns the warmed-up
 * domain with the most remaining capacity today. Falls back to the primary
 * if neither is enabled (disabled warming = unlimited send).
 */
export async function pickSendingDomain(): Promise<{ domain: string; capacity: CapacityCheck }> {
  const [primary, backup] = await Promise.all([
    canSendEmail(PRIMARY_DOMAIN),
    canSendEmail(BACKUP_DOMAIN),
  ]);

  // Prefer whichever has more remaining capacity. Ties → primary.
  if (primary.canSend && (!backup.canSend || primary.remaining >= backup.remaining)) {
    return { domain: PRIMARY_DOMAIN, capacity: primary };
  }
  if (backup.canSend) {
    return { domain: BACKUP_DOMAIN, capacity: backup };
  }
  // Both capped → still return primary so the caller can surface the rate-limit
  return { domain: PRIMARY_DOMAIN, capacity: primary };
}

/**
 * Record that an email was sent from a specific domain (increments today's counter).
 */
export async function recordEmailSent(domain?: string): Promise<void> {
  const target = domain || PRIMARY_DOMAIN;
  const config = await getWarmingConfig(target);
  config.sentToday += 1;
  await updateWarmingConfig({ sentToday: config.sentToday }, target);
}

export interface DomainStatus {
  enabled: boolean;
  warmingDay: number;
  sentToday: number;
  limitToday: number;
  percentWarmed: number;
  domain: string;
}

/**
 * Snapshot of both sender domains' warmup state for dashboards + digest.
 * `domain` stays the primary for backward-compat; `domains` contains both.
 */
export async function getWarmingStatus(): Promise<{
  enabled: boolean;
  warmingDay: number;
  sentToday: number;
  limitToday: number;
  percentWarmed: number;
  domain: string;
  backupDomain?: string;
  domains: DomainStatus[];
  schedule: { day: number; limit: number }[];
}> {
  const configs = await getAllWarmingConfigs();
  const now = Date.now();

  const domains: DomainStatus[] = configs.map((config) => {
    const warmingDay = config.enabled
      ? Math.floor((now - new Date(config.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 0;
    return {
      enabled: config.enabled,
      warmingDay,
      sentToday: config.sentToday,
      limitToday: config.currentDailyLimit,
      percentWarmed: Math.min(100, Math.round((config.currentDailyLimit / config.maxDailyLimit) * 100)),
      domain: config.domain,
    };
  });

  const primary = domains.find((d) => d.domain === PRIMARY_DOMAIN) || domains[0];
  const backup = domains.find((d) => d.domain === BACKUP_DOMAIN);

  return {
    // Primary-shape fields preserved for existing callers (daily digest, etc.)
    enabled: primary.enabled,
    warmingDay: primary.warmingDay,
    sentToday: primary.sentToday,
    limitToday: primary.limitToday,
    percentWarmed: primary.percentWarmed,
    domain: primary.domain,
    backupDomain: backup?.domain,
    domains,
    schedule: Object.entries(WARMING_SCHEDULE).map(([day, limit]) => ({
      day: Number(day),
      limit,
    })),
  };
}
