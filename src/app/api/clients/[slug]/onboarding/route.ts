import { NextRequest, NextResponse } from "next/server";
import { ownerFromCookie } from "@/lib/client-auth";
import {
  getOrCreateOnboarding,
  saveStep,
  STEP_ORDER,
  type OnboardingStep,
  type StepPayload,
} from "@/lib/client-onboarding";
import { encryptCredential } from "@/lib/crypto-creds";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

  // Special handling for the `accounts` step: if the client supplied
  // delegated-access credentials, encrypt the password into the
  // `client_credentials` vault BEFORE persisting the step. The plaintext
  // password is stripped from `data` so it never touches the JSONB
  // onboarding column. Per CLAUDE.md "Per-Client Docs + Credentials
  // Pattern" — passwords live exactly one place.
  let dataToSave = body.data as Record<string, unknown>;
  if (step === "accounts" && dataToSave) {
    const email =
      typeof dataToSave.delegated_email === "string"
        ? dataToSave.delegated_email.trim()
        : "";
    const username =
      typeof dataToSave.delegated_username === "string"
        ? dataToSave.delegated_username.trim()
        : "";
    const password =
      typeof dataToSave.delegated_password === "string"
        ? dataToSave.delegated_password
        : "";
    const credNotes =
      typeof dataToSave.delegated_notes === "string"
        ? dataToSave.delegated_notes.trim()
        : "";

    // Persist a credential row when we have ANY of email / username / password.
    // Empty password is OK — sometimes Ben just needs the login URL + email
    // and the client will provide the password by another channel.
    if (isSupabaseConfigured() && (email || username || password)) {
      try {
        const password_enc = password ? encryptCredential(password) : null;
        await supabase.from("client_credentials").insert({
          client_slug: slug,
          title: "Delegated account access (onboarding)",
          category: "delegated_access",
          username: email || username || null,
          password_enc,
          login_url: null,
          notes:
            credNotes ||
            "Captured from onboarding wizard — use for standing up Twilio / Google Ads / Meta / Calendly / SendGrid accounts during 30-day onboarding window.",
        });
      } catch (e) {
        // If the credentials write fails, fail the whole save — we don't
        // want a partial state where the form thinks it saved but Ben
        // can't find the password.
        return NextResponse.json(
          {
            ok: false,
            error: `Couldn't save delegated credentials: ${(e as Error).message}`,
          },
          { status: 500 },
        );
      }
    }

    // Strip plaintext password from the JSONB payload — keep the email +
    // username + notes (those are operational metadata Ben needs alongside
    // the rest of the accounts step). A `delegated_password_saved_at`
    // breadcrumb tells the wizard the password is on file.
    dataToSave = {
      ...dataToSave,
      delegated_password: undefined,
      delegated_password_saved_at: password ? new Date().toISOString() : null,
    };
    delete (dataToSave as Record<string, unknown>).delegated_password;
  }

  try {
    // The lib enforces shape downstream by typing; the API trusts the
    // wizard since both are first-party. Real validation lives in the
    // form components (required fields, etc.).
    const row = await saveStep(slug, {
      step,
      data: dataToSave,
    } as StepPayload);
    return NextResponse.json({ ok: true, row });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
