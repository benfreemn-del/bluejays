import { NextRequest, NextResponse } from "next/server";
import { logCost } from "@/lib/cost-logger";

/**
 * GET /api/clients/olympic-inspections/google-reviews
 *
 * Fetches OIT's live Google Reviews via the Places Details API. Used by
 * the public OIT site (public/sites/olympic-inspections/index.html) to
 * render a real-time review carousel that replaces the static placeholder
 * testimonial cards.
 *
 * Response shape:
 *   {
 *     ok: true,
 *     rating: 4.9,
 *     reviewCount: 27,
 *     reviews: [{ author, rating, text, relativeTime, profilePhoto, publishedAt }, …]
 *   }
 *
 * Source: Google Places Details API. Hard limit of 5 reviews per call
 * (Google returns the "most relevant" 5 — sorted internally). For all
 * reviews, we'd need Google My Business API + OAuth (deferred Phase 2).
 *
 * Cache: Next.js revalidate=3600 (1 hour). Google Reviews don't change
 * minute-to-minute; hourly refresh keeps cost negligible (~24 calls/day
 * = ~$0.40/month at $0.017/call).
 *
 * Empty state: when OIT_GOOGLE_PLACE_ID env var isn't set, OR Google
 * returns zero reviews, returns ok=true with empty reviews array + a
 * soft message. The frontend hides the section gracefully.
 *
 * Public — no auth (this powers the live public site).
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

export async function GET(_req: NextRequest) {
  const placeId = process.env.OIT_GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // Soft empty state — let the frontend hide the section gracefully
  // when the env vars aren't set yet. No 500 on missing config.
  if (!placeId || !apiKey) {
    return NextResponse.json(
      {
        ok: true,
        configured: false,
        rating: null,
        reviewCount: 0,
        reviews: [],
        message: !placeId
          ? "OIT_GOOGLE_PLACE_ID env var not set — reviews carousel hidden until Luke's Place ID is configured"
          : "GOOGLE_PLACES_API_KEY env var not set",
      },
      { headers: { "Cache-Control": "public, s-maxage=3600" } },
    );
  }

  // The fields parameter limits to ONLY what we need — keeps cost low.
  // Google Places Details billing is field-tier-based; reviews + rating
  // + user_ratings_total are all in the "Atmosphere" tier (~$0.017/call).
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=rating,user_ratings_total,reviews` +
    `&reviews_sort=newest` +
    `&key=${apiKey}`;

  try {
    const res = await fetch(url, {
      // Next.js revalidate caches the upstream response for 1 hour;
      // the 24/day call rate is well inside Google's free tier.
      next: { revalidate: 3600 },
    });
    const data = (await res.json()) as PlacesDetailsResponse;

    // Best-effort cost log — non-blocking. Place Details with
    // Atmosphere fields ≈ $0.017/call.
    await logCost({
      clientSlug: "olympic-inspections",
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
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    console.error("[oit/google-reviews] fetch failed:", err);
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
