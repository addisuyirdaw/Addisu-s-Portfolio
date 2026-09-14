-- ============================================================
-- ADDISU CAREER MANAGEMENT PLATFORM — COMPLETE SUPABASE SETUP
-- ============================================================
-- This script sets up the entire database and storage for production.
-- It is 100% IDEMPOTENT: safe to run on a brand new project OR an existing one.
--
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Go to "SQL Editor" -> "New Query"
-- 3. Copy and paste this ENTIRE file into the editor
-- 4. Click "Run" (or Ctrl + Enter)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (Settings & Personal Information)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY, -- Maps to auth.users.id
  full_name TEXT NOT NULL,
  headline TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  youtube_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  avatar_url TEXT,
  resume_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  email_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners can update their profile" ON profiles;
CREATE POLICY "Owners can update their profile" ON profiles FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Owners can insert their profile" ON profiles;
CREATE POLICY "Owners can insert their profile" ON profiles FOR INSERT WITH CHECK (true);

-- ============================================================
-- 2. PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  description_en TEXT NOT NULL,
  description_am TEXT,
  problem_en TEXT,
  solution_en TEXT,
  architecture_en TEXT,
  features JSONB DEFAULT '[]',
  challenges_en TEXT,
  lessons_en TEXT,
  roadmap JSONB DEFAULT '[]',
  technologies TEXT[] DEFAULT '{}',
  demo_url TEXT,
  github_url TEXT,
  docs_url TEXT,
  video_url TEXT,
  figma_url TEXT,
  download_url TEXT,
  timeline TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  team_members TEXT[] DEFAULT '{}',
  screenshots TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  priority_pin BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(archived);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority_pin DESC, sort_order ASC);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published projects are viewable by all" ON projects;
CREATE POLICY "Published projects are viewable by all" ON projects FOR SELECT USING (published = true AND archived = false);
DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;
CREATE POLICY "Admins can manage all projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Function to increment project views safely
CREATE OR REPLACE FUNCTION increment_project_views(project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE projects SET views_count = views_count + 1 WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. TIMELINE EVENTS (Experience, Education, Leadership, Hackathons)
-- ============================================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_am TEXT,
  organization_en TEXT NOT NULL,
  category TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description_en TEXT[] DEFAULT '{}',
  description_am TEXT[] DEFAULT '{}',
  badge_url TEXT,
  verification_url TEXT,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_category ON timeline_events(category);
CREATE INDEX IF NOT EXISTS idx_timeline_start_date ON timeline_events(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_sort_order ON timeline_events(sort_order ASC);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Timeline events are viewable by all" ON timeline_events;
CREATE POLICY "Timeline events are viewable by all" ON timeline_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage timeline" ON timeline_events;
CREATE POLICY "Admins can manage timeline" ON timeline_events FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 4. SKILLS
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INTEGER NOT NULL CHECK (proficiency >= 0 AND proficiency <= 100),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_skills_sort_order ON skills(sort_order ASC);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Skills are viewable by all" ON skills;
CREATE POLICY "Skills are viewable by all" ON skills FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage skills" ON skills;
CREATE POLICY "Admins can manage skills" ON skills FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 5. ACHIEVEMENTS (Certificates & Awards & Hackathons)
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  slug TEXT UNIQUE,
  issuer TEXT NOT NULL,
  date_earned DATE NOT NULL,
  credential_url TEXT,
  credential_id TEXT,
  description_en TEXT,
  file_url TEXT,
  badge_url TEXT,
  category TEXT NOT NULL,
  importance TEXT DEFAULT 'medium' CHECK (importance IN ('high', 'medium', 'low')),
  feature_homepage BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Ensure columns exist if table was created in an earlier migration
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS credential_id TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS description_en TEXT;

CREATE INDEX IF NOT EXISTS idx_achievements_importance ON achievements(importance);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_slug ON achievements(slug);
CREATE INDEX IF NOT EXISTS idx_achievements_sort_order ON achievements(sort_order ASC);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Achievements are viewable by all" ON achievements;
CREATE POLICY "Achievements are viewable by all" ON achievements FOR SELECT USING (archived = false);
DROP POLICY IF EXISTS "Admins can manage achievements" ON achievements;
CREATE POLICY "Admins can manage achievements" ON achievements FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 6. TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_title_en TEXT NOT NULL,
  author_company TEXT,
  avatar_url TEXT,
  content_en TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published testimonials are viewable" ON testimonials;
CREATE POLICY "Published testimonials are viewable" ON testimonials FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 7. BLOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_en TEXT NOT NULL,
  category TEXT NOT NULL,
  reading_time TEXT,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_archived ON blogs(archived);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published blogs are viewable" ON blogs;
CREATE POLICY "Published blogs are viewable" ON blogs FOR SELECT USING (published = true AND archived = false);
DROP POLICY IF EXISTS "Admins can manage blogs" ON blogs;
CREATE POLICY "Admins can manage blogs" ON blogs FOR ALL USING (auth.role() = 'authenticated');

-- Function to increment blog views safely
CREATE OR REPLACE FUNCTION increment_blog_views(blog_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blogs SET views_count = views_count + 1 WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. MEDIA (Media metadata tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  folder_name TEXT DEFAULT 'root',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder_name);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Media is viewable by all" ON media;
CREATE POLICY "Media is viewable by all" ON media FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage media" ON media;
CREATE POLICY "Admins can manage media" ON media FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 9. MESSAGES (Contact Form Submissions)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  message_text TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived', 'deleted')),
  country TEXT,
  device TEXT,
  replies JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit messages" ON messages;
CREATE POLICY "Anyone can submit messages" ON messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can read all messages" ON messages;
CREATE POLICY "Admins can read all messages" ON messages FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins can update message status" ON messages;
CREATE POLICY "Admins can update message status" ON messages FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admins can delete messages" ON messages;
CREATE POLICY "Admins can delete messages" ON messages FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 10. RESUME TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS resume_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE resume_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Templates are viewable by all" ON resume_templates;
CREATE POLICY "Templates are viewable by all" ON resume_templates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage templates" ON resume_templates;
CREATE POLICY "Admins can manage templates" ON resume_templates FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 11. ANALYTICS LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can record analytics" ON analytics_logs;
CREATE POLICY "Anyone can record analytics" ON analytics_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view analytics" ON analytics_logs;
CREATE POLICY "Admins can view analytics" ON analytics_logs FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 12. SUPABASE STORAGE BUCKET: portfolio-media
-- ============================================================
-- Creates the public storage bucket for photos, certificates, project images, etc.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  true,
  52428800, -- 50 MB per file
  ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/svg+xml',
    'application/pdf',
    'video/mp4', 'video/webm',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/svg+xml',
    'application/pdf',
    'video/mp4', 'video/webm',
    'application/octet-stream'
  ];

-- Storage Policies on storage.objects
DROP POLICY IF EXISTS "Public portfolio-media read access" ON storage.objects;
CREATE POLICY "Public portfolio-media read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Admin portfolio-media upload" ON storage.objects;
CREATE POLICY "Admin portfolio-media upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin portfolio-media update" ON storage.objects;
CREATE POLICY "Admin portfolio-media update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin portfolio-media delete" ON storage.objects;
CREATE POLICY "Admin portfolio-media delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');
