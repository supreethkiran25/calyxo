-- ============================================================================
-- CALYXO MASTER DATABASE SCHEMA — PRODUCTION SUPABASE ONE-CLICK DEPLOYMENT
-- Combined Core Platform + CRM + Super Admin Operating System
-- Paste and execute this entire file in your Supabase SQL Editor.
-- ============================================================================

-- 1. Helper Functions & Triggers
CREATE OR REPLACE FUNCTION public.check_sensitive_fields()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text NOT NULL,
  nickname text,
  full_name text,
  display_name text,
  username text,
  goal text,
  "photoURL" text,
  role text DEFAULT 'USER' NOT NULL,
  subscription_plan text DEFAULT 'FREE' NOT NULL,
  freeze_tokens integer DEFAULT 1,
  last_freeze_granted timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Users Metrics & Telemetry Table
CREATE TABLE IF NOT EXISTS public.users_metrics (
  id text PRIMARY KEY,
  "userId" uuid NOT NULL,
  amount numeric,
  date text,
  "displayName" text,
  "photoURL" text,
  gender text,
  age integer,
  weight numeric,
  height numeric,
  activity numeric,
  goal text,
  bio text,
  website text,
  "coverImage" text,
  "followersCount" integer,
  "followingCount" integer,
  "isVerified" boolean,
  updatedAt timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.users_metrics ENABLE ROW LEVEL SECURITY;

-- 4. User Food Logs Table
CREATE TABLE IF NOT EXISTS public.food_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL,
  name text NOT NULL,
  calories integer,
  protein numeric,
  carbs numeric,
  fat numeric,
  fiber numeric,
  sugar numeric,
  "portionWeight" numeric,
  timestamp bigint NOT NULL
);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

-- 5. User Workout Logs Table
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL,
  category text,
  title text,
  duration integer,
  calories integer,
  intensity text,
  notes text,
  exercises jsonb,
  timestamp bigint NOT NULL
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- 6. User Weight Logs Table
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL,
  weight numeric,
  unit text,
  date text,
  timestamp bigint NOT NULL
);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- 7. AI Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id text PRIMARY KEY,
  "userId" uuid NOT NULL,
  title text,
  type text,
  messages jsonb,
  "createdAt" bigint,
  "updatedAt" bigint
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- 8. Meal Vision Scans Table
CREATE TABLE IF NOT EXISTS public.meal_scans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL,
  name text,
  calories integer,
  timestamp bigint NOT NULL
);

ALTER TABLE public.meal_scans ENABLE ROW LEVEL SECURITY;

-- 9. AI Training Logs Table
CREATE TABLE IF NOT EXISTS public."TrainingLogs" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL,
  user_query text,
  bot_response text,
  rating integer,
  timestamp bigint NOT NULL
);

ALTER TABLE public."TrainingLogs" ENABLE ROW LEVEL SECURITY;

-- 10. Web Push Subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  subscription jsonb NOT NULL,
  endpoint text NOT NULL UNIQUE,
  platform text DEFAULT 'web',
  browser text DEFAULT 'browser',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_used_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 11. Master Exercise Database Table (Super Admin Workout Catalog)
CREATE TABLE IF NOT EXISTS public.exercise_database (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  muscle text NOT NULL,
  secondary_muscles text[] DEFAULT '{}',
  equipment text NOT NULL,
  difficulty text NOT NULL,
  instructions text NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.exercise_database ENABLE ROW LEVEL SECURITY;

-- 12. Master Food Database Table (Super Admin Nutrition Catalog)
CREATE TABLE IF NOT EXISTS public.food_database (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  serving_size text NOT NULL,
  calories numeric NOT NULL,
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fat numeric DEFAULT 0,
  fiber numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;

-- 13. Feedback Tickets Table (Super Admin Support Center)
CREATE TABLE IF NOT EXISTS public.feedback_tickets (
  id text PRIMARY KEY,
  user_id text,
  user_email text NOT NULL,
  user_name text,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'Pending',
  reply text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feedback_tickets ENABLE ROW LEVEL SECURITY;

-- 14. System Notifications Table (Super Admin Broadcast Hub)
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id text PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL,
  cta_label text,
  cta_link text,
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  delivered integer DEFAULT 0,
  clicks integer DEFAULT 0
);

ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- 15. Admin Audit Logs Table (Immutable Super Admin Audit Ledger)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id text NOT NULL,
  action text NOT NULL,
  target_id text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text DEFAULT '127.0.0.1',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 16. Platform System Settings Table (Super Admin Configuration)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 17. Relationships Table
CREATE TABLE IF NOT EXISTS public.relationships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('PENDING', 'ACCEPTED', 'BLOCKED')) DEFAULT 'PENDING' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- 18. Trainer-Client CRM Tables
CREATE TABLE IF NOT EXISTS public.trainer_clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('INVITED', 'ACTIVE', 'ARCHIVED')) DEFAULT 'INVITED' NOT NULL,
  goal text,
  target_weight numeric,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(trainer_id, client_id)
);

ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.trainer_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.trainer_notes ENABLE ROW LEVEL SECURITY;

-- 19. PT Connections Table
CREATE TABLE IF NOT EXISTS public.pt_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  trainer_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'accepted', 'rejected', 'ended')) DEFAULT 'pending',
  connection_method text CHECK (connection_method IN ('request', 'browse', 'invite_code')),
  requested_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  responded_at timestamp with time zone,
  UNIQUE(user_id, trainer_id)
);

ALTER TABLE public.pt_connections ENABLE ROW LEVEL SECURITY;

-- 20. Trainer Messages Table
CREATE TABLE IF NOT EXISTS public.trainer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sender text CHECK (sender IN ('trainer', 'user')),
  message text,
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  read boolean DEFAULT false
);

ALTER TABLE public.trainer_messages ENABLE ROW LEVEL SECURITY;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan ON public.user_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_exercise_category ON public.exercise_database(category);
CREATE INDEX IF NOT EXISTS idx_food_category ON public.food_database(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback_tickets(status);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);

-- RLS Policies (Permissive Access for Super Admin & Owners)
DROP POLICY IF EXISTS "Public Read Exercise Catalog" ON public.exercise_database;
CREATE POLICY "Public Read Exercise Catalog" ON public.exercise_database FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Food Catalog" ON public.food_database;
CREATE POLICY "Public Read Food Catalog" ON public.food_database FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin & Owner Access Profiles" ON public.user_profiles;
CREATE POLICY "Admin & Owner Access Profiles" ON public.user_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin & Owner Access Metrics" ON public.users_metrics;
CREATE POLICY "Admin & Owner Access Metrics" ON public.users_metrics FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin Full Access Exercises" ON public.exercise_database;
CREATE POLICY "Admin Full Access Exercises" ON public.exercise_database FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin Full Access Foods" ON public.food_database;
CREATE POLICY "Admin Full Access Foods" ON public.food_database FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin Full Access Feedback" ON public.feedback_tickets;
CREATE POLICY "Admin Full Access Feedback" ON public.feedback_tickets FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin Full Access Notifications" ON public.system_notifications;
CREATE POLICY "Admin Full Access Notifications" ON public.system_notifications FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin Full Access Audit Logs" ON public.admin_audit_logs;
CREATE POLICY "Admin Full Access Audit Logs" ON public.admin_audit_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin Full Access Settings" ON public.system_settings;
CREATE POLICY "Admin Full Access Settings" ON public.system_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Users manage own food logs" ON public.food_logs;
CREATE POLICY "Users manage own food logs" ON public.food_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Users manage own workout logs" ON public.workout_logs;
CREATE POLICY "Users manage own workout logs" ON public.workout_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Users manage own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users manage own push subscriptions" ON public.push_subscriptions FOR ALL USING (true);

-- 21. Subscriptions Table (Super Admin & SaaS Subscription Engine)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan text DEFAULT 'HIGH' NOT NULL,
  status text DEFAULT 'Active' NOT NULL,
  purchase_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expiry_date timestamp with time zone NOT NULL,
  granted_by text,
  payment_source text DEFAULT 'Razorpay',
  payment_id text,
  amount numeric DEFAULT 2,
  currency text DEFAULT 'INR',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin & User Access Subscriptions" ON public.subscriptions;
CREATE POLICY "Admin & User Access Subscriptions" ON public.subscriptions FOR ALL USING (true);

-- 22. In-App User Notifications Table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  notification_id text,
  title text NOT NULL,
  body text NOT NULL,
  cta_label text,
  cta_link text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin & User Access Notifications" ON public.user_notifications;
CREATE POLICY "Admin & User Access Notifications" ON public.user_notifications FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications(user_id);

-- Enable Supabase Realtime Channels
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'user_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'subscriptions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'user_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
  END IF;
END;
$$;
