-- Per-client partner call log. Multi-tenant version of partner_calls,
-- scoped by client_slug so each AI Marketing System client (Tekky,
-- ITC, future) gets their own partner-call history without bleeding
-- into the BlueJays-own partner_calls table.
--
-- Uses loose FKs on partner_id + lead_id so deletes upstream don't
-- cascade history away.
--
-- Outcome enum is broader than partner_calls because per-client
-- products vary (ITC ships configs + brochures, BlueJays ships
-- audits + previews, Tekky ships tournament invites, etc).

create table if not exists public.client_partner_calls (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  -- Loose FK — partners table is shared across clients, but the
  -- per-client roster is filtered via the partners.client_slug
  -- column added in 20260429_partners. Cascade-on-delete here would
  -- erase history when a partner is removed; we want history to
  -- survive, so loose FK.
  partner_id uuid not null,
  -- Loose FK to whatever lead the call is about. For ITC this is
  -- usually a row in client_leads or tekky_scrape_leads / itc_scrape_leads.
  -- Null is allowed because cold dials to a tractor dealer often
  -- precede any lead row (the call IS what creates the relationship).
  lead_id uuid,
  -- Audience the rep was working from when they dialed. ITC has 6:
  -- dealer / tym / forester / hunter / hobbyist / community.
  -- Other clients will add their own.
  audience text,
  -- Per-client outcome enum. ITC-specific values:
  --   no_answer                — rang, no pickup
  --   voicemail                — left a voicemail
  --   wrong_number             — disconnected / wrong person
  --   answered_call_scheduled  — PRIMARY WIN (audience=dealer)
  --   answered_config_sent     — sent the configurator link via text/email
  --   answered_brochure_sent   — sent product brochure / PDF link
  --   answered_callback        — asked us to call back later
  --   answered_not_interested  — picked up, said no
  --   do_not_call              — TCPA flag
  outcome text not null,
  notes text,
  -- Estimated payout in cents based on outcome + audience at time of
  -- call. Fills the workspace's "running daily/weekly payout" stat.
  -- ITC: $50 retail (config_sent on hobbyist/hunter) = 5000.
  --      $250 dealer (call_scheduled on audience=dealer) = 25000.
  --      $0 for everything else.
  estimated_payout_cents int not null default 0,
  -- Filled when the downstream conversion actually completes. NULL
  -- until then. Lets dashboards distinguish "I'm pacing toward $1000
  -- this week" from "I've been paid $1000 this week".
  actual_payout_cents int,
  -- estimated → pending_conversion → paid → not_converted
  payout_status text not null default 'estimated',
  -- ISO timestamps for the various send actions. Each is null if
  -- the rep didn't perform that action on this call.
  config_link_sent_at timestamptz,
  brochure_sent_at timestamptz,
  called_at timestamptz not null default now()
);

create index if not exists client_partner_calls_slug_idx
  on public.client_partner_calls(client_slug, called_at desc);
create index if not exists client_partner_calls_partner_idx
  on public.client_partner_calls(client_slug, partner_id, called_at desc);
create index if not exists client_partner_calls_outcome_idx
  on public.client_partner_calls(client_slug, outcome, called_at desc);
create index if not exists client_partner_calls_lead_idx
  on public.client_partner_calls(lead_id, called_at desc) where lead_id is not null;
create index if not exists client_partner_calls_payout_idx
  on public.client_partner_calls(client_slug, payout_status, called_at desc);
