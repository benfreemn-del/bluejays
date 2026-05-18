import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WINDOW_DAYS = 90;

interface RowAgg {
  source: string;
  prospects: number;
  audits: number;
  booked: number;
  paid: number;
  revenueUsd: number;
}

type ProspectRow = {
  id: string;
  source_channel: string | null;
  status: string | null;
  pricing_tier: string | null;
  paid_at: string | null;
  amount_paid_cents: number | null;
  booked_call_at: string | null;
  attribution: Record<string, string | null> | null;
  created_at: string;
};

type AuditRow = { prospect_id: string };

async function loadAttribution(): Promise<{
  rows: RowAgg[];
  totalProspects: number;
  totalRevenue: number;
  windowStart: string;
  configured: boolean;
}> {
  const windowStart = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();
  if (!isSupabaseConfigured()) {
    return {
      rows: [],
      totalProspects: 0,
      totalRevenue: 0,
      windowStart,
      configured: false,
    };
  }

  const { data: prospectsData, error: pErr } = await supabase
    .from("prospects")
    .select(
      "id, source_channel, status, pricing_tier, paid_at, amount_paid_cents, booked_call_at, attribution, created_at",
    )
    .gte("created_at", windowStart)
    .limit(5000);

  if (pErr || !prospectsData) {
    return {
      rows: [],
      totalProspects: 0,
      totalRevenue: 0,
      windowStart,
      configured: true,
    };
  }

  const prospects = prospectsData as unknown as ProspectRow[];
  const prospectIds = prospects.map((p) => p.id);

  let auditByProspect = new Set<string>();
  if (prospectIds.length > 0) {
    const { data: auditsData } = await supabase
      .from("site_audits")
      .select("prospect_id")
      .in("prospect_id", prospectIds);
    const rows = (auditsData as unknown as AuditRow[]) ?? [];
    auditByProspect = new Set(rows.map((r) => r.prospect_id));
  }

  const buckets = new Map<string, RowAgg>();
  for (const p of prospects) {
    const source = canonicalSource(p);
    let agg = buckets.get(source);
    if (!agg) {
      agg = {
        source,
        prospects: 0,
        audits: 0,
        booked: 0,
        paid: 0,
        revenueUsd: 0,
      };
      buckets.set(source, agg);
    }
    agg.prospects += 1;
    if (auditByProspect.has(p.id)) agg.audits += 1;
    if (p.booked_call_at) agg.booked += 1;
    if (p.status === "paid" || p.paid_at) {
      agg.paid += 1;
      agg.revenueUsd += centsToUsd(p.amount_paid_cents) || inferRevenue(p);
    }
  }

  const rows = Array.from(buckets.values()).sort((a, b) => {
    if (b.paid !== a.paid) return b.paid - a.paid;
    return b.prospects - a.prospects;
  });

  return {
    rows,
    totalProspects: prospects.length,
    totalRevenue: rows.reduce((sum, r) => sum + r.revenueUsd, 0),
    windowStart,
    configured: true,
  };
}

function canonicalSource(p: ProspectRow): string {
  const sc = (p.source_channel || "").trim();
  if (sc) return sc;
  const attr = p.attribution ?? {};
  if (attr.gclid) return "google-ads-autotag";
  if (attr.fbclid) return "meta-autotag";
  if (attr.msclkid) return "bing-autotag";
  if (attr.ttclid) return "tiktok-autotag";
  if (attr.li_fat_id) return "linkedin-autotag";
  if (attr.utm_source) return `utm:${attr.utm_source}`;
  if (attr.referrer) return `referrer:${shortHost(attr.referrer)}`;
  return "direct/unknown";
}

function shortHost(referrer: string): string {
  try {
    const u = new URL(referrer);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 30);
  }
}

function centsToUsd(cents: number | null): number {
  if (!cents) return 0;
  return Math.round(cents) / 100;
}

function inferRevenue(p: ProspectRow): number {
  const tier = (p.pricing_tier || "").toLowerCase();
  if (tier === "fullsystem") return 9700;
  if (tier === "standard") return 997;
  if (tier === "free") return 30;
  if (tier === "custom") return 100;
  return 0;
}

function pct(part: number, whole: number): string {
  if (!whole) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

export default async function AttributionDashboardPage() {
  const { rows, totalProspects, totalRevenue, windowStart, configured } =
    await loadAttribution();

  const totalPaid = rows.reduce((s, r) => s + r.paid, 0);
  const totalAudits = rows.reduce((s, r) => s + r.audits, 0);
  const totalBooked = rows.reduce((s, r) => s + r.booked, 0);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-bold">
              Attribution
            </p>
            <h1 className="text-2xl font-bold text-white mt-1">
              Click → Close, by source
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Last {WINDOW_DAYS} days · since {new Date(windowStart).toLocaleDateString()}
            </p>
          </div>
          <Link
            href="/spending"
            className="text-xs font-semibold text-slate-400 hover:text-white underline-offset-2 hover:underline"
          >
            see spend dashboard →
          </Link>
        </header>

        {!configured && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5 text-sm text-amber-200">
            Supabase not configured. Set the env vars on Vercel + locally to
            populate this view.
          </div>
        )}

        {configured && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Stat label="Prospects" value={totalProspects} />
              <Stat label="Audits ran" value={totalAudits} sub={pct(totalAudits, totalProspects)} />
              <Stat label="Calls booked" value={totalBooked} sub={pct(totalBooked, totalProspects)} />
              <Stat label="Paid" value={totalPaid} sub={pct(totalPaid, totalProspects)} accent />
            </div>

            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>
                Total revenue in window:{" "}
                <span className="text-emerald-400 font-semibold tabular-nums">
                  ${totalRevenue.toLocaleString()}
                </span>
              </span>
              <span>{rows.length} sources</span>
            </div>

            {rows.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
                No prospects in the last {WINDOW_DAYS} days. Source attribution
                kicks in once /audit submissions start flowing.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                <table className="min-w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold">
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-3 text-left">Source</th>
                      <th className="px-3 py-3 text-right">Prospects</th>
                      <th className="px-3 py-3 text-right">Audits</th>
                      <th className="px-3 py-3 text-right">Booked</th>
                      <th className="px-3 py-3 text-right">Paid</th>
                      <th className="px-3 py-3 text-right">Close %</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.source}
                        className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-[12px] text-slate-200">
                          {r.source}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">{r.prospects}</td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {r.audits}{" "}
                          <span className="text-[10px] text-slate-500">
                            {pct(r.audits, r.prospects)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {r.booked}{" "}
                          <span className="text-[10px] text-slate-500">
                            {pct(r.booked, r.prospects)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-semibold text-emerald-400">
                          {r.paid}
                        </td>
                        <td className="px-3 py-3 text-right text-xs text-slate-400">
                          {pct(r.paid, r.prospects)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-emerald-400 font-semibold">
                          ${r.revenueUsd.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="mt-6 text-[11px] text-slate-500 leading-relaxed max-w-2xl">
              Source is taken from <code className="text-slate-400">prospects.source_channel</code>{" "}
              when stamped on submit. Falls back to gclid / fbclid / msclkid /
              ttclid / li_fat_id, then utm_source, then a normalized referrer
              host, then <code className="text-slate-400">direct/unknown</code>.
              Revenue uses <code className="text-slate-400">amount_paid_cents</code>{" "}
              when set, otherwise infers from <code className="text-slate-400">pricing_tier</code>{" "}
              (fullsystem=$9,700 · standard=$997 · free=$30 · custom=$100/yr).
              Close rate is paid / prospects.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-emerald-500/40 bg-emerald-500/[0.06]"
          : "border-slate-800 bg-slate-900/40"
      }`}
    >
      <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-black tabular-nums ${
          accent ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}
