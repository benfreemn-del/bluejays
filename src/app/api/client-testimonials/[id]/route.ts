import { NextRequest, NextResponse } from "next/server";
import {
  deleteTestimonial,
  updateTestimonial,
} from "@/lib/client-testimonials";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** PATCH /api/client-testimonials/[id]  — partial update
 *  DELETE /api/client-testimonials/[id] — hard delete
 *
 *  The dashboard uses PATCH for edits + the is_active toggle (preferring
 *  hide-over-delete since deletes are irreversible). DELETE is wired
 *  for the rare "I posted something I shouldn't have" case.
 */

const ALLOWED_FIELDS = [
  "name",
  "location",
  "role",
  "quote",
  "photo_url",
  "video_url",
  "sort_order",
  "is_active",
  "published_at",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const patch: Record<string, unknown> = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in body) patch[k] = body[k];
  }
  try {
    const updated = await updateTestimonial(id, patch);
    return NextResponse.json({ ok: true, testimonial: updated });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await deleteTestimonial(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
