/**
 * Direct-DB backfill for prospects whose `city` column got polluted with
 * county-or-state-fragment values like "King, WA" / "Clallam, WA" /
 * "Pacific, WA" instead of the actual city ("Bellevue", "Port Angeles",
 * etc).
 *
 * Why this is a separate script from `backfill-prospect-cities.ts`:
 * `getAllProspects()` runs `canonicalizeCity()` at read-time inside
 * `dbToProspect()`, so the existing script never sees the broken value
 * persisted in Supabase — by the time it reads, the in-memory copy is
 * already corrected. This script bypasses the sanitizer and reads/writes
 * the raw row.
 *
 * Pattern matched: city matches /^[A-Z][a-z]+, [A-Z]{2}$/ — single
 * lowercase-ish word + comma + state code. Real cities don't end in
 * ", STATE" so this combination is always wrong.
 *
 * Run dry-run:    npx tsx scripts/backfill-bad-cities-direct.ts
 * Apply changes:  npx tsx scripts/backfill-bad-cities-direct.ts --apply
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { canonicalizeCity, extractCityFromAddress } from "../src/lib/address-normalizer";

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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key);

const SUSPICIOUS_CITY_RE = /^[A-Z][a-z]+, [A-Z]{2}$/;

interface RawRow {
  id: string;
  business_name: string;
  city: string | null;
  address: string | null;
  scraped_data: { address?: string; city?: string } | null;
}

async function fetchAll(): Promise<RawRow[]> {
  const PAGE = 1000;
  const all: RawRow[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("prospects")
      .select("id,business_name,city,address,scraped_data")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const rows = (data || []) as RawRow[];
    all.push(...rows);
    if (rows.length < PAGE) break;
    from += PAGE;
    if (from > 50000) break;
  }
  return all;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const rows = await fetchAll();
  console.log(`Scanned ${rows.length} prospects.`);

  const candidates = rows.filter((r) => SUSPICIOUS_CITY_RE.test((r.city || "").trim()));
  console.log(`${candidates.length} match the suspicious /^[A-Z][a-z]+, [A-Z]{2}$/ pattern.`);

  const updates: Array<{
    id: string;
    business_name: string;
    before: string;
    after: string;
    needs_scraped_update: boolean;
  }> = [];
  const unresolved: Array<{ id: string; business_name: string; city: string }> = [];

  for (const row of candidates) {
    const before = (row.city || "").trim();
    const fromAddress =
      extractCityFromAddress(row.scraped_data?.address) ||
      extractCityFromAddress(row.address) ||
      canonicalizeCity(undefined, row.scraped_data?.address) ||
      canonicalizeCity(undefined, row.address);

    if (!fromAddress || fromAddress === before) {
      unresolved.push({ id: row.id, business_name: row.business_name, city: before });
      continue;
    }

    updates.push({
      id: row.id,
      business_name: row.business_name,
      before,
      after: fromAddress,
      needs_scraped_update: !!row.scraped_data && row.scraped_data.city !== fromAddress,
    });

    if (apply) {
      const patch: Record<string, unknown> = { city: fromAddress };
      if (row.scraped_data) {
        patch.scraped_data = { ...row.scraped_data, city: fromAddress };
      }
      const { error } = await supabase.from("prospects").update(patch).eq("id", row.id);
      if (error) {
        console.error(`  Failed to update ${row.id} (${row.business_name}):`, error.message);
      }
    }
  }

  console.log();
  console.log(`${updates.length} prospects ${apply ? "updated" : "would be updated"}.`);
  console.log(`${unresolved.length} prospects could not be resolved (address didn't yield a different city).`);

  if (updates.length > 0) {
    console.table(
      updates.slice(0, 30).map((u) => ({
        id: u.id.slice(0, 8),
        business_name: u.business_name,
        before: u.before,
        after: u.after,
        scraped: u.needs_scraped_update ? "yes" : "no",
      })),
    );
    if (updates.length > 30) console.log(`...and ${updates.length - 30} more.`);
  }

  if (unresolved.length > 0) {
    console.log();
    console.log("Unresolved (need manual review):");
    console.table(
      unresolved.slice(0, 10).map((u) => ({
        id: u.id.slice(0, 8),
        business_name: u.business_name,
        city: u.city,
      })),
    );
  }

  if (!apply) {
    console.log();
    console.log("Dry run complete. Re-run with --apply to write to Supabase.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
