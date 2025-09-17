-- Fix the existing report with null user_id
-- Run this in your Supabase SQL Editor

-- First, let's see the current report with null user_id
SELECT * FROM reports WHERE user_id IS NULL;

-- Update the existing report to have the correct user_id
-- Replace 'user_32SSWnSjMCBvaJvDwyTSGUD6pyx' with your actual user ID if different
UPDATE reports 
SET user_id = 'user_32SSWnSjMCBvaJvDwyTSGUD6pyx'
WHERE user_id IS NULL 
  AND title = 'Potholes Issue'
  AND description = 'pathole problems is here';

-- Verify the update worked
SELECT * FROM reports WHERE user_id = 'user_32SSWnSjMCBvaJvDwyTSGUD6pyx';

-- Show all reports for debugging
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
