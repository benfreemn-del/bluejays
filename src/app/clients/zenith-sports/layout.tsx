import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";
import BackToTopButton from "@/components/BackToTopButton";

/**
 * Layout for /clients/zenith-sports. Houses metadata that the page
 * itself can't export — the page uses client components nested inside.
 *
 * Tracking stack (Clarity, Meta Pixel, GA4) loads via
 * ClientTrackingScripts — each individual tracker is gated on its own
 * env var, so missing vars simply omit the script (no errors).
 */
export const metadata: Metadata = {
  title:
    "Zenith Sports — TEKKY® · Building Better Players, One Touch at a Time · Patent Pending",
  description:
    "TEKKY® by Zenith Sports — a patent-pending technical training accelerator for youth soccer. FIFA Size 3 control, FIFA Size 5 match-day weight. Inspired by European-style development. Founded by Philip Lund and Paul Hanson.",
};

export const viewport: Viewport = {
  themeColor: "#0a1832",
};

/**
 * JSON-LD structured data — Phase 1 SEO foundation deliverable.
 *
 * Organization + WebSite + 3 Product schemas help Google Knowledge
 * Panel + AI Overview surfaces (ChatGPT / Claude / Perplexity / Gemini)
 * understand what Zenith Sports actually sells and who founded it.
 * Pairs with /clients/zenith-sports/llms.txt for the AI-crawler half.
 *
 * Single source of truth for product price/URL/image lives here. If
 * the shop page's product data changes, mirror it here.
 */
const JSON_LD = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zenith Sports",
    alternateName: "TEKKY",
    url: "https://tekky.org",
    logo: "https://zenithsports.org/cdn/shop/files/Zenith_Sports-02-removebg-preview.png",
    description:
      "Patent-pending youth soccer training ball + curriculum founded by Philip Lund and Paul Hanson (40+ combined years coaching). FIFA Size 3 control, FIFA Size 5 match-day weight.",
    sameAs: [
      "https://www.instagram.com/zenithsports.tekky",
      "https://www.facebook.com/zenithsports.tekky",
      "https://zenithsports.org",
    ],
    founder: [
      { "@type": "Person", name: "Philip Lund", jobTitle: "Co-Founder" },
      {
        "@type": "Person",
        name: "Paul Hanson",
        jobTitle: "Co-Founder",
        description: "40+ years coaching U.S. youth soccer development",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@zenithsports.org",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zenith Sports — Home of the TEKKY®",
    url: "https://tekky.org",
    publisher: { "@type": "Organization", name: "Zenith Sports" },
    inLanguage: "en-US",
  },
  products: [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "The TEKKY® — Advanced Training Ball",
      description:
        "Patent-pending technical training accelerator for youth soccer. FIFA Size 3 control with FIFA Size 5 match-day weight. Engineered for ages 5 and up.",
      image:
        "https://zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00001.jpg",
      sku: "TEKKY-BALL",
      brand: { "@type": "Brand", name: "TEKKY" },
      offers: {
        "@type": "Offer",
        url: "https://zenithsports.org/products/the-tekky-advanced-youth-training-ball",
        priceCurrency: "USD",
        price: "59.95",
        availability: "https://schema.org/InStock",
        priceValidUntil: "2027-12-31",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: "5",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "TEKKY® Grip Socks",
      description:
        "Internal grip pads at the forefoot and heel lock the foot inside the boot — no internal slide, no wasted motion, no blisters from a foot sliding sideways through a turn.",
      image:
        "https://zenithsports.org/cdn/shop/files/Tekky_Socks_White_Web_eaa7877d-0611-4947-bf90-832db80b57b4.jpg",
      sku: "TEKKY-SOCKS",
      brand: { "@type": "Brand", name: "TEKKY" },
      offers: {
        "@type": "Offer",
        url: "https://zenithsports.org/products/tekky-grip-socks",
        priceCurrency: "USD",
        price: "15.00",
        availability: "https://schema.org/InStock",
        priceValidUntil: "2027-12-31",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "High Performance TEKKY® Training Tee",
      description:
        "Lightweight, sweat-wicking performance fabric designed for full-effort training. Cut for movement — sleeves stay clean on a throw-in, body stays put on a sprint.",
      image:
        "https://zenithsports.org/cdn/shop/files/Performance_T-Shirt_Gray_Front_Web.jpg",
      sku: "TEKKY-TEE",
      brand: { "@type": "Brand", name: "TEKKY" },
      offers: {
        "@type": "Offer",
        url: "https://zenithsports.org/products/high-performance-tekky-t-white-copy",
        priceCurrency: "USD",
        price: "17.50",
        availability: "https://schema.org/InStock",
        priceValidUntil: "2027-12-31",
      },
    },
  ],
};

export default function ZenithSportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD — Phase 1 SEO foundation. Rendered as separate script
          blocks so Google + AI crawlers can parse each entity cleanly. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD.organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD.website) }}
      />
      {JSON_LD.products.map((product, i) => (
        <script
          key={`product-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
        />
      ))}
      {/*
        TEKKY ball palette — pulled from the actual product photo
        (zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00001.jpg).
        Three swoosh accents (mint-teal → cobalt-blue → violet) on a
        white-and-black panel base. Used here for the page-level
        scrollbar and surfaced as CSS vars so any nested component
        can pull them via var(--tekky-teal) etc.
      */}
      <style>{`
        .zenith-root {
          --tekky-teal:    #3BDAC0;
          --tekky-teal-dk: #1FAE96;
          --tekky-blue:    #2C4DD8;
          --tekky-blue-dk: #1A36AB;
          --tekky-violet:  #8A6FDF;
          --tekky-violet-dk: #6448C2;
        }
        /* Custom scrollbar — gradient down the thumb in ball colors.
           Scoped to .zenith-root via :where() to avoid global leak. */
        :where(.zenith-root) ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        :where(.zenith-root) ::-webkit-scrollbar-track {
          background: #050d1f;
        }
        :where(.zenith-root) ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg,
            var(--tekky-teal) 0%,
            var(--tekky-blue) 55%,
            var(--tekky-violet) 100%);
          border-radius: 8px;
          border: 2px solid #050d1f;
          background-clip: padding-box;
        }
        :where(.zenith-root) ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg,
            var(--tekky-teal-dk) 0%,
            var(--tekky-blue-dk) 55%,
            var(--tekky-violet-dk) 100%);
          background-clip: padding-box;
        }
        /* Firefox fallback — single thumb color (Firefox can't gradient) */
        :where(.zenith-root) {
          scrollbar-width: thin;
          scrollbar-color: var(--tekky-blue) #050d1f;
        }
      `}</style>
      <ClientTrackingScripts slug="zenith-sports" />
      <div className="zenith-root">{children}</div>
      <BackToTopButton bg="#2DE0C2" fg="#0a1832" />
    </>
  );
}
