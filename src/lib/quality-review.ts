import type { GeneratedSiteData } from "./generator";
import {
  GALLERY_HEAVY_CATEGORIES,
  getCategoryFallbackImage,
  getDuplicateImageUrls,
  sanitizeImageUrls,
  validateImageUrl,
} from "./image-validator";
import { CATEGORY_CONFIG } from "./types";
import type { Category, Prospect } from "./types";

export interface QualityIssue {
  severity: "critical" | "warning" | "suggestion";
  section: string;
  message: string;
}

export interface QualityReport {
  score: number; // 0-100
  passed: boolean;
  issues: QualityIssue[];
  timestamp: string;
}

function getMinimumPhotoCount(category: Category): number {
  return GALLERY_HEAVY_CATEGORIES.has(category) ? 5 : 3;
}

export function reviewSiteQuality(
  prospect: Prospect,
  siteData: GeneratedSiteData
): QualityReport {
  const issues: QualityIssue[] = [];
  const sanitizedPhotos = sanitizeImageUrls(siteData.photos);
  const minimumPhotoCount = getMinimumPhotoCount(siteData.category);
  const photoValidations = sanitizedPhotos.map((photo, index) =>
    validateImageUrl(
      photo,
      siteData.category,
      index === 0 ? "hero" : index === 1 ? "about" : "gallery"
    )
  );

  // --- Content Checks ---

  // Business name
  if (!siteData.businessName || siteData.businessName.length < 3) {
    issues.push({ severity: "critical", section: "Business Name", message: "Missing or too short business name." });
  }

  // Tagline
  if (!siteData.tagline || siteData.tagline.length < 20) {
    issues.push({ severity: "warning", section: "Tagline", message: "Tagline is missing or too short. Should be a compelling one-liner." });
  }

  // Phone — CRITICAL, must have a real number
  if (!siteData.phone || siteData.phone === "(555) 000-0000" || siteData.phone === "Call Us Today") {
    issues.push({ severity: "critical", section: "Phone", message: "No real phone number. Every site MUST have a real phone number before it can be marked ready." });
  }

  // Address
  if (!siteData.address || siteData.address.length < 10) {
    issues.push({ severity: "warning", section: "Address", message: "Address is missing or incomplete." });
  }

  // Services
  if (siteData.services.length === 0) {
    issues.push({ severity: "critical", section: "Services", message: "No services listed. Every site needs at least 3 services." });
  } else if (siteData.services.length < 3) {
    issues.push({ severity: "warning", section: "Services", message: `Only ${siteData.services.length} services. Recommend at least 4 for a fuller look.` });
  }

  // Check service descriptions
  const emptyDescriptions = siteData.services.filter((s) => !s.description || s.description.length < 10);
  if (emptyDescriptions.length > 0) {
    issues.push({ severity: "suggestion", section: "Services", message: `${emptyDescriptions.length} services have weak/missing descriptions.` });
  }

  // Testimonials
  if (siteData.testimonials.length === 0) {
    issues.push({ severity: "critical", section: "Testimonials", message: "No testimonials. Every site needs at least 2 reviews for credibility." });
  } else if (siteData.testimonials.length < 3) {
    issues.push({ severity: "suggestion", section: "Testimonials", message: `Only ${siteData.testimonials.length} testimonials. 3 is the sweet spot.` });
  }

  // Check testimonial quality
  for (const t of siteData.testimonials) {
    if (t.text.length < 30) {
      issues.push({ severity: "suggestion", section: "Testimonials", message: `Review from "${t.name}" is very short. Longer reviews build more trust.` });
    }
    if (t.name === "Happy Customer" || t.name === "Client" || t.name === "Patient") {
      issues.push({ severity: "suggestion", section: "Testimonials", message: `"${t.name}" is a generic name. Real names build more credibility.` });
    }
  }

  // About section
  if (!siteData.about || siteData.about.length < 50) {
    issues.push({ severity: "warning", section: "About", message: "About section is missing or too short. Needs a compelling business story." });
  }

  // --- Design Checks ---

  // Accent color matches category
  const expectedColor = CATEGORY_CONFIG[siteData.category]?.accentColor;
  if (expectedColor && siteData.accentColor !== expectedColor) {
    issues.push({ severity: "suggestion", section: "Design", message: "Accent color doesn't match category default. May be intentional." });
  }

  // Stats
  if (siteData.stats.length < 3) {
    issues.push({ severity: "suggestion", section: "Stats", message: "Less than 3 stats. 4 stats fills out the bar nicely." });
  }

  // --- Image Quality Checks ---

  if ((siteData.photos || []).length !== sanitizedPhotos.length) {
    issues.push({
      severity: "warning",
      section: "Images",
      message: "One or more image URLs contained whitespace, control characters, or duplicates and required sanitization before QC.",
    });
  }

  if (sanitizedPhotos.length === 0) {
    issues.push({
      severity: "critical",
      section: "Images",
      message: `No photos available. The site would fall back to stock imagery such as ${getCategoryFallbackImage(siteData.category, "hero")}, but real business photos are still required for approval.`,
    });
  } else if (sanitizedPhotos.length < minimumPhotoCount) {
    issues.push({
      severity: GALLERY_HEAVY_CATEGORIES.has(siteData.category) ? "critical" : "warning",
      section: "Images",
      message: GALLERY_HEAVY_CATEGORIES.has(siteData.category)
        ? `Only ${sanitizedPhotos.length} usable photos. ${siteData.category} sites are gallery-heavy and require at least ${minimumPhotoCount} real photos.`
        : `Only ${sanitizedPhotos.length} usable photos. Need at least ${minimumPhotoCount} for hero, about, and gallery coverage.`,
    });
  }

  const invalidImages = photoValidations.filter((validation) => !validation.isValid);
  if (invalidImages.length > 0) {
    issues.push({
      severity: "critical",
      section: "Images",
      message: `${invalidImages.length} image URL(s) are malformed, missing, or use an invalid protocol. All production images must be valid http/https URLs after trimming.`,
    });
  }

  const lowQualityImages = photoValidations.filter((validation) =>
    validation.issues.some((issue) =>
      ["tiny_dimensions", "blur_parameter", "expired_token", "screenshot_pattern"].includes(issue.code)
    )
  );
  if (lowQualityImages.length > 0) {
    issues.push({
      severity: lowQualityImages.length >= 2 ? "warning" : "suggestion",
      section: "Images",
      message: `${lowQualityImages.length} image URL(s) look low quality based on thumbnail dimensions, blur/compression parameters, screenshots, or expiring CDN tokens.`,
    });
  }

  const duplicateImages = getDuplicateImageUrls(sanitizedPhotos);
  if (duplicateImages.length > 0) {
    issues.push({
      severity: "warning",
      section: "Images",
      message: `${duplicateImages.length} duplicate image URL(s) detected across hero/about/gallery sections. Images should be visually distinct across the site.`,
    });
  }

  const heroValidation = validateImageUrl(sanitizedPhotos[0], siteData.category, "hero");
  if (!sanitizedPhotos[0]) {
    issues.push({
      severity: "critical",
      section: "Hero Image",
      message: "photos[0] is missing. Every preview must have a valid hero image in the first photo slot.",
    });
  } else if (heroValidation.issues.some((issue) => issue.code === "logo_or_icon")) {
    issues.push({
      severity: "critical",
      section: "Hero Image",
      message: "photos[0] appears to be a logo or icon. The hero image must be a real contextual photo.",
    });
  } else if (heroValidation.shouldUseFallback) {
    issues.push({
      severity: "critical",
      section: "Hero Image",
      message: `photos[0] is not strong enough for a hero section. Replace it with a higher-quality image or the approved ${siteData.category} fallback ${heroValidation.fallbackUrl}.`,
    });
  }

  const aboutImageValidation = sanitizedPhotos[1]
    ? validateImageUrl(sanitizedPhotos[1], siteData.category, "about")
    : null;
  if (aboutImageValidation && aboutImageValidation.shouldUseFallback) {
    issues.push({
      severity: "suggestion",
      section: "About Image",
      message: `The about image URL looks weak. Consider replacing it with a better real image or the category fallback ${aboutImageValidation.fallbackUrl}.`,
    });
  }

  // --- Customization Checks ---

  // Logo
  if (!sanitizedPhotos.some((p) => p.toLowerCase().includes("logo"))) {
    issues.push({ severity: "suggestion", section: "Customization", message: "No logo found. Text-based logo will be used as fallback." });
  }

  if (siteData.about && siteData.about.includes("is a trusted") && siteData.about.includes("committed to delivering")) {
    issues.push({ severity: "warning", section: "Customization", message: "About section appears to be a generic default. Scrape their real about text if possible." });
  }

  // Social links enhance credibility
  if (!siteData.socialLinks || Object.keys(siteData.socialLinks).length === 0) {
    issues.push({ severity: "suggestion", section: "Customization", message: "No social media links found. Check their Google profile for Instagram/Facebook." });
  }

  // --- Category-Specific Checks ---
  checkCategorySpecific(siteData.category, siteData, issues);

  // --- Score Calculation ---
  let score = 100;
  let suggestionDeductions = 0;
  for (const issue of issues) {
    if (issue.severity === "critical") score -= 20;
    else if (issue.severity === "warning") score -= 10;
    else { suggestionDeductions += 2; } // suggestions are minor (2pts, capped at 15)
  }
  score -= Math.min(suggestionDeductions, 15); // Cap suggestion deductions
  score = Math.max(0, Math.min(100, score));

  const passed = score >= 70 && issues.filter((i) => i.severity === "critical").length === 0;

  return {
    score,
    passed,
    issues,
    timestamp: new Date().toISOString(),
  };
}

function checkCategorySpecific(
  category: Category,
  data: GeneratedSiteData,
  issues: QualityIssue[]
) {
  switch (category) {
    case "real-estate":
      if (!data.services.some((s) => s.name.toLowerCase().includes("buyer") || s.name.toLowerCase().includes("seller"))) {
        issues.push({ severity: "suggestion", section: "Real Estate", message: "Missing buyer/seller representation services." });
      }
      break;
    case "dental":
      if (!data.services.some((s) => s.name.toLowerCase().includes("emergency"))) {
        issues.push({ severity: "suggestion", section: "Dental", message: "Missing emergency care service — important for dental sites." });
      }
      break;
    case "law-firm":
      if (!data.about?.toLowerCase().includes("consultation") && !data.tagline?.toLowerCase().includes("consultation")) {
        issues.push({ severity: "suggestion", section: "Law Firm", message: "No mention of free consultation — strong CTA for law firms." });
      }
      break;
    case "salon":
      if (!data.services.some((s) => s.price)) {
        issues.push({ severity: "warning", section: "Salon", message: "No prices listed. Salon clients expect to see pricing." });
      }
      break;
    default:
      break;
  }
}

export function formatQualityReport(report: QualityReport): string {
  const lines: string[] = [];
  lines.push(`Quality Score: ${report.score}/100 ${report.passed ? "PASSED" : "NEEDS FIXES"}`);
  lines.push("");

  const critical = report.issues.filter((i) => i.severity === "critical");
  const warnings = report.issues.filter((i) => i.severity === "warning");
  const suggestions = report.issues.filter((i) => i.severity === "suggestion");

  if (critical.length > 0) {
    lines.push("CRITICAL:");
    critical.forEach((i) => lines.push(`  - [${i.section}] ${i.message}`));
  }
  if (warnings.length > 0) {
    lines.push("WARNINGS:");
    warnings.forEach((i) => lines.push(`  - [${i.section}] ${i.message}`));
  }
  if (suggestions.length > 0) {
    lines.push("SUGGESTIONS:");
    suggestions.forEach((i) => lines.push(`  - [${i.section}] ${i.message}`));
  }

  if (report.issues.length === 0) {
    lines.push("No issues found. Site looks great!");
  }

  return lines.join("\n");
}
