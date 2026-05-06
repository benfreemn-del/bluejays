import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentPartner } from "@/lib/partner-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { PartnerReferral } from "@/lib/partners";
import ZenithWorkspace from "./ZenithWorkspace";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Zenith Sales Portal — Zenith Sports / TEKKY®",
  robots: { index: false, follow: false },
};

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

/**
 * /clients/zenith-sports/partners/work — Zenith partner workspace.
 *
 * Server component:
 *   1. Auth-gates on getCurrentPartner("zenith-sports") (redirects to login)
 *   2. Loads partner's referrals, stats, recent activity
 *   3. Renders ZenithWorkspace (client) with everything pre-resolved
 *
 * Unlike the BlueJays /partners/work page (which is built around cold
 * dialing the prospects table), Zenith partners share their referral
 * link to their existing network — coaches → parents in their team
 * chat, club DOCs → their wholesale order, parents → other parents.
 * The workspace is built around that share-loop, not cold dialing.
 */
export default async function ZenithPartnerWorkPage() {
  const partner = await getCurrentPartner("zenith-sports");
  if (!partner) redirect("/clients/zenith-sports/partners/login");

  // Load this partner's referrals + week-to-date stats
  let referrals: PartnerReferral[] = [];
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from("partner_referrals")
      .select("*")
      .eq("partner_id", partner.id)
      .eq("client_slug", "zenith-sports")
      .order("closed_at", { ascending: false })
      .limit(50);
    referrals = (data as unknown as PartnerReferral[]) || [];
  }

  const owedCents = referrals
    .filter((r) => r.payout_status === "owed")
    .reduce((sum, r) => sum + r.amount_cents, 0);
  const paidCents = referrals
    .filter((r) => r.payout_status === "paid")
    .reduce((sum, r) => sum + r.amount_cents, 0);
  const closedCount = referrals.filter((r) => r.payout_status !== "void").length;

  // Last 7 days
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekReferrals = referrals.filter(
    (r) => new Date(r.closed_at).getTime() >= weekAgo,
  );
  const weekCents = weekReferrals
    .filter((r) => r.payout_status !== "void")
    .reduce((sum, r) => sum + r.amount_cents, 0);

  const partnerLink = `${SITE_ORIGIN}/clients/zenith-sports?ref=${partner.code}`;
  const dashboardLink = `${SITE_ORIGIN}/clients/zenith-sports/partners/${partner.code}`;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-lime-500/10 sticky top-0 z-30 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/clients/zenith-sports/partners"
              className="text-xs text-lime-300/70 hover:text-lime-200"
            >
              ← Program
            </Link>
            <span className="text-slate-600">·</span>
            <span className="text-sm font-semibold text-white">
              {partner.name}
            </span>
            <span className="text-xs uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5">
              {partner.status}
            </span>
          </div>
          <form action="/api/clients/zenith-sports/partners/logout" method="POST">
            <button
              type="submit"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <ZenithWorkspace
        partner={{
          id: partner.id,
          code: partner.code,
          name: partner.name,
          email: partner.email,
        }}
        partnerLink={partnerLink}
        dashboardLink={dashboardLink}
        stats={{
          weekCents,
          weekCount: weekReferrals.filter((r) => r.payout_status !== "void").length,
          owedCents,
          paidCents,
          totalReferrals: closedCount,
        }}
        recentReferrals={referrals.slice(0, 10)}
      />
    </main>
  );
}
