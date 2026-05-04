import { NextRequest, NextResponse } from "next/server";
import {
  affiliateCounts,
  createAffiliate,
  listAffiliates,
  type AffiliateChannel,
  type AffiliateStatus,
} from "@/lib/client-affiliates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "client param required" },
      { status: 400 },
    );
  }
  if (searchParams.get("counts") === "1") {
    try {
      const counts = await affiliateCounts(client);
      return NextResponse.json({ ok: true, counts });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "unknown" },
        { status: 500 },
      );
    }
  }
  const status = searchParams.get("status") as AffiliateStatus | null;
  const channel = searchParams.get("channel") as AffiliateChannel | null;
  try {
    const list = await listAffiliates(client, {
      status: status ?? undefined,
      channel: channel ?? undefined,
    });
    return NextResponse.json({ ok: true, affiliates: list });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "client param required" },
      { status: 400 },
    );
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.org_name || typeof body.org_name !== "string") {
    return NextResponse.json(
      { ok: false, error: "org_name required" },
      { status: 400 },
    );
  }
  try {
    const affiliate = await createAffiliate(client, {
      org_name: body.org_name,
      contact_name: (body.contact_name as string) ?? null,
      role: (body.role as string) ?? null,
      email: (body.email as string) ?? null,
      phone: (body.phone as string) ?? null,
      website: (body.website as string) ?? null,
      city: (body.city as string) ?? null,
      state: (body.state as string) ?? null,
      region: (body.region as string) ?? null,
      channel: (body.channel as AffiliateChannel) ?? null,
      source: (body.source as string) ?? "manual",
      notes: (body.notes as string) ?? null,
    });
    return NextResponse.json({ ok: true, affiliate });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
