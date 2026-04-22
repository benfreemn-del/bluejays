/**
 * Swap gray accent colors on existing tattoo prospects with the new
 * crimson default from color-review.ts. Only touches prospects whose
 * current accentColor is a low-saturation gray — real scraped brand
 * colors are preserved.
 *
 * Dry-run: `npx tsx scripts/backfill-tattoo-accent.ts`
 * Apply:   `npx tsx scripts/backfill-tattoo-accent.ts --apply`
 */

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
  const prospects = await getAllProspects();
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
