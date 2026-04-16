import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Locksmith Website Design | Live Example — BlueJays",
  description:
    "See a premium locksmith and security service website in action. BlueJays builds custom locksmith websites starting at $997 — full custom design, domain, and hosting included.",
  keywords: "locksmith website design, locksmith company website, security service website, key service website",
  openGraph: {
    title: "Locksmith Website Design | Live Example — BlueJays",
    description: "See a premium locksmith and security service website in action. BlueJays builds custom locksmith websites starting at $997 — full custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/locksmith",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/locksmith",
  },
};

export default function LocksmithV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
