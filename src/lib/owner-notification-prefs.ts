/**
 * owner-notification-prefs.ts — per-client notification preferences for Ben.
 *
 * Source of truth: `owner_notification_prefs` table (one row per client_slug).
 * Read by the gate in `src/lib/alerts.ts` to decide whether an owner-bound
 * email/SMS fires instantly, gets queued for a digest, or is dropped.
 *
 * Written by the /api/notifications/prefs endpoints (operator-only) backing
 * the /dashboard/notifications UI.
 *
 * Defaults when no row exists: { email: "instant", sms: "instant",
 * dashboardSignal: true } — preserves pre-2026-05-20 behavior for any slug
 * Ben hasn't tuned yet.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type EmailFrequency = "instant" | "daily" | "weekly" | "off";
export type SmsFrequency = "instant" | "daily" | "off";

export type OwnerNotificationPref = {
  clientSlug: string;
  emailFrequency: EmailFrequency;
  smsFrequency: SmsFrequency;
  dashboardSignal: boolean;
  lastEmailDigestAt: string | null;
  lastSmsDigestAt: string | null;
};

export const DEFAULT_PREF: Omit<OwnerNotificationPref, "clientSlug"> = {
  emailFrequency: "instant",
  smsFrequency: "instant",
  dashboardSignal: true,
  lastEmailDigestAt: null,
  lastSmsDigestAt: null,
};

type Row = {
  client_slug: string;
  email_frequency: EmailFrequency;
  sms_frequency: SmsFrequency;
  dashboard_signal: boolean;
  last_email_digest_at: string | null;
  last_sms_digest_at: string | null;
};

function rowToPref(row: Row): OwnerNotificationPref {
  return {
    clientSlug: row.client_slug,
    emailFrequency: row.email_frequency,
    smsFrequency: row.sms_frequency,
    dashboardSignal: row.dashboard_signal,
    lastEmailDigestAt: row.last_email_digest_at,
    lastSmsDigestAt: row.last_sms_digest_at,
  };
}

export async function getOwnerNotificationPref(
  clientSlug: string,
): Promise<OwnerNotificationPref> {
  if (!isSupabaseConfigured()) {
    return { clientSlug, ...DEFAULT_PREF };
  }
  const { data, error } = await supabase
    .from("owner_notification_prefs")
    .select("*")
    .eq("client_slug", clientSlug)
    .maybeSingle();
  if (error) {
    console.warn("[owner-notification-prefs] read failed:", error.message);
    return { clientSlug, ...DEFAULT_PREF };
  }
  if (!data) return { clientSlug, ...DEFAULT_PREF };
  return rowToPref(data as Row);
}

export async function getAllOwnerNotificationPrefs(): Promise<
  OwnerNotificationPref[]
> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("owner_notification_prefs")
    .select("*");
  if (error) {
    console.warn("[owner-notification-prefs] list failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToPref(r as Row));
}

export async function setOwnerNotificationPref(
  clientSlug: string,
  patch: Partial<{
    emailFrequency: EmailFrequency;
    smsFrequency: SmsFrequency;
    dashboardSignal: boolean;
  }>,
): Promise<OwnerNotificationPref> {
  if (!isSupabaseConfigured()) {
    return { ...DEFAULT_PREF, ...patch, clientSlug };
  }
  const existing = await getOwnerNotificationPref(clientSlug);
  const next = {
    client_slug: clientSlug,
    email_frequency: patch.emailFrequency ?? existing.emailFrequency,
    sms_frequency: patch.smsFrequency ?? existing.smsFrequency,
    dashboard_signal:
      patch.dashboardSignal ?? existing.dashboardSignal,
  };
  const { data, error } = await supabase
    .from("owner_notification_prefs")
    .upsert(next, { onConflict: "client_slug" })
    .select("*")
    .single();
  if (error) {
    console.error("[owner-notification-prefs] upsert failed:", error.message);
    return { ...existing, ...patch, clientSlug };
  }
  return rowToPref(data as Row);
}

/**
 * Queue a per-client owner notification for the next digest run. Called
 * from the alerts.ts gate when the pref is "daily" or "weekly".
 */
export async function queueOwnerNotification(args: {
  clientSlug: string;
  channel: "email" | "sms";
  subject?: string;
  body: string;
  prospectId?: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log(
      `  📥 [queue - would queue ${args.channel} for ${args.clientSlug}]`,
    );
    return;
  }
  const { error } = await supabase.from("owner_notification_queue").insert({
    client_slug: args.clientSlug,
    channel: args.channel,
    subject: args.subject ?? null,
    body: args.body,
    prospect_id: args.prospectId ?? null,
  });
  if (error) {
    console.warn("[owner-notification-prefs] queue failed:", error.message);
  }
}

export type QueueRow = {
  id: string;
  client_slug: string;
  channel: "email" | "sms";
  subject: string | null;
  body: string;
  prospect_id: string | null;
  queued_at: string;
  sent_at: string | null;
};

export async function listPendingQueue(
  channel: "email" | "sms",
  clientSlug?: string,
): Promise<QueueRow[]> {
  if (!isSupabaseConfigured()) return [];
  let q = supabase
    .from("owner_notification_queue")
    .select("*")
    .is("sent_at", null)
    .eq("channel", channel)
    .order("queued_at", { ascending: true });
  if (clientSlug) q = q.eq("client_slug", clientSlug);
  const { data, error } = await q;
  if (error) {
    console.warn("[owner-notification-prefs] queue list failed:", error.message);
    return [];
  }
  return (data ?? []) as QueueRow[];
}

export async function markQueueSent(ids: string[]): Promise<void> {
  if (!isSupabaseConfigured() || ids.length === 0) return;
  const { error } = await supabase
    .from("owner_notification_queue")
    .update({ sent_at: new Date().toISOString() })
    .in("id", ids);
  if (error) {
    console.warn("[owner-notification-prefs] mark sent failed:", error.message);
  }
}

export async function stampDigestSent(args: {
  clientSlug: string;
  channel: "email" | "sms";
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const col =
    args.channel === "email" ? "last_email_digest_at" : "last_sms_digest_at";
  const { error } = await supabase
    .from("owner_notification_prefs")
    .update({ [col]: new Date().toISOString() })
    .eq("client_slug", args.clientSlug);
  if (error) {
    console.warn(
      "[owner-notification-prefs] stamp digest failed:",
      error.message,
    );
  }
}
