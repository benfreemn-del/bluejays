import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Physical Therapy Website Design | Live Example — BlueJays",
  description:
    "See a premium physical therapy and rehab clinic website in action. BlueJays builds custom PT websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "physical therapy website design, PT clinic website, rehab center website, sports therapy website",
  openGraph: {
    title: "Physical Therapy Website Design | Live Example — BlueJays",
    description: "See a premium physical therapy and rehab clinic website in action. BlueJays builds custom PT websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/physical-therapy",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/physical-therapy",
  },
};

export default function PhysicalTherapyV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
