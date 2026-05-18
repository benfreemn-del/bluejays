import { NextRequest, NextResponse } from "next/server";

import {
  createApiKey,
  listApiKeys,
} from "@/lib/client-api-keys";

/**
 * GET  /api/clients/[slug]/api-keys  — list metadata (no plaintext)
 * POST /api/clients/[slug]/api-keys  — create, returns plaintext ONCE
 *
 * Admin-only via middleware gating of /api/clients/*.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const keys = await listApiKeys(slug);
  return NextResponse.json({ ok: true, keys });
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
  const label =
    typeof body.label === "string" ? body.label.trim() : "";
  if (!label) {
    return NextResponse.json(
      { ok: false, error: "Label is required" },
      { status: 400 },
    );
  }
  const created = await createApiKey({
    client_slug: slug,
    label,
    scopes:
      Array.isArray(body.scopes) && body.scopes.every((s) => typeof s === "string")
        ? (body.scopes as string[])
        : ["read"],
  });
  if (!created) {
    return NextResponse.json(
      { ok: false, error: "Could not create API key (DB not configured?)" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, key: created });
}
