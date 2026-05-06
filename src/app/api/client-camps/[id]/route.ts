import { NextRequest, NextResponse } from "next/server";
import { deleteCamp, updateCamp } from "@/lib/client-camps";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED = [
  "name",
  "org",
  "city",
  "state",
  "region",
  "lat",
  "lng",
  "start_date",
  "end_date",
  "age_range",
  "format",
  "ball_included",
  "url",
  "blurb",
  "sort_order",
  "is_active",
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
  for (const k of ALLOWED) {
    if (k in body) {
      // Normalize state to upper if present.
      if (k === "state" && typeof body[k] === "string") {
        patch[k] = (body[k] as string).toUpperCase();
      } else {
        patch[k] = body[k];
      }
    }
  }
  try {
    const updated = await updateCamp(id, patch);
    return NextResponse.json({ ok: true, camp: updated });
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
    await deleteCamp(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
