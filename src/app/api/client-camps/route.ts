import { NextRequest, NextResponse } from "next/server";
import {
  createCamp,
  listActiveCamps,
  listAllCamps,
  type NewClientCamp,
} from "@/lib/client-camps";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET  /api/client-camps?client=<slug>[&all=1]
 * POST /api/client-camps
 *   Body: { client_slug, name, ...optional fields }
 */

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slug = (url.searchParams.get("client") || "").trim();
  const all = url.searchParams.get("all") === "1";
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "Missing ?client=<slug>" },
      { status: 400 },
    );
  }
  try {
    const camps = all ? await listAllCamps(slug) : await listActiveCamps(slug);
    return NextResponse.json({ ok: true, camps });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const slug = String(body.client_slug || "").trim();
  const name = String(body.name || "").trim();
  if (!slug || !name) {
    return NextResponse.json(
      { ok: false, error: "client_slug and name are required" },
      { status: 400 },
    );
  }
  const payload: NewClientCamp = {
    client_slug: slug,
    name,
    org: (body.org as string) ?? null,
    city: (body.city as string) ?? null,
    state: (body.state as string)?.toUpperCase() || null,
    region: (body.region as string) ?? null,
    lat: typeof body.lat === "number" ? body.lat : null,
    lng: typeof body.lng === "number" ? body.lng : null,
    start_date: (body.start_date as string) || null,
    end_date: (body.end_date as string) || null,
    age_range: (body.age_range as string) || null,
    format: (body.format as string) || null,
    ball_included: typeof body.ball_included === "boolean" ? body.ball_included : false,
    url: (body.url as string) || null,
    blurb: (body.blurb as string) || null,
    sort_order: typeof body.sort_order === "number" ? body.sort_order : undefined,
    is_active: typeof body.is_active === "boolean" ? body.is_active : undefined,
  };
  try {
    const created = await createCamp(payload);
    return NextResponse.json({ ok: true, camp: created });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
