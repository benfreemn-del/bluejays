/**
 * One-shot: convert + optimize the two real Meyer Electric photos Ben
 * dropped in chat (saved as Windows screenshots in Downloads). Crops
 * the screenshot whitespace where present, downsizes to web-friendly
 * dimensions, encodes JPEG-82 mozjpeg.
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";

const outDir = "public/images/meyer-electric";
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const pairs = [
  // [src, out, maxWidth]
  // The 2-crew electrical panel photo — the main team-feature shot
  [
    "C:/Users/BenFr/Downloads/Screenshot 2026-05-06 180736.png",
    `${outDir}/team-crew-panel.jpg`,
    1400,
  ],
  // The Best-of-Olympic-Peninsula 2022 award — full-crew + trucks + award badge
  [
    "C:/Users/BenFr/Downloads/Screenshot 2026-05-06 180711.png",
    `${outDir}/team-award-2022.jpg`,
    1400,
  ],
];

for (const [src, out, maxW] of pairs) {
  if (!existsSync(src)) {
    console.log(`SKIP missing: ${src}`);
    continue;
  }
  const buf = readFileSync(src);
  const optimized = await sharp(buf)
    .resize({ width: maxW, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  writeFileSync(out, optimized);
  const meta = await sharp(optimized).metadata();
  console.log(
    `✓ ${out} ${meta.width}x${meta.height} ${(optimized.length / 1024).toFixed(0)}KB`,
  );
}
