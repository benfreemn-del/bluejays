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
  // Match any prospect inserted with the smoketest marker email pattern
  // (ben+cma-smoketest-<unix-ts>@bluejayportfolio.com). Keeps the prod
  // dashboard clean.
  const { data, error } = await sb
    .from("prospects")
    .select("id, business_name, email, created_at")
    .like("email", "ben+cma-smoketest-%@bluejayportfolio.com");

  if (error) {
    console.error("ERROR:", error);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.log("No smoketest rows to delete.");
    return;
  }

  console.log(`Found ${data.length} smoketest row(s):`);
  for (const r of data) {
    console.log(`  ${r.id}  ${r.email}  ${r.created_at}`);
  }

  const ids = data.map((r) => r.id as string);
  const { error: delErr } = await sb.from("prospects").delete().in("id", ids);
  if (delErr) {
    console.error("DELETE ERROR:", delErr);
    process.exit(1);
  }
  console.log(`\n✅ Deleted ${ids.length} smoketest row(s).`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
