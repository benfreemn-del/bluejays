import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import About from "@/components/About";
import AboutBen from "@/components/AboutBen";
import Services from "@/components/Services";
import AgencySection from "@/components/AgencySection";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AuditTestimonials from "@/app/audit/AuditTestimonials";
import { jsonLdString, organizationLd } from "@/lib/json-ld";

const BASE_URL = "https://bluejayportfolio.com";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export const metadata: Metadata = {
  title: "BlueJays | We Build You A Better Website — See It Free First",
  description:
    "We build your business a brand-new website in 48 hours. You see it before you pay. Don't love it? You don't pay a cent. $997 one-time.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    siteName: "BlueJays",
    title: "BlueJays | We Build You A Better Website — See It Free First",
    description:
      "We build your business a brand-new website in 48 hours. See it free before you pay.",
    url: BASE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "BlueJays — see your new website free first, only pay if you love it" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueJays | We Build You A Better Website — See It Free First",
    description:
      "We build your business a brand-new website in 48 hours. See it free before you pay.",
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
      <Services />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
