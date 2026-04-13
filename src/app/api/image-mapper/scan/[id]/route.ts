import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import * as cheerio from "cheerio";
import { suggestFilename, guessImageLocation } from "@/lib/image-mapper-store";
import type { ImageSlot, ImageMapping } from "@/lib/image-mapper-store";

export const maxDuration = 30;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const url = prospect.currentWebsite;
  if (!url) {
    return NextResponse.json({ error: "No website URL for this prospect" }, { status: 400 });
  }

  try {
    // Fetch the website HTML
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BlueJaysBot/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const baseUrl = new URL(url).origin;

    // Extract all images
    const imageUrls: string[] = [];
    const seen = new Set<string>();

    // 1. <img> tags
    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src");
      if (!src) return;
      const fullUrl = src.startsWith("http") ? src : src.startsWith("//") ? `https:${src}` : `${baseUrl}${src.startsWith("/") ? "" : "/"}${src}`;
      // Filter out tiny icons, SVGs, data URIs, tracking pixels
      const width = parseInt($(el).attr("width") || "999");
      const height = parseInt($(el).attr("height") || "999");
      if (width < 50 || height < 50) return;
      if (src.includes(".svg") || src.startsWith("data:") || src.includes("1x1") || src.includes("pixel")) return;
      if (!seen.has(fullUrl)) {
        seen.add(fullUrl);
        imageUrls.push(fullUrl);
      }
    });

    // 2. CSS background-image (inline styles)
    $("[style]").each((_, el) => {
      const style = $(el).attr("style") || "";
      const match = style.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/);
      if (match && match[1]) {
        const src = match[1];
        const fullUrl = src.startsWith("http") ? src : `${baseUrl}${src.startsWith("/") ? "" : "/"}${src}`;
        if (!src.includes(".svg") && !src.startsWith("data:") && !seen.has(fullUrl)) {
          seen.add(fullUrl);
          imageUrls.push(fullUrl);
        }
      }
    });

    // If no images found from HTML, fall back to existing scraped photos
    if (imageUrls.length === 0) {
      const existingPhotos = (prospect.scrapedData as Record<string, unknown>)?.photos as string[] || [];
      existingPhotos.forEach((p) => {
        if (!seen.has(p)) {
          seen.add(p);
          imageUrls.push(p);
        }
      });
    }

    // Cap at 30
    const capped = imageUrls.slice(0, 30);
    const category = prospect.category || "general";

    // Build image slots
    const images: ImageSlot[] = capped.map((imgUrl, i) => ({
      position: i + 1,
      originalUrl: imgUrl,
      location: guessImageLocation(i + 1, capped.length),
      suggestedFilename: suggestFilename(category, i + 1),
      status: "needs-replacement" as const,
      replacementUrl: null,
      notes: "",
    }));

    // Save to prospect
    const mapping: ImageMapping = {
      prospectId: id,
      businessName: prospect.businessName,
      category,
      websiteUrl: url,
      images,
      selectionStatus: "in-progress",
      lastUpdated: new Date().toISOString(),
    };

    // Store inside scrapedData so it persists in Supabase
    const existingSD = (prospect.scrapedData || {}) as Record<string, unknown>;
    await updateProspect(id, {
      scrapedData: { ...existingSD, imageMapping: mapping } as typeof prospect.scrapedData,
    });

    return NextResponse.json({
      message: `Scanned ${images.length} images from ${prospect.businessName}`,
      mapping,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to scan: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
