/**
 * Preview data utilities — clean and optimize data for V2 preview renderers.
 * Fixes common issues: long taglines, logos as hero images, missing business names.
 */

import type { GeneratedSiteData } from "./generator";
import { sanitizeImageUrl, sanitizeImageUrls, validateImageUrl } from "./image-validator";

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
  const photos = sanitizeImageUrls(data.photos);
  if (photos.length === 0) return "";

  for (const photo of photos) {
    const validation = validateImageUrl(photo, data.category, "hero");
    if (validation.shouldUseFallback) continue;
    return validation.sanitizedUrl;
  }

  const googlePhoto = photos.find((photo) => photo.includes("maps.googleapis.com"));
  if (googlePhoto) return sanitizeImageUrl(googlePhoto);

  return sanitizeImageUrl(photos[0]);
}

/**
 * Check if an image URL looks low-quality or is a logo/icon.
 * Used to skip bad images for hero/about sections.
 */
export function isLowQualityImage(url: string, category: GeneratedSiteData["category"] = "electrician"): boolean {
  return validateImageUrl(url, category, "gallery").shouldUseFallback;
}

/**
 * Get the about section image — skip the hero image.
 */
export function getAboutImage(data: GeneratedSiteData): string {
  const photos = sanitizeImageUrls(data.photos);
  const heroImg = sanitizeImageUrl(getHeroImage(data));

  for (const photo of photos) {
    const sanitizedPhoto = sanitizeImageUrl(photo);
    if (!sanitizedPhoto || sanitizedPhoto === heroImg) continue;

    const validation = validateImageUrl(sanitizedPhoto, data.category, "about");
    if (validation.shouldUseFallback) continue;
    return validation.sanitizedUrl;
  }

  for (const photo of photos) {
    const sanitizedPhoto = sanitizeImageUrl(photo);
    if (sanitizedPhoto && sanitizedPhoto !== heroImg) return sanitizedPhoto;
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
