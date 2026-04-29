import { MetadataRoute } from "next";
import { getAllProspects } from "@/lib/store";
import { listPublishedCaseStudies } from "@/lib/case-studies";

// Hardcoded per CLAUDE.md Rule 16 — Vercel had stale NEXT_PUBLIC_BASE_URL.
const BASE_URL = "https://bluejayportfolio.com";

const V2_CATEGORIES = [
  "accounting", "appliance-repair", "auto-repair", "carpet-cleaning",
  "catering", "chiropractic", "church", "cleaning", "construction",
  "daycare", "dental", "electrician", "event-planning", "fencing",
  "fitness", "florist", "garage-door", "general-contractor", "hvac",
  "insurance", "interior-design", "junk-removal", "landscaping",
  "law-firm", "locksmith", "martial-arts", "med-spa", "medical",
  "moving", "painting", "pest-control", "pet-services", "photography",
  "physical-therapy", "plumber", "pool-spa", "pressure-washing",
  "real-estate", "restaurant", "roofing", "salon", "tattoo", "towing",
  "tree-service", "tutoring", "veterinary",
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
      url: `${BASE_URL}/case-studies`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
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

  return [
    ...staticRoutes,
    ...portfolioRoutes,
    ...caseStudyRoutes,
    ...previewRoutes,
  ];
}
