import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Planning Website Design | Live Example — BlueJays",
  description:
    "See a premium event planning and coordination website in action. BlueJays builds custom event planner websites starting at $997 — custom design, domain, and hosting included.",
  keywords: "event planning website design, event planner website, wedding planner website, event coordinator website",
  openGraph: {
    title: "Event Planning Website Design | Live Example — BlueJays",
    description: "See a premium event planning and coordination website in action. BlueJays builds custom event planner websites starting at $997 — custom design, domain, and hosting included.",
    url: "https://bluejayportfolio.com/v2/event-planning",
    siteName: "BlueJays Web Design Portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://bluejayportfolio.com/v2/event-planning",
  },
};

export default function EventPlanningV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
