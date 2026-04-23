import { v4 as uuidv4 } from "uuid";
import type { Prospect } from "@/lib/types";
import { addProspect } from "@/lib/store";
import { scrapeWebsite } from "@/lib/scraper";
import { generatePreview } from "@/lib/generator";

async function main() {
  const now = new Date().toISOString();
  const id = uuidv4();
  
  const prospect: Prospect = {
    id,
    businessName: "Hector Landscaping & Design",
    ownerName: "Hector",
    phone: "(206) 681-3877",
    email: "hectorlandscapingonline@gmail.com",
    address: "1408 Index Ave NE, Renton, WA 98056",
    city: "Renton",
    state: "WA",
    category: "landscaping",
    currentWebsite: "https://www.hectorlandscaping.com",
    estimatedRevenueTier: "medium",
    status: "scouted",
    createdAt: now,
    updatedAt: now,
  };

  console.log("Adding prospect:", id);
  
  // Scrape website
  try {
    console.log("Scraping website...");
    const scraped = await scrapeWebsite("https://www.hectorlandscaping.com");
    prospect.scrapedData = scraped;
    prospect.status = "scraped";
    if (!prospect.phone && scraped.phone) prospect.phone = scraped.phone;
    console.log("Scraped photos:", scraped.photos?.length || 0);
    console.log("Scraped brandColor:", scraped.brandColor);
  } catch (e) {
    console.log("Scrape failed:", e);
  }

  await addProspect(prospect);
  console.log("Prospect saved:", prospect.id);
  
  // Generate preview
  try {
    console.log("Generating preview...");
    const previewUrl = await generatePreview(prospect);
    console.log("Preview URL:", previewUrl);
  } catch (e) {
    console.log("Generation failed:", e);
  }
}

main().catch(console.error);
