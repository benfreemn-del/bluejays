import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurant Website Design | Live Example — BlueJays",
  description:
    "See a premium restaurant and dining website in action. BlueJays builds custom restaurant websites starting at $997 — full custom design, domain, and hosting. Menu, reservations, and more.",
  keywords: "restaurant website design, food business website, dining website, cafe website design",
  openGraph: {
    title: "Restaurant Website Design | Live Example — BlueJays",
    description: "See a premium restaurant and dining website in action. BlueJays builds custom restaurant websites starting at $997 — full custom design, domain, and hosting. Menu, reservations, and more.",
    url: "https://bluejayportfolio.com/v2/restaurant",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/restaurant",
  },
};

export default function RestaurantV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
