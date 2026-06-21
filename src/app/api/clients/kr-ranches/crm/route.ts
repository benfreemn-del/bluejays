import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { type Customer } from "@/lib/client-shop";

/**
 * Owner-authed Customers CRM list + create for KR Ranches.
 *
 * GET  → filtered, sorted, paginated customer list
 * POST → create a customer
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLUG = "kr-ranches";

async function requireOwner(req: NextRequest) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  if (!cookie) return null;
  const owner = await ownerFromCookie(cookie);
  if (!owner || owner.client_slug !== SLUG) return null;
  return owner;
}

export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, customers: [], total: 0 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const tag = (url.searchParams.get("tag") || "").trim();
  const sort = url.searchParams.get("sort") || "recent";

  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 1),
    500,
  );
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10) || 0, 0);

  const buildQuery = (selectArg: string, opts?: { count?: "exact"; head?: boolean }) => {
    let query = getSupabase()
      .from("client_customers")
      .select(selectArg, opts)
      .eq("client_slug", SLUG);

    if (q) {
      const safe = q.replace(/[%,()]/g, " ").trim();
      query = query.or(
        `name.ilike.%${safe}%,phone.ilike.%${safe}%,email.ilike.%${safe}%`,
      );
    }
    if (tag) query = query.contains("tags", [tag]);
    return query;
  };

  const { count, error: countError } = await buildQuery("*", { count: "exact", head: true });
  if (countError) {
    console.error("[kr-ranches/crm GET] count error:", countError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  let listQuery = buildQuery("*");
  if (sort === "spend") {
    listQuery = listQuery.order("total_spent_cents", { ascending: false });
  } else if (sort === "name") {
    listQuery = listQuery.order("name", { ascending: true });
  } else {
    // "recent" (default) — most recent order first, nulls last.
    listQuery = listQuery.order("last_order_at", { ascending: false, nullsFirst: false });
  }

  const { data, error } = await listQuery.range(offset, offset + limit - 1);
  if (error) {
    console.error("[kr-ranches/crm GET] list error:", error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    customers: (data ?? []) as unknown as Customer[],
    total: count ?? 0,
  });
}

export async function POST(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: {
    name?: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    tags?: string[];
    notes?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  if (!name) {
    return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string").map((t) => t.trim()).filter(Boolean)
    : [];

  const { data, error } = await getSupabase()
    .from("client_customers")
    .insert({
      client_slug: SLUG,
      name,
      phone: body.phone ? String(body.phone).trim() || null : null,
      email: body.email ? String(body.email).trim().toLowerCase() || null : null,
      address: body.address ? String(body.address).trim() || null : null,
      tags,
      notes: body.notes ? String(body.notes).trim() : null,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[kr-ranches/crm POST] insert error:", error?.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, customer: data as unknown as Customer });
}
