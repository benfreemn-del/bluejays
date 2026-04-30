import type { Metadata } from "next";
import Link from "next/link";
import { jsonLdString, breadcrumbLd, organizationLd } from "@/lib/json-ld";

const BASE_URL = "https://bluejayportfolio.com";

export const metadata: Metadata = {
  title: "Free tools — BlueJays",
  description:
    "Free tools for local-business owners — site speed grader, full website audit. No signup, no email required.",
  alternates: { canonical: `${BASE_URL}/tools` },
  openGraph: {
    type: "website",
    url: `${BASE_URL}/tools`,
    title: "Free tools — BlueJays",
    description:
      "Free tools for local-business owners — site speed grader, full website audit.",
    siteName: "BlueJays",
  },
};

export default function ToolsIndex() {
  const crumb = breadcrumbLd([
    { name: "BlueJays", url: BASE_URL },
    { name: "Free Tools", url: `${BASE_URL}/tools` },
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
            Free Tools
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            Honest tools for{" "}
            <span className="text-amber-300">local business owners</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            All free. No signup. No email gating. Use them as much as you
            want — even if you never hire us.
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-12 space-y-5">
          {/* Full audit — featured */}
          <Link
            href="/audit"
            className="group block rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 md:p-8 hover:border-amber-500/60 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-2">
                  ⭐ Most useful · 60 seconds
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white group-hover:text-amber-200 transition-colors">
                  Full website audit
                </h2>
              </div>
              <span className="shrink-0 text-amber-300 text-3xl group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              Score your site 0–100 across design, copy, trust signals,
              mobile, and local SEO. Identify the 3 fixes worth real money.
              Money-leak math included — you&apos;ll see exactly how much
              your site is costing you each month.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-200/80">
              <span>· 60-second AI audit</span>
              <span>· 5–7 prioritized fixes</span>
              <span>· No credit card</span>
            </div>
          </Link>

          {/* Site speed grader */}
          <Link
            href="/tools/speed"
            className="group block rounded-2xl border border-sky-500/20 bg-slate-900/40 p-6 md:p-8 hover:border-sky-500/50 hover:bg-slate-900/60 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-2">
                  ⚡ 30 seconds
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-sky-200 transition-colors">
                  Site speed grader
                </h2>
              </div>
              <span className="shrink-0 text-sky-300 text-2xl group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-3">
              Real Google PageSpeed score for any URL. Mobile + desktop.
              Top fixes ranked by impact. Useful when you want a fast
              second-opinion before paying anyone for a &quot;speed
              optimization.&quot;
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-sky-200/70">
              <span>· Powered by Google PageSpeed Insights</span>
              <span>· Core Web Vitals</span>
            </div>
          </Link>

          {/* Coming soon — placeholder so the page doesn't look thin */}
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/20 p-6 md:p-8">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
              Coming soon
            </p>
            <p className="text-slate-400 leading-relaxed">
              Mobile-friendly checker · Headline grader · &quot;Should I
              rebuild or patch?&quot; decision tool. Email{" "}
              <a
                href="mailto:ben@bluejayportfolio.com"
                className="text-sky-400 hover:underline"
              >
                ben@bluejayportfolio.com
              </a>{" "}
              if there&apos;s a tool you wish existed.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-2xl px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Need actual help, not just a tool?
          </h2>
          <p className="text-slate-400 mb-7 leading-relaxed">
            BlueJays builds custom websites for local businesses.
            $997 one-time. Live in 48 hours. Pay only if you love it.
          </p>
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-6 py-3 text-base font-bold text-white shadow-lg transition-all"
          >
            Build my full preview →
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
