import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pressure Washing Website Design | Live Example — BlueJays",
  description:
    "See a premium pressure washing and power washing website in action. BlueJays builds custom pressure washing websites starting at $997 — custom design, domain, and hosting included.",
  keywords: "pressure washing website design, power washing website, soft washing website, exterior cleaning website",
  openGraph: {
    title: "Pressure Washing Website Design | Live Example — BlueJays",
    description: "See a premium pressure washing and power washing website in action. BlueJays builds custom pressure washing websites starting at $997 — custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/pressure-washing",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/pressure-washing",
  },
};

export default function PressureWashingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
