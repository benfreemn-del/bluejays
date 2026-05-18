/**
 * Client API key helpers.
 *
 * Powers the bearer-token auth on /api/v1/clients/[slug]/*. The plaintext
 * key is generated server-side, returned ONCE at creation, and we only
 * store the SHA-256 hash + the first 8 chars (for visual identification).
 *
 * Migration: supabase/migrations/20260518_client_api_keys.sql
 */

import { createHash, randomBytes } from "crypto";
import { supabase, isSupabaseConfigured } from "./supabase";

const KEY_PREFIX = "bj_live_";

export type ApiKeyMeta = {
  id: string;
  client_slug: string;
  label: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_by: string;
  created_at: string;
};

export type ApiKeyCreated = ApiKeyMeta & {
  /** Plaintext token — show ONCE, never again. */
  key: string;
};

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export function generatePlaintextKey(): string {
  // 32 bytes of entropy → 44-char base64 → trimmed to 40 chars + prefix.
  const raw = randomBytes(32).toString("base64url").slice(0, 40);
  return `${KEY_PREFIX}${raw}`;
}

export async function createApiKey(input: {
  client_slug: string;
  label: string;
  scopes?: string[];
  created_by?: string;
}): Promise<ApiKeyCreated | null> {
  if (!isSupabaseConfigured()) return null;
  const plaintext = generatePlaintextKey();
  const key_hash = sha256(plaintext);
  const key_prefix = plaintext.slice(0, 16); // "bj_live_xxxxxxxx" — visible to admin
  const row = {
    client_slug: input.client_slug,
    label: input.label.trim(),
    key_hash,
    key_prefix,
    scopes: input.scopes ?? ["read"],
    created_by: input.created_by ?? "ben",
  };
  const { data, error } = await supabase
    .from("client_api_keys")
    .insert(row)
    .select("*")
    .single();
  if (error || !data) return null;
  return {
    ...(data as ApiKeyMeta),
    key: plaintext,
  };
}

export async function listApiKeys(client_slug: string): Promise<ApiKeyMeta[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("client_api_keys")
    .select(
      "id, client_slug, label, key_prefix, scopes, last_used_at, revoked_at, created_by, created_at",
    )
    .eq("client_slug", client_slug)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as ApiKeyMeta[];
}

export async function revokeApiKey(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from("client_api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

/**
 * Validates a bearer token against the keys table. Returns the matching
 * key row (with client_slug + scopes) or null. Stamps last_used_at on
 * successful auth + logs the request.
 */
export async function validateBearerToken(
  token: string,
  ctx: { endpoint: string },
): Promise<ApiKeyMeta | null> {
  if (!isSupabaseConfigured()) return null;
  if (!token || !token.startsWith(KEY_PREFIX)) return null;
  const key_hash = sha256(token);
  const { data, error } = await supabase
    .from("client_api_keys")
    .select("*")
    .eq("key_hash", key_hash)
    .is("revoked_at", null)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as ApiKeyMeta;

  // Fire-and-forget: bump last_used_at + insert audit row.
  void supabase
    .from("client_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id);
  void supabase.from("client_api_key_uses").insert({
    key_id: row.id,
    client_slug: row.client_slug,
    endpoint: ctx.endpoint,
    status_code: 200,
  });

  return row;
}

export function extractBearerFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7).trim();
  const url = new URL(req.url);
  const qp = url.searchParams.get("api_key");
  if (qp) return qp.trim();
  return null;
}
