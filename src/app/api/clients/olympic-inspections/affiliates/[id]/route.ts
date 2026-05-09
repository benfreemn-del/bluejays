import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * PATCH /api/clients/olympic-inspections/affiliates/[id]
 *
 * Owner-only. Update an affiliate row. Used today by the "Mark as
 * called" button on the Affiliates Map — flips status='contacted',
 * stamps last_contacted_at, increments contact_count by 1.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "olympic-inspections";
const ALLOWED_STATUSES = new Set([
  "discovered",
  "queued",
  "contacted",
  "responded",
  "onboarded",
  "rejected",
  "do-not-contact",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const supa = getSupabase();

  const patch: Record<string, unknown> = {};
  if (typeof body.status === "string") {
    if (!ALLOWED_STATUSES.has(body.status)) {
      return NextResponse.json(
        { ok: false, error: "invalid_status" },
        { status: 400 },
      );
    }
    patch.status = body.status;
  }
  if (typeof body.notes === "string") {
    patch.notes = body.notes.slice(0, 1000);
  }

  // markCalled is the common path: stamps last_contacted_at + bumps
  // contact_count. We do the increment by reading current value
  // first because supabase-js doesn't expose Postgres + 1 inline.
  if (body.markCalled === true) {
    patch.status = patch.status || "contacted";
    patch.last_contacted_at = new Date().toISOString();
    const { data: cur } = await supa
      .from("client_affiliates")
      .select("contact_count")
      .eq("id", id)
      .eq("client_slug", SLUG)
      .maybeSingle();
    patch.contact_count = (cur?.contact_count ?? 0) + 1;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { ok: false, error: "nothing_to_update" },
      { status: 400 },
    );
  }

  const { data, error } = await supa
    .from("client_affiliates")
    .update(patch)
    .eq("id", id)
    .eq("client_slug", SLUG)
    .select("id, status, last_contacted_at, contact_count")
    .single();
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, affiliate: data });
}
