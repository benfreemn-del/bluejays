import type { Metadata } from "next";
import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { jsonLdString, breadcrumbLd, organizationLd } from "@/lib/json-ld";

const BASE_URL = "https://bluejayportfolio.com";

export const metadata: Metadata = {
  title: "Web design — where we work | BlueJays",
  description:
    "BlueJays builds custom websites for local businesses across Washington. See city-specific design + pricing for your area.",
  alternates: { canonical: `${BASE_URL}/web-design` },
  openGraph: {
    type: "website",
    url: `${BASE_URL}/web-design`,
    title: "Web design across Washington — BlueJays",
    description:
      "Custom websites for local businesses across WA. $997 one-time. Live in 48 hours. Pay only if you love it.",
    siteName: "BlueJays",
  },
};

export default function WebDesignIndex() {
  const grouped = CITIES.reduce<Record<string, typeof CITIES>>((acc, c) => {
    acc[c.region] = acc[c.region] || [];
    acc[c.region].push(c);
    return acc;
  }, {});

  const crumb = breadcrumbLd([
    { name: "BlueJays", url: BASE_URL },
    { name: "Web Design", url: `${BASE_URL}/web-design` },
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
            Free audit →
          </Link>
        </div>
      </header>

      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-3">
            Where we work
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            Web design across{" "}
            <span className="text-sky-400">Washington</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            BlueJays builds custom websites for local businesses across
            Washington state. Same $997 price + same 48-hour delivery,
            whether you&apos;re in Seattle or Quilcene. Click your city
            for the local breakdown.
          </p>
        </div>
      </section>

      {Object.entries(grouped).map(([region, cities]) => (
        <section key={region} className="border-b border-white/5">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <h2 className="text-xl font-bold mb-5 text-sky-300">
              {region}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {cities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/web-design/${c.slug}`}
                  className="group rounded-lg border border-white/10 bg-slate-900/40 p-4 hover:border-sky-500/40 hover:bg-slate-900/60 transition-colors"
                >
                  <p className="font-bold text-white group-hover:text-sky-200">
                    {c.name}, {c.state}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {c.intro.slice(0, 110).trim()}…
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section>
        <div className="mx-auto max-w-2xl px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            City not on the list?
          </h2>
          <p className="text-slate-400 mb-7">
            We work with businesses everywhere in WA. Run a free audit
            and we&apos;ll start there.
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
