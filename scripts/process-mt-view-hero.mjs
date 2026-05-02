/**
 * One-off: process the new Mt View hero photo (tiered red-block retaining
 * walls + stairs on a hillside). Source PNG is 1.76MB and not optimized
 * for web. Steps:
 *
 *   1. Resize to 2500w max (retina-friendly, matches Squarespace's
 *      ?format=2500w convention used elsewhere on the page)
 *   2. Convert PNG → progressive JPEG at q=85 (smaller file, faster paint)
 *   3. Apply slight tonal correction (modulation) to match the cream/
 *      forest-green palette — saturate 0.95, brighten 1.02, contrast +0.02
 *   4. Strip metadata
 *
 * Run: node scripts/process-mt-view-hero.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "public", "clients", "mt-view-landscaping", "tiered-stairs-hillside.png");
const OUT = join(ROOT, "public", "clients", "mt-view-landscaping", "tiered-stairs-hero.jpg");

await sharp(SRC)
  .rotate() // honor EXIF orientation
  .resize({ width: 2500, withoutEnlargement: true, fastShrinkOnLoad: true })
  .modulate({
    brightness: 1.02,
    saturation: 0.95,
  })
  .linear(1.04, 0) // contrast bump (multiplier, offset)
  .jpeg({ quality: 85, progressive: true, mozjpeg: true })
  .withMetadata({})
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`Wrote ${OUT}`);
console.log(`  ${meta.width}x${meta.height}, ${meta.format}, ${(meta.size / 1024).toFixed(0)}KB`);
