import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { generatePreview } from "@/lib/generator";
import { extractBusinessData } from "@/lib/data-extractor";

// Vercel Pro: up to 300s
export const maxDuration = 120;

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
    // STEP 1: Cascading data extraction — try every method until we have good data
    console.log(`\n🔄 Starting data extraction for "${prospect.businessName}"...`);
    const { data, methods, quality } = await extractBusinessData(
      prospect.businessName,
      prospect.city,
      prospect.currentWebsite,
    );

    // Save scraped data if we got anything useful
    const hasData = data.phone || data.services.length > 0 || data.about || data.photos.length > 0;
    if (hasData) {
      prospect.scrapedData = {
        ...data,
        businessName: data.businessName || prospect.businessName,
      };
      // Also update phone on the prospect level if we found one
      const updates: Record<string, unknown> = {
        scrapedData: prospect.scrapedData,
        status: "scraped" as const,
      };
      if (data.phone && !prospect.phone) {
        prospect.phone = data.phone;
        updates.phone = data.phone;
      }
      if (data.brandColor) {
        // Store for future reference
      }
      await updateProspect(id, updates);
      console.log(`  ✅ Data loaded (quality: ${quality}, methods: ${methods.join(", ")})`);
    } else {
      console.log(`  ⚠️ No data extracted from any source — using defaults`);
    }

    // STEP 2: Generate preview (quality gate built into generator)
    const previewUrl = await generatePreview(prospect);

    return NextResponse.json({
      message: `Preview generated for ${prospect.businessName}`,
      previewUrl,
      quality,
      methods,
      hasPhone: !!prospect.phone || !!data.phone,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
