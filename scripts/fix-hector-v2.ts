/**
 * Hector fix v2: drop the broken compound "Logo+Yard.jpg" logo, and
 * curate the photo list with images discovered on their actual /gallery
 * + service sub-pages (the scraper only got homepage/Google photos).
 *
 * Dry-run: npx tsx scripts/fix-hector-v2.ts
 * Apply:   npx tsx scripts/fix-hector-v2.ts --apply
 */

import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

import { createClient } from "@supabase/supabase-js";

const HECTOR_ID = "ad954c6f-c00e-45cc-9d45-59a13d19da8c";
const SQSP_BASE = "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b";

// Curated photo list — ordered by quality and intent.
// [0] = hero (big background), [1] = hero card, [2] = about,
// [3..10] = gallery grid. Named service files come first because
// they're the ones Hector's team chose to show on their own site.
const CURATED: { url: string; what: string }[] = [
  // Hero — best finished project with clear landscaping DNA
  { url: `${SQSP_BASE}/1567477339937-LY6F1JKFRWRDSLXUEX1O/hardscape-11.jpg`, what: "hardscape installation" },
  // Hero card — finished retaining wall close-up
  { url: `${SQSP_BASE}/1565058891162-OIS6MHJGI9ZH3JNJAJO1/retaining-wall1.jpg`, what: "retaining wall finished" },
  // About — wide lawn / outdoor view
  { url: `${SQSP_BASE}/1567477190007-T44NY9I44S0Z3307JUJC/lawn.jpg`, what: "finished lawn" },
  // Gallery — dated real project photos from their /gallery page
  { url: `${SQSP_BASE}/e821db9f-c0a7-450a-b7a0-0e67a0098def/Photo+Oct+06+2022%2C+4+56+30+PM.jpg`, what: "Oct 2022 project" },
  { url: `${SQSP_BASE}/366bffd1-20ae-49ef-be4f-10747ab0adc6/Photo+Dec+14+2022%2C+10+24+09+AM.jpg`, what: "Dec 2022 project" },
  { url: `${SQSP_BASE}/b984ab01-6efe-46f1-ae56-fc31e605fc89/Photo+Sep+09+2022%2C+2+49+02+PM.jpg`, what: "Sep 2022 project A" },
  { url: `${SQSP_BASE}/3ad7db31-09c6-4525-82e3-288033b2ffa7/Photo+Jul+27+2021%2C+2+34+23+PM.jpg`, what: "Jul 2021 project" },
  { url: `${SQSP_BASE}/e21eb5d8-1dbb-4c52-ab70-456921b0a94e/Photo+Jun+08+2021%2C+3+30+52+PM.jpg`, what: "Jun 2021 project A" },
  { url: `${SQSP_BASE}/d712359e-6f7c-4cef-a822-8ed7aaf1f1c7/Photo+Sep+09+2022%2C+2+18+44+PM.jpg`, what: "Sep 2022 project B" },
  { url: `${SQSP_BASE}/1565058968138-KH3QFNZWM7SKJ15M2006/lawn-sprinklers-service-img.png`, what: "lawn sprinklers" },
  { url: `${SQSP_BASE}/1567476997964-HPYD72R2J4QQUFMGM1J4/Building_a_Retaining_Wall_at_Home.jpg`, what: "retaining wall build" },
  { url: `${SQSP_BASE}/7dbf34e4-ce87-4042-97c9-246a04ed4b69/sod-installation-Optimized.jpg`, what: "sod installation" },
  { url: `${SQSP_BASE}/1565649028109-KYUS90CX0OWEKZ8MBI13/1409167815935.jpeg`, what: "landscape design example" },
  { url: `${SQSP_BASE}/09dc572e-278f-4736-a1c3-222e8e7f18ca/IMG-8192.jpg`, what: "portfolio photo" },
];

function proxy(url: string, id: string): string {
  const params = new URLSearchParams({ url, prospectId: id });
  return `/api/image-proxy?${params.toString()}`;
}

async function main() {
  const dryRun = !process.argv.includes("--apply");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: prospect } = await sb.from("prospects").select("*").eq("id", HECTOR_ID).single();
  const { data: siteRow } = await sb.from("generated_sites").select("*").eq("prospect_id", HECTOR_ID).single();
  if (!prospect || !siteRow) throw new Error("Hector not found");

  const sd = { ...(prospect.scraped_data || {}) } as Record<string, unknown>;
  const gd = { ...(siteRow.site_data || {}) } as Record<string, unknown>;

  const newPhotos = CURATED.map((p) => proxy(p.url, HECTOR_ID));
  sd.photos = newPhotos;
  gd.photos = newPhotos;

  // The "logoUrl" on file is actually a compound yard-photo-with-text-overlay
  // that looks terrible shrunk into a 36px nav. Remove it — the V2 landscaping
  // template's fallback (Tree icon + business name) is cleaner.
  delete gd.logoUrl;
  delete sd.logoUrl;

  // Report
  console.log("═".repeat(70));
  console.log("HECTOR v2 — curated photo reset + logo removal");
  console.log("═".repeat(70));
  console.log(`Photos: now ${newPhotos.length} curated in intentional order`);
  CURATED.forEach((p, i) => console.log(`  [${i}] ${p.what}`));
  console.log();
  console.log(`logoUrl: CLEARED (template falls back to Tree icon + business name)`);

  if (dryRun) {
    console.log("\n[DRY RUN] Re-run with --apply to write.");
    return;
  }

  const { error: pErr } = await sb.from("prospects").update({ scraped_data: sd }).eq("id", HECTOR_ID);
  if (pErr) throw pErr;
  const { error: gErr } = await sb.from("generated_sites").update({ site_data: gd }).eq("prospect_id", HECTOR_ID);
  if (gErr) throw gErr;
  console.log("\n[APPLIED] Hector is patched. Hard-reload the preview.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
