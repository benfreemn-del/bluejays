import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Electrician Website Design | Live Example — BlueJays",
  description:
    "See a premium licensed electrician website in action. BlueJays builds custom electrician websites starting at $997 — full custom design, domain, and hosting. 48-hour launch.",
  keywords: "electrician website design, electrical contractor website, licensed electrician website, electric company website",
  openGraph: {
    title: "Electrician Website Design | Live Example — BlueJays",
    description: "See a premium licensed electrician website in action. BlueJays builds custom electrician websites starting at $997 — full custom design, domain, and hosting. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/electrician",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/electrician",
  },
};

export default function ElectricianV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
