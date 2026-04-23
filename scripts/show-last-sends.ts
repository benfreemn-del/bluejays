/**
 * Dump the last N emails from the `emails` table with their full bodies.
 * SendGrid's activity log shows metadata only; this pulls what was
 * actually sent so you can read exactly what the prospect got.
 *
 *   npx tsx scripts/show-last-sends.ts          # last 5
 *   npx tsx scripts/show-last-sends.ts 20       # last 20
 */

import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const c = fs.readFileSync(envPath, "utf-8");
  for (const line of c.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

import { createClient } from "@supabase/supabase-js";

async function main() {
  const limit = parseInt(process.argv[2] || "5", 10);
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await sb
    .from("emails")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    process.exit(1);
  }

  for (const row of (data ?? []).reverse()) {
    const r = row as Record<string, unknown>;
    console.log("═".repeat(78));
    console.log(`To:       ${r.to_address ?? r.to ?? "(missing)"}`);
    console.log(`From:     ${r.from_address ?? r.from ?? "(missing)"}`);
    console.log(`Subject:  ${r.subject}`);
    console.log(`Sent:     ${r.sent_at}`);
    console.log(`Method:   ${r.method ?? "(unset)"}`);
    console.log(`Sequence: ${r.sequence}`);
    console.log("─".repeat(78));
    console.log(r.body);
    console.log();
  }

  console.log(`(${(data ?? []).length} emails shown)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
