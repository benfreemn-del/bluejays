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

  // Optimistic concurrency check
  if (body.expectedVersion && mapping.lastUpdated !== body.expectedVersion) {
    return NextResponse.json(
      { error: "Conflict — mapping was modified by another session. Refresh to see latest." },
      { status: 409 }
    );
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

  // Build updated photos array preserving TWO things:
  // 1. Slot ordering — the rendered template reads photos[0]=hero,
  //    photos[1]=hero-card, photos[2]=about, etc., so the mapping slots
  //    must come first in the stored array and in mapping-slot order.
  // 2. Pool extras — scraped_data.photos often contains MORE photos
  //    than the template has slots for (e.g. the Meyer enrichment
  //    script added 10 fresh Google photos on top of the 3 scanned
  //    slots). Those extras stay available in the image-mapper's
  //    drag-source library. Appending them at the end preserves the
  //    pool without breaking slot ordering.
  //
  // This replaces a prior "shrink-guard" that rejected saves when the
  // mapping slot count was smaller than the full pool — false-positive
  // every time the operator added photos outside the mapper (fix
  // scripts, Google enrichment, bulk refreshes).
  const slotDrivenPhotos: string[] = mapping.images.map((img) => {
    if (img.status === "replaced" && img.replacementUrl) {
      return img.replacementUrl;
    }
    return img.originalUrl;
  });
  const currentPhotos = (sd.photos as string[] | undefined) || [];
  const slotSet = new Set(slotDrivenPhotos);
  const poolExtras = currentPhotos.filter((url) => !slotSet.has(url));
  const updatedPhotos: string[] = [...slotDrivenPhotos, ...poolExtras];

  // Save mapping + updated photos back to prospect's scrapedData
  await updateProspect(id, {
    scrapedData: {
      ...sd,
      imageMapping: mapping,
      photos: updatedPhotos,
    } as unknown as typeof prospect.scrapedData,
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
