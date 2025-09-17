-- Fix the user_id column type in reports table
-- The issue is that user_id is set as UUID but Clerk IDs are strings

-- Step 1: Check current table structure
\d reports;

-- Step 2: Change user_id column from UUID to VARCHAR
ALTER TABLE reports 
ALTER COLUMN user_id TYPE VARCHAR(255);

-- Step 3: Now update the existing report with null user_id
UPDATE reports 
SET user_id = 'user_32SSWnSjMCBvaJvDwyTSGUD6pyx'
WHERE user_id IS NULL;

-- Step 4: Verify the fix worked
SELECT 
  id, 
  user_id, 
  title, 
  description, 
  category, 
  status, 
  created_at 
FROM reports 
ORDER BY created_at DESC;

-- Step 5: Check that your specific user now has reports
SELECT COUNT(*) as report_count 
FROM reports 
WHERE user_id = 'user_32SSWnSjMCBvaJvDwyTSGUD6pyx';
