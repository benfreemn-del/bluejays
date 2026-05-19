/**
 * client-leads — DB helpers + audience detection for per-client lead capture.
 *
 * Powers Sprint 1 of the AI-package buildout: every form submission on a
 * /clients/[slug] page writes a row here, the per-audience funnel engine
 * picks them up, and the per-client lead dashboard renders them.
 */

import { getSupabase } from "./supabase";
import { notifyOwnerOfNewLead } from "./client-lead-notify";

/**
 * ClientLeadAudience — open string type. Per-tenant valid audience
 * sets are defined in `portal-configs.ts` (PortalConfig.audiences[].id)
 * and `service-clients.ts` (ServiceClientConfig.audiences). The union
 * was hardcoded with 14 strings before 2026-05-09 audit — every new
 * tenant audience required editing this base type. Now: register
 * audiences in the portal-config + service-client registries; this
 * type stays open so adding a tenant is one-file work.
 */
export type ClientLeadAudience = string;

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
  // ── Lead-context fields (added 2026-05-09 per Philip+Paul notes) ──
  competition_tier: string | null;
  age_group: string | null;
  gender: string | null;
  state_override: string | null;
  in_season_override: string | null;
  /** Manually-recorded revenue for this conversion (cents). Populated
   *  by the dashboard's "Mark converted" flow today; will also be
   *  written by the Shopify webhook once that's wired. Null when the
   *  lead hasn't converted or wasn't tagged with a value. */
  conversion_value_cents: number | null;
  // ── TCPA gate (added 2026-05-19 per migration 20260519) ──
  /** True only when the lead explicitly ticked an OPTIONAL SMS
   *  consent checkbox at form submit. Funnel runner skips SMS touches
   *  when false. Default false on insert. */
  sms_consent: boolean;
  sms_consent_at: string | null;
  sms_consent_source:
    | "form_checkbox"
    | "opt_in_page"
    | "manual"
    | "inferred"
    | null;
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
      | "sms_consent"
      | "sms_consent_at"
      | "sms_consent_source"
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
  // ─── ITC Quick Attach (Innovative Tractor Components) ───────────────
  // Routes by lead-magnet landing page slug. Each /clients/itc-quick-attach/lp/*
  // page posts with `lp` set to the segment name; that's a hard signal.
  if (clientSlug === "itc-quick-attach") {
    const lp = String(payload.lp ?? "").trim().toLowerCase();
    if (lp === "tym") return "tym";
    if (lp === "hobbyist") return "hobbyist";
    if (lp === "forester") return "forester";
    if (lp === "hunter") return "hunter";
    if (lp === "dealer") return "dealer";
    if (lp === "community") return "community";

    // Dream Tractor quiz — synthesize audience from the answer mix.
    // Priority: explicit dealer signal > use case > size > brand-only.
    if (lp === "dream-tractor") {
      const size = String(payload.quiz_size ?? "").toLowerCase();
      const use = String(payload.quiz_use_case ?? "").toLowerCase();
      const qbrand = String(payload.quiz_brand ?? "").toLowerCase();
      if (size === "fleet") return "dealer";
      if (use === "hunting") return "hunter";
      if (use === "firewood") return "forester";
      if (qbrand === "tym") return "tym";
      if (size === "backyard" || size === "hobby") return "hobbyist";
      // Fall through to heuristics below if no quiz signal won.
    }

    // Fallback heuristics for inbound that didn't come through a landing page.
    const message = String(payload.message ?? "").toLowerCase();
    const tractor = String(payload.tractor_model ?? payload.tractor ?? "").toLowerCase();
    if (tractor.includes("tym")) return "tym";
    if (/dealer|wholesale|stock/.test(message)) return "dealer";
    if (/firewood|forest|chainsaw|sawboss/.test(message)) return "forester";
    if (/hunt|firearm|gun|rifle/.test(message)) return "hunter";
    if (/sub-?compact|first tractor|new tractor|hobby/.test(message)) return "hobbyist";
    return null;
  }

  // ─── Olympic Inspections & Testing ──────────────────────────────
  // Three audiences: homeowner (default), realtor, insurance. Detection
  // mostly via explicit audience field on the booking form, plus a
  // keyword fallback so booking-flow leads route to the right drip
  // even when the field is missing.
  if (clientSlug === "olympic-inspections") {
    const audience = String(payload.audience ?? payload.role ?? "")
      .trim()
      .toLowerCase();
    if (audience === "realtor" || audience === "agent" || audience === "broker")
      return "realtor";
    if (
      audience === "insurance" ||
      audience === "adjuster" ||
      audience === "carrier"
    )
      return "insurance";
    if (audience === "homeowner" || audience === "owner") return "homeowner";

    // Source / message keyword fallbacks — sometimes the field is missing
    // (e.g. partner referrals, walk-in form fills).
    const source = String(payload.source ?? "").toLowerCase();
    const message = String(payload.message ?? "").toLowerCase();
    if (source === "partners") return "realtor";
    if (/agent|broker|realtor|listing|mls|escrow/.test(message))
      return "realtor";
    if (/claim|adjuster|carrier|policy/.test(message)) return "insurance";

    // Default: homeowner. Most inbound leads are owner-occupants asking
    // about a smell / a leak / a pre-purchase concern.
    return "homeowner";
  }

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
  // Coach drip — Training Guide capture. We renamed the intent from
  // "Training Guide PDF" → "Training Guide" once we stopped promising
  // a PDF (the plan is a hosted page that prints to PDF). Match both
  // so historical leads stay tagged correctly.
  if (
    source === "email-capture" &&
    (intent === "training guide" || intent === "training guide pdf")
  )
    return "coach";
  if (source === "email-capture" && intent === "player challenge")
    return "player";
  if (source === "email-capture" && intent === "camp finder") return "parent";

  // Camp Finder quiz — every submission is a parent (the quiz is parent-
  // facing by design, asks "your player's age" / "where do you live"). The
  // intent string is "Camp Finder · {age} · {state} {county}" and source
  // is "camp-finder-quiz".
  if (source === "camp-finder-quiz") return "parent";
  if (intent.startsWith("camp finder")) return "parent";

  // Build Your Player lead-gen — role field is the source of truth.
  if (source === "lead-gen-builder") {
    const builderRole = str("role");
    if (builderRole === "parent") return "parent";
    if (builderRole === "coach") return "coach";
    if (builderRole === "player") return "player";
  }

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
  const row = data as ClientLead;

  // Fire owner SMS notification (the production "push" path until Web
  // Push lands). Never blocks the insert — fire-and-forget.
  void notifyOwnerOfNewLead(row).catch((err) =>
    console.error("[client-leads] notify failed:", err),
  );

  return row;
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
      | "competition_tier"
      | "age_group"
      | "gender"
      | "state_override"
      | "in_season_override"
      | "conversion_value_cents"
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
