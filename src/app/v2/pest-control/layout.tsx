import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pest Control Website Design | Live Example — BlueJays",
  description:
    "See a premium pest control and exterminator website in action. BlueJays builds custom pest control websites starting at $997 — custom design, domain, and hosting. 48-hour launch.",
  keywords: "pest control website design, exterminator website, pest management website, termite control website",
  openGraph: {
    title: "Pest Control Website Design | Live Example — BlueJays",
    description: "See a premium pest control and exterminator website in action. BlueJays builds custom pest control websites starting at $997 — custom design, domain, and hosting. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/pest-control",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/pest-control",
  },
};

export default function PestControlV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
