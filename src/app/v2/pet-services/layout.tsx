import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pet Services Website Design | Live Example — BlueJays",
  description:
    "See a premium pet care and grooming website in action. BlueJays builds custom pet services websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "pet services website design, pet grooming website, dog boarding website, pet care website",
  openGraph: {
    title: "Pet Services Website Design | Live Example — BlueJays",
    description: "See a premium pet care and grooming website in action. BlueJays builds custom pet services websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/pet-services",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/pet-services",
  },
};

export default function PetServicesV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
