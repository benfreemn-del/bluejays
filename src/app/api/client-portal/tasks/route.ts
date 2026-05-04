import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { listPortalTasks } from "@/lib/client-tasks-portal";

/**
 * GET /api/client-portal/tasks
 * Returns the client's open + recently-done client-action tasks. Both
 * co-founders see the same shared list (tasks are keyed to client_slug,
 * not owner — they're partners running one business).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  try {
    const tasks = await listPortalTasks(owner.client_slug);
    const summary = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
    return NextResponse.json({ ok: true, tasks, summary });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
