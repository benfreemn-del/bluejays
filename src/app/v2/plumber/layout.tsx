import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plumbing Company Website Design | Live Example — BlueJays",
  description:
    "See a premium licensed plumber website in action. BlueJays builds custom plumbing websites starting at $997 — custom design, domain, and hosting. 24/7 emergency, pricing, and trust sections.",
  keywords: "plumber website design, plumbing company website, plumbing contractor website, pipe repair website",
  openGraph: {
    title: "Plumbing Company Website Design | Live Example — BlueJays",
    description: "See a premium licensed plumber website in action. BlueJays builds custom plumbing websites starting at $997 — custom design, domain, and hosting. 24/7 emergency, pricing, and trust sections.",
    url: "https://bluejayportfolio.com/v2/plumber",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/plumber",
  },
};

export default function PlumberV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
