-- Per-page first-party view tracking for client sites (Zenith first).
-- Beacon on every storefront page POSTs to /api/clients/<slug>/track,
-- which inserts one row here. Aggregated by client_page_view_stats().

create table if not exists client_page_views (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  path text not null,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_cpv_slug_path on client_page_views (client_slug, path);
create index if not exists idx_cpv_slug_created on client_page_views (client_slug, created_at desc);

-- Server writes/reads via the service-role key (bypasses RLS). RLS on
-- with no policies = anon/authenticated Data API access fully blocked.
alter table client_page_views enable row level security;

-- Grouped per-path stats (supabase-js has no GROUP BY — do it in SQL).
create or replace function client_page_view_stats(p_slug text)
returns table(path text, total_views bigint, views_30d bigint, views_7d bigint, last_view timestamptz)
language sql
stable
as $$
  select
    path,
    count(*)::bigint as total_views,
    (count(*) filter (where created_at > now() - interval '30 days'))::bigint as views_30d,
    (count(*) filter (where created_at > now() - interval '7 days'))::bigint as views_7d,
    max(created_at) as last_view
  from client_page_views
  where client_slug = p_slug
  group by path
  order by count(*) desc;
$$;

-- Only the server (service role) may call the stats RPC.
revoke execute on function client_page_view_stats(text) from anon, authenticated, public;
