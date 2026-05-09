-- ─────────────────────────────────────────────────────────────────────────────
-- 20260509 — client_ad_creatives v2: OIT audiences + Lob platform + UPSERT
--
-- Three fixes after the 2026-05-09 ads-funnel audit:
--   1. audience CHECK was rejecting OIT seeds (homeowner/realtor/insurance)
--      → seeding any OIT creative would fail the constraint
--   2. platform CHECK was rejecting `lob` (Lob direct-mail postcards) →
--      BlueJays' Lob postcard creative was tagged 'meta-feed' as a workaround
--   3. seedClientAdCreatives() was select-then-insert (race condition);
--      this index lets us swap to a real UPSERT keyed on the natural key
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.client_ad_creatives drop constraint if exists client_ad_creatives_audience_check;
alter table public.client_ad_creatives
  add constraint client_ad_creatives_audience_check
  check (audience = any (array[
    -- Zenith Sports
    'parent','coach','player','club','all',
    -- ITC Quick Attach
    'hobbyist','forester','tym','hunter','dealer','community',
    -- Olympic Inspections & Testing
    'homeowner','realtor','insurance'
  ]));

alter table public.client_ad_creatives drop constraint if exists client_ad_creatives_platform_check;
alter table public.client_ad_creatives
  add constraint client_ad_creatives_platform_check
  check (platform = any (array[
    'meta-feed','meta-reels','meta-stories',
    'google-search','google-pmax','google-yt',
    'lob'
  ]));

create unique index if not exists client_ad_creatives_upsert_key
  on public.client_ad_creatives
  (client_slug, audience, platform, coalesce(variant_label, ''));
