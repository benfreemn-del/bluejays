/**
 * Converts external image URLs to go through our image proxy.
 * This ensures Google Places photos, Wix/Squarespace CDN URLs,
 * and other third-party image hosts load consistently in previews.
 *
 * Usage in components:
 *   import { proxyImage } from "@/lib/image-proxy";
 *   <img src={proxyImage(url, prospectId)} />
 */

export function proxyImage(
  url: string | undefined | null,
  prospectId?: string
): string {
  const cleanUrl = url?.trim();
  if (!cleanUrl) return "";

  // Don't proxy URLs that are already proxied
  if (cleanUrl.includes("/api/image-proxy")) return cleanUrl;

  // Don't proxy local or inline assets
  if (
    cleanUrl.startsWith("data:") ||
    cleanUrl.startsWith("/") ||
    cleanUrl.startsWith("blob:")
  ) {
    return cleanUrl;
  }

  const params = new URLSearchParams({ url: cleanUrl });
  if (prospectId) {
    params.set("prospectId", prospectId);
  }

  // Proxy all third-party URLs, including Unsplash, so previews are not
  // dependent on direct browser fetches from remote CDNs.
  return `/api/image-proxy?${params.toString()}`;
}

/**
 * Proxy all images in a photos array
 */
export function proxyPhotos(
  photos: string[] | undefined | null,
  prospectId?: string
): string[] {
  if (!photos || photos.length === 0) return [];
  return photos.map((photo) => proxyImage(photo, prospectId)).filter(Boolean);
}
