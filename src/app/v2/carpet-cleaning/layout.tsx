import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carpet Cleaning Website Design | Live Example — BlueJays",
  description:
    "See a premium carpet cleaning business website in action. BlueJays builds custom carpet cleaning websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "carpet cleaning website design, carpet cleaner website, floor cleaning website",
  openGraph: {
    title: "Carpet Cleaning Website Design | Live Example — BlueJays",
    description: "See a premium carpet cleaning business website in action. BlueJays builds custom carpet cleaning websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/carpet-cleaning",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/carpet-cleaning",
  },
};

export default function CarpetCleaningV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
