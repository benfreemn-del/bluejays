import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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
const FALLBACK_OG_IMAGE = `${BASE_URL}/og-image.png`;

// Same per-prospect OpenGraph screenshot logic as /preview/[id]. The
// short URL is what goes in every email/SMS/DM, so this is the primary
// surface that gets scraped by Gmail/Apple Mail/iMessage when the link
// is shared. Renders the prospect's own preview via thum.io.
function getPreviewScreenshotUrl(prospectId: string): string {
  const targetUrl = `${BASE_URL}/preview/${prospectId}?embed=1`;
  return `https://image.thum.io/get/width/1200/crop/630/fullpage/noanimate/wait/5/png/${targetUrl}`;
}

/**
 * Look up prospect by short code. Returns id + custom_site_url + pricing_tier
 * so the page component can decide whether to redirect (custom-tier sites)
 * or render the template preview.
 */
async function resolveShortCode(code: string): Promise<{
  id: string;
  customSiteUrl: string | null;
  pricingTier: string | null;
} | null> {
  if (!isSupabaseConfigured()) return null;
  if (!/^[a-f0-9]{8}$/i.test(code)) return null;

  const { data } = await supabase
    .from("prospects")
    .select("id, custom_site_url, pricing_tier")
    .eq("short_code", code.toLowerCase())
    .limit(1)
    .single();

  if (!data) return null;
  return {
    id: data.id as string,
    customSiteUrl: (data.custom_site_url as string | null) || null,
    pricingTier: (data.pricing_tier as string | null) || null,
  };
}

/**
 * Legacy helper kept for the metadata lookup — returns just the UUID.
 */
async function resolveCodeToProspectId(code: string): Promise<string | null> {
  const resolved = await resolveShortCode(code);
  return resolved?.id || null;
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

  // Per-prospect OG screenshot — the short URL is what prospects actually
  // click from email/SMS, so this is the URL Gmail / Apple Mail / iMessage
  // scrape for link previews. Show them a live shot of the site.
  const resolvedId = await resolveCodeToProspectId(code);
  const previewScreenshot = resolvedId
    ? getPreviewScreenshotUrl(resolvedId)
    : FALLBACK_OG_IMAGE;

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
        { url: FALLBACK_OG_IMAGE, width: 1200, height: 630, alt: "BlueJays" },
      ],
    },
    twitter: { card: "summary_large_image", title, description, images: [previewScreenshot] },
  };
}

export default async function ShortPreviewPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const resolved = await resolveShortCode(code);
  if (!resolved) notFound();

  // Bespoke-built sites (custom-tier OR free-tier with a hand-built
  // site at /sites/[slug]/) redirect to their actual site URL instead
  // of rendering a template preview. The short URL becomes a
  // brand-friendly shortlink pointing at their real site.
  //
  // Trigger: any prospect with a non-empty custom_site_url, regardless
  // of pricing_tier. The custom_site_url field is the source of truth —
  // if it's set, the prospect has a real site and the preview template
  // would just be wrong for them. See CLAUDE.md "Custom Pricing Tier
  // Rules" + the OPS launch precedent (Olympic Protective Services on
  // free tier with site at bluejayportfolio.com/sites/ops/).
  if (resolved.customSiteUrl) {
    // Normalise: ensure absolute http(s) URL so redirect doesn't loop
    const target = resolved.customSiteUrl.startsWith("http")
      ? resolved.customSiteUrl
      : `https://${resolved.customSiteUrl}`;
    redirect(target);
  }

  return <PreviewClientPage id={resolved.id} />;
}
