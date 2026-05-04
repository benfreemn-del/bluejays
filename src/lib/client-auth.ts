/**
 * client-auth — per-client portal authentication.
 *
 * Distinct from src/lib/auth.ts (admin) and from /client/[id] customer-
 * portal (URL-as-secret). This is for AI Package clients (Zenith, etc.)
 * to log into their own dashboards at /clients/[slug]/portal.
 *
 * Cookie name: `client-portal-session`
 * Cookie value: `{owner_id}.{sha256(owner_id + password_hash + portal_salt)}`
 *   - Decoding owner_id from the cookie gives us O(1) lookup
 *   - The signature uses the owner's password_hash, so changing pw
 *     instantly invalidates THAT user's cookies (others unaffected)
 *   - portal_salt is the env constant that prevents cookie-forgery
 *     even if an attacker knows owner_id + password_hash
 */

import { createHash } from "crypto";
import { getSupabase } from "./supabase";

const PORTAL_SALT = process.env.CLIENT_PORTAL_SALT || "bluejays-portal-2026-default-salt";
const COOKIE_NAME = "client-portal-session";

export type ClientOwner = {
  id: string;
  client_slug: string;
  email: string;
  name: string | null;
  password_hash: string;
  role: "owner" | "manager" | "viewer";
  last_login_at: string | null;
  last_login_ip: string | null;
  failed_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
};

/* ─────────────────────────── HASHING ─────────────────────────── */

export function sha256Password(plain: string): string {
  return createHash("sha256")
    .update(plain + PORTAL_SALT)
    .digest("hex");
}

function signOwnerCookie(owner: Pick<ClientOwner, "id" | "password_hash">): string {
  const sig = createHash("sha256")
    .update(owner.id + owner.password_hash + PORTAL_SALT)
    .digest("hex");
  return `${owner.id}.${sig}`;
}

/* ─────────────────────────── DB OPS ─────────────────────────── */

export async function getOwnerByEmail(
  email: string,
): Promise<ClientOwner | null> {
  const { data, error } = await getSupabase()
    .from("client_owners")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) throw new Error(`getOwnerByEmail: ${error.message}`);
  return (data as ClientOwner | null) ?? null;
}

export async function getOwnerById(id: string): Promise<ClientOwner | null> {
  const { data, error } = await getSupabase()
    .from("client_owners")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getOwnerById: ${error.message}`);
  return (data as ClientOwner | null) ?? null;
}

/**
 * Validate credentials. Returns the owner record on success, null on
 * mismatch. Implements brute-force lockout: 5 failed attempts within
 * 15 min → locked for 15 min.
 */
export async function authenticateOwner(
  email: string,
  password: string,
  ip: string,
): Promise<{ ok: true; owner: ClientOwner } | { ok: false; reason: string }> {
  const owner = await getOwnerByEmail(email);
  if (!owner) {
    return { ok: false, reason: "Invalid email or password" };
  }
  if (owner.locked_until && new Date(owner.locked_until) > new Date()) {
    return {
      ok: false,
      reason: "Account temporarily locked. Try again in a few minutes.",
    };
  }
  const expected = sha256Password(password);
  if (expected !== owner.password_hash) {
    // Increment failed attempts; lock if >= 5 within 15 min.
    const next = owner.failed_attempts + 1;
    const lockUntil =
      next >= 5 ? new Date(Date.now() + 15 * 60_000).toISOString() : null;
    await getSupabase()
      .from("client_owners")
      .update({ failed_attempts: next, locked_until: lockUntil })
      .eq("id", owner.id);
    return { ok: false, reason: "Invalid email or password" };
  }
  // Success — reset attempts, stamp last login.
  await getSupabase()
    .from("client_owners")
    .update({
      failed_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
      last_login_ip: ip,
    })
    .eq("id", owner.id);
  return { ok: true, owner };
}

/* ─────────────────────────── COOKIES ─────────────────────────── */

export function makeSessionCookie(owner: ClientOwner): {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge: number;
  };
} {
  return {
    name: COOKIE_NAME,
    value: signOwnerCookie(owner),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
  };
}

export function clearSessionCookie(): {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge: number;
  };
} {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    },
  };
}

/**
 * Resolve a session cookie to an owner. Verifies the signature against
 * the owner's current password_hash (so cookie auto-invalidates on
 * password change). Returns null if cookie is missing, malformed, or
 * signature doesn't match.
 */
export async function ownerFromCookie(
  cookieValue: string | undefined,
): Promise<ClientOwner | null> {
  if (!cookieValue) return null;
  const dot = cookieValue.indexOf(".");
  if (dot < 0) return null;
  const ownerId = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  if (!ownerId || !sig) return null;

  const owner = await getOwnerById(ownerId);
  if (!owner) return null;

  const expected = createHash("sha256")
    .update(owner.id + owner.password_hash + PORTAL_SALT)
    .digest("hex");
  if (expected !== sig) return null;
  return owner;
}

export const CLIENT_PORTAL_COOKIE = COOKIE_NAME;
