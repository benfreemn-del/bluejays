/**
 * Mountain View sitemap: served at https://mtviewlandscaping.com/sitemap.xml
 * via the CLIENT_DOMAIN_MAP rewrite. Lists only the Hunsakers' pages on their
 * own domain (never bluejayportfolio.com URLs), with image entries so Google
 * Images can index their project photos.
 */
import { SITE_URL, PHOTO_PATH, SERVICES, CITIES } from "../_lib/site";
import { PHOTOS } from "../_lib/photos";

export const dynamic = "force-static";
export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const img = (id: string) => {
  const p = PHOTOS.find((x) => x.id === id);
  return p ? `    <image:image><image:loc>${SITE_URL}${PHOTO_PATH}/${id}-1600.webp</image:loc><image:caption>${esc(p.alt)}</image:caption></image:image>` : "";
};

const PAGES: { path: string; priority: number; images: string[] }[] = [
  { path: "/", priority: 1.0, images: ["p037", "p052", "p033", "p131", "p124", "p007"] },
  ...SERVICES.map((s) => ({ path: `/${s.slug}`, priority: 0.9, images: s.photos.slice(0, 20) })),
  { path: "/gallery", priority: 0.8, images: PHOTOS.filter((p) => p.cats[0] !== "people").map((p) => p.id) },
  ...CITIES.map((c) => ({ path: `/${c.slug}`, priority: 0.7, images: c.photos.slice(0, 3) })),
];

export function GET() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${p.priority.toFixed(1)}</priority>
${p.images.map(img).filter(Boolean).join("\n")}
  </url>`,
  ).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
