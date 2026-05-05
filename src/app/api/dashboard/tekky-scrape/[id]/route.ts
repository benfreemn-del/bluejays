import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * PATCH /api/dashboard/tekky-scrape/[id] — update one tekky_scrape_lead
 * (status / notes). DELETE → remove the row.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_STATUSES = [
  "new",
  "contacted",
  "responded",
  "converted",
  "dismissed",
] as const;

type LeadStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }
  let body: { status?: string; notes?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }
  const patch: Record<string, unknown> = {};
  if (typeof body.status === "string") {
    if (!VALID_STATUSES.includes(body.status as LeadStatus)) {
      return NextResponse.json(
        { ok: false, error: `status must be one of ${VALID_STATUSES.join(", ")}` },
        { status: 400 },
      );
    }
    patch.status = body.status;
  }
  if (typeof body.notes === "string") patch.notes = body.notes;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { ok: false, error: "Nothing to patch" },
      { status: 400 },
    );
  }
  const { data, error } = await getSupabase()
    .from("tekky_scrape_leads")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, lead: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }
  const { error } = await getSupabase()
    .from("tekky_scrape_leads")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
