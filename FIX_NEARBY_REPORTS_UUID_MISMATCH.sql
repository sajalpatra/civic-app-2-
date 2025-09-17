-- Fix get_nearby_reports function data type mismatch
-- The error occurs because the function expects UUID but the table has VARCHAR for id column

-- First, let's check what the actual data types are in the reports table
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name IN ('id', 'user_id')
ORDER BY ordinal_position;

-- Now create the corrected function with proper data types
CREATE OR REPLACE FUNCTION get_nearby_reports(lat DECIMAL, lng DECIMAL, radius_km DECIMAL DEFAULT 5)
RETURNS TABLE (
  id VARCHAR(255),              -- Changed from UUID to VARCHAR to match table
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

-- Test the function
SELECT 'Testing function...' as status;
-- SELECT * FROM get_nearby_reports(0, 0, 50) LIMIT 5;