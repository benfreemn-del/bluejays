import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCityBySlug, CITIES } from "@/lib/cities";
import { jsonLdString, breadcrumbLd, organizationLd } from "@/lib/json-ld";

export const dynamic = "force-static";
export const revalidate = 3600; // re-render hourly to pick up new content

const BASE_URL = "https://bluejayportfolio.com";

/**
 * /web-design/[city] — local landing page that ranks for
 * "web design [city]" + "[city] website designer" queries.
 *
 * Each page is genuinely different per city:
 *   - city-specific intro paragraph (real local context)
 *   - 3 city-specific "why it matters" bullets
 *   - 5 best-fit categories with V2 template links
 *   - 3 sister-city links (internal linking compound)
 *   - LocalBusiness JSON-LD with city's address
 *
 * Hormozi compounding play: each city page is a distinct asset that
 * ranks for distinct queries. Together they form internal-link mesh
 * that lifts all of them.
 */

export async function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "Not found" };

  const title = `Web design in ${city.name}, ${city.state} — BlueJays`;
  const description = `Custom websites for ${city.name} ${city.state} businesses. Live in 48 hours. $997 one-time + $100/yr hosting. See your site before you pay.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/web-design/${city.slug}` },
    openGraph: {
      type: "website",
      url: `${BASE_URL}/web-design/${city.slug}`,
      title,
      description,
      siteName: "BlueJays",
    },
    robots: { index: true, follow: true },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  landscaping: "Landscaping",
  "general-contractor": "General Contractor",
  "auto-repair": "Auto Repair",
  construction: "Construction",
  "tree-service": "Tree Service",
  "real-estate": "Real Estate",
  "med-spa": "Med Spa",
  florist: "Florist",
  restaurant: "Restaurant",
  hotel: "Hotel",
  fishing: "Fishing Charter",
  salon: "Salon",
  "interior-design": "Interior Design",
  "boat-services": "Boat Services",
  moving: "Moving Company",
  fitness: "Fitness",
  tattoo: "Tattoo",
  tutoring: "Tutoring",
  "law-firm": "Law Firm",
  hvac: "HVAC",
};

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  // Sister cities (same region, excluding this one). Used for
  // internal-link mesh.
  const sisterCities = CITIES.filter(
    (c) => c.region === city.region && c.slug !== city.slug,
  ).slice(0, 4);

  // Other cities outside the region — broader internal links
  const otherCities = CITIES.filter((c) => c.region !== city.region).slice(0, 4);

  // Schema: LocalBusiness with city address + breadcrumb
  const localBusinessLd = {
    "@type": "LocalBusiness",
    name: `BlueJays — Web Design in ${city.name}`,
    description: `Custom websites for ${city.name} ${city.state} businesses. Live in 48 hours. $997 one-time + $100/yr hosting.`,
    url: `${BASE_URL}/web-design/${city.slug}`,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "State",
        name: city.state,
      },
    },
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressRegion: city.state,
      addressCountry: "US",
    },
  };

  const crumb = breadcrumbLd([
    { name: "BlueJays", url: BASE_URL },
    { name: "Web Design", url: `${BASE_URL}/web-design` },
    { name: city.name, url: `${BASE_URL}/web-design/${city.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(organizationLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(localBusinessLd) }}
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
            href="/audit"
            className="text-sm font-semibold rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-3 py-1.5 transition-colors"
          >
            Free audit →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <nav
            className="text-xs text-slate-500 mb-4"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="hover:text-slate-300 transition-colors"
            >
              BlueJays
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/web-design"
              className="hover:text-slate-300 transition-colors"
            >
              Web Design
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-400">{city.name}</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-3">
            {city.region} · {city.state}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            Web design in{" "}
            <span className="text-sky-400">
              {city.name}, {city.state}
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            {city.intro}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-5 py-2.5 text-sm font-bold transition-colors"
            >
              Get a free audit of your site
            </Link>
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center rounded-md border border-sky-500/40 bg-sky-500/5 hover:bg-sky-500/15 text-sky-200 px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              Build my full preview
            </Link>
          </div>
        </div>
      </section>

      {/* Why it matters in this city */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-5">
            Why it matters in {city.name}
          </h2>
          <ul className="space-y-3">
            {city.whyItMatters.map((point, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-slate-300 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Best categories in this city */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Built for {city.name} businesses
          </h2>
          <p className="text-slate-400 mb-6">
            We&apos;ve built premium sites for these {city.name}{" "}
            categories. Click any to see a real example.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {city.bestCategories.map((cat) => {
              const label = CATEGORY_LABELS[cat] || cat.replace(/-/g, " ");
              return (
                <Link
                  key={cat}
                  href={`/v2/${cat}`}
                  className="group rounded-lg border border-white/10 bg-slate-900/40 p-4 hover:border-sky-500/40 hover:bg-slate-900/60 transition-colors"
                >
                  <p className="font-semibold text-white group-hover:text-sky-200">
                    {label} →
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    See a {city.name} {label.toLowerCase()} site example
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing reminder + risk reversal */}
      <section className="border-b border-white/5 bg-emerald-950/10">
        <div className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-3">
            Same price everywhere we work
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            $997 one-time. $100/yr starting year 2.
          </h2>
          <p className="text-slate-300 mb-2 leading-relaxed">
            Custom design, professional copy, mobile-first build, local
            SEO, domain, and hosting — all included. Same package whether
            you&apos;re in {city.name} or anywhere else in WA.
          </p>
          <p className="text-emerald-300 font-semibold mb-7">
            Don&apos;t love it? You don&apos;t pay a cent.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-3 text-base font-bold transition-colors"
          >
            Run my free 60-second audit
          </Link>
        </div>
      </section>

      {/* Sister cities + other regions — internal linking mesh */}
      {(sisterCities.length > 0 || otherCities.length > 0) && (
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-3xl px-6 py-12">
            {sisterCities.length > 0 && (
              <>
                <h2 className="text-xl font-bold mb-4">
                  Other {city.region} cities
                </h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  {sisterCities.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/web-design/${c.slug}`}
                      className="rounded-full border border-white/10 bg-slate-900/40 hover:border-sky-500/40 hover:bg-slate-900/60 px-4 py-1.5 text-sm text-slate-300 hover:text-sky-200 transition-colors"
                    >
                      {c.name}, {c.state}
                    </Link>
                  ))}
                </div>
              </>
            )}
            {otherCities.length > 0 && (
              <>
                <h2 className="text-xl font-bold mb-4 text-slate-400">
                  Elsewhere in Washington
                </h2>
                <div className="flex flex-wrap gap-2">
                  {otherCities.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/web-design/${c.slug}`}
                      className="rounded-full border border-white/10 bg-slate-900/30 hover:border-sky-500/40 hover:bg-slate-900/60 px-4 py-1.5 text-sm text-slate-400 hover:text-sky-200 transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <footer className="pb-16">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          Built by Ben Freeman · Quilcene, WA ·{" "}
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
