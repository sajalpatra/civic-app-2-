-- SIMPLE FIX: Change user_id column type and update existing data
-- Run these commands one by one in Supabase SQL Editor

-- Step 1: First, let's see what we have
SELECT 
  id, 
  user_id, 
  title, 
  status, 
  created_at::text as created_time
FROM reports 
ORDER BY created_at DESC;

-- Step 2: Check if the column is currently UUID type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'user_id';

-- Step 3: If it shows 'uuid', we need to change it to varchar
-- This will fail if user_id is UUID type, so we'll handle it differently

-- Step 4: Alternative approach - Add a new column temporarily
ALTER TABLE reports ADD COLUMN user_id_temp VARCHAR(255);

-- Step 5: Copy existing non-null user_ids (if any) to the temp column
UPDATE reports 
SET user_id_temp = user_id::text 
WHERE user_id IS NOT NULL;

-- Step 6: Update the null user_ids with your Clerk ID
UPDATE reports 
SET user_id_temp = 'user_32SSWnSjMCBvaJvDwyTSGUD6pyx'
WHERE user_id IS NULL;

-- Step 7: Drop the old user_id column
ALTER TABLE reports DROP COLUMN user_id;

-- Step 8: Rename the temp column to user_id
ALTER TABLE reports RENAME COLUMN user_id_temp TO user_id;

-- Step 9: Verify the fix
SELECT 
  id, 
  user_id, 
  title, 
  status, 
  created_at::text as created_time
FROM reports 
WHERE user_id = 'user_32SSWnSjMCBvaJvDwyTSGUD6pyx'
ORDER BY created_at DESC;

-- Step 10: Final verification - count your reports
SELECT COUNT(*) as your_reports 
FROM reports 
WHERE user_id = 'user_32SSWnSjMCBvaJvDwyTSGUD6pyx';
