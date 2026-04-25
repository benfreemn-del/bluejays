-- Missed-call logs — persists every missed call event so the customer
-- portal's Leads tab can show real numbers instead of zero. Wave 4A
-- (customer-metrics.ts) already queries this table; this migration
-- finally creates the schema. Wired into
-- /api/missed-call/callback/route.ts so the auto-SMS handler writes a
-- row BEFORE firing the SMS (Rule 43).
--
-- Idempotent on Twilio retries via UNIQUE(twilio_call_sid).

CREATE TABLE IF NOT EXISTS missed_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  caller_phone TEXT NOT NULL,
  caller_city TEXT,         -- if Twilio provides it
  caller_state TEXT,        -- if Twilio provides it
  call_status TEXT NOT NULL, -- 'no-answer' | 'busy' | 'failed' | 'short-completed'
  call_duration_seconds INT, -- 0 for no-answer/busy/failed; <10 for short-completed
  twilio_call_sid TEXT NOT NULL UNIQUE,
  auto_sms_sent BOOLEAN NOT NULL DEFAULT false,
  auto_sms_body TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_missed_calls_prospect ON missed_call_logs(prospect_id);
CREATE INDEX IF NOT EXISTS idx_missed_calls_occurred ON missed_call_logs(occurred_at);
CREATE INDEX IF NOT EXISTS idx_missed_calls_caller ON missed_call_logs(caller_phone);
