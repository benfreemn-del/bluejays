#!/usr/bin/env node
// @ts-check

/**
 * lookup-elite-place-id — one-shot helper to find Tyler Fritz's GBP
 * Place ID and write it into the `client_google_places` table so the
 * elite-hardscapes-and-landscapes review marquee starts pulling live
 * Google reviews.
 *
 * Why it's a script: the Place ID is a stable string that lives in
 * Tyler's Google Business Profile URL. We could ask Ben to paste it
 * manually, but the Places Text Search API does this lookup reliably
 * for $0 (Text Search is in Google's free tier up to ~10k calls/mo).
 *
 * Usage:
 *   node scripts/lookup-elite-place-id.mjs           # dry-run, prints id only
 *   node scripts/lookup-elite-place-id.mjs --write   # writes to Supabase
 *
 * Reads from .env.local: GOOGLE_PLACES_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY.
 *
 * If the script can't find a single confident match, it prints the top
 * 5 candidates with their addresses so Ben can paste the right one by
 * hand into the SQL UPDATE shown at the end.
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  try {
    const txt = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // optional
  }
}
loadEnv();

const SEARCH_QUERY = "Elite Hardscapes Landscaping Port Angeles WA";
const CLIENT_SLUG = "elite-hardscapes-and-landscapes";
const WRITE = process.argv.includes("--write");

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!GOOGLE_KEY) {
  console.error("✗ GOOGLE_PLACES_API_KEY missing from .env.local");
  process.exit(1);
}

const url =
  "https://maps.googleapis.com/maps/api/place/textsearch/json" +
  `?query=${encodeURIComponent(SEARCH_QUERY)}` +
  `&key=${GOOGLE_KEY}`;

console.log(`→ searching: ${SEARCH_QUERY}`);
const res = await fetch(url);
/** @type {{ status: string; results?: { place_id: string; name: string; formatted_address: string; rating?: number }[]; error_message?: string }} */
const data = await res.json();

if (data.status !== "OK") {
  console.error(`✗ Google returned ${data.status}: ${data.error_message ?? ""}`);
  process.exit(1);
}

const hits = data.results ?? [];
if (hits.length === 0) {
  console.error("✗ No results. Try refining SEARCH_QUERY in this script.");
  process.exit(1);
}

console.log(`\nTop ${Math.min(hits.length, 5)} candidates:\n`);
hits.slice(0, 5).forEach((h, i) => {
  console.log(`  [${i}] ${h.name}`);
  console.log(`      ${h.formatted_address}`);
  console.log(`      ${h.rating ? `★ ${h.rating}` : ""}  place_id=${h.place_id}\n`);
});

// Confidence: top hit if it contains "Port Angeles" in the address
const top = hits[0];
const confident =
  top.formatted_address.toLowerCase().includes("port angeles") ||
  top.formatted_address.toLowerCase().includes("sequim");

if (!confident) {
  console.log("⚠  Top hit doesn't look like Tyler's Peninsula listing.");
  console.log("   Paste the right place_id manually using the SQL below.\n");
}

console.log(`Resolved place_id: ${top.place_id}\n`);

if (!WRITE) {
  console.log("(dry-run — pass --write to update Supabase)\n");
  console.log("Manual SQL fallback (Supabase SQL Editor):");
  console.log(`
UPDATE client_google_places
SET place_id = '${top.place_id}', updated_at = NOW()
WHERE client_slug = '${CLIENT_SLUG}';
`);
  process.exit(0);
}

// Write via Supabase REST
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("✗ Supabase env not configured");
  process.exit(1);
}

const patchRes = await fetch(
  `${SUPABASE_URL}/rest/v1/client_google_places?client_slug=eq.${CLIENT_SLUG}`,
  {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ place_id: top.place_id, updated_at: new Date().toISOString() }),
  },
);
if (!patchRes.ok) {
  console.error(`✗ Supabase PATCH failed: ${patchRes.status} ${await patchRes.text()}`);
  process.exit(1);
}
console.log("✓ Wrote place_id to client_google_places");
console.log("✓ Marquee will refresh on next /api/clients/.../google-reviews call (1-hour cache)");
