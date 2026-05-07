import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";

/**
 * Layout for /clients/meyer-electric — Meyer Electric LLC, Sequim WA.
 * Custom-tier bespoke premium build for the Olympic Peninsula's Tesla
 * Powerwall Certified Installer + Generac Authorized Dealer + general
 * licensed electrical contractor.
 *
 * Aesthetic: dark electrician — pure near-black background with bright
 * yellow (#facc15) lightning-bolt accent. Matches the screenshot
 * template Ben sourced (Tesla Powerwall installer trade dress) and the
 * CLAUDE.md "Dark Professional" theme guide for trades.
 *
 * Fonts: Space Grotesk (headings) + Inter (body) — CLAUDE.md typography
 * pairing for electrician/plumber/HVAC categories. Technical-modern
 * feel without veering into industrial-condensed (Barlow Condensed)
 * territory.
 *
 * Pattern reference: masters-window-tinting/layout.tsx + page.tsx +
 * hector-landscaping/page.tsx. Custom tier means quality bar > V2
 * template — same weight Tesla puts on their official installer pages.
 */
export const metadata: Metadata = {
  title:
    "Meyer Electric LLC — Tesla Powerwall, Generators & Licensed Electrician · Sequim, WA",
  description:
    "Olympic Peninsula's Tesla Powerwall Certified Installer + Generac Authorized Dealer. Licensed, bonded & insured. 15+ years powering Sequim, Port Angeles, Port Townsend, and the entire Olympic Peninsula. Call (360) 477-2202.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function MeyerElectricLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Google Fonts: Space Grotesk (headings) + Inter (body) per
          CLAUDE.md typography table for electrician category. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <ClientTrackingScripts slug="meyer-electric" />
      {children}
    </>
  );
}
