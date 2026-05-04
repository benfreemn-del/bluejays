import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { updatePortalTask, type PortalTaskStatus } from "@/lib/client-tasks-portal";
import { sendOwnerEmail, sendOwnerAlert } from "@/lib/alerts";

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
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid task id" }, { status: 400 });
  }
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  let body: { status?: string; notes?: string; owner?: string } = {};
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
  // Only "ben" reassignment is allowed — owner can hand a task back
  // to Ben if they can't do it. They cannot reassign to claude / external.
  if (body.owner === "ben") patch.owner = "ben";

  try {
    const task = await updatePortalTask({
      taskId: id,
      clientSlug: owner.client_slug,
      ownerId: owner.id,
      patch,
    });

    // Notify Ben if the owner did anything that needs his attention:
    //   - Sent the task back to him (owner='ben')
    //   - Marked it blocked
    //   - Posted a notes reply (typical: pasting a Pixel/Clarity ID)
    const wantsBenAttn =
      patch.owner === "ben" ||
      patch.status === "blocked" ||
      typeof patch.notes === "string";
    if (wantsBenAttn) {
      const ownerName = owner.name || owner.email;
      const subjBits: string[] = [];
      if (patch.owner === "ben") subjBits.push("↩ Sent back");
      else if (patch.status === "blocked") subjBits.push("🚫 Blocked");
      else if (typeof patch.notes === "string") subjBits.push("📝 Reply");
      const subject = `${subjBits[0]}: ${task.title} · ${owner.client_slug}`;
      const body = [
        `${ownerName} (${owner.email}) updated a portal task.`,
        "",
        `Client:  ${owner.client_slug}`,
        `Task:    ${task.title}`,
        `Status:  ${task.status}`,
        `Owner:   ${task.owner}`,
        ...(typeof patch.notes === "string"
          ? ["", "Reply / paste:", task.notes ?? "(empty)"]
          : []),
        "",
        `Open admin dashboard: https://bluejayportfolio.com/dashboard/clients/${owner.client_slug}`,
      ].join("\n");

      // Fire-and-forget — never block the API response on email send.
      sendOwnerEmail({ subject, body }).catch((err) =>
        console.error("[tasks PATCH] Ben email failed:", err),
      );
      // SMS too if it's a "send back" — that's the most urgent flavor.
      if (patch.owner === "ben") {
        sendOwnerAlert(
          `↩ ${ownerName} sent back: "${task.title}" — ${owner.client_slug}`,
        ).catch((err) =>
          console.error("[tasks PATCH] Ben SMS failed:", err),
        );
      }
    }

    return NextResponse.json({ ok: true, task });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    const status = msg.includes("not found") || msg.includes("not editable") ? 404 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
