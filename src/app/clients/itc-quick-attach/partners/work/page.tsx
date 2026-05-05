import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partner-auth";
import { getClientLead } from "@/lib/client-leads";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import ITCCallWorkspace from "./ITCCallWorkspace";
import type { ItcAudienceId } from "@/lib/itc-partners-script";
import { ITC_SCRIPT_ORDER } from "@/lib/itc-partners-script";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ITC partner workspace",
  robots: { index: false, follow: false },
};

const CLIENT_SLUG = "itc-quick-attach";
const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

/**
 * /clients/itc-quick-attach/partners/work
 *
 * Server component. Mirrors the BlueJays partner /partners/work page:
 *   1. Auth-gates on getCurrentPartner (redirects to ITC's own login,
 *      NOT the shared /partners/login — keeps reps inside the ITC pathway).
 *   2. Optionally pulls a lead by ?lead=<id> for testing / pre-loaded
 *      prospects. When absent, the workspace renders as a script viewer
 *      with empty merge tags (caller fills them in manually).
 *   3. Pulls today + week pacing payouts from client_partner_calls
 *      directly so first paint has accurate numbers (the workspace
 *      then re-fetches via API on every successful call log).
 *   4. Resolves the configurator URL per-prospect (build-your-tractor
 *      query string) — falls back to the generic itcquickattach.com/build.
 *   5. Renders the client component (ITCCallWorkspace) with everything
 *      pre-resolved.
 */
export default async function ItcPartnerWorkPage({
  searchParams,
}: {
  // Next.js 16: searchParams is a Promise
  searchParams: Promise<{ lead?: string; audience?: string }>;
}) {
  const partner = await getCurrentPartner();
  if (!partner) redirect("/clients/itc-quick-attach/partners/login");

  const sp = await searchParams;
  const leadId = sp.lead || null;
  const audienceParam = sp.audience as ItcAudienceId | undefined;
  const initialAudience =
    audienceParam && ITC_SCRIPT_ORDER.includes(audienceParam)
      ? audienceParam
      : undefined;

  // ---- Lead lookup (optional) ----
  // Tries client_leads first; if not found, returns null + workspace
  // renders without a prospect (script-viewer mode).
  let prospect: {
    id: string | null;
    businessName: string | null;
    ownerName: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    state: string | null;
    tractorBrand: string | null;
    acreage: string | null;
    configUrl: string | null;
  } | null = null;

  if (leadId) {
    try {
      const lead = await getClientLead(leadId);
      if (lead && lead.client_slug === CLIENT_SLUG) {
        // ClientLead stores form payload under raw_payload (typed as
        // Record<string, unknown>). Pull tractor brand / acreage / owner /
        // city / state from there with permissive key matching.
        const meta = (lead.raw_payload as Record<string, unknown>) ?? {};
        const tractorBrand = pickStr(meta, "tractor_brand", "tractorBrand");
        const acreage = pickStr(meta, "acreage");
        const ownerName = pickStr(meta, "owner_name", "ownerName", "owner");
        const city = pickStr(meta, "city");
        const state = pickStr(meta, "state");
        prospect = {
          id: lead.id,
          businessName: lead.name ?? null,
          ownerName,
          phone: lead.phone ?? null,
          email: lead.email ?? null,
          city,
          state,
          tractorBrand,
          acreage,
          configUrl: buildConfigUrl(lead.id),
        };
      }
    } catch {
      // Lead lookup failed — render in script-viewer mode rather than 500
    }
  }

  // ---- Pacing payouts (today + week) ----
  // Direct Supabase reads here so first paint is correct. The workspace
  // re-fetches via API on every successful call log to stay live.
  let todayPayoutCents = 0;
  let weekPayoutCents = 0;
  let callsThisSession = 0;

  if (isSupabaseConfigured()) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();
    const startOfWeek = new Date(
      now.getTime() - 7 * 86_400_000,
    ).toISOString();
    try {
      const [todayRes, weekRes] = await Promise.all([
        supabase
          .from("client_partner_calls")
          .select("estimated_payout_cents, called_at")
          .eq("client_slug", CLIENT_SLUG)
          .eq("partner_id", partner.id)
          .gte("called_at", startOfToday),
        supabase
          .from("client_partner_calls")
          .select("estimated_payout_cents")
          .eq("client_slug", CLIENT_SLUG)
          .eq("partner_id", partner.id)
          .gte("called_at", startOfWeek),
      ]);
      const todayRows = (todayRes.data ?? []) as Array<{
        estimated_payout_cents: number | null;
      }>;
      const weekRows = (weekRes.data ?? []) as Array<{
        estimated_payout_cents: number | null;
      }>;
      callsThisSession = todayRows.length;
      todayPayoutCents = todayRows.reduce(
        (s, r) => s + (r.estimated_payout_cents ?? 0),
        0,
      );
      weekPayoutCents = weekRows.reduce(
        (s, r) => s + (r.estimated_payout_cents ?? 0),
        0,
      );
    } catch {
      // leave zeroes — workspace will refetch shortly
    }
  }

  return (
    <ITCCallWorkspace
      partner={{
        id: partner.id,
        name: partner.name,
        code: partner.code,
        dailyCallGoal: partner.daily_call_goal ?? 20,
      }}
      prospect={prospect}
      initialStats={{
        todayPayoutCents,
        weekPayoutCents,
        callsThisSession,
      }}
      initialAudience={initialAudience}
    />
  );
}

/**
 * Picks the first non-empty string value from an unknown-typed object
 * across any of the supplied keys. Returns null when none of the keys
 * map to a usable string. Defensive against the loosely-typed
 * `raw_payload` JSONB column on client_leads.
 */
function pickStr(
  source: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const k of keys) {
    const v = source[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/**
 * Builds a per-prospect configurator URL. ITC's Build-Your-Dream-Tractor
 * configurator lives at itcquickattach.com/build; we tag the URL with
 * a ref so attribution lands on the right partner + lead when the
 * prospect actually clicks through.
 */
function buildConfigUrl(leadId: string): string {
  return `https://itcquickattach.com/build?ref=${encodeURIComponent(leadId)}&utm_source=partner&utm_medium=call&utm_campaign=itc-partners`;
}

// Avoid an unused-import lint warning when SITE_ORIGIN isn't yet wired
// into anything customer-facing on this page (kept for future expansion
// — preview / claim / compare URL builders that the page will likely
// add when the audit-style lead magnet ships).
void SITE_ORIGIN;
