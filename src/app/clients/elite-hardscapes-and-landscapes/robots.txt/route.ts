/**
 * Elite Hardscapes robots.txt — served at
 * https://www.elitehardscapesnw.com/robots.txt after the middleware
 * rewrite (see the elitehardscapesnw.com entry in CLIENT_DOMAIN_MAP,
 * src/middleware.ts), and at
 * /clients/elite-hardscapes-and-landscapes/robots.txt on bluejayportfolio.com.
 *
 * Mirrors the tekky.org pattern (zenith-sports/robots.txt).
 */

export const dynamic = "force-static";
export const revalidate = 86400;

const HOST = "https://www.elitehardscapesnw.com";

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
