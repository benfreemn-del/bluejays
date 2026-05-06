import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Partner, PartnerReferral } from "@/lib/partners";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partner dashboard — Zenith Sports / TEKKY®",
  robots: { index: false, follow: false },
};

/**
 * /clients/zenith-sports/partners/[code] — per-partner dashboard.
 *
 * URL-as-secret (matches BlueJays /partners/[code] pattern). Anyone who
 * knows the code can view the dashboard. The data shown is non-sensitive
 * (their referral counts, payout status by category) and the partner is
 * the only one with a reason to know the URL.
 *
 * Categorizes referrals by `kind` so a coach earning $25/ball commissions
 * can see ball sales separated from $100 coaching-package signups.
 */
export default async function ZenithPartnerDashboardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!isSupabaseConfigured()) notFound();

  const { data: partnerRow } = await supabase
    .from("partners")
    .select("*")
    .eq("code", code.toLowerCase())
    .eq("client_slug", "zenith-sports")
    .maybeSingle();

  if (!partnerRow) notFound();
  const partner = partnerRow as unknown as Partner;

  const { data: referralsRows } = await supabase
    .from("partner_referrals")
    .select("*")
    .eq("partner_id", partner.id)
    .eq("client_slug", "zenith-sports")
    .order("closed_at", { ascending: false });

  const referrals = (referralsRows as unknown as PartnerReferral[]) || [];
  const owedCents = referrals
    .filter((r) => r.payout_status === "owed")
    .reduce((sum, r) => sum + r.amount_cents, 0);
  const paidCents = referrals
    .filter((r) => r.payout_status === "paid")
    .reduce((sum, r) => sum + r.amount_cents, 0);
  const closedCount = referrals.filter((r) => r.payout_status !== "void").length;

  // Per-kind tallies — ball / coaching-package / parent-referral
  const byKind: Record<string, { count: number; cents: number }> = {};
  for (const r of referrals) {
    if (r.payout_status === "void") continue;
    const k = r.kind || "other";
    if (!byKind[k]) byKind[k] = { count: 0, cents: 0 };
    byKind[k].count += 1;
    byKind[k].cents += r.amount_cents;
  }

  const link = `https://bluejayportfolio.com/clients/zenith-sports?ref=${partner.code}`;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-lime-500/10">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/clients/zenith-sports/partners"
            className="text-sm text-lime-300/80 hover:text-lime-200 transition-colors"
          >
            ← Zenith Partner Program
          </Link>
          <span className="text-xs text-slate-500">
            {partner.name} ·{" "}
            <span
              className={
                partner.status === "approved"
                  ? "text-emerald-400"
                  : partner.status === "pending"
                    ? "text-amber-300"
                    : "text-rose-400"
              }
            >
              {partner.status}
            </span>
          </span>
        </div>
      </header>

      {partner.status === "pending" && (
        <div className="bg-amber-500/15 border-b border-amber-500/30">
          <div className="mx-auto max-w-4xl px-6 py-4 text-sm text-amber-200">
            ⏳ Your application is awaiting Philip&apos;s approval. You&apos;ll
            get an email when it&apos;s live — usually within 24 hours.
          </div>
        </div>
      )}
      {partner.status === "paused" && (
        <div className="bg-rose-500/15 border-b border-rose-500/30">
          <div className="mx-auto max-w-4xl px-6 py-4 text-sm text-rose-200">
            Your partner account is paused. Email{" "}
            <a
              href="mailto:partners@zenithsports.org"
              className="underline"
            >
              partners@zenithsports.org
            </a>{" "}
            to ask why or get reactivated.
          </div>
        </div>
      )}

      {/* Stats */}
      <section className="border-b border-lime-500/10">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Stat label="Referrals" value={closedCount.toString()} />
            <Stat
              label="Owed to you"
              value={`$${(owedCents / 100).toFixed(0)}`}
              highlight
            />
            <Stat label="Paid out" value={`$${(paidCents / 100).toFixed(0)}`} />
            <Stat
              label="Total earned"
              value={`$${((owedCents + paidCents) / 100).toFixed(0)}`}
            />
          </div>

          {/* Per-kind breakdown — only if multi-kind data exists */}
          {Object.keys(byKind).length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {Object.entries(byKind).map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-lime-500/15 bg-lime-950/20 p-4"
                >
                  <p className="text-xs uppercase tracking-wider text-lime-300/80 font-semibold mb-1">
                    {kindLabel(k)}
                  </p>
                  <p className="text-xl font-bold text-white tabular-nums">
                    {v.count} · ${(v.cents / 100).toFixed(0)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Link block */}
          <div className="rounded-2xl border border-lime-500/30 bg-lime-500/5 p-6">
            <p className="text-xs uppercase tracking-wider text-lime-300 font-semibold mb-2">
              Your partner link
            </p>
            <p className="font-mono text-lime-200 text-sm break-all mb-3">
              {link}
            </p>
            <p className="text-xs text-slate-400">
              Anyone who clicks this link is attributed to you for 90
              days. They get to see TEKKY + the Zenith offer. If they
              buy a ball or sign up for a coaching package within those
              90 days, you&apos;re credited — paid Venmo or Zelle within
              7 days.
            </p>
          </div>
        </div>
      </section>

      {/* Referrals list */}
      <section className="border-b border-lime-500/10">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h2 className="text-xl font-bold mb-4">Your referrals</h2>
          {referrals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-lime-500/15 bg-slate-900/30 p-8 text-center text-slate-400">
              No referrals yet. Share your link and check back.
            </div>
          ) : (
            <div className="rounded-xl border border-lime-500/15 bg-slate-900/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="text-left px-4 py-3">Referred</th>
                    <th className="text-left px-4 py-3">Kind</th>
                    <th className="text-left px-4 py-3">Closed</th>
                    <th className="text-right px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lime-500/10">
                  {referrals.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-white">
                        {r.business_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {kindLabel(r.kind || "other")}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(r.closed_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right text-white font-mono">
                        ${(r.amount_cents / 100).toFixed(0)}
                      </td>
                      <td className="px-4 py-3">
                        <PayoutBadge status={r.payout_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <footer className="pb-16">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          Questions? Email{" "}
          <a
            href="mailto:partners@zenithsports.org"
            className="text-lime-400 hover:underline"
          >
            partners@zenithsports.org
          </a>
        </div>
      </footer>
    </main>
  );
}

function kindLabel(k: string): string {
  switch (k) {
    case "ball":
      return "Ball sale";
    case "coaching-package":
      return "Coaching package";
    case "parent-referral":
      return "Parent referral";
    case "club-wholesale":
      return "Club wholesale";
    case "camp":
      return "Camp partner";
    default:
      return k.replace(/-/g, " ");
  }
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-lime-500/15 bg-slate-900/40"
      }`}
    >
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </div>
      <div
        className={`text-2xl font-bold ${highlight ? "text-emerald-300" : "text-white"}`}
      >
        {value}
      </div>
    </div>
  );
}

function PayoutBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    owed: {
      label: "Owed",
      cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    paid: {
      label: "Paid",
      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    void: {
      label: "Void",
      cls: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    },
  };
  const m = map[status] || map.owed;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
