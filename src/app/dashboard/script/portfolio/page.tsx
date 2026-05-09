"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/**
 * /dashboard/script/portfolio
 *
 * Per Q5=A locked 2026-05-08 — portfolio link library for the Sales
 * Portal. Madie uses these links in cold outreach when a prospect's
 * category matches one of our bespoke client showcases ("here's
 * what we built for a client like you").
 *
 * Curated list of LIVE bespoke client showcases — not the V2 template
 * portfolio. Bespoke = production work BlueJays delivered, owned by
 * a real client, with real content + real testimonials. This is the
 * proof Madie shows on calls.
 *
 * Click-to-copy on every URL — Madie pastes into SMS / email / DM
 * without leaving the page.
 *
 * Filter chips by category so she finds the right one in 5 seconds.
 */

type Showcase = {
  slug: string;
  name: string;
  industry: string;
  category: string;
  // What makes this showcase worth showing — the pitch line.
  highlight: string;
  // Live URL (full path the prospect clicks).
  url: string;
};

const SITE_URL = "https://bluejayportfolio.com";

const SHOWCASES: Showcase[] = [
  {
    slug: "bloodlines",
    name: "Bloodlines · Preston Hunsaker",
    industry: "Indie author",
    category: "creative",
    highlight:
      "Author saga site · 13 painted character portraits · interactive world map · faction quiz · Amazon-driven CTAs",
    url: `${SITE_URL}/clients/bloodlines`,
  },
  {
    slug: "the-oregon-appraisers",
    name: "The Oregon Appraisers",
    industry: "Estate appraisal",
    category: "professional-services",
    highlight:
      "Audience-segmented hero (executor / attorney / CPA) · single-asset trust strip (Larry Noe vouch) · paired lead-magnet article",
    url: `${SITE_URL}/clients/theoregonappraisers`,
  },
  {
    slug: "nevarland-outpost",
    name: "Nevarland Outpost",
    industry: "Kids' apparel · DTC manufacturer",
    category: "manufacturer",
    highlight:
      "Brand-match palette · Stay Real centerpiece · interactive ember canvas · 3-anchor manufacturer ICP fit",
    url: `${SITE_URL}/clients/nevarland-outpost`,
  },
  {
    slug: "meyer-electric",
    name: "Meyer Electric",
    industry: "Electrician (Sequim WA)",
    category: "electrician",
    highlight:
      "Animated trade illustrations (Powerwall + Generac) · mock-backend portal demo at /portal-demo (1212) · custom-tier $100/yr",
    url: `${SITE_URL}/clients/meyer-electric`,
  },
  {
    slug: "kr-ranches",
    name: "KR Ranches",
    industry: "Farm-direct meat (Prosser WA)",
    category: "food-bev",
    highlight:
      "Bespoke static HTML site · farm-direct meat shop · custom-tier $100/yr · shipped 2026-05-05",
    url: `${SITE_URL}/sites/kr-ranches/`,
  },
  {
    slug: "masters-window-tinting",
    name: "Masters Window Tinting",
    industry: "Auto detail · window tint (Long Island NY)",
    category: "auto-detail",
    highlight:
      "Bespoke custom-tier showcase · automotive niche · audit-flip lead origin",
    url: `${SITE_URL}/clients/masters-window-tinting`,
  },
  {
    slug: "olympic-inspections",
    name: "Olympic Inspections",
    industry: "Home inspections (Pacific NW)",
    category: "inspections",
    highlight:
      "Replatform from Pine & Particle · content-fidelity rebuild · native booking calendar",
    url: `${SITE_URL}/clients/olympic-inspections`,
  },
  {
    slug: "zenith-sports",
    name: "Zenith / Tekky",
    industry: "Soccer training products · DTC",
    category: "sports-equipment",
    highlight:
      "First $10k AI Marketing System client · 3-audience funnels (parent/coach/player) · Build-your-player tool · ECNL-grade training guide · partner workspace",
    url: `${SITE_URL}/clients/zenith-sports`,
  },
  {
    slug: "itc-quick-attach",
    name: "ITC Quick Attach",
    industry: "Tractor accessories · multi-channel",
    category: "manufacturer",
    highlight:
      "Multi-channel manufacturer (6 audiences: hobbyist / forester / TYM / hunter / dealer / community)",
    url: `${SITE_URL}/clients/itc-quick-attach`,
  },
  {
    slug: "hector-landscaping",
    name: "Hector Landscaping",
    industry: "Landscaping (Renton WA)",
    category: "landscaping",
    highlight:
      "First paying client · hectorlandscaping.com · video testimonial recorded",
    url: `${SITE_URL}/clients/hector-landscaping`,
  },
  {
    slug: "laser-lakes",
    name: "Laser Lakes",
    industry: "Lake-mapping equipment · DTC",
    category: "outdoor",
    highlight:
      "Custom marketing front · Shopify-backed checkout · no-backend pattern (mailto configurator)",
    url: `${SITE_URL}/clients/laser-lakes`,
  },
  {
    slug: "lewis-county-autism",
    name: "Lewis County Autism Coalition",
    industry: "Nonprofit · autism advocacy",
    category: "nonprofit",
    highlight:
      "LCAC official site at lcautism.org · custom-tier paying client · Spanish menu · 24-page bespoke build",
    url: "https://lcautism.org",
  },
  {
    slug: "bluejayportfolio",
    name: "BlueJays Portfolio",
    industry: "BlueJays · agency self",
    category: "self",
    highlight:
      "Our own site · proof we eat our own cooking · /audit lead magnet + 5-clog framework live",
    url: SITE_URL,
  },
];

const CATEGORIES = [
  "all",
  "manufacturer",
  "electrician",
  "landscaping",
  "auto-detail",
  "inspections",
  "food-bev",
  "outdoor",
  "sports-equipment",
  "professional-services",
  "creative",
  "nonprofit",
  "self",
];

const CATEGORY_LABEL: Record<string, string> = {
  all: "All",
  manufacturer: "Manufacturers",
  electrician: "Electricians",
  landscaping: "Landscaping",
  "auto-detail": "Auto detail",
  inspections: "Inspections",
  "food-bev": "Food / Bev",
  outdoor: "Outdoor",
  "sports-equipment": "Sports gear",
  "professional-services": "Pro services",
  creative: "Creative / authors",
  nonprofit: "Nonprofit",
  self: "BlueJays self",
};

export default function PortfolioLibraryPage() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return SHOWCASES.filter((s) => {
      if (filter !== "all" && s.category !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.industry.toLowerCase().includes(q) ||
          s.highlight.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filter, search]);

  const copy = async (slug: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1500);
    } catch (err) {
      console.warn("[portfolio] clipboard failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/85 border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard/script"
            className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
          >
            ← Sales Portal
          </Link>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex-1">
            Portfolio Library
          </h1>
          <span className="text-[11px] tracking-wider uppercase font-bold text-slate-500">
            {SHOWCASES.length} live showcases
          </span>
        </div>
        <p className="mx-auto max-w-6xl px-4 sm:px-6 pb-3 text-[11px] text-slate-500 leading-snug">
          Live bespoke client showcases · click any URL to copy. Use these in
          DMs / SMS / cold email when a prospect&apos;s category matches —
          stronger pitch than the generic preview link because the prospect
          sees real production work for a real customer.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 pb-32 space-y-6">
        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / industry / category…"
            className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-[11px] uppercase tracking-wider font-bold text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => {
            const active = filter === c;
            const count =
              c === "all"
                ? SHOWCASES.length
                : SHOWCASES.filter((s) => s.category === c).length;
            if (count === 0 && c !== "all") return null;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`text-[11px] font-bold uppercase tracking-wider rounded-full border px-3 py-1 flex items-center gap-1.5 transition-colors ${
                  active
                    ? "border-violet-500/60 bg-violet-500/15 text-violet-200"
                    : "border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white"
                }`}
              >
                <span>{CATEGORY_LABEL[c] ?? c}</span>
                <span className="opacity-70 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Showcase grid */}
        {filtered.length === 0 ? (
          <div className="text-center text-slate-500 py-16 italic">
            No showcases match your filter.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((s) => {
              const copied = copiedSlug === s.slug;
              return (
                <article
                  key={s.slug}
                  className="rounded-xl border border-white/[0.06] bg-slate-900/40 p-4 hover:border-slate-700 transition-colors flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold text-white truncate">
                        {s.name}
                      </h2>
                      <p className="text-[11px] uppercase tracking-wider text-violet-300 mt-0.5">
                        {s.industry}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold rounded border border-slate-700 bg-slate-800 text-slate-400 px-1.5 py-0.5 whitespace-nowrap shrink-0">
                      {s.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3 flex-1">
                    {s.highlight}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 min-w-0 truncate text-[11px] font-mono text-slate-500 bg-slate-900/60 border border-white/[0.06] rounded px-2 py-1.5">
                      {s.url}
                    </code>
                    <button
                      type="button"
                      onClick={() => copy(s.slug, s.url)}
                      className={`text-[11px] uppercase tracking-wider font-bold rounded px-3 py-1.5 transition-colors whitespace-nowrap ${
                        copied
                          ? "bg-emerald-500 text-emerald-950"
                          : "bg-violet-500 hover:bg-violet-400 text-white"
                      }`}
                      title="Copy URL to clipboard"
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] uppercase tracking-wider font-bold rounded border border-slate-700 hover:border-violet-500/50 text-slate-400 hover:text-white px-2.5 py-1.5 whitespace-nowrap"
                      title="Open in new tab"
                    >
                      Open ↗
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl">
          Add a showcase: edit{" "}
          <code className="text-slate-300">
            src/app/dashboard/script/portfolio/page.tsx
          </code>{" "}
          and append to <code className="text-slate-300">SHOWCASES</code>. Pick
          a slug + name + industry + category + 1-line highlight + full URL.
          Visible to anyone with sales-portal access.
        </p>
      </main>
    </div>
  );
}
