import { NextRequest, NextResponse } from "next/server";

import { applyAsArcReviewer, type ArcPlatform } from "@/lib/arc-reviewers";

/**
 * POST /api/clients/[slug]/arc/apply
 *
 * Public — no auth (anonymous readers fill the application form on the
 * author's bespoke showcase). Writes one row in arc_reviewers with
 * status='applied'. Author then reviews + flips to 'approved' inside
 * the admin dashboard.
 *
 * Body: { name, email, platforms[], reach_estimate?, amazon_reviewer_rank?,
 *         motivation?, book_title? }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

const VALID_PLATFORMS: ArcPlatform[] = [
  "amazon",
  "goodreads",
  "bookbub",
  "barnes_noble",
  "instagram",
  "tiktok",
  "blog",
  "other",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400, headers: CORS },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const book_title =
    typeof body.book_title === "string" ? body.book_title.trim() : null;
  const motivation =
    typeof body.motivation === "string" ? body.motivation : null;

  if (!name) {
    return NextResponse.json(
      { ok: false, error: "Name is required" },
      { status: 400, headers: CORS },
    );
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Valid email required" },
      { status: 400, headers: CORS },
    );
  }

  const platformsRaw = Array.isArray(body.platforms) ? body.platforms : [];
  const platforms = platformsRaw
    .filter((p): p is ArcPlatform =>
      typeof p === "string" && VALID_PLATFORMS.includes(p as ArcPlatform),
    );
  if (platforms.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Pick at least one platform where you'll post the review" },
      { status: 400, headers: CORS },
    );
  }

  const reach =
    typeof body.reach_estimate === "number"
      ? Math.max(0, Math.round(body.reach_estimate))
      : null;
  const amazonRank =
    typeof body.amazon_reviewer_rank === "number"
      ? Math.max(1, Math.round(body.amazon_reviewer_rank))
      : null;

  const result = await applyAsArcReviewer({
    client_slug: slug,
    book_title,
    name,
    email,
    platforms,
    reach_estimate: reach,
    amazon_reviewer_rank: amazonRank,
    motivation,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400, headers: CORS },
    );
  }
  return NextResponse.json(
    { ok: true, id: result.id },
    { status: 200, headers: CORS },
  );
}
