/**
 * One-off: dump every open task from client_tasks, grouped by client +
 * status. Run with `node scripts/dump-tasks.mjs` from the repo root —
 * it loads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Lightweight .env.local loader (no dotenv dependency)
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase creds in .env.local");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await sb
  .from("client_tasks")
  .select(
    "client_slug, title, description, status, priority, owner, category, notes, created_at",
  )
  .not("status", "in", "(done,wont-do)")
  .order("client_slug", { ascending: true })
  .order("priority", { ascending: true })
  .order("created_at", { ascending: false });

if (error) {
  console.error("Query failed:", error.message);
  process.exit(1);
}

const rows = data ?? [];
const byClient = new Map();
for (const r of rows) {
  if (!byClient.has(r.client_slug)) byClient.set(r.client_slug, []);
  byClient.get(r.client_slug).push(r);
}

console.log(`\n========= MASTER TO-DO · ${rows.length} open tasks =========\n`);
for (const [slug, list] of [...byClient.entries()].sort()) {
  const onBen = list.filter((t) => t.owner === "ben").length;
  const onClient = list.filter((t) => t.owner === "client").length;
  console.log(`### ${slug} · ${list.length} open (${onBen} ben · ${onClient} client)`);
  for (const t of list) {
    const flags = [
      t.priority !== "medium" && t.priority !== "low" ? `[${t.priority.toUpperCase()}]` : "",
      `[${t.status}]`,
      `[${t.owner}]`,
      t.category ? `(${t.category})` : "",
    ]
      .filter(Boolean)
      .join(" ");
    console.log(`  · ${flags}`);
    console.log(`    ${t.title}`);
    if (t.notes) console.log(`    📝 ${t.notes.slice(0, 200)}`);
  }
  console.log("");
}
