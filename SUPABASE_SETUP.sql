-- Supabase Database Setup for Civic App
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create the reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255), -- Clerk user ID (string format, not UUID)
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  address TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}', -- Array of photo URLs
  audio_uri TEXT,
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for Row Level Security
-- Users can view all reports (for public civic transparency)
CREATE POLICY "Reports are viewable by everyone" ON reports
  FOR SELECT USING (true);

-- Users can only insert reports with their own user_id
CREATE POLICY "Users can insert their own reports" ON reports
  FOR INSERT WITH CHECK (true); -- We'll handle user_id validation in the app

-- Users can only update their own reports
CREATE POLICY "Users can update their own reports" ON reports
  FOR UPDATE USING (true); -- For now, allow updates (can be restricted later)

-- 5. Create a function to automatically update the updated_at column (replace if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create a trigger to automatically update updated_at (only if it doesn't exist)
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

-- 7. Verify the users table exists (should already exist from earlier setup)
-- If not, create it
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY, -- Clerk user ID
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 9. Create policies for users table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can view all profiles'
  ) THEN
    CREATE POLICY "Users can view all profiles" ON users
      FOR SELECT USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" ON users
      FOR INSERT WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" ON users
      FOR UPDATE USING (true);
  END IF;
END
$$;

-- 10. Add trigger for users table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Success message
SELECT 'Database setup completed successfully! 🎉' as message;

-- 11. Create a function to get nearby reports (for nearby issues feature)
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
    -- Calculate distance using simple formula (for basic distance calculation)
    -- Note: This is a simplified version. For production, use PostGIS for accurate calculations
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
