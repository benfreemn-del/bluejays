"use client";

import type { ReactNode, SyntheticEvent } from "react";
import {
  getCategoryFallbackImage,
  type PreviewImageSection,
} from "@/lib/stock-image-picker";

interface PreviewImageGuardProps {
  category: string;
  businessName: string;
  prospectId?: string;
  knownPhotos?: string[];
  children: ReactNode;
}

const HERO_PATTERN = /hero|banner|headline|showcase|masthead|intro/i;
const ABOUT_PATTERN = /about|story|founder|owner|company|mission/i;
const SERVICES_PATTERN = /service|feature|repair|install|treatment|offering|specialty/i;
const GALLERY_PATTERN = /gallery|portfolio|project|work|showcase|before|after|results/i;
const TEAM_PATTERN = /team|staff|doctor|dentist|attorney|agent|technician|coach|trainer|member|employee/i;
const TESTIMONIAL_PATTERN = /testimonial|review|client|customer|patient|success story/i;

function unwrapProxy(url: string): string {
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://bluejayportfolio.com");
    if (parsed.pathname !== "/api/image-proxy") {
      return parsed.toString();
    }

    const target = parsed.searchParams.get("url");
    return target ? decodeURIComponent(target) : url;
  } catch {
    return url;
  }
}

function normalize(url: string | undefined | null): string {
  return unwrapProxy((url || "").trim()).replace(/[#?].*$/, "");
}

function collectDescriptor(image: HTMLImageElement): string {
  const parts = [image.alt, image.getAttribute("src"), image.className || ""];
  let current: HTMLElement | null = image.parentElement;
  let depth = 0;

  while (current && depth < 4) {
    if (current.id) parts.push(current.id);
    if (typeof current.className === "string") parts.push(current.className);
    const labelledBy = current.getAttribute("aria-label");
    if (labelledBy) parts.push(labelledBy);
    current = current.parentElement;
    depth += 1;
  }

  return parts.join(" ").toLowerCase();
}

function inferSection(image: HTMLImageElement, knownPhotos: string[]): PreviewImageSection {
  const descriptor = collectDescriptor(image);

  if (TESTIMONIAL_PATTERN.test(descriptor)) return "testimonials";
  if (TEAM_PATTERN.test(descriptor)) return "team";
  if (SERVICES_PATTERN.test(descriptor)) return "services";
  if (GALLERY_PATTERN.test(descriptor)) return "gallery";
  if (ABOUT_PATTERN.test(descriptor)) return "about";
  if (HERO_PATTERN.test(descriptor)) return "hero";

  const source = normalize(image.currentSrc || image.src || image.getAttribute("src") || "");
  const photoIndex = knownPhotos.findIndex((photo) => normalize(photo) === source);

  if (photoIndex === 0) return "hero";
  if (photoIndex === 1) return "about";
  if (photoIndex >= 2 && photoIndex <= 9) return "gallery";

  const imageIndex = typeof document !== "undefined" ? Array.from(document.images).indexOf(image) : -1;
  if (imageIndex === 0) return "hero";
  if (imageIndex === 1 || imageIndex === 2) return "about";
  if (imageIndex >= 3 && imageIndex <= 8) return "services";
  if (imageIndex >= 9 && imageIndex <= 14) return "gallery";
  if (imageIndex >= 15 && imageIndex <= 18) return "team";

  return "gallery";
}

export default function PreviewImageGuard({
  category,
  businessName,
  prospectId,
  knownPhotos = [],
  children,
}: PreviewImageGuardProps) {
  const handleErrorCapture = (event: SyntheticEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) {
      return;
    }

    const image = target;
    const attempt = Number(image.dataset.fallbackAttempt || "0");
    if (attempt >= 4) {
      return;
    }

    const currentSrc = image.currentSrc || image.src || image.getAttribute("src") || "";

    // Retry the original URL once before giving up on it. Upstream CDNs
    // (Cloudfront especially) occasionally return a transient 502/503
    // and then serve 200 on the very next request a fraction of a second
    // later. Jumping straight to a stock fallback on the first error
    // throws away perfectly good real photos. We only retry proxied URLs
    // (the /api/image-proxy path) and only once — if it still fails after
    // the retry, we fall through to the category fallback below.
    const retryKey = "imageRetryAttempt";
    const retryCount = Number(image.dataset[retryKey] || "0");
    const isProxied = currentSrc.includes("/api/image-proxy");
    if (isProxied && retryCount === 0) {
      image.dataset[retryKey] = "1";
      // Force reload by re-setting src with a cache-buster
      const sep = currentSrc.includes("?") ? "&" : "?";
      const retryUrl = `${currentSrc}${sep}_retry=1`;
      // Small delay so we don't hammer the proxy during a cold-start burst
      setTimeout(() => { image.src = retryUrl; }, 400);
      return;
    }

    const section = inferSection(image, knownPhotos);
    const fallbackSrc = getCategoryFallbackImage(category, section, businessName, attempt, [currentSrc]);
    if (!fallbackSrc) {
      return;
    }

    image.dataset.fallbackAttempt = String(attempt + 1);
    image.dataset.fallbackSection = section;
    image.src = fallbackSrc;
    if (image.hasAttribute("srcset")) {
      image.removeAttribute("srcset");
    }
    if (!image.alt) {
      image.alt = `${businessName} ${section}`;
    }
  };

  return <div onErrorCapture={handleErrorCapture}>{children}</div>;
}
