/**
 * Managed Domains store — Supabase CRUD for the `managed_domains` table.
 *
 * This is the source of truth for the /dashboard/command center: every domain
 * Ben OPERATES — his own businesses (LinePlay, Joe Moore, BlueJays) AND every
 * client site BlueJays manages (Mt View, Meyer, Hector, ...). NOT to be
 * confused with the prospect-bound `domains` table (domain-store.ts) which
 * drives the cold-outreach funnel's auto-register/auto-renew flow.
 *
 * See supabase/migrations/20260701_managed_domains.sql for schema.
 *
 * Mock-safe: every function no-ops / returns empty when Supabase isn't
 * configured, so local dev + CI never crash.
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export type ManagedDomainKind = "business" | "client";
export type ManagedDomainStatus = "active" | "expired" | "parked" | "transferred";
export type ExpirySource = "namecheap" | "rdap" | "manual" | null;

export interface ManagedDomain {
  id: string;
  ownerLabel: string;
  clientSlug: string | null;
  kind: ManagedDomainKind;
  domain: string;
  registrar: string | null;
  autoManaged: boolean;
  status: ManagedDomainStatus;
  registeredAt: string | null;
  expiresAt: string | null;
  hosting: string | null;
  mailboxes: string[];
  expirySource: ExpirySource;
  expiryCheckedAt: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateManagedDomainInput {
  ownerLabel: string;
  domain: string;
  clientSlug?: string | null;
  kind?: ManagedDomainKind;
  registrar?: string | null;
  autoManaged?: boolean;
  status?: ManagedDomainStatus;
  registeredAt?: string | null;
  expiresAt?: string | null;
  hosting?: string | null;
  mailboxes?: string[];
  expirySource?: ExpirySource;
  notes?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateManagedDomainPatch {
  ownerLabel?: string;
  clientSlug?: string | null;
  kind?: ManagedDomainKind;
  registrar?: string | null;
  autoManaged?: boolean;
  status?: ManagedDomainStatus;
  registeredAt?: string | null;
  expiresAt?: string | null;
  hosting?: string | null;
  mailboxes?: string[];
  expirySource?: ExpirySource;
  expiryCheckedAt?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
}

type Row = Record<string, unknown>;

function mapRow(r: Row): ManagedDomain {
  return {
    id: String(r.id),
    ownerLabel: (r.owner_label as string) ?? "",
    clientSlug: (r.client_slug as string) ?? null,
    kind: (r.kind as ManagedDomainKind) ?? "client",
    domain: (r.domain as string) ?? "",
    registrar: (r.registrar as string) ?? null,
    autoManaged: Boolean(r.auto_managed),
    status: (r.status as ManagedDomainStatus) ?? "active",
    registeredAt: (r.registered_at as string) ?? null,
    expiresAt: (r.expires_at as string) ?? null,
    hosting: (r.hosting as string) ?? null,
    mailboxes: Array.isArray(r.mailboxes) ? (r.mailboxes as string[]) : [],
    expirySource: (r.expiry_source as ExpirySource) ?? null,
    expiryCheckedAt: (r.expiry_checked_at as string) ?? null,
    notes: (r.notes as string) ?? null,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
  };
}

/** Every managed domain, expiring-soonest first (nulls last). */
export async function listManagedDomains(): Promise<ManagedDomain[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("managed_domains")
    .select("*")
    .order("expires_at", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

/** Domains expiring within `days` (and already-expired), for the reminder cron. */
export async function getManagedDomainsExpiringWithin(days: number): Promise<ManagedDomain[]> {
  if (!isSupabaseConfigured()) return [];
  const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("managed_domains")
    .select("*")
    .not("expires_at", "is", null)
    .lte("expires_at", cutoff)
    .order("expires_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function getManagedDomain(id: string): Promise<ManagedDomain | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("managed_domains").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as Row) : null;
}

export async function getManagedDomainByName(domain: string): Promise<ManagedDomain | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("managed_domains")
    .select("*")
    .eq("domain", domain.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as Row) : null;
}

export async function createManagedDomain(input: CreateManagedDomainInput): Promise<ManagedDomain> {
  if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
  const row: Row = {
    owner_label: input.ownerLabel,
    domain: input.domain.trim().toLowerCase(),
    client_slug: input.clientSlug ?? null,
    kind: input.kind ?? "client",
    registrar: input.registrar ?? null,
    auto_managed: input.autoManaged ?? false,
    status: input.status ?? "active",
    registered_at: input.registeredAt ?? null,
    expires_at: input.expiresAt ?? null,
    hosting: input.hosting ?? null,
    mailboxes: input.mailboxes ?? [],
    expiry_source: input.expirySource ?? null,
    notes: input.notes ?? null,
    metadata: input.metadata ?? {},
  };
  const { data, error } = await supabase.from("managed_domains").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function updateManagedDomain(id: string, patch: UpdateManagedDomainPatch): Promise<ManagedDomain> {
  if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
  const row: Row = {};
  if (patch.ownerLabel !== undefined) row.owner_label = patch.ownerLabel;
  if (patch.clientSlug !== undefined) row.client_slug = patch.clientSlug;
  if (patch.kind !== undefined) row.kind = patch.kind;
  if (patch.registrar !== undefined) row.registrar = patch.registrar;
  if (patch.autoManaged !== undefined) row.auto_managed = patch.autoManaged;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.registeredAt !== undefined) row.registered_at = patch.registeredAt;
  if (patch.expiresAt !== undefined) row.expires_at = patch.expiresAt;
  if (patch.hosting !== undefined) row.hosting = patch.hosting;
  if (patch.mailboxes !== undefined) row.mailboxes = patch.mailboxes;
  if (patch.expirySource !== undefined) row.expiry_source = patch.expirySource;
  if (patch.expiryCheckedAt !== undefined) row.expiry_checked_at = patch.expiryCheckedAt;
  if (patch.notes !== undefined) row.notes = patch.notes;
  if (patch.metadata !== undefined) row.metadata = patch.metadata;
  const { data, error } = await supabase.from("managed_domains").update(row).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

export async function deleteManagedDomain(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
  const { error } = await supabase.from("managed_domains").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Upsert expiry data pulled from a live source (Namecheap sync / RDAP). Never
 * overwrites owner/client tagging — only the expiry-related columns + registrar
 * when we learn it. Matches on the unique `domain`. Returns the updated row, or
 * null if the domain isn't tracked yet (caller decides whether to insert).
 */
export async function applyExpiryToManagedDomain(
  domain: string,
  patch: {
    expiresAt?: string | null;
    registeredAt?: string | null;
    registrar?: string | null;
    autoManaged?: boolean;
    expirySource: Exclude<ExpirySource, null>;
  }
): Promise<ManagedDomain | null> {
  const existing = await getManagedDomainByName(domain);
  if (!existing) return null;
  return updateManagedDomain(existing.id, {
    ...(patch.expiresAt !== undefined ? { expiresAt: patch.expiresAt } : {}),
    ...(patch.registeredAt !== undefined ? { registeredAt: patch.registeredAt } : {}),
    ...(patch.registrar !== undefined && !existing.registrar ? { registrar: patch.registrar } : {}),
    ...(patch.autoManaged !== undefined ? { autoManaged: patch.autoManaged } : {}),
    expirySource: patch.expirySource,
    expiryCheckedAt: new Date().toISOString(),
  });
}

// ── Presentation helpers (shared by the page + the reminder cron) ──

export type ExpiryBucket = "expired" | "red" | "amber" | "green" | "unknown";

/** Whole days until expiry (negative = already expired, null = unknown). */
export function daysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const t = new Date(expiresAt).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.ceil((t - Date.now()) / (24 * 60 * 60 * 1000));
}

/** Color bucket: red < 30d, amber < 60d, green otherwise. */
export function expiryBucket(expiresAt: string | null): ExpiryBucket {
  const d = daysUntilExpiry(expiresAt);
  if (d === null) return "unknown";
  if (d < 0) return "expired";
  if (d < 30) return "red";
  if (d < 60) return "amber";
  return "green";
}
