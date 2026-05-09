/**
 * ad-oauth.ts — OAuth handshake helpers for ad-platform connections
 * (Google Ads, Meta Ads, Lob).
 *
 * Architecture:
 *   1. Owner clicks Connect on their Ads tab → frontend calls
 *      `getAuthUrl(slug, platform)` → redirects to platform OAuth.
 *   2. Platform redirects back to /api/oauth/{platform}/callback?code=...&state=slug.
 *   3. Callback exchanges code → refresh_token, encrypts, stores in
 *      client_ad_accounts row, marks status='active'.
 *   4. Per-API helpers call `getAccessToken(slug, platform)` which
 *      decrypts the refresh token + exchanges for a fresh access
 *      token (with TTL caching to avoid re-fetching every call).
 *
 * Security:
 *   · Refresh tokens encrypted at rest via pgcrypto pgp_sym_encrypt
 *     using AD_OAUTH_KEY env var (32-byte secret, set in Vercel).
 *   · Access tokens live in memory only (Redis cache once we add KV).
 *   · State parameter on auth-redirect carries slug + signed nonce
 *     to prevent CSRF — verified on callback.
 *
 * Env-var contract per platform:
 *   GOOGLE_ADS_CLIENT_ID + GOOGLE_ADS_CLIENT_SECRET
 *   META_ADS_APP_ID + META_ADS_APP_SECRET
 *   LOB_API_KEY (no OAuth — direct API key model)
 *   AD_OAUTH_KEY (encryption key — 32 bytes)
 *   NEXT_PUBLIC_SITE_URL (callback redirect URL base)
 */

import { createHmac, randomBytes } from "crypto";
import { supabase, isSupabaseConfigured } from "./supabase";

export type AdPlatformOAuth = "google_ads" | "meta_ads" | "lob";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bluejayportfolio.com";

const STATE_SECRET =
  process.env.AD_OAUTH_KEY ||
  process.env.NEXTAUTH_SECRET ||
  "bluejays-oauth-default-secret-rotate-me";

/* ─────────── PROVISIONING STATUS ─────────── */

export type ProvisioningStatus = {
  platform: AdPlatformOAuth;
  /** Are the env vars present so OAuth CAN happen? */
  configured: boolean;
  missingEnvVars: string[];
  /** Steps Ben must do in the platform console before owners can connect */
  setupSteps: string[];
};

export function getProvisioningStatus(
  platform: AdPlatformOAuth,
): ProvisioningStatus {
  switch (platform) {
    case "google_ads": {
      const missing: string[] = [];
      if (!process.env.GOOGLE_ADS_CLIENT_ID) missing.push("GOOGLE_ADS_CLIENT_ID");
      if (!process.env.GOOGLE_ADS_CLIENT_SECRET)
        missing.push("GOOGLE_ADS_CLIENT_SECRET");
      return {
        platform,
        configured: missing.length === 0,
        missingEnvVars: missing,
        setupSteps: [
          "Create OAuth 2.0 client in Google Cloud Console (Web app type)",
          `Add redirect URI: ${SITE_URL}/api/oauth/google_ads/callback`,
          "Copy Client ID + Secret into Vercel env (GOOGLE_ADS_CLIENT_ID + GOOGLE_ADS_CLIENT_SECRET)",
          "Apply for Google Ads API developer token (separate process, takes ~3 days)",
          "Set GOOGLE_ADS_DEVELOPER_TOKEN in Vercel env once approved",
        ],
      };
    }
    case "meta_ads": {
      const missing: string[] = [];
      if (!process.env.META_ADS_APP_ID) missing.push("META_ADS_APP_ID");
      if (!process.env.META_ADS_APP_SECRET) missing.push("META_ADS_APP_SECRET");
      return {
        platform,
        configured: missing.length === 0,
        missingEnvVars: missing,
        setupSteps: [
          "Create app at developers.facebook.com → Apps → Create App (Business type)",
          "Add Marketing API product to the app",
          `Add OAuth redirect URI: ${SITE_URL}/api/oauth/meta_ads/callback`,
          "Copy App ID + Secret into Vercel env (META_ADS_APP_ID + META_ADS_APP_SECRET)",
          "Submit app for review with ads_read + ads_management scopes (~1 week)",
        ],
      };
    }
    case "lob":
      return {
        platform,
        configured: !!process.env.LOB_API_KEY,
        missingEnvVars: process.env.LOB_API_KEY ? [] : ["LOB_API_KEY"],
        setupSteps: [
          "Sign up at lob.com → Account Settings → API Keys",
          "Create a Live Production key (Test keys won't actually mail)",
          "Set LOB_API_KEY in Vercel env",
          "No per-tenant OAuth — single API key handles all sends",
        ],
      };
  }
}

/* ─────────── AUTH URL ─────────── */

/** Sign a nonce so the OAuth callback can verify the state parameter
 *  came from us + carries the right slug — basic CSRF protection. */
function signState(slug: string, nonce: string): string {
  const sig = createHmac("sha256", STATE_SECRET)
    .update(`${slug}:${nonce}`)
    .digest("hex")
    .slice(0, 16);
  return `${slug}.${nonce}.${sig}`;
}

export function verifyState(
  state: string,
): { ok: true; slug: string } | { ok: false; error: string } {
  const parts = state.split(".");
  if (parts.length !== 3) return { ok: false, error: "malformed state" };
  const [slug, nonce, sig] = parts;
  const expected = createHmac("sha256", STATE_SECRET)
    .update(`${slug}:${nonce}`)
    .digest("hex")
    .slice(0, 16);
  if (sig !== expected) return { ok: false, error: "state signature mismatch" };
  if (!/^[a-z0-9-]{1,60}$/i.test(slug))
    return { ok: false, error: "invalid slug in state" };
  return { ok: true, slug };
}

export function getAuthUrl(
  slug: string,
  platform: AdPlatformOAuth,
): { ok: true; url: string } | { ok: false; error: string } {
  const status = getProvisioningStatus(platform);
  if (!status.configured) {
    return {
      ok: false,
      error: `${platform} not provisioned. Missing env vars: ${status.missingEnvVars.join(", ")}`,
    };
  }
  const state = signState(slug, randomBytes(16).toString("hex"));
  const callback = `${SITE_URL}/api/oauth/${platform}/callback`;

  if (platform === "google_ads") {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", process.env.GOOGLE_ADS_CLIENT_ID!);
    url.searchParams.set("redirect_uri", callback);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "https://www.googleapis.com/auth/adwords");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("state", state);
    return { ok: true, url: url.toString() };
  }

  if (platform === "meta_ads") {
    const url = new URL("https://www.facebook.com/v18.0/dialog/oauth");
    url.searchParams.set("client_id", process.env.META_ADS_APP_ID!);
    url.searchParams.set("redirect_uri", callback);
    url.searchParams.set("scope", "ads_read,ads_management");
    url.searchParams.set("state", state);
    return { ok: true, url: url.toString() };
  }

  if (platform === "lob") {
    return {
      ok: false,
      error:
        "Lob uses a single API key, not OAuth. Set LOB_API_KEY in Vercel env — already accessible to all tenants.",
    };
  }

  return { ok: false, error: `unknown platform: ${platform}` };
}

/* ─────────── TOKEN STORAGE (encrypted via pgcrypto) ─────────── */

const ENCRYPTION_KEY = process.env.AD_OAUTH_KEY || "";

/** Store a refresh token in client_ad_accounts. Encrypted at rest via
 *  pgcrypto pgp_sym_encrypt — no plaintext refresh tokens ever live
 *  in our DB rows. */
export async function storeRefreshToken(args: {
  clientSlug: string;
  platform: AdPlatformOAuth;
  refreshToken: string;
  externalAccountId: string;
  externalAccountName?: string;
  scopes: string[];
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "supabase not configured" };
  }
  if (!ENCRYPTION_KEY) {
    return { ok: false, error: "AD_OAUTH_KEY env var not set" };
  }
  // pgcrypto handles the encryption inline; the row stores bytea.
  // Run via raw SQL since supabase-js doesn't expose pgp_sym_encrypt.
  const { error } = await supabase.rpc("ad_account_upsert_token", {
    p_client_slug: args.clientSlug,
    p_platform: args.platform,
    p_refresh_token: args.refreshToken,
    p_external_account_id: args.externalAccountId,
    p_external_account_name: args.externalAccountName ?? null,
    p_scopes: args.scopes,
    p_encryption_key: ENCRYPTION_KEY,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Decrypt + return the refresh token for a tenant + platform. Used
 *  by the per-platform refresh helpers (getAccessToken). Returns null
 *  if no row exists or status isn't active. */
export async function getRefreshToken(
  clientSlug: string,
  platform: AdPlatformOAuth,
): Promise<string | null> {
  if (!isSupabaseConfigured() || !ENCRYPTION_KEY) return null;
  const { data, error } = await supabase.rpc("ad_account_get_token", {
    p_client_slug: clientSlug,
    p_platform: platform,
    p_encryption_key: ENCRYPTION_KEY,
  });
  if (error || !data) return null;
  return data as string;
}

/** List a tenant's connected ad accounts (without the encrypted token). */
export type ClientAdAccount = {
  id: string;
  platform: AdPlatformOAuth;
  external_account_id: string;
  external_account_name: string | null;
  status: string;
  last_used_at: string | null;
  last_refreshed_at: string | null;
  consecutive_failures: number;
  last_error: string | null;
};

export async function listAdAccounts(
  clientSlug: string,
): Promise<ClientAdAccount[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from("client_ad_accounts")
    .select(
      "id, platform, external_account_id, external_account_name, status, last_used_at, last_refreshed_at, consecutive_failures, last_error",
    )
    .eq("client_slug", clientSlug);
  return (data ?? []) as ClientAdAccount[];
}
