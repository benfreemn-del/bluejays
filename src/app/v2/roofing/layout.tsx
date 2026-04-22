import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roofing Company Website Design | Live Example — BlueJays",
  description:
    "See a premium roofing contractor website in action. BlueJays builds custom roofing websites starting at $997 — custom design, domain, and hosting. Insurance claims, financing, and more.",
  keywords: "roofing website design, roofing contractor website, roof repair website, roofer website",
  openGraph: {
    title: "Roofing Company Website Design | Live Example — BlueJays",
    description: "See a premium roofing contractor website in action. BlueJays builds custom roofing websites starting at $997 — custom design, domain, and hosting. Insurance claims, financing, and more.",
    url: "https://bluejayportfolio.com/v2/roofing",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/roofing",
  },
};

export default function RoofingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
