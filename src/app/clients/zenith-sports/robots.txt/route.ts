/**
 * Dedicated Zenith Sports robots.txt — Phase 1 SEO foundation deliverable.
 *
 * Served at /clients/zenith-sports/robots.txt on bluejayportfolio.com
 * and at https://tekky.org/robots.txt after middleware rewrite (see
 * src/middleware.ts CLIENT_DOMAIN_MAP entry for tekky.org).
 *
 * Points crawlers at the Zenith-specific sitemap and explicitly
 * allows the llms.txt + llms-full.txt surfaces so AI crawlers know
 * where to look for the AI-readable site summary.
 */

export const dynamic = "force-static";
export const revalidate = 86400;

const HOST = "https://tekky.org";

const body = `User-agent: *
Allow: /
Allow: /llms.txt
Disallow: /clients/zenith-sports/login

Sitemap: ${HOST}/sitemap.xml
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
