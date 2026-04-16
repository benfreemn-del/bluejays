import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Law Firm Website Design | Live Example — BlueJays",
  description:
    "See a premium law firm and attorney website in action. BlueJays builds custom legal websites starting at $997 — full custom design, domain, and hosting. Free consultation CTAs and more.",
  keywords: "law firm website design, attorney website design, lawyer website, legal services website",
  openGraph: {
    title: "Law Firm Website Design | Live Example — BlueJays",
    description: "See a premium law firm and attorney website in action. BlueJays builds custom legal websites starting at $997 — full custom design, domain, and hosting. Free consultation CTAs and more.",
    url: "https://bluejayportfolio.com/v2/law-firm",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/law-firm",
  },
};

export default function LawFirmV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
