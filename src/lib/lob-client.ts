import { getRefreshToken } from "./ad-oauth";

/**
 * lob-client — resolve the Lob API key to use for a given client.
 *
 * Per the audit (chat-7 follow-up #4): tenants who pasted their own
 * Lob secret in /clients/[slug]/portal Ads tab → ConnectStrip → Lob
 * panel get billed on their own Lob account. Tenants who typed the
 * `use_bluejays_master` sentinel (or never set a key) fall back to
 * the master LOB_API_KEY env var so postcards still go out at-cost.
 *
 * Storage: the customer-supplied key lives in
 * `client_ad_accounts.refresh_token_encrypted` (pgp_sym_encrypted)
 * with platform='lob'. Decryption uses the same AD_OAUTH_KEY env var
 * as the OAuth-token flow.
 *
 * Usage in postcard senders:
 *   const apiKey = await getLobKeyForClient("zenith-sports");
 *   if (!apiKey) return { sent: false, skipped: "no_lob_key" };
 *   // ... use apiKey in Basic auth header ...
 */

const MASTER_SENTINEL = "use_bluejays_master";

export async function getLobKeyForClient(
  clientSlug: string | null | undefined,
): Promise<string | null> {
  const masterKey = process.env.LOB_API_KEY ?? null;

  // No tenant specified → always master.
  if (!clientSlug) return masterKey;

  const tenantKey = await getRefreshToken(clientSlug, "lob");

  // Tenant explicitly chose to bill through BlueJays' account.
  if (tenantKey === MASTER_SENTINEL) return masterKey;

  // Tenant supplied their own live_/test_ key.
  if (tenantKey && (tenantKey.startsWith("live_") || tenantKey.startsWith("test_"))) {
    return tenantKey;
  }

  // No tenant row → default to master.
  return masterKey;
}

/**
 * Returns a human-readable hint of which key path was taken, for
 * dashboard / debug logging. Doesn't return the key itself.
 */
export async function describeLobKeySource(
  clientSlug: string | null | undefined,
): Promise<"master_env" | "tenant_master_sentinel" | "tenant_own_key" | "none"> {
  if (!clientSlug) return process.env.LOB_API_KEY ? "master_env" : "none";
  const tenantKey = await getRefreshToken(clientSlug, "lob");
  if (tenantKey === MASTER_SENTINEL) return "tenant_master_sentinel";
  if (tenantKey && (tenantKey.startsWith("live_") || tenantKey.startsWith("test_"))) {
    return "tenant_own_key";
  }
  return process.env.LOB_API_KEY ? "master_env" : "none";
}
