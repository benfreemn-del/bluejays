/**
 * Meyer Electric robots.txt — served at
 * https://www.sequimelectrician.com/robots.txt after the middleware
 * rewrite (see the sequimelectrician.com entry in CLIENT_DOMAIN_MAP,
 * src/middleware.ts), and at
 * /clients/meyer-electric/robots.txt on bluejayportfolio.com.
 *
 * Added 2026-08-17. Before this, /robots.txt on Kyle's domain 301'd to
 * "/" because the domain entry was a bare string rewrite — every path
 * on that host collapsed onto the showcase. Google got zero crawl
 * guidance on the client's own domain and could not discover a
 * sitemap or the llms.txt surface there.
 *
 * Mirrors the tekky.org pattern (zenith-sports/robots.txt).
 */

export const dynamic = "force-static";
export const revalidate = 86400;

const HOST = "https://www.sequimelectrician.com";

const body = `User-agent: *
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

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
