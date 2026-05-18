import { NextRequest, NextResponse } from "next/server";

import { createClientLead } from "@/lib/client-leads";

/**
 * POST /api/clients/[slug]/reader-capture
 *
 * Public endpoint (no auth — readers are anonymous) that captures email
 * signups from the bespoke author showcase. Writes to client_leads with
 * a source tag identifying the capture moment (faction_quiz / world_map /
 * parchment_reader / chapter_one / preorder / newsletter) so the author
 * can later run different welcome sequences per tag.
 *
 * Body: { email, name?, source, context? }
 *
 * On success the existing createClientLead pipeline fires:
 *   - notifyOwnerOfNewLead → SMS to author when a reader signs up
 *   - Lead surfaces in the existing client portal Leads tab automatically
 *
 * Pattern: see CLAUDE.md "Series-LTV Reader Funnel".
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: PUBLIC_CORS });
}

const VALID_SOURCES = [
  "faction_quiz",
  "world_map",
  "parchment_reader",
  "chapter_one",
  "preorder",
  "newsletter",
  "other",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      { status: 400, headers: PUBLIC_CORS },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const sourceRaw = typeof body.source === "string" ? body.source : "";
  const source = VALID_SOURCES.includes(sourceRaw) ? sourceRaw : "other";
  const context =
    body.context && typeof body.context === "object"
      ? (body.context as Record<string, unknown>)
      : {};

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Valid email required" },
      { status: 400, headers: PUBLIC_CORS },
    );
  }

  try {
    const lead = await createClientLead({
      client_slug: slug,
      email,
      name: name || null,
      source: `reader:${source}`,
      audience_segment: "reader",
      intent: source,
      raw_payload: {
        capture_source: source,
        context,
        captured_at: new Date().toISOString(),
      },
      // funnel_status defaults to 'not_enrolled' on insert — the
      // author's per-tag welcome sequence picks it up from there.
    });
    return NextResponse.json(
      { ok: true, lead_id: lead.id },
      { status: 200, headers: PUBLIC_CORS },
    );
  } catch (err) {
    console.error("[reader-capture] failed:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500, headers: PUBLIC_CORS },
    );
  }
}
