import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "TEKKY® Camps + Clinics — Find a Training Camp Near You · Zenith Sports",
  description:
    "Find a TEKKY® training camp, clinic, or partner club near you. Submit your zip code to be notified when a new camp opens in your area.",
  // Until Philip + Paul finalize the partner-camp list, keep this
  // unindexed. Once data populates, flip robots.
  robots: { index: false, follow: false },
};

export default function CampsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
