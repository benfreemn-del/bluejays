/**
 * The Oregon Appraisers — bespoke premium client showcase.
 *
 * Robert "Bob" Rochefort, Salem OR. Probate · IRS estate · divorce ·
 * litigation · expert-witness real estate appraisals across Marion,
 * Polk, and Linn counties. 20+ years (since 2003).
 *
 * Per CLAUDE.md Rule 68 (page-specific metadata override mandatory)
 * this layout overrides:
 *   - alternates.canonical → /clients/theoregonappraisers (NOT homepage)
 *   - openGraph (full override — title, description, url, images, siteName)
 *   - twitter (full override — summary_large_image card)
 *   - keywords (Bob-specific + Salem-specific)
 *   - JSON-LD Appraiser schema (injected via React, NOT metadata.other —
 *     coexists ADDITIVELY with the root BlueJays ProfessionalService block)
 *
 * Per Rule 9 (content fidelity) every claim is grounded in his actual
 * site or independently verified. License type, appraisal count, and
 * court-testimony count are NOT claimed (he hasn't published them).
 *
 * Sitemap entry added per Rule 69 in src/app/sitemap.ts.
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://bluejayportfolio.com";
const PAGE_PATH = "/clients/theoregonappraisers";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const HERO_IMG = `${SITE_URL}/images/oregon-appraisers/salem-capitol.jpg`;

const TITLE =
  "The Oregon Appraisers — Salem Estate, Divorce & Litigation Appraisals | Robert Rochefort";
const DESCRIPTION =
  "Defensible probate, IRS estate, divorce, and litigation real estate appraisals across Marion, Polk, and Linn counties. Salem-rooted since 2003. USPAP-compliant, court-ready reports from Robert (Bob) Rochefort — vouched for by the former Oregon Appraiser Certification & Licensure Board Compliance Investigator.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: PAGE_URL,
  },
  keywords: [
    // Salem + service-area
    "Salem appraiser",
    "Salem real estate appraiser",
    "Salem estate appraisal",
    "Marion County appraiser",
    "Polk County appraiser",
    "Linn County appraiser",
    "Willamette Valley appraiser",
    // Specialty / use-case
    "probate appraisal Salem",
    "date of death appraisal Oregon",
    "IRS estate appraisal",
    "step-up basis appraisal",
    "divorce appraisal Salem",
    "litigation appraisal Oregon",
    "expert witness appraiser Oregon",
    "bankruptcy appraisal Oregon",
    "retrospective appraisal",
    "USPAP-compliant appraisal",
    // Bob
    "Robert Rochefort appraiser",
    "Bob Rochefort Salem",
    "The Oregon Appraisers",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "The Oregon Appraisers",
    images: [
      {
        url: HERO_IMG,
        width: 1400,
        height: 933,
        alt: "Oregon State Capitol building in Salem — service area for The Oregon Appraisers",
      },
      {
        url: `${SITE_URL}/images/oregon-appraisers/bob-rochefort.jpg`,
        width: 800,
        height: 800,
        alt: "Robert (Bob) Rochefort, Certified Appraiser at The Oregon Appraisers",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [HERO_IMG],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * JSON-LD structured data — Schema.org Appraiser type. Coexists
 * additively with the root layout's ProfessionalService schema (Google
 * treats multiple JSON-LD blocks as additive context per Rule 68).
 *
 * Every populated field is grounded in his actual site or independently
 * verified. Fields NOT included (licenseNumber, court-testimony count,
 * appraisal count, designations beyond USPAP) are intentionally omitted
 * per Rule 9 fidelity — never invent specifics.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "LocalBusiness"],
  "@id": `${PAGE_URL}#business`,
  name: "The Oregon Appraisers",
  alternateName: ["Appraisal Solutions Review & Consultation, LLC"],
  url: PAGE_URL,
  image: [
    `${SITE_URL}/images/oregon-appraisers/bob-rochefort.jpg`,
    `${SITE_URL}/images/oregon-appraisers/salem-capitol.jpg`,
    `${SITE_URL}/images/oregon-appraisers/bush-house.jpg`,
  ],
  telephone: "+1-503-910-1514",
  email: "Admin@theoregonappraisers.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "885 Lancaster Dr SE, Suite B",
    addressLocality: "Salem",
    addressRegion: "OR",
    postalCode: "97317",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 44.9429,
    longitude: -122.9852,
  },
  priceRange: "$$-$$$",
  areaServed: [
    { "@type": "AdministrativeArea", name: "Marion County, Oregon" },
    { "@type": "AdministrativeArea", name: "Polk County, Oregon" },
    { "@type": "AdministrativeArea", name: "Linn County, Oregon" },
  ],
  founder: {
    "@type": "Person",
    name: "Robert Rochefort",
    alternateName: "Bob Rochefort",
    jobTitle: "Certified Real Estate Appraiser",
    knowsAbout: [
      "Probate appraisal",
      "IRS estate appraisal",
      "Date-of-death valuation",
      "Divorce appraisal",
      "Bankruptcy appraisal",
      "Expert witness testimony",
      "Retrospective appraisal",
      "USPAP-compliant valuation",
    ],
  },
  foundingDate: "2003",
  slogan: "Defensible. Court-ready. Salem-rooted since 2003.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Real Estate Appraisal Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Probate & Estate Appraisal",
          description:
            "Date-of-death and retrospective valuations for probate, estate settlement, and IRS step-up basis claims.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Divorce Appraisal",
          description:
            "Unbiased valuations and expert witness reports for divorce and family-law cases.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Bankruptcy Appraisal",
          description:
            "Court-ready valuations for Chapter 7 and Chapter 13 filings, supporting accurate asset disclosure.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Litigation & Expert Witness",
          description:
            "Expert valuations and testimony for civil litigation involving real estate.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Pre-Listing Consultation",
          description:
            "Independent valuations for homeowners and FSBO sellers preparing to list.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Cash Sale Appraisal",
          description:
            "Reliable market value for private property transfers outside lender financing.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Expert Appraisal Review",
          description:
            "Professional second-look on existing reports for compliance, accuracy, and USPAP adherence.",
        },
      },
    ],
  },
  knowsLanguage: ["en"],
  identifier: [
    {
      "@type": "PropertyValue",
      propertyID: "USPAP",
      value: "USPAP-compliant",
    },
  ],
  sameAs: [
    "https://theoregonappraisers.com/",
    "https://www.linkedin.com/in/bob-rochefort-53597752/",
    "https://www.linkedin.com/in/theoregonappraisers/",
  ],
};

export default function TheOregonAppraisersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
