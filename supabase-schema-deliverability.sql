-- Email Deliverability Schema
-- Domain authentication verification records
CREATE TABLE IF NOT EXISTS domain_verifications (
  domain TEXT PRIMARY KEY,
  spf_valid BOOLEAN DEFAULT FALSE,
  spf_record TEXT,
  dkim_valid BOOLEAN DEFAULT FALSE,
  dkim_record TEXT,
  dmarc_valid BOOLEAN DEFAULT FALSE,
  dmarc_record TEXT,
  dmarc_policy TEXT,
  overall_score INTEGER DEFAULT 0,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email bounce tracking
CREATE TABLE IF NOT EXISTS email_bounces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  bounce_type TEXT NOT NULL CHECK (bounce_type IN ('hard', 'soft')),
  reason TEXT,
  retry_count INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email warm-up tracking
CREATE TABLE IF NOT EXISTS email_warmup (
  domain TEXT PRIMARY KEY,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_day INTEGER DEFAULT 1,
  daily_limit INTEGER DEFAULT 5,
  sent_today INTEGER DEFAULT 0,
  last_send_date DATE DEFAULT CURRENT_DATE,
  phase TEXT DEFAULT 'warming' CHECK (phase IN ('warming', 'ramping', 'full')),
  history JSONB DEFAULT '[]'::jsonb
);

-- Email events (extends existing table with deliverability tracking)
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  message_id TEXT,
  url TEXT,
  user_agent TEXT,
  ip TEXT
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_email_bounces_email ON email_bounces(email);
CREATE INDEX IF NOT EXISTS idx_email_bounces_prospect ON email_bounces(prospect_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(timestamp);

-- RLS policies
ALTER TABLE domain_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_bounces ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_warmup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON domain_verifications FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON email_bounces FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON email_warmup FOR ALL USING (true);
