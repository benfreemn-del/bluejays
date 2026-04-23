import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tattoo Shop Website Design | Live Example — BlueJays",
  description:
    "See a premium tattoo studio and parlor website in action. BlueJays builds custom tattoo websites starting at $997 — full custom design, domain, and hosting. Artist portfolios and booking.",
  keywords: "tattoo shop website design, tattoo studio website, tattoo parlor website, tattoo artist website",
  openGraph: {
    title: "Tattoo Shop Website Design | Live Example — BlueJays",
    description: "See a premium tattoo studio and parlor website in action. BlueJays builds custom tattoo websites starting at $997 — full custom design, domain, and hosting. Artist portfolios and booking.",
    url: "https://bluejayportfolio.com/v2/tattoo",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/tattoo",
  },
};

export default function TattooV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
