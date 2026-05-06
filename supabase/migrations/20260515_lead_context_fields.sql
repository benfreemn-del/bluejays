-- ─────────────────────────────────────────────────────────────────────────────
-- 20260515 — Lead context fields for soccer-domain richness
--
-- Per Philip + Paul's meeting notes (2026-05-09): the existing
-- audience_segment field (parent/coach/player/club) doesn't capture the
-- competitive-tier dimension that drives buying-power for youth soccer
-- (RCL Select vs MLS NEXT vs Rec). Plus they want a state+gender+age-
-- aware "in-season" badge that replaces the Google-Places business-hours
-- indicator (which is useless for soccer).
--
-- Adds 5 nullable fields to client_leads:
--
--   · competition_tier — which league the lead's club competes in
--     ("rcl-select" / "mls-next" / "ecnl" / "rec-youth" / "rec-adult" /
--      "high-school" / "college" / null). Stratified by age via
--      separate age_group field rather than baking U-XX into the tier.
--   · age_group — "U8" / "U10" / "U12" / "U14" / "U16" / "U19" /
--      "high-school" / "college" / "adult". Free text-ish but checked.
--   · gender — "boys" / "girls" / "mixed" / null. Drives the WA boys-
--      spring-HS season override.
--   · state_override — explicit state for the lead when different
--      from the inferred state in raw_payload (e.g. WA-state lead
--      scouted from a CA-based business). Optional.
--   · in_season_override — manual override of the season calculator.
--      "in-season" / "off-season" / null. When set, supersedes the
--      calculated value. Required-with-save UI per Philip's request.
--
-- All nullable → existing rows stay untouched. New rows can be tagged
-- progressively as the owner clicks through leads.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.client_leads
  add column if not exists competition_tier text
    check (
      competition_tier is null
      or competition_tier in (
        'rcl-select',
        'mls-next',
        'ecnl',
        'rec-youth',
        'rec-adult',
        'high-school',
        'college',
        'pro',
        'unknown'
      )
    );

alter table public.client_leads
  add column if not exists age_group text
    check (
      age_group is null
      or age_group in (
        'U8',
        'U10',
        'U12',
        'U14',
        'U16',
        'U17',
        'U19',
        'high-school',
        'college',
        'adult',
        'unknown'
      )
    );

alter table public.client_leads
  add column if not exists gender text
    check (
      gender is null
      or gender in ('boys', 'girls', 'men', 'women', 'mixed', 'unknown')
    );

alter table public.client_leads
  add column if not exists state_override text;

alter table public.client_leads
  add column if not exists in_season_override text
    check (
      in_season_override is null
      or in_season_override in ('in-season', 'off-season')
    );

-- Index for filtering — owner will frequently filter "show me all
-- ECNL U14 boys" or "RCL Select girls in-season."
create index if not exists client_leads_tier_age_gender_idx
  on public.client_leads (client_slug, competition_tier, age_group, gender)
  where competition_tier is not null;

comment on column public.client_leads.competition_tier is
  'Which competitive league the lead''s club competes in. Drives in-season calculation + LTV-tier targeting. Manually settable from the lead-detail edit modal.';
comment on column public.client_leads.age_group is
  'U-bracket or generic level. Combined with gender + state to compute in-season.';
comment on column public.client_leads.gender is
  'Boys/girls/mixed. Drives state-specific season overrides (e.g. WA boys = spring HS = club off-season Apr-May).';
comment on column public.client_leads.in_season_override is
  'Manual owner override of the in-season calculator. NULL = use calculator. Required to be saved through a UI button per Philip+Paul UX preference.';
