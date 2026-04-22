import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catering Business Website Design | Live Example — BlueJays",
  description:
    "See a premium catering company website in action. BlueJays builds custom catering websites starting at $997 — full custom design, domain, and hosting. 48-hour turnaround.",
  keywords: "catering website design, catering company website, event catering website, food service website",
  openGraph: {
    title: "Catering Business Website Design | Live Example — BlueJays",
    description: "See a premium catering company website in action. BlueJays builds custom catering websites starting at $997 — full custom design, domain, and hosting. 48-hour turnaround.",
    url: "https://bluejayportfolio.com/v2/catering",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/catering",
  },
};

export default function CateringV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
