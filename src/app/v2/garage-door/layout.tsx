import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garage Door Company Website Design | Live Example — BlueJays",
  description:
    "See a premium garage door installation and repair website in action. BlueJays builds custom garage door websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "garage door website design, garage door company website, garage door repair website, garage door installation website",
  openGraph: {
    title: "Garage Door Company Website Design | Live Example — BlueJays",
    description: "See a premium garage door installation and repair website in action. BlueJays builds custom garage door websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/garage-door",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/garage-door",
  },
};

export default function GarageDoorV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
