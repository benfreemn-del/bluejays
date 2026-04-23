import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HVAC Company Website Design | Live Example — BlueJays",
  description:
    "See a premium HVAC heating and cooling website in action. BlueJays builds custom HVAC websites starting at $997 — custom design, domain, and hosting. Financing and emergency sections included.",
  keywords: "HVAC website design, heating and cooling website, air conditioning website, furnace repair website",
  openGraph: {
    title: "HVAC Company Website Design | Live Example — BlueJays",
    description: "See a premium HVAC heating and cooling website in action. BlueJays builds custom HVAC websites starting at $997 — custom design, domain, and hosting. Financing and emergency sections included.",
    url: "https://bluejayportfolio.com/v2/hvac",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/hvac",
  },
};

export default function HvacV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
