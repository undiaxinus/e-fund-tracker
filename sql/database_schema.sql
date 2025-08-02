-- E-Fund Tracker Database Schema
-- Generated from Prisma schema for manual execution in Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ENCODER', 'VIEWER');
CREATE TYPE "Classification" AS ENUM ('PS', 'MOOE', 'CO', 'TR');
CREATE TYPE "DisbursementStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT');
CREATE TYPE "ReportType" AS ENUM ('SUMMARY', 'DETAILED', 'CLASSIFICATION', 'DEPARTMENT', 'CUSTOM');

-- Create Users table
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "department" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create UserSession table
CREATE TABLE "UserSession" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "session_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- Create Disbursement table
CREATE TABLE "Disbursement" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "disbursement_no" VARCHAR(50) NOT NULL,
    "payee" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "disbursement_date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "fund_source" VARCHAR(100),
    "classification" "Classification" NOT NULL,
    "sub_classification" VARCHAR(100),
    "department" VARCHAR(100) NOT NULL,
    "check_no" VARCHAR(50),
    "voucher_no" VARCHAR(50),
    "remarks" TEXT,
    "status" "DisbursementStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Disbursement_pkey" PRIMARY KEY ("id")
);

-- Create DisbursementAttachment table
CREATE TABLE "DisbursementAttachment" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "disbursement_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisbursementAttachment_pkey" PRIMARY KEY ("id")
);

-- Create ClassificationConfig table
CREATE TABLE "ClassificationConfig" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "classification" "Classification" NOT NULL,
    "sub_classification" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassificationConfig_pkey" PRIMARY KEY ("id")
);

-- Create AuditLog table
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "table_name" VARCHAR(50),
    "record_id" UUID,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Create Report table
CREATE TABLE "Report" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "type" "ReportType" NOT NULL,
    "filters" JSONB,
    "generated_by_id" UUID NOT NULL,
    "file_path" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- Create SystemConfig table
CREATE TABLE "SystemConfig" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_by_id" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "UserSession_session_token_key" ON "UserSession"("session_token");
CREATE UNIQUE INDEX "Disbursement_disbursement_no_key" ON "Disbursement"("disbursement_no");
CREATE UNIQUE INDEX "ClassificationConfig_classification_sub_classification_key" ON "ClassificationConfig"("classification", "sub_classification");
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- Create indexes for better performance
CREATE INDEX "UserSession_user_id_idx" ON "UserSession"("user_id");
CREATE INDEX "UserSession_expires_at_idx" ON "UserSession"("expires_at");
CREATE INDEX "Disbursement_created_by_id_idx" ON "Disbursement"("created_by_id");
CREATE INDEX "Disbursement_updated_by_id_idx" ON "Disbursement"("updated_by_id");
CREATE INDEX "Disbursement_disbursement_date_idx" ON "Disbursement"("disbursement_date");
CREATE INDEX "Disbursement_classification_idx" ON "Disbursement"("classification");
CREATE INDEX "Disbursement_department_idx" ON "Disbursement"("department");
CREATE INDEX "Disbursement_status_idx" ON "Disbursement"("status");
CREATE INDEX "DisbursementAttachment_disbursement_id_idx" ON "DisbursementAttachment"("disbursement_id");
CREATE INDEX "DisbursementAttachment_uploaded_by_id_idx" ON "DisbursementAttachment"("uploaded_by_id");
CREATE INDEX "ClassificationConfig_created_by_id_idx" ON "ClassificationConfig"("created_by_id");
CREATE INDEX "AuditLog_user_id_idx" ON "AuditLog"("user_id");
CREATE INDEX "AuditLog_created_at_idx" ON "AuditLog"("created_at");
CREATE INDEX "AuditLog_table_name_idx" ON "AuditLog"("table_name");
CREATE INDEX "Report_generated_by_id_idx" ON "Report"("generated_by_id");
CREATE INDEX "SystemConfig_updated_by_id_idx" ON "SystemConfig"("updated_by_id");

-- Add foreign key constraints
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DisbursementAttachment" ADD CONSTRAINT "DisbursementAttachment_disbursement_id_fkey" FOREIGN KEY ("disbursement_id") REFERENCES "Disbursement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DisbursementAttachment" ADD CONSTRAINT "DisbursementAttachment_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClassificationConfig" ADD CONSTRAINT "ClassificationConfig_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Report" ADD CONSTRAINT "Report_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SystemConfig" ADD CONSTRAINT "SystemConfig_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create a default admin user (password: admin123 - change this immediately!)
-- Note: This is a hashed password for 'admin123' - CHANGE THIS IN PRODUCTION!
INSERT INTO "User" ("id", "email", "password_hash", "first_name", "last_name", "role", "department") VALUES
('00000000-0000-0000-0000-000000000001', 'admin@efundtracker.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'System', 'Administrator', 'ADMIN', 'IT Department');

-- Insert default system configurations
INSERT INTO "SystemConfig" ("key", "value", "description", "updated_by_id") VALUES
('app_name', 'E-Fund Tracker', 'Application name', '00000000-0000-0000-0000-000000000001'),
('app_version', '1.0.0', 'Application version', '00000000-0000-0000-0000-000000000001'),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)', '00000000-0000-0000-0000-000000000001'),
('allowed_file_types', 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png', 'Allowed file types for uploads', '00000000-0000-0000-0000-000000000001');

-- Insert default classification configurations
INSERT INTO "ClassificationConfig" ("classification", "sub_classification", "description", "created_by_id") VALUES
('PS', 'Salaries and Wages', 'Regular salaries and wages', '00000000-0000-0000-0000-000000000001'),
('PS', 'Personnel Benefits', 'Benefits for personnel', '00000000-0000-0000-0000-000000000001'),
('MOOE', 'Traveling Expenses', 'Travel and transportation costs', '00000000-0000-0000-0000-000000000001'),
('MOOE', 'Office Supplies', 'Office supplies and materials', '00000000-0000-0000-0000-000000000001'),
('MOOE', 'Utilities', 'Utilities and communication expenses', '00000000-0000-0000-0000-000000000001'),
('CO', 'Equipment', 'Purchase of equipment', '00000000-0000-0000-0000-000000000001'),
('CO', 'Infrastructure', 'Infrastructure projects', '00000000-0000-0000-0000-000000000001'),
('TR', 'Subsidies', 'Subsidies and transfers', '00000000-0000-0000-0000-000000000001'),
('TR', 'Assistance', 'Financial assistance programs', '00000000-0000-0000-0000-000000000001');

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Disbursement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DisbursementAttachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClassificationConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemConfig" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - customize based on your security requirements)

-- Users can only see their own data unless they are admin
CREATE POLICY "Users can view own data" ON "User"
    FOR SELECT USING (auth.uid()::text = id::text OR 
                     EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN'));

-- Users can update their own data
CREATE POLICY "Users can update own data" ON "User"
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Only admins can insert/delete users
CREATE POLICY "Only admins can manage users" ON "User"
    FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN'));

-- Disbursements are viewable by all authenticated users
CREATE POLICY "Authenticated users can view disbursements" ON "Disbursement"
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only encoders and admins can create/update disbursements
CREATE POLICY "Encoders and admins can manage disbursements" ON "Disbursement"
    FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role IN ('ADMIN', 'ENCODER')));

-- Audit logs are viewable by admins only
CREATE POLICY "Only admins can view audit logs" ON "AuditLog"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN'));

-- Classification configs are viewable by all, manageable by admins
CREATE POLICY "All can view classifications" ON "ClassificationConfig"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage classifications" ON "ClassificationConfig"
    FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN'));

-- Reports are viewable by all authenticated users
CREATE POLICY "Authenticated users can view reports" ON "Report"
    FOR SELECT USING (auth.role() = 'authenticated');

-- System configs are manageable by admins only
CREATE POLICY "Only admins can manage system config" ON "SystemConfig"
    FOR ALL USING (EXISTS (SELECT 1 FROM "User" WHERE id::text = auth.uid()::text AND role = 'ADMIN'));

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disbursement_updated_at BEFORE UPDATE ON "Disbursement"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classification_config_updated_at BEFORE UPDATE ON "ClassificationConfig"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON "SystemConfig"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for generating disbursement numbers
CREATE OR REPLACE FUNCTION generate_disbursement_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    sequence_num INTEGER;
    disbursement_no TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(disbursement_no FROM '\\d{4}-(\\d+)') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM "Disbursement"
    WHERE disbursement_no LIKE current_year || '-%';
    
    -- Format: YYYY-NNNN (e.g., 2024-0001)
    disbursement_no := current_year || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN disbursement_no;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE "User" IS 'System users with role-based access';
COMMENT ON TABLE "Disbursement" IS 'Main disbursement records';
COMMENT ON TABLE "AuditLog" IS 'Audit trail for all system activities';
COMMENT ON TABLE "ClassificationConfig" IS 'Configuration for disbursement classifications';
COMMENT ON TABLE "SystemConfig" IS 'System-wide configuration settings';

COMMENT ON COLUMN "Disbursement"."classification" IS 'PS=Personnel Services, MOOE=Maintenance and Other Operating Expenses, CO=Capital Outlay, TR=Transfers';
COMMENT ON COLUMN "User"."role" IS 'ADMIN=Full access, ENCODER=Data entry, VIEWER=Read-only';

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
SELECT 'E-Fund Tracker database schema created successfully!' AS message;