import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";

/**
 * Layout for /clients/masters-window-tinting — Masters Window Tinting
 * (West Babylon, NY). Custom-tier bespoke premium build.
 *
 * Loads Barlow Condensed (headings) + Barlow (body) per the BlueJays
 * automotive typography pairing. Sets a near-black themeColor so iOS
 * status bar matches the dark luxury auto vibe instead of flashing
 * white on initial paint.
 */
export const metadata: Metadata = {
  title:
    "Masters Window Tinting · Long Island's Premium Auto Tint, Ceramic Pro, Liquid PPF",
  description:
    "Long Island's certified Ceramic Pro installer and authorized Ultra Vision dealer. Auto, residential, and commercial window tinting plus ceramic coatings and liquid paint protection film. Lifetime warranty, in-house installers, 7 days a week.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function MastersWindowTintingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Google Fonts: Barlow Condensed (headings) + Barlow (body).
          Loaded here so they're ready before the page paints. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <ClientTrackingScripts slug="masters-window-tinting" />
      {children}
    </>
  );
}
