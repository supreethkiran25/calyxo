-- =============================================================
-- Calyxo — Full Combined Database Schema
-- Merges: 01_init.sql + 02_assigned_plans.sql + 03_streak_freeze.sql
-- Run this in Supabase SQL editor to set up the entire schema.
-- =============================================================

-- Combined Database Schema and Initialization
-- Consolidated from migrations 01 to 12

-- 1. Create helper functions & triggers
CREATE OR REPLACE FUNCTION public.check_sensitive_fields()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan THEN
    -- Block authenticated and anon users explicitly. The service_role bypasses this naturally.
    IF auth.role() IN ('authenticated', 'anon') THEN
      RAISE EXCEPTION 'Not authorized to modify role or subscription_plan';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text not null,
  nickname text,
  full_name text,
  display_name text,
  username text,
  goal text,
  "photoURL" text,
  role text default 'USER' not null,
  subscription_plan text default 'FREE' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS check_sensitive_fields_trigger ON public.user_profiles;
CREATE TRIGGER check_sensitive_fields_trigger
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION check_sensitive_fields();

-- 3. Relationships
CREATE TABLE IF NOT EXISTS public.relationships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.user_profiles(id) on delete cascade not null,
  addressee_id uuid references public.user_profiles(id) on delete cascade not null,
  status text check (status in ('PENDING', 'ACCEPTED', 'BLOCKED')) default 'PENDING' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- 4. Trainer-Client CRM Tables
CREATE TABLE IF NOT EXISTS public.trainer_clients (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.user_profiles(id) on delete cascade not null,
  client_id uuid references public.user_profiles(id) on delete cascade not null,
  status text check (status in ('INVITED', 'ACTIVE', 'ARCHIVED')) default 'INVITED' not null,
  goal text,
  target_weight numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(trainer_id, client_id)
);

ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.trainer_notes (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.user_profiles(id) on delete cascade not null,
  client_id uuid references public.user_profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.trainer_notes ENABLE ROW LEVEL SECURITY;

-- 5. Workout and Meal Templates
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.user_profiles(id) on delete cascade not null,
  name text not null,
  description text,
  category text,
  difficulty text check (difficulty in ('Beginner', 'Intermediate', 'Advanced', 'Elite')),
  duration_minutes integer,
  exercises jsonb default '[]'::jsonb not null,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.meal_templates (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.user_profiles(id) on delete cascade not null,
  name text not null,
  calories integer not null,
  protein integer not null,
  carbs integer not null,
  fat integer not null,
  meals jsonb default '[]'::jsonb not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.meal_templates ENABLE ROW LEVEL SECURITY;

-- 6. Assigned Workouts and Meal Plans
CREATE TABLE IF NOT EXISTS public.assigned_workouts (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.user_profiles(id) on delete cascade not null,
  client_id uuid references public.user_profiles(id) on delete cascade not null,
  title text not null,
  workout_data jsonb not null,
  scheduled_date date not null,
  completed boolean default false,
  template_id uuid references public.workout_templates(id) on delete set null,
  status text check (status in ('PENDING', 'COMPLETED', 'SKIPPED')) default 'PENDING' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.assigned_workouts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.assigned_meal_plans (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.user_profiles(id) on delete cascade not null,
  client_id uuid references public.user_profiles(id) on delete cascade not null,
  title text not null,
  meal_data jsonb not null,
  scheduled_date date not null,
  completed boolean default false,
  template_id uuid references public.meal_templates(id) on delete set null,
  status text check (status in ('PENDING', 'LOGGED')) default 'PENDING' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.assigned_meal_plans ENABLE ROW LEVEL SECURITY;

-- 7. Trainer Permissions
CREATE TABLE IF NOT EXISTS public.trainer_permissions (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.user_profiles(id) on delete cascade not null,
  client_id uuid references public.user_profiles(id) on delete cascade not null,
  can_view_workouts boolean default true not null,
  can_view_nutrition boolean default true not null,
  can_view_water boolean default true not null,
  can_view_weight boolean default true not null,
  can_view_measurements boolean default true not null,
  can_view_progress_photos boolean default false not null,
  can_view_ai_reports boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(trainer_id, client_id)
);

ALTER TABLE public.trainer_permissions ENABLE ROW LEVEL SECURITY;

-- 8. Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.user_profiles(id) on delete cascade not null,
  client_id uuid references public.user_profiles(id) on delete cascade not null,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text check (status in ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED', 'SCHEDULED', 'NO_SHOW')) default 'PENDING' not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 9. Trainer Profiles and Invite Trigger
CREATE TABLE IF NOT EXISTS public.trainer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  bio TEXT,
  profile_photo_url TEXT,
  archetype TEXT CHECK (archetype IN ('drill_sergeant', 'mentor', 'biohacker', 'yogi', 'hybrid')),
  certifications TEXT[],
  specializations TEXT[],
  experience_years INT,
  training_style TEXT,
  availability JSONB,
  pricing_tier TEXT CHECK (pricing_tier IN ('basic', 'pro', 'elite')),
  is_online BOOLEAN DEFAULT true,
  invite_code TEXT UNIQUE,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS (SELECT 1 FROM public.trainer_profiles WHERE invite_code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      NEW.invite_code := new_code;
      EXIT;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_invite_code ON public.trainer_profiles;
CREATE TRIGGER trigger_generate_invite_code
BEFORE INSERT ON public.trainer_profiles
FOR EACH ROW
EXECUTE FUNCTION generate_invite_code();

ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;

-- 10. PT Connections
CREATE TABLE IF NOT EXISTS public.pt_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'ended')) DEFAULT 'pending',
  connection_method TEXT CHECK (connection_method IN ('request', 'browse', 'invite_code')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(user_id, trainer_id)
);

ALTER TABLE public.pt_connections ENABLE ROW LEVEL SECURITY;

-- 11. Trainer Assignments
CREATE TABLE IF NOT EXISTS public.trainer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('workout_plan', 'meal_plan', 'goal', 'note')),
  title TEXT,
  content JSONB,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_date DATE
);

ALTER TABLE public.trainer_assignments ENABLE ROW LEVEL SECURITY;

-- 12. Trainer Messages (Final Single-threaded Chat structure)
CREATE TABLE IF NOT EXISTS public.trainer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender TEXT CHECK (sender IN ('trainer', 'user')),
  message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

ALTER TABLE public.trainer_messages ENABLE ROW LEVEL SECURITY;

-- 13. User Metrics and Logs Tables
CREATE TABLE IF NOT EXISTS public.food_logs (
  id uuid default gen_random_uuid() primary key,
  "userId" uuid not null,
  name text not null,
  calories integer,
  protein numeric,
  carbs numeric,
  fat numeric,
  fiber numeric,
  sugar numeric,
  "portionWeight" numeric,
  timestamp bigint not null
);

ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.workout_logs (
  id uuid default gen_random_uuid() primary key,
  "userId" uuid not null,
  category text,
  title text,
  duration integer,
  calories integer,
  intensity text,
  notes text,
  exercises jsonb,
  timestamp bigint not null
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.weight_logs (
  id uuid default gen_random_uuid() primary key,
  "userId" uuid not null,
  weight numeric,
  unit text,
  date text,
  timestamp bigint not null
);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id text primary key,
  "userId" uuid not null,
  title text,
  type text,
  messages jsonb,
  "createdAt" bigint,
  "updatedAt" bigint
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.users_ecosystem (
  id uuid primary key,
  data jsonb,
  "aiCoachPlan" jsonb,
  "aiMetrics" jsonb,
  "hasCompletedOnboarding" boolean
);

ALTER TABLE public.users_ecosystem ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.users_metrics (
  id text primary key,
  "userId" uuid not null,
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
  "isVerified" boolean
);

ALTER TABLE public.users_metrics ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.meal_scans (
  id uuid default gen_random_uuid() primary key,
  "userId" uuid not null,
  name text,
  calories integer,
  timestamp bigint not null
);

ALTER TABLE public.meal_scans ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."TrainingLogs" (
  id uuid default gen_random_uuid() primary key,
  "userId" uuid not null,
  user_query text,
  bot_response text,
  rating integer,
  timestamp bigint not null
);

ALTER TABLE public."TrainingLogs" ENABLE ROW LEVEL SECURITY;

-- 14. Trainer Tasks (Merged fields from Migrations 08 and 12)
CREATE TABLE IF NOT EXISTS public.trainer_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('HABIT', 'HOMEWORK', 'READING', 'MEAL_PREP', 'RECOVERY', 'OTHER')) DEFAULT 'OTHER',
  priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'low', 'medium', 'high')) DEFAULT 'medium',
  deadline TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  is_completed BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done', 'archived')) DEFAULT 'todo',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trainer_tasks ENABLE ROW LEVEL SECURITY;

-- 15. Trainer Documents (Merged fields from Migrations 09 and 12)
CREATE TABLE IF NOT EXISTS public.trainer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  file_name TEXT,
  document_type TEXT CHECK (document_type IN ('MEDICAL', 'ASSESSMENT', 'CONTRACT', 'IMAGE', 'OTHER')) DEFAULT 'OTHER',
  category TEXT CHECK (category IN ('contract', 'assessment', 'plan', 'certificate', 'other')),
  file_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trainer_documents ENABLE ROW LEVEL SECURITY;


-- 16. Security Policies for All Tables

-- User Profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view accepted relationships" ON public.user_profiles;
CREATE POLICY "Users can view accepted relationships" 
ON public.user_profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.relationships
    WHERE status = 'ACCEPTED' 
    AND (
      (requester_id = auth.uid() AND addressee_id = public.user_profiles.id)
      OR 
      (addressee_id = auth.uid() AND requester_id = public.user_profiles.id)
    )
  )
);

DROP POLICY IF EXISTS "Users and trainers can view connected profiles" ON public.user_profiles;
CREATE POLICY "Users and trainers can view connected profiles" 
ON public.user_profiles FOR SELECT 
USING (
  id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.pt_connections
    WHERE (user_id = public.user_profiles.id AND trainer_id = auth.uid() AND status = 'accepted')
       OR (trainer_id = public.user_profiles.id AND user_id = auth.uid() AND status = 'accepted')
  )
);

DROP POLICY IF EXISTS "Users can update own profile non-sensitive fields" ON public.user_profiles;
CREATE POLICY "Users can update own profile non-sensitive fields" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Relationships
DROP POLICY IF EXISTS "Users can read own relationships" ON public.relationships;
CREATE POLICY "Users can read own relationships"
ON public.relationships FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

DROP POLICY IF EXISTS "Users can create relationship requests" ON public.relationships;
CREATE POLICY "Users can create relationship requests"
ON public.relationships FOR INSERT
WITH CHECK (
  auth.uid() = requester_id AND status = 'PENDING'
);

DROP POLICY IF EXISTS "Addressee can accept or block" ON public.relationships;
CREATE POLICY "Addressee can accept or block"
ON public.relationships FOR UPDATE
USING (auth.uid() = addressee_id)
WITH CHECK (
  auth.uid() = addressee_id AND status IN ('ACCEPTED', 'BLOCKED')
);

-- Trainer Clients
DROP POLICY IF EXISTS "Trainers can view and manage their clients" ON public.trainer_clients;
CREATE POLICY "Trainers can view and manage their clients" 
ON public.trainer_clients FOR ALL 
USING (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Clients can view their trainer mapping" ON public.trainer_clients;
CREATE POLICY "Clients can view their trainer mapping" 
ON public.trainer_clients FOR SELECT 
USING (auth.uid() = client_id);

-- Trainer Notes
DROP POLICY IF EXISTS "Trainers manage their private notes" ON public.trainer_notes;
CREATE POLICY "Trainers manage their private notes" 
ON public.trainer_notes FOR ALL 
USING (auth.uid() = trainer_id);

-- Workout Templates
DROP POLICY IF EXISTS "Trainers manage their own workout templates" ON public.workout_templates;
CREATE POLICY "Trainers manage their own workout templates" 
ON public.workout_templates FOR ALL 
USING (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Clients can view assigned workout templates" ON public.workout_templates;
CREATE POLICY "Clients can view assigned workout templates" 
ON public.workout_templates FOR SELECT 
USING (
  auth.uid() IN (
    SELECT client_id FROM public.assigned_workouts WHERE template_id = public.workout_templates.id
  )
);

-- Meal Templates
DROP POLICY IF EXISTS "Trainers manage their own meal templates" ON public.meal_templates;
CREATE POLICY "Trainers manage their own meal templates" 
ON public.meal_templates FOR ALL 
USING (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Clients can view assigned meal templates" ON public.meal_templates;
CREATE POLICY "Clients can view assigned meal templates" 
ON public.meal_templates FOR SELECT 
USING (
  auth.uid() IN (
    SELECT client_id FROM public.assigned_meal_plans WHERE template_id = public.meal_templates.id
  )
);

-- Assigned Workouts
DROP POLICY IF EXISTS "Trainers manage assigned workouts" ON public.assigned_workouts;
CREATE POLICY "Trainers manage assigned workouts" 
ON public.assigned_workouts FOR ALL 
USING (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Clients can view and update completion of assigned workouts" ON public.assigned_workouts;
CREATE POLICY "Clients can view and update completion of assigned workouts" 
ON public.assigned_workouts FOR SELECT 
USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Clients can complete assigned workouts" ON public.assigned_workouts;
CREATE POLICY "Clients can complete assigned workouts" 
ON public.assigned_workouts FOR UPDATE 
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Assigned Meal Plans
DROP POLICY IF EXISTS "Trainers manage assigned meals" ON public.assigned_meal_plans;
CREATE POLICY "Trainers manage assigned meals" 
ON public.assigned_meal_plans FOR ALL 
USING (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Clients can view assigned meals" ON public.assigned_meal_plans;
CREATE POLICY "Clients can view assigned meals" 
ON public.assigned_meal_plans FOR SELECT 
USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Clients can complete assigned meals" ON public.assigned_meal_plans;
CREATE POLICY "Clients can complete assigned meals" 
ON public.assigned_meal_plans FOR UPDATE 
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Trainer Permissions
DROP POLICY IF EXISTS "Trainers can view client permissions" ON public.trainer_permissions;
CREATE POLICY "Trainers can view client permissions" 
ON public.trainer_permissions FOR SELECT 
USING (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Clients can manage their own trainer permissions" ON public.trainer_permissions;
CREATE POLICY "Clients can manage their own trainer permissions" 
ON public.trainer_permissions FOR ALL 
USING (auth.uid() = client_id);

-- Appointments
DROP POLICY IF EXISTS "Trainers can manage appointments" ON public.appointments;
CREATE POLICY "Trainers can manage appointments" 
ON public.appointments FOR ALL 
USING (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Clients can view their appointments" ON public.appointments;
CREATE POLICY "Clients can view their appointments" 
ON public.appointments FOR SELECT 
USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Clients can respond to appointments" ON public.appointments;
CREATE POLICY "Clients can respond to appointments" 
ON public.appointments FOR UPDATE 
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Trainer Profiles
DROP POLICY IF EXISTS "Trainers can manage own profile" ON public.trainer_profiles;
CREATE POLICY "Trainers can manage own profile" ON public.trainer_profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read trainer profiles" ON public.trainer_profiles;
CREATE POLICY "Users can read trainer profiles" ON public.trainer_profiles FOR SELECT USING (true);

-- PT Connections
DROP POLICY IF EXISTS "Users and Trainers can manage connections" ON public.pt_connections;
CREATE POLICY "Users and Trainers can manage connections" ON public.pt_connections FOR ALL USING (auth.uid() = user_id OR auth.uid() = trainer_id);

-- Trainer Assignments
DROP POLICY IF EXISTS "Trainers can manage assignments" ON public.trainer_assignments;
CREATE POLICY "Trainers can manage assignments" ON public.trainer_assignments FOR ALL USING (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Users can read assignments" ON public.trainer_assignments;
CREATE POLICY "Users can read assignments" ON public.trainer_assignments FOR SELECT USING (auth.uid() = user_id);

-- Trainer Messages
DROP POLICY IF EXISTS "Users and Trainers can manage messages" ON public.trainer_messages;
CREATE POLICY "Users and Trainers can manage messages" ON public.trainer_messages FOR ALL USING (auth.uid() = user_id OR auth.uid() = trainer_id);

-- Food Logs
DROP POLICY IF EXISTS "Users can manage own food_logs" ON public.food_logs;
CREATE POLICY "Users can manage own food_logs" ON public.food_logs FOR ALL USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Trainers can read client food logs" ON public.food_logs;
CREATE POLICY "Trainers can read client food logs" ON public.food_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pt_connections WHERE pt_connections.user_id = food_logs."userId" AND pt_connections.trainer_id = auth.uid() AND pt_connections.status = 'accepted')
);

-- Workout Logs
DROP POLICY IF EXISTS "Users can manage own workout_logs" ON public.workout_logs;
CREATE POLICY "Users can manage own workout_logs" ON public.workout_logs FOR ALL USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Trainers can read client workout logs" ON public.workout_logs;
CREATE POLICY "Trainers can read client workout logs" ON public.workout_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pt_connections WHERE pt_connections.user_id = workout_logs."userId" AND pt_connections.trainer_id = auth.uid() AND pt_connections.status = 'accepted')
);

-- Weight Logs
DROP POLICY IF EXISTS "Users can manage own weight_logs" ON public.weight_logs;
CREATE POLICY "Users can manage own weight_logs" ON public.weight_logs FOR ALL USING (auth.uid() = "userId");

-- Chat Sessions
DROP POLICY IF EXISTS "Users can manage own chat_sessions" ON public.chat_sessions;
CREATE POLICY "Users can manage own chat_sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = "userId");

-- Users Ecosystem
DROP POLICY IF EXISTS "Users can manage own users_ecosystem" ON public.users_ecosystem;
CREATE POLICY "Users can manage own users_ecosystem" ON public.users_ecosystem FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Trainers can read client ecosystem" ON public.users_ecosystem;
CREATE POLICY "Trainers can read client ecosystem" ON public.users_ecosystem FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pt_connections WHERE pt_connections.user_id = users_ecosystem.id AND pt_connections.trainer_id = auth.uid() AND pt_connections.status = 'accepted')
);

-- Users Metrics
DROP POLICY IF EXISTS "Users can manage own users_metrics" ON public.users_metrics;
CREATE POLICY "Users can manage own users_metrics" ON public.users_metrics FOR ALL USING (auth.uid() = "userId");

-- Meal Scans
DROP POLICY IF EXISTS "Users can manage own meal_scans" ON public.meal_scans;
CREATE POLICY "Users can manage own meal_scans" ON public.meal_scans FOR ALL USING (auth.uid() = "userId");

-- Training Logs
DROP POLICY IF EXISTS "Users can manage own TrainingLogs" ON public."TrainingLogs";
CREATE POLICY "Users can manage own TrainingLogs" ON public."TrainingLogs" FOR ALL USING (auth.uid() = "userId");

-- Trainer Tasks
DROP POLICY IF EXISTS "Trainer manages own tasks" ON public.trainer_tasks;
CREATE POLICY "Trainer manages own tasks" ON public.trainer_tasks FOR ALL USING (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Clients can view their own tasks" ON public.trainer_tasks;
CREATE POLICY "Clients can view their own tasks" ON public.trainer_tasks FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Clients can update/complete their own tasks" ON public.trainer_tasks;
CREATE POLICY "Clients can update/complete their own tasks" ON public.trainer_tasks FOR UPDATE USING (auth.uid() = client_id);

-- Trainer Documents
DROP POLICY IF EXISTS "Trainer manages own documents" ON public.trainer_documents;
CREATE POLICY "Trainer manages own documents" ON public.trainer_documents FOR ALL USING (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Clients can view their documents" ON public.trainer_documents;
CREATE POLICY "Clients can view their documents" ON public.trainer_documents FOR SELECT USING (auth.uid() = client_id);

-- 17. Enable Realtime Publications
-- Add helper block to dynamically handle adding to publication to avoid errors if already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'trainer_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trainer_messages;
  END IF;
END;
$$;

-- 18. Sync Users Metrics Profiles to User Profiles Trigger
CREATE OR REPLACE FUNCTION public.sync_users_metrics_to_user_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id = NEW."userId" || '_profile' THEN
    INSERT INTO public.user_profiles (id, email, nickname, display_name, full_name, username, goal, "photoURL")
    VALUES (
      NEW."userId",
      COALESCE((SELECT email FROM auth.users WHERE id = NEW."userId"), ''),
      NEW."displayName",
      NEW."displayName",
      NEW."displayName",
      COALESCE(NEW.website, split_part(COALESCE((SELECT email FROM auth.users WHERE id = NEW."userId"), ''), '@', 1)),
      NEW.goal,
      NEW."photoURL"
    )
    ON CONFLICT (id) DO UPDATE SET
      nickname = EXCLUDED.nickname,
      display_name = EXCLUDED.display_name,
      full_name = EXCLUDED.full_name,
      goal = EXCLUDED.goal,
      "photoURL" = EXCLUDED."photoURL";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_users_metrics_to_user_profiles ON public.users_metrics;
CREATE TRIGGER trigger_sync_users_metrics_to_user_profiles
AFTER INSERT OR UPDATE ON public.users_metrics
FOR EACH ROW
EXECUTE FUNCTION public.sync_users_metrics_to_user_profiles();



-- -----------------------------------------------------------------
-- 02 — ASSIGNED PLANS TABLE
-- -----------------------------------------------------------------
-- Migration: Create assigned_plans table and enable RLS policies
CREATE TABLE IF NOT EXISTS public.assigned_plans (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.user_profiles(id) on delete cascade not null,
  client_id uuid references public.user_profiles(id) on delete cascade not null,
  plan_type text check (plan_type in ('workout', 'nutrition')) not null,
  plan_data jsonb default '{}'::jsonb not null,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('active', 'completed', 'dismissed')) default 'active' not null
);

ALTER TABLE public.assigned_plans ENABLE ROW LEVEL SECURITY;

-- Trainer Policies: INSERT, SELECT, UPDATE, DELETE own assignments
DROP POLICY IF EXISTS "Trainer can insert own assignments" ON public.assigned_plans;
CREATE POLICY "Trainer can insert own assignments" ON public.assigned_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = trainer_id 
    AND EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
        AND (lower(role) = 'trainer')
    )
  );

DROP POLICY IF EXISTS "Trainer can select own assignments" ON public.assigned_plans;
CREATE POLICY "Trainer can select own assignments" ON public.assigned_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Trainer can update own assignments" ON public.assigned_plans;
CREATE POLICY "Trainer can update own assignments" ON public.assigned_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = trainer_id)
  WITH CHECK (auth.uid() = trainer_id);

DROP POLICY IF EXISTS "Trainer can delete own assignments" ON public.assigned_plans;
CREATE POLICY "Trainer can delete own assignments" ON public.assigned_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = trainer_id);

-- Client Policies: SELECT own assignments only (read-only)
DROP POLICY IF EXISTS "Client can select own assignments" ON public.assigned_plans;
CREATE POLICY "Client can select own assignments" ON public.assigned_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);



-- -----------------------------------------------------------------
-- 03 — STREAK FREEZE COLUMNS
-- -----------------------------------------------------------------
-- Migration: Add streak freeze support columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS freeze_tokens integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_freeze_granted timestamp with time zone;

-- -----------------------------------------------------------------
-- 04 — PUSH SUBSCRIPTIONS TABLE & POLICIES (Web Push & PWA)
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  subscription jsonb not null,
  endpoint text not null unique,
  platform text default 'web',
  browser text default 'browser',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_used_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);



