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
  return (
    <>
      {/* Cormorant Garamond (headings) + Raleway (body) — spec for event planning gala luxury */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Raleway:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .event-v2 h1, .event-v2 h2, .event-v2 h3, .event-v2 h4 {
          font-family: 'Cormorant Garamond', Georgia, serif !important;
          letter-spacing: 0.01em;
        }
        .event-v2, .event-v2 p, .event-v2 a, .event-v2 button, .event-v2 input,
        .event-v2 select, .event-v2 textarea, .event-v2 label, .event-v2 span:not(.font-mono) {
          font-family: 'Raleway', system-ui, -apple-system, sans-serif;
        }
      `}</style>
      {children}
    </>
  );
}
