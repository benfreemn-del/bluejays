// Server component layout — provides metadata for the /upsells/[id] route.
// The page itself is a "use client" component and cannot export metadata directly.
import type { Metadata } from "next";

const BASE_URL = "https://bluejayportfolio.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  let businessName = "Your Business";
  try {
    // /api/claim/[id] is the public sanitized endpoint — same path used
    // by the claim page. Returns businessName + safe fields only.
    const res = await fetch(`${BASE_URL}/api/claim/${id}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.businessName) businessName = data.businessName;
    }
  } catch {
    // Fall back to generic title on any error.
  }

  const title = `Add-ons — ${businessName} | BlueJays`;
  const description = `1-click add-ons for ${businessName}: review request blasts, extra pages, Google Business Profile setup, monthly content updates.`;
  const pageUrl = `${BASE_URL}/upsells/${id}`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    robots: { index: false, follow: false },
  };
}

export default function UpsellsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
