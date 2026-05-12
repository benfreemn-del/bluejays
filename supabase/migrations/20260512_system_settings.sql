-- Tiny key/value table for operator-tunable constants. Today: the
-- hyperloop cycle-time thresholds (kill window + Wilson CI). Easy to
-- add more settings later without a migration per knob.

create table if not exists system_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now(),
  updated_by text
);

create or replace function touch_system_settings_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_system_settings_updated_at on system_settings;
create trigger trg_system_settings_updated_at
  before update on system_settings
  for each row execute function touch_system_settings_updated_at();

insert into system_settings (key, value, description) values
  ('hyperloop.min_impressions_for_verdict', '200'::jsonb,
   'Wilson-CI verdict threshold: variants below this many impressions stay "testing"'),
  ('hyperloop.min_impressions_for_loser', '400'::jsonb,
   'Auto-pause threshold: variants above this many impressions with zero conversions get killed (Pro+ tier only)'),
  ('hyperloop.confidence_z', '1.96'::jsonb,
   'Wilson confidence level z-score. 1.96 = 95%, 2.58 = 99%, 1.64 = 90%')
on conflict (key) do nothing;
