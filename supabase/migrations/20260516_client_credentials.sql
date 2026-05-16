-- Per-client credentials vault (admin password manager).
--
-- Stores account credentials Ben tracks while operating client projects:
-- domain registrar logins, hosting, Google Workspace, Stripe, social
-- media, anything the client gave us OR we set up on their behalf.
--
-- Encryption: passwords stored AES-256-GCM encrypted at rest via the
-- app layer (see src/lib/crypto-creds.ts). The DB never sees plaintext;
-- a Supabase data leak alone wouldn't expose passwords.
--
-- Visibility: admin-only via /dashboard/clients/[slug]/docs. Later we
-- may expose a read-only view in the client's own portal Settings, but
-- that's a separate decision per client.

CREATE TABLE IF NOT EXISTS client_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  -- Display title — "Namecheap (tekky.org)", "Google Workspace admin", etc.
  title TEXT NOT NULL,
  -- What this credential is for. Free-form so we can tag by integration.
  category TEXT,
  -- Plaintext-OK username/email field (no encryption needed).
  username TEXT,
  -- Encrypted payload. Format: AES-256-GCM, base64(iv) ":" base64(tag) ":" base64(cipher).
  -- See src/lib/crypto-creds.ts for the encrypt/decrypt helpers.
  password_enc TEXT,
  -- URL to the login page (optional). Helps when Ben opens a session.
  login_url TEXT,
  -- Free-form notes — security questions, account ID, MFA backup codes.
  -- Stored plaintext intentionally; encrypt sensitive bits inline if needed.
  notes TEXT,
  -- Who created the row. "ben" or a sales/operator handle.
  created_by TEXT NOT NULL DEFAULT 'ben',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_credentials_slug_idx
  ON client_credentials (client_slug, created_at DESC);

-- Trigger to keep updated_at fresh on every UPDATE.
CREATE OR REPLACE FUNCTION client_credentials_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS client_credentials_touch_updated_at_trg
  ON client_credentials;
CREATE TRIGGER client_credentials_touch_updated_at_trg
BEFORE UPDATE ON client_credentials
FOR EACH ROW
EXECUTE FUNCTION client_credentials_touch_updated_at();
