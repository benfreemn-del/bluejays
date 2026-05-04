import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { bulkUpdatePortalTasks, type PortalTaskStatus } from "@/lib/client-tasks-portal";
import { sendOwnerEmail, sendOwnerAlert } from "@/lib/alerts";

/**
 * POST /api/client-portal/tasks/bulk
 *   body: {
 *     ids: string[],
 *     patch: { status?: 'pending'|'in_progress'|'blocked'|'done', owner?: 'ben' }
 *   }
 *
 * Applies a status (or "send back to Ben") change to many client-owned
 * tasks in one call. Server-side filtering enforces client_slug +
 * owner='client' so an owner can never accidentally PATCH another
 * client's tasks or one of Ben/Claude's internal tasks.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_STATUSES: PortalTaskStatus[] = ["pending", "in_progress", "blocked", "done"];

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  let body: { ids?: unknown; patch?: Record<string, unknown> } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const ids = Array.isArray(body.ids)
    ? (body.ids as unknown[]).filter((v): v is string => typeof v === "string" && UUID_RE.test(v))
    : [];
  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: "ids required" }, { status: 400 });
  }
  if (ids.length > 200) {
    return NextResponse.json({ ok: false, error: "Too many tasks at once (max 200)" }, { status: 400 });
  }
  const patch: Parameters<typeof bulkUpdatePortalTasks>[0]["patch"] = {};
  const rawStatus = body.patch?.status;
  if (typeof rawStatus === "string") {
    if (!VALID_STATUSES.includes(rawStatus as PortalTaskStatus)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    patch.status = rawStatus as PortalTaskStatus;
  }
  if (body.patch?.owner === "ben") patch.owner = "ben";
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "patch is empty" }, { status: 400 });
  }
  try {
    const updated = await bulkUpdatePortalTasks({
      taskIds: ids,
      clientSlug: owner.client_slug,
      ownerId: owner.id,
      patch,
    });

    // Notify Ben on bulk send-back or bulk-blocked. Mark-done bulks
    // are intentionally silent — those don't need Ben's attention.
    if (patch.owner === "ben" || patch.status === "blocked") {
      const ownerName = owner.name || owner.email;
      const verb = patch.owner === "ben" ? "sent back" : "marked blocked";
      const subject = `↩ ${updated} task${updated === 1 ? "" : "s"} ${verb} · ${owner.client_slug}`;
      const body = [
        `${ownerName} (${owner.email}) bulk-${verb} ${updated} task${updated === 1 ? "" : "s"}.`,
        "",
        `Client: ${owner.client_slug}`,
        "",
        `Open admin dashboard: https://bluejayportfolio.com/dashboard/clients/${owner.client_slug}`,
      ].join("\n");
      sendOwnerEmail({ subject, body }).catch((err) =>
        console.error("[tasks bulk] Ben email failed:", err),
      );
      sendOwnerAlert(
        `↩ ${ownerName} ${verb} ${updated} task${updated === 1 ? "" : "s"} (${owner.client_slug})`,
      ).catch((err) =>
        console.error("[tasks bulk] Ben SMS failed:", err),
      );
    }

    return NextResponse.json({ ok: true, updated });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
