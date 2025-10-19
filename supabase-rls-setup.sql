-- =====================================================
-- WellPlate Row Level Security (RLS) Setup Script
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- This ensures users can only access their own data

-- =====================================================
-- STEP 1: Enable RLS on All Tables
-- =====================================================

-- Enable RLS on all user-related tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on all application tables
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on any additional tables
ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Drop Existing Policies (if any)
-- =====================================================

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "user_isolation" ON "User";
DROP POLICY IF EXISTS "account_isolation" ON "Account";
DROP POLICY IF EXISTS "session_isolation" ON "Session";
DROP POLICY IF EXISTS "subscription_isolation" ON "Subscription";
DROP POLICY IF EXISTS "mealpreference_isolation" ON "MealPreference";
DROP POLICY IF EXISTS "mealplan_isolation" ON "MealPlan";
DROP POLICY IF EXISTS "document_isolation" ON "Document";
DROP POLICY IF EXISTS "feedback_isolation" ON "Feedback";

-- Drop service role policies
DROP POLICY IF EXISTS "service_role_access" ON "User";
DROP POLICY IF EXISTS "service_role_access" ON "Account";
DROP POLICY IF EXISTS "service_role_access" ON "Session";
DROP POLICY IF EXISTS "service_role_access" ON "Subscription";
DROP POLICY IF EXISTS "service_role_access" ON "MealPreference";
DROP POLICY IF EXISTS "service_role_access" ON "MealPlan";
DROP POLICY IF EXISTS "service_role_access" ON "Document";
DROP POLICY IF EXISTS "service_role_access" ON "Feedback";

-- =====================================================
-- STEP 3: Create User Isolation Policies
-- =====================================================

-- Users can only access their own user record
CREATE POLICY "user_isolation" ON "User"
  FOR ALL USING (auth.uid()::text = id);

-- Users can only access their own accounts
CREATE POLICY "account_isolation" ON "Account"
  FOR ALL USING (auth.uid()::text = "userId");

-- Users can only access their own sessions
CREATE POLICY "session_isolation" ON "Session"
  FOR ALL USING (auth.uid()::text = "userId");

-- Users can only access their own subscriptions
CREATE POLICY "subscription_isolation" ON "Subscription"
  FOR ALL USING (auth.uid()::text = "userId");

-- Users can only access their own meal preferences
CREATE POLICY "mealpreference_isolation" ON "MealPreference"
  FOR ALL USING (auth.uid()::text = "userId");

-- Users can only access their own meal plans
CREATE POLICY "mealplan_isolation" ON "MealPlan"
  FOR ALL USING (auth.uid()::text = "userId");

-- Users can only access their own documents (PDFs)
CREATE POLICY "document_isolation" ON "Document"
  FOR ALL USING (auth.uid()::text = "userId");

-- Users can only access their own feedback
CREATE POLICY "feedback_isolation" ON "Feedback"
  FOR ALL USING (auth.uid()::text = "userId");

-- =====================================================
-- STEP 4: Create Service Role Policies
-- =====================================================
-- These allow your application (using service role) to bypass RLS
-- when needed for legitimate operations

-- Service role can access all user data
CREATE POLICY "service_role_access" ON "User"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_access" ON "Account"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_access" ON "Session"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_access" ON "Subscription"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_access" ON "MealPreference"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_access" ON "MealPlan"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_access" ON "Document"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_access" ON "Feedback"
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- STEP 5: Verification Queries
-- =====================================================
-- Run these to verify RLS is working correctly

-- Check that RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('User', 'Account', 'Session', 'Subscription', 'MealPreference', 'MealPlan', 'Document', 'Feedback')
ORDER BY tablename;

-- Check that policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- STEP 6: Test RLS (Optional - for verification)
-- =====================================================
-- Uncomment these lines to test RLS is working
-- WARNING: Only run these in a test environment!

/*
-- Test 1: Try to access data as authenticated user
-- This should only return the current user's data
SELECT id, email FROM "User" LIMIT 5;

-- Test 2: Try to access meal plans
-- This should only return the current user's meal plans
SELECT id, "userId", calories FROM "MealPlan" LIMIT 5;

-- Test 3: Verify you can't see other users' data
-- This should return empty results if RLS is working
SELECT COUNT(*) as total_users FROM "User";
*/

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If you see this message, RLS setup is complete!
SELECT 'WellPlate RLS setup completed successfully! 🎉' as status;
