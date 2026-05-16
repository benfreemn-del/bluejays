import { NextRequest, NextResponse } from "next/server";

import { encryptCredential } from "@/lib/crypto-creds";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * PATCH /api/clients/[slug]/credentials/[id]
 *   Update fields on an existing credential. Omitted fields are left
 *   unchanged. Pass `password: ""` to clear the password; omit it to
 *   leave the existing encrypted value alone.
 *
 * DELETE /api/clients/[slug]/credentials/[id]
 *   Permanently delete a credential row.
 *
 * Pattern: see CLAUDE.md "Per-Client Docs + Credentials Pattern".
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
): Promise<NextResponse> {
  const { slug, id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid credential id" },
      { status: 400 },
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string") {
    const v = body.title.trim();
    if (!v) {
      return NextResponse.json(
        { ok: false, error: "Title cannot be empty" },
        { status: 400 },
      );
    }
    patch.title = v;
  }
  if (typeof body.category === "string") {
    patch.category = body.category.trim() || null;
  }
  if (typeof body.username === "string") {
    patch.username = body.username.trim() || null;
  }
  if (typeof body.password === "string") {
    // Empty string explicitly clears the password.
    patch.password_enc = body.password
      ? encryptCredential(body.password)
      : null;
  }
  if (typeof body.login_url === "string") {
    patch.login_url = body.login_url.trim() || null;
  }
  if (typeof body.notes === "string") {
    patch.notes = body.notes.trim() || null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { ok: false, error: "No fields to update" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("client_credentials")
    .update(patch)
    .eq("id", id)
    .eq("client_slug", slug);
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
): Promise<NextResponse> {
  const { slug, id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid credential id" },
      { status: 400 },
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 503 },
    );
  }
  const { error } = await supabase
    .from("client_credentials")
    .delete()
    .eq("id", id)
    .eq("client_slug", slug);
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
