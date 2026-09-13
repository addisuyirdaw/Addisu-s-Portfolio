-- ============================================================
-- MIGRATION: Storage Bucket + CMS Enhancements
-- Date: 2026-09-13
-- Author: Addisu Yirdaw Deresse
--
-- ROOT CAUSE FIX: The original init.sql did NOT create the
-- portfolio-media storage bucket. SupabaseMediaStorage.uploadFile()
-- was therefore failing with "Bucket not found" on every upload
-- in production, causing all uploaded files to disappear.
--
-- This migration is safe to run on an existing database:
--   - Uses ON CONFLICT DO NOTHING for bucket creation
--   - Uses ADD COLUMN IF NOT EXISTS for schema extensions
--   - Uses CREATE TABLE IF NOT EXISTS for new tables
--   - Uses DO $$ BEGIN ... IF NOT EXISTS for RLS policies
-- ============================================================

-- ==================== STORAGE BUCKET ====================
-- Creates the portfolio-media bucket used by SupabaseMediaStorage.
-- public = true means anyone can read/download files (needed for
-- certificate PDFs, project images etc to be visible to visitors).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  true,
  52428800, -- 50 MB per-file limit
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/svg+xml',
    'application/pdf',
    'video/mp4', 'video/webm',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ==================== STORAGE RLS POLICIES ====================
-- Public read: anyone can download files from the bucket
-- (required so cert PDFs / project screenshots are visible to site visitors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'Public portfolio-media read access'
  ) THEN
    CREATE POLICY "Public portfolio-media read access"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'portfolio-media');
  END IF;
END $$;

-- Authenticated admin can upload new files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'Admin portfolio-media upload'
  ) THEN
    CREATE POLICY "Admin portfolio-media upload"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- Authenticated admin can replace/update files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'Admin portfolio-media update'
  ) THEN
    CREATE POLICY "Admin portfolio-media update"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- Authenticated admin can delete files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname = 'Admin portfolio-media delete'
  ) THEN
    CREATE POLICY "Admin portfolio-media delete"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- ==================== ACHIEVEMENTS — SCHEMA EXTENSIONS ====================
-- Add two columns that were missing from the original schema.
-- Uses IF NOT EXISTS so this is idempotent.
ALTER TABLE achievements
  ADD COLUMN IF NOT EXISTS credential_id TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

-- ==================== MEDIA TABLE — RLS ====================
-- The init.sql created the media table but may not have added RLS policies.
-- These are idempotent (DO ... IF NOT EXISTS).
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Public media metadata readable'
  ) THEN
    CREATE POLICY "Public media metadata readable"
      ON media FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'media' AND policyname = 'Admins can manage media records'
  ) THEN
    CREATE POLICY "Admins can manage media records"
      ON media FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;
