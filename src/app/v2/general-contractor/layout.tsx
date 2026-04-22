import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "General Contractor Website Design | Live Example — BlueJays",
  description:
    "See a premium general contractor website in action. BlueJays builds custom GC websites starting at $997 — full custom design, domain, and hosting included. 48-hour turnaround.",
  keywords: "general contractor website design, GC website, contractor website design, remodeling company website",
  openGraph: {
    title: "General Contractor Website Design | Live Example — BlueJays",
    description: "See a premium general contractor website in action. BlueJays builds custom GC websites starting at $997 — full custom design, domain, and hosting included. 48-hour turnaround.",
    url: "https://bluejayportfolio.com/v2/general-contractor",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/general-contractor",
  },
};

export default function GeneralContractorV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
