-- Add selected_version column to prospects table
-- Stores the user's preferred template version (v1 or v2) per prospect
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS selected_version TEXT DEFAULT NULL;

-- Add a check constraint to ensure only valid values
ALTER TABLE prospects ADD CONSTRAINT check_selected_version 
  CHECK (selected_version IS NULL OR selected_version IN ('v1', 'v2'));
