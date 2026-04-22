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

import { getAllProspects, getScrapedData } from "../src/lib/store";

async function main() {
  const prospects = await getAllProspects();
  console.log(`Service role: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "yes" : "NO — using anon key, RLS filters apply"}`);
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`Service role key prefix: ${(process.env.SUPABASE_SERVICE_ROLE_KEY || "").slice(0, 20)}...`);
  console.log(`Total prospects returned: ${prospects.length}\n`);

  // Direct query bypassing any abstractions, to confirm
  const { createClient } = await import("@supabase/supabase-js");
  const direct = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { count: totalCount } = await direct.from("prospects").select("*", { count: "exact", head: true });
  const { count: landscapingCount } = await direct.from("prospects").select("*", { count: "exact", head: true }).eq("category", "landscaping");
  const { data: hector } = await direct.from("prospects").select("id,business_name,city,phone,category,current_website,short_code").ilike("business_name", "%hector%");
  console.log(`Direct count — total: ${totalCount}, landscaping: ${landscapingCount}`);
  console.log(`Direct Hector query: ${JSON.stringify(hector)}\n`);

  const renton = prospects.filter((p) =>
    [p.city, p.address, (p.scrapedData as Record<string, unknown>)?.city as string, (p.scrapedData as Record<string, unknown>)?.address as string]
      .some((v) => typeof v === "string" && v.toLowerCase().includes("renton"))
  );
  console.log(`Renton matches: ${renton.length}`);
  for (const p of renton) {
    console.log(`  ${p.businessName}  [${p.id.slice(0, 8)}]  ${p.city}`);
  }
  console.log("");

  const hectors = prospects.filter((p) =>
    (p.businessName || "").toLowerCase().includes("hector")
  );

  console.log(`All prospects (${prospects.length}):`);
  for (const p of prospects) {
    console.log(`  ${p.category.padEnd(14)}  ${p.businessName.padEnd(40)}  ${p.city || "?"}  [${p.id.slice(0, 8)}]`);
  }
  console.log("");

  console.log(`Found ${hectors.length} matches for "hector":\n`);
  for (const p of hectors) {
    console.log("─".repeat(80));
    console.log(`ID:        ${p.id}`);
    console.log(`Name:      ${p.businessName}`);
    console.log(`Category:  ${p.category}`);
    console.log(`City:      ${p.city}`);
    console.log(`Phone:     ${p.phone || "(none)"}`);
    console.log(`Email:     ${p.email || "(none)"}`);
    console.log(`Website:   ${p.currentWebsite || "(none)"}`);
    console.log(`Status:    ${p.status}`);
    console.log(`Theme:     selected=${p.selectedTheme} ai=${p.aiThemeRecommendation}`);

    const sd = (p.scrapedData as Record<string, unknown>) || {};
    console.log(`Tagline:   ${sd.tagline || "(none)"}`);
    console.log(`Accent:    ${sd.accentColor || "(none)"}`);
    console.log(`Brand col: ${sd.brandColor || "(none)"}`);
    console.log(`Logo URL:  ${sd.logoUrl || "(none)"}`);
    const photos = (sd.photos as string[] | undefined) || [];
    console.log(`Photos:    ${photos.length}`);
    photos.slice(0, 20).forEach((url, i) => console.log(`  [${i}] ${url.slice(0, 120)}`));
    const services = (sd.services as unknown[] | undefined) || [];
    console.log(`Services:  ${services.length}`);
    services.slice(0, 10).forEach((s, i) => {
      const obj = s as { name?: string; description?: string };
      console.log(`  [${i}] ${obj.name} — ${(obj.description || "").slice(0, 80)}`);
    });
    console.log(`About:     ${(sd.about as string || "").slice(0, 300)}`);

    const siteData = await getScrapedData(p.id);
    if (siteData) {
      console.log(`\n=== GENERATED siteData ===`);
      const gd = siteData as Record<string, unknown>;
      console.log(`  businessName:   ${gd.businessName}`);
      console.log(`  tagline:        ${gd.tagline}`);
      console.log(`  accentColor:    ${gd.accentColor}`);
      console.log(`  logoUrl:        ${gd.logoUrl}`);
      const genPhotos = (gd.photos as string[] | undefined) || [];
      console.log(`  photos:         ${genPhotos.length}`);
      genPhotos.slice(0, 20).forEach((url, i) => console.log(`    [${i}] ${url.slice(0, 120)}`));
      console.log(`  about:          ${(gd.about as string || "").slice(0, 300)}`);
    }
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
