-- RLS Setup for AI Coach Tables
-- This script enables Row Level Security for the AI Coach feature tables

-- Enable RLS on all AI Coach tables
ALTER TABLE "SavedMeal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CoachMemory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProgressLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatSession" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SavedMeal Table Policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "savedmeal_users_select" ON "SavedMeal";
DROP POLICY IF EXISTS "savedmeal_users_insert" ON "SavedMeal";
DROP POLICY IF EXISTS "savedmeal_users_update" ON "SavedMeal";
DROP POLICY IF EXISTS "savedmeal_users_delete" ON "SavedMeal";
DROP POLICY IF EXISTS "savedmeal_service_role" ON "SavedMeal";

-- Users can only select their own saved meals
CREATE POLICY "savedmeal_users_select" ON "SavedMeal" FOR SELECT 
  USING (auth.uid()::text = "userId");

-- Users can only insert their own saved meals
CREATE POLICY "savedmeal_users_insert" ON "SavedMeal" FOR INSERT 
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only update their own saved meals
CREATE POLICY "savedmeal_users_update" ON "SavedMeal" FOR UPDATE 
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only delete their own saved meals
CREATE POLICY "savedmeal_users_delete" ON "SavedMeal" FOR DELETE 
  USING (auth.uid()::text = "userId");

-- Service role has full access
CREATE POLICY "savedmeal_service_role" ON "SavedMeal" FOR ALL 
  USING (auth.role() = 'service_role'::text);

-- ============================================
-- UserProfile Table Policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "userprofile_users_select" ON "UserProfile";
DROP POLICY IF EXISTS "userprofile_users_insert" ON "UserProfile";
DROP POLICY IF EXISTS "userprofile_users_update" ON "UserProfile";
DROP POLICY IF EXISTS "userprofile_users_delete" ON "UserProfile";
DROP POLICY IF EXISTS "userprofile_service_role" ON "UserProfile";

-- Users can only select their own profile
CREATE POLICY "userprofile_users_select" ON "UserProfile" FOR SELECT 
  USING (auth.uid()::text = "userId");

-- Users can only insert their own profile
CREATE POLICY "userprofile_users_insert" ON "UserProfile" FOR INSERT 
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only update their own profile
CREATE POLICY "userprofile_users_update" ON "UserProfile" FOR UPDATE 
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only delete their own profile
CREATE POLICY "userprofile_users_delete" ON "UserProfile" FOR DELETE 
  USING (auth.uid()::text = "userId");

-- Service role has full access
CREATE POLICY "userprofile_service_role" ON "UserProfile" FOR ALL 
  USING (auth.role() = 'service_role'::text);

-- ============================================
-- CoachMemory Table Policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "coachmemory_users_select" ON "CoachMemory";
DROP POLICY IF EXISTS "coachmemory_users_insert" ON "CoachMemory";
DROP POLICY IF EXISTS "coachmemory_users_update" ON "CoachMemory";
DROP POLICY IF EXISTS "coachmemory_users_delete" ON "CoachMemory";
DROP POLICY IF EXISTS "coachmemory_service_role" ON "CoachMemory";

-- Users can only select their own memories
CREATE POLICY "coachmemory_users_select" ON "CoachMemory" FOR SELECT 
  USING (auth.uid()::text = "userId");

-- Users can only insert their own memories
CREATE POLICY "coachmemory_users_insert" ON "CoachMemory" FOR INSERT 
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only update their own memories
CREATE POLICY "coachmemory_users_update" ON "CoachMemory" FOR UPDATE 
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only delete their own memories
CREATE POLICY "coachmemory_users_delete" ON "CoachMemory" FOR DELETE 
  USING (auth.uid()::text = "userId");

-- Service role has full access
CREATE POLICY "coachmemory_service_role" ON "CoachMemory" FOR ALL 
  USING (auth.role() = 'service_role'::text);

-- ============================================
-- ProgressLog Table Policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "progresslog_users_select" ON "ProgressLog";
DROP POLICY IF EXISTS "progresslog_users_insert" ON "ProgressLog";
DROP POLICY IF EXISTS "progresslog_users_update" ON "ProgressLog";
DROP POLICY IF EXISTS "progresslog_users_delete" ON "ProgressLog";
DROP POLICY IF EXISTS "progresslog_service_role" ON "ProgressLog";

-- Users can only select their own progress logs
CREATE POLICY "progresslog_users_select" ON "ProgressLog" FOR SELECT 
  USING (auth.uid()::text = "userId");

-- Users can only insert their own progress logs
CREATE POLICY "progresslog_users_insert" ON "ProgressLog" FOR INSERT 
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only update their own progress logs
CREATE POLICY "progresslog_users_update" ON "ProgressLog" FOR UPDATE 
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only delete their own progress logs
CREATE POLICY "progresslog_users_delete" ON "ProgressLog" FOR DELETE 
  USING (auth.uid()::text = "userId");

-- Service role has full access
CREATE POLICY "progresslog_service_role" ON "ProgressLog" FOR ALL 
  USING (auth.role() = 'service_role'::text);

-- ============================================
-- ChatSession Table Policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "chatsession_users_select" ON "ChatSession";
DROP POLICY IF EXISTS "chatsession_users_insert" ON "ChatSession";
DROP POLICY IF EXISTS "chatsession_users_update" ON "ChatSession";
DROP POLICY IF EXISTS "chatsession_users_delete" ON "ChatSession";
DROP POLICY IF EXISTS "chatsession_service_role" ON "ChatSession";

-- Users can only select their own chat sessions
CREATE POLICY "chatsession_users_select" ON "ChatSession" FOR SELECT 
  USING (auth.uid()::text = "userId");

-- Users can only insert their own chat sessions
CREATE POLICY "chatsession_users_insert" ON "ChatSession" FOR INSERT 
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only update their own chat sessions
CREATE POLICY "chatsession_users_update" ON "ChatSession" FOR UPDATE 
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Users can only delete their own chat sessions
CREATE POLICY "chatsession_users_delete" ON "ChatSession" FOR DELETE 
  USING (auth.uid()::text = "userId");

-- Service role has full access
CREATE POLICY "chatsession_service_role" ON "ChatSession" FOR ALL 
  USING (auth.role() = 'service_role'::text);

-- ============================================
-- Verify RLS is enabled
-- ============================================

SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled' 
        ELSE '❌ RLS Disabled' 
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('SavedMeal', 'UserProfile', 'CoachMemory', 'ProgressLog', 'ChatSession')
ORDER BY tablename;

-- ============================================
-- List all policies created
-- ============================================

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('SavedMeal', 'UserProfile', 'CoachMemory', 'ProgressLog', 'ChatSession')
ORDER BY tablename, policyname;

