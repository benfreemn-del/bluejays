import { scout } from "../src/lib/scout";
import { scrapeWebsite } from "../src/lib/scraper";
import { generatePreview } from "../src/lib/generator";
import { updateProspect } from "../src/lib/store";
import { CATEGORY_CONFIG } from "../src/lib/types";
import type { Category } from "../src/lib/types";

const VALID_CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];

async function main() {
  const args = process.argv.slice(2);
  const cityIndex = args.indexOf("--city");
  const categoryIndex = args.indexOf("--category");
  const limitIndex = args.indexOf("--limit");

  const city = cityIndex >= 0 ? args[cityIndex + 1] : "Austin, TX";
  const categoryArg = categoryIndex >= 0 ? args[categoryIndex + 1] : undefined;
  const limit = limitIndex >= 0 ? parseInt(args[limitIndex + 1]) : 5;

  const category = categoryArg as Category | undefined;
  if (category && !VALID_CATEGORIES.includes(category)) {
    console.error(
      `❌ Invalid category: "${category}". Valid: ${VALID_CATEGORIES.join(", ")}`
    );
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("🐦 BlueJays Pipeline");
  console.log("=".repeat(60));
  console.log(`City: ${city}`);
  console.log(`Category: ${category || "all"}`);
  console.log(`Limit: ${limit}`);
  console.log("=".repeat(60));

  // Step 1: Scout
  const categoriesToScout = category ? [category] : VALID_CATEGORIES;
  const allProspects = [];

  for (const cat of categoriesToScout) {
    const result = await scout({ city, category: cat, limit });
    allProspects.push(...result.prospects);
  }

  // Step 2: Scrape websites (for prospects that have one)
  console.log("\n📡 Scraping business websites...\n");
  for (const prospect of allProspects) {
    if (prospect.currentWebsite && !prospect.scrapedData) {
      try {
        const scraped = await scrapeWebsite(prospect.currentWebsite);
        // Merge scraped data with existing mock data
        if (scraped.businessName || scraped.services.length > 0) {
          const existing = prospect.scrapedData ?? { businessName: "", services: [], testimonials: [], photos: [] };
          prospect.scrapedData = {
            ...existing,
            ...scraped,
            businessName: scraped.businessName || existing.businessName || prospect.businessName,
            services: scraped.services.length > 0 ? scraped.services : existing.services,
            testimonials: scraped.testimonials.length > 0 ? scraped.testimonials : existing.testimonials,
            photos: scraped.photos.length > 0 ? scraped.photos : existing.photos,
          };
          updateProspect(prospect.id, {
            scrapedData: prospect.scrapedData,
            status: "scraped",
          });
        }
      } catch {
        console.log(`  ⚠️ Skipping scrape for ${prospect.businessName}`);
      }
    } else if (!prospect.currentWebsite) {
      console.log(`  ⏭️ ${prospect.businessName} — no website to scrape`);
    }
  }

  // Step 3: Generate preview sites
  console.log("\n🏗️ Generating preview sites...\n");
  const results = [];

  for (const prospect of allProspects) {
    const previewUrl = await generatePreview(prospect);
    results.push({ prospect, previewUrl });
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("✅ Pipeline Complete!");
  console.log("=".repeat(60));
  console.log(`\nGenerated ${results.length} preview sites:\n`);

  for (const { prospect, previewUrl } of results) {
    console.log(
      `  ${prospect.businessName} (${prospect.category})`
    );
    console.log(`    → http://localhost:3000${previewUrl}\n`);
  }

  console.log(
    'Start the dev server with "npm run dev" and visit the URLs above.'
  );
}

main().catch(console.error);
