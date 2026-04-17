-- Parallel domain warming: allow multiple warming rows (one per domain).
--
-- The original 20260416_domain_warming.sql seeded a single row with id=1.
-- To run bluejayportfolio.com and bluejaywebs.com in parallel, we need a
-- unique constraint on `domain` (not just id), and a second seed row.

-- Make `domain` unique so domain-keyed upserts work.
create unique index if not exists domain_warming_domain_uniq
  on public.domain_warming (domain);

-- Seed the backup sender so upserts have a target row.
insert into public.domain_warming (id, domain, enabled, current_daily_limit, max_daily_limit, sent_today, last_reset_date)
values (2, 'bluejaywebs.com', false, 10, 100, 0, current_date)
on conflict (domain) do nothing;
