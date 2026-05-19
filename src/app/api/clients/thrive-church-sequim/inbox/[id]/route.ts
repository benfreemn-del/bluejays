import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * PATCH /api/clients/thrive-church-sequim/inbox/[id]
 *
 * Mutate a single client_leads row from the Thrive portal Inbox tab.
 * v1 supports two fields:
 *   - funnel_status: "new" | "in-progress" | "replied" | "closed"
 *     (portal Inbox vocab — mapped back to the underlying ClientLeadFunnelStatus)
 *   - notes: string (replaces existing notes)
 *
 * Auth: same shared `gate` token as the GET endpoint. Scoped to the
 * thrive-church-sequim slug — even if a forged id slipped through, the
 * `.eq("client_slug", SLUG)` filter prevents touching any other client's
 * row.
 *
 * Per CLAUDE.md Rule 10 — every [id] route validates the path param is
 * a UUID before any DB call, returning 400 with a friendly message (not
 * a raw Postgres error).
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GATE = process.env.THRIVE_PORTAL_GATE || "thrive2026";
const SLUG = "thrive-church-sequim";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Portal vocab → DB vocab. Keep in sync with the mapping in the GET route.
function mapStatusToDb(portalStatus: string): string | null {
  switch (portalStatus) {
    case "new":
      return "enrolled";
    case "in-progress":
      return "responded";
    case "replied":
      return "replied";
    case "closed":
      return "won";
    default:
      return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid inbox id" },
      { status: 400 },
    );
  }

  const url = new URL(request.url);
  const gate =
    url.searchParams.get("gate") || request.headers.get("x-thrive-gate") || "";
  if (gate !== GATE) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Database not configured" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const patch: Record<string, unknown> = {};

  if (typeof body.funnel_status === "string") {
    const dbStatus = mapStatusToDb(body.funnel_status);
    if (!dbStatus) {
      return NextResponse.json(
        { ok: false, error: "Invalid status value" },
        { status: 400 },
      );
    }
    patch.funnel_status = dbStatus;
    if (body.funnel_status === "replied" || body.funnel_status === "in-progress") {
      patch.responded_at = new Date().toISOString();
    }
  }

  if (typeof body.notes === "string") {
    patch.notes = body.notes.slice(0, 4000); // hard cap to keep rows reasonable
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { ok: false, error: "Nothing to update" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await getSupabase()
      .from("client_leads")
      .update(patch)
      .eq("id", id)
      .eq("client_slug", SLUG)
      .select("id, funnel_status, notes, responded_at")
      .single();

    if (error) {
      console.error("[thrive inbox PATCH] supabase error:", error.message);
      return NextResponse.json(
        { ok: false, error: "Update failed" },
        { status: 500 },
      );
    }
    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Inbox item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, lead: data });
  } catch (err) {
    console.error("[thrive inbox PATCH] threw:", err);
    return NextResponse.json(
      { ok: false, error: "Update failed" },
      { status: 500 },
    );
  }
}
