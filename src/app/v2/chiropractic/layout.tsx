import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chiropractic Website Design | Live Example — BlueJays",
  description:
    "See a premium chiropractic clinic website in action. BlueJays builds custom chiropractic websites starting at $997 — custom design, domain, and hosting included. 48-hour launch.",
  keywords: "chiropractic website design, chiropractor website, spine clinic website, chiro practice website",
  openGraph: {
    title: "Chiropractic Website Design | Live Example — BlueJays",
    description: "See a premium chiropractic clinic website in action. BlueJays builds custom chiropractic websites starting at $997 — custom design, domain, and hosting included. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/chiropractic",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/chiropractic",
  },
};

export default function ChiropracticV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
