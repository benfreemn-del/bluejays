-- ─────────────────────────────────────────────────────────────────────────────
-- 20260508 — agent_signals event bus
--
-- Single-table backbone for inter-bot handoffs across the BlueJays system.
-- Any agent (watchdog, AI responder, voice agent, hyperloop, etc.) emits a
-- row when something happens that another agent might want to act on.
-- Subscribers tail the table on their own cadence (cron) instead of every
-- emitter calling every consumer directly — keeps the architecture
-- composable as we add more bots.
--
-- Examples:
--   · customer-watchdog detects spending drop on client X
--     → inserts ('customer-watchdog', 'anomaly', client_slug=X, ...)
--   · /api/digest reads where read_at IS NULL AND severity IN (...)
--     → marks them read after rendering them in the morning SMS
--   · ai-responder classifies intent='interested'
--     → inserts ('ai-responder', 'intent', ...)
--   · sales-setter cron tails for intent='interested' to outbound dial
--
-- Severity convention (from /optimize-costs cost-leak skill):
--   info     — informational, OK to silently log
--   notice   — worth surfacing in the next digest, not urgent
--   warn     — surface in the next digest with attention
--   urgent   — escalate immediately (out-of-band SMS), don't wait for digest
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.agent_signals (
  id uuid primary key default gen_random_uuid(),

  -- Who emitted the signal
  source text not null,             -- e.g. 'customer-watchdog', 'ai-responder'

  -- What happened
  kind text not null,               -- e.g. 'anomaly', 'intent', 'handoff', 'completion'
  severity text not null default 'info'
    check (severity in ('info', 'notice', 'warn', 'urgent')),

  -- Optional scoping
  client_slug text,                 -- nullable — global signals don't have one
  prospect_id text,                 -- nullable — links to prospects.id when relevant

  -- Human-readable summary + structured payload
  title text not null,              -- one-line: 'Client X: spend dropped 60%'
  detail text,                      -- multi-line context for digest rendering
  metadata jsonb not null default '{}',

  -- Lifecycle
  created_at timestamptz not null default now(),
  read_at timestamptz,              -- when a downstream consumer acked it
  read_by text,                     -- which consumer (e.g. 'daily-digest')

  -- Optional handoff target (for kind='handoff' rows)
  target text                       -- which bot id should pick this up
);

-- Index the hot path: digest tails recent unread rows by severity.
create index if not exists agent_signals_unread_idx
  on public.agent_signals (read_at, severity, created_at desc)
  where read_at is null;

create index if not exists agent_signals_source_idx
  on public.agent_signals (source, created_at desc);

create index if not exists agent_signals_client_idx
  on public.agent_signals (client_slug, created_at desc)
  where client_slug is not null;

-- 30-day retention. Old read signals get cleaned up automatically.
-- Unread signals stay forever so we don't lose anomalies that fire
-- on a Friday and need triage Monday.
create or replace function public.agent_signals_prune()
returns void
language sql
as $$
  delete from public.agent_signals
  where read_at is not null
    and read_at < now() - interval '30 days';
$$;
