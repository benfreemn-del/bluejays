import type { Metadata } from "next";
import type { GeneratedSiteData } from "@/lib/generator";
import PreviewClientPage from "@/components/preview/PreviewClientPage";
import RetargetingPixels from "@/components/RetargetingPixels";
import { getProspect, getScrapedData } from "@/lib/store";

export const dynamic = "force-dynamic";

const BASE_URL = "https://bluejayportfolio.com";
const FALLBACK_OG_IMAGE = `${BASE_URL}/og-image.png`;

// Generate a per-prospect OpenGraph image via thum.io, so every shared
// preview link renders with a live screenshot of THEIR site instead of
// the generic BlueJays logo. Apple Mail, Gmail-web, iMessage, Messenger,
// WhatsApp, Slack, Discord, Twitter, and LinkedIn all consume og:image
// for link previews — this turns a cold text URL into a visual pitch.
//
// thum.io caches captures for ~24h after first hit. The `?embed=1` param
// on the preview URL hides the floating Claim CTA + disclaimer banner
// per CLAUDE.md so the screenshot looks like a finished site.
//
// The `noanimate` flag + 5s wait ensures framer-motion fade-ins finish
// before capture, and the `fullpage` flag captures below the fold so
// the OG crop has real site content visible, not just a blank hero.
function getPreviewScreenshotUrl(prospectId: string): string {
  const targetUrl = `${BASE_URL}/preview/${prospectId}?embed=1`;
  return `https://image.thum.io/get/width/1200/crop/630/fullpage/noanimate/wait/5/png/${targetUrl}`;
}

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

  // Per-prospect OG screenshot (thum.io-generated). When the pitch email
  // link lands in a client that renders OG previews (Apple Mail, Gmail-web
  // on desktop, iMessage, Slack, etc.), the recipient sees an actual
  // screenshot of THEIR site above the URL — much higher click rate than
  // a bare "bluejayportfolio.com" link.
  const previewScreenshot = getPreviewScreenshotUrl(id);

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
      images: [
        { url: previewScreenshot, width: 1200, height: 630, alt: `${businessName} — Website Preview by BlueJays` },
        // Fallback if thum.io is down — cached social scrapers will still render something
        { url: FALLBACK_OG_IMAGE, width: 1200, height: 630, alt: `BlueJays — Premium Web Design` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewScreenshot],
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

  return (
    <>
      {/* Retargeting pixels — fires PageView on Meta Pixel + Google Ads.
          Self-gates on NEXT_PUBLIC_META_PIXEL_ID / NEXT_PUBLIC_GOOGLE_ADS_ID
          (no pixels set = no-op) and on ?embed=1 (screenshot captures and
          iframes don't count as real visitor impressions). */}
      <RetargetingPixels />
      <PreviewClientPage
        id={id}
        version={version === "v1" ? "v1" : "v2"}
        initialTheme={initialTheme}
      />
    </>
  );
}
