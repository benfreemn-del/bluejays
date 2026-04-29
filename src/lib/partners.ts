import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * Partner / affiliate helpers.
 *
 * Cookie name is shared between client capture and server attribution.
 * 90-day window — long enough for a "I'll think about it" prospect to
 * come back, short enough that stale cookies don't pile up.
 */
export const PARTNER_COOKIE = "bj_partner_ref";
export const PARTNER_COOKIE_DAYS = 90;

export type PartnerStatus = "pending" | "approved" | "paused" | "declined";
export type PayoutStatus = "owed" | "paid" | "void";

export type Partner = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  payout_handle: string | null;
  promotion_channel: string | null;
  status: PartnerStatus;
  notes: string | null;
  approved_at: string | null;
  created_at: string;
  // Added by 20260429_partner_workspace.sql — workspace fields
  agreement_accepted_at?: string | null;
  last_login_at?: string | null;
  daily_call_goal?: number | null;
};

export type PartnerReferral = {
  id: string;
  partner_id: string;
  prospect_id: string;
  audit_id: string | null;
  business_name: string | null;
  closed_at: string;
  amount_cents: number;
  payout_status: PayoutStatus;
  paid_at: string | null;
  payout_method: string | null;
  payout_note: string | null;
  created_at: string;
};

/**
 * Slug a name into a short, URL-safe partner code.
 * "Hector Landscaping" → "hector-landscaping"
 * Caller is responsible for adding a random suffix on collision.
 */
export function slugifyPartnerName(raw: string): string {
  return (
    (raw || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "partner"
  );
}

export function randomSuffix(len = 4): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/l/i — verbal-shareable
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/**
 * Look up an APPROVED partner by code. Returns null for missing or
 * non-approved (pending/paused/declined) — those shouldn't attribute
 * closes. Returns null on Supabase error so callers degrade gracefully.
 */
export async function getApprovedPartnerByCode(code: string): Promise<Partner | null> {
  if (!isSupabaseConfigured()) return null;
  const cleaned = (code || "").toLowerCase().trim();
  if (!cleaned) return null;
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("code", cleaned)
    .eq("status", "approved")
    .maybeSingle();
  if (error) {
    console.warn("[partners] lookup error:", error.message);
    return null;
  }
  return (data as unknown as Partner) || null;
}

/**
 * Idempotently insert a partner_referrals row for an attributed close.
 * Returns { ok, alreadyExists } — never throws so the Stripe webhook
 * doesn't fail an entire payment because the affiliate side broke.
 */
export async function recordPartnerReferral(args: {
  partnerCode: string;
  prospectId: string;
  auditId?: string | null;
  businessName?: string | null;
  amountCents?: number;
}): Promise<{ ok: boolean; alreadyExists?: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "supabase not configured" };
  const partner = await getApprovedPartnerByCode(args.partnerCode);
  if (!partner) return { ok: false, error: "partner not found or not approved" };

  const { error } = await supabase.from("partner_referrals").insert({
    partner_id: partner.id,
    prospect_id: args.prospectId,
    audit_id: args.auditId ?? null,
    business_name: args.businessName ?? null,
    amount_cents: args.amountCents ?? 20000,
    payout_status: "owed",
  });

  if (error) {
    // 23505 = unique_violation — partner_referrals_unique on
    // (partner_id, prospect_id). Stripe replayed the webhook; that's
    // the desired idempotent behavior.
    if (error.code === "23505") {
      return { ok: true, alreadyExists: true };
    }
    console.error("[partners] referral insert failed:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
