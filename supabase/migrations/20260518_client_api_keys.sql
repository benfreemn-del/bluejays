-- Client API keys — bearer-token auth for the public client-facing API.
--
-- The /api/v1/clients/[slug]/* endpoints let a client's own dev team
-- (or a Zapier trigger) pull leads / revenue / funnel data from their
-- BlueJays portal into their CRM/ERP/QuickBooks. Auth is a bearer token
-- generated per-key. We store only the SHA-256 hash; the plaintext is
-- shown once at creation time and never again.
--
-- Pattern: see CLAUDE.md "Public Client API + Zapier Trigger".

CREATE TABLE IF NOT EXISTS client_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  -- Human-friendly label so Ben can rotate / revoke meaningfully.
  -- e.g., "ITC ERP integration", "Tekky Shopify sync", "Zapier — leads".
  label TEXT NOT NULL,
  -- SHA-256 hex of the plaintext key. 64 chars.
  key_hash TEXT NOT NULL UNIQUE,
  -- First 8 chars of the plaintext, kept in cleartext so Ben can
  -- visually identify a key without revealing it. Helps "which key
  -- is in the ITC webhook?" debugging.
  key_prefix TEXT NOT NULL,
  -- Optional scope restriction. NULL = full read access to this slug.
  -- Future: per-resource scopes like ["leads:read", "revenue:read"].
  scopes JSONB NOT NULL DEFAULT '["read"]'::jsonb,
  last_used_at TIMESTAMPTZ,
  -- Soft-revoke: set revoked_at to disable without deleting the audit row.
  revoked_at TIMESTAMPTZ,
  created_by TEXT NOT NULL DEFAULT 'ben',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_api_keys_slug_idx
  ON client_api_keys (client_slug, revoked_at, created_at DESC);

-- Per-key usage tracking — one row per request. Used for rate-limiting
-- + debugging "did Zapier hit us this morning?". Auto-pruned weekly.
CREATE TABLE IF NOT EXISTS client_api_key_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID NOT NULL REFERENCES client_api_keys(id) ON DELETE CASCADE,
  client_slug TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_api_key_uses_key_at_idx
  ON client_api_key_uses (key_id, used_at DESC);

CREATE INDEX IF NOT EXISTS client_api_key_uses_slug_at_idx
  ON client_api_key_uses (client_slug, used_at DESC);
