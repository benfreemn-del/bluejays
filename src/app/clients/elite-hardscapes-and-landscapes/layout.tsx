import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";
import BackToTopButton from "@/components/BackToTopButton";

/**
 * Elite Hardscapes & Landscaping — Tyler Fritz, Port Angeles WA.
 * Custom-tier bespoke build ($1k). Rugged American craftsman aesthetic:
 * matte-black background, steel-chrome details, crimson accents.
 *
 * Pattern reference: masters-window-tinting (dark luxury) + Hector
 * (landscaping structure). Real photos from Tyler's portfolio,
 * mailto: contact (no portal backend — No-Backend Client Pattern).
 */

const SITE_URL =
  "https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes";
const HERO_PHOTO_URL =
  "https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes/photos/RenderedImage.jpg";

const TITLE =
  "Elite Hardscapes & Landscaping · Port Angeles WA · Pavers, Walls, Lawn Care";
const DESCRIPTION =
  "Olympic Peninsula's hands-on hardscape + landscape crew. Retaining walls, paver patios, fences, hydroseed, plantings, and weekly property maintenance — Sequim, Port Angeles, Port Townsend, Forks. Locally owned, fully insured. Owner-operated by Tyler Fritz.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Elite Hardscapes & Landscaping",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: HERO_PHOTO_URL,
        width: 1800,
        height: 2400,
        alt: "Elite Hardscapes & Landscaping — Olympic Peninsula property maintenance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [HERO_PHOTO_URL],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

// LocalBusiness JSON-LD — fuels Google's Knowledge Panel + Maps surfacing
// and beats out generic site-wide schema for local queries.
const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": SITE_URL,
  name: "Elite Hardscapes & Landscaping",
  url: SITE_URL,
  image: HERO_PHOTO_URL,
  logo: "https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes/photos/9BC866E7-33A3-4704-B978-7D3BED20191C.png",
  description: DESCRIPTION,
  telephone: "+1-360-797-4448",
  founder: { "@type": "Person", name: "Tyler Fritz" },
  foundingDate: "2022",
  address: {
    "@type": "PostalAddress",
    streetAddress: "9321 Old Olympic Hwy",
    addressLocality: "Port Angeles",
    addressRegion: "WA",
    addressCountry: "US",
  },
  areaServed: [
    "Sequim, WA",
    "Port Angeles, WA",
    "Carlsborg, WA",
    "Port Townsend, WA",
    "Joyce, WA",
    "Diamond Point, WA",
    "Forks, WA",
    "Clallam County, WA",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "07:00",
      closes: "18:00",
    },
  ],
  priceRange: "$$",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.7",
    reviewCount: "13",
    bestRating: "5",
    worstRating: "1",
  },
  knowsAbout: [
    "Retaining wall installation",
    "Paver patios",
    "Hardscape design",
    "Landscape design and installation",
    "Hydroseed lawn installation",
    "Cedar fencing",
    "Lawn maintenance",
    "Property maintenance",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Hardscape Construction",
          description:
            "Retaining walls, paver patios, walkways, fire pits, cedar fencing.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Landscape Design & Install",
          description:
            "Bed design, native plantings, hydroseed and sod lawns, mulch refresh.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Property Maintenance",
          description:
            "Weekly and bi-weekly mowing routes, seasonal cleanups, brush clearing.",
        },
      },
    ],
  },
};

export default function EliteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA),
        }}
      />
      <ClientTrackingScripts slug="elite-hardscapes-and-landscapes" />
      {children}
      <BackToTopButton bg="#c2410c" fg="#fbf7ee" />
    </>
  );
}
