-- Pipeline Batches table — tracks automated batch runs
CREATE TABLE IF NOT EXISTS pipeline_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'running',
  target_count INTEGER NOT NULL DEFAULT 10,
  location TEXT NOT NULL,
  categories JSONB DEFAULT '[]',
  results JSONB DEFAULT '{}',
  costs JSONB DEFAULT '{}',
  prospects JSONB DEFAULT '[]',
  errors JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- System costs table — tracks real API costs per action
CREATE TABLE IF NOT EXISTS system_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES pipeline_batches(id) ON DELETE SET NULL,
  service TEXT NOT NULL,
  action TEXT NOT NULL,
  cost_usd NUMERIC(10,6) NOT NULL,
  status TEXT DEFAULT 'success',
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS and allow all for service role
ALTER TABLE pipeline_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON pipeline_batches FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON system_costs FOR ALL USING (true);

-- Index for fast cost queries by date
CREATE INDEX IF NOT EXISTS idx_system_costs_created_at ON system_costs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_costs_service ON system_costs(service);
CREATE INDEX IF NOT EXISTS idx_pipeline_batches_started_at ON pipeline_batches(started_at);
