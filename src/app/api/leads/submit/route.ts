import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { addProspect } from "@/lib/store";
import { generatePreview } from "@/lib/generator";
import { scrapeWebsite } from "@/lib/scraper";
import { alertOwner } from "@/lib/alerts";
import type { Prospect, Category } from "@/lib/types";

// PUBLIC endpoint — no auth required
// Receives a lead submission from the /get-started form
// Scrapes their info, generates a preview site, notifies owner

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { businessName, ownerName, phone, email, website, category, city } = body;

  if (!businessName || !phone) {
    return NextResponse.json({ error: "Business name and phone required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const id = uuidv4();

  // Create prospect
  const prospect: Prospect = {
    id,
    businessName,
    ownerName: ownerName || undefined,
    phone,
    email: email || undefined,
    address: "",
    city: city || "Unknown",
    state: "WA",
    category: (category as Category) || "general-contractor",
    currentWebsite: website || undefined,
    estimatedRevenueTier: "medium",
    status: "scouted",
    createdAt: now,
    updatedAt: now,
  };

  // Scrape their website if they have one
  if (website) {
    try {
      const scraped = await scrapeWebsite(website);
      prospect.scrapedData = scraped;
      prospect.status = "scraped";
    } catch {
      // Scrape failed, continue without
    }
  }

  // Save to store
  await addProspect(prospect);

  // Generate preview site
  try {
    await generatePreview(prospect);
  } catch {
    // Generation failed, they're still in the system
  }

  // Alert Ben — new inbound lead!
  await alertOwner({
    type: "high-value-lead",
    message: `🔥 INBOUND LEAD: ${businessName} just submitted the form!\nPhone: ${phone}\nEmail: ${email || "N/A"}\nCategory: ${category || "Unknown"}\nWebsite: ${website || "None"}\n\nSite is being generated — check dashboard.`,
    prospect,
    timestamp: now,
  });

  console.log(`  🎯 New inbound lead: ${businessName} (${phone})`);

  return NextResponse.json({
    success: true,
    message: "Your website is being built! We'll notify you within 48 hours.",
    prospectId: id,
  });
}
