import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { generatePreview } from "@/lib/generator";
import { scrapeWebsite } from "@/lib/scraper";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { error: "Prospect not found" },
      { status: 404 }
    );
  }

  try {
    // STEP 1: Auto-scrape if they have a website but no scraped data
    if (prospect.currentWebsite && (!prospect.scrapedData || !prospect.scrapedData.businessName)) {
      console.log(`  🌐 Auto-scraping ${prospect.businessName} before generating...`);
      try {
        const scraped = await scrapeWebsite(prospect.currentWebsite);
        if (scraped.businessName || scraped.services.length > 0) {
          prospect.scrapedData = {
            ...scraped,
            businessName: scraped.businessName || prospect.businessName,
            services: scraped.services.length > 0 ? scraped.services : [],
            testimonials: scraped.testimonials.length > 0 ? scraped.testimonials : [],
            photos: scraped.photos.length > 0 ? scraped.photos : [],
          };
          await updateProspect(id, {
            scrapedData: prospect.scrapedData,
            status: "scraped",
          });
          console.log(`  ✅ Scraped: ${scraped.services.length} services, ${scraped.testimonials.length} reviews, ${scraped.photos.length} photos`);
        }
      } catch (err) {
        console.log(`  ⚠️ Scrape failed: ${(err as Error).message} — generating with defaults`);
      }
    }

    // STEP 2: Generate the preview site using all available data
    const previewUrl = await generatePreview(prospect);

    return NextResponse.json({
      message: `Preview generated for ${prospect.businessName}`,
      previewUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
