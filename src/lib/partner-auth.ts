import crypto from "crypto";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { Partner } from "./partners";

/**
 * Partner workspace session (no Supabase Auth — too heavy for sister-team
 * scale). Stateless signed cookie:
 *   value = `${partnerId}.${expiresUnix}.${hmacSig}`
 * HMAC-SHA-256 over `${partnerId}.${expiresUnix}` with PARTNER_SESSION_SECRET.
 *
 * Cookie is httpOnly + Secure + SameSite=Lax. 30-day expiry by default.
 *
 * Login flow: partner enters email + 4-char access code Ben texted them
 * → API verifies match → mints cookie → redirect to /partners/work.
 *
 * Tighten later by swapping to email-magic-link via SendGrid before
 * opening to non-family partners.
 */
export const PARTNER_SESSION_COOKIE = "bj_partner_session";
const SESSION_DAYS = 30;

function getSecret(): string {
  return (
    process.env.PARTNER_SESSION_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "dev-only-rotate-me"
  );
}

export function signPartnerSession(partnerId: string, days = SESSION_DAYS): string {
  const expires = Math.floor(Date.now() / 1000) + days * 86400;
  const payload = `${partnerId}.${expires}`;
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex")
    .slice(0, 32);
  return `${payload}.${sig}`;
}

export function verifyPartnerSession(
  cookieValue: string | undefined,
): { partnerId: string } | null {
  if (!cookieValue) return null;
  const parts = cookieValue.split(".");
  if (parts.length !== 3) return null;
  const [partnerId, expiresStr, sig] = parts;
  const expires = parseInt(expiresStr, 10);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) {
    return null;
  }
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(`${partnerId}.${expires}`)
    .digest("hex")
    .slice(0, 32);
  // Constant-time compare to avoid timing side-channels
  try {
    if (
      sig.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return { partnerId };
}

/** Server-component / route-handler helper — pull the partner from
 *  the session cookie. Returns null if not logged in OR not approved. */
export async function getCurrentPartner(): Promise<Partner | null> {
  if (!isSupabaseConfigured()) return null;
  const store = await cookies();
  const raw = store.get(PARTNER_SESSION_COOKIE)?.value;
  const session = verifyPartnerSession(raw);
  if (!session) return null;
  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("id", session.partnerId)
    .maybeSingle();
  if (!data) return null;
  const p = data as unknown as Partner;
  if (p.status !== "approved") return null;
  return p;
}

/** Same as getCurrentPartner but for use in middleware / Edge contexts
 *  where cookies() isn't available — pulls from the request directly. */
export async function getCurrentPartnerFromRequest(
  req: NextRequest,
): Promise<Partner | null> {
  if (!isSupabaseConfigured()) return null;
  const raw = req.cookies.get(PARTNER_SESSION_COOKIE)?.value;
  const session = verifyPartnerSession(raw);
  if (!session) return null;
  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("id", session.partnerId)
    .maybeSingle();
  if (!data) return null;
  const p = data as unknown as Partner;
  if (p.status !== "approved") return null;
  return p;
}
