-- Win-loss tracking on prospects.
--
-- Used by /api/cron/win-loss-survey. When a prospect declines / drops
-- off / unsubscribes WITHOUT buying, we fire one short reply-by-email
-- survey asking why. Replies feed the existing AI Inbound Responder
-- so the data is captured + classified automatically.
--
-- win_loss_survey_sent_at — set when the survey email is sent
-- win_loss_outcome        — operator-assignable label after analyzing
--                           the reply ('price' / 'timing' / 'fit' /
--                           'competitor' / 'no-reply' / 'other')
--
-- Idempotent. Safe to re-run.

alter table public.prospects
  add column if not exists win_loss_survey_sent_at timestamptz;

alter table public.prospects
  add column if not exists win_loss_outcome text;

-- Index supports the cron's "find prospects to survey" query path:
-- fullsystem tier + dismissed/unsubscribed status + no survey yet sent.
create index if not exists prospects_win_loss_pending_idx
  on public.prospects (pricing_tier, status)
  where win_loss_survey_sent_at is null;
