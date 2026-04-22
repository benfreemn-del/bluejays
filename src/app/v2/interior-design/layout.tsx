import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interior Design Website Design | Live Example — BlueJays",
  description:
    "See a premium interior design studio website in action. BlueJays builds custom interior design websites starting at $997 — custom design, domain, and hosting. Portfolio, packages, and more.",
  keywords: "interior design website design, interior designer website, home design website, design studio website",
  openGraph: {
    title: "Interior Design Website Design | Live Example — BlueJays",
    description: "See a premium interior design studio website in action. BlueJays builds custom interior design websites starting at $997 — custom design, domain, and hosting. Portfolio, packages, and more.",
    url: "https://bluejayportfolio.com/v2/interior-design",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/interior-design",
  },
};

export default function InteriorDesignV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
