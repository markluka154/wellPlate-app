-- =====================================================
-- Fix User Visibility in Supabase Dashboard
-- =====================================================
-- This fixes the issue where users created through NextAuth
-- are not visible in Supabase dashboard due to RLS policies
-- =====================================================

-- The problem: The RLS policy on User table checks auth.uid()::text = id
-- But NextAuth creates users with random UUIDs that don't match auth.uid()
-- When viewing in Supabase dashboard with admin credentials, auth.uid() is NULL

-- Solution 1: Allow authenticated admins to view all users
-- This allows you to see all users when logged in as admin in Supabase dashboard

-- Drop the restrictive policy
DROP POLICY IF EXISTS "user_isolation" ON "User";

-- Create a new policy that allows authenticated admins to view all users
-- This works when you're logged into Supabase dashboard
CREATE POLICY "user_isolation" ON "User"
  FOR ALL 
  USING (
    -- Allow access to own record
    auth.uid()::text = id 
    OR
    -- Allow service role to see all records
    auth.role() = 'service_role'
    OR
    -- Allow postgres role (Supabase dashboard admin) to see all records
    auth.role() = 'postgres'
  );

-- Solution 2: Also ensure the Account and Session tables have proper policies
DROP POLICY IF EXISTS "account_isolation" ON "Account";
CREATE POLICY "account_isolation" ON "Account"
  FOR ALL 
  USING (
    auth.uid()::text = "userId"
    OR
    auth.role() = 'service_role'
    OR
    auth.role() = 'postgres'
  );

DROP POLICY IF EXISTS "session_isolation" ON "Session";
CREATE POLICY "session_isolation" ON "Session"
  FOR ALL 
  USING (
    auth.uid()::text = "userId"
    OR
    auth.role() = 'service_role'
    OR
    auth.role() = 'postgres'
  );

DROP POLICY IF EXISTS "subscription_isolation" ON "Subscription";
CREATE POLICY "subscription_isolation" ON "Subscription"
  FOR ALL 
  USING (
    auth.uid()::text = "userId"
    OR
    auth.role() = 'service_role'
    OR
    auth.role() = 'postgres'
  );

DROP POLICY IF EXISTS "mealpreference_isolation" ON "MealPreference";
CREATE POLICY "mealpreference_isolation" ON "MealPreference"
  FOR ALL 
  USING (
    auth.uid()::text = "userId"
    OR
    auth.role() = 'service_role'
    OR
    auth.role() = 'postgres'
  );

DROP POLICY IF EXISTS "mealplan_isolation" ON "MealPlan";
CREATE POLICY "mealplan_isolation" ON "MealPlan"
  FOR ALL 
  USING (
    auth.uid()::text = "userId"
    OR
    auth.role() = 'service_role'
    OR
    auth.role() = 'postgres'
  );

DROP POLICY IF EXISTS "document_isolation" ON "Document";
CREATE POLICY "document_isolation" ON "Document"
  FOR ALL 
  USING (
    auth.uid()::text = "userId"
    OR
    auth.role() = 'service_role'
    OR
    auth.role() = 'postgres'
  );

DROP POLICY IF EXISTS "feedback_isolation" ON "Feedback";
CREATE POLICY "feedback_isolation" ON "Feedback"
  FOR ALL 
  USING (
    auth.uid()::text = "userId"
    OR
    auth.role() = 'service_role'
    OR
    auth.role() = 'postgres'
  );

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this query to verify users are now visible
SELECT 
  id,
  email,
  name,
  "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 10;

-- =====================================================
-- SUCCESS
-- =====================================================
SELECT 'User visibility fixed successfully! 🎉' as status;

