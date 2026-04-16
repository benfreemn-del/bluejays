import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hair Salon Website Design | Live Example — BlueJays",
  description:
    "See a premium hair salon and beauty studio website in action. BlueJays builds custom salon websites starting at $997 — custom design, domain, and hosting. Service menu, stylists, and booking.",
  keywords: "hair salon website design, beauty salon website, salon website, barbershop website design",
  openGraph: {
    title: "Hair Salon Website Design | Live Example — BlueJays",
    description: "See a premium hair salon and beauty studio website in action. BlueJays builds custom salon websites starting at $997 — custom design, domain, and hosting. Service menu, stylists, and booking.",
    url: "https://bluejayportfolio.com/v2/salon",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/salon",
  },
};

export default function SalonV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
