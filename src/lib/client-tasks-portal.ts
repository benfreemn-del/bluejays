/**
 * client-tasks-portal — read/write helpers for the OWNER PORTAL view of
 * client_tasks. Strictly filters to `owner='client'` so internal Ben/
 * Claude work never leaks into the customer-facing UI.
 *
 * Distinct from src/lib/client-tasks.ts (admin dashboard surface).
 */

import { getSupabase } from "./supabase";

export type PortalTaskStatus = "pending" | "in_progress" | "blocked" | "done";

export type PortalTask = {
  id: string;
  client_slug: string;
  title: string;
  description: string | null;
  status: PortalTaskStatus;
  priority: "urgent" | "high" | "medium" | "low";
  category: string;
  blocked_on: string | null;
  due_date: string | null;
  notes: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  last_updated_by_owner_id: string | null;
};

const PRIORITY_RANK: Record<PortalTask["priority"], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const STATUS_RANK: Record<PortalTaskStatus, number> = {
  in_progress: 0,
  pending: 1,
  blocked: 2,
  done: 3,
};

/**
 * List tasks the client is responsible for. Includes done tasks at the
 * bottom (so they can see what they've already completed) but excludes
 * Ben/Claude/external tasks entirely.
 */
export async function listPortalTasks(clientSlug: string): Promise<PortalTask[]> {
  const { data, error } = await getSupabase()
    .from("client_tasks")
    .select("*")
    .eq("client_slug", clientSlug)
    .eq("owner", "client")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listPortalTasks: ${error.message}`);
  const rows = (data ?? []) as PortalTask[];
  return rows.sort((a, b) => {
    const s = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (s !== 0) return s;
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  });
}

/**
 * Owner-driven task update. Whitelisted fields:
 *   - status (pending → in_progress → blocked → done)
 *   - notes  (free-text reply field)
 *   - owner  (only "ben" allowed — lets the owner "send back" a task
 *            they can't do; it disappears from their portal and shows
 *            up as Ben's again. They cannot reassign to claude/external.)
 *
 * Stamps `last_updated_by_owner_id` so we can tell Philip from Paul.
 */
export async function updatePortalTask(args: {
  taskId: string;
  clientSlug: string;
  ownerId: string;
  patch: { status?: PortalTaskStatus; notes?: string; owner?: "ben" };
}): Promise<PortalTask> {
  const sb = getSupabase();
  const { data: existing, error: getErr } = await sb
    .from("client_tasks")
    .select("id, client_slug, owner")
    .eq("id", args.taskId)
    .maybeSingle();
  if (getErr) throw new Error(`updatePortalTask read: ${getErr.message}`);
  if (!existing || existing.client_slug !== args.clientSlug || existing.owner !== "client") {
    throw new Error("Task not found or not editable from portal.");
  }
  const patch: Record<string, unknown> = {
    last_updated_by_owner_id: args.ownerId,
  };
  if (args.patch.status) patch.status = args.patch.status;
  if (typeof args.patch.notes === "string") patch.notes = args.patch.notes.slice(0, 4000);
  if (args.patch.owner === "ben") patch.owner = "ben";

  const { data, error } = await sb
    .from("client_tasks")
    .update(patch)
    .eq("id", args.taskId)
    .select("*")
    .single();
  if (error) throw new Error(`updatePortalTask: ${error.message}`);
  return data as PortalTask;
}

/**
 * Bulk update — applies the same patch to many client-owned tasks in
 * one round-trip. Used by the To-Do bulk action toolbar.
 *
 * Returns count of rows updated. Filtering is enforced server-side
 * via the same client-slug + owner='client' guard.
 */
export async function bulkUpdatePortalTasks(args: {
  taskIds: string[];
  clientSlug: string;
  ownerId: string;
  patch: { status?: PortalTaskStatus; owner?: "ben" };
}): Promise<number> {
  if (args.taskIds.length === 0) return 0;
  const patch: Record<string, unknown> = {
    last_updated_by_owner_id: args.ownerId,
  };
  if (args.patch.status) patch.status = args.patch.status;
  if (args.patch.owner === "ben") patch.owner = "ben";

  const { data, error } = await getSupabase()
    .from("client_tasks")
    .update(patch)
    .in("id", args.taskIds)
    .eq("client_slug", args.clientSlug)
    .eq("owner", "client")
    .select("id");
  if (error) throw new Error(`bulkUpdatePortalTasks: ${error.message}`);
  return (data ?? []).length;
}
