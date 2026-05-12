import { createHash } from "crypto";
import { getSupabase } from "./supabase";

/**
 * bluejays-auth — BlueJays-internal staff identity.
 *
 * Sister lib to client-auth.ts but for the operator side (Ben + sales
 * reps) rather than the per-client portal owners. Backed by the
 * bluejays_users table.
 *
 * Auth model:
 *   · Password hash = sha256(plain || PORTAL_PASSWORD_SALT) — same as
 *     client_owners. Single-round sha is acceptable for this low-traffic
 *     surface; swap to bcrypt when staff > 10 if we ever get there.
 *   · The /api/auth/login route, when an email+password match a row,
 *     ALSO sets the legacy `bluejays_auth` cookie value that middleware
 *     expects — so middleware doesn't need a DB round-trip on every
 *     request (cheap edge gate). User identity rides in `bj_user_id`
 *     cookie + `bj_role` cookie, both server-side authoritative.
 */

const PORTAL_SALT = process.env.PORTAL_PASSWORD_SALT || "bluejays-portal-salt-v1";

export type BluejaysRole = "owner" | "sales";

export interface BluejaysUser {
  id: string;
  email: string;
  name: string;
  role: BluejaysRole;
  active: boolean;
  password_hash: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export function sha256Password(plain: string): string {
  return createHash("sha256")
    .update(plain + PORTAL_SALT)
    .digest("hex");
}

export async function getUserById(id: string): Promise<BluejaysUser | null> {
  const { data, error } = await getSupabase()
    .from("bluejays_users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return (data as BluejaysUser) ?? null;
}

export async function getUserByEmail(email: string): Promise<BluejaysUser | null> {
  const { data, error } = await getSupabase()
    .from("bluejays_users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) return null;
  return (data as BluejaysUser) ?? null;
}

/**
 * Verify email+password. Returns the user row on success, null on
 * failure. Also marks last_login_at. Treats inactive users as
 * failed-auth.
 */
export async function authenticateByEmail(
  email: string,
  password: string,
): Promise<BluejaysUser | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.active || !user.password_hash) return null;
  if (user.password_hash !== sha256Password(password)) return null;
  // Best-effort timestamp; don't fail login if this errors.
  await getSupabase()
    .from("bluejays_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);
  return user;
}

export async function listUsers(): Promise<BluejaysUser[]> {
  const { data, error } = await getSupabase()
    .from("bluejays_users")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as BluejaysUser[];
}

export async function createUser(input: {
  email: string;
  name: string;
  role: BluejaysRole;
  password?: string;
}): Promise<BluejaysUser> {
  const payload: Partial<BluejaysUser> = {
    email: input.email.toLowerCase().trim(),
    name: input.name.trim(),
    role: input.role,
    active: true,
    password_hash: input.password ? sha256Password(input.password) : null,
  };
  const { data, error } = await getSupabase()
    .from("bluejays_users")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as BluejaysUser;
}

/**
 * Server-side: resolve the logged-in operator from a Next.js request
 * cookie store. Reads `bj_user_id` + `bj_role`. Returns null when the
 * caller is on the legacy env-password flow (no DB user identity).
 *
 * Use in API route handlers that need to filter by current user
 * (e.g. /api/prospects scoped to assigned_to_user_id).
 */
export async function currentUserFromCookies(cookies: {
  get(name: string): { value: string } | undefined;
}): Promise<BluejaysUser | null> {
  const id = cookies.get("bj_user_id")?.value;
  if (!id) return null;
  return getUserById(id);
}

export async function updateUser(
  id: string,
  patch: { name?: string; role?: BluejaysRole; active?: boolean; password?: string },
): Promise<BluejaysUser> {
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name.trim();
  if (patch.role !== undefined) update.role = patch.role;
  if (patch.active !== undefined) update.active = patch.active;
  if (patch.password !== undefined && patch.password.length > 0) {
    update.password_hash = sha256Password(patch.password);
  }
  const { data, error } = await getSupabase()
    .from("bluejays_users")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as BluejaysUser;
}
