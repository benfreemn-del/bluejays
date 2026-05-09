import { NextRequest, NextResponse } from "next/server";
import { updateSocialLeadStatus } from "@/lib/social-leads";

/**
 * PATCH /api/social-leads/[id]  body: { status }
 *
 * Updates a social-lead's status. Valid transitions:
 *   drafted → sent → replied
 *   any → closed-won | closed-lost | closed-no-response
 */

const VALID = new Set([
  "drafted",
  "sent",
  "replied",
  "closed-won",
  "closed-lost",
  "closed-no-response",
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = body.status as string;
  if (!status || !VALID.has(status)) {
    return NextResponse.json(
      { ok: false, error: "invalid status" },
      { status: 400 },
    );
  }
  const ok = await updateSocialLeadStatus(id, status as never);
  return NextResponse.json({ ok });
}
