-- Migration script to update User table structure
-- This script updates the existing database to support the new role and permission system
-- Run this script step by step in your SQL editor

-- STEP 1: Create the Permission enum
CREATE TYPE "Permission" AS ENUM ('ENCODER', 'VIEWER');

-- STEP 2: Add permission column to User table
ALTER TABLE "User" ADD COLUMN "permission" "Permission";

-- STEP 3: Update existing users to set their permissions based on current roles
UPDATE "User" 
SET "permission" = CASE 
    WHEN "role" = 'ENCODER' THEN 'ENCODER'::"Permission"
    WHEN "role" = 'VIEWER' THEN 'VIEWER'::"Permission"
    ELSE NULL
END;

-- STEP 4: Drop all existing RLS policies to avoid conflicts
-- User table policies
DROP POLICY IF EXISTS "Users can view own data" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";
DROP POLICY IF EXISTS "Only admins can manage users" ON "User";

-- Disbursement table policies
DROP POLICY IF EXISTS "Authenticated users can view disbursements" ON "Disbursement";
DROP POLICY IF EXISTS "Encoders and admins can manage disbursements" ON "Disbursement";

-- AuditLog table policies
DROP POLICY IF EXISTS "Only admins can view audit logs" ON "AuditLog";
DROP POLICY IF EXISTS "Admins can view audit logs" ON "AuditLog";

-- ClassificationConfig table policies
DROP POLICY IF EXISTS "All can view classifications" ON "ClassificationConfig";
DROP POLICY IF EXISTS "Only admins can manage classifications" ON "ClassificationConfig";
DROP POLICY IF EXISTS "Admins can manage classifications" ON "ClassificationConfig";

-- Report table policies
DROP POLICY IF EXISTS "Authenticated users can view reports" ON "Report";

-- SystemConfig table policies
DROP POLICY IF EXISTS "Only admins can manage system config" ON "SystemConfig";

-- STEP 5: Create new Role enum with only ADMIN and USER
CREATE TYPE "Role_New" AS ENUM ('ADMIN', 'USER');

-- STEP 6: Add temporary column with new role enum
ALTER TABLE "User" ADD COLUMN "role_temp" "Role_New";

-- STEP 7: Populate the temporary column
UPDATE "User" 
SET "role_temp" = CASE 
    WHEN "role" = 'ADMIN' THEN 'ADMIN'::"Role_New"
    WHEN "role" IN ('ENCODER', 'VIEWER') THEN 'USER'::"Role_New"
    ELSE 'USER'::"Role_New"
END;

-- STEP 8: Drop the old role column
ALTER TABLE "User" DROP COLUMN "role";

-- STEP 9: Rename the temporary column to role
ALTER TABLE "User" RENAME COLUMN "role_temp" TO "role";

-- STEP 10: Set constraints on the new role column
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

-- STEP 11: Drop the old Role enum
DROP TYPE "Role";

-- STEP 12: Rename the new enum to Role
ALTER TYPE "Role_New" RENAME TO "Role";

-- STEP 13: Add data integrity constraints
-- Users with USER role must have a permission
ALTER TABLE "User" ADD CONSTRAINT "user_permission_required" 
CHECK ("role" = 'ADMIN' OR ("role" = 'USER' AND "permission" IS NOT NULL));

-- Admin users should not have permission set
ALTER TABLE "User" ADD CONSTRAINT "admin_no_permission" 
CHECK ("role" = 'USER' OR ("role" = 'ADMIN' AND "permission" IS NULL));

-- STEP 14: Recreate RLS policies with new role structure

-- Users can only see their own data unless they are admin
CREATE POLICY "Users can view own data" ON "User"
    FOR SELECT USING (auth.uid()::text = id::text OR 
                     EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND "role" = 'ADMIN'));

-- Users can update their own data
CREATE POLICY "Users can update own data" ON "User"
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Only admins can insert/delete users
CREATE POLICY "Only admins can manage users" ON "User"
    FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND "role" = 'ADMIN'));

-- Disbursements are viewable by all authenticated users
CREATE POLICY "Authenticated users can view disbursements" ON "Disbursement"
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only users with encoder permission and admins can create/update disbursements
CREATE POLICY "Encoders and admins can manage disbursements" ON "Disbursement"
    FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND ("role" = 'ADMIN' OR ("role" = 'USER' AND "permission" = 'ENCODER'))));

-- Audit logs are viewable by admins only
CREATE POLICY "Only admins can view audit logs" ON "AuditLog"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND "role" = 'ADMIN'));

-- Classification configs are viewable by all, manageable by admins
CREATE POLICY "All can view classifications" ON "ClassificationConfig"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage classifications" ON "ClassificationConfig"
    FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND "role" = 'ADMIN'));

-- Reports are viewable by all authenticated users
CREATE POLICY "Authenticated users can view reports" ON "Report"
    FOR SELECT USING (auth.role() = 'authenticated');

-- System configs are manageable by admins only
CREATE POLICY "Only admins can manage system config" ON "SystemConfig"
    FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND "role" = 'ADMIN'));

-- STEP 15: Update column comments
COMMENT ON COLUMN "User"."role" IS 'ADMIN=Full access, USER=Limited access based on permission';
COMMENT ON COLUMN "User"."permission" IS 'ENCODER=Can create/edit entries, VIEWER=Read-only access (only for USER role)';

-- STEP 16: Verification - Check the updated structure
SELECT 
    'Migration completed successfully!' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN "role" = 'ADMIN' THEN 1 END) as admin_users,
    COUNT(CASE WHEN "role" = 'USER' AND "permission" = 'ENCODER' THEN 1 END) as encoder_users,
    COUNT(CASE WHEN "role" = 'USER' AND "permission" = 'VIEWER' THEN 1 END) as viewer_users
FROM "User";

-- View all users with their new structure
SELECT 
    "first_name",
    "last_name",
    "email",
    "role",
    "permission",
    "department",
    "is_active"
FROM "User"
ORDER BY "role", "permission";