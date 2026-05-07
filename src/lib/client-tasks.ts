/**
 * client-tasks — DB helpers for the per-client task list.
 *
 * Read/write operations against public.client_tasks. Used by the
 * /api/client-tasks routes and by anything that needs to enqueue a
 * follow-up on a client (e.g. an inquiry-form submit can spawn a "Reply
 * to lead within 24h" task).
 *
 * Why server-side helpers and not direct Supabase calls in the routes:
 * keeps the column shape in one place so the migration + types + queries
 * stay aligned.
 */

import { getSupabase } from "./supabase";

export type ClientTaskStatus =
  | "pending"
  | "in_progress"
  | "blocked"
  | "done"
  | "wont-do";

export type ClientTaskPriority = "urgent" | "high" | "medium" | "low";

export type ClientTaskCategory =
  | "decision"
  | "asset"
  | "build"
  | "client-action"
  | "reminder";

export type ClientTaskOwner = "ben" | "client" | "claude" | "external";

export type ClientTask = {
  id: string;
  client_slug: string;
  title: string;
  description: string | null;
  status: ClientTaskStatus;
  priority: ClientTaskPriority;
  category: ClientTaskCategory;
  owner: ClientTaskOwner;
  blocked_on: string | null;
  due_date: string | null;
  notes: string | null;
  display_order: number;
  /** Free-text name of the specific person responsible (e.g. "Philip
   *  Lund", "Ben (BlueJays)"). Coexists with `owner` — the enum field
   *  above controls which surface (admin vs portal) the task shows up
   *  on, while these capture WHO inside that surface owns it. */
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type NewClientTask = Pick<ClientTask, "client_slug" | "title"> &
  Partial<
    Pick<
      ClientTask,
      | "description"
      | "status"
      | "priority"
      | "category"
      | "owner"
      | "blocked_on"
      | "due_date"
      | "notes"
      | "display_order"
      | "assigned_to_name"
      | "assigned_to_email"
    >
  >;

export type ClientTaskUpdate = Partial<
  Pick<
    ClientTask,
    | "title"
    | "description"
    | "status"
    | "priority"
    | "category"
    | "owner"
    | "blocked_on"
    | "due_date"
    | "notes"
    | "display_order"
    | "assigned_to_name"
    | "assigned_to_email"
  >
>;

/**
 * List all tasks for one client. By default returns everything except
 * "done" and "wont-do" — pass `includeCompleted=true` to get the full
 * archive.
 */
export async function listClientTasks(
  clientSlug: string,
  opts: { includeCompleted?: boolean } = {},
): Promise<ClientTask[]> {
  let q = getSupabase()
    .from("client_tasks")
    .select("*")
    .eq("client_slug", clientSlug)
    .order("priority", { ascending: true }) // urgent < high < medium < low alphabetically
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!opts.includeCompleted) {
    q = q.not("status", "in", "(done,wont-do)");
  }

  const { data, error } = await q;
  if (error) throw new Error(`listClientTasks: ${error.message}`);
  return (data ?? []) as ClientTask[];
}

/** Cross-client "what's on Ben's plate" view. */
export async function listOwnerTasks(
  owner: ClientTaskOwner = "ben",
): Promise<ClientTask[]> {
  const { data, error } = await getSupabase()
    .from("client_tasks")
    .select("*")
    .eq("owner", owner)
    .in("status", ["pending", "in_progress", "blocked"])
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listOwnerTasks: ${error.message}`);
  return (data ?? []) as ClientTask[];
}

export async function createClientTask(
  task: NewClientTask,
): Promise<ClientTask> {
  const { data, error } = await getSupabase()
    .from("client_tasks")
    .insert([task])
    .select("*")
    .single();
  if (error) throw new Error(`createClientTask: ${error.message}`);
  return data as ClientTask;
}

/** Bulk insert — used when seeding initial task lists from a Claude session. */
export async function createClientTasks(
  tasks: NewClientTask[],
): Promise<ClientTask[]> {
  if (tasks.length === 0) return [];
  const { data, error } = await getSupabase()
    .from("client_tasks")
    .insert(tasks)
    .select("*");
  if (error) throw new Error(`createClientTasks: ${error.message}`);
  return (data ?? []) as ClientTask[];
}

export async function updateClientTask(
  id: string,
  patch: ClientTaskUpdate,
): Promise<ClientTask> {
  const { data, error } = await getSupabase()
    .from("client_tasks")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`updateClientTask: ${error.message}`);
  return data as ClientTask;
}

export async function deleteClientTask(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("client_tasks")
    .delete()
    .eq("id", id);
  if (error) throw new Error(`deleteClientTask: ${error.message}`);
}

/** Helper for routes that need to know which clients have any open work. */
/** List EVERY task across every client. Used by the master to-do board
 *  at /dashboard/all-tasks so Ben can see his entire pipeline in one
 *  place. By default hides done + wont-do; pass includeCompleted to
 *  see the full archive. */
export async function listAllTasks(opts: {
  includeCompleted?: boolean;
} = {}): Promise<ClientTask[]> {
  const sb = getSupabase();
  let q = sb.from("client_tasks").select("*").order("created_at", {
    ascending: false,
  });
  if (!opts.includeCompleted) {
    q = q.not("status", "in", "(done,wont-do)");
  }
  const { data, error } = await q;
  if (error) throw new Error(`listAllTasks: ${error.message}`);
  return (data ?? []) as ClientTask[];
}

export async function listClientsWithTasks(): Promise<
  { client_slug: string; open_count: number; done_count: number }[]
> {
  const { data, error } = await getSupabase()
    .from("client_tasks")
    .select("client_slug, status");
  if (error) throw new Error(`listClientsWithTasks: ${error.message}`);

  // Track BOTH open and done counts per client so the dashboard can
  // surface a "✅ all done" state for fully-completed jobs (e.g.
  // Hector once his cutover lands) instead of dropping them off the
  // list silently. Open clients sort first; finished clients fall to
  // the bottom with a green checkmark.
  const open = new Map<string, number>();
  const done = new Map<string, number>();
  for (const row of (data ?? []) as Pick<ClientTask, "client_slug" | "status">[]) {
    if (row.status === "done" || row.status === "wont-do") {
      done.set(row.client_slug, (done.get(row.client_slug) ?? 0) + 1);
    } else {
      open.set(row.client_slug, (open.get(row.client_slug) ?? 0) + 1);
    }
  }

  const slugs = new Set([...open.keys(), ...done.keys()]);
  return Array.from(slugs)
    .map((client_slug) => ({
      client_slug,
      open_count: open.get(client_slug) ?? 0,
      done_count: done.get(client_slug) ?? 0,
    }))
    .sort((a, b) => {
      // Open work first (highest count → top), then fully-done
      // clients alphabetically at the bottom.
      if (a.open_count > 0 && b.open_count === 0) return -1;
      if (a.open_count === 0 && b.open_count > 0) return 1;
      if (a.open_count !== b.open_count) return b.open_count - a.open_count;
      return a.client_slug.localeCompare(b.client_slug);
    });
}
