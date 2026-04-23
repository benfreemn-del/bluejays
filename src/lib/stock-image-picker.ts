import type { Category } from "@/lib/types";
import {
  CATEGORY_FALLBACK_COLLECTIONS,
  type CategoryFallbackCollection,
} from "@/lib/category-fallback-images";

export type PreviewImageSection =
  | "hero"
  | "hero-card"
  | "about"
  | "services"
  | "gallery"
  | "team"
  | "testimonials";

const SECTION_DIMENSIONS: Record<PreviewImageSection, { width: number; height: number }> = {
  hero: { width: 1600, height: 900 },
  "hero-card": { width: 1200, height: 900 },
  about: { width: 1200, height: 900 },
  services: { width: 900, height: 700 },
  gallery: { width: 1200, height: 900 },
  team: { width: 900, height: 900 },
  testimonials: { width: 900, height: 700 },
};

const SECTION_POOL_ORDER: Record<PreviewImageSection, Array<keyof CategoryFallbackCollection>> = {
  hero: ["hero", "gallery", "services", "team"],
  "hero-card": ["hero", "team", "gallery", "services"],
  about: ["team", "hero", "gallery", "services"],
  services: ["services", "gallery", "hero", "team"],
  gallery: ["gallery", "services", "hero", "team"],
  team: ["team", "hero", "gallery", "services"],
  testimonials: ["team", "services", "gallery", "hero"],
};

const KNOWN_CATEGORIES = Object.keys(CATEGORY_FALLBACK_COLLECTIONS) as Category[];
const DEFAULT_CATEGORY: Category = "general-contractor";
const UNSPLASH_DIRECT_HOSTS = new Set(["images.unsplash.com", "plus.unsplash.com"]);

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function normalizeCategory(category: string | undefined | null): Category {
  const normalized = (category || "").trim().toLowerCase() as Category;
  return KNOWN_CATEGORIES.includes(normalized) ? normalized : DEFAULT_CATEGORY;
}

function buildUnsplashImageUrl(rawUrl: string, section: PreviewImageSection): string {
  try {
    const url = new URL(rawUrl);
    if (!UNSPLASH_DIRECT_HOSTS.has(url.hostname)) {
      return rawUrl;
    }

    const { width, height } = SECTION_DIMENSIONS[section];
    url.searchParams.set("w", String(width));
    url.searchParams.set("h", String(height));
    url.searchParams.set("fit", "crop");
    url.searchParams.set("crop", "entropy");
    url.searchParams.set("auto", "format");
    url.searchParams.set("q", "80");
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function getSectionPool(category: string, section: PreviewImageSection): string[] {
  const resolvedCategory = normalizeCategory(category);
  const collection = CATEGORY_FALLBACK_COLLECTIONS[resolvedCategory];
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const key of SECTION_POOL_ORDER[section]) {
    for (const asset of collection[key]) {
      const imageUrl = buildUnsplashImageUrl(asset.raw, section);
      if (!seen.has(imageUrl)) {
        seen.add(imageUrl);
        merged.push(imageUrl);
      }
    }
  }

  return merged;
}

/** Pick a single image from a pool, deterministic by business name */
export function pickFromPool(pool: string[], businessName: string, offset = 0): string {
  if (pool.length === 0) return "";
  return pool[(hashName(businessName) + offset) % pool.length];
}

/** Pick N unique images from a pool — guaranteed no duplicates */
export function pickGallery(pool: string[], businessName: string, count = 4): string[] {
  if (pool.length === 0 || count <= 0) return [];

  const h = hashName(businessName);
  const used = new Set<number>();
  const result: string[] = [];

  for (let i = 0; result.length < Math.min(count, pool.length) && i < pool.length * 4; i++) {
    const idx = (h + i * 7) % pool.length;
    if (!used.has(idx)) {
      used.add(idx);
      result.push(pool[idx]);
    }
  }

  return result;
}

export function getCategoryFallbackPool(category: string, section: PreviewImageSection): string[] {
  return getSectionPool(category, section);
}

export function getCategoryFallbackImage(
  category: string,
  section: PreviewImageSection,
  businessName: string,
  offset = 0,
  exclude: string[] = [],
): string {
  const pool = getSectionPool(category, section);
  if (pool.length === 0) return "";

  const excluded = new Set(exclude.filter(Boolean));
  for (let i = 0; i < pool.length; i++) {
    const candidate = pickFromPool(pool, businessName, offset + i);
    if (candidate && !excluded.has(candidate)) {
      return candidate;
    }
  }

  return pickFromPool(pool, businessName, offset);
}

export function getCategoryFallbackImages(
  category: string,
  section: PreviewImageSection,
  businessName: string,
  count: number,
  exclude: string[] = [],
): string[] {
  const pool = getSectionPool(category, section);
  if (pool.length === 0 || count <= 0) return [];

  const excluded = new Set(exclude.filter(Boolean));
  const results: string[] = [];

  for (let i = 0; i < pool.length && results.length < count; i++) {
    const candidate = pickFromPool(pool, businessName, i);
    if (!candidate || excluded.has(candidate) || results.includes(candidate)) {
      continue;
    }
    results.push(candidate);
  }

  return results;
}

export function getCompleteCategoryFallbackSet(category: string, businessName: string): string[] {
  const sections: PreviewImageSection[] = [
    "hero",
    "hero-card",
    "about",
    "services",
    "gallery",
    "team",
    "testimonials",
  ];
  const results: string[] = [];

  for (const section of sections) {
    const sectionImages = getCategoryFallbackImages(category, section, businessName, 12, results);
    for (const image of sectionImages) {
      if (!results.includes(image)) {
        results.push(image);
      }
    }
  }

  return results;
}

/**
 * Get hero, about, card, and gallery images with full dedup logic.
 * Deduplicates scraped photos first, then ensures hero, card, and about
 * always differ, with rich section-aware category fallbacks when needed.
 */
export function getPreviewImages(
  photos: string[] | undefined,
  businessName: string,
  heroPool: string[],
  aboutPool: string[],
  galleryPool: string[],
  category?: string,
): {
  heroImage: string;
  heroCardImage: string;
  aboutImage: string;
  galleryImages: string[];
} {
  const unique = photos ? [...new Set(photos.filter(Boolean))] : [];
  const usedImages = new Set<string>();

  const pickNextUnique = (
    candidates: string[],
    fallbackPools: string[][],
    fallbackSection: PreviewImageSection,
    offset: number,
  ): string => {
    for (const candidate of candidates) {
      if (candidate && !usedImages.has(candidate)) {
        usedImages.add(candidate);
        return candidate;
      }
    }

    const mergedFallbackPool = [
      ...fallbackPools.flat().filter(Boolean),
      ...(category ? getCategoryFallbackPool(category, fallbackSection) : []),
    ];

    for (let i = 0; i < mergedFallbackPool.length; i++) {
      const fallback = pickFromPool(mergedFallbackPool, businessName, offset + i);
      if (fallback && !usedImages.has(fallback)) {
        usedImages.add(fallback);
        return fallback;
      }
    }

    const lastResort =
      getCategoryFallbackImage(category || DEFAULT_CATEGORY, fallbackSection, businessName, offset, [...usedImages]) ||
      pickFromPool(mergedFallbackPool, businessName, offset);

    if (lastResort) {
      usedImages.add(lastResort);
    }

    return lastResort;
  };

  const heroFallbackPools = [heroPool];
  if (category) {
    heroFallbackPools.push(getCategoryFallbackPool(category, "hero"));
  }
  const heroImage = pickNextUnique(unique, heroFallbackPools, "hero", 0);

  const heroCardImage = pickNextUnique(unique.slice(1), [aboutPool], "hero-card", 1);
  const aboutImage = pickNextUnique(unique.slice(1), [aboutPool], "about", 2);

  const galleryCandidates = unique.filter((image) => !usedImages.has(image));
  const galleryImages: string[] = [];
  for (const candidate of galleryCandidates) {
    if (!galleryImages.includes(candidate)) {
      galleryImages.push(candidate);
    }
    if (galleryImages.length >= 8) break;
  }

  if (galleryImages.length < 4) {
    const fallbackGallery = [
      ...galleryPool,
      ...(category ? getCategoryFallbackPool(category, "gallery") : []),
    ];
    for (const image of pickGallery(fallbackGallery, businessName, 8)) {
      if (!usedImages.has(image) && !galleryImages.includes(image)) {
        galleryImages.push(image);
      }
      if (galleryImages.length >= 8) break;
    }
  }

  return {
    heroImage,
    heroCardImage,
    aboutImage,
    galleryImages,
  };
}
