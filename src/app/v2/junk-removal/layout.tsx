import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Junk Removal Website Design | Live Example — BlueJays",
  description:
    "See a premium junk removal and hauling website in action. BlueJays builds custom junk removal websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "junk removal website design, junk hauling website, trash removal website, debris removal website",
  openGraph: {
    title: "Junk Removal Website Design | Live Example — BlueJays",
    description: "See a premium junk removal and hauling website in action. BlueJays builds custom junk removal websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/junk-removal",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/junk-removal",
  },
};

export default function JunkRemovalV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
