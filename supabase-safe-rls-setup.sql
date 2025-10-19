-- Safe RLS Setup for WellPlate - Check table structure first
-- This script will enable RLS with basic policies that work regardless of column names

-- First, let's check what columns exist in these tables
-- Run this first to see the table structure:

SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('orgs', 'org_members', 'cases', 'assets', 'ai_jobs', 'reports', 'audit_logs', 'billing_usage', 'GenerationBonus')
ORDER BY table_name, ordinal_position;

-- Enable RLS on all additional tables
ALTER TABLE "orgs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "org_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "billing_usage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GenerationBonus" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "orgs_isolation" ON "orgs";
DROP POLICY IF EXISTS "org_members_isolation" ON "org_members";
DROP POLICY IF EXISTS "cases_isolation" ON "cases";
DROP POLICY IF EXISTS "assets_isolation" ON "assets";
DROP POLICY IF EXISTS "ai_jobs_isolation" ON "ai_jobs";
DROP POLICY IF EXISTS "reports_isolation" ON "reports";
DROP POLICY IF EXISTS "audit_logs_isolation" ON "audit_logs";
DROP POLICY IF EXISTS "billing_usage_isolation" ON "billing_usage";
DROP POLICY IF EXISTS "GenerationBonus_isolation" ON "GenerationBonus";

-- Drop service role policies
DROP POLICY IF EXISTS "orgs_service_role_access" ON "orgs";
DROP POLICY IF EXISTS "org_members_service_role_access" ON "org_members";
DROP POLICY IF EXISTS "cases_service_role_access" ON "cases";
DROP POLICY IF EXISTS "assets_service_role_access" ON "assets";
DROP POLICY IF EXISTS "ai_jobs_service_role_access" ON "ai_jobs";
DROP POLICY IF EXISTS "reports_service_role_access" ON "reports";
DROP POLICY IF EXISTS "audit_logs_service_role_access" ON "audit_logs";
DROP POLICY IF EXISTS "billing_usage_service_role_access" ON "billing_usage";
DROP POLICY IF EXISTS "GenerationBonus_service_role_access" ON "GenerationBonus";

-- Create basic policies that work with any table structure
-- These policies only allow service_role access (your app) and deny all other access
-- This is the safest approach until we know the exact table structure

-- Orgs table - deny all access except service role
CREATE POLICY "orgs_service_only" ON "orgs" FOR ALL USING (auth.role() = 'service_role'::text);

-- Org members table - deny all access except service role  
CREATE POLICY "org_members_service_only" ON "org_members" FOR ALL USING (auth.role() = 'service_role'::text);

-- Cases table - deny all access except service role
CREATE POLICY "cases_service_only" ON "cases" FOR ALL USING (auth.role() = 'service_role'::text);

-- Assets table - deny all access except service role
CREATE POLICY "assets_service_only" ON "assets" FOR ALL USING (auth.role() = 'service_role'::text);

-- AI Jobs table - deny all access except service role
CREATE POLICY "ai_jobs_service_only" ON "ai_jobs" FOR ALL USING (auth.role() = 'service_role'::text);

-- Reports table - deny all access except service role
CREATE POLICY "reports_service_only" ON "reports" FOR ALL USING (auth.role() = 'service_role'::text);

-- Audit logs table - deny all access except service role
CREATE POLICY "audit_logs_service_only" ON "audit_logs" FOR ALL USING (auth.role() = 'service_role'::text);

-- Billing usage table - deny all access except service role
CREATE POLICY "billing_usage_service_only" ON "billing_usage" FOR ALL USING (auth.role() = 'service_role'::text);

-- Generation bonus table - deny all access except service role
CREATE POLICY "GenerationBonus_service_only" ON "GenerationBonus" FOR ALL USING (auth.role() = 'service_role'::text);

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('orgs', 'org_members', 'cases', 'assets', 'ai_jobs', 'reports', 'audit_logs', 'billing_usage', 'GenerationBonus')
ORDER BY tablename;
