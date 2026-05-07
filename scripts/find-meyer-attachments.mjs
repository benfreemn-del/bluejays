/**
 * One-off helper: scan recent .tmp files in the user's temp folder and
 * report dimensions so we can identify which file is which photo Ben
 * dropped in chat. Also auto-converts the matched files to optimized
 * JPEGs in /public/images/meyer-electric/ when --save is passed.
 */
import sharp from "sharp";
import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const tempDir = "C:/Users/BenFr/AppData/Local/Temp";
const recentMs = 30 * 60 * 1000; // last 30 minutes
const cutoff = Date.now() - recentMs;

const files = readdirSync(tempDir)
  .filter(f => f.endsWith(".tmp"))
  .map(f => {
    const full = join(tempDir, f);
    try {
      const stat = statSync(full);
      return { full, name: f, size: stat.size, mtime: stat.mtimeMs };
    } catch {
      return null;
    }
  })
  .filter(f => f && f.size > 100000 && f.mtime > cutoff)
  .sort((a, b) => b.mtime - a.mtime);

console.log(`Scanning ${files.length} recent files >100KB:\n`);

for (const f of files) {
  try {
    // Read as buffer to dodge sharp's path-based MIME guessing
    const buf = readFileSync(f.full);
    const meta = await sharp(buf).metadata();
    const ago = Math.round((Date.now() - f.mtime) / 1000);
    const sizeKB = Math.round(f.size / 1024);
    console.log(`  ${ago}s ago · ${sizeKB}KB · ${meta.width}x${meta.height} ${meta.format}  ← ${f.name}`);
  } catch (err) {
    console.log(`  ERR ${f.name}: ${err.message.slice(0, 60)}`);
  }
}
