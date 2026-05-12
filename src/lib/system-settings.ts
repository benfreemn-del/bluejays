import { getSupabase } from "./supabase";

/**
 * system_settings — operator-tunable global constants.
 *
 * Pattern:
 *   const min = await getSetting<number>("hyperloop.min_impressions_for_verdict", 200)
 *
 * Cached in-memory for 60 seconds so per-request reads in hot paths
 * (hyperloop runner, cron) don't hammer the table. Restart / re-deploy
 * picks up changes within the TTL window even without explicit cache
 * busting.
 */

const TTL_MS = 60_000;
type Cached = { value: unknown; loadedAt: number };
const cache = new Map<string, Cached>();

export async function getSetting<T = unknown>(key: string, fallback: T): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.loadedAt < TTL_MS) return hit.value as T;

  try {
    const { data, error } = await getSupabase()
      .from("system_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) {
      cache.set(key, { value: fallback, loadedAt: now });
      return fallback;
    }
    const value = (data.value as T) ?? fallback;
    cache.set(key, { value, loadedAt: now });
    return value;
  } catch {
    return fallback;
  }
}

export async function setSetting(key: string, value: unknown, updatedBy?: string): Promise<void> {
  await getSupabase()
    .from("system_settings")
    .upsert(
      { key, value, updated_by: updatedBy ?? null, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  cache.delete(key);
}

export async function listSettings(): Promise<
  Array<{ key: string; value: unknown; description: string | null; updated_at: string }>
> {
  const { data, error } = await getSupabase()
    .from("system_settings")
    .select("key, value, description, updated_at")
    .order("key");
  if (error) return [];
  return (data ?? []) as Array<{
    key: string;
    value: unknown;
    description: string | null;
    updated_at: string;
  }>;
}

export function clearSettingsCache() {
  cache.clear();
}
