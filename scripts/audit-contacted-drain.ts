/**
 * Figure out why the Contacted and Approved tiles keep shrinking.
 * Prints: (1) current status distribution, (2) every transition logged
 * by the status-transition log today, grouped by from->to with counts,
 * and (3) the 20 most recent transitions with timestamps + business
 * names so we can tell who moved and when.
 */

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

  // 1. Current status distribution
  const { count: total } = await sb
    .from("prospects")
    .select("*", { count: "exact", head: true });

  const dist: Record<string, number> = {};
  let from = 0;
  while (true) {
    const { data: page } = await sb.from("prospects").select("status").range(from, from + 999);
    if (!page || page.length === 0) break;
    for (const r of page) dist[(r as { status: string }).status] = (dist[(r as { status: string }).status] ?? 0) + 1;
    if (page.length < 1000) break;
    from += 1000;
  }
  console.log(`\n═══ Current status distribution (total ${total}) ═══`);
  for (const [s, n] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${s.padEnd(22)} ${n}`);
  }

  // 2. Transitions today grouped
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { data: todayRows } = await sb
    .from("prospect_status_changes")
    .select("from_status,to_status,changed_at,business_name,source")
    .gte("changed_at", since.toISOString())
    .order("changed_at", { ascending: false });

  console.log(`\n═══ Transitions since ${since.toISOString().slice(0, 10)} 00:00 local (${todayRows?.length ?? 0} events) ═══`);
  const grouped = new Map<string, number>();
  for (const r of todayRows ?? []) {
    const row = r as { from_status: string | null; to_status: string };
    const key = `${row.from_status ?? "—"} → ${row.to_status}`;
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }
  for (const [key, count] of Array.from(grouped.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count.toString().padStart(4)} × ${key}`);
  }

  // 3. Last 7 days — useful if today's log is sparse
  const week = new Date();
  week.setDate(week.getDate() - 7);
  const { data: weekRows } = await sb
    .from("prospect_status_changes")
    .select("from_status,to_status")
    .gte("changed_at", week.toISOString());
  console.log(`\n═══ Transitions over last 7 days (${weekRows?.length ?? 0} events) ═══`);
  const weekGrouped = new Map<string, number>();
  for (const r of weekRows ?? []) {
    const row = r as { from_status: string | null; to_status: string };
    const key = `${row.from_status ?? "—"} → ${row.to_status}`;
    weekGrouped.set(key, (weekGrouped.get(key) ?? 0) + 1);
  }
  for (const [key, count] of Array.from(weekGrouped.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count.toString().padStart(4)} × ${key}`);
  }

  // 4. Recent detail — who moved?
  console.log(`\n═══ 20 most recent transitions ═══`);
  for (const r of (todayRows ?? []).slice(0, 20)) {
    const row = r as { from_status: string | null; to_status: string; changed_at: string; business_name: string | null; source: string | null };
    const when = new Date(row.changed_at).toLocaleTimeString();
    const biz = (row.business_name ?? "").slice(0, 35).padEnd(35);
    const from = (row.from_status ?? "—").padEnd(18);
    const src = row.source ?? "";
    console.log(`  ${when}  ${biz}  ${from} → ${row.to_status.padEnd(16)}  ${src}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
