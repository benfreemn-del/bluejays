import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import BackToTopButton from "@/components/BackToTopButton";
import { BIZ, SITE_URL, BASE_PATH, PHOTO_PATH, SERVICES, CITIES, FOUNDED } from "./_lib/site";

/**
 * Layout for Mountain View Landscape & Design Inc. (Tim + Bonnie Hunsaker,
 * Auburn WA, since 1976). Served at the root of mtviewlandscaping.com via
 * CLIENT_DOMAIN_MAP (src/middleware.ts) and at /clients/mt-view-landscaping
 * on bluejayportfolio.com as the demo / pre-launch preview.
 *
 * Canonicals, og:url and JSON-LD ids ALWAYS point at mtviewlandscaping.com,
 * so the bluejayportfolio.com copy never competes with the real domain.
 * Pages override title/description/canonical; this sets the defaults.
 */

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const OG_IMAGE = `${SITE_URL}${BASE_PATH}/og-image.jpg`;
const TITLE = "Mountain View Landscape & Design | Auburn, WA Landscaper";
const DESCRIPTION =
  "Family landscaper in Auburn, WA with 50 years' experience. Licensed & insured. Design, patios, walls, ponds, sod, and yard care. Call (253) 638-0500.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/`,
    siteName: BIZ.name,
    type: "website",
    locale: "en_US",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Front-yard pond with a boulder waterfall built by Mountain View Landscape & Design" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
  // Mountain View's own icons, otherwise the root layout's BlueJays favicon shows in tabs/bookmarks.
  icons: {
    icon: [
      { url: `${BASE_PATH}/icon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${BASE_PATH}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${BASE_PATH}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: `${BASE_PATH}/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  themeColor: "#234E36",
  width: "device-width",
  initialScale: 1,
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": ["HomeAndConstructionBusiness", "LocalBusiness"],
  "@id": `${SITE_URL}/#business`,
  name: BIZ.name,
  legalName: BIZ.legalName,
  alternateName: ["Mountain View Landscape", "Mt View Landscaping", "Mountain View Landscaping & Design"],
  description:
    "Family-owned landscape design, installation, and maintenance company founded by Tim Hunsaker (landscaping since 1976, originally as Shamrock Landscaping with his brothers). Bonnie Hunsaker runs the maintenance crew. Design, hardscapes, retaining walls, water features, irrigation, sod, native planting, landscape lighting, and yard maintenance.",
  url: `${SITE_URL}/`,
  image: [OG_IMAGE, `${SITE_URL}${PHOTO_PATH}/p091-1600.webp`, `${SITE_URL}${PHOTO_PATH}/p033-1600.webp`],
  logo: `${SITE_URL}${BASE_PATH}/icon-512.png`,
  telephone: BIZ.phoneE164,
  email: BIZ.email,
  foundingDate: "2003", // incorporation (WA UBI 602 332 722); Tim's experience dates to 1976
  identifier: { "@type": "PropertyValue", propertyID: "WA L&I contractor license", value: "MTVIEVL973QP" },
  founder: [{ "@type": "Person", name: "Tim Hunsaker" }, { "@type": "Person", name: "Bonnie Hunsaker" }],
  address: {
    "@type": "PostalAddress",
    streetAddress: "18225 Southeast 313th Street",
    addressLocality: BIZ.city,
    addressRegion: BIZ.region,
    postalCode: BIZ.zip,
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: BIZ.lat, longitude: BIZ.lng },
  hasMap: BIZ.mapHref,
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
  ],
  areaServed: [
    ...BIZ.counties.map((c) => ({ "@type": "AdministrativeArea", name: `${c} County, WA` })),
    ...CITIES.map((c) => ({ "@type": "City", name: `${c.name}, WA` })),
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Landscape services",
    itemListElement: SERVICES.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, url: `${SITE_URL}/${s.slug}`, description: s.description },
    })),
  },
  knowsAbout: [
    "Landscape design", "Hardscape construction", "Flagstone patios", "Retaining walls",
    "Ponds and waterfalls", "Irrigation systems", "Sod installation", "Native plant landscaping",
    "Landscape lighting", "Landscape maintenance", "Pacific Northwest horticulture",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: BIZ.googleRating.toFixed(1),
    reviewCount: String(BIZ.googleReviewCount),
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: [BIZ.mapHref],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: BIZ.name,
  publisher: { "@id": `${SITE_URL}/#business` },
};

export default function MtViewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${playfair.variable} ${inter.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      {children}
      <BackToTopButton bg="#234E36" fg="#F5F1E8" />
    </div>
  );
}
