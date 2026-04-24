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

  // Build updated photos array by applying slot replacements IN-PLACE
  // over the existing photo pool.
  //
  // Why in-place by URL match (and not by position, and not by
  // rebuilding from slots + appending extras):
  //
  // 1. Indices must be stable. V2 templates read photos[0]=hero,
  //    [1]=about/hero-card, [2..9]=gallery. If we append anything,
  //    every gallery position shifts by one and the operator's
  //    single-slot replacement visually reorders the whole page.
  // 2. The mapping was scanned against whatever photos existed at
  //    scan time; the pool may have grown since (fix scripts,
  //    enrichment, Google photo scrapes). The safest identity is
  //    the URL itself, not the slot position.
  // 3. Pool extras beyond the scanned slots must stay at their
  //    original indices too — they're the drag-source library for
  //    the next mapping session and the template may render them.
  //
  // Algorithm:
  //   - Build a URL→URL replacement map from replaced slots.
  //   - Walk currentPhotos; for each url, substitute the replacement
  //     if one exists, otherwise keep the url unchanged.
  //   - If a slot's originalUrl isn't in currentPhotos (rare edge —
  //     mapping out of sync with pool), append the replacement at
  //     the tail so the operator's choice isn't silently dropped.
  const replacementsByUrl = new Map<string, string>();
  for (const img of mapping.images) {
    if (img.status === "replaced" && img.replacementUrl) {
      replacementsByUrl.set(img.originalUrl, img.replacementUrl);
    }
  }
  const currentPhotos = (sd.photos as string[] | undefined) || [];
  const handledOriginals = new Set<string>();
  const updatedPhotos: string[] = currentPhotos.map((url) => {
    const replacement = replacementsByUrl.get(url);
    if (replacement) {
      handledOriginals.add(url);
      return replacement;
    }
    return url;
  });
  // Edge case: mapping references an originalUrl that's no longer in
  // the pool. Append any such replacements at the tail so the
  // operator's work isn't silently lost.
  for (const [origUrl, replUrl] of replacementsByUrl) {
    if (!handledOriginals.has(origUrl) && !updatedPhotos.includes(replUrl)) {
      updatedPhotos.push(replUrl);
    }
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
