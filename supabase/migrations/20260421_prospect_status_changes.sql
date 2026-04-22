-- Status-transition log for prospects.
--
-- Every time a prospect moves from one status to another (e.g.
-- approved → contacted after outreach, or ready_to_review → qc_failed
-- after a reviewer pushback), we write a row here with the from/to
-- status + a timestamp + an optional source string saying which
-- codepath triggered the change.
--
-- Use: daily drain check on the dashboard. When a stat tile (e.g.
-- "Approved") drops noticeably in a day, we need to see WHERE those
-- prospects went. Read `select from_status, to_status, count(*)
-- from prospect_status_changes where changed_at > current_date
-- group by 1, 2 order by 3 desc` and the answer is obvious.

create table if not exists public.prospect_status_changes (
  id bigserial primary key,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  business_name text,
  from_status text,
  to_status text not null,
  changed_at timestamptz not null default now(),
  source text
);

create index if not exists prospect_status_changes_changed_at_idx
  on public.prospect_status_changes (changed_at desc);

create index if not exists prospect_status_changes_prospect_id_idx
  on public.prospect_status_changes (prospect_id);
