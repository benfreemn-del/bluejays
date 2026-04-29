import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedCaseStudy } from "@/lib/case-studies";
import { jsonLdString, caseStudyLd, breadcrumbLd } from "@/lib/json-ld";
import type { AuditFinding } from "@/lib/site-audit";

export const dynamic = "force-dynamic";

const BASE_URL = "https://bluejayportfolio.com";

/**
 * /case-studies/[slug] — public, SEO-indexable view of an audit.
 *
 * Same audit_content as /audit/[uuid] but:
 *   - human-readable URL (kebab business name)
 *   - opted-in (only renders if published_at is set)
 *   - SEO-optimized (full meta + JSON-LD + breadcrumbs)
 *   - less aggressive funnel (one CTA at the bottom, not sticky)
 *   - links back to /audit (free audit) + /case-studies index +
 *     the V2 template for the prospect's category
 *
 * Hormozi compounding asset: every published audit becomes free
 * permanent SEO content that ranks for the business name + category.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getPublishedCaseStudy(slug);
  if (!study) {
    return {
      title: "Case study not found — BlueJays",
      robots: { index: false, follow: false },
    };
  }

  const category = (study.business_category || "service").replace(/-/g, " ");
  const summary = study.audit_content?.oneLineSummary || "";
  const title = `${study.businessName} — ${category} website case study | BlueJays`;
  const description =
    summary ||
    `How BlueJays would rebuild ${study.businessName}'s ${category} website. Free audit + 48-hour rebuild. $997 one-time.`;

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      type: "article",
      url: `${BASE_URL}/case-studies/${slug}`,
      title,
      description: description.slice(0, 200),
      publishedTime: study.published_at,
      siteName: "BlueJays",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.slice(0, 200),
    },
    alternates: {
      canonical: `${BASE_URL}/case-studies/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

const FINDING_ICONS: Record<string, string> = {
  critical: "🔴",
  high: "🔴",
  medium: "🟠",
  low: "🟢",
};

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getPublishedCaseStudy(slug);
  if (!study) notFound();
  const c = study.audit_content!;
  const category = (study.business_category || "service").replace(/-/g, " ");

  const ld = caseStudyLd({
    businessName: study.businessName,
    category,
    slug,
    publishedAt: study.published_at,
    description: c.oneLineSummary || `${study.businessName} website case study`,
    score: c.overallScore,
  });
  const crumb = breadcrumbLd([
    { name: "BlueJays", url: BASE_URL },
    { name: "Case Studies", url: `${BASE_URL}/case-studies` },
    { name: study.businessName, url: `${BASE_URL}/case-studies/${slug}` },
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Structured data — case study + breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(ld) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(crumb) }}
      />

      {/* Header */}
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← BlueJays
          </Link>
          <Link
            href="/case-studies"
            className="text-sm text-slate-400 hover:text-white"
          >
            All case studies
          </Link>
        </div>
      </header>

      {/* Hero — case study framing, NOT funnel framing */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <nav
            className="text-xs text-slate-500 mb-4"
            aria-label="Breadcrumb"
          >
            <Link
              href="/case-studies"
              className="hover:text-slate-300 transition-colors"
            >
              Case Studies
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-400">{study.businessName}</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
            Case Study · {category}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            How we&apos;d rebuild{" "}
            <span className="text-amber-300">{study.businessName}</span>
            &apos;s website
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            {c.oneLineSummary ||
              `An honest look at what's costing this ${category} business calls — and what we'd do about it.`}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
            <span>
              Score:{" "}
              <span
                className={
                  c.overallScore >= 80
                    ? "text-emerald-300 font-semibold"
                    : "text-rose-300 font-semibold"
                }
              >
                {c.overallScore}/100
              </span>
            </span>
            {study.target_url && (
              <a
                href={study.target_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-sky-400 hover:underline"
              >
                🔗 view current site
              </a>
            )}
            <span className="text-slate-500">
              Published{" "}
              {new Date(study.published_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </section>

      {/* The findings — the SEO body. Each finding's title + observation
          is indexable content that ranks for category-specific queries. */}
      <Section emoji="👋" title="What we found on the homepage">
        <FindingList findings={c.heroAnalysis?.findings || []} />
      </Section>

      <Section emoji="✍️" title="Their words and positioning">
        <FindingList findings={c.copyAndPositioning?.findings || []} />
      </Section>

      <Section emoji="⭐" title="How they build trust">
        <FindingList findings={c.trustAndSocialProof?.findings || []} />
      </Section>

      <Section emoji="🔍" title="Google + technical health">
        <FindingList findings={c.technicalAndSeo?.findings || []} />
      </Section>

      <Section emoji="📱" title="Mobile experience">
        <FindingList findings={c.mobileAndUx?.findings || []} />
      </Section>

      {/* Recovery summary */}
      {c.recoveryProjection && c.recoveryProjection.totalMonthly > 0 && (
        <section className="border-b border-white/5 bg-emerald-950/10">
          <div className="mx-auto max-w-3xl px-6 py-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              The opportunity
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Fixing the issues above could recover roughly{" "}
              <span className="text-emerald-300 font-bold">
                ${c.recoveryProjection.totalMonthly.toLocaleString()}/month
              </span>{" "}
              for this business — about{" "}
              <span className="text-emerald-300 font-bold">
                +
                {c.recoveryProjection.totalLeads ??
                  c.recoveryProjection.totalCustomers}{" "}
                {(c.recoveryProjection.totalLeads ??
                  c.recoveryProjection.totalCustomers) === 1
                  ? "lead"
                  : "leads"}
              </span>{" "}
              per month.
            </p>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              {c.recoveryProjection.methodology}
            </p>
          </div>
        </section>
      )}

      {/* CTA — single, soft, at the bottom. Public case studies are
          for SEO, not aggressive conversion. The links in this CTA
          are indexable and pass page-rank to the audit + V2 pages. */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
            Want one for your business?
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Free 60-second audit, same depth as this one.
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            BlueJays runs a free audit on any local service business
            site. Score, money-leak math, and the 3 specific fixes that
            move the needle. No credit card. No call required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-3 text-base font-bold shadow-lg transition-colors"
            >
              Get my free audit →
            </Link>
            <Link
              href={`/v2/${study.business_category || "general"}`}
              className="inline-flex items-center justify-center rounded-md border border-white/10 hover:border-sky-500/40 bg-slate-900 hover:bg-sky-500/10 px-6 py-3 text-base text-slate-300 hover:text-sky-200 transition-colors"
            >
              See a {category} template
            </Link>
          </div>
        </div>
      </section>

      <footer className="pb-16">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          Built by Ben at{" "}
          <Link
            href="/"
            className="text-sky-400 hover:underline"
          >
            BlueJays
          </Link>
          {" · "}
          <a
            href="mailto:ben@bluejayportfolio.com"
            className="text-sky-400 hover:underline"
          >
            ben@bluejayportfolio.com
          </a>
        </div>
      </footer>
    </main>
  );
}

function Section({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-white/5">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-5">
          <span className="mr-2">{emoji}</span>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function FindingList({ findings }: { findings: AuditFinding[] }) {
  if (!findings || findings.length === 0) return null;
  return (
    <div className="space-y-4">
      {findings.map((f, i) => (
        <article
          key={i}
          className="rounded-xl border border-white/10 bg-slate-900/40 p-5"
        >
          <h3 className="flex items-start gap-2 font-semibold text-white mb-2 leading-snug">
            <span className="flex-shrink-0">
              {FINDING_ICONS[f.severity] || "🟠"}
            </span>
            <span className="flex-1">{f.title}</span>
          </h3>
          <div className="space-y-2 text-sm pl-7">
            <p className="text-slate-300 leading-relaxed">
              <span className="text-slate-500 mr-1.5">📍</span>
              {f.observation}
            </p>
            {f.severity !== "low" && (
              <p className="text-slate-200 leading-relaxed">
                <span className="text-emerald-400 mr-1.5">🛠️</span>
                {f.recommendation}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
