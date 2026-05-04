-- ─────────────────────────────────────────────────────────────────────────────
-- Allow 'call' channel + manual logging on client_lead_messages.
--
-- Owners now log calls from the portal (in addition to receiving the
-- automatic email/SMS sends from the funnel runner). A "manual" provider
-- value distinguishes owner-logged touches from auto-sends so we can
-- credit each correctly in the weekly report.
--
-- Idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Drop and re-add the channel check to include 'call'.
do $$
begin
  alter table public.client_lead_messages
    drop constraint if exists client_lead_messages_channel_check;
  alter table public.client_lead_messages
    add constraint client_lead_messages_channel_check
    check (channel in ('email', 'sms', 'voicemail', 'call'));
exception when others then
  -- already added in some envs — ignore.
  null;
end;
$$;

-- 2) Owner-attribution column. NULL for system sends; FK for manual logs.
alter table public.client_lead_messages
  add column if not exists logged_by_owner_id uuid references public.client_owners(id);

-- 3) Index for "how many leads have we contacted" queries.
create index if not exists client_lead_messages_outbound_lead_idx
  on public.client_lead_messages (client_slug, lead_id)
  where direction = 'outbound' and status in ('sent', 'delivered', 'replied');
