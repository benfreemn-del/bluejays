import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import BackToTopButton from "@/components/BackToTopButton";

/**
 * Layout for /clients/mt-view-landscaping — Mountain View Landscape & Design Inc.
 * (Auburn, WA). Custom-tier bespoke build for the Hunsaker family's 49-year-old
 * landscape firm serving King, Pierce, Snohomish, and Kittitas counties.
 *
 * v4 redesign (2026-05-19): editorial monograph treatment — Fraunces display +
 * Inter body, warm-paper background, restrained motion. Spec lives in
 * docs (uploaded). Reference world: Olson Kundig project pages, Aman
 * resort microsites, Cereal Magazine.
 *
 * SEO HARDENING (audit 2026-05-19, launch-prep): full metadata override,
 * Landscaper + LocalBusiness JSON-LD schema. Coexists additively with the
 * root BlueJays ProfessionalService schema.
 */

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  axes: ["SOFT", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://bluejayportfolio.com";
const PAGE_PATH = "/clients/mt-view-landscaping";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const HERO_OG_IMAGE = `${SITE_URL}/clients/mt-view-landscaping/tiered-stairs-hero.jpg`;

const TITLE =
  "Mountain View Landscape & Design — Custom Landscapes & Maintenance · Auburn, WA · Serving King, Pierce, Snohomish & Kittitas Counties";
const DESCRIPTION =
  "Family-owned since 1976. Tim and Bonnie Hunsaker design, build, and maintain custom landscapes across the Puget Sound region — hardscapes, water features, retaining walls, irrigation, sod, native planting, night lighting, and year-round maintenance plans from $180/mo. Call (253) 638-0500.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "landscaper Auburn WA",
    "landscape design Auburn",
    "landscape installation King County",
    "landscape maintenance Pierce County",
    "retaining walls Auburn WA",
    "hardscape contractor Puget Sound",
    "water feature installation Auburn",
    "irrigation installer King County WA",
    "sod installation Auburn",
    "landscape lighting Auburn WA",
    "Tim Hunsaker landscaping",
    "Mountain View Landscape Design",
    "year round landscape maintenance Auburn",
    "native plant landscaping Pacific Northwest",
    "landscape contractor Snohomish County",
    "landscape contractor Kittitas County",
    "family owned landscaper Washington",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Mountain View Landscape & Design",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: HERO_OG_IMAGE,
        width: 2000,
        height: 1334,
        alt: "Tiered red-block retaining wall with stone steps, mature plantings, and path-light bollards — Mountain View Landscape & Design, Auburn WA",
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
  themeColor: "#F5F1E8",
  width: "device-width",
  initialScale: 1,
};

const mtViewSchema = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": `${PAGE_URL}#business`,
  additionalType: "https://www.wikidata.org/wiki/Q1064538",
  name: "Mountain View Landscape & Design",
  alternateName: [
    "Mountain View Landscape",
    "Mt View Landscape",
    "Mountain View Landscape & Design Inc.",
  ],
  description:
    "Family-owned landscape design, installation, and maintenance firm founded by Tim Hunsaker in 1976 (originally Shamrock Landscaping). Bonnie Hunsaker runs the maintenance side. Every discipline in-house: hardscapes, water features, retaining walls, irrigation, sod, native planting, night lighting, and year-round maintenance plans.",
  url: PAGE_URL,
  image: HERO_OG_IMAGE,
  logo: "https://images.squarespace-cdn.com/content/v1/66761a64a49d3b0729a45e39/c7d25e65-6d11-45a8-a51f-87fc78e33417/Untitled+design+%2818%29.png?format=1500w",
  telephone: "+1-253-638-0500",
  email: "mtviewlandscapeonline@gmail.com",
  foundingDate: "1976",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "18225 Southeast 313th Street",
    addressLocality: "Auburn",
    addressRegion: "WA",
    postalCode: "98092",
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: 47.3207062, longitude: -122.0984311 },
  areaServed: [
    "Auburn, WA", "Seattle, WA", "Bellevue, WA", "Kent, WA", "Renton, WA",
    "Federal Way, WA", "Tacoma, WA", "Puyallup, WA", "Bonney Lake, WA",
    "Gig Harbor, WA", "Everett, WA", "Lynnwood, WA", "Bothell, WA",
    "Ellensburg, WA", "Cle Elum, WA",
  ].map((city) => ({ "@type": "City", name: city })),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
  ],
  founder: [
    { "@type": "Person", name: "Tim Hunsaker", jobTitle: "Founder & Lead Designer" },
    { "@type": "Person", name: "Bonnie Hunsaker", jobTitle: "Maintenance Director" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Landscape Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom Landscape Design & Installation", description: "End-to-end residential and commercial design and installation. Every discipline in-house." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hardscapes & Stoneworks", description: "Retaining walls, patios, walkways, fire features, decorative stoneworks." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Water Features", description: "Ponds, waterfalls, streams, and fountain installations." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Irrigation Systems", description: "Smart irrigation design and installation tuned to Puget Sound rainfall." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sod & Native Planting", description: "Premium sod installation and native-plant landscaping." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Landscape Lighting", description: "Low-voltage LED path, accent, security, and architectural lighting." } },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Year-Round Maintenance Plans",
          description: "Three-tier recurring maintenance: Essentials, Full Care (most popular), Estate. Starting at $180/mo.",
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: "180",
            highPrice: "420",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              priceCurrency: "USD",
              referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
            },
          },
        },
      },
    ],
  },
  knowsAbout: [
    "Landscape design", "Hardscape construction", "Retaining wall engineering",
    "Water feature installation", "Irrigation systems", "Sod installation",
    "Native plant landscaping", "Pacific Northwest horticulture",
    "Landscape lighting design", "Year-round landscape maintenance",
    "Seasonal pruning", "Climate-smart planting",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "10",
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: [
    "https://mtviewlandscaping.com",
    "https://www.google.com/maps/place/Mountain+View+Landscape+%26+Design/@47.3207062,-122.0984311,17z",
  ],
};

export default function MtViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${fraunces.variable} ${inter.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mtViewSchema) }}
      />
      {children}
      <BackToTopButton bg="#3E4A36" fg="#F5F1E8" />
    </div>
  );
}
