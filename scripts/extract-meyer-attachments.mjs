import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

const sources = [
  ["C:/Users/BenFr/AppData/Local/Temp/4cd491b9-9ccd-4efd-9661-ed40375b4596.tmp", "C:/Users/BenFr/AppData/Local/Temp/meyer-attach-1.jpg"],
  ["C:/Users/BenFr/AppData/Local/Temp/25d6a760-3cbc-4ccc-93a6-8a96b4fb88f4.tmp", "C:/Users/BenFr/AppData/Local/Temp/meyer-attach-2.jpg"],
];

for (const [src, out] of sources) {
  const buf = readFileSync(src);
  const jpeg = await sharp(buf)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  writeFileSync(out, jpeg);
  const meta = await sharp(jpeg).metadata();
  console.log(`✓ ${out} ${meta.width}x${meta.height} ${jpeg.length} bytes`);
}
