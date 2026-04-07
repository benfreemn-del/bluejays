import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { addProspect } from "@/lib/store";
import { scrapeWebsite } from "@/lib/scraper";
import { generatePreview } from "@/lib/generator";
import type { Prospect, Category } from "@/lib/types";

// PROTECTED endpoint — add a lead manually from dashboard
// Provide business name + any info you have, system does the rest

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { businessName, ownerName, phone, email, website, category, city, state } = body;

  if (!businessName) {
    return NextResponse.json({ error: "Business name required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const id = uuidv4();

  const prospect: Prospect = {
    id,
    businessName,
    ownerName: ownerName || undefined,
    phone: phone || undefined,
    email: email || undefined,
    address: "",
    city: city || "Seattle",
    state: state || "WA",
    category: (category as Category) || "general-contractor",
    currentWebsite: website || undefined,
    estimatedRevenueTier: "medium",
    status: "scouted",
    createdAt: now,
    updatedAt: now,
  };

  // Scrape if website provided
  if (website) {
    try {
      const scraped = await scrapeWebsite(website);
      prospect.scrapedData = scraped;
      prospect.status = "scraped";
      // Use scraped data to fill in blanks
      if (!prospect.phone && scraped.phone) prospect.phone = scraped.phone;
      if (!prospect.address && scraped.address) prospect.address = scraped.address;
    } catch {
      // Continue without scrape
    }
  }

  await addProspect(prospect);

  // Auto-generate preview
  let previewUrl: string | null = null;
  try {
    previewUrl = await generatePreview(prospect);
  } catch {
    // Generation failed
  }

  return NextResponse.json({
    success: true,
    prospect: { ...prospect, generatedSiteUrl: previewUrl },
    message: `${businessName} added to pipeline${previewUrl ? " with preview site" : ""}`,
  });
}
