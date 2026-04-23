import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fencing Company Website Design | Live Example — BlueJays",
  description:
    "See a premium fencing contractor website in action. BlueJays builds custom fencing company websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "fencing website design, fence contractor website, fencing company website, fence installation website",
  openGraph: {
    title: "Fencing Company Website Design | Live Example — BlueJays",
    description: "See a premium fencing contractor website in action. BlueJays builds custom fencing company websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/fencing",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/fencing",
  },
};

export default function FencingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
