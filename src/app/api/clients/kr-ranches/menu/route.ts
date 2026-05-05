import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Authed menu CRUD for KR Ranches admin. Owner cookie required, scoped
 * to client_slug = "kr-ranches".
 *
 * GET    → list all menu items (sorted)
 * PATCH  → update one item by id  body { id, name?, price?, note?, status?, sort_order? }
 * POST   → create one item        body { name, price, note?, status?, sort_order? }
 * DELETE → remove one item        body { id }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "kr-ranches";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireOwner(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  if (!cookie) return null;
  const owner = await ownerFromCookie(cookie);
  if (!owner) return null;
  if (owner.client_slug !== SLUG) return null;
  return owner;
}

export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, items: [] });
  }
  const { data, error } = await getSupabase()
    .from("client_menu_items")
    .select("*")
    .eq("client_slug", SLUG)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, items: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: {
    id?: string;
    name?: string;
    price?: string;
    note?: string;
    status?: string;
    sort_order?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const id = body.id?.trim();
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }
  if (body.status && !["available", "low", "gone"].includes(body.status)) {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.name === "string") update.name = body.name.trim().slice(0, 80);
  if (typeof body.price === "string") update.price = body.price.trim().slice(0, 40);
  if (typeof body.note === "string") update.note = body.note.trim().slice(0, 80);
  if (typeof body.status === "string") update.status = body.status;
  if (typeof body.sort_order === "number") update.sort_order = body.sort_order;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const { error } = await getSupabase()
    .from("client_menu_items")
    .update(update)
    .eq("id", id)
    .eq("client_slug", SLUG); // defense in depth — client can't edit other client's rows

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: {
    name?: string;
    price?: string;
    note?: string;
    status?: string;
    sort_order?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const name = body.name?.trim();
  const price = body.price?.trim();
  if (!name || !price) {
    return NextResponse.json({ ok: false, error: "name_and_price_required" }, { status: 400 });
  }
  if (body.status && !["available", "low", "gone"].includes(body.status)) {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const { data, error } = await getSupabase()
    .from("client_menu_items")
    .insert({
      client_slug: SLUG,
      name: name.slice(0, 80),
      price: price.slice(0, 40),
      note: (body.note || "").trim().slice(0, 80) || null,
      status: body.status || "available",
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 999,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const id = body.id?.trim();
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const { error } = await getSupabase()
    .from("client_menu_items")
    .delete()
    .eq("id", id)
    .eq("client_slug", SLUG);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
