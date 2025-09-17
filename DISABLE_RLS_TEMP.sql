-- Temporary fix: Disable RLS for users table during development
-- This allows user registration to work with Clerk authentication
-- In production, you should implement proper JWT integration between Clerk and Supabase

-- Disable RLS temporarily for users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS enabled but allow all operations:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all operations" ON users;
-- CREATE POLICY "Allow all operations" ON users AS PERMISSIVE FOR ALL TO public USING (true);

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Note: Remember to re-enable RLS and create proper policies for production:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- And create appropriate policies that work with your authentication system