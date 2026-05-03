import { NextRequest, NextResponse } from "next/server";
import {
  deleteClientTask,
  updateClientTask,
  type ClientTaskUpdate,
} from "@/lib/client-tasks";

/**
 * /api/client-tasks/[id]
 *
 * PATCH — partial update (status, notes, priority, etc.)
 * DELETE — hard delete (use sparingly; prefer setting status to 'wont-do')
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: ClientTaskUpdate;
  try {
    body = (await req.json()) as ClientTaskUpdate;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const updated = await updateClientTask(id, body);
    return NextResponse.json({ ok: true, task: updated });
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
    await deleteClientTask(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
