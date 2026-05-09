-- ─────────────────────────────────────────────────────────────────────────────
-- agent_signals retention indexes (audit strategic-item: retention policy).
--
-- The weekly /api/cron/agent-signals-prune sweep filters by:
--   · created_at < now() - interval (range scan)
--   · read_at IS NULL / NOT NULL (existence)
--   · severity = 'urgent' / != 'urgent' (equality)
--
-- A bare created_at index covers the dominant range-scan case. A partial
-- on (created_at) WHERE read_at IS NULL keeps the unread-prune path
-- fast as the table grows.
--
-- Retention thresholds (lib/agent-signals.ts):
--   · acked signals       → 90 days
--   · unread non-urgent   → 180 days
--   · unread urgent       → never (surfaced via fresh daily-digest signal)
-- ─────────────────────────────────────────────────────────────────────────────

create index if not exists idx_agent_signals_created_at
  on public.agent_signals(created_at);

create index if not exists idx_agent_signals_unread_created
  on public.agent_signals(created_at)
  where read_at is null;
