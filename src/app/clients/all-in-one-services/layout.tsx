import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";
import BackToTopButton from "@/components/BackToTopButton";

/**
 * Layout for /clients/all-in-one-services — All In One Service's LLC, Sequim WA.
 *
 * Custom-tier bespoke premium build for the Olympic Peninsula's
 * family-operated general contractor. Kyle B. Fritz, owner. WA L&I
 * licensed (ALLONOS841DJ), $1M insured (Ohio Security), $12K bonded
 * (Western Surety), BBB A+, BuildZoom top 7% of 128,670 WA contractors,
 * 10 years in business (since 2016-03-11), 22+ years total Kyle craft.
 *
 * Service mix: kitchen + bath + addition remodels, whole-home remodels,
 * new construction, decks/fences/painting, commercial buildouts
 * (church/restaurant/realtor/humane-society/daycare conversions),
 * specialty work (wine rooms, caboose conversions).
 *
 * Aesthetic: COPPER-AMBER on near-black. Distinct from Meyer Electric's
 * yellow lightning palette so the two Sequim trade builds don't visually
 * collide. Premium-craftsmanship vibe, not safety-orange contractor
 * cliché — these guys do $50K+ kitchen + bath jobs, not roadwork.
 *
 * Fonts: Space Grotesk (headings) + Inter (body) — CLAUDE.md trade
 * pairing.
 *
 * Meets the Meyer Electric reference standard (CLAUDE.md ship-gate):
 * 1. Hero shows OUTCOME (finished kitchen at golden hour) — not Kyle
 *    at work.
 * 2. Hero headline benefit-driven, short ("Built Right. Finished Clean.").
 * 3. 3 believability markers above-fold (WA L&I # + bonded/insured
 *    badge + "Clallam + Jefferson · Since 2016" + 10 yrs in business).
 * 4. Dark professional + warm amber accent — matched to GC craftsmanship
 *    vibe.
 */

const SITE_URL = "https://bluejayportfolio.com";
const PAGE_PATH = "/clients/all-in-one-services";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const HERO_OG_IMAGE = `${SITE_URL}/images/all-in-one-services/og-hero-kitchen.jpg`;

const TITLE =
  "All In One Service's LLC — Kitchens, Baths, Remodels & New Construction · Sequim, WA";
const DESCRIPTION =
  "Clallam County's trusted general contractor — kitchen remodels, bathroom remodels, additions, whole-home renovations, decks, commercial buildouts. Family-operated by Kyle Fritz, WA L&I licensed (ALLONOS841DJ), $1M insured, $12K bonded, BBB A+. 10 years serving Sequim, Port Angeles, Port Townsend. Call (360) 477-6859 for a free estimate.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "general contractor Sequim WA",
    "kitchen remodel Sequim",
    "bathroom remodel Sequim",
    "home addition Sequim",
    "whole home remodel Clallam County",
    "Port Angeles contractor",
    "Port Townsend remodeler",
    "Olympic Peninsula general contractor",
    "licensed bonded insured contractor Sequim",
    "WA L&I licensed contractor",
    "All In One Services LLC",
    "Kyle Fritz contractor",
    "commercial buildout Sequim",
    "deck builder Sequim WA",
    "wine cellar builder Olympic Peninsula",
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "All In One Service's LLC",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: HERO_OG_IMAGE,
        width: 2000,
        height: 1334,
        alt: "Finished modern kitchen remodel by All In One Service's LLC — Sequim, WA's trusted general contractor",
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
 * GeneralContractor + LocalBusiness JSON-LD for Google rich results.
 * Schema.org doesn't have a dedicated GeneralContractor type, so we
 * use HomeAndConstructionBusiness which Google treats as a LocalBusiness
 * subtype with construction-category context.
 */
const aiosSchema = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": `${PAGE_URL}#business`,
  name: "All In One Service's LLC",
  alternateName: "All In One Services",
  description:
    "Family-operated general contractor serving Clallam and Jefferson Counties on the Olympic Peninsula. Kitchen + bathroom remodels, additions, whole-home renovations, decks, painting, commercial buildouts. WA L&I licensed, $1M insured, $12K bonded. 10 years in business, BBB A+, BuildZoom Top 7% of 128,670 WA contractors.",
  url: PAGE_URL,
  image: HERO_OG_IMAGE,
  logo: `${SITE_URL}/images/all-in-one-services/logo-mark.jpg`,
  telephone: "+1-360-477-6859",
  priceRange: "$$",
  founder: {
    "@type": "Person",
    name: "Kyle B. Fritz",
  },
  foundingDate: "2016-03-11",
  identifier: [
    {
      "@type": "PropertyValue",
      propertyID: "WA-Contractor-License",
      value: "ALLONOS841DJ",
    },
    {
      "@type": "PropertyValue",
      propertyID: "USDOT",
      value: "3515033",
    },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "1201 E Washington St",
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
    "Clallam County, WA",
    "Jefferson County, WA",
  ].map((place) => ({ "@type": "Place", name: place })),
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
    name: "General Contracting Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Kitchen Remodels",
          description:
            "Full-scope kitchen renovations — cabinets, counters, tile, flooring, electrical, plumbing. In-house finish carpenters and trusted trade partners. Premium fit-and-finish, code-compliant, on time.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Bathroom Remodels",
          description:
            "Master baths, guest baths, powder rooms. Tile showers, custom vanities, fixtures, glass, flooring, ventilation. Soldate Shower + 710 Del Guzzi Dr are recent named projects.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Home Additions",
          description:
            "Square-footage expansion projects — bump-outs, second-story additions, in-law suites, sunrooms. Permits, structural, finish — start to walkthrough.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Whole-Home Remodels",
          description:
            "Full-house renovations from gut to keys. Structural, mechanical, electrical, plumbing, finishes. Average permit value $49,296 per BuildZoom records.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "New Construction",
          description:
            "Custom homes from foundation up. Engineering, permitting, framing, mechanical, finishes — handled in-house with our skilled trade network.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Decks, Fences & Outdoor Living",
          description:
            "Composite + cedar decks, fences, pergolas, outdoor kitchens. Built for the Olympic Peninsula's wet winters — sealed, flashed, and fastened to last.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Commercial Buildouts",
          description:
            "Office, retail, and specialty-use conversions. Past work includes church renovations, restaurant-to-office conversion, realtor office buildouts, humane society facilities, daycare buildouts.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Custom Builds & Specialty Work",
          description:
            "Wine rooms, caboose conversions, boat storage construction — the projects most GCs won't touch. If you can sketch it, we can build it.",
        },
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.6",
    reviewCount: "18",
    bestRating: "5",
    worstRating: "1",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Hilary Rosen" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Customer service, spectacular results, attention to detail, being flexible when necessary.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Bill Bryant" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Code compliant, high level of craftsmanship and the ability to follow through to the end.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Tom Sandy" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Kyle, Abi and the whole crew are great to work with. Super happy with all the projects.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Michael Kurtze" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "These guys have a team perfectly suited for what they do which is make people's dreams come true.",
    },
  ],
  knowsAbout: [
    "Kitchen remodeling",
    "Bathroom remodeling",
    "Home additions",
    "Whole-home renovations",
    "New construction",
    "Deck construction",
    "Commercial buildouts",
    "Wine cellar construction",
    "Code-compliant residential construction",
    "Olympic Peninsula contractor work",
  ],
  sameAs: [
    "https://www.allinoneservicessequim.com/",
    "https://www.facebook.com/p/All-In-One-Services-LLC-100063469783661/",
    "https://www.linkedin.com/in/kyle-fritz-12532b133/",
    "https://www.bbb.org/us/wa/sequim/profile/general-contractor/all-in-one-services-llc-1296-1000096300",
    "https://www.buildzoom.com/contractor/all-in-one-services-llc-wa",
  ],
};

export default function AllInOneServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Google Fonts: Space Grotesk (headings) + Inter (body) per
          CLAUDE.md typography table for construction trades. */}
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
      {/* AIOS-specific scrollbar — copper-amber gradient over near-black
          track. Matches the brand palette without colliding with Meyer
          Electric's yellow→orange scrollbar. Scoped to this subtree only;
          Next injects the style block while the visitor is on
          /clients/all-in-one-services pages. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              scrollbar-color: #d97706 #0a0a0a !important;
              scrollbar-width: thin !important;
            }
            html::-webkit-scrollbar,
            body::-webkit-scrollbar,
            ::-webkit-scrollbar {
              width: 12px !important;
              height: 12px !important;
              background: #0a0a0a !important;
            }
            html::-webkit-scrollbar-track,
            body::-webkit-scrollbar-track,
            ::-webkit-scrollbar-track {
              background: #0a0a0a !important;
            }
            html::-webkit-scrollbar-thumb,
            body::-webkit-scrollbar-thumb,
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #fcd34d 0%, #d97706 50%, #92400e 100%) !important;
              border-radius: 6px !important;
              border: 2px solid #0a0a0a !important;
            }
            html::-webkit-scrollbar-thumb:hover,
            body::-webkit-scrollbar-thumb:hover,
            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #fbbf24 0%, #b45309 50%, #78350f 100%) !important;
            }
            ::-webkit-scrollbar-corner { background: #0a0a0a !important; }
          `,
        }}
      />
      {/* AIOS-specific structured data — GeneralContractor schema for
          Google rich results. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aiosSchema) }}
      />
      <ClientTrackingScripts slug="all-in-one-services" />
      {children}
      <BackToTopButton bg="#d97706" fg="#0a0a0a" />
    </>
  );
}
