import { NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { saveScrapedData, getScrapedData } from "@/lib/store";
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

  const category = prospect.category || "general";
  const sd = (prospect.scrapedData || {}) as Record<string, unknown>;

  // Get the photos that are CURRENTLY used on our preview site
  // These come from scrapedData.photos — the generator uses these for the preview
  const previewPhotos = (sd.photos as string[]) || [];

  // Get ALL scraped photos from the original website + Google Places
  // These are potential replacements
  const allScrapedPhotos = [...previewPhotos]; // Start with what we have

  // Also try to get any additional photos from Google Places that aren't in the preview
  // These become available as replacements in the right panel
  const unusedPhotos: string[] = [];

  // Filter preview photos — remove data URIs, SVGs, tiny icons
  const cleanPreviewPhotos = previewPhotos.filter((url) => {
    if (!url) return false;
    if (url.startsWith("data:image/svg") || url.startsWith("data:image/gif")) return false;
    if (url.includes(".svg") && !url.includes("unsplash")) return false;
    if (url.includes("1x1") || url.includes("pixel") || url.includes("spacer")) return false;
    return true;
  });

  // Deduplicate
  const seen = new Set<string>();
  const uniquePreviewPhotos = cleanPreviewPhotos.filter((url) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });

  // Cap at 30
  const capped = uniquePreviewPhotos.slice(0, 30);

  // Build image slots for the LEFT panel (photos on our preview site)
  const images: ImageSlot[] = capped.map((imgUrl, i) => ({
    position: i + 1,
    originalUrl: imgUrl,
    location: guessImageLocation(i + 1, capped.length),
    suggestedFilename: suggestFilename(category, i + 1),
    status: "needs-replacement" as const,
    replacementUrl: null,
    notes: "",
  }));

  // Save mapping to prospect
  const mapping: ImageMapping = {
    prospectId: id,
    businessName: prospect.businessName,
    category,
    websiteUrl: prospect.currentWebsite || "",
    images,
    selectionStatus: "in-progress",
    lastUpdated: new Date().toISOString(),
  };

  // Store inside scrapedData so it persists in Supabase
  await updateProspect(id, {
    scrapedData: { ...sd, imageMapping: mapping } as typeof prospect.scrapedData,
  });

  return NextResponse.json({
    message: `Found ${images.length} images on preview for ${prospect.businessName}`,
    mapping,
    unusedPhotos, // Available for the right panel
  });
}
