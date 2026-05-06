-- Per-funnel cost tracking. Lets the dashboard subtract spend from
-- revenue to compute net P&L + ROI per audience segment.
--
-- Each row is a single cost line for one (client, audience, period).
-- Period is a free text label ("Apr 2026" / "Q2 2026" / "lifetime") so
-- Philip can roll up however he tracks. The dashboard sums all rows
-- per audience for a quick total — finer-grained reporting can come
-- later if needed.

create table if not exists public.client_funnel_costs (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  -- ClientLeadAudience values: parent / coach / player / club / etc.
  -- Null = "general / overhead, not attributable to a specific funnel"
  audience_segment text,
  cost_cents integer not null,
  period_label text,        -- "Apr 2026" / "Q2 2026" / "ongoing"
  notes text,               -- "Meta ads parent campaign 4/1-4/30"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_funnel_costs_slug_aud_idx
  on public.client_funnel_costs (client_slug, audience_segment);

create or replace function public.touch_client_funnel_costs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists client_funnel_costs_updated_at on public.client_funnel_costs;
create trigger client_funnel_costs_updated_at
  before update on public.client_funnel_costs
  for each row execute function public.touch_client_funnel_costs_updated_at();
