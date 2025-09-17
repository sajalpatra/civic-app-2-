-- OPTION B: Quick Fix - Recreate Reports Table
-- Run these commands in Supabase SQL Editor

-- Step 1: Drop the existing reports table (this will delete all current reports)
DROP TABLE IF EXISTS reports CASCADE;

-- Step 2: Recreate the reports table with correct user_id type
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255), -- Correct type for Clerk user IDs
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  address TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  audio_uri TEXT,
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
CREATE POLICY "Reports are viewable by everyone" ON reports
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reports" ON reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own reports" ON reports
  FOR UPDATE USING (true);

-- Step 6: Create trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_reports_updated_at'
  ) THEN
    CREATE TRIGGER update_reports_updated_at 
      BEFORE UPDATE ON reports 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Step 8: Drop existing function and recreate with correct return type
DROP FUNCTION IF EXISTS get_nearby_reports(DECIMAL, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS get_nearby_reports(NUMERIC, NUMERIC, NUMERIC);

CREATE OR REPLACE FUNCTION get_nearby_reports(lat DECIMAL, lng DECIMAL, radius_km DECIMAL DEFAULT 5)
RETURNS TABLE (
  id UUID,
  user_id VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  address TEXT,
  photos TEXT[],
  audio_uri TEXT,
  status VARCHAR(50),
  priority VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.title,
    r.description,
    r.category,
    r.location_latitude,
    r.location_longitude,
    r.location_accuracy,
    r.address,
    r.photos,
    r.audio_uri,
    r.status,
    r.priority,
    r.created_at,
    r.updated_at,
    r.resolved_at,
    SQRT(
      POWER(69.1 * (r.location_latitude - lat), 2) +
      POWER(69.1 * (lng - r.location_longitude) * COS(r.location_latitude / 57.3), 2)
    )::DECIMAL AS distance_km
  FROM reports r
  WHERE 
    r.location_latitude IS NOT NULL 
    AND r.location_longitude IS NOT NULL
    AND SQRT(
      POWER(69.1 * (r.location_latitude - lat), 2) +
      POWER(69.1 * (lng - r.location_longitude) * COS(r.location_latitude / 57.3), 2)
    ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Reports table recreated successfully with correct schema! 🎉' as message;
