import { MetadataRoute } from "next";
import { getAllProspects } from "@/lib/store";
import { listPublishedCaseStudies } from "@/lib/case-studies";
import { CITIES } from "@/lib/cities";
import { GUIDES } from "@/lib/guides";

// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

const V2_CATEGORIES = [
  "accounting", "appliance-repair", "auto-repair", "carpet-cleaning",
  "catering", "chiropractic", "church", "cleaning", "construction",
  "consulting", "daycare", "dental", "electrician", "event-planning",
  "fencing", "fitness", "florist", "garage-door", "general-contractor",
  "hvac", "insurance", "interior-design", "junk-removal", "landscaping",
  "law-firm", "locksmith", "martial-arts", "med-spa", "medical",
  "moving", "painting", "pest-control", "pet-services", "photography",
  "physical-therapy", "plumber", "pool-spa", "pressure-washing",
  "real-estate", "restaurant", "roofing", "salon", "tattoo", "towing",
  "tree-service", "tutoring", "veterinary",
];

/**
 * Active bespoke client showcases at /clients/[slug].
 *
 * These are real paid + custom-tier client pages with unique local
 * business content (real services, real photos, real addresses,
 * real phone numbers). Each ranks for hyper-local + niche queries
 * (e.g. "Tesla Powerwall installer Sequim" → meyer-electric).
 *
 * High priority (0.85) because they're compounding long-tail SEO:
 * 1 unique business per page, no overlap with portfolio templates,
 * each carries its own LocalBusiness/Electrician/etc. JSON-LD.
 *
 * Add a slug here when a new client showcase ships. Drop one if a
 * client churns + we tear their page down.
 */
const ACTIVE_CLIENT_SHOWCASES = [
  "meyer-electric",          // Tesla Powerwall + Generac · Sequim WA
  "hector-landscaping",      // Hardscapes + lawn care · Renton WA
  "elite-hardscapes-and-landscapes", // Hardscape + landscape · Port Angeles WA (Tyler Fritz)
  "peninsula-paving",        // Asphalt paving + excavation · Sequim WA · Cyril + Ella Frick (est. 1985)
  "masters-window-tinting",  // Auto + ceramic + PPF · West Babylon NY
  "kr-ranches",              // Farm-direct beef · Prosser WA
  "olympic-inspections",     // Home inspections (formerly P&P)
  // "itc-quick-attach" — removed from public sitemap 2026-05-19 per Ben.
  // The /clients/itc-quick-attach page still exists for Jake's direct use,
  // just no longer indexed/featured publicly.
  "zenith-sports",           // Soccer training balls · TEKKY brand ($10K AI System)
  "laser-lakes",             // Custom lake-map wood art
  "lcac",                    // Lewis County Autism Coalition
  "bloodlines",              // Preston James Hunsaker · indie-author · Bloodlines fantasy series
  "theoregonappraisers",     // Robert (Bob) Rochefort · Salem OR · estate/divorce/IRS appraisals
  "mt-view-landscaping",     // Mountain View Landscape & Design · Tim + Bonnie Hunsaker · Auburn WA · since 1976
];

/**
 * Sub-routes under client showcases that ship as their own indexable
 * pages (lead-magnet articles, audience landing pages, etc.). Added
 * separately so the sitemap surfaces every long-tail SEO entry.
 */
const CLIENT_SUB_ROUTES = [
  "/clients/theoregonappraisers/executors-guide",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/audit`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/agency`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    // Note: /agency/apply is intentionally NOT in the sitemap — it's
    // robots.noindex/nofollow as a bottom-of-funnel form.
    {
      url: `${BASE_URL}/case-studies`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/web-design`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/speed`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/partners`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Portfolio showcase pages — high SEO value
  const portfolioRoutes: MetadataRoute.Sitemap = V2_CATEGORIES.map((slug) => ({
    url: `${BASE_URL}/v2/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // Active bespoke client showcases — high local-SEO value (real
  // business name + city + niche → unique long-tail rankings).
  const clientShowcaseRoutes: MetadataRoute.Sitemap =
    ACTIVE_CLIENT_SHOWCASES.map((slug) => ({
      url: `${BASE_URL}/clients/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }));

  // Per-client sub-routes (lead-magnet articles, etc.) — slightly
  // lower priority than the showcase root but still indexable.
  const clientSubRoutes: MetadataRoute.Sitemap =
    CLIENT_SUB_ROUTES.map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  // Public preview pages for paid/claimed prospects
  let previewRoutes: MetadataRoute.Sitemap = [];
  try {
    const prospects = await getAllProspects();
    const publicProspects = prospects.filter((p) =>
      ["paid", "claimed"].includes(p.status) && p.generatedSiteUrl
    );
    previewRoutes = publicProspects.map((p) => ({
      url: `${BASE_URL}/preview/${p.id}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // Non-fatal — previews are optional in sitemap
  }

  // Published case studies — every audit Ben publishes shows up here.
  // Highest SEO priority because they're the compounding asset:
  // unique long-tail keywords (business name + category) per page.
  let caseStudyRoutes: MetadataRoute.Sitemap = [];
  try {
    const studies = await listPublishedCaseStudies(500);
    caseStudyRoutes = studies.map((s) => ({
      url: `${BASE_URL}/case-studies/${s.case_study_slug}`,
      lastModified: new Date(s.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }));
  } catch {
    // Non-fatal — case studies are optional in sitemap
  }

  // City landing pages — Tier 3 SEO compounding asset (each ranks for
  // "web design [city]" + sister-city internal links).
  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${BASE_URL}/web-design/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  // Anchor-article guides — Tier 2 SEO compounding asset (long-form,
  // owns specific high-intent queries).
  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.modifiedAt),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [
    ...staticRoutes,
    ...portfolioRoutes,
    ...clientShowcaseRoutes,
    ...clientSubRoutes,
    ...cityRoutes,
    ...guideRoutes,
    ...caseStudyRoutes,
    ...previewRoutes,
  ];
}
