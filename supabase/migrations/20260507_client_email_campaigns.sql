-- ─────────────────────────────────────────────────────────────────────────────
-- client_email_campaigns + client_email_sends — owner-driven email blasts
-- to per-client lead audiences.
--
-- Owners use this to send batch emails to a filtered subset of their
-- client_leads (e.g. "all parent leads who haven't been contacted yet"
-- or "all coach leads enrolled in the funnel"). Each campaign creates
-- one row in client_email_campaigns + N rows in client_email_sends
-- (one per recipient).
--
-- Open / click tracking reuses the existing /api/o/{messageId} pixel
-- pattern. Reply tracking reuses the existing inbound email handler
-- which already matches by email address.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_email_campaigns (
  id uuid primary key default gen_random_uuid(),

  client_slug text not null,

  -- Owner-facing internal name (eg. "Spring camp announcement v2").
  name text not null,

  -- Email subject line — sent verbatim (after merge-tag substitution).
  subject text not null,

  -- Email body — markdown / plain text. Merge tags supported:
  --   {{first_name}}  {{audience}}  {{intent}}
  body text not null,

  -- Audience filter — array of audience_segment values to include.
  -- Empty array = ALL audiences (no filter).
  audience_filter text[] not null default '{}',

  -- Lead-status filter — array of funnel_status values to include.
  -- Empty array = ALL statuses (no filter, except 'dismissed' which
  -- is always excluded — owners archive those for a reason).
  lead_status_filter text[] not null default '{}',

  -- Lifecycle:
  --   draft       — owner is still editing
  --   scheduled   — queued for future send (scheduled_for set)
  --   sending     — fan-out in progress
  --   sent        — done
  --   cancelled   — owner aborted before send completed
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),

  -- For scheduled sends.
  scheduled_for timestamptz,

  -- When the actual send started + finished.
  sent_at timestamptz,

  -- Live aggregates updated by the send pipeline + tracking pixels.
  recipient_count int not null default 0,
  send_count int not null default 0,
  open_count int not null default 0,
  click_count int not null default 0,
  reply_count int not null default 0,
  bounce_count int not null default 0,

  -- Who created the campaign.
  created_by_owner_id uuid references public.client_owners(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_email_campaigns_client_idx
  on public.client_email_campaigns (client_slug, created_at desc);

-- Per-recipient send log. One row per (campaign × lead) pair.
create table if not exists public.client_email_sends (
  id uuid primary key default gen_random_uuid(),

  campaign_id uuid not null references public.client_email_campaigns(id) on delete cascade,
  lead_id uuid not null references public.client_leads(id) on delete cascade,
  client_slug text not null,

  -- Address actually sent to (snapshotted at send-time so renames
  -- don't break tracking).
  to_email text not null,

  -- Rendered subject + body after merge-tag substitution.
  rendered_subject text not null,
  rendered_body text not null,

  -- Lifecycle per individual send:
  --   queued    — ready to send
  --   sent      — SendGrid accepted
  --   delivered — SendGrid delivery webhook fired (optional, nice-to-have)
  --   opened    — pixel hit
  --   clicked   — link clicked
  --   replied   — inbound reply matched
  --   bounced   — SendGrid bounce webhook
  --   failed    — send threw an error
  status text not null default 'queued'
    check (status in (
      'queued', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed'
    )),

  -- SendGrid X-Message-Id for cross-referencing webhook events.
  sendgrid_message_id text,

  -- Failure / bounce reason.
  error text,

  -- Tracking timestamps. opened_at / clicked_at update only on the
  -- FIRST hit (we don't track multiple opens per recipient).
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  bounced_at timestamptz,

  created_at timestamptz not null default now()
);

create index if not exists client_email_sends_campaign_idx
  on public.client_email_sends (campaign_id);
create index if not exists client_email_sends_lead_idx
  on public.client_email_sends (lead_id);

-- Auto-bump updated_at on campaign edits.
create or replace function public.client_email_campaigns_touch()
returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists client_email_campaigns_touch on public.client_email_campaigns;
create trigger client_email_campaigns_touch
  before update on public.client_email_campaigns
  for each row execute function public.client_email_campaigns_touch();

comment on table public.client_email_campaigns is
  'Per-client batch email campaigns. Owner-driven, audience-filterable. Surfaced on the owner portal Campaigns tab.';
comment on table public.client_email_sends is
  'Per-recipient send log for client_email_campaigns. One row per (campaign × lead) pair with full tracking lifecycle.';
