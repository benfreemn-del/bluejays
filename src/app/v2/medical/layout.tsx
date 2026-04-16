import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Practice Website Design | Live Example — BlueJays",
  description:
    "See a premium medical practice and clinic website in action. BlueJays builds custom medical websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
  keywords: "medical website design, medical practice website, clinic website design, doctor website",
  openGraph: {
    title: "Medical Practice Website Design | Live Example — BlueJays",
    description: "See a premium medical practice and clinic website in action. BlueJays builds custom medical websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/medical",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/medical",
  },
};

export default function MedicalV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
