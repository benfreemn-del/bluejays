import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tree Service Website Design | Live Example — BlueJays",
  description:
    "See a premium tree care and arborist website in action. BlueJays builds custom tree service websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
  keywords: "tree service website design, arborist website, tree trimming website, tree removal website",
  openGraph: {
    title: "Tree Service Website Design | Live Example — BlueJays",
    description: "See a premium tree care and arborist website in action. BlueJays builds custom tree service websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/tree-service",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/tree-service",
  },
};

export default function TreeServiceV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
