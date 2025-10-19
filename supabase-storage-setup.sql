-- =====================================================
-- WellPlate Storage Bucket Setup Script
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- This sets up secure file storage for PDFs

-- =====================================================
-- STEP 1: Create Storage Buckets
-- =====================================================

-- Create bucket for meal plan PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meal-plan-pdfs',
  'meal-plan-pdfs',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for user avatars (if needed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  false, -- Private bucket
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 2: Create Storage Policies
-- =====================================================

-- Users can only upload their own PDFs
CREATE POLICY "Users can upload own PDFs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'meal-plan-pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can only view their own PDFs
CREATE POLICY "Users can view own PDFs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'meal-plan-pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can only update their own PDFs
CREATE POLICY "Users can update own PDFs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'meal-plan-pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can only delete their own PDFs
CREATE POLICY "Users can delete own PDFs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'meal-plan-pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Service role can access all files
CREATE POLICY "Service role can access all PDFs" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- STEP 3: Verify Storage Setup
-- =====================================================

-- Check that buckets are created
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('meal-plan-pdfs', 'user-avatars');

-- Check that storage policies are created
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'WellPlate Storage setup completed successfully! 📁' as status;
