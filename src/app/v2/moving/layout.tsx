import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moving Company Website Design | Live Example — BlueJays",
  description:
    "See a premium moving company website in action. BlueJays builds custom moving company websites starting at $997 — custom design, domain, and hosting. Quotes, process steps, and reviews.",
  keywords: "moving company website design, movers website, moving service website, relocation company website",
  openGraph: {
    title: "Moving Company Website Design | Live Example — BlueJays",
    description: "See a premium moving company website in action. BlueJays builds custom moving company websites starting at $997 — custom design, domain, and hosting. Quotes, process steps, and reviews.",
    url: "https://bluejayportfolio.com/v2/moving",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/moving",
  },
};

export default function MovingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
