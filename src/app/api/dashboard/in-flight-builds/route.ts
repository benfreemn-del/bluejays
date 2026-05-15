import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { listAllPortalSlugs, getPortalConfig } from "@/lib/portal-configs";

/**
 * GET /api/dashboard/in-flight-builds
 *
 * Hormozi backend review B1 (2026-05-16) — "show the work."
 *
 * Returns the list of clients with active build activity in the last
 * 30 days, joined with their portal display name + the most recent
 * shipped milestone (done task) + the next in-flight task. Powers the
 * Overview-tab "Currently building for" card, which is the screen Ben
 * can share live on a sales call as proof the system delivers.
 *
 * Cheap: one big query for last-30d tasks, bucketed in memory by slug.
 *
 * Auth: covered by /api middleware (admin-password cookie).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Task = {
  client_slug: string;
  title: string;
  status: string;
  priority: string;
  updated_at: string;
  completed_at: string | null;
};

type Build = {
  slug: string;
  displayName: string;
  lastShipped: { title: string; completedAt: string } | null;
  inProgress: { title: string; priority: string } | null;
  doneCount30d: number;
  openCount: number;
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, builds: [], configured: false });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Pull every task touched in the last 30 days. At ~50 tasks/client/month
  // across ~10 active clients this is bounded at well under 1k rows.
  const { data, error } = await supabase
    .from("client_tasks")
    .select("client_slug, title, status, priority, updated_at, completed_at")
    .gte("updated_at", thirtyDaysAgo)
    .order("updated_at", { ascending: false })
    .limit(2000);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Bucket by slug. For each slug, find:
  //  - most-recent done task (lastShipped)
  //  - highest-priority in_progress task (inProgress)
  //  - 30-day done count + currently-open count
  const bySlug = new Map<string, Task[]>();
  for (const t of (data || []) as Task[]) {
    const arr = bySlug.get(t.client_slug) || [];
    arr.push(t);
    bySlug.set(t.client_slug, arr);
  }

  const priorityRank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  const builds: Build[] = [];

  for (const [slug, tasks] of bySlug.entries()) {
    const portal = getPortalConfig(slug);
    const displayName = portal?.displayName || slug;

    const doneTasks = tasks
      .filter((t) => t.status === "done")
      .sort((a, b) => {
        const aT = a.completed_at ? new Date(a.completed_at).getTime() : new Date(a.updated_at).getTime();
        const bT = b.completed_at ? new Date(b.completed_at).getTime() : new Date(b.updated_at).getTime();
        return bT - aT;
      });

    const inProgressTasks = tasks
      .filter((t) => t.status === "in_progress" || t.status === "pending")
      .sort((a, b) => {
        const pa = priorityRank[a.priority] ?? 9;
        const pb = priorityRank[b.priority] ?? 9;
        if (pa !== pb) return pa - pb;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

    const lastShipped = doneTasks[0]
      ? {
          title: doneTasks[0].title,
          completedAt: doneTasks[0].completed_at || doneTasks[0].updated_at,
        }
      : null;
    const inProgress = inProgressTasks[0]
      ? { title: inProgressTasks[0].title, priority: inProgressTasks[0].priority }
      : null;

    // Skip clients with zero recent activity AND zero open work.
    if (doneTasks.length === 0 && inProgressTasks.length === 0) continue;

    builds.push({
      slug,
      displayName,
      lastShipped,
      inProgress,
      doneCount30d: doneTasks.length,
      openCount: inProgressTasks.length,
    });
  }

  // Sort: most-recently-shipped clients first; clients with NO shipped
  // tasks but open work go to the bottom (build-just-started state).
  builds.sort((a, b) => {
    const aT = a.lastShipped ? new Date(a.lastShipped.completedAt).getTime() : 0;
    const bT = b.lastShipped ? new Date(b.lastShipped.completedAt).getTime() : 0;
    return bT - aT;
  });

  // Validate every slug is a known portal — drops orphaned data from
  // accidental client_slug typos.
  const knownSlugs = new Set(listAllPortalSlugs().map((s) => s.slug));
  const validBuilds = builds.filter((b) => knownSlugs.has(b.slug));

  return NextResponse.json({ ok: true, builds: validBuilds, configured: true });
}
