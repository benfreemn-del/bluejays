import { NextRequest, NextResponse } from "next/server";
import { completeAllTasksForClient } from "@/lib/client-tasks";

/**
 * POST /api/client-tasks/bulk-complete
 *
 * Marks every open task (status NOT IN done/wont-do) for one or more
 * client_slugs as `done`. Used by the "Mark all done" button on
 * /dashboard/clients. Returns per-slug update counts.
 *
 * Body: { client_slugs: string[] }   — pass one or many
 *
 * Auth: middleware on /api/* gates this behind the dashboard cookie.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { client_slugs?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const slugs = Array.isArray(body.client_slugs)
    ? body.client_slugs.filter((s): s is string => typeof s === "string" && s.length > 0)
    : [];

  if (slugs.length === 0) {
    return NextResponse.json(
      { ok: false, error: "client_slugs (non-empty array of strings) required" },
      { status: 400 },
    );
  }

  if (slugs.length > 50) {
    return NextResponse.json(
      { ok: false, error: "max 50 client_slugs per request" },
      { status: 400 },
    );
  }

  const results: { client_slug: string; updated: number; error?: string }[] = [];
  for (const slug of slugs) {
    try {
      const updated = await completeAllTasksForClient(slug);
      results.push({ client_slug: slug, updated });
    } catch (err) {
      results.push({
        client_slug: slug,
        updated: 0,
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);
  return NextResponse.json({ ok: true, totalUpdated, results });
}
