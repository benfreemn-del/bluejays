/**
 * Converts external image URLs to go through our image proxy.
 * This ensures Google Places photos, Wix/Squarespace CDN URLs,
 * and other third-party image hosts load consistently in previews.
 *
 * Usage in components:
 *   import { proxyImage } from "@/lib/image-proxy";
 *   <img src={proxyImage(url, prospectId)} />
 */

function isApprovedDirectImageHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}

export function proxyImage(
  url: string | undefined | null,
  prospectId?: string
): string {
  const cleanUrl = url?.trim();
  if (!cleanUrl) return "";

  // Don't proxy URLs that are already proxied
  if (cleanUrl.includes("/api/image-proxy")) return cleanUrl;

  // Approved direct-render fallback images should bypass the proxy.
  // This matches the QC guidance for Unsplash fallbacks and avoids
  // live-preview breakage when the proxy receives healthy Unsplash URLs.
  if (isApprovedDirectImageHost(cleanUrl)) {
    return cleanUrl;
  }

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
