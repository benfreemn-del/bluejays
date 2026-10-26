/**
 * Mountain View robots.txt: served at https://mtviewlandscaping.com/robots.txt
 * through the CLIENT_DOMAIN_MAP rewrite (src/middleware.ts). Same pattern as
 * the Elite Hardscapes route. The /ops team backend stays out of the index.
 */
import { SITE_URL, BASE_PATH } from "../_lib/site";

export const dynamic = "force-static";
export const revalidate = 86400;

const body = `User-agent: *
Allow: /
Disallow: ${BASE_PATH}/ops
Disallow: ${BASE_PATH}/portal-demo

Sitemap: ${SITE_URL}/sitemap.xml
`;

export function GET() {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400, s-maxage=86400" },
  });
}
