/**
 * Domain Store — Supabase CRUD helpers for the `domains` table.
 *
 * See supabase/migrations/20260424_domains.sql for schema. These helpers
 * keep the API routes thin and centralize the snake_case ↔ camelCase
 * mapping. Used by:
 *   /api/domains/check       — read-only (no store call)
 *   /api/domains/register    — create + update on success
 *   /api/domains/[id]        — read + patch
 *   /api/domains/list        — list with filters
 *   (later) renewal cron     — getDomainsExpiringWithin()
 */

import { supabase, isSupabaseConfigured } from "./supabase";

export type DomainStatus =
  | "pending"
  | "registered"
  | "renewal_paused"
  | "failed"
  | "expired"
  | "cancelled";

export interface DomainRow {
  id: string;
  prospectId: string;
  domain: string;
  status: DomainStatus;
  registrar: string;
  registrarOrderId: string | null;
  registeredAt: string | null;
  expiresAt: string | null;
  nextRenewalAt: string | null;
  costInitialUsd: number | null;
  costPerYearUsd: number | null;
  vercelProjectId: string | null;
  vercelDomainAddedAt: string | null;
  dnsConfiguredAt: string | null;
  lastError: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDomainInput {
  prospectId: string;
  domain: string;
  registrar?: string;
  costPerYearUsd?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateDomainPatch {
  status?: DomainStatus;
  registrarOrderId?: string | null;
  registeredAt?: string | Date | null;
  expiresAt?: string | Date | null;
  nextRenewalAt?: string | Date | null;
  costInitialUsd?: number | null;
  costPerYearUsd?: number | null;
  vercelProjectId?: string | null;
  vercelDomainAddedAt?: string | Date | null;
  dnsConfiguredAt?: string | Date | null;
  lastError?: string | null;
  metadata?: Record<string, unknown>;
}

interface DomainDbRow {
  id: string;
  prospect_id: string;
  domain: string;
  status: DomainStatus;
  registrar: string;
  registrar_order_id: string | null;
  registered_at: string | null;
  expires_at: string | null;
  next_renewal_at: string | null;
  cost_initial_usd: string | number | null;
  cost_per_year_usd: string | number | null;
  vercel_project_id: string | null;
  vercel_domain_added_at: string | null;
  dns_configured_at: string | null;
  last_error: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

function rowToDomain(row: DomainDbRow): DomainRow {
  return {
    id: row.id,
    prospectId: row.prospect_id,
    domain: row.domain,
    status: row.status,
    registrar: row.registrar,
    registrarOrderId: row.registrar_order_id,
    registeredAt: row.registered_at,
    expiresAt: row.expires_at,
    nextRenewalAt: row.next_renewal_at,
    costInitialUsd: row.cost_initial_usd != null ? Number(row.cost_initial_usd) : null,
    costPerYearUsd: row.cost_per_year_usd != null ? Number(row.cost_per_year_usd) : null,
    vercelProjectId: row.vercel_project_id,
    vercelDomainAddedAt: row.vercel_domain_added_at,
    dnsConfiguredAt: row.dns_configured_at,
    lastError: row.last_error,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toIso(value: string | Date | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function ensureSupabase(): void {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured — domain-store cannot read or write.");
  }
}

/** Insert a new pending row. Returns the inserted row (with id, timestamps). */
export async function createDomain(input: CreateDomainInput): Promise<DomainRow> {
  ensureSupabase();
  const payload = {
    prospect_id: input.prospectId,
    domain: input.domain,
    status: "pending" as DomainStatus,
    registrar: input.registrar || "namecheap",
    cost_per_year_usd: input.costPerYearUsd ?? 11.0,
    metadata: input.metadata ?? {},
  };
  const { data, error } = await supabase
    .from("domains")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return rowToDomain(data as DomainDbRow);
}

/** Patch an existing row. Returns the updated row. */
export async function updateDomain(id: string, patch: UpdateDomainPatch): Promise<DomainRow> {
  ensureSupabase();
  const update: Record<string, unknown> = {};
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.registrarOrderId !== undefined) update.registrar_order_id = patch.registrarOrderId;
  if (patch.registeredAt !== undefined) update.registered_at = toIso(patch.registeredAt);
  if (patch.expiresAt !== undefined) update.expires_at = toIso(patch.expiresAt);
  if (patch.nextRenewalAt !== undefined) update.next_renewal_at = toIso(patch.nextRenewalAt);
  if (patch.costInitialUsd !== undefined) update.cost_initial_usd = patch.costInitialUsd;
  if (patch.costPerYearUsd !== undefined) update.cost_per_year_usd = patch.costPerYearUsd;
  if (patch.vercelProjectId !== undefined) update.vercel_project_id = patch.vercelProjectId;
  if (patch.vercelDomainAddedAt !== undefined) update.vercel_domain_added_at = toIso(patch.vercelDomainAddedAt);
  if (patch.dnsConfiguredAt !== undefined) update.dns_configured_at = toIso(patch.dnsConfiguredAt);
  if (patch.lastError !== undefined) update.last_error = patch.lastError;
  if (patch.metadata !== undefined) update.metadata = patch.metadata;

  const { data, error } = await supabase
    .from("domains")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return rowToDomain(data as DomainDbRow);
}

export async function getDomain(id: string): Promise<DomainRow | null> {
  ensureSupabase();
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToDomain(data as DomainDbRow) : null;
}

export async function getDomainByName(domain: string): Promise<DomainRow | null> {
  ensureSupabase();
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("domain", domain)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToDomain(data as DomainDbRow) : null;
}

export async function getDomainsByProspect(prospectId: string): Promise<DomainRow[]> {
  ensureSupabase();
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => rowToDomain(r as DomainDbRow));
}

/** All registered domains whose next_renewal_at falls within the next N days. */
export async function getDomainsExpiringWithin(days: number): Promise<DomainRow[]> {
  ensureSupabase();
  const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("status", "registered")
    .not("next_renewal_at", "is", null)
    .lte("next_renewal_at", cutoff)
    .order("next_renewal_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => rowToDomain(r as DomainDbRow));
}

export interface ListDomainsParams {
  prospectId?: string;
  status?: DomainStatus;
  expiringWithinDays?: number;
}

export async function listDomains(params: ListDomainsParams = {}): Promise<DomainRow[]> {
  ensureSupabase();
  let q = supabase.from("domains").select("*").order("created_at", { ascending: false });
  if (params.prospectId) q = q.eq("prospect_id", params.prospectId);
  if (params.status) q = q.eq("status", params.status);
  if (params.expiringWithinDays != null) {
    const cutoff = new Date(Date.now() + params.expiringWithinDays * 24 * 60 * 60 * 1000).toISOString();
    q = q.not("next_renewal_at", "is", null).lte("next_renewal_at", cutoff);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((r) => rowToDomain(r as DomainDbRow));
}
