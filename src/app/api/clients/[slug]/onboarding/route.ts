import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import {
  getOrCreateOnboarding,
  saveStep,
  STEP_ORDER,
  type OnboardingStep,
  type StepPayload,
} from "@/lib/client-onboarding";

/**
 * GET  /api/clients/[slug]/onboarding
 *   Returns the current onboarding row (auto-creates if missing).
 *
 * POST /api/clients/[slug]/onboarding
 *   Saves a step. Body: { step: "business"|"phone"|…, data: {…} }
 *
 * Auth: client-portal-session cookie scoped to this slug.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authedOwner(req: NextRequest, slug: string) {
  const cookie = req.cookies.get("client-portal-session")?.value;
  const owner = cookie ? await ownerFromCookie(cookie) : null;
  if (!owner || owner.client_slug !== slug) return null;
  return owner;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const owner = await authedOwner(req, slug);
  if (!owner) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const row = await getOrCreateOnboarding(slug);
    return NextResponse.json({ ok: true, row });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const owner = await authedOwner(req, slug);
  if (!owner) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let body: { step?: string; data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const step = body.step as OnboardingStep | undefined;
  if (!step || !STEP_ORDER.includes(step)) {
    return NextResponse.json({ ok: false, error: "unknown step" }, { status: 400 });
  }
  if (!body.data || typeof body.data !== "object") {
    return NextResponse.json({ ok: false, error: "data required" }, { status: 400 });
  }

  try {
    // The lib enforces shape downstream by typing; the API trusts the
    // wizard since both are first-party. Real validation lives in the
    // form components (required fields, etc.).
    const row = await saveStep(slug, { step, data: body.data } as StepPayload);
    return NextResponse.json({ ok: true, row });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
