import { canonicalizeCity } from "../src/lib/address-normalizer";
import { getAllProspects, updateProspect } from "../src/lib/store";
import type { Prospect } from "../src/lib/types";

interface BackfillResult {
  prospectId: string;
  businessName: string;
  beforeCity: string;
  afterCity: string;
  reason: string;
}

function resolveCanonicalCity(prospect: Prospect): string | undefined {
  return (
    canonicalizeCity(prospect.scrapedData?.city, prospect.scrapedData?.address) ||
    canonicalizeCity(prospect.city, prospect.address) ||
    canonicalizeCity(undefined, prospect.scrapedData?.address) ||
    canonicalizeCity(undefined, prospect.address)
  );
}

async function main() {
  const dryRun = !process.argv.includes("--apply");
  const prospects = await getAllProspects();
  const updates: BackfillResult[] = [];
  let unresolved = 0;

  for (const prospect of prospects) {
    const canonicalCity = resolveCanonicalCity(prospect);
    if (!canonicalCity) {
      unresolved += 1;
      continue;
    }

    const currentCity = (prospect.city || "").trim();
    const currentScrapedCity = (prospect.scrapedData?.city || "").trim();
    const needsProspectCityUpdate = currentCity !== canonicalCity;
    const needsScrapedCityUpdate = prospect.scrapedData && currentScrapedCity !== canonicalCity;

    if (!needsProspectCityUpdate && !needsScrapedCityUpdate) {
      continue;
    }

    updates.push({
      prospectId: prospect.id,
      businessName: prospect.businessName,
      beforeCity: currentCity || "(blank)",
      afterCity: canonicalCity,
      reason: prospect.scrapedData?.address ? "scrapedData.address" : "prospect.address",
    });

    if (!dryRun) {
      await updateProspect(prospect.id, {
        city: canonicalCity,
        scrapedData: prospect.scrapedData
          ? {
              ...prospect.scrapedData,
              city: canonicalCity,
            }
          : prospect.scrapedData,
      });
    }
  }

  console.log(`Checked ${prospects.length} prospects.`);
  console.log(`${updates.length} prospects ${dryRun ? "would be updated" : "updated"}.`);
  console.log(`${unresolved} prospects could not be resolved from stored addresses.`);

  if (updates.length > 0) {
    console.table(
      updates.slice(0, 25).map((update) => ({
        prospectId: update.prospectId,
        businessName: update.businessName,
        beforeCity: update.beforeCity,
        afterCity: update.afterCity,
        reason: update.reason,
      }))
    );

    if (updates.length > 25) {
      console.log(`...and ${updates.length - 25} additional updates.`);
    }
  }

  if (dryRun) {
    console.log("Dry run complete. Re-run with --apply to persist updates.");
  }
}

main().catch((error) => {
  console.error("City backfill failed:", error);
  process.exit(1);
});
