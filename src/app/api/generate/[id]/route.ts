import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { generatePreview } from "@/lib/generator";
import { scrapeWebsite } from "@/lib/scraper";

// Increase timeout for this route (Vercel Pro: up to 300s, Hobby: 60s)
export const maxDuration = 60;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  try {
    // STEP 1: Always scrape if they have a website — customization is non-negotiable
    if (prospect.currentWebsite) {
      try {
        console.log(`  🔄 Scraping ${prospect.currentWebsite} for customization data...`);
        const scraped = await scrapeWebsite(prospect.currentWebsite);
        const hasData = scraped.businessName || scraped.services.length > 0 || scraped.phone || scraped.photos.length > 0;
        if (hasData) {
          prospect.scrapedData = {
            ...scraped,
            businessName: scraped.businessName || prospect.businessName,
          };
          await updateProspect(id, { scrapedData: prospect.scrapedData, status: "scraped" });
          console.log(`  ✅ Scrape successful — customization data loaded`);
        } else {
          console.log(`  ⚠️ Scrape returned no useful data — using scout data + defaults`);
        }
      } catch (scrapeErr) {
        console.log(`  ⚠️ Scrape failed: ${(scrapeErr as Error).message} — using scout data + defaults`);
      }
    }

    // STEP 2: Generate preview
    const previewUrl = await generatePreview(prospect);

    return NextResponse.json({
      message: `Preview generated for ${prospect.businessName}`,
      previewUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
