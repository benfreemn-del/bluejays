import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Church Website Design | Live Example — BlueJays",
  description:
    "See a premium church and ministry website in action. BlueJays builds custom church websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
  keywords: "church website design, ministry website, congregation website, faith community website",
  openGraph: {
    title: "Church Website Design | Live Example — BlueJays",
    description: "See a premium church and ministry website in action. BlueJays builds custom church websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/church",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/church",
  },
};

export default function ChurchV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
