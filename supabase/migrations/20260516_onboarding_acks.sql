-- Onboarding acknowledgments — client sign-offs from /sign/[slug]/[doc].
--
-- Every shareable client doc (welcome packet, brand voice, etc.) has a
-- companion web form at /sign/[slug]/[doc]. When a client submits, we
-- insert a row here AND fire sendOwnerAlert() so Ben gets SMS + email.
--
-- Source-of-truth pattern: see CLAUDE.md "Shareable Client Doc Pattern".

CREATE TABLE IF NOT EXISTS onboarding_acks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  doc_key TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signer_role TEXT,
  replies JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS onboarding_acks_slug_doc_idx
  ON onboarding_acks (client_slug, doc_key, signed_at DESC);

CREATE INDEX IF NOT EXISTS onboarding_acks_signed_at_idx
  ON onboarding_acks (signed_at DESC);
