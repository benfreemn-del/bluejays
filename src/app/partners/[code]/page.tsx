import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Partner, PartnerReferral } from "@/lib/partners";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partner dashboard — BlueJays",
  robots: { index: false, follow: false },
};

/**
 * /partners/[code] — partner-facing dashboard.
 *
 * URL-as-secret: anyone who knows the code can view the dashboard.
 * That's intentional — the partner code IS the credential, same as
 * /audit/[id] and /claim/[id]. No login forms. The data shown is
 * non-sensitive (their referral counts, payout status) and the partner
 * is the only one with a reason to know the URL.
 */
export default async function PartnerDashboardPage({
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
    .maybeSingle();

  if (!partnerRow) notFound();
  const partner = partnerRow as unknown as Partner;

  const { data: referralsRows } = await supabase
    .from("partner_referrals")
    .select("*")
    .eq("partner_id", partner.id)
    .order("closed_at", { ascending: false });

  const referrals = (referralsRows as unknown as PartnerReferral[]) || [];
  const owedCents = referrals
    .filter((r) => r.payout_status === "owed")
    .reduce((sum, r) => sum + r.amount_cents, 0);
  const paidCents = referrals
    .filter((r) => r.payout_status === "paid")
    .reduce((sum, r) => sum + r.amount_cents, 0);
  const closedCount = referrals.filter((r) => r.payout_status !== "void").length;

  const link = `https://bluejayportfolio.com/audit?ref=${partner.code}`;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <Link href="/partners" className="text-sm text-slate-400 hover:text-white">
            ← Partner program
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

      {/* Status banner */}
      {partner.status === "pending" && (
        <div className="bg-amber-500/15 border-b border-amber-500/30">
          <div className="mx-auto max-w-4xl px-6 py-4 text-sm text-amber-200">
            ⏳ Your application is awaiting Ben&apos;s approval. You&apos;ll
            get an email when it&apos;s live — usually within 24 hours.
          </div>
        </div>
      )}
      {partner.status === "paused" && (
        <div className="bg-rose-500/15 border-b border-rose-500/30">
          <div className="mx-auto max-w-4xl px-6 py-4 text-sm text-rose-200">
            Your partner account is paused. Email{" "}
            <a href="mailto:ben@bluejayportfolio.com" className="underline">
              ben@bluejayportfolio.com
            </a>{" "}
            to ask why or get reactivated.
          </div>
        </div>
      )}

      {/* Stats */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Stat label="Closes" value={closedCount.toString()} />
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

          {/* Link block */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
            <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-2">
              Your partner link
            </p>
            <p className="font-mono text-amber-200 text-sm break-all mb-3">
              {link}
            </p>
            <p className="text-xs text-slate-400">
              Anyone who clicks this link is attributed to you for 90
              days. They get a free site audit. If they pay for a
              BlueJays site within those 90 days, you&apos;re credited
              for the close — $200 paid via Venmo or Zelle within 7
              days.
            </p>
          </div>

          {/* W-9 status block — required before first payout */}
          <div
            className={`mt-4 rounded-2xl border p-5 ${
              partner.w9_received_at
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-rose-500/30 bg-rose-500/5"
            }`}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p
                  className={`text-xs uppercase tracking-wider font-semibold mb-1 ${
                    partner.w9_received_at ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  IRS Form W-9
                </p>
                <p className="text-sm text-slate-200">
                  {partner.w9_received_at
                    ? `On file since ${new Date(partner.w9_received_at).toLocaleDateString()}. You're paid-ready.`
                    : "Required before your first commission can be paid."}
                </p>
              </div>
              <Link
                href={`/partners/${partner.code}/w9`}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-bold transition-colors ${
                  partner.w9_received_at
                    ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                    : "bg-rose-500 text-white hover:bg-rose-400"
                }`}
              >
                {partner.w9_received_at ? "Re-upload" : "Upload W-9 →"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Referrals list */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <h2 className="text-xl font-bold mb-4">Your closes</h2>
          {referrals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/30 p-8 text-center text-slate-400">
              No closes yet. Share your link and check back.
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-slate-900/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="text-left px-4 py-3">Business</th>
                    <th className="text-left px-4 py-3">Closed</th>
                    <th className="text-right px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {referrals.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-white">
                        {r.business_name || "—"}
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
          <a href="mailto:ben@bluejayportfolio.com" className="text-sky-400 hover:underline">
            ben@bluejayportfolio.com
          </a>
        </div>
      </footer>
    </main>
  );
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
          : "border-white/10 bg-slate-900/40"
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
    owed: { label: "Owed", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    paid: { label: "Paid", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
    void: { label: "Void", cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
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
