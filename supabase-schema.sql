-- BlueJays Database Schema
-- Run this in the Supabase SQL Editor to set up your database

-- Prospects table
CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  owner_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT DEFAULT '',
  category TEXT NOT NULL,
  current_website TEXT,
  google_rating DECIMAL(2,1),
  review_count INTEGER,
  estimated_revenue_tier TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'scouted',
  scraped_data JSONB DEFAULT '{}',
  generated_site_url TEXT,
  selected_theme TEXT DEFAULT NULL,
  ai_theme_recommendation TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated site data (preview content)
CREATE TABLE IF NOT EXISTS generated_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  site_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email history
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  to_address TEXT NOT NULL,
  from_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sequence INTEGER DEFAULT 1,
  method TEXT DEFAULT 'mock',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding submissions
CREATE TABLE IF NOT EXISTS onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Edit requests (phone editing)
CREATE TABLE IF NOT EXISTS edit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS history
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  to_number TEXT NOT NULL,
  from_number TEXT,
  body TEXT NOT NULL,
  sequence INTEGER DEFAULT 1,
  method TEXT DEFAULT 'mock',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personalized proposals
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID UNIQUE REFERENCES prospects(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  pain_points JSONB DEFAULT '[]'::jsonb,
  context_data JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales call calendar bookings
CREATE TABLE IF NOT EXISTS calendar_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  slot_iso TIMESTAMPTZ NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Priority call list
CREATE TABLE IF NOT EXISTS priority_call_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID UNIQUE REFERENCES prospects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (but allow all for service role)
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_call_list ENABLE ROW LEVEL SECURITY;

-- Policies: allow all operations via service role key
CREATE POLICY "Allow all for service role" ON prospects FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON generated_sites FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON emails FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON onboarding FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON edit_requests FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON sms_messages FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON notes FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON proposals FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON calendar_bookings FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON priority_call_list FOR ALL USING (true);
