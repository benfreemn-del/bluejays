import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Med Spa Website Design | Live Example — BlueJays",
  description:
    "See a premium medical spa and aesthetics website in action. BlueJays builds custom med spa websites starting at $997 — custom design, domain, and hosting. Treatment menus and booking.",
  keywords: "med spa website design, medical spa website, aesthetics clinic website, Botox website design",
  openGraph: {
    title: "Med Spa Website Design | Live Example — BlueJays",
    description: "See a premium medical spa and aesthetics website in action. BlueJays builds custom med spa websites starting at $997 — custom design, domain, and hosting. Treatment menus and booking.",
    url: "https://bluejayportfolio.com/v2/med-spa",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/med-spa",
  },
};

export default function MedSpaV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
