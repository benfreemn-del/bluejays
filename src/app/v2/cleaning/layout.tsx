import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cleaning Service Website Design | Live Example — BlueJays",
  description:
    "See a premium house and office cleaning business website in action. BlueJays builds custom cleaning service websites starting at $997 — custom design, domain, and hosting.",
  keywords: "cleaning service website design, house cleaning website, maid service website, janitorial website",
  openGraph: {
    title: "Cleaning Service Website Design | Live Example — BlueJays",
    description: "See a premium house and office cleaning business website in action. BlueJays builds custom cleaning service websites starting at $997 — custom design, domain, and hosting.",
    url: "https://bluejayportfolio.com/v2/cleaning",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/cleaning",
  },
};

export default function CleaningV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
