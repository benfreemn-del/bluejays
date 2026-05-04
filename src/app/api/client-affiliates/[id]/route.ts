import { NextRequest, NextResponse } from "next/server";
import { updateAffiliate } from "@/lib/client-affiliates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  // Whitelist allowed updates
  const allowed = ["status", "notes", "fit_score", "channel", "contact_name", "role"];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) patch[k] = body[k];
  }
  try {
    const affiliate = await updateAffiliate(id, patch as Parameters<typeof updateAffiliate>[1]);
    return NextResponse.json({ ok: true, affiliate });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
