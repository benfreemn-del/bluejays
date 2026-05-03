-- ─────────────────────────────────────────────────────────────────────────────
-- client_tasks — persistent per-client job task list
--
-- Why this exists: each custom-tier client (Zenith Sports, Mt View, Wholme,
-- etc.) has an open-ended list of decisions, blockers, asset deliverables,
-- and build steps that span weeks. We were tracking these in Claude session
-- todos (which die at compaction) and in commit messages (which are write-
-- only). Neither survives.
--
-- This table is the durable home for that work — accessible from the
-- dashboard on desktop or phone, persists across Claude sessions, and gives
-- Ben a single URL per client (e.g. /dashboard/clients/zenith-sports) that
-- shows everything pending.
--
-- Categories distinguish "what kind of task this is" so the UI can sort:
--   decision       — Ben or the client owes a decision (e.g. SMS auto-reply text)
--   asset          — Client owes us a deliverable (voicemail recording, headshots)
--   build          — Ben/Claude owes the client code or content
--   client-action  — Client must do this themselves (provision Twilio, set up Calendly)
--   reminder       — Just a heads-up; no action required
--
-- Owners: ben, client, claude, external. "client" means the customer must do
-- it; "claude" means Claude can pick it up next session; "external" means a
-- third party (Twilio, Stripe, ad platform, etc.).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.client_tasks (
  id uuid primary key default gen_random_uuid(),

  -- Which client this task belongs to. Matches the slug used in
  -- /clients/[slug] route + /api/clients/inquire SLUG_CONFIG.
  client_slug text not null,

  -- Short imperative title. Shown in lists.
  title text not null,
  -- Optional longer description. Markdown-friendly (we render as preformatted
  -- text on the frontend so newlines + bullets work).
  description text,

  -- Lifecycle state.
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'blocked', 'done', 'wont-do')),

  -- Sorted in this order in the UI: urgent → high → medium → low.
  priority text not null default 'medium'
    check (priority in ('urgent', 'high', 'medium', 'low')),

  -- See header comment for category meanings.
  category text not null default 'build'
    check (category in ('decision', 'asset', 'build', 'client-action', 'reminder')),

  -- Who owns the next move. ben | client | claude | external
  owner text not null default 'ben'
    check (owner in ('ben', 'client', 'claude', 'external')),

  -- If status='blocked', what's it blocked on (free text).
  blocked_on text,

  -- Optional due date.
  due_date timestamptz,

  -- Free-form notes — a running thread Ben can append to as he works through
  -- a task. Kept as text rather than a separate comments table because we
  -- don't need multi-author threading at this scale.
  notes text,

  -- Display order within (client_slug, status) — lets Ben drag-reorder later
  -- without touching priority/timestamps. Defaults to 1000 so new tasks fall
  -- to the bottom unless explicitly inserted with a lower order.
  display_order int not null default 1000,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Most-common query: show all open tasks for one client, sorted by priority.
create index if not exists client_tasks_client_status_idx
  on public.client_tasks (client_slug, status);

-- Cross-client "what's on my plate today" query.
create index if not exists client_tasks_owner_status_idx
  on public.client_tasks (owner, status)
  where status in ('pending', 'in_progress', 'blocked');

-- Auto-bump updated_at on any change. Keeps the UI's "stale tasks" check
-- accurate without each callsite remembering to set it.
create or replace function public.client_tasks_touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  if new.status = 'done' and old.status <> 'done' then
    new.completed_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists client_tasks_touch_updated_at on public.client_tasks;
create trigger client_tasks_touch_updated_at
  before update on public.client_tasks
  for each row execute function public.client_tasks_touch_updated_at();

comment on table public.client_tasks is
  'Persistent per-client task list (decisions, blockers, asset asks, build items). One row per task. See /dashboard/clients/[slug].';
