/**
 * One-shot fixer for Hector Landscaping & Design.
 * Applies the fixes listed in the full-scale review:
 *   1. Photos: remove logo-as-hero, screenshot, decorative green line, stock image
 *   2. Photos: proxy expiring Google Places + Squarespace URLs
 *   3. Generated site_data.logoUrl: set to the real scraped logo
 *   4. Generated site_data.heroTagline: short hero line
 *   5. Prospect.selected_theme: flip to "dark" so native dark landscaping theme shows
 *   6. Corrected stats in site_data
 *   7. scrapedData.brandColorSource: "official-site"
 *   8. Backfill short_code
 *
 * Dry-run:  npx tsx scripts/fix-hector.ts
 * Apply:    npx tsx scripts/fix-hector.ts --apply
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

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

const JUNK_PATTERNS = [
  /Logo/i,              // photo[0]: Hector logo used as hero photo
  /Screenshot/i,        // photo[10]: desktop screenshot PNG
  /Green-Line-PNG/i,    // photo[11]: decorative line separator
  /YM-Landscape-Inc/i,  // photo[12]: random non-Hector stock image
];

function isJunkPhoto(url: string): boolean {
  return JUNK_PATTERNS.some((re) => re.test(url));
}

function proxyIfExpiring(url: string, prospectId: string): string {
  if (!url || url.startsWith("/api/image-proxy")) return url;
  // Expiring CDN hosts per CLAUDE.md — proxy through /api/image-proxy
  const expiringHosts = ["maps.googleapis.com", "squarespace-cdn.com"];
  let host = "";
  try { host = new URL(url).hostname; } catch { return url; }
  if (!expiringHosts.some((h) => host.includes(h))) return url;
  const params = new URLSearchParams({ url, prospectId });
  return `/api/image-proxy?${params.toString()}`;
}

async function main() {
  const dryRun = !process.argv.includes("--apply");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: prospect } = await sb
    .from("prospects")
    .select("*")
    .eq("id", HECTOR_ID)
    .single();
  if (!prospect) throw new Error("Hector prospect not found");

  const { data: siteRow } = await sb
    .from("generated_sites")
    .select("*")
    .eq("prospect_id", HECTOR_ID)
    .single();
  if (!siteRow) throw new Error("generated_sites row not found");

  const sd = { ...(prospect.scraped_data || {}) } as Record<string, unknown>;
  const gd = { ...(siteRow.site_data || {}) } as Record<string, unknown>;

  // 1 + 2: filter + proxy photos (applied to both scraped_data and site_data)
  const rawPhotos = (sd.photos as string[] | undefined) || [];
  const cleanedPhotos = rawPhotos
    .filter((url) => !isJunkPhoto(url))
    .map((url) => proxyIfExpiring(url, HECTOR_ID));
  const photosBefore = rawPhotos.length;
  const photosAfter = cleanedPhotos.length;
  sd.photos = cleanedPhotos;
  gd.photos = cleanedPhotos;

  // 3: logoUrl on generated site_data
  const logoUrl = sd.logoUrl as string | undefined;
  const proxiedLogo = logoUrl ? proxyIfExpiring(logoUrl, HECTOR_ID) : undefined;
  gd.logoUrl = proxiedLogo;
  sd.logoUrl = proxiedLogo;

  // 4: short hero tagline (stored as heroTagline so the preserved long
  // tagline stays for SEO / meta use but the hero shows the short version)
  gd.heroTagline = "Transforming Renton yards for 20 years.";

  // 6: corrected stats
  gd.stats = [
    { label: "Years in Business", value: "20+" },
    { label: "Cities Served", value: "21" },
    { label: "Licensed & Insured", value: "Yes" },
    { label: "Free Estimates", value: "Always" },
  ];

  // 7: brand color source
  if (!sd.brandColorSource) sd.brandColorSource = "official-site";

  // 5 + 8: prospect-level updates
  const prospectUpdates: Record<string, unknown> = {
    selected_theme: "dark",
  };
  if (!prospect.short_code) {
    prospectUpdates.short_code = crypto
      .createHash("md5")
      .update(HECTOR_ID)
      .digest("hex")
      .slice(0, 8);
  }
  prospectUpdates.scraped_data = sd;

  // Report
  console.log("═".repeat(70));
  console.log("HECTOR FIXER — changes queued:");
  console.log("═".repeat(70));
  console.log(`Photos: ${photosBefore} → ${photosAfter} (${photosBefore - photosAfter} removed)`);
  console.log(`Logo (site_data.logoUrl): ${gd.logoUrl ? "SET" : "unchanged"}`);
  console.log(`heroTagline: ${gd.heroTagline}`);
  console.log(`selected_theme: ${prospect.selected_theme || "(null)"} → dark`);
  console.log(`short_code: ${prospect.short_code || "(null)"} → ${prospectUpdates.short_code || "(kept)"}`);
  console.log(`brandColorSource: ${(sd.brandColorSource as string)}`);
  console.log(`stats: 4 values corrected (20+ years, 21 cities, L&I, free estimates)`);
  console.log();

  if (dryRun) {
    console.log("[DRY RUN] Re-run with --apply to write.");
    console.log("\nFinal photos that will be kept:");
    cleanedPhotos.forEach((url, i) => console.log(`  [${i}] ${url.slice(0, 130)}`));
    return;
  }

  const { error: pErr } = await sb
    .from("prospects")
    .update(prospectUpdates)
    .eq("id", HECTOR_ID);
  if (pErr) throw pErr;

  const { error: gErr } = await sb
    .from("generated_sites")
    .update({ site_data: gd })
    .eq("prospect_id", HECTOR_ID);
  if (gErr) throw gErr;

  console.log("[APPLIED] Hector is patched. Reload the preview to see changes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
