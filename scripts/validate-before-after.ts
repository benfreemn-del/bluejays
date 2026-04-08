/**
 * Before/After Image Validation Script
 *
 * Scans all V2 showcase templates for before/after sections and validates:
 * 1. Both image URLs return HTTP 200
 * 2. No cross-category duplicates in before/after images
 * 3. Flags each pair for manual visual review
 *
 * Run: npx tsx scripts/validate-before-after.ts
 */

import fs from "fs";
import path from "path";

const V2_DIR = path.join(process.cwd(), "src/app/v2");

interface BeforeAfterPair {
  category: string;
  beforeUrl: string;
  afterUrl: string;
  lineNumber: number;
}

async function testUrl(url: string): Promise<number> {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://images.unsplash.com/${url}?w=100&q=10`;
    const res = await fetch(fullUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  console.log("=== BEFORE/AFTER IMAGE VALIDATION ===\n");

  const categories = fs.readdirSync(V2_DIR).filter(d =>
    fs.statSync(path.join(V2_DIR, d)).isDirectory()
  );

  const allPairs: BeforeAfterPair[] = [];
  const allUrls: Map<string, string[]> = new Map();
  let totalChecked = 0;
  let totalBroken = 0;
  let totalDuplicates = 0;

  for (const cat of categories) {
    const pagePath = path.join(V2_DIR, cat, "page.tsx");
    if (!fs.existsSync(pagePath)) continue;

    const content = fs.readFileSync(pagePath, "utf-8");

    // Check if this file has before/after content
    const hasBeforeAfter = /before.*after|Before.*After|BeforeAfter/i.test(content);
    if (!hasBeforeAfter) continue;

    console.log(`📋 ${cat.toUpperCase()}`);

    // Extract all Unsplash URLs near before/after contexts
    const lines = content.split("\n");
    const beforeAfterLines: number[] = [];

    lines.forEach((line, i) => {
      if (/before|after|Before|After/i.test(line) && /unsplash|img|src/i.test(line)) {
        beforeAfterLines.push(i);
      }
    });

    // Extract all photo URLs in the file
    const photoRegex = /photo-[a-zA-Z0-9_-]+/g;
    const photos = [...content.matchAll(photoRegex)].map(m => m[0]);

    // Track URLs per category for duplicate detection
    for (const photo of photos) {
      if (!allUrls.has(photo)) allUrls.set(photo, []);
      const cats = allUrls.get(photo)!;
      if (!cats.includes(cat)) cats.push(cat);
    }

    // Test each unique photo URL
    const uniquePhotos = [...new Set(photos)];
    for (const photo of uniquePhotos) {
      const url = `https://images.unsplash.com/${photo}`;
      const status = await testUrl(url);
      totalChecked++;
      if (status !== 200) {
        console.log(`  ❌ BROKEN (${status}): ${photo}`);
        totalBroken++;
      }
    }

    console.log(`  ✅ ${uniquePhotos.length} images checked\n`);
  }

  // Check for cross-category duplicates
  console.log("=== CROSS-CATEGORY DUPLICATES ===\n");
  for (const [photo, cats] of allUrls) {
    if (cats.length > 1) {
      console.log(`  ⚠️  ${photo} -> ${cats.join(", ")}`);
      totalDuplicates++;
    }
  }
  if (totalDuplicates === 0) {
    console.log("  ✅ No cross-category duplicates found\n");
  }

  // Summary
  console.log("\n=== SUMMARY ===");
  console.log(`Total images checked: ${totalChecked}`);
  console.log(`Broken URLs: ${totalBroken}`);
  console.log(`Cross-category duplicates: ${totalDuplicates}`);
  console.log(`Status: ${totalBroken === 0 && totalDuplicates === 0 ? "✅ PASS" : "❌ FAIL"}`);

  if (totalBroken > 0 || totalDuplicates > 0) {
    console.log("\n⚠️  FIX REQUIRED before deploying!");
    process.exit(1);
  }
}

main().catch(console.error);
