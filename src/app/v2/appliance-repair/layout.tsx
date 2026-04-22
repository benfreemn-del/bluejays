import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appliance Repair Website Design | Live Example — BlueJays",
  description:
    "See a premium appliance repair business website in action. BlueJays builds custom appliance repair websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "appliance repair website design, appliance service website, repair business website",
  openGraph: {
    title: "Appliance Repair Website Design | Live Example — BlueJays",
    description: "See a premium appliance repair business website in action. BlueJays builds custom appliance repair websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/appliance-repair",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/appliance-repair",
  },
};

export default function ApplianceRepairV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
