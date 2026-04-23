import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daycare & Childcare Website Design | Live Example — BlueJays",
  description:
    "See a premium daycare and childcare center website in action. BlueJays builds custom childcare websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "daycare website design, childcare website design, preschool website, child care center website",
  openGraph: {
    title: "Daycare & Childcare Website Design | Live Example — BlueJays",
    description: "See a premium daycare and childcare center website in action. BlueJays builds custom childcare websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/daycare",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/daycare",
  },
};

export default function DaycareV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
