import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Partner, PartnerReferral } from "@/lib/partners";
import PartnerAdminActions from "./PartnerAdminActions";
import PartnerAdminTopPanel from "./PartnerAdminTopPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partners — BlueJays Admin",
  robots: { index: false, follow: false },
};

/**
 * /dashboard/partners — Ben's admin view.
 *
 * Sections:
 *   1. Pending applications (approve / decline)
 *   2. Approved partners (pause / link / dashboard)
 *   3. Outstanding payouts (mark-paid actions)
 *
 * Auth: this route lives under /dashboard which is gated by the same
 * URL-as-secret pattern as the rest of the dashboard. Add real auth
 * if /dashboard ever gets locked down.
 */
export default async function PartnersAdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-12">
        Supabase not configured.
      </main>
    );
  }

  const { data: partnersRows } = await supabase
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });
  const partners = (partnersRows as unknown as Partner[]) || [];

  const { data: refRows } = await supabase
    .from("partner_referrals")
    .select("*")
    .order("closed_at", { ascending: false });
  const referrals = (refRows as unknown as PartnerReferral[]) || [];

  const pending = partners.filter((p) => p.status === "pending");
  const approved = partners.filter((p) => p.status === "approved");
  const other = partners.filter(
    (p) => p.status !== "pending" && p.status !== "approved",
  );

  const owedReferrals = referrals.filter((r) => r.payout_status === "owed");
  const totalOwedCents = owedReferrals.reduce((s, r) => s + r.amount_cents, 0);

  // Helper map: partner_id → partner name (for the referrals table)
  const partnerName = new Map(partners.map((p) => [p.id, p.name]));

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-bold">Partners</h1>
        </div>
      </header>

      {/* Admin tools — Enter as Ben + Add a partner */}
      <PartnerAdminTopPanel />

      {/* Top-line stats */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Pending" value={pending.length.toString()} tone="amber" />
          <Stat label="Approved" value={approved.length.toString()} tone="emerald" />
          <Stat label="Closes" value={referrals.length.toString()} />
          <Stat
            label="Owed"
            value={`$${(totalOwedCents / 100).toFixed(0)}`}
            tone="rose"
          />
        </div>
      </section>

      {/* Pending applications */}
      {pending.length > 0 && (
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <h2 className="text-xl font-bold mb-4">
              ⏳ Pending applications ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-sm text-slate-400">{p.email}</p>
                      {p.phone && (
                        <p className="text-sm text-slate-500">{p.phone}</p>
                      )}
                    </div>
                    <PartnerAdminActions partnerId={p.id} status={p.status} />
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 pl-1">
                    {p.payout_handle && (
                      <p>
                        <span className="text-slate-500">Payout:</span>{" "}
                        {p.payout_handle}
                      </p>
                    )}
                    {p.promotion_channel && (
                      <p>
                        <span className="text-slate-500">Where:</span>{" "}
                        {p.promotion_channel}
                      </p>
                    )}
                    {p.notes && (
                      <p>
                        <span className="text-slate-500">Note:</span> {p.notes}
                      </p>
                    )}
                    <p className="text-slate-600 pt-1">
                      Code:{" "}
                      <code className="text-amber-300/80">{p.code}</code>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Outstanding payouts */}
      {owedReferrals.length > 0 && (
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <h2 className="text-xl font-bold mb-4">
              💸 Outstanding payouts ({owedReferrals.length} ·{" "}
              ${(totalOwedCents / 100).toFixed(0)})
            </h2>
            <div className="rounded-xl border border-white/10 bg-slate-900/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="text-left px-4 py-3">Partner</th>
                    <th className="text-left px-4 py-3">Closed</th>
                    <th className="text-left px-4 py-3">Business</th>
                    <th className="text-right px-4 py-3">Amount</th>
                    <th className="text-right px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {owedReferrals.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-white">
                        {partnerName.get(r.partner_id) || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(r.closed_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {r.business_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-white font-mono">
                        ${(r.amount_cents / 100).toFixed(0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <PartnerAdminActions
                          partnerId={r.partner_id}
                          referralId={r.id}
                          mode="payout"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Approved partners */}
      {approved.length > 0 && (
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <h2 className="text-xl font-bold mb-4">
              ✅ Approved partners ({approved.length})
            </h2>
            <div className="rounded-xl border border-white/10 bg-slate-900/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Code</th>
                    <th className="text-left px-4 py-3">Payout</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {approved.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-white">{p.name}</td>
                      <td className="px-4 py-3 text-slate-400">{p.email}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/partners/${p.code}`}
                          className="font-mono text-amber-300 hover:underline text-xs"
                        >
                          {p.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {p.payout_handle || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <PartnerAdminActions
                          partnerId={p.id}
                          status={p.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Other (paused / declined) */}
      {other.length > 0 && (
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <h2 className="text-xl font-bold mb-4 text-slate-400">
              Other ({other.length})
            </h2>
            <div className="space-y-2">
              {other.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-white/5 bg-slate-900/30 px-4 py-2 text-sm"
                >
                  <span className="text-slate-400">
                    {p.name} · {p.email} ·{" "}
                    <span className="text-rose-300">{p.status}</span>
                  </span>
                  <PartnerAdminActions partnerId={p.id} status={p.status} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="pb-20" />
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "amber" | "emerald" | "rose";
}) {
  const cls =
    tone === "amber"
      ? "border-amber-500/30 bg-amber-500/5"
      : tone === "emerald"
        ? "border-emerald-500/30 bg-emerald-500/5"
        : tone === "rose"
          ? "border-rose-500/30 bg-rose-500/5"
          : "border-white/10 bg-slate-900/40";
  const valueCls =
    tone === "amber"
      ? "text-amber-300"
      : tone === "emerald"
        ? "text-emerald-300"
        : tone === "rose"
          ? "text-rose-300"
          : "text-white";
  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold ${valueCls}`}>{value}</div>
    </div>
  );
}
