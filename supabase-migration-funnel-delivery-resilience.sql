begin;

create table if not exists public.channel_health (
  channel text primary key check (channel in ('email', 'sms')),
  status text not null default 'healthy' check (status in ('healthy', 'degraded')),
  consecutive_failures integer not null default 0,
  failure_threshold integer not null default 3,
  last_success_at timestamptz null,
  last_failure_at timestamptz null,
  last_error text null,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.channel_health (channel, status, consecutive_failures, failure_threshold)
values
  ('email', 'healthy', 0, 3),
  ('sms', 'healthy', 0, 3)
on conflict (channel) do nothing;

create table if not exists public.delivery_attempts (
  id uuid primary key,
  prospect_id text not null,
  step_index integer not null,
  step_label text not null,
  attempted_channel text not null check (attempted_channel in ('email', 'sms')),
  primary_channel text not null check (primary_channel in ('email', 'sms')),
  fallback_used boolean not null default false,
  success boolean not null,
  error_message text null,
  target text not null,
  retry_count integer not null default 0,
  attempted_at timestamptz not null default timezone('utc', now())
);

create index if not exists delivery_attempts_prospect_idx
  on public.delivery_attempts (prospect_id, attempted_at desc);

create index if not exists delivery_attempts_step_idx
  on public.delivery_attempts (step_index, attempted_at desc);

create index if not exists delivery_attempts_channel_idx
  on public.delivery_attempts (attempted_channel, attempted_at desc);

create table if not exists public.funnel_retry_queue (
  id uuid primary key,
  prospect_id text not null,
  step_index integer not null,
  step_label text not null,
  primary_channel text not null check (primary_channel in ('email', 'sms')),
  fallback_channel text null check (fallback_channel in ('email', 'sms')),
  email_to text null,
  email_subject text null,
  email_body text null,
  email_sequence integer null,
  sms_to text null,
  sms_body text null,
  sms_sequence integer null,
  attempt_count integer not null default 0,
  next_retry_at timestamptz not null,
  last_attempt_at timestamptz null,
  last_error text null,
  status text not null default 'pending' check (status in ('pending', 'retrying', 'sent', 'exhausted', 'cancelled')),
  delivered_channel text null check (delivered_channel in ('email', 'sms')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz null
);

create index if not exists funnel_retry_queue_due_idx
  on public.funnel_retry_queue (status, next_retry_at);

create index if not exists funnel_retry_queue_prospect_idx
  on public.funnel_retry_queue (prospect_id, step_index, status);

create unique index if not exists funnel_retry_queue_active_unique_idx
  on public.funnel_retry_queue (prospect_id, step_index)
  where status in ('pending', 'retrying');

commit;
