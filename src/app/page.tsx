import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import About from "@/components/About";
import AboutBen from "@/components/AboutBen";
import AgencySection from "@/components/AgencySection";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AuditTestimonials from "@/app/audit/AuditTestimonials";
import { jsonLdString, organizationLd } from "@/lib/json-ld";

const BASE_URL = "https://bluejayportfolio.com";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

// Metadata rewritten 2026-05-14 per ICP niche-down (memory:
// recent_locked_decisions.md). Two verticals only — niche product
// manufacturers + indie authors. Headline leads with vertical-specific
// positioning per the Luis 1-yr-validated "Optimize for the Customer
// You Already Have the Most Of" framework.
export const metadata: Metadata = {
  title: "BlueJays | AI Marketing Systems for Product Makers + Indie Authors",
  description:
    "Custom AI marketing systems for niche product manufacturers and indie author series. Built by the team behind Tekky's full sales funnel and the Bloodlines author showcase. Free 60-second audit.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    siteName: "BlueJays",
    title: "BlueJays | AI Marketing Systems for Product Makers + Indie Authors",
    description:
      "We build product brands (manufacturers + indie authors) a marketing system that owns the customer relationship. See yours free first.",
    url: BASE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "BlueJays — AI marketing systems for product makers and indie authors" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueJays | AI Marketing Systems for Product Makers + Indie Authors",
    description:
      "Product brands (manufacturers + indie authors) get an AI marketing system that owns the customer relationship.",
    images: [OG_IMAGE],
  },
};

export default function Home() {
  return (
    <main>
      {/* Organization JSON-LD — helps Google build the BlueJays
          knowledge-panel card in search. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(organizationLd()) }}
      />
      {/* RetargetingPixels now mounted globally in src/app/layout.tsx so the
          gtag library + Meta Pixel load on every route (including /audit form
          submits, claim flow, etc.). */}
      <Hero />
      <AgencySection />
      <AuditTestimonials />
      <Stats />
      <About />
      <AboutBen />
      {/* <Services /> removed 2026-05-14 per ICP niche-down — was the legacy
          service-trade list. Component file kept on disk in src/components/Services.tsx
          for future productization or service-trade-inbound landing. */}
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
