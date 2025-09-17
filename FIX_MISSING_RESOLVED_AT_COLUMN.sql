-- Fix the missing resolved_at column in reports table
-- This will fix the "column r.resolved_at does not exist" error

-- First, check if the column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reports' AND column_name = 'resolved_at') THEN
        -- Add the missing resolved_at column
        ALTER TABLE reports ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added resolved_at column to reports table';
    ELSE
        RAISE NOTICE 'resolved_at column already exists';
    END IF;
END $$;

-- Now update the get_nearby_reports function to handle the case where resolved_at might be NULL
-- or remove it from the function if not needed
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

-- Test the function to make sure it works
-- SELECT * FROM get_nearby_reports(0, 0, 50);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reports' 
ORDER BY ordinal_position;