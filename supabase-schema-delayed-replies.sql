-- Delayed Replies Queue
-- This table stores AI replies that are scheduled to be sent after a human-like delay.
CREATE TABLE IF NOT EXISTS queued_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  recipient TEXT NOT NULL,
  reply_body TEXT NOT NULL,
  reply_subject TEXT, -- For email only
  send_after TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE queued_replies ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations via service role key
-- This is standard for this project's backend-to-DB interaction.
CREATE POLICY "Allow all for service role" ON queued_replies FOR ALL USING (true);
