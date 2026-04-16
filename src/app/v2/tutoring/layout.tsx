import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutoring Business Website Design | Live Example — BlueJays",
  description:
    "See a premium tutoring and academic coaching website in action. BlueJays builds custom tutoring websites starting at $997 — custom design, domain, and hosting. Subject pages and more.",
  keywords: "tutoring website design, tutor website, academic coaching website, education business website",
  openGraph: {
    title: "Tutoring Business Website Design | Live Example — BlueJays",
    description: "See a premium tutoring and academic coaching website in action. BlueJays builds custom tutoring websites starting at $997 — custom design, domain, and hosting. Subject pages and more.",
    url: "https://bluejayportfolio.com/v2/tutoring",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/tutoring",
  },
};

export default function TutoringV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
