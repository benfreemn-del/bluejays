import type { Prospect, ScrapedData, ServiceItem, Testimonial } from "./types";

/**
 * Pre-fill data shape for the 3-step onboarding form. Every field is
 * optional so the form can render even when scraping found nothing.
 *
 * The flow:
 *   1. The form fetches `/api/prospects/[id]` on mount
 *   2. `getPrefillData(prospect)` packages everything we already know
 *      from `scrapedData` into the form's initial values
 *   3. The user only edits what's wrong, dramatically reducing typing
 *
 * Anything we surface here MUST come from real scraped/Google data on
 * the prospect record — never invent values, never use category-default
 * filler. If a field is unknown, leave it undefined and let the user
 * fill it in.
 */
export interface OnboardingPrefillData {
  // Step 1 — Essentials
  businessName: string;
  phone: string;
  email: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;

  // Step 2 — Content
  services: string;          // multi-line, one service per line
  about: string;
  tagline: string;
  hours: string;
  testimonials: TestimonialPrefill[];
  socialLinks: string;       // multi-line, one link per line

  // Step 3 — Preferences
  domainPreference: string;  // current domain if scraped, else blank
}

export interface TestimonialPrefill {
  name: string;
  quote: string;
  city: string;
}

const EMPTY_TESTIMONIAL: TestimonialPrefill = { name: "", quote: "", city: "" };

/**
 * Build the form's initial values from a prospect record. Pulls
 * defensively — `scrapedData` may have any shape (loose `[key: string]: any`
 * type) so every read is wrapped in optional chaining + fallback.
 */
export function getPrefillData(
  prospect: Pick<
    Prospect,
    "businessName" | "phone" | "email" | "scrapedData" | "currentWebsite"
  > & { ownerName?: string }
): OnboardingPrefillData {
  const scraped = (prospect.scrapedData || {}) as ScrapedData;

  // ── Logo ───────────────────────────────────────────────────────────
  const logoUrl = typeof scraped.logoUrl === "string" ? scraped.logoUrl : "";

  // ── Brand colors ───────────────────────────────────────────────────
  // Prefer explicit accent (post-color-review) → brandColor (raw scrape) → blank.
  // Don't surface the category-default if the source is "category-default" —
  // that's not actually their brand color, just a stand-in.
  const sourceWasReal = scraped.brandColorSource && scraped.brandColorSource !== "category-default";
  const primaryColor =
    (sourceWasReal && typeof scraped.brandColor === "string" ? scraped.brandColor : "") || "";
  const accentColor =
    (typeof scraped.accentColor === "string" ? scraped.accentColor : "") ||
    primaryColor ||
    "";

  // ── Services ───────────────────────────────────────────────────────
  // ScrapedData.services is `ServiceItem[]` — pull names, one per line.
  const services = Array.isArray(scraped.services)
    ? scraped.services
        .map((s: ServiceItem | string) =>
          typeof s === "string" ? s : (s?.name || "").trim()
        )
        .filter(Boolean)
        .join("\n")
    : "";

  // ── About ──────────────────────────────────────────────────────────
  const about = typeof scraped.about === "string" ? scraped.about : "";

  // ── Tagline ────────────────────────────────────────────────────────
  const tagline = typeof scraped.tagline === "string" ? scraped.tagline : "";

  // ── Hours ──────────────────────────────────────────────────────────
  const hours = typeof scraped.hours === "string" ? scraped.hours : "";

  // ── Testimonials ───────────────────────────────────────────────────
  // Up to 3 testimonial slots. Each becomes { name, quote, city }.
  const rawTestimonials = Array.isArray(scraped.testimonials)
    ? scraped.testimonials.slice(0, 3)
    : [];
  const testimonials: TestimonialPrefill[] = [0, 1, 2].map((i) => {
    const t = rawTestimonials[i] as
      | (Testimonial & { author?: string; quote?: string; city?: string })
      | undefined;
    if (!t) return { ...EMPTY_TESTIMONIAL };
    // The Testimonial type uses {name, text} but scrapers historically
    // also stash {author, quote} — read either shape.
    const name = (t.name as string | undefined) || (t.author as string | undefined) || "";
    const quote = (t.text as string | undefined) || (t.quote as string | undefined) || "";
    const city = (t.city as string | undefined) || "";
    return { name, quote, city };
  });

  // ── Social links ───────────────────────────────────────────────────
  // ScrapedData.socialLinks is Record<string,string>. Flatten to lines.
  const socialLines: string[] = [];
  if (scraped.socialLinks && typeof scraped.socialLinks === "object") {
    for (const [, url] of Object.entries(scraped.socialLinks as Record<string, string>)) {
      if (typeof url === "string" && url.trim()) {
        socialLines.push(url.trim());
      }
    }
  }
  const socialLinks = socialLines.join("\n");

  // ── Domain ─────────────────────────────────────────────────────────
  // Pull whatever they're using today as a starting point — they can
  // edit if they want a new one.
  const domainPreference = (() => {
    const cw = prospect.currentWebsite || "";
    if (!cw) return "";
    try {
      const u = new URL(cw.startsWith("http") ? cw : `https://${cw}`);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return cw;
    }
  })();

  return {
    businessName: prospect.businessName || "",
    phone: prospect.phone || "",
    email: prospect.email || "",
    logoUrl,
    primaryColor,
    accentColor,
    services,
    about,
    tagline,
    hours,
    testimonials,
    socialLinks,
    domainPreference,
  };
}

/**
 * Helper for the form to detect whether the prefill is "rich" enough
 * to skip a step. Currently unused but available for future logic
 * (e.g. "if we already have logo + colors + services, skip step 2").
 */
export function getPrefillCompleteness(p: OnboardingPrefillData): {
  step1Complete: boolean;
  step2Complete: boolean;
} {
  const step1Complete =
    !!p.businessName && !!p.phone && !!p.email && !!p.logoUrl && (!!p.primaryColor || !!p.accentColor);
  const step2Complete =
    !!p.services && !!p.about && !!p.tagline;
  return { step1Complete, step2Complete };
}
