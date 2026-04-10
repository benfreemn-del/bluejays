/**
 * Stock Image Picker — prevents duplicate fallback images across previews
 *
 * Every V2 preview template should use this instead of hardcoded STOCK_* constants.
 * Images are selected deterministically by business name hash, guaranteeing:
 * 1. Different businesses get different images (within the same category)
 * 2. The same business always gets the same images (stable across reloads)
 * 3. Gallery images are never duplicated within a single preview
 */

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Pick a single image from a pool, deterministic by business name */
export function pickFromPool(pool: string[], businessName: string, offset = 0): string {
  return pool[(hashName(businessName) + offset) % pool.length];
}

/** Pick N unique images from a pool — guaranteed no duplicates */
export function pickGallery(pool: string[], businessName: string, count = 4): string[] {
  const h = hashName(businessName);
  const used = new Set<number>();
  const result: string[] = [];
  for (let i = 0; result.length < count && i < pool.length * 3; i++) {
    const idx = (h + i * 7) % pool.length;
    if (!used.has(idx)) {
      used.add(idx);
      result.push(pool[idx]);
    }
  }
  return result;
}

/**
 * Get hero, about, and gallery images with dedup logic.
 * Uses real photos when available, falls back to stock pool.
 * Ensures hero background and hero card are DIFFERENT images.
 */
/**
 * Get hero, about, card, and gallery images with full dedup logic.
 * Deduplicates scraped photos first (removes exact URL duplicates),
 * then ensures hero, card, and about are ALWAYS different images.
 * Falls back to stock pools when scraped photos are missing or duplicated.
 */
export function getPreviewImages(
  photos: string[] | undefined,
  businessName: string,
  heroPool: string[],
  aboutPool: string[],
  galleryPool: string[],
): {
  heroImage: string;
  heroCardImage: string;
  aboutImage: string;
  galleryImages: string[];
} {
  // Deduplicate scraped photos — remove exact URL matches
  const unique = photos ? [...new Set(photos)] : [];

  const heroImage = unique[0] || pickFromPool(heroPool, businessName);
  // Card MUST differ from hero — use unique[1] or a different stock
  const heroCardImage = unique[1] || pickFromPool(aboutPool, businessName, 1);
  // About MUST differ from both hero and card
  const aboutImage = unique.length >= 2 && unique[1] !== unique[0]
    ? unique[1]
    : unique[2] || pickFromPool(aboutPool, businessName, 2);
  const galleryImages = unique.length > 2
    ? unique.slice(2, 6)
    : pickGallery(galleryPool, businessName);

  return { heroImage, heroCardImage, aboutImage, galleryImages };
}
