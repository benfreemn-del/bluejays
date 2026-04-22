/**
 * Hector v3: restore logo (the compound-looking filename was actually a
 * clean HL monogram — verified visually). Will render in the new
 * white-nav path I just added to V2LandscapingPreview.
 *
 * Dry-run: npx tsx scripts/fix-hector-v3.ts
 * Apply:   npx tsx scripts/fix-hector-v3.ts --apply
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
const LOGO_RAW = "https://images.squarespace-cdn.com/content/v1/5d0c474ee10299000145e36b/1564018868094-RPR549S5LI918CMW8EN9/Hector%2BLandscaping%2BLogo%2BYard.jpg?format=1500w";
const LOGO_PROXIED = `/api/image-proxy?${new URLSearchParams({ url: LOGO_RAW, prospectId: HECTOR_ID }).toString()}`;

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

  sd.logoUrl = LOGO_PROXIED;
  gd.logoUrl = LOGO_PROXIED;

  console.log(`Setting logoUrl: ${LOGO_PROXIED.slice(0, 100)}...`);

  if (dryRun) {
    console.log("\n[DRY RUN] Re-run with --apply to write.");
    return;
  }

  await sb.from("prospects").update({ scraped_data: sd }).eq("id", HECTOR_ID);
  await sb.from("generated_sites").update({ site_data: gd }).eq("prospect_id", HECTOR_ID);
  console.log("\n[APPLIED]");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
