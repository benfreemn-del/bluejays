import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";

/**
 * Layout for /clients/bloodlines — Preston James Hunsaker's Bloodlines
 * fantasy series. Custom-tier bespoke author site. Anchors the new
 * `indie-author` category (CLAUDE.md Wave 5).
 *
 * Aesthetic: dark luxury — near-black `#09090b` background with gold
 * (`#d4a853`) + crimson (`#7f1d1d`) accents, parchment cream (`#e8dcc4`)
 * for reader-mode surfaces. Locked per Q5A on the 10-Q gate (2026-05-07).
 *
 * Fonts: Cinzel (epic capital serif — hero, section headers, faction
 * names) + EB Garamond (literary body serif — synopsis, character bios,
 * first-chapter parchment reader). Cinzel reads as fantasy/regal without
 * crossing into Renaissance-Faire kitsch; EB Garamond is the closest
 * Google-Fonts match to a published-novel body face.
 *
 * SEO HARDENING (CLAUDE.md Rule 68):
 * - Full metadata override on canonical / Open Graph / Twitter so social
 *   shares display Bloodlines branding (not the BlueJays homepage).
 * - Bloodlines-specific og-image points at the gold N+rose monogram on
 *   brown leather texture.
 * - Book + Person + WebSite JSON-LD schema injected for rich results on
 *   Google. Coexists additively with the root BlueJays ProfessionalService
 *   schema — Google treats multiple LD blocks fine.
 */

const SITE_URL = "https://bluejayportfolio.com";
const PAGE_PATH = "/clients/bloodlines";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const HERO_OG_IMAGE = `${SITE_URL}/images/clients/bloodlines/bloodlines-monogram.jpg`;
const COVER_LINEAGE = `${SITE_URL}/images/clients/bloodlines/cover-lineage-of-fire.jpg`;

// Lineage of Fire — Amazon ASIN B0C8QYW599. Verified 2026-05-07.
const LINEAGE_AMAZON_URL = "https://www.amazon.com/dp/B0C8QYW599";

const TITLE =
  "Bloodlines — A Fantasy Series by Preston James Hunsaker · Lineage of Fire & House of the Rose";
const DESCRIPTION =
  "Step into Annarose. Two friends, an ancient power, and a kingdom drawn to war. The Bloodlines saga by Preston James Hunsaker — Lineage of Fire and House of the Rose — blends sword-and-sorcery with woven tech-magic. Read the first chapter, meet the elletas, and explore the world.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Bloodlines book series",
    "Preston James Hunsaker",
    "Preston Hunsaker author",
    "Lineage of Fire",
    "House of the Rose",
    "indie fantasy novels",
    "YA fantasy series",
    "elementalist fantasy",
    "tech magic fantasy",
    "Annarose fantasy world",
    "elletas magic system",
    "young adult sword and sorcery",
    "fantasy series 2024",
    "indie author fantasy",
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Bloodlines · Preston James Hunsaker",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: HERO_OG_IMAGE,
        width: 1024,
        height: 1280,
        alt: "The Bloodlines monogram — gold serif N entwined with a wilted rose, set against weathered brown leather. Cover artwork for Preston James Hunsaker's Bloodlines fantasy saga.",
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
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

/**
 * Three-block JSON-LD: WebSite (the saga's home page), Book (Lineage of
 * Fire — the first volume, with the verified Amazon ASIN), and Person
 * (Preston James Hunsaker). Google treats `Book` + `Person` as
 * first-class entities for the Search Knowledge Graph + book carousels.
 *
 * House of the Rose is referenced in `workExample` of the Person but not
 * as its own Book block yet — Ben to confirm its ASIN, then we add a
 * second Book entry in a follow-up commit.
 */
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${PAGE_URL}#website`,
  name: "Bloodlines — Preston James Hunsaker",
  url: PAGE_URL,
  description:
    "The official home of the Bloodlines fantasy saga. Read the first chapter, meet the elletas, and explore the world of Annarose.",
  inLanguage: "en-US",
};

const bookSchema = {
  "@context": "https://schema.org",
  "@type": "Book",
  "@id": `${PAGE_URL}#lineage-of-fire`,
  name: "Lineage of Fire",
  bookFormat: "https://schema.org/Paperback",
  isbn: "B0C8QYW599",
  inLanguage: "en",
  numberOfPages: 388,
  url: LINEAGE_AMAZON_URL,
  image: COVER_LINEAGE,
  description:
    "Book One of the Bloodlines saga. Two friends discover an ancient power buried in the kingdom of Annarose — and the secret of who they really are. A sword-and-sorcery fantasy with a hidden tech-magic core, for readers 11+.",
  author: {
    "@type": "Person",
    "@id": `${PAGE_URL}#author`,
    name: "Preston James Hunsaker",
  },
  publisher: {
    "@type": "Organization",
    name: "Independently published",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.4",
    bestRating: "5",
    ratingCount: "62",
  },
  workExample: {
    "@type": "Book",
    bookEdition: "First edition",
    bookFormat: "https://schema.org/Paperback",
    isbn: "B0C8QYW599",
  },
};

const authorSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${PAGE_URL}#author`,
  name: "Preston James Hunsaker",
  alternateName: "Preston Hunsaker",
  jobTitle: "Author",
  url: PAGE_URL,
  description:
    "Indie fantasy author and creator of the Bloodlines saga — a sword-and-sorcery series with a woven tech-magic core, set in the kingdom of Annarose. First volume Lineage of Fire (2023); follow-up House of the Rose continues the saga.",
  image: `${SITE_URL}/images/clients/bloodlines/author-imprint.png`,
  knowsAbout: [
    "Fantasy fiction",
    "Sword and sorcery",
    "World-building",
    "Young adult fiction",
    "Indie publishing",
  ],
  workExample: [
    {
      "@type": "Book",
      "@id": `${PAGE_URL}#lineage-of-fire`,
      name: "Lineage of Fire",
      url: LINEAGE_AMAZON_URL,
    },
    {
      "@type": "Book",
      name: "House of the Rose",
    },
  ],
};

export default function BloodlinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Google Fonts: Cinzel (epic capital serif — headings) + EB Garamond
          (literary body serif). Loaded ahead of paint so the parchment
          reader and hero block don't flash with system fonts. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
        rel="stylesheet"
      />
      {/* Bloodlines-specific scrollbar — gold gradient over near-black,
          matching the saga's color identity. Targets the document
          scrollbar globally but only inside the /clients/bloodlines
          subtree (Next isolates the style block to this route). */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body {
              scrollbar-color: #d4a853 #09090b !important;
              scrollbar-width: thin !important;
            }
            html::-webkit-scrollbar,
            body::-webkit-scrollbar,
            ::-webkit-scrollbar {
              width: 12px !important;
              height: 12px !important;
              background: #09090b !important;
            }
            html::-webkit-scrollbar-track,
            body::-webkit-scrollbar-track,
            ::-webkit-scrollbar-track {
              background: #09090b !important;
            }
            html::-webkit-scrollbar-thumb,
            body::-webkit-scrollbar-thumb,
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #b8860b 0%, #d4a853 50%, #f5deb3 100%) !important;
              border-radius: 6px !important;
              border: 2px solid #09090b !important;
            }
            html::-webkit-scrollbar-thumb:hover,
            body::-webkit-scrollbar-thumb:hover,
            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #92691a 0%, #b8860b 50%, #d4a853 100%) !important;
            }
            ::-webkit-scrollbar-corner { background: #09090b !important; }

            /* Selection — gold on near-black so highlighting feels
               on-brand instead of flashing system blue. */
            ::selection {
              background: #d4a853;
              color: #09090b;
            }
          `,
        }}
      />
      {/* Bloodlines-specific structured data — WebSite + Book (Lineage of
          Fire) + Person (Preston) for Google rich-result eligibility. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />
      <ClientTrackingScripts slug="bloodlines" />
      {children}
    </>
  );
}
