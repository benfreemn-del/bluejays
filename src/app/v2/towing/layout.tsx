import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Towing Company Website Design | Live Example — BlueJays",
  description:
    "See a premium towing and roadside assistance website in action. BlueJays builds custom towing company websites starting at $997 — custom design, domain, and hosting included.",
  keywords: "towing company website design, tow truck website, roadside assistance website, towing service website",
  openGraph: {
    title: "Towing Company Website Design | Live Example — BlueJays",
    description: "See a premium towing and roadside assistance website in action. BlueJays builds custom towing company websites starting at $997 — custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/towing",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/towing",
  },
};

export default function TowingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
