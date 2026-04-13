/**
 * Image Mapper — Types and storage helpers for the image mapping & replacement tool.
 */

export interface ImageSlot {
  position: number;
  originalUrl: string;
  location: string; // "Hero Banner", "About Section", etc.
  suggestedFilename: string; // e.g. "Dentist-theme-pics-1"
  status: "needs-replacement" | "replaced" | "keep-original";
  replacementUrl: string | null;
  notes: string;
}

export interface ImageMapping {
  prospectId: string;
  businessName: string;
  category: string;
  websiteUrl: string;
  images: ImageSlot[];
  selectionStatus: "in-progress" | "completed";
  lastUpdated: string;
}

/** Generate the suggested filename for a replacement image */
export function suggestFilename(category: string, position: number): string {
  const industry = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return `${industry}-theme-pics-${position}`;
}

/** Guess the image location based on its position on the page */
export function guessImageLocation(position: number, total: number): string {
  if (position === 1) return "Hero Banner";
  if (position === 2) return "Hero Card / Secondary";
  if (position <= Math.ceil(total * 0.3)) return "About Section";
  if (position <= Math.ceil(total * 0.6)) return "Services / Gallery";
  if (position <= Math.ceil(total * 0.85)) return "Testimonials / CTA";
  return "Footer / Contact";
}

/** Calculate selection status from image slots */
export function calculateStatus(images: ImageSlot[]): "in-progress" | "completed" {
  if (images.length === 0) return "in-progress";
  const allDecided = images.every(
    (img) => img.status === "replaced" || img.status === "keep-original"
  );
  return allDecided ? "completed" : "in-progress";
}
