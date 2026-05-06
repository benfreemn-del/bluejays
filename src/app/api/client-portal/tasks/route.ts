import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { listPortalTasks } from "@/lib/client-tasks-portal";
import { createClientTask } from "@/lib/client-tasks";
import { isBluejaysAssignee } from "@/lib/client-team-members";
import { sendOwnerEmail, sendEmailTo } from "@/lib/alerts";

/**
 * GET /api/client-portal/tasks
 * Returns the client's open + recently-done client-action tasks. Both
 * co-founders see the same shared list (tasks are keyed to client_slug,
 * not owner — they're partners running one business).
 *
 * POST /api/client-portal/tasks
 * Lets a signed-in client owner add a NEW task to their portal to-do
 * list with an assignee (themselves, a teammate, or Ben). When the
 * task is assigned to a BlueJays team member (per
 * client_team_members.is_bluejays_team), an email notification fires
 * so we know the client has dropped work on us.
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

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  if (!title) {
    return NextResponse.json(
      { ok: false, error: "Title required" },
      { status: 400 },
    );
  }
  const priority = String(body.priority || "medium").trim() as
    | "urgent"
    | "high"
    | "medium"
    | "low";
  const assignedToName = (body.assigned_to_name as string)?.trim() || null;
  const assignedToEmail =
    (body.assigned_to_email as string)?.trim().toLowerCase() || null;

  // owner field controls whether this task lands on the client portal
  // surface or the admin Ben-tasks surface. If assigned to a BlueJays
  // person → owner='ben' (it's our work now); else → owner='client'.
  const assigneeIsBJ =
    assignedToEmail !== null &&
    (await isBluejaysAssignee(owner.client_slug, assignedToEmail));
  const taskOwner: "ben" | "client" = assigneeIsBJ ? "ben" : "client";

  try {
    const created = await createClientTask({
      client_slug: owner.client_slug,
      title,
      description: (body.description as string) || null,
      priority: ["urgent", "high", "medium", "low"].includes(priority)
        ? priority
        : "medium",
      category: "client-action",
      owner: taskOwner,
      assigned_to_name: assignedToName,
      assigned_to_email: assignedToEmail,
    } as Parameters<typeof createClientTask>[0]);

    // Notify Ben whenever a new task lands on our side. Always fan out
    // the owner-alert email + the specific assignee email if they
    // differ (e.g. Philip assigns it to Ben directly with email).
    if (assigneeIsBJ) {
      const subject = `📋 New ${owner.client_slug} task → ${assignedToName ?? "BlueJays"}`;
      const lines = [
        `Client: ${owner.client_slug}`,
        `Added by: ${owner.email}`,
        `Assigned to: ${assignedToName ?? assignedToEmail ?? "BlueJays"}`,
        `Priority: ${priority}`,
        "",
        `Title: ${title}`,
        body.description ? `\n${body.description}` : "",
        "",
        `Open: https://bluejayportfolio.com/dashboard/clients/${owner.client_slug}`,
      ];
      const emailBody = lines.filter(Boolean).join("\n");
      try {
        await sendOwnerEmail({
          subject,
          body: emailBody,
          clientSlug: owner.client_slug,
        });
        if (assignedToEmail) {
          await sendEmailTo({
            to: assignedToEmail,
            subject,
            body: emailBody,
            fromName: `${owner.client_slug} portal`,
            clientSlug: owner.client_slug,
          });
        }
      } catch (err) {
        console.error("[portal-tasks] notify failed:", err);
      }
    }

    return NextResponse.json({ ok: true, task: created });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
