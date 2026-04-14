import { NextResponse } from "next/server";
import { getProspect, updateProspect, getScrapedData, saveScrapedData } from "@/lib/store";
import type { ImageMapping } from "@/lib/image-mapper-store";
import { calculateStatus } from "@/lib/image-mapper-store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const body = await request.json();
  const sd = (prospect.scrapedData || {}) as Record<string, unknown>;
  const mapping = sd.imageMapping as ImageMapping | undefined;
  if (!mapping) {
    return NextResponse.json({ error: "No image mapping found. Scan first." }, { status: 400 });
  }

  // Update specific image slot
  if (body.imageUpdate) {
    const { position, ...updates } = body.imageUpdate;
    const slot = mapping.images.find((img) => img.position === position);
    if (slot) {
      Object.assign(slot, updates);
      mapping.selectionStatus = calculateStatus(mapping.images);
      mapping.lastUpdated = new Date().toISOString();
    }
  }

  // Bulk update all images
  if (body.images) {
    mapping.images = body.images;
    mapping.selectionStatus = calculateStatus(mapping.images);
    mapping.lastUpdated = new Date().toISOString();
  }

  // Build updated photos array using the ORIGINAL urls as the base,
  // then apply replacements on top. This preserves correct ordering.
  const updatedPhotos: string[] = mapping.images.map((img) => {
    if (img.status === "replaced" && img.replacementUrl) {
      return img.replacementUrl;
    }
    return img.originalUrl;
  });

  // Save mapping + updated photos back to prospect's scrapedData
  await updateProspect(id, {
    scrapedData: {
      ...sd,
      imageMapping: mapping,
      photos: updatedPhotos,
    } as typeof prospect.scrapedData,
  });

  // ALSO update the generated_sites table — this is what the preview actually reads from
  try {
    const generatedSite = await getScrapedData(id) as Record<string, unknown> | null;
    if (generatedSite) {
      await saveScrapedData(id, {
        ...generatedSite,
        photos: updatedPhotos,
      });
    }
  } catch (err) {
    console.error("[image-mapper/save] Failed to update generated_sites:", err);
  }

  return NextResponse.json({ message: "Saved", mapping, photosUpdated: true });
}
