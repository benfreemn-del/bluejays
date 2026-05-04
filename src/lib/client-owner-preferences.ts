/**
 * client-owner-preferences — per-owner notification + display settings.
 *
 * Read by /api/clients/inquire when a new lead lands to decide whether
 * to fire an instant email/SMS to the owner. Written by the portal
 * Account tab UI.
 */

import { getSupabase } from "./supabase";

export type NotificationMode = "instant" | "digest" | "off";

export type OwnerPreferences = {
  owner_id: string;
  new_lead_email: NotificationMode;
  new_lead_sms: NotificationMode;
  instant_audience_filter: string[];
  digest_hour: number;
  digest_timezone: string;
  last_digest_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

const DEFAULT_PREFS: Omit<OwnerPreferences, "owner_id" | "created_at" | "updated_at" | "last_digest_sent_at"> = {
  new_lead_email: "instant",
  new_lead_sms: "off",
  instant_audience_filter: [],
  digest_hour: 9,
  digest_timezone: "America/Los_Angeles",
};

export async function getOwnerPreferences(ownerId: string): Promise<OwnerPreferences> {
  const sb = getSupabase();
  const { data } = await sb
    .from("client_owner_preferences")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (data) return data as OwnerPreferences;
  // Lazy-create with defaults so the rest of the system doesn't have
  // to handle a "no row exists" branch.
  const { data: created, error } = await sb
    .from("client_owner_preferences")
    .insert([{ owner_id: ownerId, ...DEFAULT_PREFS }])
    .select("*")
    .single();
  if (error) throw new Error(`getOwnerPreferences: ${error.message}`);
  return created as OwnerPreferences;
}

export async function updateOwnerPreferences(
  ownerId: string,
  patch: Partial<
    Pick<
      OwnerPreferences,
      "new_lead_email" | "new_lead_sms" | "instant_audience_filter" | "digest_hour" | "digest_timezone"
    >
  >,
): Promise<OwnerPreferences> {
  // Ensure the row exists, then update.
  await getOwnerPreferences(ownerId);
  const { data, error } = await getSupabase()
    .from("client_owner_preferences")
    .update(patch)
    .eq("owner_id", ownerId)
    .select("*")
    .single();
  if (error) throw new Error(`updateOwnerPreferences: ${error.message}`);
  return data as OwnerPreferences;
}

/**
 * List all owners for a client + their prefs (for the inquire-route
 * fan-out: when a new lead lands, who do we email instantly?).
 */
export async function listOwnersWithPrefsForClient(
  clientSlug: string,
): Promise<
  {
    owner_id: string;
    email: string;
    name: string | null;
    prefs: OwnerPreferences;
  }[]
> {
  const sb = getSupabase();
  const { data: owners } = await sb
    .from("client_owners")
    .select("id, email, name")
    .eq("client_slug", clientSlug);
  if (!owners) return [];

  const result: {
    owner_id: string;
    email: string;
    name: string | null;
    prefs: OwnerPreferences;
  }[] = [];
  for (const o of owners as { id: string; email: string; name: string | null }[]) {
    const prefs = await getOwnerPreferences(o.id);
    result.push({ owner_id: o.id, email: o.email, name: o.name, prefs });
  }
  return result;
}
