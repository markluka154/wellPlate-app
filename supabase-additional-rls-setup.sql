-- Additional RLS Setup for WellPlate
-- Enable RLS on additional tables that were missed

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

-- Policies for user isolation (users can only see/manage their own data)
-- Note: These policies assume userId field exists. Adjust field names as needed.

-- Orgs table policies
CREATE POLICY "orgs_isolation" ON "orgs" FOR ALL USING (
  auth.uid()::text = "ownerId" OR 
  EXISTS (
    SELECT 1 FROM "org_members" 
    WHERE "org_members"."orgId" = "orgs"."id" 
    AND "org_members"."userId" = auth.uid()::text
  )
);

-- Org members table policies
CREATE POLICY "org_members_isolation" ON "org_members" FOR ALL USING (
  auth.uid()::text = "userId" OR
  EXISTS (
    SELECT 1 FROM "orgs" 
    WHERE "orgs"."id" = "org_members"."orgId" 
    AND "orgs"."ownerId" = auth.uid()::text
  )
);

-- Cases table policies
CREATE POLICY "cases_isolation" ON "cases" FOR ALL USING (
  auth.uid()::text = "userId" OR
  EXISTS (
    SELECT 1 FROM "org_members" 
    WHERE "org_members"."orgId" = "cases"."orgId" 
    AND "org_members"."userId" = auth.uid()::text
  )
);

-- Assets table policies
CREATE POLICY "assets_isolation" ON "assets" FOR ALL USING (
  auth.uid()::text = "userId" OR
  EXISTS (
    SELECT 1 FROM "org_members" 
    WHERE "org_members"."orgId" = "assets"."orgId" 
    AND "org_members"."userId" = auth.uid()::text
  )
);

-- AI Jobs table policies
CREATE POLICY "ai_jobs_isolation" ON "ai_jobs" FOR ALL USING (
  auth.uid()::text = "userId" OR
  EXISTS (
    SELECT 1 FROM "org_members" 
    WHERE "org_members"."orgId" = "ai_jobs"."orgId" 
    AND "org_members"."userId" = auth.uid()::text
  )
);

-- Reports table policies
CREATE POLICY "reports_isolation" ON "reports" FOR ALL USING (
  auth.uid()::text = "userId" OR
  EXISTS (
    SELECT 1 FROM "org_members" 
    WHERE "org_members"."orgId" = "reports"."orgId" 
    AND "org_members"."userId" = auth.uid()::text
  )
);

-- Audit logs table policies (read-only for users)
CREATE POLICY "audit_logs_isolation" ON "audit_logs" FOR SELECT USING (
  auth.uid()::text = "userId" OR
  EXISTS (
    SELECT 1 FROM "org_members" 
    WHERE "org_members"."orgId" = "audit_logs"."orgId" 
    AND "org_members"."userId" = auth.uid()::text
  )
);

-- Billing usage table policies
CREATE POLICY "billing_usage_isolation" ON "billing_usage" FOR ALL USING (
  auth.uid()::text = "userId" OR
  EXISTS (
    SELECT 1 FROM "org_members" 
    WHERE "org_members"."orgId" = "billing_usage"."orgId" 
    AND "org_members"."userId" = auth.uid()::text
  )
);

-- Generation bonus table policies
CREATE POLICY "GenerationBonus_isolation" ON "GenerationBonus" FOR ALL USING (
  auth.uid()::text = "userId"
);

-- Policies for service role access (allows your application to bypass RLS for specific operations)
CREATE POLICY "orgs_service_role_access" ON "orgs" FOR ALL USING (auth.role() = 'service_role'::text);
CREATE POLICY "org_members_service_role_access" ON "org_members" FOR ALL USING (auth.role() = 'service_role'::text);
CREATE POLICY "cases_service_role_access" ON "cases" FOR ALL USING (auth.role() = 'service_role'::text);
CREATE POLICY "assets_service_role_access" ON "assets" FOR ALL USING (auth.role() = 'service_role'::text);
CREATE POLICY "ai_jobs_service_role_access" ON "ai_jobs" FOR ALL USING (auth.role() = 'service_role'::text);
CREATE POLICY "reports_service_role_access" ON "reports" FOR ALL USING (auth.role() = 'service_role'::text);
CREATE POLICY "audit_logs_service_role_access" ON "audit_logs" FOR ALL USING (auth.role() = 'service_role'::text);
CREATE POLICY "billing_usage_service_role_access" ON "billing_usage" FOR ALL USING (auth.role() = 'service_role'::text);
CREATE POLICY "GenerationBonus_service_role_access" ON "GenerationBonus" FOR ALL USING (auth.role() = 'service_role'::text);

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('orgs', 'org_members', 'cases', 'assets', 'ai_jobs', 'reports', 'audit_logs', 'billing_usage', 'GenerationBonus')
ORDER BY tablename;
