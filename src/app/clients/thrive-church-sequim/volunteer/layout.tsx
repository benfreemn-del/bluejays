import type { Metadata, Viewport } from "next";

const SITE_URL = "https://bluejayportfolio.com";
const PAGE_URL = `${SITE_URL}/clients/thrive-church-sequim/volunteer`;
const OG_IMAGE = `${SITE_URL}/og-default.jpg`;

const TITLE = "Volunteer — Thrive Church · Sequim, WA";
const DESCRIPTION =
  "Find your place to serve at Thrive Church Sequim. Take a 2-minute quiz to find the right team for your skills and schedule, or sign up directly to volunteer with kids, hospitality, worship/tech, Table of Grace, prayer, or outreach.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "volunteer Sequim church",
    "Thrive Church volunteer",
    "Sequim church serving",
    "Next Wave Kids volunteer",
    "Table of Grace volunteer",
    "church hospitality team Sequim",
    "small group leader Sequim",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Thrive Church",
    type: "website",
    locale: "en_US",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf7ee",
  width: "device-width",
  initialScale: 1,
};

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
