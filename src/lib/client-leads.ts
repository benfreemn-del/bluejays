/**
 * client-leads — DB helpers + audience detection for per-client lead capture.
 *
 * Powers Sprint 1 of the AI-package buildout: every form submission on a
 * /clients/[slug] page writes a row here, the per-audience funnel engine
 * picks them up, and the per-client lead dashboard renders them.
 */

import { getSupabase } from "./supabase";

export type ClientLeadAudience =
  | "parent"
  | "coach"
  | "player"
  | "club"
  | "unknown";

export type ClientLeadFunnelStatus =
  | "not_enrolled"
  | "enrolled"
  | "paused"
  | "responded"
  | "converted"
  | "completed";

export type ClientLeadSource =
  | "main-inquiry-form"
  | "email-capture"
  | "missed-call-text"
  | "shop-cart-abandon"
  | "qr-card"
  | "manual"
  | (string & {});

export type ClientLead = {
  id: string;
  client_slug: string;
  audience_segment: ClientLeadAudience | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  intent: string | null;
  source: string | null;
  raw_payload: Record<string, unknown>;
  funnel_status: ClientLeadFunnelStatus;
  funnel_step: number | null;
  enrolled_at: string | null;
  responded_at: string | null;
  last_contact_at: string | null;
  converted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type NewClientLead = Pick<ClientLead, "client_slug"> &
  Partial<
    Pick<
      ClientLead,
      | "audience_segment"
      | "name"
      | "email"
      | "phone"
      | "intent"
      | "source"
      | "raw_payload"
      | "notes"
    >
  >;

/* ────────────────────────────────────────────────────────────────────────── */
/* Audience-segment detection                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Best-effort audience classification from form payload. Per-client rules
 * because the field schema differs across showcase pages. Returns null
 * (NOT "unknown") when we genuinely can't tell — that surfaces in the
 * dashboard as "needs manual tag" instead of false-confidently bucketing.
 *
 * Detection priority (high → low):
 *   1. Explicit role/audience field in the payload
 *   2. Intent radio choice (e.g. "drills" → coach, "tekky-ball" → parent)
 *   3. Source channel (e.g. Training Guide capture is always coach)
 *   4. Free-text message keyword sniff
 *   5. null
 */
export function detectAudience(
  clientSlug: string,
  payload: Record<string, unknown>,
): ClientLeadAudience | null {
  if (clientSlug !== "zenith-sports") {
    // Other clients don't have audience segments yet. Add per-client
    // rules here as we expand the funnel system to more showcase pages.
    return null;
  }

  const str = (k: string): string =>
    String(payload[k] ?? "").trim().toLowerCase();
  const intent = str("intent");
  const role = str("role");
  const source = str("source");
  const message = str("message");

  // Hard signals — explicit form mappings.
  if (source === "email-capture" && intent === "training guide pdf")
    return "coach";
  if (source === "email-capture" && intent === "player challenge")
    return "player";
  if (source === "email-capture" && intent === "camp finder") return "parent";

  // Role select on the main inquiry form
  if (role.includes("coach") || role.includes("doc")) return "coach";
  if (role.includes("parent")) return "parent";
  if (role.includes("player")) return "player";
  if (role.includes("club") || role.includes("director")) return "club";

  // Intent radios on the main inquiry form
  if (intent === "tekky-ball") return "parent"; // most individual-ball buys are parents
  if (intent === "team" || intent === "club" || intent === "drills")
    return "coach";
  if (intent === "apparel") return "player";

  // Free-text message sniff (last-resort signals)
  if (
    /\b(my (son|daughter|kid|child)|for my)\b/.test(message) ||
    /\b(parent|mom|dad)\b/.test(message)
  )
    return "parent";
  if (
    /\b(my (team|club|roster|players)|coach|coaching|director)\b/.test(message)
  )
    return "coach";
  if (/\b(i play|i'm a player|my game|my touches)\b/.test(message))
    return "player";

  return null;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* DB ops                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

export async function createClientLead(
  lead: NewClientLead,
): Promise<ClientLead> {
  const { data, error } = await getSupabase()
    .from("client_leads")
    .insert([lead])
    .select("*")
    .single();
  if (error) throw new Error(`createClientLead: ${error.message}`);
  return data as ClientLead;
}

export async function listClientLeads(
  clientSlug: string,
  opts: {
    audience?: ClientLeadAudience;
    status?: ClientLeadFunnelStatus;
    limit?: number;
  } = {},
): Promise<ClientLead[]> {
  let q = getSupabase()
    .from("client_leads")
    .select("*")
    .eq("client_slug", clientSlug)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 200);

  if (opts.audience) q = q.eq("audience_segment", opts.audience);
  if (opts.status) q = q.eq("funnel_status", opts.status);

  const { data, error } = await q;
  if (error) throw new Error(`listClientLeads: ${error.message}`);
  return (data ?? []) as ClientLead[];
}

export async function getClientLead(id: string): Promise<ClientLead | null> {
  const { data, error } = await getSupabase()
    .from("client_leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getClientLead: ${error.message}`);
  return (data as ClientLead | null) ?? null;
}

export async function updateClientLead(
  id: string,
  patch: Partial<
    Pick<
      ClientLead,
      | "audience_segment"
      | "funnel_status"
      | "funnel_step"
      | "notes"
      | "last_contact_at"
    >
  >,
): Promise<ClientLead> {
  const { data, error } = await getSupabase()
    .from("client_leads")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`updateClientLead: ${error.message}`);
  return data as ClientLead;
}

/**
 * Find an existing lead matching email or phone for one client. Used by
 * inbound reply handlers to flip funnel_status → responded.
 */
export async function findClientLeadByContact(
  clientSlug: string,
  contact: { email?: string; phone?: string },
): Promise<ClientLead | null> {
  const sb = getSupabase();
  if (contact.email) {
    const { data, error } = await sb
      .from("client_leads")
      .select("*")
      .eq("client_slug", clientSlug)
      .eq("email", contact.email.toLowerCase())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`findClientLeadByContact: ${error.message}`);
    if (data) return data as ClientLead;
  }
  if (contact.phone) {
    const { data, error } = await sb
      .from("client_leads")
      .select("*")
      .eq("client_slug", clientSlug)
      .eq("phone", contact.phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`findClientLeadByContact: ${error.message}`);
    if (data) return data as ClientLead;
  }
  return null;
}

/** Aggregate lead counts per (client, audience, status) for dashboards. */
export async function clientLeadCounts(
  clientSlug: string,
): Promise<{
  total: number;
  byAudience: Record<string, number>;
  byStatus: Record<string, number>;
}> {
  const { data, error } = await getSupabase()
    .from("client_leads")
    .select("audience_segment, funnel_status")
    .eq("client_slug", clientSlug);
  if (error) throw new Error(`clientLeadCounts: ${error.message}`);
  const rows =
    (data ?? []) as Pick<ClientLead, "audience_segment" | "funnel_status">[];
  const byAudience: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const r of rows) {
    const a = r.audience_segment ?? "untagged";
    byAudience[a] = (byAudience[a] ?? 0) + 1;
    byStatus[r.funnel_status] = (byStatus[r.funnel_status] ?? 0) + 1;
  }
  return { total: rows.length, byAudience, byStatus };
}
