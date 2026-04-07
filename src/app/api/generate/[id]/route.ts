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
    // STEP 1: Quick scrape (5s timeout) if they have a website
    if (prospect.currentWebsite && (!prospect.scrapedData || !prospect.scrapedData.businessName)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(prospect.currentWebsite, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          const scraped = await scrapeWebsite(prospect.currentWebsite);
          if (scraped.businessName || scraped.services.length > 0) {
            prospect.scrapedData = {
              ...scraped,
              businessName: scraped.businessName || prospect.businessName,
              services: scraped.services.length > 0 ? scraped.services : [],
              testimonials: scraped.testimonials.length > 0 ? scraped.testimonials : [],
              photos: scraped.photos.length > 0 ? scraped.photos : [],
            };
            await updateProspect(id, { scrapedData: prospect.scrapedData, status: "scraped" });
          }
        }
      } catch {
        // Scrape failed or timed out — continue with defaults
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
