import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { deleteBudgetItem, updateBudgetItem } from "@/lib/client-budget";

/**
 * PATCH  /api/client-portal/budget/[id] → update an item (owner-scoped)
 * DELETE /api/client-portal/budget/[id] → remove an item
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const item = await updateBudgetItem({
      id,
      clientSlug: owner.client_slug,
      patch: body as Parameters<typeof updateBudgetItem>[0]["patch"],
    });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: msg.includes("not found") ? 404 : 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  try {
    await deleteBudgetItem({ id, clientSlug: owner.client_slug });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: msg.includes("not found") ? 404 : 500 },
    );
  }
}
