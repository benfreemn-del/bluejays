/**
 * Meyer Electric sitemap — served at
 * https://www.sequimelectrician.com/sitemap.xml after the middleware
 * rewrite (see CLIENT_DOMAIN_MAP in src/middleware.ts), and at
 * /clients/meyer-electric/sitemap.xml on bluejayportfolio.com.
 *
 * Why a Meyer-specific sitemap rather than the BlueJays-wide one:
 * Google crawling sequimelectrician.com must not be handed a sitemap
 * full of bluejayportfolio.com portfolio URLs. This lists only Kyle's
 * pages, with his own domain as the host — which is also what the
 * canonical tag now points at (see layout.tsx).
 *
 * The showcase is a single-page site; the in-page anchors (#solar,
 * #powerwall, #generators, …) are deliberately NOT listed. Fragments
 * are not separate URLs to Google and listing them adds noise.
 *
 * Mirrors the tekky.org pattern (zenith-sports/sitemap.xml).
 */

export const dynamic = "force-static";
export const revalidate = 3600;

const HOST = "https://www.sequimelectrician.com";

const PAGES = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
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
