import { NextRequest, NextResponse } from "next/server";
import {
  deleteClientTeamMember,
  updateClientTeamMember,
} from "@/lib/client-team-members";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED = [
  "name",
  "email",
  "is_bluejays_team",
  "is_primary",
  "sort_order",
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
    if (k in body) patch[k] = body[k];
  }
  try {
    const updated = await updateClientTeamMember(id, patch);
    return NextResponse.json({ ok: true, member: updated });
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
    await deleteClientTeamMember(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
