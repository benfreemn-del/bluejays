import { NextRequest, NextResponse } from "next/server";
import { logCost, COST_RATES } from "@/lib/cost-logger";

/**
 * Image Proxy — serves external images through our server.
 *
 * Fixes two critical issues:
 * 1. Google Places photo URLs need API key — proxy adds it server-side
 * 2. Wix/Squarespace CDN URLs expire — proxy fetches fresh each time
 *
 * Usage: /api/image-proxy?url=ENCODED_URL
 *
 * This endpoint is PUBLIC (no auth) so preview sites can load images.
 */

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function logImageProxyFailure(params: {
  prospectId?: string;
  url: string;
  detail: string;
  upstreamStatus?: number;
}): Promise<void> {
  console.error("[image-proxy] Upstream image fetch failed", {
    url: params.url,
    upstreamStatus: params.upstreamStatus,
    detail: params.detail,
    prospectId: params.prospectId,
  });

  if (!params.prospectId) {
    return;
  }

  await logCost({
    prospectId: params.prospectId,
    service: "image_proxy",
    action: "fetch",
    costUsd: 0,
    status: "failed",
    metadata: {
      failedUrl: params.url.substring(0, 500),
      upstreamStatus: params.upstreamStatus ?? null,
      error: params.detail.substring(0, 500),
    },
  });
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const prospectId = request.nextUrl.searchParams.get("prospectId") || undefined;

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let fetchUrl = "";

  try {
    fetchUrl = decodeURIComponent(url).trim();
    const isGooglePhoto = fetchUrl.includes("maps.googleapis.com");

    // If it's a Google Places photo URL, ensure API key is appended
    if (isGooglePhoto && GOOGLE_API_KEY && !fetchUrl.includes("key=")) {
      fetchUrl += (fetchUrl.includes("?") ? "&" : "?") + `key=${GOOGLE_API_KEY}`;
    }

    const response = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });

    if (!response.ok) {
      const detail = `Upstream responded with ${response.status} ${response.statusText}`;
      await logImageProxyFailure({
        prospectId,
        url: fetchUrl,
        detail,
        upstreamStatus: response.status,
      });

      return NextResponse.json(
        {
          error: "Failed to fetch upstream image",
          detail,
          url: fetchUrl,
        },
        { status: 502 },
      );
    }

    // Log cost for Google Places photo fetches
    if (isGooglePhoto) {
      await logCost({
        prospectId,
        service: "google_places_photo",
        action: "generate",
        costUsd: COST_RATES.google_places_photo,
        metadata: { url: fetchUrl.substring(0, 200) },
      });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    await logImageProxyFailure({
      prospectId,
      url: fetchUrl || url,
      detail,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch upstream image",
        detail,
        url: fetchUrl || url,
      },
      { status: 502 },
    );
  }
}
