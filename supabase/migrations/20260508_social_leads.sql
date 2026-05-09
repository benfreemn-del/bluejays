-- ─────────────────────────────────────────────────────────────────────────────
-- 20260508 — social_leads (SMS-captured social outreach pipeline)
--
-- Ben sees relevant FB/X/LinkedIn posts on his phone all day. This table
-- backs the SMS-first capture flow: he texts the post URL to his Twilio
-- number, /api/inbound/sms routes to social-leads.captureSocialLead(),
-- Claude classifies + drafts a 2-line opener in his voice, and SMS's it
-- back. Row lands here with status='drafted'.
--
-- Status lifecycle:
--   drafted → sent → replied → closed-won | closed-lost | closed-no-response
--
-- /dashboard/social-leads is the review surface — copy the draft, mark
-- sent/replied/closed. agent_signals is pinged on every capture so the
-- daily digest surfaces outstanding drafts.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.social_leads (
  id uuid primary key default gen_random_uuid(),

  platform text not null default 'facebook',
  post_url text,
  raw_text text not null,

  author_name text,
  author_handle text,
  author_business text,
  author_role text,

  intent text,
  intent_confidence numeric(3,2),
  classification_summary text,

  drafted_message text,
  drafted_at timestamptz,

  status text not null default 'drafted'
    check (status in ('drafted', 'sent', 'replied', 'closed-won', 'closed-lost', 'closed-no-response')),
  sent_at timestamptz,
  replied_at timestamptz,
  closed_at timestamptz,

  prospect_id text,

  captured_via text not null default 'sms',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_leads_status_idx
  on public.social_leads (status, created_at desc);

create index if not exists social_leads_intent_idx
  on public.social_leads (intent, created_at desc)
  where intent is not null;

create or replace function public.social_leads_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists social_leads_touch on public.social_leads;
create trigger social_leads_touch
  before update on public.social_leads
  for each row execute function public.social_leads_touch_updated_at();
