import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dental Practice Website Design | Live Example — BlueJays",
  description:
    "See a premium dental practice website in action. BlueJays builds custom dental websites starting at $997 — custom design, domain, and hosting included. New patients, insurance sections, and more.",
  keywords: "dental website design, dentist website, dental practice website, dental office website design",
  openGraph: {
    title: "Dental Practice Website Design | Live Example — BlueJays",
    description: "See a premium dental practice website in action. BlueJays builds custom dental websites starting at $997 — custom design, domain, and hosting included. New patients, insurance sections, and more.",
    url: "https://bluejayportfolio.com/v2/dental",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/dental",
  },
};

export default function DentalV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
