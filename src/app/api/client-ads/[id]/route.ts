import { NextRequest, NextResponse } from "next/server";
import {
  updateAdCreativeStatus,
  type AdStatus,
} from "@/lib/client-ads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: { status?: AdStatus };
  try {
    body = (await req.json()) as { status?: AdStatus };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.status) {
    return NextResponse.json(
      { ok: false, error: "status required" },
      { status: 400 },
    );
  }
  try {
    await updateAdCreativeStatus(id, body.status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
