import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Martial Arts School Website Design | Live Example — BlueJays",
  description:
    "See a premium martial arts and self-defense school website in action. BlueJays builds custom martial arts websites starting at $997 — custom design, domain, and hosting included.",
  keywords: "martial arts website design, karate school website, MMA gym website, self-defense school website",
  openGraph: {
    title: "Martial Arts School Website Design | Live Example — BlueJays",
    description: "See a premium martial arts and self-defense school website in action. BlueJays builds custom martial arts websites starting at $997 — custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/martial-arts",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/martial-arts",
  },
};

export default function MartialArtsV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
