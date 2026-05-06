import { NextRequest, NextResponse } from "next/server";
import {
  createTestimonial,
  listActiveTestimonials,
  listAllTestimonials,
  type NewClientTestimonial,
} from "@/lib/client-testimonials";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET  /api/client-testimonials?client=zenith-sports[&all=1]
 *   Public: returns ACTIVE testimonials only. ?all=1 returns every row
 *   (used by the admin dashboard).
 *
 * POST /api/client-testimonials
 *   Body: { client_slug, name, quote, location?, role?, photo_url?,
 *           video_url?, sort_order?, is_active? }
 */

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slug = (url.searchParams.get("client") || "").trim();
  const all = url.searchParams.get("all") === "1";
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "Missing ?client=<slug>" },
      { status: 400 },
    );
  }
  try {
    const testimonials = all
      ? await listAllTestimonials(slug)
      : await listActiveTestimonials(slug);
    return NextResponse.json({ ok: true, testimonials });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const slug = String(body.client_slug || "").trim();
  const name = String(body.name || "").trim();
  const quote = String(body.quote || "").trim();
  if (!slug || !name || !quote) {
    return NextResponse.json(
      { ok: false, error: "client_slug, name, and quote are required" },
      { status: 400 },
    );
  }
  const payload: NewClientTestimonial = {
    client_slug: slug,
    name,
    quote,
    location: (body.location as string) || null,
    role: (body.role as string) || null,
    photo_url: (body.photo_url as string) || null,
    video_url: (body.video_url as string) || null,
    sort_order:
      typeof body.sort_order === "number" ? body.sort_order : undefined,
    is_active: typeof body.is_active === "boolean" ? body.is_active : undefined,
  };
  try {
    const created = await createTestimonial(payload);
    return NextResponse.json({ ok: true, testimonial: created });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
