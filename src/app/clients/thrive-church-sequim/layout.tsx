import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";

/**
 * Layout for /clients/thrive-church-sequim — Thrive Church, Sequim WA.
 *
 * Custom-tier bespoke premium build for the Olympic Peninsula's Thrive
 * Church. Modern non-denominational community focused on "imperfect
 * people becoming the church, on the mission with Jesus, bringing hope
 * and healing to the world." 640 N Sequim Ave · Sunday gathering at
 * 10:30am · in-person + livestream + Thrive Preschool · Next Wave
 * (kids + youth) · Thrive Groups (small groups) · Table of Grace
 * outreach.
 *
 * Aesthetic: WARM-CREAM church-light theme. Cream paper background
 * (#fbf7ee), deep evergreen-teal primary (#0d4f4a — "hope/healing"),
 * warm amber accent (#d97706 — sunrise/welcome). Distinct from the
 * other Sequim builds (Meyer = yellow trades, AIOS = copper craft,
 * Family Care = green/citrus cleaning) so the local cluster doesn't
 * collide visually.
 *
 * Fonts: Fraunces (display serif — premium, warm, ecclesiastical
 * without being stuffy) + Inter (body) — pairing chosen for the
 * "modern church that still feels reverent" voice.
 *
 * Meets the Meyer Electric reference standard (CLAUDE.md ship-gate):
 * 1. Hero shows OUTCOME (warm worshipful gathering moment) — not a
 *    pastor lecturing or a building exterior.
 * 2. Hero headline benefit-driven, short ("You're invited home.").
 * 3. 3 believability markers above-fold (Sundays 10:30am · 640 N
 *    Sequim Ave · All ages welcome).
 * 4. Warm light theme matched to church/family vibe per the CLAUDE.md
 *    theme table (church → warm cream, soft & friendly accents).
 */

const SITE_URL = "https://bluejayportfolio.com";
const PAGE_PATH = "/clients/thrive-church-sequim";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const HERO_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

const TITLE =
  "Thrive Church — Sundays 10:30am · 640 N Sequim Ave · Sequim, WA";
const DESCRIPTION =
  "Imperfect people becoming the church, on the mission with Jesus, bringing hope and healing to the world. Sunday gatherings at 10:30am in person or online. Thrive Preschool, Next Wave Kids + Youth, Thrive Groups (small groups), Table of Grace outreach. 640 N Sequim Ave · (360) 683-7981.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Thrive Church Sequim",
    "Thrive Sequim",
    "church Sequim WA",
    "Sequim church Sunday service",
    "Sequim non-denominational church",
    "Olympic Peninsula church",
    "Clallam County church",
    "Thrive Preschool Sequim",
    "Next Wave Kids Sequim",
    "small groups Sequim",
    "Sunday service Sequim WA",
    "Table of Grace Sequim",
    "640 N Sequim Ave",
    "church near me Sequim",
    "live stream church Sequim",
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Thrive Church",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: HERO_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Thrive Church — Sundays 10:30am · 640 N Sequim Ave · Sequim, WA",
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
  themeColor: "#fbf7ee",
  width: "device-width",
  initialScale: 1,
};

/**
 * Church + PlaceOfWorship JSON-LD for Google rich results. Google
 * recognizes Church as a LocalBusiness subtype with religious-org
 * category context. AreaServed includes the surrounding Olympic
 * Peninsula towns Thrive serves.
 */
const thriveSchema = {
  "@context": "https://schema.org",
  "@type": "Church",
  "@id": `${PAGE_URL}#church`,
  name: "Thrive Church",
  alternateName: ["Thrive Sequim", "Thrive Church Sequim"],
  description:
    "Imperfect people becoming the church, on the mission with Jesus, bringing hope and healing to the world. Modern non-denominational community in Sequim, WA with Sunday gatherings at 10:30am in person or online. Home of Thrive Preschool, Next Wave Kids + Youth ministries, Thrive Groups (small groups), and Table of Grace outreach.",
  slogan:
    "Imperfect People Becoming The Church, On The Mission With Jesus, Bringing Hope And Healing To The World.",
  url: PAGE_URL,
  image: HERO_OG_IMAGE,
  telephone: "+1-360-683-7981",
  email: "office@thrivesequim.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "640 N Sequim Ave",
    addressLocality: "Sequim",
    addressRegion: "WA",
    postalCode: "98382",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 48.0843,
    longitude: -123.099,
  },
  areaServed: [
    "Sequim, WA",
    "Port Angeles, WA",
    "Carlsborg, WA",
    "Diamond Point, WA",
    "Blyn, WA",
    "Dungeness, WA",
    "Clallam County, WA",
  ].map((place) => ({ "@type": "Place", name: place })),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "10:30",
      closes: "12:00",
    },
  ],
  event: [
    {
      "@type": "Event",
      name: "Sunday Gathering",
      description:
        "Weekly Sunday worship service — modern worship, biblical teaching, kids ministry (Next Wave), and online stream available. All ages welcome, casual dress.",
      startDate: "2026-05-24T10:30:00-07:00",
      eventSchedule: {
        "@type": "Schedule",
        repeatFrequency: "P1W",
        byDay: "https://schema.org/Sunday",
        startTime: "10:30",
      },
      location: {
        "@type": "Place",
        name: "Thrive Church",
        address: {
          "@type": "PostalAddress",
          streetAddress: "640 N Sequim Ave",
          addressLocality: "Sequim",
          addressRegion: "WA",
          postalCode: "98382",
        },
      },
    },
  ],
  sameAs: [
    "https://thrivesequim.com",
    "https://www.facebook.com/ThriveSequim",
    "https://www.instagram.com/Thrive_Sequim/",
    "https://www.youtube.com/@thrivechurch-sequim1514",
  ],
};

export default function ThriveChurchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Google Fonts: Fraunces (display serif) + Inter (body). The
          Fraunces face carries the brand voice — warm, classical,
          ecclesiastical without feeling antique. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {/* Thrive-specific scrollbar — warm amber→teal gradient over a
          cream track. Scoped to this subtree by Next; doesn't leak to
          other tenant pages. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              scrollbar-color: #d97706 #fbf7ee !important;
              scrollbar-width: auto !important;
              overflow-y: scroll !important;
            }
            html::-webkit-scrollbar,
            body::-webkit-scrollbar,
            ::-webkit-scrollbar {
              width: 14px !important;
              height: 14px !important;
              background: #fbf7ee !important;
            }
            html::-webkit-scrollbar-track,
            body::-webkit-scrollbar-track,
            ::-webkit-scrollbar-track {
              background: #fbf7ee !important;
            }
            html::-webkit-scrollbar-thumb,
            body::-webkit-scrollbar-thumb,
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #fbbf24 0%, #d97706 50%, #0d4f4a 100%) !important;
              border-radius: 6px !important;
              border: 2px solid #fbf7ee !important;
            }
            html::-webkit-scrollbar-thumb:hover,
            body::-webkit-scrollbar-thumb:hover,
            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #f59e0b 0%, #b45309 50%, #0a3a36 100%) !important;
            }
            ::-webkit-scrollbar-corner { background: #fbf7ee !important; }
          `,
        }}
      />
      {/* Thrive Church structured data for Google rich results. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(thriveSchema) }}
      />
      <ClientTrackingScripts slug="thrive-church-sequim" />
      {children}
    </>
  );
}
