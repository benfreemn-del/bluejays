import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { updatePortalTask, type PortalTaskStatus } from "@/lib/client-tasks-portal";

/**
 * PATCH /api/client-portal/tasks/[id]
 *   body: { status?: 'pending'|'in_progress'|'blocked'|'done', notes?: string }
 *
 * Owner-driven update. Whitelists status + notes (title/priority/etc.
 * stay locked to Ben). Stamps last_updated_by_owner_id so we know which
 * co-founder marked it done.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_STATUSES: PortalTaskStatus[] = ["pending", "in_progress", "blocked", "done"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  let body: { status?: string; notes?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const patch: Parameters<typeof updatePortalTask>[0]["patch"] = {};
  if (body.status) {
    if (!VALID_STATUSES.includes(body.status as PortalTaskStatus)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status as PortalTaskStatus;
  }
  if (typeof body.notes === "string") patch.notes = body.notes;

  try {
    const task = await updatePortalTask({
      taskId: id,
      clientSlug: owner.client_slug,
      ownerId: owner.id,
      patch,
    });
    return NextResponse.json({ ok: true, task });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    const status = msg.includes("not found") || msg.includes("not editable") ? 404 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
