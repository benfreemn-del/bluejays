-- Short codes for prospect preview URLs.
--
-- Goal: replace ugly full-UUID preview links like
--   https://bluejayportfolio.com/preview/02b37937-2980-4101-929e-dfa8dd8aba13
-- with clean short links like
--   https://bluejayportfolio.com/p/a1b2c3d4
--
-- We use 8 hex chars (first 8 of md5(id)). With ~1000 prospects that's
-- astronomically unlikely to collide (16^8 = 4.3 billion combinations).
-- Deterministic — same UUID always maps to same short code — so no need
-- to regenerate on re-scrape.

alter table public.prospects
  add column if not exists short_code text;

-- Backfill every existing row with a deterministic 8-char code.
update public.prospects
set short_code = substring(md5(id::text), 1, 8)
where short_code is null;

-- Enforce uniqueness going forward. Any collisions would error on insert
-- so we'd catch them immediately (but statistically won't happen at our volume).
create unique index if not exists prospects_short_code_idx
  on public.prospects (short_code);
