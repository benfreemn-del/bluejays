/**
 * Fetches EVERY photo Google Places has for Meyer Electric LLC
 * (up to 10 — Google's cap on a single Details response) and stores
 * them as clean proxy-compatible URLs on the prospect's
 * scraped_data.photos, so Ben can pick which ones to use from the
 * image-mapper UI at /image-mapper/[id].
 *
 * Fixes three existing issues on Meyer:
 * 1. Only top-5 photos were saved (data-extractor caps at 5) — this
 *    pulls all 10.
 * 2. URLs had trailing "\n" corruption — stored cleanly here.
 * 3. URLs embedded the raw GOOGLE_API_KEY — stored without the key
 *    (image-proxy at /api/image-proxy appends it server-side).
 *
 * Invocation:
 *   npx tsx scripts/scrape-meyer-all-google-photos.ts
 *
 * Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *               GOOGLE_PLACES_API_KEY
 */
import fs from "fs";
import path from "path";

// Hand-roll the .env.local loader so env is populated BEFORE any
// module-level env reads downstream (see CLAUDE.md rule #13).
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GOOGLE_API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY — aborting.");
  process.exit(1);
}
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing Supabase credentials — aborting.");
  process.exit(1);
}

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!);

  // Step 1 — find Meyer Electric
  console.log("Looking up Meyer Electric prospect...");
  const { data: matches, error } = await supabase
    .from("prospects")
    .select("id,business_name,city,current_website,scraped_data,short_code,status")
    .ilike("business_name", "%meyer%");

  if (error) {
    console.error("Supabase query failed:", error);
    process.exit(1);
  }
  if (!matches || matches.length === 0) {
    console.error("No prospect matched 'meyer' in business_name.");
    process.exit(1);
  }

  // Prefer Meyer Electric LLC if multiple
  const meyer =
    matches.find((p) => /meyer\s*electric/i.test(p.business_name)) ||
    matches[0];

  console.log(`Found: ${meyer.business_name} [${meyer.id}]`);
  console.log(`  city=${meyer.city}  status=${meyer.status}  short_code=${meyer.short_code}`);
  const existingPhotos =
    ((meyer.scraped_data as Record<string, unknown>)?.photos as string[] | undefined) || [];
  console.log(`  existing scraped_data.photos: ${existingPhotos.length}`);
  existingPhotos.forEach((u, i) =>
    console.log(`    [${i}] ${u.replace(/\r?\n/g, "\\n").slice(0, 100)}`)
  );

  // Step 2 — resolve Google place_id via text search
  const query = `${meyer.business_name} in ${meyer.city || "Washington"}`;
  console.log(`\nSearching Google Places for: "${query}"`);
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query
  )}&key=${GOOGLE_API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (searchData.status !== "OK" || !searchData.results?.[0]) {
    console.error("Google Places textsearch failed:", searchData.status, searchData.error_message);
    process.exit(1);
  }

  const placeId = searchData.results[0].place_id as string;
  console.log(`  place_id = ${placeId}`);
  console.log(`  resolved name = ${searchData.results[0].name}`);

  // Step 3 — fetch Place Details with photos field
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,photos&key=${GOOGLE_API_KEY}`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  if (!detailsData.result?.photos) {
    console.error("No photos returned by Place Details. Status:", detailsData.status);
    process.exit(1);
  }

  const photos = detailsData.result.photos as Array<{
    photo_reference: string;
    height?: number;
    width?: number;
  }>;
  console.log(`\nGoogle returned ${photos.length} photo references.`);

  // Step 4 — build clean URLs (no API key embedded; proxy adds it)
  const cleanUrls = photos.map(
    (p) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${p.photo_reference}`
  );
  cleanUrls.forEach((u, i) => {
    const dims = photos[i].width && photos[i].height ? `${photos[i].width}x${photos[i].height}` : "?";
    console.log(`  [${i}] ${dims}  ${u.slice(0, 100)}...`);
  });

  // Step 5 — merge with existing non-Google photos (preserve anything
  // not from Google Maps, e.g. scraped website photos) and write back.
  // Also strip any trailing \n corruption from old entries.
  const cleanExisting = existingPhotos
    .map((u) => u.replace(/[\r\n]+/g, "").trim())
    .filter(
      (u) =>
        !u.includes("maps.googleapis.com") && // these get replaced fresh
        !u.startsWith("data:") && // base64 inline is QC-failure for gallery
        /^https?:\/\//.test(u) // only keep well-formed URLs
    );
  const merged = Array.from(new Set([...cleanUrls, ...cleanExisting]));
  console.log(
    `\nMerging: ${cleanUrls.length} new Google photos + ${cleanExisting.length} preserved = ${merged.length} total`
  );

  const updatedScrapedData = {
    ...(meyer.scraped_data as Record<string, unknown>),
    photos: merged,
    googlePlaceId: placeId, // persist for future re-scrapes
  };

  const { error: updateErr } = await supabase
    .from("prospects")
    .update({ scraped_data: updatedScrapedData })
    .eq("id", meyer.id);

  if (updateErr) {
    console.error("Failed to update prospect:", updateErr);
    process.exit(1);
  }

  console.log(`\n✓ Updated prospect ${meyer.id}`);
  console.log(`  scraped_data.photos now has ${merged.length} entries`);
  console.log(`  scraped_data.googlePlaceId saved for future re-scrapes`);
  console.log(
    `\nOpen image-mapper to pick: https://bluejayportfolio.com/image-mapper/${meyer.id}`
  );
  console.log(`Or local dev:            http://localhost:3000/image-mapper/${meyer.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
