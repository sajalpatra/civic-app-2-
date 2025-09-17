-- Fixed SQL syntax for get_nearby_reports function
-- This version has corrected syntax and proper formatting

-- Drop the existing function first to avoid conflicts
DROP FUNCTION IF EXISTS get_nearby_reports(DECIMAL, DECIMAL, DECIMAL);

-- Create the corrected function with proper syntax
CREATE OR REPLACE FUNCTION get_nearby_reports(
    lat DECIMAL, 
    lng DECIMAL, 
    radius_km DECIMAL DEFAULT 5
)
RETURNS TABLE (
    id VARCHAR(255),
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
    distance_km DECIMAL
) 
LANGUAGE plpgsql
AS $$
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
        -- Calculate distance using simple formula
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
$$;

-- Test that the function was created successfully
SELECT 'Function get_nearby_reports created successfully!' AS status;