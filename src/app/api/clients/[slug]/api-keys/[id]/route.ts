import { NextRequest, NextResponse } from "next/server";
import { revokeApiKey } from "@/lib/client-api-keys";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }
  const ok = await revokeApiKey(id);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Could not revoke key" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
