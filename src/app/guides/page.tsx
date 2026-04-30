import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { jsonLdString, breadcrumbLd, organizationLd } from "@/lib/json-ld";

const BASE_URL = "https://bluejayportfolio.com";

export const metadata: Metadata = {
  title: "Guides — BlueJays",
  description:
    "Honest, no-fluff guides for local-business owners on websites, web design, and what's actually worth paying for.",
  alternates: { canonical: `${BASE_URL}/guides` },
  openGraph: {
    type: "website",
    url: `${BASE_URL}/guides`,
    title: "Guides — BlueJays",
    description:
      "Honest, no-fluff guides for local-business owners on websites, web design, and what's actually worth paying for.",
    siteName: "BlueJays",
  },
};

export default function GuidesIndex() {
  const crumb = breadcrumbLd([
    { name: "BlueJays", url: BASE_URL },
    { name: "Guides", url: `${BASE_URL}/guides` },
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(organizationLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(crumb) }}
      />

      <header className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
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
            Free audit →
          </Link>
        </div>
      </header>

      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
            Guides
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            Honest answers about{" "}
            <span className="text-amber-300">your website</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            No fluff. No upsell-disguised-as-advice. Just plain answers
            to the questions local-business owners actually have about
            their websites.
          </p>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="space-y-4">
            {GUIDES.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group block rounded-xl border border-white/10 bg-slate-900/40 p-5 hover:border-amber-500/40 hover:bg-slate-900/60 transition-colors"
              >
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                  {g.readingTime} min read
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-amber-200 mb-2 transition-colors">
                  {g.title}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {g.metaDescription}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-2xl px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            Question we haven&apos;t answered yet?
          </h2>
          <p className="text-slate-400 mb-7">
            Start with a free audit. We&apos;ll tell you exactly
            what&apos;s working on your site and what isn&apos;t — no
            sales pitch.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-3 text-base font-bold transition-colors"
          >
            Run my free 60-second audit
          </Link>
        </div>
      </section>

      <footer className="pb-16">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          Built by Ben Freeman · Quilcene, WA
        </div>
      </footer>
    </main>
  );
}
