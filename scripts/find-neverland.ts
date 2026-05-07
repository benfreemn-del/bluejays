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
  // Broader search — try multiple spellings + kids-clothing keywords
  const patterns = [
    "neverland",
    "nevarland",
    "never land",
    "never-land",
  ];

  const seen = new Set<string>();
  for (const pat of patterns) {
    const { data } = await sb
      .from("prospects")
      .select(
        "id, business_name, owner_name, email, phone, status, source, pricing_tier, custom_site_url, current_website, category, city, state, scraped_data, created_at",
      )
      .or(
        `business_name.ilike.%${pat}%,scraped_data->>businessName.ilike.%${pat}%,current_website.ilike.%${pat}%`,
      );
    if (data && data.length > 0) {
      console.log(`\n=== Pattern '${pat}' returned ${data.length} matches ===`);
      for (const p of data) {
        if (seen.has(p.id as string)) continue;
        seen.add(p.id as string);
        console.log(
          `  ${p.id}  ${p.business_name}  status=${p.status}  source=${p.source ?? "?"}  cat=${p.category ?? "?"}  ${p.city ?? "?"}, ${p.state ?? "?"}`,
        );
        if (p.current_website) console.log(`    site: ${p.current_website}`);
        if (p.email) console.log(`    email: ${p.email}`);
      }
    }
  }

  if (seen.size === 0) {
    console.log("No matches across any pattern. Searching last 20 inbound prospects:\n");
    const { data: inbounds } = await sb
      .from("prospects")
      .select(
        "id, business_name, email, phone, status, current_website, category, city, state, created_at",
      )
      .eq("source", "inbound")
      .order("created_at", { ascending: false })
      .limit(20);
    if (inbounds) {
      for (const p of inbounds) {
        console.log(
          `  ${p.created_at?.slice(0, 10)} ${p.business_name}  ${p.category ?? "?"}  ${p.city ?? "?"}, ${p.state ?? "?"}`,
        );
        if (p.current_website) console.log(`    site: ${p.current_website}`);
      }
    }
  } else {
    console.log(`\nTotal unique matches: ${seen.size}`);
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
