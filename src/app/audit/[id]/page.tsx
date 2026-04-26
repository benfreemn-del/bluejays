import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AuditContent, AuditFinding } from "@/lib/site-audit";

/**
 * /audit/[id] — Hormozi salty-pretzel report display.
 *
 * Public via PUBLIC_API_PATHS in middleware (URL-as-secret pattern —
 * URL knowledge IS the auth, same as /claim/[id], /client/[id], etc.).
 *
 * Per research deliverable Section C, structure is:
 *  1. Top-line score (single big number, color-coded)
 *  2. Money-leak headline (one sentence, anchored to vertical)
 *  3. 5-7 prioritized findings (NOT 40 — paralysis kills conversion)
 *  4. Industry benchmark callout (gap vs BlueJays' V2 template)
 *  5. Honest verdict (the bridge to rebuild)
 *  6. Single CTA — Rebuild for $997 OR Book a 15-min call
 *
 * Tone: plain English, blunt, friendly, 7th-grade reading level.
 */

export const dynamic = "force-dynamic";

type Audit = {
  id: string;
  status: string;
  audit_content: AuditContent | null;
  target_url: string;
  business_category: string;
  prospect_id: string;
  generated_at: string | null;
};

type Prospect = {
  business_name: string;
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  critical: { bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/40", label: "Critical" },
  high: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/40", label: "High Impact" },
  medium: { bg: "bg-sky-500/20", text: "text-sky-300", border: "border-sky-500/40", label: "Medium" },
  low: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/40", label: "Strength" },
};

const IMPACT_LABELS: Record<string, string> = {
  high: "High impact",
  medium: "Medium impact",
  low: "Low impact",
};

const EFFORT_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: "Easy fix", color: "text-emerald-400" },
  medium: { label: "Moderate", color: "text-amber-400" },
  high: { label: "Rebuild", color: "text-rose-400" },
};

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

  const { data: audit } = await supabase
    .from("site_audits")
    .select("id, status, audit_content, target_url, business_category, prospect_id, generated_at")
    .eq("id", id)
    .maybeSingle();

  if (!audit) notFound();

  const a = audit as unknown as Audit;
  if (a.status !== "ready" || !a.audit_content) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl font-bold mb-3">Audit not ready</h1>
          <p className="text-slate-400 mb-6">
            This audit is still {a.status === "failed" ? "marked as failed" : "in progress"}.
          </p>
          <Link
            href={`/audit/${id}/processing`}
            className="inline-flex items-center rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold hover:bg-sky-400 transition-colors"
          >
            Check status →
          </Link>
        </div>
      </main>
    );
  }

  const content = a.audit_content as AuditContent;
  const { data: prospect } = await supabase
    .from("prospects")
    .select("business_name")
    .eq("id", a.prospect_id)
    .maybeSingle();
  const businessName = (prospect as unknown as Prospect | null)?.business_name || "Your Business";

  // Track view (best-effort, non-blocking)
  await supabase
    .from("site_audits")
    .update({
      first_viewed_at: a.generated_at ? undefined : new Date().toISOString(),
      view_count: (await getViewCount(id)) + 1,
    })
    .eq("id", id);

  const score = content.overallScore ?? 50;
  const scoreColor =
    score >= 80 ? "text-emerald-400" : score >= 60 ? "text-sky-400" : score >= 40 ? "text-amber-400" : "text-rose-400";
  const scoreLabel =
    score >= 80 ? "Solid" : score >= 60 ? "Has Bones" : score >= 40 ? "Leaking Leads" : "Costing Customers";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-6 flex items-center justify-between">
          <Link href="https://bluejayportfolio.com" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← BlueJays
          </Link>
          <span className="text-xs text-slate-500 font-mono">Audit · {id.slice(0, 8)}</span>
        </div>
      </header>

      {/* Hero / Top-line score */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-sm uppercase tracking-wider text-slate-400 mb-3">
            Website Audit · {businessName}
          </p>
          <a
            href={a.target_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-sky-400 hover:underline mb-8 inline-block"
          >
            {a.target_url} →
          </a>

          <div className="my-12">
            <div className={`text-8xl md:text-9xl font-black ${scoreColor} leading-none`}>
              {score}
              <span className="text-3xl text-slate-600">/100</span>
            </div>
            <p className={`mt-4 text-2xl font-bold ${scoreColor}`}>{scoreLabel}</p>
          </div>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {content.oneLineSummary}
          </p>
        </div>
      </section>

      {/* Money-leak anchor — Hormozi salty-pretzel mechanic.
          Underclaim by design (research Risk #2): we'd rather miss low than
          burn trust by overclaiming. Hidden when score >= 80 (would feel
          scammy to tell a healthy site they're losing $X/month). */}
      {content.moneyLeak && content.overallScore < 80 && content.moneyLeak.monthlyEstimate > 0 && (
        <section className="border-b border-white/5 bg-gradient-to-r from-rose-950/30 to-amber-950/20">
          <div className="mx-auto max-w-3xl px-6 py-12 text-center">
            <p className="text-sm uppercase tracking-wider text-rose-300 mb-3 font-semibold">
              Estimated money-leak
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              ~<span className="text-rose-400">${content.moneyLeak.monthlyEstimate.toLocaleString()}</span>
              <span className="text-2xl md:text-3xl text-slate-400">/month</span>
            </h2>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              That&apos;s a conservative estimate of the customers and revenue your current site is leaving on the table — every month you wait.
            </p>
            <p className="mt-4 text-xs text-slate-500 max-w-xl mx-auto">
              Range: ${content.moneyLeak.estimateLow.toLocaleString()} — ${content.moneyLeak.estimateHigh.toLocaleString()} / month. {content.moneyLeak.methodology}
            </p>
          </div>
        </section>
      )}

      {/* Strengths */}
      {content.strengths && content.strengths.length > 0 && (
        <section className="border-b border-white/5 bg-emerald-950/20">
          <div className="mx-auto max-w-4xl px-6 py-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-300 mb-4">
              ✓ What&apos;s working
            </h2>
            <ul className="space-y-2">
              {content.strengths.map((s, i) => (
                <li key={i} className="text-slate-300 flex gap-3">
                  <span className="text-emerald-400">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Prioritized roadmap */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-3xl font-bold mb-2">Top fixes — ranked by impact</h2>
          <p className="text-slate-400 mb-8">
            Most audits give you 40 things to do. We give you the {content.prioritizedRoadmap.length} that actually move the needle.
          </p>

          <div className="space-y-3">
            {content.prioritizedRoadmap.map((item) => (
              <div
                key={item.rank}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900/50 p-5"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 font-bold">
                  {item.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="text-slate-500">{IMPACT_LABELS[item.impact] || item.impact}</span>
                    <span className={EFFORT_LABELS[item.effort]?.color || "text-slate-500"}>
                      {EFFORT_LABELS[item.effort]?.label || item.effort}
                    </span>
                    {item.blueJaysCanDo && (
                      <span className="text-sky-400">BlueJays can fix this</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed findings by section */}
      <FindingSection title="Hero & Above the Fold" findings={content.heroAnalysis.findings} score={content.heroAnalysis.score} />
      <FindingSection title="Copy & Positioning" findings={content.copyAndPositioning.findings} />
      <FindingSection title="Trust & Social Proof" findings={content.trustAndSocialProof.findings} />
      <FindingSection title="Technical & SEO" findings={content.technicalAndSeo.findings} score={content.technicalAndSeo.score} />
      <FindingSection title="Mobile & UX" findings={content.mobileAndUx.findings} />

      {/* Benchmark */}
      {content.blueJaysBenchmark && (
        <section className="border-b border-white/5 bg-slate-900/30">
          <div className="mx-auto max-w-4xl px-6 py-12">
            <p className="text-sm uppercase tracking-wider text-sky-400 mb-3">Industry benchmark</p>
            <h2 className="text-2xl font-bold mb-4">
              See the gap: <span className="text-sky-300">{content.blueJaysBenchmark.referenceTemplate}</span>
            </h2>
            <p className="text-slate-300 mb-6">{content.blueJaysBenchmark.gapSummary}</p>
            <a
              href={content.blueJaysBenchmark.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300 hover:bg-sky-500/20 transition-colors"
            >
              View benchmark template →
            </a>
          </div>
        </section>
      )}

      {/* Final CTA — the salty-pretzel bridge to the paid offer */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {content.callToAction.headline}
          </h2>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            {content.callToAction.body}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={content.callToAction.primaryButtonUrl}
              className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-sky-500 to-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
            >
              {content.callToAction.primaryButtonText} →
            </a>
            <a
              href={content.callToAction.secondaryButtonUrl}
              className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              {content.callToAction.secondaryButtonText}
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          <p>
            Audit generated {new Date(content.generatedAt).toLocaleDateString()} ·
            <Link href="/audit" className="text-sky-400 hover:underline ml-2">Audit a different site →</Link>
          </p>
        </div>
      </footer>
    </main>
  );
}

function FindingSection({
  title,
  findings,
  score,
}: {
  title: string;
  findings: AuditFinding[];
  score?: number;
}) {
  if (!findings || findings.length === 0) return null;

  return (
    <section className="border-b border-white/5">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          {score !== undefined && (
            <span className="text-sm text-slate-400 font-mono">{score}/100</span>
          )}
        </div>
        <div className="space-y-4">
          {findings.map((f, i) => {
            const colors = SEVERITY_COLORS[f.severity] || SEVERITY_COLORS.medium;
            return (
              <article
                key={i}
                className={`rounded-xl border ${colors.border} ${colors.bg} p-6`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className={`flex-shrink-0 inline-flex items-center rounded-full ${colors.bg} ${colors.text} border ${colors.border} px-2 py-0.5 text-xs font-semibold uppercase tracking-wider`}>
                    {colors.label}
                  </span>
                  <h3 className="font-semibold text-white flex-1">{f.title}</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">What&apos;s happening</p>
                    <p className="text-slate-300 leading-relaxed">{f.observation}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">How to fix</p>
                    <p className="text-slate-300 leading-relaxed">{f.recommendation}</p>
                  </div>
                  {f.blueJaysSolution && (
                    <div className="rounded-md bg-sky-500/10 border border-sky-500/20 px-3 py-2">
                      <p className="text-xs uppercase tracking-wider text-sky-400 mb-1">BlueJays would do this</p>
                      <p className="text-sky-100 text-sm leading-relaxed">{f.blueJaysSolution}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

async function getViewCount(id: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const { data } = await supabase
    .from("site_audits")
    .select("view_count")
    .eq("id", id)
    .maybeSingle();
  return (data?.view_count as number | null) ?? 0;
}
