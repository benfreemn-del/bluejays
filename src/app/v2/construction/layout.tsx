import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Construction Company Website Design | Live Example — BlueJays",
  description:
    "See a premium construction company website in action. BlueJays builds custom construction websites starting at $997 — custom design, domain, and hosting included. 48-hour launch.",
  keywords: "construction website design, construction company website, contractor website, builder website",
  openGraph: {
    title: "Construction Company Website Design | Live Example — BlueJays",
    description: "See a premium construction company website in action. BlueJays builds custom construction websites starting at $997 — custom design, domain, and hosting included. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/construction",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/construction",
  },
};

export default function ConstructionV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
