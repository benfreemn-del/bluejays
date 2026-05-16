import { NextRequest, NextResponse } from "next/server";

import {
  encryptCredential,
  tryDecryptCredential,
} from "@/lib/crypto-creds";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/clients/[slug]/credentials
 *   List all credentials for a client. Admin-only (gated by middleware
 *   on /api/clients/* — see PROTECTED_PATHS in src/middleware.ts).
 *
 * POST /api/clients/[slug]/credentials
 *   Create a new credential. Body: { title, username?, password?,
 *   category?, login_url?, notes? }.
 *
 * Pattern: see CLAUDE.md "Per-Client Docs + Credentials Pattern".
 */

type Row = {
  id: string;
  client_slug: string;
  title: string;
  category: string | null;
  username: string | null;
  password_enc: string | null;
  login_url: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type DecryptedCredential = {
  id: string;
  title: string;
  category: string | null;
  username: string | null;
  password: string | null;
  password_present: boolean;
  login_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function rowToOut(row: Row): DecryptedCredential {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    username: row.username,
    password: tryDecryptCredential(row.password_enc),
    password_present: !!row.password_enc,
    login_url: row.login_url,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, credentials: [] });
  }
  const { data, error } = await supabase
    .from("client_credentials")
    .select("*")
    .eq("client_slug", slug)
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  const credentials = (data ?? []).map((r) => rowToOut(r as Row));
  return NextResponse.json({ ok: true, credentials });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
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

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json(
      { ok: false, error: "Title is required" },
      { status: 400 },
    );
  }

  const username =
    typeof body.username === "string" ? body.username.trim() || null : null;
  const passwordPlain =
    typeof body.password === "string" ? body.password : "";
  const password_enc = passwordPlain ? encryptCredential(passwordPlain) : null;
  const category =
    typeof body.category === "string" ? body.category.trim() || null : null;
  const login_url =
    typeof body.login_url === "string"
      ? body.login_url.trim() || null
      : null;
  const notes =
    typeof body.notes === "string" ? body.notes.trim() || null : null;

  const { data, error } = await supabase
    .from("client_credentials")
    .insert({
      client_slug: slug,
      title,
      category,
      username,
      password_enc,
      login_url,
      notes,
    })
    .select("*")
    .single();
  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? "Insert failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({
    ok: true,
    credential: rowToOut(data as Row),
  });
}
