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

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: prospect, error: pErr } = await sb
    .from("prospects")
    .select("*")
    .eq("id", HECTOR_ID)
    .single();
  if (pErr) throw pErr;

  const { data: site, error: sErr } = await sb
    .from("generated_sites")
    .select("*")
    .eq("prospect_id", HECTOR_ID)
    .single();
  if (sErr && sErr.code !== "PGRST116") throw sErr;

  const sd = (prospect.scrapedData || prospect.scraped_data || {}) as Record<string, unknown>;
  const gd = (site?.site_data || {}) as Record<string, unknown>;

  console.log("═".repeat(80));
  console.log("HECTOR LANDSCAPING & DESIGN — full data dump");
  console.log("═".repeat(80));
  console.log(`Status:         ${prospect.status}`);
  console.log(`Phone:          ${prospect.phone}`);
  console.log(`Email:          ${prospect.email}`);
  console.log(`Address:        ${prospect.address}`);
  console.log(`City:           ${prospect.city}`);
  console.log(`Website:        ${prospect.current_website}`);
  console.log(`Rating:         ${prospect.google_rating} (${prospect.review_count} reviews)`);
  console.log(`Theme:          selected=${prospect.selected_theme}  ai=${prospect.ai_theme_recommendation}`);
  console.log(`Pricing tier:   ${prospect.pricing_tier}`);
  console.log(`Short code:     ${prospect.short_code || "(null)"}`);
  console.log(`QC score:       ${prospect.quality_score}`);
  console.log(`QC notes:       ${(prospect.quality_notes || "").slice(0, 300)}`);
  console.log(`Admin notes:    ${(prospect.admin_notes || "").slice(0, 300)}`);
  console.log();

  console.log("─ SCRAPED DATA ─".padEnd(80, "─"));
  console.log(`Business name:  ${sd.businessName}`);
  console.log(`Tagline:        ${sd.tagline}`);
  console.log(`About:          ${(sd.about as string || "").slice(0, 400)}`);
  console.log(`Accent color:   ${sd.accentColor}`);
  console.log(`Brand color:    ${sd.brandColor}  (source: ${sd.brandColorSource})`);
  console.log(`Logo URL:       ${sd.logoUrl}`);
  const photos = (sd.photos as string[] | undefined) || [];
  console.log(`Photos:         ${photos.length}`);
  photos.forEach((url, i) => console.log(`  [${i}] ${url.slice(0, 150)}`));
  const services = (sd.services as unknown[] | undefined) || [];
  console.log(`Services:       ${services.length}`);
  services.forEach((s, i) => {
    const obj = s as { name?: string; description?: string };
    console.log(`  [${i}] ${obj.name}`);
    if (obj.description) console.log(`       ${obj.description.slice(0, 150)}`);
  });
  console.log(`Instagram:      ${sd.instagramHandle}`);
  console.log(`Facebook:       ${sd.facebookUrl}`);
  console.log();

  if (site) {
    console.log("─ GENERATED site_data ─".padEnd(80, "─"));
    console.log(`Business name:  ${gd.businessName}`);
    console.log(`Tagline:        ${gd.tagline}`);
    console.log(`About:          ${(gd.about as string || "").slice(0, 400)}`);
    console.log(`Accent color:   ${gd.accentColor}`);
    console.log(`Logo URL:       ${gd.logoUrl}`);
    const genPhotos = (gd.photos as string[] | undefined) || [];
    console.log(`Photos used:    ${genPhotos.length}`);
    genPhotos.forEach((url, i) => console.log(`  [${i}] ${url.slice(0, 150)}`));
    const genServices = (gd.services as unknown[] | undefined) || [];
    console.log(`Services:       ${genServices.length}`);
    genServices.forEach((s, i) => {
      const obj = s as { name?: string; description?: string };
      console.log(`  [${i}] ${obj.name}`);
      if (obj.description) console.log(`       ${obj.description.slice(0, 150)}`);
    });
    console.log(`Stats:          ${JSON.stringify(gd.stats || {})}`);
    console.log(`Image mapping:  ${(sd.imageMapping as Record<string, unknown>)?.selectionStatus || "(none)"}`);
    console.log(`Font override:  ${JSON.stringify(sd.fontOverride || null)}`);
  } else {
    console.log("NO generated_sites row for this prospect.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
