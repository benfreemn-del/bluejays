import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedCaseStudies } from "@/lib/case-studies";
import { jsonLdString, breadcrumbLd } from "@/lib/json-ld";

export const dynamic = "force-dynamic";
const BASE_URL = "https://bluejayportfolio.com";

export const metadata: Metadata = {
  title: "Website case studies — BlueJays",
  description:
    "Real audits and rebuilds of local service business websites. See exactly what's costing them calls and how we'd fix it.",
  alternates: { canonical: `${BASE_URL}/case-studies` },
  openGraph: {
    type: "website",
    url: `${BASE_URL}/case-studies`,
    title: "Website case studies — BlueJays",
    description:
      "Real audits and rebuilds of local service business websites. See exactly what's costing them calls and how we'd fix it.",
    siteName: "BlueJays",
  },
};

/**
 * /case-studies — index of all published case studies. Newest first.
 * Compounding asset: every published audit shows up here automatically,
 * each entry is an internal link that passes pagerank to the case
 * study, and the index itself ranks for queries like "website audit
 * examples" or "small business website case studies".
 */
export default async function CaseStudiesIndex() {
  const studies = await listPublishedCaseStudies(100);
  const crumb = breadcrumbLd([
    { name: "BlueJays", url: BASE_URL },
    { name: "Case Studies", url: `${BASE_URL}/case-studies` },
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(crumb) }}
      />

      <header className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← BlueJays
          </Link>
          <Link
            href="/audit"
            className="text-sm font-semibold rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-3 py-1.5 transition-colors"
          >
            Get my free audit →
          </Link>
        </div>
      </header>

      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
            Case Studies
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            Real audits.{" "}
            <span className="text-amber-300">Real businesses.</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Every site BlueJays audits gets scored, money-leak math, and
            a 3-step rebuild plan. Below are the ones we&apos;re allowed
            to publish.
          </p>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-12">
          {studies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/30 p-10 text-center text-slate-400">
              No published case studies yet — first ones land soon.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {studies.map((s) => {
                const score = s.audit_content?.overallScore ?? 50;
                const cat = (s.business_category || "service").replace(
                  /-/g,
                  " ",
                );
                return (
                  <Link
                    key={s.id}
                    href={`/case-studies/${s.case_study_slug}`}
                    className="group rounded-xl border border-white/10 bg-slate-900/40 p-5 hover:border-amber-500/30 hover:bg-slate-900/60 transition-colors"
                  >
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                      {cat}
                    </p>
                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
                      {s.businessName}
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                      {s.audit_content?.oneLineSummary || ""}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        Score:{" "}
                        <span
                          className={
                            score >= 80
                              ? "text-emerald-300 font-semibold"
                              : "text-rose-300 font-semibold"
                          }
                        >
                          {score}/100
                        </span>
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(s.published_at).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            Want one for your site?
          </h2>
          <p className="text-slate-400 mb-8">
            Free 60-second audit. Same depth as the studies above. No
            credit card.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-3 text-base font-bold shadow-lg transition-colors"
          >
            Get my free audit →
          </Link>
        </div>
      </section>

      <footer className="pb-16">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          Built by Ben at{" "}
          <Link href="/" className="text-sky-400 hover:underline">
            BlueJays
          </Link>
        </div>
      </footer>
    </main>
  );
}
