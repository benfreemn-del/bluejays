/**
 * Dedicated Zenith Sports sitemap — Phase 1 SEO foundation deliverable.
 *
 * Served at /clients/zenith-sports/sitemap.xml on bluejayportfolio.com
 * and at https://tekky.org/sitemap.xml after middleware rewrite (see
 * src/middleware.ts CLIENT_DOMAIN_MAP entry for tekky.org).
 *
 * Why a Zenith-specific sitemap instead of relying on the BlueJays-wide
 * sitemap.ts: Google crawling tekky.org should NOT see a sitemap full
 * of bluejayportfolio.com portfolio URLs. This file lists ONLY
 * Zenith pages, with tekky.org as the canonical host.
 */

export const dynamic = "force-static";
export const revalidate = 3600;

const HOST = "https://tekky.org";

const PAGES = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/shop", priority: 0.95, changeFrequency: "weekly" },
  { path: "/training-guide", priority: 0.85, changeFrequency: "monthly" },
  { path: "/build-your-player", priority: 0.85, changeFrequency: "monthly" },
  { path: "/camps", priority: 0.8, changeFrequency: "monthly" },
  { path: "/partners", priority: 0.7, changeFrequency: "monthly" },
] as const;

export function GET() {
  const lastmod = new Date().toISOString();

  const urls = PAGES.map(
    (p) => `  <url>
    <loc>${HOST}${p.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changeFrequency}</changefreq>
    <priority>${p.priority.toFixed(2)}</priority>
  </url>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
