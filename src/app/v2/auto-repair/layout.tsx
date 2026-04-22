import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Repair Website Design | Live Example — BlueJays",
  description:
    "See a premium auto repair and mechanic shop website in action. BlueJays builds custom auto repair websites starting at $997 — custom design, domain, and hosting. 48-hour launch.",
  keywords: "auto repair website design, mechanic shop website, car repair website, automotive website",
  openGraph: {
    title: "Auto Repair Website Design | Live Example — BlueJays",
    description: "See a premium auto repair and mechanic shop website in action. BlueJays builds custom auto repair websites starting at $997 — custom design, domain, and hosting. 48-hour launch.",
    url: "https://bluejayportfolio.com/v2/auto-repair",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/auto-repair",
  },
};

export default function AutoRepairV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
