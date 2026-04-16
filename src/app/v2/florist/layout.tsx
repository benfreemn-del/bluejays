import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Florist Website Design | Live Example — BlueJays",
  description:
    "See a premium floral design and flower shop website in action. BlueJays builds custom florist websites starting at $997 — custom design, domain, and hosting included. 48-hour launch.",
  keywords: "florist website design, flower shop website, floral design website, flower delivery website",
  openGraph: {
    title: "Florist Website Design | Live Example — BlueJays",
    description: "See a premium floral design and flower shop website in action. BlueJays builds custom florist websites starting at $997 — custom design, domain, and hosting included. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/florist",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/florist",
  },
};

export default function FloristV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
