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
  "https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes/photos/hero-property-maintenance-peninsula.jpg";

// SEO-tight: title ≤60 chars (Google SERP truncate), description ≤155 chars.
const TITLE = "Elite Hardscapes & Landscaping — Port Angeles WA";
const DESCRIPTION =
  "Tyler Fritz's owner-operated hardscape + landscape crew on the Olympic Peninsula. Retaining walls, paver patios, hydroseed, weekly maintenance.";

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
  logo: "https://bluejayportfolio.com/clients/elite-hardscapes-and-landscapes/photos/logo-elite-hardscapes.png",
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
  // Inline Review objects — paired with aggregateRating above, these give
  // Google the actual quote text + author so the SERP rich snippet can
  // show real review snippets for Tyler instead of just the star count.
  // Mirrors STATIC_REVIEWS in page.tsx — keep them in sync.
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Elliot Witecki" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: "Excellent work on my retaining wall backyard project.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "David Overbaugh" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "I had a great experience working with Tyler on my project. He communicates clearly and keeps you informed every step of the way, which made the whole process smooth and stress-free.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Melissa Moss" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "I highly recommend Tyler! He always communicates with you and gets back to you quickly. He always does what I ask and makes my yard beautiful. He always shows up when he says and works hard.",
    },
  ],
};

// FAQPage JSON-LD — gets Google's expandable "People also ask" rich result
// when the page ranks for question-shaped queries. Mirrors FAQS in page.tsx.
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's your service area?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We cover the Olympic Peninsula — Sequim, Port Angeles, Carlsborg, Port Townsend, Joyce, Diamond Point, Forks and the rest of Clallam County. If you're close to the edge and not sure, call. We'll tell you straight.",
      },
    },
    {
      "@type": "Question",
      name: "Are estimates really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We come out, walk the property, and put a written estimate together within a few days. No deposit pressure, no high-pressure sales, no obligation to book.",
      },
    },
    {
      "@type": "Question",
      name: "Are you licensed and insured?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — licensed in Washington State and fully insured. Documentation available on request, and we're happy to confirm before the walkthrough if that's important to you.",
      },
    },
    {
      "@type": "Question",
      name: "How fast can you start?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Maintenance routes usually within one to two weeks. Hardscape and design/install projects depend on scope and weather — PNW rain windows matter. We give a realistic timeline at the walkthrough, not a hopeful one.",
      },
    },
    {
      "@type": "Question",
      name: "Do you take small jobs or just big ones?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both. A single front bed refresh, a fence repair, a one-off cleanup — same crew, same standard. Big multi-week installs are where we shine, but small jobs keep the routes balanced and the neighbors happy.",
      },
    },
    {
      "@type": "Question",
      name: "When's the best season to start a project?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Spring and early fall are the sweet spots for plantings and hydroseed in the PNW. Hardscape can run most of the year as long as we're not pouring rain. Book your walkthrough 2-4 weeks before you want install to begin.",
      },
    },
  ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <ClientTrackingScripts slug="elite-hardscapes-and-landscapes" />
      {children}
      <BackToTopButton bg="#c2410c" fg="#fbf7ee" />
    </>
  );
}
