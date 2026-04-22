import { getProspect } from "@/lib/store";
import { notFound } from "next/navigation";
import ReviewClient from "./ReviewClient";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) notFound();

  const businessName = prospect.businessName;
  const accentColor = prospect.scrapedData?.accentColor || "#3b82f6";

  // Build Google review URL — prefer Place ID if scraped, otherwise a search link
  const placeId = prospect.scrapedData?.googlePlaceId as string | undefined;
  const googleReviewUrl = placeId
    ? `https://search.google.com/local/writereview?placeid=${placeId}`
    : `https://www.google.com/search?q=${encodeURIComponent(
        `${businessName} ${prospect.city} ${prospect.state} reviews`
      )}`;

  return (
    <ReviewClient
      prospectId={id}
      businessName={businessName}
      ownerName={prospect.ownerName}
      category={prospect.category}
      accentColor={accentColor}
      googleReviewUrl={googleReviewUrl}
    />
  );
}
