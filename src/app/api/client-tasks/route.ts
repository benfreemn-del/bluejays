import { NextRequest, NextResponse } from "next/server";
import {
  createClientTask,
  createClientTasks,
  listAllTasks,
  listClientTasks,
  listClientsWithTasks,
  type NewClientTask,
} from "@/lib/client-tasks";

/**
 * /api/client-tasks
 *
 * GET ?client=zenith-sports[&includeCompleted=1]
 *   List tasks for one client. Default hides done/wont-do.
 *
 * GET (no client param)
 *   Return [{ client_slug, open_count }] across all clients —
 *   used by /dashboard/clients to render the index.
 *
 * POST
 *   Body: { client_slug, title, ...optional fields } OR
 *         { tasks: [...] } for bulk insert (used by Claude when seeding).
 *
 * Auth: middleware on /api/* gates this behind the dashboard cookie.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  const all = searchParams.get("all") === "1";
  const includeCompleted = searchParams.get("includeCompleted") === "1";

  try {
    // /api/client-tasks?all=1 — every task across every client. Used
    // by the master /dashboard/all-tasks page so Ben sees his whole
    // pipeline in one shot without hopping between clients.
    if (all) {
      const tasks = await listAllTasks({ includeCompleted });
      return NextResponse.json({ ok: true, tasks });
    }
    if (!client) {
      const summary = await listClientsWithTasks();
      return NextResponse.json({ ok: true, clients: summary });
    }
    const tasks = await listClientTasks(client, { includeCompleted });
    return NextResponse.json({ ok: true, tasks });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Bulk insert path
  if (
    body &&
    typeof body === "object" &&
    Array.isArray((body as { tasks?: unknown }).tasks)
  ) {
    const tasks = (body as { tasks: NewClientTask[] }).tasks;
    if (tasks.some((t) => !t.client_slug || !t.title)) {
      return NextResponse.json(
        { ok: false, error: "Every task needs client_slug + title." },
        { status: 400 },
      );
    }
    try {
      const inserted = await createClientTasks(tasks);
      return NextResponse.json({ ok: true, inserted });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "unknown" },
        { status: 500 },
      );
    }
  }

  // Single insert path
  const t = body as NewClientTask | null;
  if (!t || !t.client_slug || !t.title) {
    return NextResponse.json(
      { ok: false, error: "client_slug + title required" },
      { status: 400 },
    );
  }
  try {
    const created = await createClientTask(t);
    return NextResponse.json({ ok: true, task: created });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
