import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import RetargetingPixels from "@/components/RetargetingPixels";

const BASE_URL = "https://bluejayportfolio.com";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export const metadata: Metadata = {
  title: "BlueJays | Premium Web Design for Local Businesses",
  description:
    "We build stunning, high-converting websites for local businesses. See your new site before you pay. No obligation, no credit card required.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    siteName: "BlueJays",
    title: "BlueJays | Premium Web Design for Local Businesses",
    description:
      "We build stunning, high-converting websites for local businesses. See your new site before you pay.",
    url: BASE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "BlueJays — Premium Web Design for Local Businesses" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueJays | Premium Web Design for Local Businesses",
    description:
      "We build stunning, high-converting websites for local businesses. See your new site before you pay.",
    images: [OG_IMAGE],
  },
};

export default function Home() {
  return (
    <main>
      {/* Retargeting pixels — organic homepage visitors enter a 30-day
          retargeting window. Self-gates on env vars + ?embed=1. */}
      <RetargetingPixels />
      <Hero />
      <Stats />
      <About />
      <Services />
      <Contact />
      <Footer />
    </main>
  );
}
