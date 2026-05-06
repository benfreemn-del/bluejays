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

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await sb
    .from("prospects")
    .update({ custom_site_url: "https://lcautism-coalition.vercel.app" })
    .eq("id", "d20058f9-b874-4a8e-b742-c2e6e412ee56")
    .select("id, business_name, custom_site_url")
    .single();

  if (error) { console.error(error); process.exit(1); }
  console.log("Updated:", data);
}

main();
