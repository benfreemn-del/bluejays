import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Estate Agent Website Design | Live Example — BlueJays",
  description:
    "See a premium real estate agent website in action. BlueJays builds custom real estate websites starting at $997 — custom design, domain, and hosting. Mortgage calculator, listings, and more.",
  keywords: "real estate website design, realtor website, real estate agent website, property website design",
  openGraph: {
    title: "Real Estate Agent Website Design | Live Example — BlueJays",
    description: "See a premium real estate agent website in action. BlueJays builds custom real estate websites starting at $997 — custom design, domain, and hosting. Mortgage calculator, listings, and more.",
    url: "https://bluejayportfolio.com/v2/real-estate",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/real-estate",
  },
};

export default function RealEstateV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
