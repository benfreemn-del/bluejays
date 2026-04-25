-- Domain renewal paused state — adds the `renewal_paused` value to
-- the `domains.status` lifecycle.
--
-- Lifecycle (after this migration):
--   pending          — row inserted, registrar API call not yet made
--   registered       — registrar confirmed; expires_at known; auto-renews
--   renewal_paused   — registrar would have auto-renewed by now BUT the
--                      customer's Stripe mgmt subscription is in `past_due`
--                      (card on file failed). The renewal cron skips paying
--                      $11 to the registrar and triggers dunning instead. We
--                      do NOT pay the registrar before the customer pays us.
--                      Auto-recovers to `registered` via the manual retry
--                      endpoint after the operator confirms the customer
--                      updated their card.
--   failed           — registrar call returned an error; see last_error
--   expired          — domain past expires_at and we did not renew
--   cancelled        — Ben manually released the domain OR the customer
--                      cancelled the Stripe sub (different from past_due)
--
-- Why no DB-level CHECK constraint? The original table at 20260424_domains.sql
-- declared status as a free TEXT column (no CHECK), so this migration only
-- needs to document the new enum value at the application layer. If a CHECK
-- constraint is added later, this migration is the place to extend it.
--
-- The renewal cron lives at /api/billing/check-domain-renewals (daily 18:00
-- UTC). See CLAUDE.md "Domain Registration System" → "Renewal alignment with
-- Stripe" for the full order-of-operations spec.

-- No structural change required — `status` is TEXT and accepts the new value
-- as-is. Comment block is the migration's deliverable so future operators
-- can `\d domains` and read the lifecycle inline.
COMMENT ON COLUMN domains.status IS
  'Domain lifecycle: pending | registered | renewal_paused | failed | expired | cancelled. renewal_paused = registrar auto-renewal skipped because the customer''s Stripe sub is past_due. Auto-recovers via /api/domains/[id]/retry-renewal once the customer updates their card. See CLAUDE.md "Domain Registration System".';

-- Index helps the renewal cron quickly find domains parked in renewal_paused
-- (so we can re-attempt after dunning emails go out) without scanning the
-- whole status='registered' set.
CREATE INDEX IF NOT EXISTS idx_domains_renewal_paused ON domains(next_renewal_at)
  WHERE status = 'renewal_paused';
