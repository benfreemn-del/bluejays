-- A/B variant tracking on funnel sends.
--
-- Adds variant_id (text, nullable) to client_lead_messages so the
-- hyperloop analyzer can break per-template stats out by variant.
-- Templates without variants leave this null and behave as today.
--
-- The runner picks one variant per lead deterministically (hash on
-- lead.id) so a given lead always sees the same variant on retries —
-- this matters for analytics integrity.

alter table public.client_lead_messages
  add column if not exists variant_id text;

create index if not exists client_lead_messages_template_variant_idx
  on public.client_lead_messages (client_slug, template_id, variant_id);
