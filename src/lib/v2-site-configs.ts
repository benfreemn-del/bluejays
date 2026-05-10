/**
 * v2-site-configs.ts — per-tenant data layer for the 47 V2 site
 * templates.
 *
 * Per `docs/MOCK_BACKEND_TEMPLATE_AUDIT.md` roadmap #6 — V2 templates
 * (`src/app/v2/<category>/page.tsx`) are 1,000-1,400 lines each and
 * fully self-contained. Industry copy + design is shared across every
 * prospect in the category, but per-tenant strings (business name,
 * phone, address, hero image, service-area, brand color) get baked
 * inline into the template — meaning any prospect customization
 * requires editing the template itself.
 *
 * The fix: extract the per-tenant data to this registry. Templates
 * become a function of category × config. Adding a new prospect =
 * one config object, not a 1,000-line edit.
 *
 * Pattern same as src/lib/portal-configs.ts (per-tenant portal data)
 * and src/lib/service-clients.ts (per-tenant scout/funnel data) —
 * one more registry alongside.
 *
 * v1 (this file): defines the type, ships the electrician anchor
 * config (Meyer Electric — already the V2 reference). Other 46
 * templates migrate one-by-one as prospects close. Each migration
 * = ~10 min: read the template's hardcoded strings, drop them into
 * a config entry here, swap the template's literals for config
 * accessors.
 *
 * Usage from a V2 template:
 *   import { getV2SiteConfig } from "@/lib/v2-site-configs";
 *   const cfg = getV2SiteConfig("electrician", "meyer-electric");
 *   ...
 *   <h1>{cfg.businessName}</h1>
 *   <a href={`tel:${cfg.phone}`}>{cfg.phone}</a>
 */

export interface V2SiteConfig {
  /** Tenant slug — matches client_owners.client_slug */
  slug: string;
  /** Category (links to docs/mock-backends/<category>.md spec) */
  category: string;

  /* ── Business basics ── */
  businessName: string;
  businessShortName: string;
  ownerFirstName: string;
  /** Tagline / sub-headline — usually 6-12 words */
  tagline: string;

  /* ── Contact ── */
  phone: string;
  /** Plain-text formatted address for footer */
  address: string;
  /** Public-facing email (info@ / hello@) */
  email: string;
  /** Service area description for hero / SEO */
  serviceArea: string;

  /* ── Visual ── */
  /** Hero image URL — Unsplash / CDN / direct upload */
  heroImage: string;
  /** Hex brand-accent color for headings + CTAs */
  brandColor: string;
  /** Optional logo URL — falls back to wordmark when null */
  logoUrl?: string;

  /* ── Marketing levers ── */
  /** Lead-magnet copy block — appears in hero / sidebar */
  leadMagnetTitle: string;
  leadMagnetSubtitle: string;
  /** Primary CTA text (e.g. "Book Now" / "Get a Quote") */
  primaryCta: string;
  /** Years-in-business or trust-building stat */
  yearsInBusiness?: number;
  /** Reviews count (optional — pulls Google reviews if available) */
  reviewsCount?: number;
  reviewsRating?: number;

  /* ── Service mix (drives services-grid section) ── */
  /** Industry-specific service line items, 4-8 typical */
  serviceLines: Array<{
    name: string;
    description: string;
    /** Optional icon-name; renderer picks the matching SVG */
    icon?: string;
  }>;

  /* ── Social proof ── */
  testimonials: Array<{
    quote: string;
    author: string;
    /** Optional context — "homeowner in Sequim" / "Realtor at RE/MAX" */
    context?: string;
  }>;
}

/* ─────────────────────────── REGISTRY ─────────────────────────── */

/**
 * Meyer Electric — anchor config for the electrician category. The
 * canonical reference build (per MOCK_BACKEND_PLAYBOOK.md) and the
 * first config to extract from V2 inline templates.
 *
 * Other 46 templates migrate one-by-one as prospects close. Pattern:
 *   1. Read src/app/v2/<category>/page.tsx for hardcoded strings
 *   2. Drop them into a new entry here keyed by tenant slug
 *   3. Swap template literals for `cfg.businessName` etc.
 */
const MEYER_ELECTRIC: V2SiteConfig = {
  slug: "meyer-electric",
  category: "electrician",
  businessName: "Meyer Electric",
  businessShortName: "Meyer Electric",
  ownerFirstName: "Joel",
  tagline: "Powerwall + generator installs, panel upgrades, service work — Olympic Peninsula since 1994.",
  phone: "(360) 670-3367",
  address: "Sequim, WA 98382",
  email: "hello@meyerelectric.com",
  serviceArea: "Olympic Peninsula — Sequim, Port Angeles, Port Townsend, Bremerton",
  heroImage: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&q=80",
  brandColor: "#fbbf24", // Meyer yellow
  leadMagnetTitle: "Get a free Powerwall fit assessment",
  leadMagnetSubtitle: "30-second form. We'll tell you if your home + monthly bill make Powerwall a worthwhile investment.",
  primaryCta: "Book a free assessment",
  yearsInBusiness: 30,
  reviewsCount: 187,
  reviewsRating: 4.9,
  serviceLines: [
    {
      name: "Tesla Powerwall installs",
      description: "Battery backup + solar pairing. Olympic Peninsula's #1-volume Powerwall installer.",
      icon: "battery",
    },
    {
      name: "Generac generator installs",
      description: "Whole-home backup generators sized + permitted + maintained.",
      icon: "lightning",
    },
    {
      name: "Panel + service upgrades",
      description: "200-amp upgrades, sub-panels, EV charger circuits, code-compliant rewires.",
      icon: "panel",
    },
    {
      name: "Residential service work",
      description: "Outlets, switches, lighting, troubleshoot — same-week scheduling.",
      icon: "wrench",
    },
  ],
  testimonials: [
    {
      quote:
        "Joel's team got our Powerwall installed in a single day and the difference in our power bill is night-and-day.",
      author: "Sarah M.",
      context: "homeowner · Sequim",
    },
    {
      quote:
        "Used Meyer Electric for two property-management buildings — fast turnaround on permits + clean install.",
      author: "Mike T.",
      context: "property manager · Port Angeles",
    },
    {
      quote:
        "After a tree took out our service line we called Meyer. They had us back online before the storm cleanup crew left.",
      author: "Linda K.",
      context: "homeowner · Bremerton",
    },
  ],
};

const REGISTRY: Record<string, V2SiteConfig> = {
  "meyer-electric": MEYER_ELECTRIC,
};

/* ─────────────────────────── PUBLIC API ─────────────────────────── */

/**
 * Look up a per-tenant V2 site config. Returns null when the slug
 * isn't registered — callers should fall back to a generic
 * placeholder config or render the category-default strings hardcoded
 * in the template (legacy behavior preserved during migration).
 */
export function getV2SiteConfig(category: string, slug: string): V2SiteConfig | null {
  const cfg = REGISTRY[slug];
  if (!cfg) return null;
  if (cfg.category !== category) {
    // Slug exists but for a different category — defensive null
    console.warn(
      `[v2-site-configs] slug=${slug} is registered for category=${cfg.category}, not ${category}`,
    );
    return null;
  }
  return cfg;
}

/**
 * Returns every registered V2 config for a given category. Used by
 * /v2/<category>/[tenant]/page.tsx routes if/when we ship per-tenant
 * sub-routes (deferred until first cold-pitch demand).
 */
export function listConfigsByCategory(category: string): V2SiteConfig[] {
  return Object.values(REGISTRY).filter((c) => c.category === category);
}

/**
 * Generic placeholder config — used when rendering a V2 template for
 * a brand-new category that has no registered tenant yet (cold-pitch
 * preview path). Returns a "your business here" shell.
 */
export function placeholderConfig(category: string): V2SiteConfig {
  return {
    slug: `placeholder-${category}`,
    category,
    businessName: "Your Business",
    businessShortName: "Your Business",
    ownerFirstName: "Owner",
    tagline: "Local pros — fast turnaround, fair pricing, real reviews.",
    phone: "(555) 555-5555",
    address: "Your City, ST 00000",
    email: "hello@yourbusiness.com",
    serviceArea: "Your service area",
    heroImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
    brandColor: "#3b82f6",
    leadMagnetTitle: "Get a free quote",
    leadMagnetSubtitle: "Fast turnaround on every quote — most prospects hear back within 4 hours.",
    primaryCta: "Get started",
    serviceLines: [
      { name: "Service line 1", description: "Industry-specific copy goes here." },
      { name: "Service line 2", description: "Industry-specific copy goes here." },
      { name: "Service line 3", description: "Industry-specific copy goes here." },
    ],
    testimonials: [],
  };
}
