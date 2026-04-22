import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounting & CPA Website Design | Live Example — BlueJays",
  description:
    "See a premium accounting and CPA firm website in action. BlueJays builds custom accounting websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
  keywords: "accounting website design, CPA website design, tax firm website, bookkeeping website",
  openGraph: {
    title: "Accounting & CPA Website Design | Live Example — BlueJays",
    description: "See a premium accounting and CPA firm website in action. BlueJays builds custom accounting websites starting at $997 — full custom design, domain, and hosting included. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/accounting",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/accounting",
  },
};

export default function AccountingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
