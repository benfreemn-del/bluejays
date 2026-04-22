import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veterinary Clinic Website Design | Live Example — BlueJays",
  description:
    "See a premium veterinary clinic and animal hospital website in action. BlueJays builds custom vet websites starting at $997 — custom design, domain, and hosting. New patient forms and more.",
  keywords: "veterinary website design, vet clinic website, animal hospital website, pet clinic website design",
  openGraph: {
    title: "Veterinary Clinic Website Design | Live Example — BlueJays",
    description: "See a premium veterinary clinic and animal hospital website in action. BlueJays builds custom vet websites starting at $997 — custom design, domain, and hosting. New patient forms and more.",
    url: "https://bluejayportfolio.com/v2/veterinary",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/veterinary",
  },
};

export default function VeterinaryV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
