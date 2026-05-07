import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";

/**
 * Layout for /clients/meyer-electric — Meyer Electric LLC, Sequim WA.
 * Custom-tier bespoke premium build for the Olympic Peninsula's Tesla
 * Powerwall Certified Installer + Generac Authorized Dealer + general
 * licensed electrical contractor.
 *
 * Aesthetic: dark electrician — pure near-black background with bright
 * yellow (#facc15) lightning-bolt accent. Matches the screenshot
 * template Ben sourced and the CLAUDE.md "Dark Professional" theme.
 *
 * Fonts: Space Grotesk (headings) + Inter (body) — CLAUDE.md typography
 * pairing for electrician/plumber/HVAC categories.
 *
 * SEO HARDENING (audit 2026-05-06):
 * - Full metadata override on canonical / Open Graph / Twitter so social
 *   shares + Google index Meyer-specific content (root layout otherwise
 *   leaks BlueJays homepage values into every page).
 * - Meyer-specific og-image points at the Powerwall storm hero photo.
 * - Electrician + LocalBusiness JSON-LD schema injected for rich-result
 *   eligibility on Google. Coexists additively with the root BlueJays
 *   ProfessionalService schema — Google treats multiple LD blocks fine.
 */

const SITE_URL = "https://bluejayportfolio.com";
const PAGE_PATH = "/clients/meyer-electric";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const HERO_OG_IMAGE = `${SITE_URL}/images/meyer-electric/hero-powerwall-storm.jpg`;

const TITLE =
  "Meyer Electric LLC — Tesla Powerwall, Generators & Licensed Electrician · Sequim, WA";
const DESCRIPTION =
  "Olympic Peninsula's Tesla Powerwall Certified Installer + Generac Authorized Dealer. Licensed, bonded & insured. 15+ years powering Sequim, Port Angeles, Port Townsend, and the entire Olympic Peninsula. Call (360) 477-2202.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Override the root layout's BlueJays-generic keywords with
  // electrician-/Sequim-specific terms.
  keywords: [
    "electrician Sequim WA",
    "Tesla Powerwall installer Sequim",
    "Tesla Powerwall Certified Installer",
    "Generac Authorized Dealer Sequim",
    "Generac generator installation Sequim",
    "Olympic Peninsula electrician",
    "Port Angeles electrician",
    "Port Townsend electrician",
    "licensed electrician Clallam County",
    "panel upgrade Sequim",
    "underground power installation Sequim",
    "EV charger installer Sequim",
    "whole home backup power Sequim",
    "Meyer Electric LLC",
  ],
  robots: { index: true, follow: true },
  // Canonical MUST point at this URL — root layout otherwise sets it to
  // bluejayportfolio.com which de-indexes this page as a duplicate.
  alternates: {
    canonical: PAGE_URL,
  },
  // Full Open Graph override so social shares (FB, iMessage, Slack,
  // LinkedIn, Discord) display Meyer's own branding + photo.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Meyer Electric LLC",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: HERO_OG_IMAGE,
        width: 2000,
        height: 1334,
        alt: "Tesla Powerwall installed on a home during a stormy night — Meyer Electric, Olympic Peninsula's certified Powerwall installer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [HERO_OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

/**
 * Electrician + LocalBusiness JSON-LD schema for Google rich results.
 * Injected as a string-typed <script> so Next.js doesn't try to
 * interpret it as a React component.
 *
 * Why "Electrician" type: Google's structured-data vocab treats it as
 * an alias of LocalBusiness with category context. AreaServed includes
 * all 10 Olympic Peninsula cities Meyer covers per their own site.
 *
 * priceRange "$$" is reasonable for licensed-electrician pricing
 * (Generac install ~$5K-$10K, Powerwall ~$11K+, panel upgrades $1.5K+).
 */
const meyerSchema = {
  "@context": "https://schema.org",
  "@type": "Electrician",
  "@id": `${PAGE_URL}#business`,
  name: "Meyer Electric LLC",
  alternateName: "Meyer Electric",
  description:
    "Tesla Powerwall Certified Installer + Generac Authorized Dealer serving the Olympic Peninsula. Licensed, bonded & insured electrical contractor with 15+ years of clean, code-compliant installations.",
  url: PAGE_URL,
  image: HERO_OG_IMAGE,
  logo: `${SITE_URL}/images/meyer-electric/banner-logo.jpg`,
  telephone: "+1-360-477-2202",
  priceRange: "$$",
  // License number — Washington State electrical contractor license
  identifier: {
    "@type": "PropertyValue",
    propertyID: "WA-Contractor-License",
    value: "MEYERE*862P1",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "35 Robbins Rd",
    addressLocality: "Sequim",
    addressRegion: "WA",
    postalCode: "98382",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 48.0794,
    longitude: -123.1024,
  },
  areaServed: [
    "Sequim, WA",
    "Port Angeles, WA",
    "Port Townsend, WA",
    "Forks, WA",
    "Clallam Bay, WA",
    "Sekiu, WA",
    "Chimacum, WA",
    "Quilcene, WA",
    "Kingston, WA",
    "Poulsbo, WA",
  ].map((city) => ({ "@type": "City", name: city })),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Electrical Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Tesla Powerwall Installation",
          description:
            "Tesla Powerwall battery storage system installation by a Tesla-Certified Installer. Includes permits, install, Tesla app setup, and tie-in to existing or new solar.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Generac Standby Generator Installation",
          description:
            "Generac standby generator installation by an authorized dealer. Auto-start when grid fails, sized to your home, propane or natural gas, 5-year limited warranty.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Underground Power Installation",
          description:
            "Underground power line installation — trenching, conduit, and final hookup. Code-compliant, depth-rated, built to last decades.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Electrical Service Upgrades",
          description:
            "Service upgrades, panel replacements, lighting, EV chargers, troubleshooting. Residential, commercial, and new construction.",
        },
      },
    ],
  },
  knowsAbout: [
    "Tesla Powerwall",
    "Generac generators",
    "Solar energy storage",
    "Electrical panel upgrades",
    "EV charging installation",
    "Underground power",
    "Whole-home backup power",
    "Code-compliant electrical work",
  ],
  sameAs: ["https://www.sequimelectrician.com/"],
};

export default function MeyerElectricLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Google Fonts: Space Grotesk (headings) + Inter (body) per
          CLAUDE.md typography table for electrician category. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {/* Meyer-specific scrollbar — vertical gradient orange → yellow →
          white over a near-black track. Mirrors the lightning-bolt
          accent palette used throughout the page. Targets the document
          scrollbar globally, but Next only injects this style block
          while the visitor is inside the /clients/meyer-electric
          subtree, so it doesn't leak to other tenant pages. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html { scrollbar-color: #facc15 #0a0a0a; scrollbar-width: thin; }
            ::-webkit-scrollbar { width: 12px; height: 12px; }
            ::-webkit-scrollbar-track { background: #0a0a0a; }
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #f97316 0%, #facc15 50%, #ffffff 100%);
              border-radius: 6px;
              border: 2px solid #0a0a0a;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #ea580c 0%, #eab308 50%, #f1f5f9 100%);
            }
            ::-webkit-scrollbar-corner { background: #0a0a0a; }
          `,
        }}
      />
      {/* Meyer-specific structured data — Electrician/LocalBusiness
          schema for Google rich results. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(meyerSchema) }}
      />
      <ClientTrackingScripts slug="meyer-electric" />
      {children}
    </>
  );
}
