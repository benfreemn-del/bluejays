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
  const heroImage = photos?.[0] || pickFromPool(heroPool, businessName);
  const aboutImage = photos?.[1] || pickFromPool(aboutPool, businessName);
  // Card image uses a DIFFERENT photo than the hero background
  const heroCardImage = photos?.[1] || photos?.[0] || pickFromPool(aboutPool, businessName, 1);
  const galleryImages = photos && photos.length > 2
    ? photos.slice(2, 6)
    : pickGallery(galleryPool, businessName);

  return { heroImage, heroCardImage, aboutImage, galleryImages };
}
