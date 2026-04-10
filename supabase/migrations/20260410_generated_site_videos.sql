ALTER TABLE generated_sites
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_status TEXT NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS video_error TEXT,
  ADD COLUMN IF NOT EXISTS video_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS video_script TEXT,
  ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS video_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS generated_sites_video_status_idx
  ON generated_sites (video_status);

CREATE INDEX IF NOT EXISTS generated_sites_prospect_id_idx
  ON generated_sites (prospect_id);

CREATE TRIGGER generated_sites_updated_at
  BEFORE UPDATE ON generated_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
