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

  // Build updated photos array using the ORIGINAL urls as the base,
  // then apply replacements on top. This preserves correct ordering.
  const updatedPhotos: string[] = mapping.images.map((img) => {
    if (img.status === "replaced" && img.replacementUrl) {
      return img.replacementUrl;
    }
    return img.originalUrl;
  });

  // Shrink-guard: the mapper builds `updatedPhotos` from its own stashed
  // slot snapshot. If ANY other codepath (a fix script, a regenerate, a
  // bulk refresh) writes to `scrapedData.photos` after the mapper loaded,
  // the mapper's snapshot is stale and this save would clobber that
  // external work with an older photo set.
  //
  // The existing expectedVersion check only tracks mapping.lastUpdated,
  // which doesn't change when photos are edited outside the mapper. This
  // extra guard catches the gap: if the save would meaningfully shrink
  // the stored photo count, refuse and tell the client to refresh.
  //
  // Threshold: >25% shrink OR dropping >5 photos, whichever is stricter.
  // A small shrink (delete one broken slot) still goes through.
  const currentPhotos = (sd.photos as string[] | undefined) || [];
  const shrinkCount = currentPhotos.length - updatedPhotos.length;
  const shrinkPct = currentPhotos.length > 0 ? shrinkCount / currentPhotos.length : 0;
  if (shrinkCount > 5 || shrinkPct > 0.25) {
    return NextResponse.json(
      {
        error:
          `Refusing save — would reduce photos from ${currentPhotos.length} ` +
          `to ${updatedPhotos.length} (${Math.round(shrinkPct * 100)}% drop). ` +
          `Photos were likely updated outside the image-mapper since you ` +
          `loaded it. Refresh the page to pick up the current state, then ` +
          `re-apply your changes.`,
        currentCount: currentPhotos.length,
        wouldBeCount: updatedPhotos.length,
      },
      { status: 409 },
    );
  }

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
