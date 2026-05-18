import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";

/**
 * Layout for /clients/peninsula-paving — Peninsula Paving & Excavating,
 * Sequim WA. Bespoke premium showcase for the Olympic Peninsula's 41-
 * year-old family paving + excavation crew (founded 1985 by Cyril &
 * Ella Frick). No-website prospect — this is the proof-of-quality
 * pitch piece + mock-backend tour preview for the $10k AI System
 * sales motion.
 *
 * Aesthetic: dark asphalt with warm copper/orange accent (#ea580c).
 * DIFFERENTIATED from Meyer Electric's yellow #facc15 — same town,
 * different client. Orange evokes fresh-laid asphalt + road work
 * cones + Sequim sunset (the "sunny side of the Olympics").
 *
 * Fonts: Space Grotesk (heads) + Inter (body) — CLAUDE.md trade
 * category typography pairing.
 *
 * SEO: full metadata override + Paving/LocalBusiness JSON-LD schema.
 * Pattern carried over from meyer-electric/layout.tsx.
 */

const SITE_URL = "https://bluejayportfolio.com";
const PAGE_PATH = "/clients/peninsula-paving";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const TITLE =
  "Peninsula Paving & Excavating — Driveways, Parking Lots & Site Work · Sequim, WA";
const DESCRIPTION =
  "41 years paving driveways, parking lots, and roads across the Olympic Peninsula. Family-owned in Sequim. Asphalt paving, seal coating, line striping, excavation, grading, demolition. Call (360) 477-7015 for a free estimate.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "paving Sequim WA",
    "asphalt paving Sequim",
    "driveway paving Sequim",
    "Olympic Peninsula paving",
    "Port Angeles asphalt",
    "Port Townsend paving",
    "Clallam County paving contractor",
    "seal coating Sequim",
    "line striping Sequim",
    "parking lot paving Olympic Peninsula",
    "excavation Sequim",
    "grading Sequim",
    "Peninsula Paving & Excavating",
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Peninsula Paving & Excavating",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${SITE_URL}/clients/peninsula-paving/logo.jpeg`,
        width: 1024,
        height: 1024,
        alt: "Peninsula Paving & Excavating — circular PP monogram badge, Est. 1985, Sequim WA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/clients/peninsula-paving/logo.jpeg`],
  },
};

export const viewport: Viewport = {
  themeColor: "#fefdfb",
  width: "device-width",
  initialScale: 1,
};

/**
 * Paving Contractor / LocalBusiness JSON-LD. GeneralContractor is the
 * closest specific schema.org type for paving; we add hasOfferCatalog
 * for the actual service breakdown so Google can surface individual
 * services in rich results.
 */
const peninsulaSchema = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "@id": `${PAGE_URL}#business`,
  name: "Peninsula Paving & Excavating",
  alternateName: "Peninsula Paving",
  description:
    "Family-owned asphalt paving + excavation contractor serving the Olympic Peninsula since 1985. Driveways, parking lots, roads, seal coating, line striping, grading, demolition.",
  url: PAGE_URL,
  image: `${SITE_URL}/clients/peninsula-paving/logo.jpeg`,
  logo: `${SITE_URL}/clients/peninsula-paving/logo.jpeg`,
  telephone: "+1-360-477-7015",
  priceRange: "$$",
  foundingDate: "1985",
  address: {
    "@type": "PostalAddress",
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
    "Carlsborg, WA",
    "Diamond Point, WA",
    "Blyn, WA",
    "Dungeness, WA",
    "Gardiner, WA",
    "Joyce, WA",
    "Quilcene, WA",
    "Chimacum, WA",
    "Forks, WA",
  ].map((city) => ({ "@type": "City", name: city })),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "17:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Paving & Excavation Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Asphalt Paving",
          description:
            "Residential driveways, commercial parking lots, private roads, and HOA shared access. Hot-mix asphalt installed and compacted to spec.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Seal Coating",
          description:
            "Asphalt seal coating to protect against UV, water intrusion, oil, and Pacific Northwest winters. Recommended every 3-5 years.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Line Striping & Pavement Marking",
          description:
            "Parking lot striping, ADA stalls, fire lanes, directional arrows, and custom curb painting.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Excavation & Grading",
          description:
            "Site prep, sub-grade compaction, drainage, French drains, and final grade for paving or building pads.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Demolition & Removal",
          description:
            "Asphalt removal, concrete demolition, hauling, and site cleanup before a fresh install.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Crack Filling & Pothole Repair",
          description:
            "Sealant on cracks before they spider. Hot patch on potholes before they swallow tires.",
        },
      },
    ],
  },
  knowsAbout: [
    "Asphalt paving",
    "Driveway installation",
    "Parking lot construction",
    "Seal coating",
    "Line striping",
    "Excavation",
    "Site grading",
    "Sub-grade preparation",
    "Drainage",
    "Demolition",
  ],
};

export default function PeninsulaPavingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Fonts loaded server-side via <link> in this layout — NEVER
          inject in a "use client" component (CLAUDE.md Turbopack
          16.2.2 build-hang rule). */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap"
        rel="stylesheet"
      />
      {/* Peninsula-specific scrollbar — light cream track + warm
          yellow→copper gradient thumb. Matches the light theme. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              scrollbar-color: #ea580c #fef9ed !important;
              scrollbar-width: thin !important;
              background: #fefdfb !important;
            }
            html::-webkit-scrollbar,
            body::-webkit-scrollbar,
            ::-webkit-scrollbar {
              width: 12px !important;
              height: 12px !important;
              background: #fef9ed !important;
            }
            html::-webkit-scrollbar-track,
            body::-webkit-scrollbar-track,
            ::-webkit-scrollbar-track {
              background: #fef9ed !important;
            }
            html::-webkit-scrollbar-thumb,
            body::-webkit-scrollbar-thumb,
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 35%, #ea580c 80%, #c2410c 100%) !important;
              border-radius: 6px !important;
              border: 2px solid #fef9ed !important;
            }
            ::-webkit-scrollbar-corner { background: #fef9ed !important; }
          `,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(peninsulaSchema) }}
      />
      <ClientTrackingScripts slug="peninsula-paving" />
      {children}
    </>
  );
}
