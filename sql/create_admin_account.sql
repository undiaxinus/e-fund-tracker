-- Create Admin Account SQL Script
-- E-Fund Tracker System
-- This script creates additional admin accounts for the system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to generate bcrypt hash (requires pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create additional admin accounts
-- Note: Replace email, username, and password with actual values

-- Admin Account 1
INSERT INTO "User" (
    id,
    email,
    first_name,
    last_name,
    role,
    password_hash,
    is_active,
    department,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'admin2@efund.gov.ph',  -- Change this email
    'Admin',                -- Change first name
    'User',                 -- Change last name
    'ADMIN',
    crypt('admin123456', gen_salt('bf', 10)),  -- Change password
    true,
    'IT Department',        -- Change department
    NOW(),
    NOW()
);

-- Admin Account 2
INSERT INTO "User" (
    id,
    email,
    first_name,
    last_name,
    role,
    password_hash,
    is_active,
    department,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'superadmin@efund.gov.ph',  -- Change this email
    'Super',                    -- Change first name
    'Administrator',            -- Change last name
    'ADMIN',
    crypt('superadmin123', gen_salt('bf', 10)),  -- Change password
    true,
    'Administration',           -- Change department
    NOW(),
    NOW()
);

-- Admin Account 3 (Template)
-- Uncomment and modify as needed
/*
INSERT INTO "User" (
    id,
    email,
    first_name,
    last_name,
    role,
    password_hash,
    is_active,
    department,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'your-email@efund.gov.ph',  -- Change this email
    'Your First Name',          -- Change first name
    'Your Last Name',           -- Change last name
    'ADMIN',
    crypt('your-password', gen_salt('bf', 10)),  -- Change password
    true,
    'Your Department',          -- Change department
    NOW(),
    NOW()
);
*/

-- Verify the created accounts
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    department,
    is_active,
    created_at
FROM "User" 
WHERE role = 'ADMIN'
ORDER BY created_at DESC;

-- Instructions:
-- 1. Modify the email, username, firstName, lastName, and password values above
-- 2. Execute this script in your Supabase SQL Editor
-- 3. The passwords will be automatically hashed using bcrypt
-- 4. All admin accounts will have full system access
-- 5. Make sure to change the default passwords after first login

-- Security Notes:
-- - Always use strong passwords
-- - Change default passwords immediately after account creation
-- - Use unique email addresses for each admin
-- - Consider enabling two-factor authentication if available