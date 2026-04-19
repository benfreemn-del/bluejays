import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { GeneratedSiteData } from "@/lib/generator";
import PreviewClientPage from "@/components/preview/PreviewClientPage";
import { getProspect, getScrapedData } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Short-URL preview route — /p/[code]
 *
 * Resolves an 8-char short code to a prospect UUID and renders the
 * preview page. URL stays clean (no redirect to /preview/[id]) so
 * the browser address bar shows `/p/a1b2c3d4` not the full UUID.
 *
 * Backed by prospects.short_code (see migration 20260419_prospect_short_codes.sql).
 * Generated via src/lib/short-urls.ts.
 *
 * Public route — same data-exposure rules as /preview/[id]. Do not add
 * any field to the rendered site that wouldn't already be visible to a
 * prospect visiting /preview/[id].
 */

export const dynamic = "force-dynamic";

const BASE_URL = "https://bluejayportfolio.com";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * Look up the prospect UUID from an 8-char short code.
 * Returns null if not found.
 */
async function resolveCodeToProspectId(code: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  if (!/^[a-f0-9]{8}$/i.test(code)) return null;

  const { data } = await supabase
    .from("prospects")
    .select("id")
    .eq("short_code", code.toLowerCase())
    .limit(1)
    .single();

  return (data?.id as string) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;

  let businessName = "Your Business Preview";
  let category = "";
  let city = "";

  try {
    const id = await resolveCodeToProspectId(code);
    if (!id) return { title: "Preview" };

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
  } catch {
    // Leave defaults
  }

  const categoryLabel = category
    ? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";
  const locationSuffix = city ? ` in ${city}` : "";
  const title = `${businessName} — Custom Website Preview | BlueJays`;
  const description = categoryLabel
    ? `See the custom ${categoryLabel} website we built for ${businessName}${locationSuffix}. Claim it today — no contracts, 100% satisfaction guaranteed.`
    : `See the custom website we built for ${businessName}${locationSuffix}. Claim it today — no contracts, 100% satisfaction guaranteed.`;
  const pageUrl = `${BASE_URL}/p/${code}`;

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
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "BlueJays" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  };
}

export default async function ShortPreviewPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const id = await resolveCodeToProspectId(code);
  if (!id) notFound();

  return <PreviewClientPage id={id} />;
}
