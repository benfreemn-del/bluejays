import fs from "fs";
import path from "path";

// Load .env.local before importing supabase client
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

import { createClient } from "@supabase/supabase-js";

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  console.log("═".repeat(80));
  console.log("LEWIS COUNTY AUTISM COALITION — leads-table connectivity check");
  console.log("═".repeat(80));

  // Search for any prospect matching LCAC by name
  const { data: matches, error: searchErr } = await sb
    .from("prospects")
    .select("id, business_name, status, pricing_tier, manually_managed, custom_site_url, email, phone, city, state, address, mgmt_subscription_id, paid_at, short_code, source, funnel_paused, scraped_data")
    .or("business_name.ilike.%lewis county%,business_name.ilike.%LCAC%,custom_site_url.ilike.%lcautism%");

  if (searchErr) {
    console.error("ERROR querying prospects:", searchErr);
    process.exit(1);
  }

  if (!matches || matches.length === 0) {
    console.log("\n❌ NO PROSPECT FOUND for Lewis County Autism Coalition.");
    console.log("\nWill need to CREATE the prospect row. Suggested fields:");
    console.log("  business_name:    Lewis County Autism Coalition");
    console.log("  category:         medical (or pet-services? — closest fit)");
    console.log("  status:           paid");
    console.log("  pricing_tier:     custom");
    console.log("  manually_managed: true");
    console.log("  custom_site_url:  https://www.lcautism.org");
    console.log("  email:            info@lcautism.org");
    console.log("  phone:            (360) 644-5222");
    console.log("  city:             Napavine");
    console.log("  state:            WA");
    console.log("  address:          375 Linhart Ave NE, Suite B, Napavine, WA 98565");
    console.log("  source:           inbound (referral / direct)");
    process.exit(0);
  }

  console.log(`\n✅ Found ${matches.length} matching row(s):\n`);

  for (const p of matches) {
    console.log("─".repeat(80));
    console.log(`ID:              ${p.id}`);
    console.log(`Business name:   ${p.business_name}`);
    console.log(`Status:          ${p.status}`);
    console.log(`Pricing tier:    ${p.pricing_tier ?? "(null)"}`);
    console.log(`Manually mgd:    ${p.manually_managed ?? "(null)"}`);
    console.log(`Source:          ${p.source ?? "(null)"}`);
    console.log(`Funnel paused:   ${p.funnel_paused ?? "(null)"}`);
    console.log(`Custom site URL: ${p.custom_site_url ?? "(null)"}`);
    console.log(`Email:           ${p.email ?? "(null)"}`);
    console.log(`Phone:           ${p.phone ?? "(null)"}`);
    console.log(`City / State:    ${p.city ?? "(null)"} / ${p.state ?? "(null)"}`);
    console.log(`Address:         ${p.address ?? "(null)"}`);
    console.log(`Mgmt sub ID:     ${p.mgmt_subscription_id ?? "(null)"}`);
    console.log(`Paid at:         ${p.paid_at ?? "(null)"}`);
    console.log(`Short code:      ${p.short_code ?? "(null)"}`);

    // Check what scraped_data has
    const sd = (p.scraped_data || {}) as Record<string, unknown>;
    if (Object.keys(sd).length > 0) {
      console.log(`Scraped data keys: ${Object.keys(sd).join(", ")}`);
    }
  }

  // Audit checklist
  console.log("\n" + "═".repeat(80));
  console.log("AUDIT — does this prospect look right for LCAC?");
  console.log("═".repeat(80));
  const p = matches[0];
  const issues: string[] = [];

  if (p.status !== "paid") issues.push(`status should be 'paid' (currently '${p.status}')`);
  if (p.pricing_tier !== "custom") issues.push(`pricing_tier should be 'custom' (currently '${p.pricing_tier}')`);
  if (!p.manually_managed) issues.push(`manually_managed should be true (currently ${p.manually_managed})`);
  if (!p.custom_site_url || !p.custom_site_url.includes("lcautism")) {
    issues.push(`custom_site_url should be https://www.lcautism.org (currently '${p.custom_site_url}')`);
  }
  if (!p.email) issues.push(`email is empty — should be info@lcautism.org`);
  if (!p.phone) issues.push(`phone is empty — should be (360) 644-5222`);
  if (!p.city) issues.push(`city is empty — should be Napavine`);
  if (!p.state) issues.push(`state is empty — should be WA`);
  if (!p.mgmt_subscription_id) issues.push(`mgmt_subscription_id is null — Stripe sub not linked`);

  if (issues.length === 0) {
    console.log("\n✅ All fields look correct. LCAC is properly connected to the leads table.");
  } else {
    console.log(`\n⚠️  ${issues.length} issue(s) found:\n`);
    for (const issue of issues) console.log(`  - ${issue}`);
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
