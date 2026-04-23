import type { Metadata } from "next";
import type { GeneratedSiteData } from "@/lib/generator";
import PreviewClientPage from "@/components/preview/PreviewClientPage";
import { getProspect, getScrapedData } from "@/lib/store";
import { redirect } from "next/navigation";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const TERMINAL_STATUSES = new Set(["paid", "claimed", "pro-bono"]);
const ACTIVE_STATUSES = new Set([
  "scouted", "scraped", "generated", "pending-review", "ready_to_review",
  "qc_failed", "approved", "ready_to_send", "changes_pending",
  "ready_to_finalize", "deployed",
]);

export const dynamic = "force-dynamic";

const BASE_URL = "https://bluejayportfolio.com";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  let businessName = "Your Business Preview";
  let category = "";
  let city = "";

  try {
    const [siteData, prospect] = await Promise.all([
      getScrapedData(id) as Promise<GeneratedSiteData | null>,
      getProspect(id),
    ]);

    if (siteData) {
      businessName = siteData.businessName || businessName;
      category = siteData.category || "";
      city = siteData.city || "";
    } else if (prospect) {
      businessName = prospect.businessName || businessName;
      category = prospect.category || "";
      city = prospect.city || "";
    }
  } catch (error) {
    console.error("[preview] Failed to generate preview metadata", { id, error });
  }

  const categoryLabel = category
    ? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";
  const locationSuffix = city ? ` in ${city}` : "";
  const title = `${businessName} — Custom Website Preview | BlueJays`;
  const description = categoryLabel
    ? `See the custom ${categoryLabel} website we built for ${businessName}${locationSuffix}. Claim it today — no contracts, 100% satisfaction guaranteed.`
    : `See the custom website we built for ${businessName}${locationSuffix}. Claim it today — no contracts, 100% satisfaction guaranteed.`;
  const pageUrl = `${BASE_URL}/preview/${id}`;

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
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${businessName} — Website Preview by BlueJays` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ version?: string; theme?: string }>;
}) {
  const { id } = await params;
  const { version, theme } = await searchParams;
  const initialTheme = theme === "light" || theme === "dark" ? theme : undefined;

  // Check 30-day preview expiry — only for prospects in the outreach funnel
  try {
    const prospect = await getProspect(id);
    if (prospect && !TERMINAL_STATUSES.has(prospect.status) && !ACTIVE_STATUSES.has(prospect.status)) {
      const anchor = prospect.contactedAt || (
        // Fallback: if status is post-contact but contactedAt wasn't recorded, use updatedAt
        prospect.status !== "contacted" ? null : prospect.updatedAt
      );
      if (anchor && Date.now() - new Date(anchor).getTime() > THIRTY_DAYS_MS) {
        redirect(`/expired/${id}`);
      }
    }
  } catch {
    // Don't block preview rendering on expiry check errors
  }

  return (
    <PreviewClientPage
      id={id}
      version={version === "v1" ? "v1" : "v2"}
      initialTheme={initialTheme}
    />
  );
}
