/**
 * Converts external image URLs to go through our image proxy.
 * This ensures Google Places photos (which need API key) and
 * Wix/Squarespace CDN URLs (which expire) always load.
 *
 * Usage in components:
 *   import { proxyImage } from "@/lib/image-proxy";
 *   <img src={proxyImage(url)} />
 */

export function proxyImage(url: string | undefined | null): string {
  if (!url) return "";

  // Don't proxy Unsplash URLs — they work directly and have good CDN
  if (url.includes("images.unsplash.com")) return url;

  // Don't proxy URLs that are already proxied
  if (url.includes("/api/image-proxy")) return url;

  // Don't proxy data: URLs
  if (url.startsWith("data:")) return url;

  // Proxy everything else (Google Places, Wix, Squarespace, etc.)
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

/**
 * Proxy all images in a photos array
 */
export function proxyPhotos(photos: string[] | undefined | null): string[] {
  if (!photos || photos.length === 0) return [];
  return photos.map(proxyImage).filter(Boolean);
}
