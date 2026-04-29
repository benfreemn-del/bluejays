import { supabase, isSupabaseConfigured } from "./supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * The "approved pool" — prospects that partners can call right now.
 *
 * Filter logic:
 *   - phone is non-empty
 *   - status is NOT one of: paid, in_progress, deployed, bounced,
 *     unsubscribed, dnc, do_not_call, killer_site, paused
 *   - manually_managed is false (Ben's hand-curated leads stay private)
 *   - prospect was NOT called by ANY partner in the last 30 days
 *     (avoid double-touch, protect reply rates)
 *
 * Ordering:
 *   - Prefer prospects with completed audits (lukewarm > cold)
 *   - Then by category-match against partner's promotion_channel? skip
 *     for v1 — over-engineering for the family-team scale
 *   - Then random within tier so two callers don't clash on the same lead
 *
 * Returns null if pool is empty.
 */

// Statuses that DISQUALIFY a prospect from the cold-call pool. Anything
// not in this list (including null/undefined status) is callable.
const EXCLUDED_STATUSES = new Set([
  "paid",
  "in_progress",
  "deployed",
  "bounced",
  "unsubscribed",
  "dnc",
  "do_not_call",
  "killer_site",
  "paused",
]);

// Configurable: how long a prospect "rests" after any partner calls
// them. 30 days is conservative — lower it to 14 if pool gets thin.
const REST_DAYS = 30;

export type LeadPoolProspect = {
  id: string;
  business_name: string;
  owner_name: string | null;
  email: string | null;
  phone: string;
  category: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
  scraped_data: Record<string, unknown> | null;
  // Whether this prospect already has a completed audit they could
  // reference on the call. Computed by joining site_audits.
  hasCompletedAudit: boolean;
  // Existing audit id (latest) — passed to the workspace so we can
  // reuse it for the SMS link instead of re-running the audit.
  latestAuditId: string | null;
};

/**
 * Fetch the next prospect for the partner to call, plus a count of
 * how many are still in the pool (for the workspace counter).
 *
 * Two-step: pull a small random sample of qualifying prospects, then
 * eliminate any in the "rested" cooldown window (table-join in JS to
 * avoid an N×M Supabase RPC).
 */
export async function getNextProspectForPartner(): Promise<{
  prospect: LeadPoolProspect | null;
  remainingCount: number;
}> {
  if (!isSupabaseConfigured()) {
    return { prospect: null, remainingCount: 0 };
  }

  const restCutoffIso = new Date(
    Date.now() - REST_DAYS * 86400 * 1000,
  ).toISOString();

  // Pull recent partner_calls (last 30 days) so we can exclude their
  // prospect_ids from the candidate set. Cap at 5000 — beyond that
  // the pool is dense enough that random sampling will hit a fresh one.
  const { data: recentCalls } = await supabase
    .from("partner_calls")
    .select("prospect_id")
    .gte("called_at", restCutoffIso)
    .limit(5000);
  const restingIds = new Set(
    (recentCalls || []).map((r) => (r as { prospect_id: string }).prospect_id),
  );

  // Sample a chunk of non-excluded prospects with phone numbers.
  // We pull more than 1 because we'll filter the resting set in JS.
  // Random seed via uuid stable-cast to avoid the same caller hitting
  // the same first row every refresh.
  const seed = uuidv4().slice(0, 8);
  const { data: candidates, error } = await supabase
    .from("prospects")
    .select(
      "id, business_name, owner_name, email, phone, category, city, state, status, scraped_data, manually_managed",
    )
    .not("phone", "is", null)
    .neq("phone", "")
    .or(`manually_managed.is.null,manually_managed.eq.false`)
    .limit(200);
  if (error) {
    console.error("[partner-leadpool] fetch failed:", error);
    return { prospect: null, remainingCount: 0 };
  }

  const fresh = (candidates || []).filter((row) => {
    const r = row as {
      id: string;
      status: string | null;
      manually_managed?: boolean;
    };
    if (r.manually_managed) return false;
    if (r.status && EXCLUDED_STATUSES.has(r.status)) return false;
    if (restingIds.has(r.id)) return false;
    return true;
  });

  if (fresh.length === 0) {
    return { prospect: null, remainingCount: 0 };
  }

  // Pick a random prospect (lightweight — pool already shuffled by
  // Supabase since we didn't ORDER BY anything). Using a deterministic
  // hash of `seed` to pick so two near-simultaneous callers diverge.
  const idx =
    Math.abs(
      seed.split("").reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 0),
    ) % fresh.length;
  const picked = fresh[idx] as LeadPoolProspect & { manually_managed?: boolean };

  // Look up the latest completed audit for the picked prospect — used
  // for the personalized SMS link (avoids re-running the audit).
  let latestAuditId: string | null = null;
  let hasCompletedAudit = false;
  try {
    const { data: auditRow } = await supabase
      .from("site_audits")
      .select("id, status")
      .eq("prospect_id", picked.id)
      .eq("status", "ready")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (auditRow) {
      latestAuditId = (auditRow as { id: string }).id;
      hasCompletedAudit = true;
    }
  } catch {
    // ignore — workspace will just send a generic /audit link
  }

  return {
    prospect: {
      id: picked.id,
      business_name: picked.business_name,
      owner_name: picked.owner_name ?? null,
      email: picked.email ?? null,
      phone: picked.phone,
      category: picked.category ?? null,
      city: picked.city ?? null,
      state: picked.state ?? null,
      status: picked.status ?? null,
      scraped_data: (picked.scraped_data as Record<string, unknown>) ?? null,
      hasCompletedAudit,
      latestAuditId,
    },
    remainingCount: fresh.length,
  };
}

/** How many calls has this partner logged in the current session
 *  (since their most recent login). Used by the workspace /100 counter.
 *
 *  Falls back to "today" if last_login_at is missing for any reason
 *  (legacy partners predating the migration). */
export async function countCallsThisSessionForPartner(
  partnerId: string,
  sessionStartIso: string | null,
): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  let cutoff = sessionStartIso;
  if (!cutoff) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    cutoff = startOfDay.toISOString();
  }
  const { count } = await supabase
    .from("partner_calls")
    .select("*", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .gte("called_at", cutoff);
  return count || 0;
}
