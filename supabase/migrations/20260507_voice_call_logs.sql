-- Inbound voice-call logs · supports the AI receptionist (Batch 14).
--
-- One row per inbound call. Subsequent turns within the same call
-- append to the transcript jsonb array. After call completion, the
-- intent + booking_link_sent flags let Ben see at a glance whether
-- the AI handled the conversation cleanly.
--
-- Idempotent. Safe to re-run.

create table if not exists public.voice_call_logs (
  id uuid primary key default gen_random_uuid(),

  -- Twilio identifiers (CallSid persists across the whole call,
  -- including all <Gather> turns).
  twilio_call_sid text unique not null,
  from_number text,
  to_number text,

  -- Conversation transcript — array of {role: 'caller'|'ai', text, t}
  -- objects appended to on each turn.
  transcript jsonb not null default '[]'::jsonb,

  -- Final intent classification once the call wraps. One of:
  --   'book-demo' · 'pricing-question' · 'support' ·
  --   'voicemail' · 'wrong-number' · 'unclear' · 'human-transfer'
  intent text,

  -- Action artifacts.
  booking_link_sent boolean not null default false,
  voicemail_url text,

  -- Lifecycle.
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_turns int not null default 0
);

create index if not exists voice_call_logs_started_idx
  on public.voice_call_logs (started_at desc);
create index if not exists voice_call_logs_intent_idx
  on public.voice_call_logs (intent)
  where intent is not null;
