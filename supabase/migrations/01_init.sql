-- Create tables
CREATE TABLE public.user_profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  nickname text,
  role text default 'USER' not null,
  subscription_plan text default 'FREE' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE public.relationships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.user_profiles(id) not null,
  addressee_id uuid references public.user_profiles(id) not null,
  status text check (status in ('PENDING', 'ACCEPTED', 'BLOCKED')) default 'PENDING' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(requester_id, addressee_id)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Users can view profiles of accepted relationships
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

-- 3. Users can update their own profile, but NOT role or subscription_plan
CREATE POLICY "Users can update own profile non-sensitive fields" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  -- Cannot change role or subscription_plan directly through API
  -- Note: We rely on a database trigger or column-level privileges if we want strict enforcement,
  -- but Supabase RLS WITH CHECK doesn't prevent updating a column if the new value is the same.
  -- A better way is using a trigger, but we can enforce it here by requiring the new values to match the old ones:
  -- (Since in UPDATE policies we can't easily reference the OLD record in WITH CHECK without triggers, we will use a trigger instead).
);

-- Trigger to prevent role and subscription_plan changes
CREATE OR REPLACE FUNCTION check_sensitive_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan THEN
    -- Allow bypass if this is a service role (postgres user)
    IF current_user != 'postgres' THEN
      RAISE EXCEPTION 'Not authorized to modify role or subscription_plan';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_sensitive_fields_trigger
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION check_sensitive_fields();


-- Relationships Policies
-- 1. Users can read relationships they are part of
CREATE POLICY "Users can read own relationships"
ON public.relationships FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- 2. Requester can insert a new relationship (status defaults to PENDING)
CREATE POLICY "Users can create relationship requests"
ON public.relationships FOR INSERT
WITH CHECK (
  auth.uid() = requester_id AND status = 'PENDING'
);

-- 3. Addressee can update relationship to ACCEPTED or BLOCKED (two-sided enforcement)
CREATE POLICY "Addressee can accept or block"
ON public.relationships FOR UPDATE
USING (auth.uid() = addressee_id)
WITH CHECK (
  auth.uid() = addressee_id AND status IN ('ACCEPTED', 'BLOCKED')
);
