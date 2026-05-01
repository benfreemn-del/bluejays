/**
 * scripts/audit-inbound-leads.ts
 *
 * Pulls every prospect with source='inbound' and prints a structured
 * report: business name, category, current website, status, generated
 * preview URL, V2 reference URL, and a quick "what to look at" hint.
 *
 * Run with:
 *   npx tsx scripts/audit-inbound-leads.ts
 *
 * Output goes to stdout AND a file at /data/inbound-audit.json so
 * Claude can ingest it in the next conversation turn.
 *
 * No mutations — read-only. Safe to run any time.
 */

import fs from "fs";
import path from "path";

// Load .env.local manually (this script runs outside Next so env-loader doesn't fire)
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
    }
  }
}

import { createClient } from "@supabase/supabase-js";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

type ProspectRow = {
  id: string;
  business_name: string;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  category: string | null;
  current_website: string | null;
  status: string;
  source: string | null;
  generated_site_url: string | null;
  custom_site_url: string | null;
  pricing_tier: string | null;
  created_at: string;
  updated_at: string;
  scraped_data: Record<string, unknown> | null;
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  const sb = createClient(url, key);

  const { data, error } = await sb
    .from("prospects")
    .select("id, business_name, owner_name, email, phone, city, state, category, current_website, status, source, generated_site_url, custom_site_url, pricing_tier, created_at, updated_at, scraped_data")
    .eq("source", "inbound")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase query failed:", error.message);
    process.exit(1);
  }

  const rows = (data || []) as ProspectRow[];
  console.log(`\n📥 Found ${rows.length} inbound prospect${rows.length === 1 ? "" : "s"}\n`);
  console.log("=".repeat(80));

  const report: Array<Record<string, unknown>> = [];

  for (let i = 0; i < rows.length; i++) {
    const p = rows[i];
    const idx = i + 1;
    const arrived = new Date(p.created_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const previewUrl = p.pricing_tier === "custom" && p.custom_site_url
      ? p.custom_site_url
      : p.generated_site_url || `${SITE}/preview/${p.id}`;
    const v2Url = p.category ? `${SITE}/v2/${p.category}` : "(no category set)";
    const auditUrl = `${SITE}/audit?ref=ben`;

    console.log(`\n#${idx}  ${p.business_name}   [${p.status}]`);
    console.log(`     id: ${p.id}`);
    console.log(`     category: ${p.category || "(none)"}`);
    console.log(`     city/state: ${p.city || "?"}, ${p.state || "?"}`);
    console.log(`     pricing tier: ${p.pricing_tier || "(default)"}`);
    console.log(`     arrived: ${arrived} PT`);
    console.log(`     contact: ${p.owner_name || "(no owner)"} | ${p.email || "(no email)"} | ${p.phone || "(no phone)"}`);
    console.log(`     CURRENT website:  ${p.current_website || "(NONE — they didn't have one)"}`);
    console.log(`     OUR preview:      ${previewUrl}`);
    console.log(`     V2 reference:     ${v2Url}`);
    console.log(`     LEAD page:        ${SITE}/lead/${p.id}`);

    // Surface scraped_data hints — Claude uses these to spot what's
    // already known about the business vs what's missing.
    const sd = p.scraped_data || {};
    const hints: string[] = [];
    if (sd.tagline) hints.push(`tagline: "${sd.tagline}"`);
    if (sd.services && Array.isArray(sd.services)) hints.push(`${(sd.services as unknown[]).length} services scraped`);
    if (sd.testimonials && Array.isArray(sd.testimonials)) hints.push(`${(sd.testimonials as unknown[]).length} testimonials scraped`);
    if (sd.photos && Array.isArray(sd.photos)) hints.push(`${(sd.photos as unknown[]).length} photos scraped`);
    if (sd.imageMapping && (sd.imageMapping as Record<string, unknown>).selectionStatus === "completed") {
      hints.push("✓ images approved");
    }
    if (hints.length > 0) {
      console.log(`     scraped:          ${hints.join(" · ")}`);
    } else {
      console.log(`     scraped:          (no scraped_data populated — manual lead?)`);
    }

    report.push({
      idx,
      id: p.id,
      businessName: p.business_name,
      ownerName: p.owner_name,
      email: p.email,
      phone: p.phone,
      city: p.city,
      state: p.state,
      category: p.category,
      currentWebsite: p.current_website,
      status: p.status,
      pricingTier: p.pricing_tier,
      arrived: p.created_at,
      previewUrl,
      v2Url,
      auditUrl,
      leadUrl: `${SITE}/lead/${p.id}`,
      scrapedHints: hints,
    });
  }

  console.log("\n" + "=".repeat(80));
  console.log(`\nDone. Wrote ${rows.length} rows to data/inbound-audit.json`);

  // Persist for Claude to ingest
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
  fs.writeFileSync(
    path.join(process.cwd(), "data", "inbound-audit.json"),
    JSON.stringify(report, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
