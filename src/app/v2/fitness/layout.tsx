import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitness & Gym Website Design | Live Example — BlueJays",
  description:
    "See a premium fitness studio and gym website in action. BlueJays builds custom fitness websites starting at $997 — custom design, domain, and hosting. Membership pages, class schedules, and more.",
  keywords: "fitness website design, gym website design, personal trainer website, fitness studio website",
  openGraph: {
    title: "Fitness & Gym Website Design | Live Example — BlueJays",
    description: "See a premium fitness studio and gym website in action. BlueJays builds custom fitness websites starting at $997 — custom design, domain, and hosting. Membership pages, class schedules, and more.",
    url: "https://bluejayportfolio.com/v2/fitness",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/fitness",
  },
};

export default function FitnessV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
