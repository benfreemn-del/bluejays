/**
 * Encrypt/decrypt helpers for the per-client credentials vault.
 *
 * Pattern: AES-256-GCM, key from CREDS_ENCRYPTION_KEY env var (32 bytes,
 * hex or base64 encoded). Each row gets a fresh 12-byte IV. Output
 * format: base64(iv) ":" base64(tag) ":" base64(cipher).
 *
 * Why GCM: authenticated encryption — tampering with the ciphertext is
 * detected during decrypt. Why this format: human-readable, plain ASCII,
 * fits in a TEXT column without escaping.
 *
 * Fallback: if CREDS_ENCRYPTION_KEY is unset (local dev only), the helpers
 * fall back to a deterministic dev-key with a "DEV:" prefix so it's
 * obvious in the DB that encryption isn't real. Production deploys MUST
 * have the env var set; the dev key is a guardrail against losing data,
 * not a security feature.
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALG = "aes-256-gcm" as const;
const IV_BYTES = 12;
const KEY_BYTES = 32;
const DEV_KEY_SOURCE = "bluejays-creds-dev-key-do-not-use-in-prod";

function getKey(): { key: Buffer; isDev: boolean } {
  const raw = (process.env.CREDS_ENCRYPTION_KEY ?? "").trim();
  if (raw) {
    let key: Buffer;
    if (/^[0-9a-fA-F]{64}$/.test(raw)) {
      key = Buffer.from(raw, "hex");
    } else {
      try {
        key = Buffer.from(raw, "base64");
      } catch {
        throw new Error(
          "CREDS_ENCRYPTION_KEY must be 32 bytes encoded as hex or base64",
        );
      }
    }
    if (key.length !== KEY_BYTES) {
      throw new Error(
        `CREDS_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes, got ${key.length}`,
      );
    }
    return { key, isDev: false };
  }
  // Dev fallback — deterministic SHA-256 of a constant. NOT secure.
  // Logged once at module load so it's obvious in prod logs if it ever fires.
  if (!loggedDevWarning) {
    console.warn(
      "[crypto-creds] CREDS_ENCRYPTION_KEY not set — using deterministic dev key. " +
        "Do NOT ship to production without setting the env var.",
    );
    loggedDevWarning = true;
  }
  return {
    key: createHash("sha256").update(DEV_KEY_SOURCE).digest(),
    isDev: true,
  };
}

let loggedDevWarning = false;

export function encryptCredential(plaintext: string): string {
  if (typeof plaintext !== "string") {
    throw new Error("encryptCredential expects a string");
  }
  const { key, isDev } = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALG, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  const payload = `${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
  return isDev ? `DEV:${payload}` : payload;
}

export function decryptCredential(payload: string): string {
  if (!payload) return "";
  const stripped = payload.startsWith("DEV:") ? payload.slice(4) : payload;
  const parts = stripped.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid credential ciphertext format");
  }
  const [ivB64, tagB64, cipherB64] = parts;
  const { key } = getKey();
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(cipherB64, "base64");
  if (iv.length !== IV_BYTES) {
    throw new Error("Invalid IV length on credential ciphertext");
  }
  const decipher = createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/**
 * Best-effort decrypt that returns null on failure (corrupt rows, key
 * rotation, etc) instead of throwing. Use in list views where one bad
 * row shouldn't break the whole page.
 */
export function tryDecryptCredential(payload: string | null): string | null {
  if (!payload) return null;
  try {
    return decryptCredential(payload);
  } catch (err) {
    console.error("[crypto-creds] decrypt failed:", err);
    return null;
  }
}
