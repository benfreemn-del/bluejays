import type { Metadata } from "next";
import Link from "next/link";
import SpeedGraderForm from "./SpeedGraderForm";
import { jsonLdString, breadcrumbLd, organizationLd } from "@/lib/json-ld";

const BASE_URL = "https://bluejayportfolio.com";

export const metadata: Metadata = {
  title: "Free site speed grader — BlueJays",
  description:
    "Free 30-second speed test for any website. Real Google PageSpeed score, mobile + desktop, with the top fixes ranked by impact.",
  alternates: { canonical: `${BASE_URL}/tools/speed` },
  openGraph: {
    type: "website",
    url: `${BASE_URL}/tools/speed`,
    title: "Free site speed grader — BlueJays",
    description:
      "Real Google PageSpeed score for any URL. Mobile + desktop. Free, no signup.",
    siteName: "BlueJays",
  },
  robots: { index: true, follow: true },
};

export default function SpeedGraderPage() {
  const speedToolLd = {
    "@type": "SoftwareApplication",
    name: "BlueJays Site Speed Grader",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Free Google PageSpeed test — Core Web Vitals, mobile + desktop scores, top fixes.",
    url: `${BASE_URL}/tools/speed`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const crumb = breadcrumbLd([
    { name: "BlueJays", url: BASE_URL },
    { name: "Free Tools", url: `${BASE_URL}/tools` },
    { name: "Site Speed Grader", url: `${BASE_URL}/tools/speed` },
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(organizationLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(speedToolLd) }}
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
            href="/tools"
            className="text-sm text-slate-400 hover:text-white"
          >
            All tools
          </Link>
        </div>
      </header>

      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-3">
            Free tool
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            How fast is your site,{" "}
            <span className="text-sky-400">really?</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            We pull your real Google PageSpeed Insights score and the
            top fixes ranked by impact. Mobile + desktop. No signup, no
            email, free.
          </p>
          <SpeedGraderForm />
        </div>
      </section>

      {/* Why speed matters */}
      <section className="border-b border-white/5 bg-slate-900/30">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-5">
            Why this matters
          </h2>
          <ul className="space-y-3 text-slate-300 leading-relaxed">
            <li className="flex gap-3">
              <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-sky-400" />
              <span>
                <strong className="text-white">53% of mobile visitors</strong>{" "}
                leave a site that takes longer than 3 seconds to load (Google).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-sky-400" />
              <span>
                <strong className="text-white">Each 1-second delay</strong>{" "}
                drops conversions by 7% on average (Akamai).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-sky-400" />
              <span>
                Google ranks fast sites higher in search. Slow site = fewer
                impressions = fewer customers ever finding you.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-sky-400" />
              <span>
                Most local-business sites built before 2023 score below 60 on
                mobile. The fix is rebuild, not patch.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-2xl px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Score below 70?
          </h2>
          <p className="text-slate-400 mb-7 leading-relaxed">
            Run our full audit — same depth as the case studies we
            publish, plus money-leak math. Free, no credit card.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-3 text-base font-bold transition-colors"
          >
            Run my full audit →
          </Link>
        </div>
      </section>

      <footer className="pb-16">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          Powered by Google PageSpeed Insights · Built by{" "}
          <Link href="/" className="text-sky-400 hover:underline">
            BlueJays
          </Link>
        </div>
      </footer>
    </main>
  );
}
