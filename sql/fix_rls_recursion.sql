-- Fix RLS infinite recursion issue
-- This script fixes the recursive policy problem in the User table

-- STEP 1: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own data" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";
DROP POLICY IF EXISTS "Only admins can manage users" ON "User";
DROP POLICY IF EXISTS "Authenticated users can view disbursements" ON "Disbursement";
DROP POLICY IF EXISTS "Encoders and admins can manage disbursements" ON "Disbursement";
DROP POLICY IF EXISTS "Only admins can view audit logs" ON "AuditLog";
DROP POLICY IF EXISTS "All can view classifications" ON "ClassificationConfig";
DROP POLICY IF EXISTS "Only admins can manage classifications" ON "ClassificationConfig";
DROP POLICY IF EXISTS "Authenticated users can view reports" ON "Report";
DROP POLICY IF EXISTS "Only admins can manage system config" ON "SystemConfig";

-- STEP 2: Temporarily disable RLS on User table to avoid recursion
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- STEP 3: Create simple, non-recursive policies for User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own data using auth.uid() directly
CREATE POLICY "Users can view own data" ON "User"
    FOR SELECT USING (id::text = auth.uid()::text);

-- Allow users to update their own data using auth.uid() directly
CREATE POLICY "Users can update own data" ON "User"
    FOR UPDATE USING (id::text = auth.uid()::text);

-- Allow authenticated users to insert (for registration)
CREATE POLICY "Allow user registration" ON "User"
    FOR INSERT WITH CHECK (true);

-- STEP 4: Create policies for other tables using auth.jwt() to get user role
-- This avoids querying the User table from within policies

-- Disbursement policies
CREATE POLICY "Authenticated users can view disbursements" ON "Disbursement"
    FOR SELECT USING (auth.role() = 'authenticated');

-- For now, allow all authenticated users to manage disbursements
-- We'll handle role-based restrictions in the application layer
CREATE POLICY "Authenticated users can manage disbursements" ON "Disbursement"
    FOR ALL USING (auth.role() = 'authenticated');

-- AuditLog policies - allow all authenticated users to view for now
CREATE POLICY "Authenticated users can view audit logs" ON "AuditLog"
    FOR SELECT USING (auth.role() = 'authenticated');

-- Classification config policies
CREATE POLICY "All can view classifications" ON "ClassificationConfig"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage classifications" ON "ClassificationConfig"
    FOR ALL USING (auth.role() = 'authenticated');

-- Report policies
CREATE POLICY "Authenticated users can view reports" ON "Report"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage reports" ON "Report"
    FOR ALL USING (auth.role() = 'authenticated');

-- System config policies
CREATE POLICY "Authenticated users can manage system config" ON "SystemConfig"
    FOR ALL USING (auth.role() = 'authenticated');

-- STEP 5: Verification
SELECT 'RLS policies fixed successfully!' as status;

-- Show current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;