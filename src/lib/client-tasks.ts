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
import { slugifyBusinessName } from "./case-studies";

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
  // Auto-fire: ensure a client_jobs_meta row exists for this slug so
  // the dashboard categorization is automatic on first task creation.
  // Best-effort — never blocks the task insert.
  await ensureClientJobsMeta(task.client_slug).catch(() => {});
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
  // Auto-fire categorization meta for every new slug touched in this
  // bulk insert. De-duped so the same slug doesn't ensure twice.
  const uniqueSlugs = Array.from(new Set(tasks.map((t) => t.client_slug)));
  for (const slug of uniqueSlugs) {
    await ensureClientJobsMeta(slug).catch(() => {});
  }
  return (data ?? []) as ClientTask[];
}

/**
 * Ensure a client_jobs_meta row exists for the given slug. Idempotent —
 * the upsert function on the DB side coalesces existing values, so
 * calling this with no opts on a row that already has category set
 * doesn't clobber it.
 *
 * Wired into createClientTask + createClientTasks so the dashboard
 * categorization is automatic for every new client/job that lands.
 * Operators can fill in category/tier later via the dashboard inline
 * editor — but the row exists from minute one.
 *
 * Per AIOS principle 24: every active build must surface in the
 * /dashboard/clients view. This helper is the discipline-enforcer.
 */
export async function ensureClientJobsMeta(
  clientSlug: string,
  opts?: { category?: string; tier?: string },
): Promise<void> {
  const sb = getSupabase();
  // Use the SQL helper function for a single round-trip upsert.
  const { error } = await sb.rpc("upsert_client_jobs_meta", {
    p_client_slug: clientSlug,
    p_category: opts?.category ?? null,
    p_tier: opts?.tier ?? null,
  });
  if (error) {
    // Don't throw — caller is usually a task-creation path that
    // shouldn't fail just because the categorization seed failed.
    console.warn(`[ensureClientJobsMeta] upsert failed for ${clientSlug}:`, error.message);
  }
}

/** Manual update path for the dashboard inline editor — sets category +
 *  tier explicitly (overrides any existing values, unlike ensureClientJobsMeta
 *  which only fills nulls). Used by the /api/client-jobs-meta PATCH route. */
export async function setClientJobMeta(
  clientSlug: string,
  patch: { category?: string | null; tier?: string | null },
): Promise<ClientJobMeta> {
  const sb = getSupabase();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.tier !== undefined) update.tier = patch.tier;

  // Try update first; if no row exists yet, insert.
  const { data: updated, error: updErr } = await sb
    .from("client_jobs_meta")
    .update(update)
    .eq("client_slug", clientSlug)
    .select("*");
  if (updErr) throw new Error(`setClientJobMeta update: ${updErr.message}`);

  if (updated && updated.length > 0) return updated[0] as ClientJobMeta;

  const { data: inserted, error: insErr } = await sb
    .from("client_jobs_meta")
    .insert({
      client_slug: clientSlug,
      category: patch.category ?? null,
      tier: patch.tier ?? null,
    })
    .select("*")
    .single();
  if (insErr) throw new Error(`setClientJobMeta insert: ${insErr.message}`);
  return inserted as ClientJobMeta;
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

export type ClientJobMeta = {
  client_slug: string;
  snoozed: boolean;
  snooze_reason: string | null;
  snooze_until: string | null;
  snooze_set_at: string | null;
  snooze_notified_at: string | null;
  snooze_notes: string | null;
  notes: string | null;
  // Categorization (added 2026-05-10 per AIOS principle 24).
  // Funnel-stage IS NOT stored here — it lives on prospects.pipeline_stage
  // (single source of truth for the sales pipeline).
  category: string | null;
  tier: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type ClientJobSummary = {
  client_slug: string;
  open_count: number;
  done_count: number;
  // Snooze metadata — null/false when no client_jobs_meta row exists
  snoozed: boolean;
  snooze_reason: string | null;
  snooze_until: string | null;
  snooze_notes: string | null;
  // Categorization
  category: string | null;
  tier: string | null;
  // Pipeline stage — read from the linked prospect row (if any).
  // String like '1', '2a', '4', '4b'. null when no prospect found.
  pipeline_stage: string | null;
};

export async function listClientsWithTasks(): Promise<ClientJobSummary[]> {
  const sb = getSupabase();
  const [tasksRes, metaRes, prospectsRes] = await Promise.all([
    sb.from("client_tasks").select("client_slug, status"),
    // Best-effort meta read — table may not exist yet on a fresh deploy
    sb
      .from("client_jobs_meta")
      .select(
        "client_slug, snoozed, snooze_reason, snooze_until, snooze_notes, category, tier",
      )
      .then(
        (r) => r,
        () => ({
          data: [] as Array<
            Pick<
              ClientJobMeta,
              | "client_slug"
              | "snoozed"
              | "snooze_reason"
              | "snooze_until"
              | "snooze_notes"
              | "category"
              | "tier"
            >
          >,
          error: null,
        }),
      ),
    // Pull every prospect that has a pipeline stage so we can attach
    // the stage tag to each client row on /dashboard/clients. Linkage:
    // slugify(prospect.business_name) === client_slug. Best-effort —
    // any prospect that doesn't slugify to a known client_slug is
    // silently dropped from this map.
    sb
      .from("prospects")
      .select("id, business_name, pipeline_stage")
      .not("pipeline_stage", "is", null)
      .then(
        (r) => r,
        () => ({
          data: [] as Array<{
            id: string;
            business_name: string | null;
            pipeline_stage: string | null;
          }>,
          error: null,
        }),
      ),
  ]);

  if (tasksRes.error) throw new Error(`listClientsWithTasks: ${tasksRes.error.message}`);

  // Track BOTH open and done counts per client so the dashboard can
  // surface a "✅ all done" state for fully-completed jobs (e.g.
  // Hector once his cutover lands) instead of dropping them off the
  // list silently. Open clients sort first; finished clients fall to
  // the bottom with a green checkmark.
  const open = new Map<string, number>();
  const done = new Map<string, number>();
  for (const row of (tasksRes.data ?? []) as Pick<ClientTask, "client_slug" | "status">[]) {
    if (row.status === "done" || row.status === "wont-do") {
      done.set(row.client_slug, (done.get(row.client_slug) ?? 0) + 1);
    } else {
      open.set(row.client_slug, (open.get(row.client_slug) ?? 0) + 1);
    }
  }

  // Snooze + categorization metadata, keyed by client_slug. Falls back
  // gracefully if the table query failed (e.g. migration not yet applied).
  const metaBySlug = new Map<
    string,
    Pick<
      ClientJobMeta,
      | "snoozed"
      | "snooze_reason"
      | "snooze_until"
      | "snooze_notes"
      | "category"
      | "tier"
    >
  >();
  if (metaRes && !metaRes.error && Array.isArray(metaRes.data)) {
    for (const row of metaRes.data) {
      metaBySlug.set(row.client_slug, {
        snoozed: row.snoozed ?? false,
        snooze_reason: row.snooze_reason ?? null,
        snooze_until: row.snooze_until ?? null,
        snooze_notes: row.snooze_notes ?? null,
        category: row.category ?? null,
        tier: row.tier ?? null,
      });
    }
  }

  // Pipeline stage map — slug → stage. Built by slugifying every
  // prospect's business_name and indexing by that. Last-write-wins
  // when multiple prospects slugify to the same key (rare; usually
  // means duplicate prospects we'd want to merge anyway).
  const stageBySlug = new Map<string, string>();
  if (prospectsRes && !prospectsRes.error && Array.isArray(prospectsRes.data)) {
    for (const p of prospectsRes.data) {
      if (!p.business_name || !p.pipeline_stage) continue;
      const key = slugifyBusinessName(p.business_name);
      if (!key) continue;
      stageBySlug.set(key, p.pipeline_stage);
    }
  }

  const slugs = new Set([...open.keys(), ...done.keys(), ...metaBySlug.keys()]);
  return Array.from(slugs)
    .map((client_slug) => {
      const meta = metaBySlug.get(client_slug);
      return {
        client_slug,
        open_count: open.get(client_slug) ?? 0,
        done_count: done.get(client_slug) ?? 0,
        snoozed: meta?.snoozed ?? false,
        snooze_reason: meta?.snooze_reason ?? null,
        snooze_until: meta?.snooze_until ?? null,
        snooze_notes: meta?.snooze_notes ?? null,
        category: meta?.category ?? null,
        tier: meta?.tier ?? null,
        pipeline_stage: stageBySlug.get(client_slug) ?? null,
      };
    })
    .sort((a, b) => {
      // Open work first (highest count → top), then fully-done
      // clients alphabetically at the bottom. Snoozed rows sink
      // below open work but above fully-done — they're parked,
      // but Ben still wants to see them.
      const aActive = a.open_count > 0 && !a.snoozed;
      const bActive = b.open_count > 0 && !b.snoozed;
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      if (a.open_count !== b.open_count) return b.open_count - a.open_count;
      return a.client_slug.localeCompare(b.client_slug);
    });
}

/**
 * Bulk-complete every open task for one client. Used by the
 * "Mark all done" button on /dashboard/clients. Returns the count
 * of rows updated.
 */
export async function completeAllTasksForClient(clientSlug: string): Promise<number> {
  const { data, error } = await getSupabase()
    .from("client_tasks")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("client_slug", clientSlug)
    .not("status", "in", "(done,wont-do)")
    .select("id");
  if (error) throw new Error(`completeAllTasksForClient: ${error.message}`);
  return (data ?? []).length;
}

/**
 * Set or clear the snooze flag on a client_jobs_meta row. Called by
 * the snooze toggle on /dashboard/clients. When `snoozeUntil` is
 * provided, sets snoozed=true + writes the reminder timestamp.
 * When null/undefined, clears the snooze.
 */
export async function setClientSnooze(
  clientSlug: string,
  opts: {
    snoozeUntil?: string | null;
    reason?: string | null;
    notes?: string | null;
  },
): Promise<ClientJobMeta> {
  const sb = getSupabase();
  const now = new Date().toISOString();
  const willSnooze = opts.snoozeUntil != null;

  const row = {
    client_slug: clientSlug,
    snoozed: willSnooze,
    snooze_reason: willSnooze ? opts.reason ?? "manual" : null,
    snooze_until: willSnooze ? opts.snoozeUntil ?? null : null,
    snooze_set_at: willSnooze ? now : null,
    // Reset notified_at when re-snoozing so the next reminder fires
    snooze_notified_at: null,
    snooze_notes: opts.notes ?? null,
    updated_at: now,
  };

  const { data, error } = await sb
    .from("client_jobs_meta")
    .upsert(row, { onConflict: "client_slug" })
    .select("*")
    .single();
  if (error) throw new Error(`setClientSnooze: ${error.message}`);
  return data as ClientJobMeta;
}

/**
 * Find every client_jobs_meta row whose snooze_until <= now and
 * whose snooze_notified_at IS NULL — used by the daily reminder
 * cron to fire SMS+email follow-up nudges.
 */
export async function listDueSnoozeReminders(): Promise<ClientJobMeta[]> {
  const sb = getSupabase();
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("client_jobs_meta")
    .select("*")
    .eq("snoozed", true)
    .lte("snooze_until", now)
    .is("snooze_notified_at", null);
  if (error) throw new Error(`listDueSnoozeReminders: ${error.message}`);
  return (data ?? []) as ClientJobMeta[];
}

/**
 * Mark a snooze reminder as fired (idempotency for the cron).
 */
export async function markSnoozeNotified(clientSlug: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("client_jobs_meta")
    .update({
      snooze_notified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("client_slug", clientSlug);
  if (error) throw new Error(`markSnoozeNotified: ${error.message}`);
}
