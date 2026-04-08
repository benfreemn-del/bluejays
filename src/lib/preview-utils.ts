/**
 * Preview data utilities — clean and optimize data for V2 preview renderers.
 * Fixes common issues: long taglines, logos as hero images, missing business names.
 */

import type { GeneratedSiteData } from "./generator";

/**
 * Get a clean, short hero heading from the data.
 * Falls back to business name if tagline is too long or contains URLs.
 */
export function getHeroHeading(data: GeneratedSiteData): string {
  const tagline = data.tagline || "";
  const name = data.businessName || "Your Business";

  // If tagline contains a URL, domain name, or is too long — just use business name
  if (
    tagline.includes(".com") ||
    tagline.includes(".net") ||
    tagline.includes(".org") ||
    tagline.includes("http") ||
    tagline.includes("www.") ||
    tagline.length > 80
  ) {
    return name;
  }

  // If tagline is the generic default, use business name
  if (tagline.includes("trusted") && tagline.includes("services for your community")) {
    return name;
  }

  return tagline || name;
}

/**
 * Get a subtitle/description for below the hero heading.
 * Uses about text or a cleaned tagline.
 */
export function getHeroSubtitle(data: GeneratedSiteData): string {
  // If about text exists and is decent, use a truncated version
  if (data.about && data.about.length > 30 && !data.about.includes("committed to delivering exceptional")) {
    return data.about.length > 160 ? data.about.slice(0, 157) + "..." : data.about;
  }

  // Use tagline if it's a reasonable length
  if (data.tagline && data.tagline.length > 10 && data.tagline.length < 200) {
    // Clean URL from tagline
    const cleaned = data.tagline.replace(/https?:\/\/\S+/g, "").replace(/\w+\.\w+\.\w+/g, "").trim();
    if (cleaned.length > 10) return cleaned;
  }

  const label = data.category.replace(/-/g, " ");
  return `Professional ${label} services for your community. Quality work, fair prices, guaranteed satisfaction.`;
}

/**
 * Get the best hero image — skip logos, pick a real photo.
 * Returns the URL or empty string.
 */
export function getHeroImage(data: GeneratedSiteData): string {
  const photos = data.photos || [];
  if (photos.length === 0) return "";

  // Find the first photo that's suitable for hero (not a logo, not tiny)
  for (const photo of photos) {
    if (isLowQualityImage(photo)) continue;
    return photo;
  }

  // All photos are low quality — return first Google Places photo if any
  const googlePhoto = photos.find(p => p.includes("maps.googleapis.com"));
  if (googlePhoto) return googlePhoto;

  return photos[0]; // Last resort
}

/**
 * Check if an image URL looks low-quality or is a logo/icon.
 * Used to skip bad images for hero/about sections.
 */
export function isLowQualityImage(url: string): boolean {
  if (!url) return true;

  // Logo/icon detection
  if (url.includes("logo") || url.includes("favicon") || url.includes("icon") || url.includes("parastorage")) return true;

  // Tiny Wix images (dimensions in URL)
  const widthMatch = url.match(/w_(\d+)/);
  const heightMatch = url.match(/h_(\d+)/);
  if (widthMatch && parseInt(widthMatch[1]) < 200) return true;
  if (heightMatch && parseInt(heightMatch[1]) < 150) return true;

  // Very small fill dimensions
  const fillMatch = url.match(/fill\/w_(\d+),h_(\d+)/);
  if (fillMatch && parseInt(fillMatch[1]) < 200 && parseInt(fillMatch[2]) < 150) return true;

  // Blur indicators (Wix uses blur_ for thumbnails)
  if (url.includes("blur_2") || url.includes("blur_3")) return true;

  // Screenshot/small images from Wix
  if (url.includes("Screen%20Shot") || url.includes("screenshot")) return true;

  return false;
}

/**
 * Get the about section image — skip the hero image.
 */
export function getAboutImage(data: GeneratedSiteData): string {
  const photos = data.photos || [];
  const heroImg = getHeroImage(data);

  // Find first photo that isn't the hero
  for (const photo of photos) {
    if (photo !== heroImg && !photo.includes("logo") && !photo.includes("favicon")) {
      return photo;
    }
  }

  return "";
}

/**
 * Get the display name for the nav bar.
 * Never returns "website" or empty.
 */
export function getNavName(data: GeneratedSiteData): string {
  if (data.businessName && data.businessName.toLowerCase() !== "website") {
    return data.businessName;
  }
  return "Your Business";
}
