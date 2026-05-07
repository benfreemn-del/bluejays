/**
 * One-shot resize: shrink the Meyer Electric full-res photos to web-
 * appropriate dimensions so the repo doesn't carry 30MB of source JPEGs.
 * Run with: node scripts/resize-meyer-photos.mjs
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

const dir = "public/images/meyer-electric";
const targets = [
  // [source, output, maxWidth, quality]
  ["hero-powerwall-storm.jpg", "hero-powerwall-storm.jpg", 2000, 82],
  ["about-twilight-home.jpg", "about-twilight-home.jpg", 1600, 82],
  ["gallery-aerial-solar.jpg", "gallery-aerial-solar.jpg", 1400, 80],
  ["gallery-tesla-charger.jpg", "gallery-tesla-charger.jpg", 1400, 80],
  ["generator-install.jpg", "generator-install.jpg", 1200, 80],
];

for (const [src, out, maxW, q] of targets) {
  const inPath = join(dir, src);
  const outPath = join(dir, out + ".tmp");
  const finalPath = join(dir, out);
  if (!existsSync(inPath)) {
    console.log(`SKIP missing: ${inPath}`);
    continue;
  }
  // Sharp can't read+write the same file in one pass — output to .tmp
  // then mv to replace the original.
  const buf = await sharp(inPath)
    .resize({ width: maxW, withoutEnlargement: true })
    .jpeg({ quality: q, mozjpeg: true })
    .toBuffer();
  // Delete original first to dodge OneDrive sync lock, then write fresh.
  unlinkSync(inPath);
  writeFileSync(finalPath, buf);
  console.log(`✓ ${src}: ${(buf.length / 1024).toFixed(0)} KB`);
}

// Drop the small dupes + .png screenshot we don't need
for (const f of [
  "powerwall-hero.png",
  "powerwall-install-1.jpg",
  "powerwall-install-2.jpg",
  "underground-1.jpg",
  "underground-2.jpg",
]) {
  const p = join(dir, f);
  if (existsSync(p)) {
    unlinkSync(p);
    console.log(`✗ removed dupe: ${f}`);
  }
}
console.log("done.");
