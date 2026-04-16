import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Landscaping Company Website Design | Live Example — BlueJays",
  description:
    "See a premium landscaping and lawn care website in action. BlueJays builds custom landscaping websites starting at $997 — custom design, domain, and hosting. Seasonal services and more.",
  keywords: "landscaping website design, lawn care website, landscape company website, yard service website",
  openGraph: {
    title: "Landscaping Company Website Design | Live Example — BlueJays",
    description: "See a premium landscaping and lawn care website in action. BlueJays builds custom landscaping websites starting at $997 — custom design, domain, and hosting. Seasonal services and more.",
    url: "https://bluejayportfolio.com/v2/landscaping",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/landscaping",
  },
};

export default function LandscapingV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
