import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painting Contractor Website Design | Live Example — BlueJays",
  description:
    "See a premium painting contractor website in action. BlueJays builds custom painting company websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "painting contractor website design, painter website, house painting website, commercial painting website",
  openGraph: {
    title: "Painting Contractor Website Design | Live Example — BlueJays",
    description: "See a premium painting contractor website in action. BlueJays builds custom painting company websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/painting",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/painting",
  },
};

export default function PaintingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
