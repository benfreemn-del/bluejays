import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const PAGE = 1000;
  const all: { id: string; business_name: string; city: string; address: string; state: string }[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("prospects")
      .select("id,business_name,city,address,state")
      .range(from, from + PAGE - 1);
    if (error) {
      console.error("Query failed:", error);
      process.exit(1);
    }
    const rows = (data || []) as typeof all;
    all.push(...rows);
    if (rows.length < PAGE) break;
    from += PAGE;
    if (from > 50000) break;
  }

  const rows = all;
  const suspicious = rows.filter((r) => /^[A-Z][a-z]+, [A-Z]{2}$/.test((r.city || "").trim()));

  console.log(`Fetched ${rows.length} rows where city ends in ", STATE".`);
  console.log(`${suspicious.length} match the strict suspicious pattern /^[A-Z][a-z]+, [A-Z]{2}$/.`);
  console.log();
  console.table(
    suspicious.slice(0, 25).map((r) => ({
      id: r.id.slice(0, 8),
      business_name: r.business_name,
      city: r.city,
      address: (r.address || "").slice(0, 80),
      state: r.state,
    }))
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
