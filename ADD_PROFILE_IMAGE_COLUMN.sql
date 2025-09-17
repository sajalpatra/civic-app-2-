-- Add profile_image column to users table for storing base64 image data
-- Run this SQL script in your Supabase SQL Editor

-- Add profile_image column to store base64 encoded images
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Create an index for better performance when querying user profiles
CREATE INDEX IF NOT EXISTS idx_users_profile_image ON users(id) WHERE profile_image IS NOT NULL;

-- Optional: Add a comment to document the column purpose
COMMENT ON COLUMN users.profile_image IS 'Base64 encoded profile image data in data URI format (data:image/jpeg;base64,...)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'profile_image';