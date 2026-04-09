-- Admin notes + customer change requests
-- Apply in Supabase SQL Editor or through your normal migration workflow.

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_notes_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_submitted_admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS last_submitted_theme TEXT;

CREATE TABLE IF NOT EXISTS change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  request_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS change_requests_prospect_id_idx
  ON change_requests (prospect_id);

CREATE INDEX IF NOT EXISTS change_requests_status_idx
  ON change_requests (status);

DROP TRIGGER IF EXISTS change_requests_updated_at ON change_requests;
CREATE TRIGGER change_requests_updated_at
  BEFORE UPDATE ON change_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for service role" ON change_requests;
CREATE POLICY "Allow all for service role"
  ON change_requests
  FOR ALL
  USING (true)
  WITH CHECK (true);
