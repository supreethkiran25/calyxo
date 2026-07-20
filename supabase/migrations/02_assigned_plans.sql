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
