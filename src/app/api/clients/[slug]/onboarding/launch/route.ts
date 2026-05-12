import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import { launchOnboarding } from "@/lib/client-onboarding";

/**
 * POST /api/clients/[slug]/onboarding/launch
 *
 * Flips status to "launched" when all six steps are complete. Auto-
 * seeds BlueJays-side client_tasks so Ben sees his TODO list for this
 * new client immediately (Buy Twilio number, Connect GMB, etc.).
 *
 * Returns 409 if not yet ready.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = cookie ? await ownerFromCookie(cookie) : null;
  if (!owner || owner.client_slug !== slug) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const row = await launchOnboarding(slug, owner.id);
    return NextResponse.json({ ok: true, row });
  } catch (e) {
    const msg = (e as Error).message;
    const code = /must be completed/i.test(msg) ? 409 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status: code });
  }
}
