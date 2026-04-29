import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import CaseStudyToggle from "./CaseStudyToggle";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Case Studies — BlueJays Admin",
  robots: { index: false, follow: false },
};

type AuditRow = {
  id: string;
  prospect_id: string;
  status: string;
  case_study_slug: string | null;
  published_at: string | null;
  generated_at: string | null;
  business_category: string | null;
  audit_content: { overallScore?: number; oneLineSummary?: string } | null;
};

type ProspectRow = {
  id: string;
  business_name: string;
};

/**
 * /dashboard/case-studies — admin tool for publishing audits as
 * public, SEO-indexable case studies.
 *
 * Lists all 'ready' audits with their current publish state. Each
 * row has a one-click toggle that calls /api/audits/[id]/publish.
 *
 * Hormozi compounding-asset rule: every audit Ben publishes here
 * becomes free permanent SEO content. Goal is to publish every audit
 * by default once the prospect gives implicit permission (paid client,
 * tested template fan, etc.). Anonymized publication for cold prospects
 * is a future enhancement.
 */
export default async function CaseStudiesAdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-12">
        Supabase not configured.
      </main>
    );
  }

  const { data: auditRows } = await supabase
    .from("site_audits")
    .select(
      "id, prospect_id, status, case_study_slug, published_at, generated_at, business_category, audit_content",
    )
    .eq("status", "ready")
    .not("audit_content", "is", null)
    .order("generated_at", { ascending: false })
    .limit(200);
  const audits = (auditRows as unknown as AuditRow[]) || [];

  const prospectIds = Array.from(new Set(audits.map((a) => a.prospect_id)));
  let nameById = new Map<string, string>();
  if (prospectIds.length > 0) {
    const { data: prospectRows } = await supabase
      .from("prospects")
      .select("id, business_name")
      .in("id", prospectIds);
    nameById = new Map(
      ((prospectRows as unknown as ProspectRow[]) || []).map((p) => [
        p.id,
        p.business_name || "Local Business",
      ]),
    );
  }

  const published = audits.filter((a) => !!a.published_at);
  const unpublished = audits.filter((a) => !a.published_at);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-bold">Case Studies</h1>
        </div>
      </header>

      {/* Top stats + intro */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          <Stat
            label="Published"
            value={published.length.toString()}
            tone="emerald"
          />
          <Stat
            label="Ready to publish"
            value={unpublished.length.toString()}
            tone="amber"
          />
          <Stat
            label="Total ready audits"
            value={audits.length.toString()}
          />
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Every published audit becomes a public SEO asset at{" "}
            <code className="text-amber-300">/case-studies/[slug]</code>.
            Each page ranks for the prospect&apos;s business name + their
            category. 100 published = 100 indexed pages. The compounding
            asset only compounds if you keep stacking.
          </p>
        </div>
      </section>

      {/* Published */}
      {published.length > 0 && (
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <h2 className="text-xl font-bold mb-4">
              ✅ Published ({published.length})
            </h2>
            <AuditTable audits={published} nameById={nameById} />
          </div>
        </section>
      )}

      {/* Unpublished — the queue Ben works through */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <h2 className="text-xl font-bold mb-4">
            🟡 Ready to publish ({unpublished.length})
          </h2>
          {unpublished.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/30 p-8 text-center text-slate-400 text-sm">
              All ready audits are published. Run more audits to keep
              the pipeline full.
            </div>
          ) : (
            <AuditTable audits={unpublished} nameById={nameById} />
          )}
        </div>
      </section>

      <div className="pb-20" />
    </main>
  );
}

function AuditTable({
  audits,
  nameById,
}: {
  audits: AuditRow[];
  nameById: Map<string, string>;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/30 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="text-left px-4 py-3">Business</th>
            <th className="text-left px-4 py-3">Category</th>
            <th className="text-left px-4 py-3">Score</th>
            <th className="text-left px-4 py-3">Public URL</th>
            <th className="text-right px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {audits.map((a) => {
            const name = nameById.get(a.prospect_id) || "—";
            const score = a.audit_content?.overallScore ?? 0;
            return (
              <tr key={a.id}>
                <td className="px-4 py-3 text-white">{name}</td>
                <td className="px-4 py-3 text-slate-400 capitalize">
                  {(a.business_category || "—").replace(/-/g, " ")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      score >= 80
                        ? "text-emerald-300 font-mono"
                        : "text-rose-300 font-mono"
                    }
                  >
                    {score}/100
                  </span>
                </td>
                <td className="px-4 py-3">
                  {a.case_study_slug ? (
                    <Link
                      href={`/case-studies/${a.case_study_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-300 hover:underline font-mono text-xs"
                    >
                      /case-studies/{a.case_study_slug}
                    </Link>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <CaseStudyToggle
                    auditId={a.id}
                    isPublished={!!a.published_at}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "amber" | "emerald";
}) {
  const cls =
    tone === "amber"
      ? "border-amber-500/30 bg-amber-500/5"
      : tone === "emerald"
        ? "border-emerald-500/30 bg-emerald-500/5"
        : "border-white/10 bg-slate-900/40";
  const valueCls =
    tone === "amber"
      ? "text-amber-300"
      : tone === "emerald"
        ? "text-emerald-300"
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
