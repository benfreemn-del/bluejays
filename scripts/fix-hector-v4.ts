/**
 * Hector v4 (attempt #3 at getting photos right).
 *
 * Every URL below was DOWNLOADED and VISUALLY INSPECTED against
 * hectorlandscaping.com. Each one is a real premium Hector project
 * photo — no architectural drawings, no stock chainsaw guys, no demo
 * rubble, no review-page banners, no low-res phone shots. If Ben
 * still sees anything weird in the preview after this, it's not in
 * this array.
 *
 * Ordering is intentional:
 *   [0] = hero background (biggest wow factor)
 *   [1] = hero card overlay
 *   [2] = about section
 *   [3..] = gallery grid in decreasing confidence
 *
 * Dry-run: npx tsx scripts/fix-hector-v4.ts
 * Apply:   npx tsx scripts/fix-hector-v4.ts --apply
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
const SQSP = "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b";

const CURATED: { url: string; what: string }[] = [
  // HERO: premium-grade large-format hero images
  { url: `${SQSP}/1567477339937-LY6F1JKFRWRDSLXUEX1O/hardscape-11.jpg`,                                     what: "hardscape: curved paver patio with fire pit" },
  { url: `${SQSP}/1567477157975-1T50QJCR20443AOBE924/68123f35b9641031fba4fa33f5d95329+%281%29.jpg`,        what: "backyard at dusk, lit beds + Japanese maple" },
  // ABOUT
  { url: `${SQSP}/1567477064017-WYM36TXYQVTAVMT045FC/maxresdefault.jpg`,                                    what: "backyard with dry creek landscaping" },
  // HARDSCAPING GALLERY (bricks + pavers — their strongest portfolio area)
  { url: `${SQSP}/1567472109602-G4P99NXLRBKGG89US7M3/brick1.PNG`,                                           what: "circular paver patio + fire pit" },
  { url: `${SQSP}/1567471481073-1MW9D768SGLBXCITI8X4/paver2.PNG`,                                           what: "paver patio + outdoor fireplace" },
  { url: `${SQSP}/1567472109131-EIDYS20LTHA5T36LHZVD/brick2.PNG`,                                           what: "paver driveway" },
  { url: `${SQSP}/1567472111007-FWU4BDK8EEYJN4VVGPTG/brick3.PNG`,                                           what: "paver pathway + curved lawn" },
  { url: `${SQSP}/1567471480808-J78224F71OX3SKTR56AH/paver1.PNG`,                                           what: "paver patio + artificial turf" },
  { url: `${SQSP}/1567471484506-II1PRTWCLXN28YR7B9IT/paver3.PNG`,                                           what: "modern rectangular paver walkway" },
  { url: `${SQSP}/1567471485624-RQN3BNDNFMFOEDPLLW3C/paver4.PNG`,                                           what: "warm tan paver patio" },
  { url: `${SQSP}/1672372571460-WIEFLCWJL6RYEFCRFFLE/R.jpeg`,                                               what: "paver walkway + boxwood + fire pit" },
  // RETAINING WALLS
  { url: `${SQSP}/1565058891162-OIS6MHJGI9ZH3JNJAJO1/retaining-wall1.jpg`,                                  what: "curved stone retaining wall" },
  { url: `${SQSP}/1567476997964-HPYD72R2J4QQUFMGM1J4/Building_a_Retaining_Wall_at_Home.jpg`,                what: "retaining wall with daffodils" },
  // MODERN STONE PATHWAYS
  { url: `${SQSP}/1672371741329-2LRC8980E8URYZJ8RGHQ/Photo+Dec+14+2022%2C+10+23+36+AM.jpg`,                 what: "pavers with river-rock border" },
  { url: `${SQSP}/1672371857664-RNVXY4XTDZIU5AFGPPZX/Photo+Dec+14+2022%2C+10+23+43+AM.jpg`,                 what: "stone pathway between houses" },
  { url: `${SQSP}/1672371909114-QJ3WAQXOO51Z7TBKA9V6/Photo+Dec+14+2022%2C+10+24+16+AM.jpg`,                 what: "stone pathway with topiaries" },
  { url: `${SQSP}/1672371476657-SPF2NUXX5LRGR85LFIV4/Photo+Dec+29+2022%2C+4+53+50+PM.jpg`,                  what: "pavers + lattice privacy screen + planters" },
  // STEPPING STONE PATHWAYS
  { url: `${SQSP}/366bffd1-20ae-49ef-be4f-10747ab0adc6/Photo+Dec+14+2022%2C+10+24+09+AM.jpg`,              what: "stepping stones in dark mulch" },
  { url: `${SQSP}/3ad7db31-09c6-4525-82e3-288033b2ffa7/Photo+Jul+27+2021%2C+2+34+23+PM.jpg`,              what: "stepping stone path with plantings" },
  { url: `${SQSP}/e21eb5d8-1dbb-4c52-ab70-456921b0a94e/Photo+Jun+08+2021%2C+3+30+52+PM.jpg`,              what: "stepping stones in mulch bed" },
  { url: `${SQSP}/1c1a47d7-39fc-4917-b830-182ff2a1b2ef/Photo+Jun+08+2021%2C+3+30+58+PM.jpg`,              what: "stepping stone pathway (angled view)" },
  // LAWN + OTHER SERVICES
  { url: `${SQSP}/1567477190007-T44NY9I44S0Z3307JUJC/lawn.jpg`,                                             what: "finished manicured lawn" },
  { url: `${SQSP}/1565060181745-I6F8GNMTUTDJW3SYYJNC/a81086567c2e8cc6564121c92e77a797.jpg`,                 what: "wood deck build" },
  { url: `${SQSP}/1565059027088-5T1D83B1HKJRNCNGJ69B/1861659.jpg`,                                          what: "lawn care: mower on fresh grass" },
  { url: `${SQSP}/7dbf34e4-ce87-4042-97c9-246a04ed4b69/sod-installation-Optimized.jpg`,                     what: "sod installation" },
];

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

  // Store RAW absolute URLs — PreviewContent's getValidatedPreviewPhotos
  // runs validateImageUrl on each, which calls new URL(sanitizedUrl) and
  // throws on relative /api/image-proxy paths. Rendering layer calls
  // proxyPhotos() to wrap them at the end. Pre-proxying here would get
  // every photo rejected as malformed and replaced with stock fallbacks.
  const photos = CURATED.map((p) => p.url);
  sd.photos = photos;
  gd.photos = photos;

  // Same deal for logoUrl.
  const LOGO_RAW = "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1564018868094-RPR549S5LI918CMW8EN9/Hector%2BLandscaping%2BLogo%2BYard.jpg?format=1500w";
  sd.logoUrl = LOGO_RAW;
  gd.logoUrl = LOGO_RAW;

  // Hide the Before/After section — our /images/landscaping-before-after.png
  // is a generic BlueJays placeholder, not a real Hector transformation pair.
  // Per CLAUDE.md, before/after must be a real matched transformation.
  gd.hideBeforeAfter = true;

  console.log("═".repeat(75));
  console.log(`HECTOR v4 — ${CURATED.length} visually-verified photos ONLY from his site`);
  console.log("═".repeat(75));
  CURATED.forEach((p, i) => console.log(`  [${String(i).padStart(2, " ")}] ${p.what}`));

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
