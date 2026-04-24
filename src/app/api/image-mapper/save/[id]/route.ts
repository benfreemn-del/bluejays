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

  // Build a URL→URL replacement map from slots the operator marked as
  // replaced. This is the single source of truth for "what changed".
  const replacementsByUrl = new Map<string, string>();
  for (const img of mapping.images) {
    if (img.status === "replaced" && img.replacementUrl) {
      replacementsByUrl.set(img.originalUrl, img.replacementUrl);
    }
  }

  // Apply the replacements to TWO separate photo arrays, INDEPENDENTLY:
  //
  //   A. generated_sites.photos — the template's source of truth. The
  //      rendered preview reads hero from photos[0], about from [1],
  //      gallery from [2..9], etc. Slot positions here MUST stay stable.
  //      The scan endpoint built `mapping.images[i].originalUrl` from
  //      THIS array, so URL matching is guaranteed to land at the
  //      correct position.
  //
  //   B. scraped_data.photos — the "pool" that the image-mapper's drag
  //      library reads from. This array may have been enriched outside
  //      the mapper (fix scripts, Google photo scrapes) and can
  //      diverge in size + order from generated_sites.photos. The same
  //      URL→URL substitution is applied here so the library stays
  //      consistent, but its ordering is irrelevant for the rendered
  //      template.
  //
  // Previously these were collapsed into one `updatedPhotos` array
  // derived from scraped_data.photos — that caused a critical bug
  // where, after external enrichment grew scraped_data.photos to 18
  // entries while generated_sites.photos still had 6, saving would
  // overwrite generated_sites.photos with scraped_data's order and
  // silently reshuffle the rendered preview (Ben's change for slot 0
  // would appear at position 17 and hero would show a random
  // enrichment photo). Fix: keep the two pools separate.

  function applyReplacements(pool: string[]): string[] {
    if (pool.length === 0) return pool;
    const updated = pool.map((url) => replacementsByUrl.get(url) ?? url);
    // If a replacement URL's originalUrl isn't in this pool, append
    // the replacement at the tail so the operator's work is preserved
    // somewhere. Otherwise it would be silently lost.
    const poolSet = new Set(pool);
    for (const [origUrl, replUrl] of replacementsByUrl) {
      if (!poolSet.has(origUrl) && !updated.includes(replUrl)) {
        updated.push(replUrl);
      }
    }
    return updated;
  }

  // Update generated_sites.photos (the rendered-preview source)
  let generatedSite: Record<string, unknown> | null = null;
  try {
    generatedSite = (await getScrapedData(id)) as Record<string, unknown> | null;
  } catch (err) {
    console.error("[image-mapper/save] Failed to load generated_sites:", err);
  }
  const gsPhotos = (generatedSite?.photos as string[] | undefined) || [];
  const updatedGsPhotos = applyReplacements(gsPhotos);
  if (generatedSite && updatedGsPhotos.length > 0) {
    try {
      await saveScrapedData(id, {
        ...generatedSite,
        photos: updatedGsPhotos,
      });
    } catch (err) {
      console.error("[image-mapper/save] Failed to update generated_sites:", err);
    }
  }

  // Update scraped_data.photos (the pool) — kept in sync with the
  // replacements so the mapper library doesn't show stale originals
  const sdPhotos = (sd.photos as string[] | undefined) || [];
  const updatedSdPhotos = applyReplacements(sdPhotos);
  await updateProspect(id, {
    scrapedData: {
      ...sd,
      imageMapping: mapping,
      photos: updatedSdPhotos,
    } as unknown as typeof prospect.scrapedData,
  });

  return NextResponse.json({ message: "Saved", mapping, photosUpdated: true });
}
