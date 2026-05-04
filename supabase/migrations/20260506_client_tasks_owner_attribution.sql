-- Add owner-attribution to client_tasks so the portal To-Do tab knows
-- which co-founder marked a task done (Philip vs Paul, etc.) and the
-- weekly report can credit the right person.
--
-- Idempotent.

alter table public.client_tasks
  add column if not exists last_updated_by_owner_id uuid references public.client_owners(id);

-- Quick "show me everything still on the client" lookup for the portal.
create index if not exists client_tasks_client_owner_open_idx
  on public.client_tasks (client_slug, owner, status)
  where owner = 'client' and status in ('pending', 'in_progress', 'blocked');
