import { NextRequest, NextResponse } from "next/server";
import { logCost } from "@/lib/cost-logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/clients/elite-hardscapes-and-landscapes/google-reviews
 *
 * Fetches Tyler's live Google Reviews via the Places Details API for
 * the marquee on the Elite Hardscapes showcase. Same proven pattern
 * as the OIT route — clone with the Elite-specific env var name.
 *
 * Response shape:
 *   {
 *     ok: true,
 *     rating: 4.6,
 *     reviewCount: 11,
 *     reviews: [{ author, rating, text, relativeTime, profilePhoto, publishedAt }, …]
 *   }
 *
 * Google returns the "most relevant" 5 reviews per call. For a full
 * pull, we'd need Google My Business API + OAuth (deferred).
 *
 * Cache: Next.js revalidate=3600 (1 hour). At $0.017/call that's
 * ~$0.40/month — negligible.
 *
 * Empty state: when ELITE_GOOGLE_PLACE_ID env var isn't set OR Google
 * returns zero reviews, returns ok=true with empty reviews array. The
 * page's marquee section auto-hides until reviews land.
 *
 * Public — no auth (powers the live public showcase).
 */

export const runtime = "nodejs";
export const revalidate = 3600;

type GoogleReview = {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
};

type PlacesDetailsResponse = {
  result?: {
    rating?: number;
    user_ratings_total?: number;
    reviews?: GoogleReview[];
  };
  status: string;
  error_message?: string;
};

async function resolvePlaceId(): Promise<string | null> {
  // Supabase first — lets Ben paste a Place ID into a DB row without
  // redeploying. Env var second — kept as a fallback / dev path.
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from("client_google_places")
      .select("place_id")
      .eq("client_slug", "elite-hardscapes-and-landscapes")
      .maybeSingle();
    const fromDb = (data?.place_id as string | null) ?? null;
    if (fromDb) return fromDb;
  }
  return process.env.ELITE_GOOGLE_PLACE_ID ?? null;
}

export async function GET(_req: NextRequest) {
  const placeId = await resolvePlaceId();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // Soft empty state — let the frontend hide the section gracefully
  // when config isn't in place yet. No 500 on missing config.
  if (!placeId || !apiKey) {
    return NextResponse.json(
      {
        ok: true,
        configured: false,
        rating: null,
        reviewCount: 0,
        reviews: [],
        message: !placeId
          ? "Place ID not configured — set client_google_places.place_id for 'elite-hardscapes-and-landscapes' (or ELITE_GOOGLE_PLACE_ID env var)"
          : "GOOGLE_PLACES_API_KEY env var not set",
      },
      { headers: { "Cache-Control": "public, s-maxage=3600" } },
    );
  }

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=rating,user_ratings_total,reviews` +
    `&reviews_sort=newest` +
    `&key=${apiKey}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    const data = (await res.json()) as PlacesDetailsResponse;

    await logCost({
      clientSlug: "elite-hardscapes-and-landscapes",
      service: "google_places",
      action: "place_details_reviews",
      costUsd: 0.017,
      metadata: { placeId, status: data.status },
    }).catch(() => {});

    if (data.status !== "OK") {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          error: `Google Places returned ${data.status}`,
          detail: data.error_message ?? null,
          rating: null,
          reviewCount: 0,
          reviews: [],
        },
        { status: 502 },
      );
    }

    const result = data.result ?? {};
    const reviews = (result.reviews ?? []).map((r) => ({
      author: r.author_name,
      authorUrl: r.author_url ?? null,
      profilePhoto: r.profile_photo_url ?? null,
      rating: r.rating,
      text: r.text,
      relativeTime: r.relative_time_description,
      publishedAt: new Date(r.time * 1000).toISOString(),
    }));

    return NextResponse.json(
      {
        ok: true,
        configured: true,
        rating: result.rating ?? null,
        reviewCount: result.user_ratings_total ?? 0,
        reviews,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    console.error("[elite/google-reviews] fetch failed:", err);
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: err instanceof Error ? err.message : "unknown",
        rating: null,
        reviewCount: 0,
        reviews: [],
      },
      { status: 500 },
    );
  }
}
