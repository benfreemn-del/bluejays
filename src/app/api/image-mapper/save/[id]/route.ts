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

  // Apply the slot states to TWO separate photo arrays, INDEPENDENTLY:
  //
  //   A. generated_sites.photos — the template's source of truth. The
  //      rendered preview reads hero from photos[0], about from [1],
  //      gallery from [2..9], etc. Slot positions here MUST stay stable.
  //      The scan endpoint built `mapping.images[i]` 1:1 from THIS array
  //      with `position = i + 1`, so we apply slot state by POSITION
  //      not by URL. Position-based applies correctly even after the
  //      slot has been edited multiple times — each save re-projects
  //      every slot's "intended state" onto the photos array.
  //
  //   B. scraped_data.photos — the "pool" that the image-mapper's drag
  //      library reads from. This array may have been enriched outside
  //      the mapper (fix scripts, Google photo scrapes) and can
  //      diverge in size + order from generated_sites.photos. URL→URL
  //      substitution is applied here so the library stays consistent,
  //      but its ordering is irrelevant for the rendered template.
  //
  // Previously the gsPhotos pass also used URL→URL substitution. That
  // worked for the FIRST edit on each slot but silently broke for
  // subsequent edits: after edit 1, gsPhotos[i] held the replacement
  // URL while mapping.images[i].originalUrl still held the originally
  // scanned URL. The URL match found nothing, so edit 2's replacement
  // got appended to the tail of gsPhotos instead of overwriting the
  // hero — making the iframe "not refresh" for the user. Fix:
  // position-based for gsPhotos, URL-based only for the sd.photos pool.

  // ── Pass A: gsPhotos by POSITION ──
  // For each slot, project its intended state onto gsPhotos[position - 1]:
  //   • status === "replaced" + replacementUrl → use replacementUrl
  //   • anything else (keep-original, needs-replacement) → use originalUrl
  const slots = mapping.images;
  function applyByPosition(pool: string[]): string[] {
    const updated = [...pool];
    for (const slot of slots) {
      const idx = slot.position - 1;
      if (idx < 0) continue;
      const desired =
        slot.status === "replaced" && slot.replacementUrl
          ? slot.replacementUrl
          : slot.originalUrl;
      if (idx < updated.length) {
        updated[idx] = desired;
      } else {
        // The pool has shrunk since scan (external mutation). Pad with
        // the slot's desired URL so position semantics are preserved.
        while (updated.length < idx) updated.push(slot.originalUrl);
        updated.push(desired);
      }
    }
    return updated;
  }

  // ── Pass B: sdPhotos by URL substitution (pool ordering is opaque) ──
  const replacementsByUrl = new Map<string, string>();
  for (const img of mapping.images) {
    if (img.status === "replaced" && img.replacementUrl) {
      replacementsByUrl.set(img.originalUrl, img.replacementUrl);
    }
  }
  function applyByUrl(pool: string[]): string[] {
    if (pool.length === 0) return pool;
    const updated = pool.map((url) => replacementsByUrl.get(url) ?? url);
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
  const updatedGsPhotos = applyByPosition(gsPhotos);
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
  const updatedSdPhotos = applyByUrl(sdPhotos);
  await updateProspect(id, {
    scrapedData: {
      ...sd,
      imageMapping: mapping,
      photos: updatedSdPhotos,
    } as unknown as typeof prospect.scrapedData,
  });

  return NextResponse.json({ message: "Saved", mapping, photosUpdated: true });
}
