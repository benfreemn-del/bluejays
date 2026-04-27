-- 3-CTA hub fork-click tracking (review item #8).
-- Logs which of the 3 forks (Buy / Schedule / Get Preview) each
-- prospect clicks on the audit page. Currently we fire the same
-- pixel `Lead` event regardless of fork, so we can't tell which
-- intent path is winning.
--
-- One row per click. NOT deduplicated — multiple clicks per
-- prospect are interesting (revisits, indecision). The funnel-
-- conversion endpoint groups by audit_id to compute fork-level CR.

CREATE TABLE IF NOT EXISTS cta_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The audit row this click is attached to. Required — clicks always
  -- happen on /audit/[id].
  audit_id UUID NOT NULL REFERENCES site_audits(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  -- Which fork was clicked. Frontend sends one of these strings.
  fork TEXT NOT NULL CHECK (fork IN ('buy', 'schedule', 'preview')),
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Optional UTM tracking carried over from the audit submission +
  -- referrer header for ad-attribution debugging.
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS cta_clicks_audit_id_idx ON cta_clicks (audit_id);
CREATE INDEX IF NOT EXISTS cta_clicks_clicked_at_idx ON cta_clicks (clicked_at DESC);
CREATE INDEX IF NOT EXISTS cta_clicks_fork_idx ON cta_clicks (fork);
