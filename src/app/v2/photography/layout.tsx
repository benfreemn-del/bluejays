import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photography Business Website Design | Live Example — BlueJays",
  description:
    "See a premium photography studio website in action. BlueJays builds custom photographer websites starting at $997 — custom design, domain, and hosting. Portfolio, packages, and booking.",
  keywords: "photography website design, photographer website, photo studio website, wedding photographer website",
  openGraph: {
    title: "Photography Business Website Design | Live Example — BlueJays",
    description: "See a premium photography studio website in action. BlueJays builds custom photographer websites starting at $997 — custom design, domain, and hosting. Portfolio, packages, and booking.",
    url: "https://bluejayportfolio.com/v2/photography",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/photography",
  },
};

export default function PhotographyV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
