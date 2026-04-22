import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insurance Agency Website Design | Live Example — BlueJays",
  description:
    "See a premium insurance agency website in action. BlueJays builds custom insurance websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
  keywords: "insurance agency website design, insurance broker website, independent agent website, insurance company website",
  openGraph: {
    title: "Insurance Agency Website Design | Live Example — BlueJays",
    description: "See a premium insurance agency website in action. BlueJays builds custom insurance websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/insurance",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/insurance",
  },
};

export default function InsuranceV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
