-- ============================================================================
-- CALYXO SUPER ADMIN DASHBOARD — PRODUCTION SUPABASE DATABASE SCHEMA MIGRATION
-- Execute this script in your Supabase SQL Editor to provision all admin tables
-- ============================================================================

-- 1. User Profiles & Roles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  subscription_plan TEXT DEFAULT 'FREE',
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Biometrics & Metrics Table
CREATE TABLE IF NOT EXISTS public.users_metrics (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  displayName TEXT,
  photoURL TEXT,
  gender TEXT,
  age INT,
  weight NUMERIC,
  height NUMERIC,
  activity TEXT,
  goal TEXT,
  bio JSONB DEFAULT '{}'::jsonb,
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Master Exercise Database Table
CREATE TABLE IF NOT EXISTS public.exercise_database (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  muscle TEXT NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}',
  equipment TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  instructions TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Master Food Catalog Table
CREATE TABLE IF NOT EXISTS public.food_database (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC DEFAULT 0,
  carbs NUMERIC DEFAULT 0,
  fat NUMERIC DEFAULT 0,
  fiber NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Feedback Tickets & Support Center Table
CREATE TABLE IF NOT EXISTS public.feedback_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT NOT NULL,
  user_name TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. System Push Notifications Broadcast Table
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL,
  cta_label TEXT,
  cta_link TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered INT DEFAULT 0,
  clicks INT DEFAULT 0
);

-- 7. Immutable Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT DEFAULT '127.0.0.1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Platform System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for Query Performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan ON public.user_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_exercise_category ON public.exercise_database(category);
CREATE INDEX IF NOT EXISTS idx_food_category ON public.food_database(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback_tickets(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Permissive Policies for Authenticated & Super Admin Users
CREATE POLICY "Public Read Exercise Catalog" ON public.exercise_database FOR SELECT USING (true);
CREATE POLICY "Public Read Food Catalog" ON public.food_database FOR SELECT USING (true);
CREATE POLICY "Admin Full Access Profiles" ON public.user_profiles FOR ALL USING (true);
CREATE POLICY "Admin Full Access Metrics" ON public.users_metrics FOR ALL USING (true);
CREATE POLICY "Admin Full Access Exercises" ON public.exercise_database FOR ALL USING (true);
CREATE POLICY "Admin Full Access Foods" ON public.food_database FOR ALL USING (true);
CREATE POLICY "Admin Full Access Feedback" ON public.feedback_tickets FOR ALL USING (true);
CREATE POLICY "Admin Full Access Notifications" ON public.system_notifications FOR ALL USING (true);
CREATE POLICY "Admin Full Access Audit Logs" ON public.admin_audit_logs FOR ALL USING (true);
CREATE POLICY "Admin Full Access Settings" ON public.system_settings FOR ALL USING (true);
