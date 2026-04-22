/**
 * Swap gray accent colors on existing tattoo prospects with the new
 * crimson default from color-review.ts. Only touches prospects whose
 * current accentColor is a low-saturation gray — real scraped brand
 * colors are preserved.
 *
 * Dry-run: `npx tsx scripts/backfill-tattoo-accent.ts`
 * Apply:   `npx tsx scripts/backfill-tattoo-accent.ts --apply`
 */

import fs from "fs";
import path from "path";

// Minimal .env.local loader — tsx doesn't auto-load it like next dev does.
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  }
}

import { getAllProspects, updateProspect } from "../src/lib/store";
import { getBestColorForCategory } from "../src/lib/color-review";

function hexToSaturation(hex: string): number | null {
  if (!hex || typeof hex !== "string") return null;
  const match = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!match) return null;
  const n = parseInt(match[1], 16);
  const r = ((n >> 16) & 0xff) / 255;
  const g = ((n >> 8) & 0xff) / 255;
  const b = (n & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return Math.round((l > 0.5 ? d / (2 - max - min) : d / (max + min)) * 100);
}

function isGrayish(hex: string | undefined): boolean {
  if (!hex) return true;
  const s = hexToSaturation(hex);
  if (s === null) return false;
  return s < 15;
}

async function main() {
  const dryRun = !process.argv.includes("--apply");
  const newAccent = getBestColorForCategory("tattoo");
  const hasSupabaseUrl = !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log(`Supabase URL: ${hasSupabaseUrl ? "set" : "MISSING"}  |  key: ${hasSupabaseKey ? "set" : "MISSING"}`);

  const prospects = await getAllProspects();
  const byCategory = new Map<string, number>();
  for (const p of prospects) {
    byCategory.set(p.category, (byCategory.get(p.category) ?? 0) + 1);
  }
  console.log(`Total prospects: ${prospects.length}`);
  console.log(`By category: ${Array.from(byCategory.entries()).map(([c, n]) => `${c}=${n}`).join(", ") || "(none)"}\n`);

  const tattooProspects = prospects.filter((p) => p.category === "tattoo");

  const changes: { id: string; name: string; before: string; after: string }[] = [];
  let kept = 0;

  for (const p of tattooProspects) {
    const sd = p.scrapedData as Record<string, unknown> | undefined;
    const current = (sd?.accentColor as string | undefined) || (sd?.brandColor as string | undefined);

    if (!isGrayish(current)) {
      kept++;
      continue;
    }

    changes.push({
      id: p.id,
      name: p.businessName,
      before: current || "(none)",
      after: newAccent,
    });

    if (!dryRun) {
      await updateProspect(p.id, {
        scrapedData: {
          ...(sd || {}),
          accentColor: newAccent,
        } as typeof p.scrapedData,
      });
    }
  }

  console.log(`\nTattoo prospects: ${tattooProspects.length}`);
  console.log(`  Will update: ${changes.length}`);
  console.log(`  Kept (real brand color): ${kept}\n`);
  for (const c of changes) {
    console.log(`  ${c.name.padEnd(40)}  ${c.before.padEnd(10)} → ${c.after}`);
  }
  console.log(`\n${dryRun ? "[DRY RUN] Re-run with --apply to write." : "[APPLIED]"}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
