-- Fix RLS Authentication Issues
-- This script modifies RLS policies to allow proper authentication

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own data" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";
DROP POLICY IF EXISTS "Only admins can manage users" ON "User";
DROP POLICY IF EXISTS "Encoders and admins can manage disbursements" ON "Disbursement";
DROP POLICY IF EXISTS "Only admins can view audit logs" ON "AuditLog";
DROP POLICY IF EXISTS "Only admins can manage classifications" ON "ClassificationConfig";

-- Create new policies that work with Supabase auth

-- Allow users to view their own profile and admins to view all
CREATE POLICY "Users can view profiles" ON "User"
    FOR SELECT USING (
        auth.uid()::text = id::text OR 
        EXISTS (
            SELECT 1 FROM "User" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'ADMIN'
        )
    );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON "User"
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow admins to insert new users
CREATE POLICY "Admins can insert users" ON "User"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "User" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'ADMIN'
        )
    );

-- Allow admins to delete users
CREATE POLICY "Admins can delete users" ON "User"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "User" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'ADMIN'
        )
    );

-- Fix disbursement policies
CREATE POLICY "Encoders and admins can manage disbursements" ON "Disbursement"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role IN ('ADMIN', 'ENCODER')
        )
    );

-- Fix audit log policies
CREATE POLICY "Admins can view audit logs" ON "AuditLog"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "User" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'ADMIN'
        )
    );

-- Fix classification config policies
CREATE POLICY "Admins can manage classifications" ON "ClassificationConfig"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User" u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'ADMIN'
        )
    );

-- Alternative: Temporarily disable RLS for User table to allow authentication
-- Uncomment the line below if the above policies still cause issues
-- ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- Create a function to handle user creation during signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "User" (
        id,
        email,
        first_name,
        last_name,
        role,
        password_hash,
        is_active
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
        'VIEWER', -- Default role
        '', -- Password hash handled by Supabase
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Instructions:
-- 1. Execute this script in Supabase SQL Editor
-- 2. This should fix the authentication issues
-- 3. If problems persist, uncomment the line that disables RLS for User table
-- 4. Test login with admin credentials: admin@efund.gov.ph / admin123456