-- =====================================================
-- WellPlate Database Security Test Script
-- =====================================================
-- Run this script AFTER setting up RLS to verify security
-- WARNING: Only run in a test environment with test data!

-- =====================================================
-- STEP 1: Check RLS Status
-- =====================================================

-- Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('User', 'Account', 'Session', 'Subscription', 'MealPreference', 'MealPlan', 'Document', 'Feedback')
ORDER BY tablename;

-- =====================================================
-- STEP 2: Check Policy Count
-- =====================================================

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ Policies Created'
    ELSE '❌ Missing Policies'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- STEP 3: Test Data Isolation (SAFE TESTS)
-- =====================================================

-- Test 1: Count total records (should work)
SELECT 'Total Users' as test, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Total Meal Plans', COUNT(*) FROM "MealPlan"
UNION ALL
SELECT 'Total Subscriptions', COUNT(*) FROM "Subscription";

-- Test 2: Check if you can see your own data
-- This should return data for the current authenticated user
SELECT 
  'Current User Data' as test,
  id,
  email,
  "createdAt"
FROM "User" 
WHERE auth.uid()::text = id
LIMIT 1;

-- Test 3: Check meal plans for current user
SELECT 
  'Current User Meal Plans' as test,
  COUNT(*) as meal_plan_count
FROM "MealPlan" 
WHERE auth.uid()::text = "userId";

-- =====================================================
-- STEP 4: Security Verification
-- =====================================================

-- Check that policies are properly configured
SELECT 
  tablename,
  policyname,
  cmd as command,
  CASE 
    WHEN qual LIKE '%auth.uid()%' THEN '✅ User Isolation'
    WHEN qual LIKE '%service_role%' THEN '✅ Service Role Access'
    ELSE '⚠️ Check Policy'
  END as security_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- STEP 5: Storage Security Check
-- =====================================================

-- Check storage buckets
SELECT 
  id as bucket_id,
  name,
  public,
  CASE 
    WHEN public THEN '⚠️ Public Bucket'
    ELSE '✅ Private Bucket'
  END as security_status
FROM storage.buckets
WHERE id IN ('meal-plan-pdfs', 'user-avatars');

-- Check storage policies
SELECT 
  policyname,
  cmd as command,
  CASE 
    WHEN qual LIKE '%auth.uid()%' THEN '✅ User Isolation'
    WHEN qual LIKE '%service_role%' THEN '✅ Service Role Access'
    ELSE '⚠️ Check Policy'
  END as security_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- =====================================================
-- FINAL SECURITY REPORT
-- =====================================================

SELECT 
  '🔒 WellPlate Security Status' as report,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('User', 'Account', 'Session', 'Subscription', 'MealPreference', 'MealPlan', 'Document', 'Feedback')
        AND rowsecurity = true
    ) = 8 THEN '✅ All Tables Secured'
    ELSE '❌ Some Tables Not Secured'
  END as rls_status,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_policies 
      WHERE schemaname = 'public'
    ) >= 16 THEN '✅ Policies Created'
    ELSE '❌ Missing Policies'
  END as policy_status,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM storage.buckets 
      WHERE id IN ('meal-plan-pdfs', 'user-avatars')
    ) = 2 THEN '✅ Storage Configured'
    ELSE '❌ Storage Not Configured'
  END as storage_status;
