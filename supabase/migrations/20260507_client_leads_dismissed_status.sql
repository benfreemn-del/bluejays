-- Add 'dismissed' to the funnel_status enum so owners can archive
-- spam / not-a-real-lead entries from the portal without losing the
-- record. Existing rows aren't affected. Idempotent.

do $$
begin
  alter table public.client_leads
    drop constraint if exists client_leads_funnel_status_check;
  alter table public.client_leads
    add constraint client_leads_funnel_status_check
    check (funnel_status in (
      'not_enrolled', 'enrolled', 'paused', 'responded',
      'converted', 'completed', 'dismissed'
    ));
exception when others then
  null;
end;
$$;
