import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pool & Spa Website Design | Live Example — BlueJays",
  description:
    "See a premium pool and spa service website in action. BlueJays builds custom pool and spa websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "pool spa website design, pool service website, spa company website, pool installation website",
  openGraph: {
    title: "Pool & Spa Website Design | Live Example — BlueJays",
    description: "See a premium pool and spa service website in action. BlueJays builds custom pool and spa websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/pool-spa",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/pool-spa",
  },
};

export default function PoolSpaV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
