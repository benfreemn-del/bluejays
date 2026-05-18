import { NextRequest, NextResponse } from "next/server";

import {
  createWorkLogEntry,
  listWorkLogEntries,
  type WorkLogKind,
  type WorkLogLink,
} from "@/lib/work-log";
import { ownerFromCookie } from "@/lib/client-auth";

/**
 * GET  /api/clients/[slug]/work-log
 *   Returns the work-log entries for this client. Visible to:
 *     - Admin (middleware-gated by /api/clients/*) — sees ALL entries
 *     - Client owner via client-portal-session cookie — sees visible_to_client=true ONLY
 *
 * POST /api/clients/[slug]/work-log
 *   Admin-only (gated by middleware). Body:
 *     { kind, title, details?, links?, hours_spent?, visible_to_client? }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isClientOwner(req: NextRequest, slug: string): Promise<boolean> {
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = cookie ? await ownerFromCookie(cookie) : null;
  return !!owner && owner.client_slug === slug;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  // Middleware ensures admin auth for /api/clients/*. If the client-portal
  // cookie is also present (impersonation flow uses this) the owner-only
  // filter is applied to limit visibility.
  const limitToVisible = await isClientOwner(req, slug);
  const since = req.nextUrl.searchParams.get("since");
  const until = req.nextUrl.searchParams.get("until");
  const limit = Number(req.nextUrl.searchParams.get("limit") || 200);
  const entries = await listWorkLogEntries({
    client_slug: slug,
    since: since ? new Date(since) : undefined,
    until: until ? new Date(until) : undefined,
    visibleOnly: limitToVisible,
    limit,
  });
  return NextResponse.json({ ok: true, entries });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const kind = typeof body.kind === "string" ? body.kind : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!kind || !title) {
    return NextResponse.json(
      { ok: false, error: "kind and title are required" },
      { status: 400 },
    );
  }

  const links: WorkLogLink[] = Array.isArray(body.links)
    ? (body.links as unknown[])
        .filter(
          (l): l is { label: string; url: string } =>
            !!l &&
            typeof (l as Record<string, unknown>).label === "string" &&
            typeof (l as Record<string, unknown>).url === "string",
        )
        .map((l) => ({ label: l.label, url: l.url }))
    : [];

  const entry = await createWorkLogEntry({
    client_slug: slug,
    kind: kind as WorkLogKind,
    title,
    details: typeof body.details === "string" ? body.details : null,
    links,
    hours_spent:
      typeof body.hours_spent === "number" ? body.hours_spent : null,
    visible_to_client: body.visible_to_client !== false,
    created_by:
      typeof body.created_by === "string" ? body.created_by : "ben",
  });

  if (!entry) {
    return NextResponse.json(
      { ok: false, error: "Could not insert work log entry" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, entry });
}
