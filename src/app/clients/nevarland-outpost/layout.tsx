import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";
import BackToTopButton from "@/components/BackToTopButton";

/**
 * Layout for /clients/nevarland-outpost — Christopher's handmade
 * apparel brand. Black-dominant aesthetic with cream/parchment
 * contrast bands + warm rust accent matching the brand's "good
 * vibes, rough edges, real people" framing.
 *
 * Page metadata is exported here (the page is "use client") + a
 * scoped scrollbar override so the cream/black palette extends
 * to the scrollbar thumb on every device that supports the
 * styling (Android Chrome + every desktop browser; iOS Safari
 * uses its native blob since Apple stripped the styling years ago).
 *
 * Shopify owns the storefront + checkout. This page is the
 * marketing/story front — Christopher's why, the catalog, the
 * mental-health + family + adventure positioning that doesn't
 * fit on a Shopify default theme.
 */

const SITE_URL = "https://bluejayportfolio.com";
const PAGE_PATH = "/clients/nevarland-outpost";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const HERO_OG_IMAGE = `https://www.nevarlandoutpost.com/cdn/shop/files/20260215_120213.jpg?v=1771735328&width=1500`;

const TITLE =
  "NevarLand Outpost — Handmade Apparel for Real People · Adults + Kids";
const DESCRIPTION =
  "Created to express. Made to mean something. Handmade tees and custom apparel inspired by family, mental health, and real-life adventures. Free shipping over $70.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "NevarLand Outpost",
    "handmade kids apparel",
    "mental health clothing brand",
    "father-founded apparel",
    "custom DTF print tees",
    "adventure family clothing",
    "expressive kids clothing",
    "small batch apparel brand",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "NevarLand Outpost",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: HERO_OG_IMAGE,
        width: 1500,
        height: 1500,
        alt: "Christopher · founder of NevarLand Outpost · the Outpost workspace",
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
 * Brand JSON-LD — Brand + Person (Christopher) + ItemList of products
 * for Google rich-result eligibility on apparel queries.
 */
const brandSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Brand",
      "@id": `${PAGE_URL}#brand`,
      name: "NevarLand Outpost",
      description:
        "Handmade apparel inspired by family, mental health, and real-life adventures. Created to express. Made to mean something.",
      url: PAGE_URL,
      logo:
        "https://www.nevarlandoutpost.com/cdn/shop/files/logo_icon_2.png?v=1778202492&width=600",
      slogan: "Good vibes. Rough edges. Real people.",
    },
    {
      "@type": "Person",
      "@id": `${PAGE_URL}#christopher`,
      name: "Christopher",
      jobTitle: "Founder",
      worksFor: { "@id": `${PAGE_URL}#brand` },
      description:
        "Father of three daughters. Started NevarLand Outpost making clothes for his kids while working through his own mental-health journey.",
    },
    {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "Product",
          name: "DISCIPLINE > MOTIVATION Tee",
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: "21.99",
            availability: "https://schema.org/InStock",
          },
        },
        {
          "@type": "Product",
          name: "Legacy > Validation Long Game Tee",
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: "21.99",
            availability: "https://schema.org/InStock",
          },
        },
        {
          "@type": "Product",
          name: "Smile. You Are Loved Tee",
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: "21.99",
            availability: "https://schema.org/InStock",
          },
        },
        {
          "@type": "Product",
          name: "Exploring Nature's Secret Youth Adventure Tee",
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: "15.99",
            availability: "https://schema.org/InStock",
          },
        },
      ],
    },
  ],
};

export default function NevarlandOutpostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* Sora (modern sans, headings) + Inter (body) + Special Elite
          (typewriter accent for the personal-letter feel of the story
          section). Full character set so the tagline glyphs render. */}
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&family=Special+Elite&display=swap"
        rel="stylesheet"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      {/* Scoped scrollbar — warm rust → cream gradient on a near-black
          track. Matches the page's adventure/handmade palette. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              scrollbar-color: #a06b3c #0a0a0a !important;
              scrollbar-width: thin !important;
            }
            html::-webkit-scrollbar,
            body::-webkit-scrollbar,
            ::-webkit-scrollbar {
              width: 12px !important;
              height: 12px !important;
              background: #0a0a0a !important;
            }
            html::-webkit-scrollbar-thumb,
            body::-webkit-scrollbar-thumb,
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #a06b3c 0%, #b88860 50%, #e8dec8 100%) !important;
              border-radius: 6px !important;
              border: 2px solid #0a0a0a !important;
            }
            html::-webkit-scrollbar-corner { background: #0a0a0a !important; }
          `,
        }}
      />
      <ClientTrackingScripts slug="nevarland-outpost" />
      {children}
      <BackToTopButton bg="#a06b3c" fg="#ffffff" />
    </>
  );
}
