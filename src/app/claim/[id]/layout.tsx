// Server component layout — provides metadata for the /claim/[id] route.
// The page itself is a "use client" component and cannot export metadata directly.
import type { Metadata } from "next";

const BASE_URL = "https://bluejayportfolio.com";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  // Attempt to fetch the prospect's business name for a personalised title.
  let businessName = "Your Business";
  try {
    const res = await fetch(`${BASE_URL}/api/prospects/${id}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.businessName) businessName = data.businessName;
    }
  } catch {
    // Fall back to generic title on any error
  }

  const title = `Claim Your Website — ${businessName} | BlueJays`;
  const description = `Your custom website for ${businessName} is ready. Claim it today and go live in 48 hours — no contracts, 100% satisfaction guaranteed.`;
  const pageUrl = `${BASE_URL}/claim/${id}`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      siteName: "BlueJays",
      title,
      description,
      url: pageUrl,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `BlueJays — ${businessName} Website Preview` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default function ClaimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
