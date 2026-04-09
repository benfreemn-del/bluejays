// Separate metadata export for the get-started route.
// The page itself is a "use client" component, so metadata must live here.
import type { Metadata } from "next";

const BASE_URL = "https://bluejayportfolio.com";
const OG_IMAGE = `${BASE_URL}/og-image.png`;
const PAGE_URL = `${BASE_URL}/get-started`;

export const metadata: Metadata = {
  title: "Get a Free Website Preview | BlueJays",
  description:
    "Tell us about your business and we'll build a free, custom website preview — no credit card, no obligation. See your new site in 48 hours.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    siteName: "BlueJays",
    title: "Get a Free Website Preview | BlueJays",
    description:
      "Tell us about your business and we'll build a free, custom website preview — no credit card, no obligation.",
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "BlueJays — Get a Free Website Preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get a Free Website Preview | BlueJays",
    description:
      "Tell us about your business and we'll build a free, custom website preview — no credit card, no obligation.",
    images: [OG_IMAGE],
  },
};
