import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
    }
  }
}

import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const id = process.argv[2] || "ba91533d-8203-4a92-9ee2-23692e5340f1";
  const { data, error } = await sb
    .from("prospects")
    .select(
      "id, business_name, owner_name, email, phone, status, source, pricing_tier, manually_managed, scraped_data, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("ERROR:", error);
    process.exit(1);
  }
  if (!data) {
    console.error("NOT FOUND in prospects table");
    process.exit(1);
  }

  console.log("═".repeat(70));
  console.log("CUT-MY-AGENCY SMOKE TEST — verification");
  console.log("═".repeat(70));
  console.log(`ID:                ${data.id}`);
  console.log(`Business name:     ${data.business_name}`);
  console.log(`Owner name:        ${data.owner_name}`);
  console.log(`Email:             ${data.email}`);
  console.log(`Phone:             ${data.phone}`);
  console.log(`Status:            ${data.status}`);
  console.log(`Source:            ${data.source}`);
  console.log(`Pricing tier:      ${data.pricing_tier}`);
  console.log(`Manually managed:  ${data.manually_managed}`);
  console.log(`Created:           ${data.created_at}`);

  const sd = (data.scraped_data || {}) as Record<string, unknown>;
  const calc = sd.cutMyAgencyCalculator as Record<string, unknown> | undefined;

  console.log("\n=== Calculator payload (scraped_data.cutMyAgencyCalculator) ===");
  if (!calc) {
    console.log("❌ MISSING — cutMyAgencyCalculator block not in scraped_data");
  } else {
    console.log(JSON.stringify(calc, null, 2));
  }

  console.log("\n=== Top-level UTMs (in scraped_data root) ===");
  console.log(
    JSON.stringify(
      {
        utm_source: sd.utm_source,
        utm_medium: sd.utm_medium,
        utm_campaign: sd.utm_campaign,
        utm_term: sd.utm_term,
        utm_content: sd.utm_content,
      },
      null,
      2,
    ),
  );

  console.log("\n=== Audit checklist ===");
  const checks: Array<[string, boolean]> = [
    ["status === 'audit_lead'", data.status === "audit_lead"],
    ["source === 'inbound'", data.source === "inbound"],
    ["pricing_tier === 'fullsystem'", data.pricing_tier === "fullsystem"],
    ["manually_managed === false", data.manually_managed === false],
    ["email present", !!data.email],
    ["phone present", !!data.phone],
    ["calculator payload present", !!calc],
    ["utm_source === 'google'", sd.utm_source === "google"],
    ["utm_campaign === 'agency_replacement'", sd.utm_campaign === "agency_replacement"],
    ["math.savings present", !!(calc?.math as Record<string, unknown>)?.savings],
  ];
  for (const [name, ok] of checks) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}`);
  }
  const failed = checks.filter(([, ok]) => !ok).length;
  console.log(failed === 0 ? "\n✅ ALL CHECKS PASSED" : `\n⚠️  ${failed} check(s) failed`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
