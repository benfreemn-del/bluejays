import { NextRequest, NextResponse } from "next/server";

import {
  extractBearerFromRequest,
  validateBearerToken,
} from "@/lib/client-api-keys";
import { listClientLeads } from "@/lib/client-leads";

/**
 * Public client API — GET /api/v1/clients/[slug]/leads
 *
 * Bearer-auth (or ?api_key=) endpoint that lets the client's own dev team
 * or a Zapier polling trigger pull lead data into their CRM/ERP/QuickBooks.
 *
 * Zapier-compatible polling contract:
 *   - Returns an ARRAY at the top level (Zapier convention)
 *   - Each item has a stable `id` field (Zapier dedup key)
 *   - Each item has `created_at` for deterministic ordering
 *   - Supports `?since=<ISO>` for incremental polls
 *   - Defaults to last 200 rows, ordered newest-first
 *
 * Curl test (Ben's debugging path):
 *   curl -H 'Authorization: Bearer bj_live_…' \
 *     'https://bluejayportfolio.com/api/v1/clients/zenith-sports/leads?since=2026-05-01'
 *
 * Pattern: see CLAUDE.md "Public Client API + Zapier Trigger".
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_CORS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: PUBLIC_CORS });
}

function withCors(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { ...PUBLIC_CORS, "Content-Type": "application/json" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = extractBearerFromRequest(req);
  if (!token) {
    return withCors(
      { error: "Missing bearer token. Use Authorization: Bearer <key>." },
      401,
    );
  }

  const keyRow = await validateBearerToken(token, {
    endpoint: `GET /api/v1/clients/${slug}/leads`,
  });
  if (!keyRow) {
    return withCors({ error: "Invalid or revoked API key." }, 401);
  }
  if (keyRow.client_slug !== slug) {
    return withCors(
      { error: "Key is scoped to a different client." },
      403,
    );
  }

  const since = req.nextUrl.searchParams.get("since");
  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") || 200),
    500,
  );
  const sinceDate = since ? new Date(since) : null;
  if (since && (!sinceDate || isNaN(sinceDate.getTime()))) {
    return withCors(
      { error: "Invalid 'since' parameter. Use ISO-8601 (e.g. 2026-05-01)." },
      400,
    );
  }

  try {
    const all = await listClientLeads(slug, { limit });
    const filtered = sinceDate
      ? all.filter((l) => new Date(l.created_at) >= sinceDate)
      : all;
    // Trim internal-only fields. The client API is a stable contract;
    // omit fields they shouldn't see (internal_score, debug, etc.) here
    // if/when they get added to client_leads.
    const out = filtered.map((l) => ({
      id: l.id,
      client_slug: l.client_slug,
      name: l.name,
      email: l.email,
      phone: l.phone,
      audience_segment: l.audience_segment,
      funnel_status: l.funnel_status,
      funnel_step: l.funnel_step,
      source: l.source,
      intent: l.intent,
      notes: l.notes,
      created_at: l.created_at,
      last_contact_at: l.last_contact_at,
      conversion_value_cents: l.conversion_value_cents ?? null,
    }));
    return withCors(out, 200);
  } catch (err) {
    return withCors(
      { error: `Internal error: ${(err as Error).message}` },
      500,
    );
  }
}
