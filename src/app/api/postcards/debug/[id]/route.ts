import { NextRequest, NextResponse } from "next/server";
import { sanitizeImageUrls, validateImageUrl } from "@/lib/image-validator";
import { getHeroImage } from "@/lib/preview-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/postcards/debug/[id]
 *
 * Debug endpoint that uses Browserless to render the prospect's preview
 * page, then extracts every <img src> from the rendered DOM so we can
 * see exactly which Unsplash photos the template picked after hydration.
 *
 * Used for QC-ing stock image pool changes without hand-decoding the
 * postcard JPEG and guessing at rendered content.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const browserlessKey = process.env.BROWSERLESS_API_KEY;
  if (!browserlessKey) {
    return NextResponse.json({ error: "BROWSERLESS_API_KEY missing" }, { status: 500 });
  }

  const target = `https://bluejayportfolio.com/preview/${id}?embed=1`;
  const url = `https://production-sfo.browserless.io/content?token=${encodeURIComponent(browserlessKey)}&stealth=true`;

  const waitFn = `async () => {
    const hasLoadingText = Array.from(document.querySelectorAll('*'))
      .some(el => el.textContent && el.textContent.includes('Loading your website preview'));
    if (hasLoadingText) return false;
    const heroImg = document.querySelector('section img, [class*="hero"] img');
    if (!heroImg) return document.body.textContent.length > 200;
    return heroImg.complete && heroImg.naturalWidth > 0;
  }`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: target,
        gotoOptions: { waitUntil: "networkidle2", timeout: 30000 },
        waitForFunction: { fn: waitFn, timeout: 20000 },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Browserless ${res.status}: ${body.slice(0, 300)}` },
        { status: 502 }
      );
    }
    const html = await res.text();
    // Extract all img src values. Keep ordering — gives us hero, hero-card, about, gallery in the order they appear.
    const imgs = Array.from(html.matchAll(/<img[^>]+src="([^"]+)"/g)).map((m) => m[1]);
    // Dedup preserving first-seen order.
    const seen = new Set<string>();
    const uniqueImgs: string[] = [];
    for (const src of imgs) {
      if (!seen.has(src)) {
        seen.add(src);
        uniqueImgs.push(src);
      }
    }
    // Only Unsplash-derived or hero-worthy images (skip tiny SVGs and icons by filtering on photo-*).
    const unsplashPhotos = uniqueImgs.filter((src) => src.includes("images.unsplash.com/photo-"));
    // Also filter out obvious logos/icons (base64 data URIs for SVG icons,
    // small .png/.svg paths under /images, etc.) so the caller sees only
    // real content photos.
    const nonIcon = uniqueImgs.filter((src) => {
      if (src.startsWith("data:")) return false;
      if (src.endsWith(".svg")) return false;
      if (src.includes("/icons/")) return false;
      return true;
    });
    // Fetch generated-site data via the public API so we can diagnose
    // getValidatedPreviewPhotos logic without depending on an internal
    // store export (there's no public getGeneratedSite in @/lib/store).
    let serverSideDiagnostic: Record<string, unknown> | null = null;
    try {
      const siteRes = await fetch(
        `https://bluejayportfolio.com/api/generated-sites/${id}`,
        { cache: "no-store" }
      );
      if (siteRes.ok) {
        const siteData = (await siteRes.json()) as {
          photos?: string[];
          category?: string;
          heroImage?: string;
        };
        const rawPhotos = siteData?.photos ?? [];
        const sanitized = sanitizeImageUrls(rawPhotos);
        const category = (siteData?.category ?? "general-contractor") as Parameters<typeof validateImageUrl>[1];
        const heroCand = getHeroImage({
          ...(siteData as object),
          photos: sanitized,
        } as Parameters<typeof getHeroImage>[0]);
        const galleryValidatedCount = sanitized.filter((p) => {
          const r = validateImageUrl(p, category, "gallery");
          return !r.shouldUseFallback;
        }).length;
        const heroValidated = heroCand
          ? !validateImageUrl(heroCand, category, "hero").shouldUseFallback
          : false;
        const heroGalleryValidated = heroCand
          ? !validateImageUrl(heroCand, category, "gallery").shouldUseFallback
          : false;
        serverSideDiagnostic = {
          rawPhotosCount: rawPhotos.length,
          sanitizedCount: sanitized.length,
          galleryValidatedCount,
          heroCandidate: heroCand,
          heroCandidatePassesHeroVariant: heroValidated,
          heroCandidatePassesGalleryVariant: heroGalleryValidated,
        };
      }
    } catch {
      serverSideDiagnostic = { error: "Failed to fetch generated-site data" };
    }

    return NextResponse.json({
      prospectId: id,
      target,
      totalImgCount: imgs.length,
      uniqueImgCount: uniqueImgs.length,
      unsplashPhotoUrls: unsplashPhotos,
      allNonIconImgSrcs: nonIcon,
      serverSideDiagnostic,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
